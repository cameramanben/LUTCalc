/* luttweaksbox.js
* Customisation of transfer curves and colour space (gamma and gamut) options UI object for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTTweaksBox(fieldset, inputs, gammas, gamuts, file) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.gammas = gammas;
	this.gamuts = gamuts;
	this.file = file;
	this.tweakCheck = document.createElement('input');
	this.inputs.addInput('tweaks',this.tweakCheck);
	this.highGamutBox = document.createElement('div');
	this.highGamutCheck = document.createElement('input');
	this.inputs.addInput('tweakHGCheck',this.highGamutCheck);
	this.highGamutLinOpt = this.createRadioElement('highGamutLinLog',true);
	this.highGamutLogOpt = this.createRadioElement('highGamutLinLog',false);
	this.inputs.addInput('tweakHGLinLog',[this.highGamutLinOpt,this.highGamutLogOpt]);
	this.highGamutSelect = document.createElement('select');
	this.inputs.addInput('tweakHGSelect',this.highGamutSelect);
	this.highGamutLinLow = document.createElement('input');
	this.inputs.addInput('tweakHGLinLow',this.highGamutLinLow);
	this.highGamutLogLow = document.createElement('input');
	this.inputs.addInput('tweakHGLow',this.highGamutLogLow);
	this.highGamutLinHigh = document.createElement('input');
	this.inputs.addInput('tweakHGLinHigh',this.highGamutLinHigh);
	this.highGamutLogHigh = document.createElement('input');
	this.inputs.addInput('tweakHGHigh',this.highGamutLogHigh);
	this.blackLevelBox = document.createElement('div');
	this.blackLevelCheck = document.createElement('input');
	this.inputs.addInput('tweakBlkCheck',this.blackLevelCheck);
	this.blackLevelInput = document.createElement('input');
	this.inputs.addInput('tweakBlk',this.blackLevelInput);
	this.highLevelBox = document.createElement('div');
	this.highLevelCheck = document.createElement('input');
	this.inputs.addInput('tweakHiCheck',this.highLevelCheck);
	this.highLevelRef = document.createElement('input');
	this.inputs.addInput('tweakHiRef',this.highLevelRef);
	this.highLevelMap = document.createElement('input');
	this.inputs.addInput('tweakHiMap',this.highLevelMap);
	this.lutAnalystBox = document.createElement('div');
	this.lutAnalystCheck = document.createElement('input');
	this.inputs.addInput('laCheck',this.lutAnalystCheck);
	this.lutAnalystInLUT = new LUTs();
	this.inputs.addInput('laInLUT',this.lutAnalystInLUT);
	this.lutAnalystGamma = new LUTs();
	this.inputs.addInput('laGamma',this.lutAnalystGamma);
	this.gammas.gammas[this.gammas.LA].setLUT(this.lutAnalystGamma);
	this.lutAnalystGamut = new LUTs();
	this.inputs.addInput('laGamut',this.lutAnalystGamut);
	this.gamuts.outGamuts[this.gamuts.LA].setLUT(this.lutAnalystGamut);
	this.inputs.addInput('laGammaLUT',{text:[]});
	this.inputs.addInput('laGamutLUT',{text:[]});
	this.lutAnalysed = document.createElement('input');
	this.inputs.addInput('laAnalysed',this.lutAnalysed);
	this.lutAnalystNewOpt = this.createRadioElement('lutAnalystNewOld',true);
	this.lutAnalystOldOpt = this.createRadioElement('lutAnalystNewOld',false);
	this.inputs.addInput('laNewOld',[this.lutAnalystNewOpt,this.lutAnalystOldOpt]);
	this.lutAnalystFileInput = document.createElement('input');
	this.inputs.addInput('laFileInput',this.lutAnalystFileInput);
	this.inputs.addInput('laFileData',{});
	this.lutAnalystTitle = document.createElement('input');
	this.inputs.addInput('laTitle',this.lutAnalystTitle);
	this.lutAnalystGammaSelect = document.createElement('select');
	this.inputs.addInput('laGammaSelect',this.lutAnalystGammaSelect);
	this.lutAnalystLinGammaSelect = document.createElement('select');
	this.inputs.addInput('laLinGammaSelect',this.lutAnalystLinGammaSelect);
	this.lutAnalystGamutSelect = document.createElement('select');
	this.inputs.addInput('laGamutSelect',this.lutAnalystLinGammaSelect);
	this.lutAnalystDLOpt = this.createRadioElement('lutAnalystRange',true);
	this.lutAnalystDDOpt = this.createRadioElement('lutAnalystRange',false);
	this.lutAnalystLLOpt = this.createRadioElement('lutAnalystRange',false);
	this.lutAnalystLDOpt = this.createRadioElement('lutAnalystRange',false);
	this.inputs.addInput('laRange',[this.lutAnalystDLOpt,this.lutAnalystDDOpt,this.lutAnalystLLOpt,this.lutAnalystLDOpt]);
	this.lutAnalystDoButton = document.createElement('input');
	this.inputs.addInput('laDoButton',this.lutAnalystDoButton);
	this.lutAnalystStoreButton = document.createElement('input');
	this.inputs.addInput('laStoreButton',this.lutAnalystStoreButton);
	this.lutAnalystBackButton = document.createElement('input');
	this.inputs.addInput('laBackButton',this.lutAnalystBackButton);
	this.lutAnalystInfo = document.createElement('div');
	this.lutAnalystProgress = document.createElement('progress');
	this.buildBox();
	fieldset.appendChild(this.box);
}
// Construct the UI Box
LUTTweaksBox.prototype.buildBox = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Customisation')));
	this.tweakCheck.setAttribute('type','checkbox');
	this.box.appendChild(this.tweakCheck);
	var tweakHolder = document.createElement('div');
	tweakHolder.id = 'tweakholder';
	tweakHolder.style.display = 'block';
	this.highGamut();
	tweakHolder.appendChild(this.highGamutBox);
	this.blackLevel();
	tweakHolder.appendChild(this.blackLevelBox);
	this.highlightLevel();
	tweakHolder.appendChild(this.highLevelBox);
	this.lutAnalyst();
	tweakHolder.appendChild(this.lutAnalystBox);
	this.box.appendChild(tweakHolder);
	this.tweakCheck.checked = true;
}
//
// *** Highlight Gamut Tweak ***
//		Build UI
LUTTweaksBox.prototype.highGamut = function() {
	this.highGamutBox.setAttribute('class','graybox');
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Highlight Gamut')));
	this.highGamutCheck.setAttribute('type','checkbox');
	this.highGamutBox.appendChild(this.highGamutCheck);
	this.highGamutBox.appendChild(document.createElement('br'));
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Gamut')));
	var max = this.gamuts.outList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gamuts.outList[i].idx;
		option.appendChild(document.createTextNode(this.gamuts.outList[i].name));
		this.highGamutSelect.appendChild(option);
	}
	this.highGamutBox.appendChild(this.highGamutSelect);
	this.highGamutBox.appendChild(document.createElement('br'));
	this.highGamutLinOpt.value = '0';
	this.highGamutBox.appendChild(this.highGamutLinOpt);
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Linear')));
	this.highGamutLogOpt.value = '1';
	this.highGamutBox.appendChild(this.highGamutLogOpt);
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Log')));
	this.highGamutLin = document.createElement('div');
	this.highGamutLin.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover Low % Reflected')));
	this.highGamutLin.appendChild(document.createElement('br'));
	this.highGamutLinLow.setAttribute('type','number');
	this.highGamutLinLow.setAttribute('class','ireinput');
	this.highGamutLinLow.value = '18';
	this.highGamutLin.appendChild(this.highGamutLinLow);
	this.highGamutLin.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.highGamutLin.appendChild(document.createElement('br'));
	this.highGamutLin.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover High % Reflected')));
	this.highGamutLin.appendChild(document.createElement('br'));
	this.highGamutLinHigh.setAttribute('type','number');
	this.highGamutLinHigh.setAttribute('class','ireinput');
	this.highGamutLinHigh.value = '90';
	this.highGamutLin.appendChild(this.highGamutLinHigh);
	this.highGamutBox.appendChild(this.highGamutLin);
	this.highGamutLin.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.highGamutLog = document.createElement('div');
	this.highGamutLog.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover Low Stops From 18% Grey')));
	this.highGamutLog.appendChild(document.createElement('br'));
	this.highGamutLogLow.setAttribute('type','text');
	this.highGamutLogLow.value = '0';
	this.highGamutLog.appendChild(this.highGamutLogLow);
	this.highGamutLog.appendChild(document.createElement('br'));
	this.highGamutLog.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover High Stops From 18% Grey')));
	this.highGamutLog.appendChild(document.createElement('br'));
	this.highGamutLogHigh.setAttribute('type','text');
	this.highGamutLogHigh.value = (Math.log(5)/Math.LN2).toFixed(4).toString();
	this.highGamutLog.appendChild(this.highGamutLogHigh);
	this.highGamutBox.appendChild(this.highGamutLog);
	this.toggleHighGamutLinLog();
	this.toggleHighGamutCheck();
}
//		Set Up Data
//		Event Responses
LUTTweaksBox.prototype.toggleHighGamutCheck = function() {
	if (this.highGamutCheck.checked) {
		this.highGamutSelect.disabled = false;
		this.highGamutLinOpt.disabled = false;
		this.highGamutLogOpt.disabled = false;
		this.toggleHighGamutLinLog();
	} else {
		this.highGamutSelect.disabled = true;
		this.highGamutLinOpt.disabled = true;
		this.highGamutLogOpt.disabled = true;
		this.highGamutLin.style.display = 'none';
		this.highGamutLog.style.display = 'none';
	}
}
LUTTweaksBox.prototype.toggleHighGamutLinLog = function() {
	if (this.highGamutLinOpt.checked) {
		this.highGamutLin.style.display = 'block';
		this.highGamutLog.style.display = 'none';
	} else {
		this.highGamutLin.style.display = 'none';
		this.highGamutLog.style.display = 'block';
	}
}
LUTTweaksBox.prototype.changeHighGamutLinLow = function() {
	if (/^([1-9]\d*)$/.test(this.highGamutLinLow.value)) {
		if (parseInt(this.highGamutLinLow.value) >= parseInt(this.highGamutLinHigh.value)) {
			this.highGamutLinLow.value = (parseInt(this.highGamutLinHigh.value) - 1).toString();
		}
		this.highGamutLogLow.value = (Math.log(parseFloat(this.highGamutLinLow.value)/18)/Math.LN2).toFixed(4).toString();
	} else {
		this.highGamutLinLow.value = '18';
		this.highGamutLogLow.value = '0';
		this.changeHighGamutLinLow();
	}
}
LUTTweaksBox.prototype.changeHighGamutLinHigh = function() {
	if (/^([1-9]\d*)$/.test(this.highGamutLinHigh.value)) {
		if (parseInt(this.highGamutLinHigh.value) <= parseInt(this.highGamutLinLow.value)) {
			this.highGamutLinHigh.value = (parseInt(this.highGamutLinLow.value) + 1).toString();
		} else if (parseInt(this.highGamutLinHigh.value) < 2){
			this.highGamutLinHigh.value = '2';
		}
		this.highGamutLogHigh.value = (Math.log(parseFloat(this.highGamutLinHigh.value)/18)/Math.LN2).toFixed(4).toString();
	} else {
		this.highGamutLinHigh.value = '90';
		this.highGamutLogHigh.value = (Math.log(5)/Math.LN2).toFixed(4).toString();
		this.changeHighGamutLinHigh();
	}
}
LUTTweaksBox.prototype.changeHighGamutLogLow = function() {
	if (!isNaN(parseFloat(this.highGamutLogLow.value)) && isFinite(this.highGamutLogLow.value)) {
		if (parseFloat(this.highGamutLogLow.value) >= parseFloat(this.highGamutLogHigh.value)) {
			this.highGamutLogLow.value = (parseFloat(this.highGamutLogHigh.value) - 0.1).toFixed(4).toString();
		}
		this.highGamutLinLow.value = (Math.round(Math.pow(2,parseFloat(this.highGamutLogLow.value)*18))).toString();
	} else {
		this.highGamutLinLow.value = '18';
		this.highGamutLogLow.value = '0';
		this.changeHighGamutLogLow();
	}
}
LUTTweaksBox.prototype.changeHighGamutLogHigh = function() {
	if (!isNaN(parseFloat(this.highGamutLogHigh.value)) && isFinite(this.highGamutLogHigh.value)) {
		if (parseFloat(this.highGamutLogHigh.value) <= parseFloat(this.highGamutLogLow.value)) {
			this.highGamutLogHigh.value = (parseFloat(this.highGamutLogLow.value) + 0.1).toFixed(4).toString();
		}
		this.highGamutLinHigh.value = (Math.round(Math.pow(2,parseFloat(this.highGamutLogHigh.value)*18))).toString();
	} else {
		this.highGamutLinHigh.value = '90';
		this.highGamutLogHigh.value = (Math.log(5)/Math.LN2).toFixed(4).toString();
		this.changeHighGamutLogHigh();
	}
}
//
// *** Black Level Tweak ***
//		Build UI
LUTTweaksBox.prototype.blackLevel = function() {
	this.blackLevelBox.setAttribute('class','graybox');
	this.blackLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Black Level')));
	this.blackLevelCheck.setAttribute('type','checkbox');
	this.blackLevelBox.appendChild(this.blackLevelCheck);
	this.blackLevelBox.appendChild(document.createElement('br'));
	this.blackLevelInput.setAttribute('type','number');
	this.blackLevelInput.setAttribute('step','any');
	this.blackLevelInput.setAttribute('class','ireinput');
	this.blackLevelBox.appendChild(this.blackLevelInput);
	this.blackLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.blackLevelDefault();
	this.toggleBlackLevelCheck();
}
//		Set Up Data
LUTTweaksBox.prototype.blackLevelDefault = function() {
	this.blackLevelInput.value = this.gammas.baseIreOut(0).toFixed(2).toString();
}
//		Event Responses
LUTTweaksBox.prototype.toggleBlackLevelCheck = function() {
	if (this.blackLevelCheck.checked) {
		this.blackLevelInput.disabled = false;
	} else {
		this.blackLevelInput.disabled = true;
	}
	this.updateScaling();
}
LUTTweaksBox.prototype.changeBlackLevel = function() {
	if (!isNaN(parseFloat(this.blackLevelInput.value)) && isFinite(this.blackLevelInput.value) && (parseFloat(this.blackLevelInput.value)>-7.3)) {
	} else {
			this.blackLevelDefault();
	}
	this.updateScaling();
}
//
// *** Highlight Level Tweak ***
//		Build UI
LUTTweaksBox.prototype.highlightLevel = function() {
	this.highLevelBox.setAttribute('class','graybox');
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Highlight Level')));
	this.highLevelCheck.setAttribute('type','checkbox');
	this.highLevelBox.appendChild(this.highLevelCheck);
	this.highLevelBox.appendChild(document.createElement('br'));
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Reflected')));
	this.highLevelRef.setAttribute('type','number');
	this.highLevelRef.setAttribute('step','any');
	this.highLevelRef.setAttribute('class','ireinput');
	this.highLevelRef.value='90';
	this.highLevelBox.appendChild(this.highLevelRef);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.highLevelBox.appendChild(document.createElement('br'));
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Maps To')));
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('(')));
	this.highLevelRec = document.createElement('span');
	this.highLevelBox.appendChild(this.highLevelRec);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE In Rec709)')));
	this.highLevelBox.appendChild(document.createElement('br'));
	this.highLevelMap.setAttribute('type','number');
	this.highLevelMap.setAttribute('step','any');
	this.highLevelMap.setAttribute('class','ireinput');
	this.highLevelDefault();
	this.highLevelBox.appendChild(this.highLevelMap);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.toggleHighLevelCheck();
}
//		Set Up Data
LUTTweaksBox.prototype.highLevelDefault = function() {
	this.highLevelRec.innerHTML = this.gammas.rec709IreOut(parseFloat(this.highLevelRef.value)/90).toFixed(2).toString();
	this.highLevelMap.value = this.gammas.baseIreOut(parseFloat(this.highLevelRef.value)/90).toFixed(2).toString();
}
//		Event Responses
LUTTweaksBox.prototype.toggleHighLevelCheck = function() {
	if (this.highLevelCheck.checked) {
		this.highLevelRef.disabled = false;
		this.highLevelMap.disabled = false;
	} else {
		this.highLevelRef.disabled = true;
		this.highLevelMap.disabled = true;
	}
	this.updateScaling();
}
LUTTweaksBox.prototype.changeHighLevelRef = function() {
	if (!isNaN(parseFloat(this.highLevelRef.value)) && isFinite(this.highLevelRef.value) && (parseFloat(this.highLevelRef.value)>0)) {
	} else {
		this.highLevelRef.value = '90';
	}
	this.highLevelDefault();
	this.updateScaling();
}
LUTTweaksBox.prototype.changeHighLevelMap = function() {
	if (!isNaN(parseFloat(this.highLevelMap.value)) && isFinite(this.highLevelMap.value) && (parseFloat(this.highLevelMap.value)>-7.3)) {
	} else {
		this.highLevelDefault();
	}
	this.updateScaling();
}
//
// *** LUT Analyst ***
//		Build UI
LUTTweaksBox.prototype.lutAnalyst = function() {
	this.lutAnalystBox.setAttribute('class','graybox');
	this.lutAnalystBox.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Analyst')));
	this.lutAnalystCheck.setAttribute('type','checkbox');
	this.lutAnalystCheck.style.display = 'none';
	this.lutAnalystBox.appendChild(this.lutAnalystCheck);
	this.lutAnalysed.setAttribute('type','hidden');
	this.lutAnalysed.value = '0';
	this.lutAnalystBox.appendChild(this.lutAnalysed);
	this.lutAnalystBox.appendChild(document.createElement('br'));
	this.lutAnalystLoadBox = document.createElement('div');
	this.lutAnalystNewOpt.value = 0;
	this.lutAnalystLoadBox.appendChild(this.lutAnalystNewOpt);
	this.lutAnalystLoadBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Import New LUT')));
	this.lutAnalystOldOpt.value = 1;
	this.lutAnalystLoadBox.appendChild(this.lutAnalystOldOpt);
	this.lutAnalystLoadBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Load Existing Analysed LA LUT')));
	this.lutAnalystLoadBox.appendChild(document.createElement('br'));
	if (this.inputs.isApp) {
		this.lutAnalystFileInput.setAttribute('type','text');
	} else {
		this.lutAnalystFileInput.setAttribute('type','file');
	}
	this.lutAnalystLoadBox.appendChild(this.lutAnalystFileInput);
	this.lutAnalystBox.appendChild(this.lutAnalystLoadBox);
	this.lutAnalystAnalyseBox = document.createElement('div');
	this.lutAnalystTitle.setAttribute('type','text');
	this.lutAnalystTitle.setAttribute('size','32');
	this.lutAnalystTitle.value = '';
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Title')));
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystTitle);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('br'));
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Gamma')));
	var max = this.gammas.inList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gammas.inList[i].idx;
		option.appendChild(document.createTextNode(this.gammas.inList[i].name));
		this.lutAnalystGammaSelect.appendChild(option);
	}
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystGammaSelect);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('br'));
	this.lutAnalystLinGammaBox = document.createElement('div');
	this.lutAnalystLinGammaBox.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	var max = this.gammas.linList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gammas.linList[i].idx;
		option.appendChild(document.createTextNode(this.gammas.linList[i].name));
		this.lutAnalystLinGammaSelect.appendChild(option);
	}
	this.lutAnalystLinGammaBox.appendChild(this.lutAnalystLinGammaSelect);
	this.lutAnalystLinGammaBox.style.display = 'none';
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystLinGammaBox);
	this.lutAnalystGamutBox = document.createElement('div');
	this.lutAnalystGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Gamut')));
	var max = this.gamuts.inList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gamuts.inList[i].idx;
		option.appendChild(document.createTextNode(this.gamuts.inList[i].name));
		this.lutAnalystGamutSelect.appendChild(option);
	}
	this.lutAnalystGamutBox.appendChild(this.lutAnalystGamutSelect);
	this.lutAnalystGamutBox.appendChild(document.createElement('br'));
	this.lutAnalystGamutBox.style.display = 'none';
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystGamutBox);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Scaling  ')));
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystDLOpt);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('D→L')));
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystDDOpt);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('D→D')));
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystLLOpt);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('L→L')));
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystLDOpt);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('L→D')));
	this.lutAnalystAnalyseBox.style.display = 'none';
	this.lutAnalystBox.appendChild(this.lutAnalystAnalyseBox);
	this.lutAnalystDoButton.setAttribute('type','button');
	this.lutAnalystDoButton.setAttribute('class','buttons');
	this.lutAnalystDoButton.value = 'Analyse';
	this.lutAnalystDoButton.disabled = false;
	this.lutAnalystDoButton.style.display = 'none';
	this.lutAnalystBox.appendChild(this.lutAnalystDoButton);
	this.lutAnalystStoreButton.setAttribute('type','button');
	this.lutAnalystStoreButton.setAttribute('class','buttons');
	this.lutAnalystStoreButton.value = 'Save LA LUT';
	this.lutAnalystStoreButton.disabled = false;
	this.lutAnalystStoreButton.style.display = 'none';
	this.lutAnalystBox.appendChild(this.lutAnalystStoreButton);
	this.lutAnalystBackButton.setAttribute('type','button');
	this.lutAnalystBackButton.setAttribute('class','buttons');
	this.lutAnalystBackButton.value = 'Change LUT';
	this.lutAnalystBackButton.disabled = false;
	this.lutAnalystBackButton.style.display = 'none';
	this.lutAnalystBox.appendChild(this.lutAnalystBackButton);
	this.lutAnalystInfoBox = document.createElement('div');
	this.lutAnalystInfo.style.display = 'block';
	this.lutAnalystInfoBox.appendChild(this.lutAnalystInfo);
	this.lutAnalystProgress.style.display = 'inline';
	this.lutAnalystInfoBox.appendChild(this.lutAnalystProgress);
	this.lutAnalystInfoBox.style.display = 'none';
	this.lutAnalystBox.appendChild(this.lutAnalystInfoBox);
}
//		Set Up Data
//		Event Responses
LUTTweaksBox.prototype.lutAnalystGetFile = function() {
	var validExts = [];
	if (this.lutAnalystNewOpt.checked) {
		validExts = ['cube'];
	} else {
		validExts = ['lacube'];
	}
	if (this.lutAnalystFileInput.value != '') {
		this.file.loadFromInput(this.lutAnalystFileInput, validExts, 'laFileData', this, 0);
	}
}
LUTTweaksBox.prototype.lutAnalystGotFile = function() {
	this.lutAnalystLoadBox.style.display = 'none';
	this.lutAnalystBackButton.style.display = 'inline';
	if (this.lutAnalystNewOpt.checked) {
		this.lutAnalystAnalyseBox.style.display = 'block';
		this.lutAnalystInLUT.reset();
		var parsed = false;
		switch (this.inputs.laFileData.format) {
			case 'cube': parsed = this.file.parseCube('laFileData', 'laInLUT');
						break;
		}
		if (parsed) {
			this.lutAnalystTitle.value = this.lutAnalystInLUT.title;
			this.lutAnalystDoButton.style.display = 'inline';
			if (this.lutAnalystInLUT.d == 3) {
				this.lutAnalystGamutBox.style.display = 'inline';
			} else {
				this.lutAnalystGamutBox.style.display = 'none';
			}
		} else {
			this.lutAnalystReset();
		}
	} else {
		this.lutAnalystDoButton.style.display = 'none';
		this.lutAnalystInLUT.reset();
		var parsed = false;
		switch (this.inputs.laFileData.format) {
			case 'lacube': parsed = this.file.parseLACube('laFileData', 'laGamma', 'laGamut');
						break;
		}
		if (parsed) {
			this.lutAnalystCheck.checked = true;
			this.lutAnalystCheck.style.display = 'inline';
			this.lutAnalystToggleCheck();
		} else {
			this.lutAnalystReset();
		}
	}
}
LUTTweaksBox.prototype.lutAnalystReset = function() {
	this.lutAnalysed.value = '0';
	this.lutAnalystCheck.checked = false;
	this.lutAnalystCheck.style.display = 'none';
	if (this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value == this.gammas.LA) {
		this.inputs.outGamma.options[0].selected = true;
	}
	if (this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value == this.gamuts.LA) {
		this.inputs.outGamut.options[0].selected = true;
	}
	if (this.highGamutSelect.options[this.highGamutSelect.options.length - 1].value == this.gamuts.LA) {
		this.highGamutSelect.options[0].selected = true;
	}
	this.lutAnalystToggleCheck();
	this.lutAnalystInLUT.reset();
	this.inputs.laFileData = {};
	this.lutAnalystFileInput.value = '';
	this.lutAnalystDLOpt.checked = true;
	this.lutAnalystGammaSelect.options[0].selected = true;
	this.lutAnalystLinGammaSelect.options[0].selected = true;
	this.lutAnalystLinGammaBox.style.display = 'none';
	this.lutAnalystLoadBox.style.display = 'block';
	this.lutAnalystAnalyseBox.style.display = 'none';
	this.lutAnalystBackButton.style.display = 'none';
	this.lutAnalystDoButton.value = 'Analyse';
	this.lutAnalystStoreButton.style.display = 'none';
	this.lutAnalystDoButton.style.display = 'none';
	this.lutAnalystInfo.innerHTML = '';
	this.lutAnalystProgress.style.display = 'inline';
	this.lutAnalystInfoBox.style.display = 'none';
}
LUTTweaksBox.prototype.lutAnalystToggleCheck = function() {
	if (this.lutAnalystCheck.checked) {
		if (this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value != this.gammas.LA) {
			var laOption = document.createElement('option');
				laOption.value = this.gammas.LA;
				laOption.innerHTML = 'LA - ' + this.lutAnalystGamma.title;
			this.inputs.outGamma.appendChild(laOption);
		} else {
			this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystGamma.title;
		}
		if (this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value != this.gamuts.LA) {
			var laOption = document.createElement('option');
				laOption.value = this.gamuts.LA;
				laOption.innerHTML = 'LA - ' + this.lutAnalystGamma.title;
			this.inputs.outGamut.appendChild(laOption);
		} else {
			this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystGamma.title;
		}
		if (this.highGamutSelect.options[this.highGamutSelect.options.length - 1].value != this.gamuts.LA) {
			var laOption = document.createElement('option');
				laOption.value = this.gamuts.LA;
				laOption.innerHTML = 'LA - ' + this.lutAnalystGamma.title;
			this.highGamutSelect.appendChild(laOption);
		} else {
			this.highGamutSelect.options[this.highGamutSelect.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystGamma.title;
		}
	} else {
		if (this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value == this.gammas.LA) {
			this.inputs.outGamma.remove(this.inputs.outGamma.options.length - 1);
			this.inputs.outGamma.options[0].selected = true;
		}
		if (this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value == this.gamuts.LA) {
			this.inputs.outGamut.remove(this.inputs.outGamut.options.length - 1);
			this.inputs.outGamut.options[0].selected = true;
		}
		if (this.highGamutSelect.options[this.highGamutSelect.options.length - 1].value == this.gamuts.LA) {
			this.highGamutSelect.remove(this.highGamutSelect.options.length - 1);
			this.highGamutSelect.options[0].selected = true;
		}
	}
}
LUTTweaksBox.prototype.lutAnalystChangeGamma = function() {
	if (this.lutAnalystGammaSelect.options[this.lutAnalystGammaSelect.options.selectedIndex].value == '9999') {
		this.lutAnalystLinGammaBox.style.display = 'block';
	} else {
		this.lutAnalystLinGammaBox.style.display = 'none';
	}
}
LUTTweaksBox.prototype.lutAnalystDo = function() {
	this.cleanLutAnalystTitle();
	var	legIn;
	var legOut;
	if (this.lutAnalystLDOpt.checked || this.lutAnalystLLOpt.checked) {
		legIn = true;
	} else {
		legIn = false;
	}
	if (this.lutAnalystDLOpt.checked || this.lutAnalystLLOpt.checked) {
		legOut = true;
	} else {
		legOut = false;
	}
	var lutGammaIn = parseInt(this.lutAnalystGammaSelect.options[this.lutAnalystGammaSelect.selectedIndex].value);
	if (lutGammaIn == 9999) {
		lutGammaIn = parseInt(this.lutAnalystLinGammaSelect.options[this.lutAnalystLinGammaSelect.selectedIndex].value);
	}
	this.lutAnalystProgress.value = 0.33;
	this.lutAnalystInfo.innerHTML = 'Calculating 1D Curve: S-Log3 → Test Gamma';
	this.lutAnalystInfoBox.style.display = 'block';
	var sl3ToGamma = this.lutAnalystInLUT.calcTransferFromSL3(this.gammas,lutGammaIn,legIn,legOut);
	if (sl3ToGamma) {
		this.lutAnalystProgress.value = 0.66;
		this.lutAnalystInfo.innerHTML = 'Calculating 3D Colour Space Conversion: S-Gamut3.cine → Test Gamut';
		this.lutAnalystGamma.reset();
		this.lutAnalystGamma.setInfo(this.lutAnalystTitle.value, 'lacube', 1, sl3ToGamma.length, [0,0,0], [1,1,1]);
		this.lutAnalystGamma.addLUT(sl3ToGamma.slice(),sl3ToGamma.slice(),sl3ToGamma.slice());
		this.lutAnalystGamut.reset();
		this.lutAnalystGamut.setInfo(this.lutAnalystTitle.value, 'lacube', 3, 33, [0,0,0], [1,1,1]);
		this.lutAnalystProgress.value = 0;
		this.lutAnalystInfo.innerHTML = '';
		this.lutAnalystInfoBox.style.display = 'none';
		if (this.lutAnalystInLUT.calcSG3ToGamut(this.lutAnalystGamut,sl3ToGamma,this.gammas,lutGammaIn,legIn,legOut)) {
			this.lutAnalystCheck.checked = true;
			this.lutAnalystCheck.style.display = 'inline';
			this.lutAnalystToggleCheck();
			this.lutAnalystDoButton.value = 'Re-Analyse';
			this.lutAnalystStoreButton.style.display = 'inline';
		}
	}
}
LUTTweaksBox.prototype.lutAnalystStore = function() {
	this.file.save(this.file.buildLALut(this.lutAnalystGamma.title,this.lutAnalystGamma,this.lutAnalystGamut),this.lutAnalystGamma.title,'lacube');
}
LUTTweaksBox.prototype.cleanLutAnalystTitle = function() {
	this.lutAnalystTitle.value = this.lutAnalystTitle.value.replace(/[/"/']/gi, '');
	this.lutAnalystGamma.title = this.lutAnalystTitle.value;
	this.lutAnalystGamut.title = this.lutAnalystTitle.value;
	this.gammas.gammas[this.gammas.LA].setTitle(this.lutAnalystTitle.value);
	this.gamuts.outGamuts[this.gamuts.LA].setTitle(this.lutAnalystTitle.value);
	if (this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value == this.gammas.LA) {
		this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystGamma.title;
	}
	if (this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value == this.gamuts.LA) {
		this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystGamma.title;
	}
	if (this.highGamutSelect.options[this.highGamutSelect.options.length - 1].value == this.gamuts.LA) {
		this.highGamutSelect.options[this.highGamutSelect.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystGamma.title;
	}
}
//
// General Helper Functions
LUTTweaksBox.prototype.legToDat = function(input) {
	return ((input * 876) + 64)/1023;
}
LUTTweaksBox.prototype.createRadioElement = function(name, checked) {
    var radioInput;
    try {
        var radioHtml = '<input type="radio" name="' + name + '"';
        if ( checked ) {
            radioHtml += ' checked="checked"';
        }
        radioHtml += '/>';
        radioInput = document.createElement(radioHtml);
    } catch( err ) {
        radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', name);
        if ( checked ) {
            radioInput.setAttribute('checked', 'checked');
        }
    }
    return radioInput;
}
// General Event Responses
LUTTweaksBox.prototype.toggleTweakCheck = function() {
	if (this.tweakCheck.checked) {
		if (this.inputs.d[1].checked) {
			this.highGamutBox.style.display = 'block';
		} else {
			this.highGamutBox.style.display = 'none';
			this.highGamutCheck.checked = false;
		}
		if (this.gammas.gammas[this.gammas.curOut].cat != 0 && this.gammas.gammas[this.gammas.curOut].cat != 3) {
			this.blackLevelBox.style.display = 'block';
			this.highLevelBox.style.display = 'block';
		} else {
			this.blackLevelBox.style.display = 'none';
			this.highLevelBox.style.display = 'none';
			this.blackLevelCheck.checked = false;
			this.highLevelCheck.checked = false;
		}
		this.lutAnalystBox.style.display = 'block';
	} else {
		this.highGamutBox.style.display = 'none';
		this.blackLevelBox.style.display = 'none';
		this.highLevelBox.style.display = 'none';
		this.lutAnalystBox.style.display = 'none';
		this.highGamutCheck.checked = false;
		this.blackLevelCheck.checked = false;
		this.highLevelCheck.checked = false;
		this.lutAnalystCheck.checked = false;
	}
	this.lutAnalystToggleCheck();
	this.updateScaling();
}
LUTTweaksBox.prototype.updateScaling = function() {
	if (this.tweakCheck.checked) {
		var blackDef = this.gammas.baseIreOut(0) / 100;
		var blackNew = blackDef;
		if (this.blackLevelCheck.checked) {
			blackNew = parseFloat(this.blackLevelInput.value) / 100;
			if (Math.abs(blackNew-blackDef)<0.0001) {
				blackNew = blackDef;
			}
		}
		var highRef = 1;
		var highDefMap = 1;
		var highNewMap = 1;
		if (this.highLevelCheck.checked) {
			highRef = parseFloat(this.highLevelRef.value)/90;
			highDefMap = parseFloat(this.gammas.baseIreOut(highRef))/100;
			highNewMap = parseFloat(this.highLevelMap.value)/100;
			if (Math.abs(highNewMap-highDefMap)<0.0001) {
				highNewMap = highDefMap;
			}
		}
		this.gammas.al = (highNewMap - blackNew)/(highDefMap - blackDef);
		this.gammas.bl = blackNew - (blackDef * this.gammas.al);
		this.gammas.ad = this.gammas.al;
		this.gammas.bd = this.legToDat(blackNew) - (this.legToDat(blackDef) * this.gammas.ad);
	} else {
		this.gammas.al = 1;
		this.gammas.bl = 0;
		this.gammas.ad = 1;
		this.gammas.bd = 0;
	}
}
LUTTweaksBox.prototype.changeGamma = function() {
	this.blackLevelDefault();
	this.highLevelRef.value='90';
	this.highLevelDefault();
	this.toggleTweakCheck();
}
LUTTweaksBox.prototype.followUp = function(input) {
	switch (input) {
		case 0:	this.lutAnalystGotFile();
				break;
		default:break;
	}
}
