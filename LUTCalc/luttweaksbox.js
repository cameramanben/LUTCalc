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
function LUTTweaksBox(fieldset, inputs, message, file) {
	this.box = document.createElement('fieldset');
	this.message = message;
	this.p = 3;
	this.message.addUI(this.p,this);
	this.inputs = inputs;
	this.gamutLA = null;
	this.gammaLA = null;
	this.blackDefault = null;
	this.highDefault = null;
	this.highMap = null;
	this.catList = [];
	this.file = file;
	this.tweakCheck = document.createElement('input');
	this.inputs.addInput('tweaks',this.tweakCheck);
	this.inputs.addInput('al',1);
	this.inputs.addInput('bl',0);
	this.inputs.addInput('ad',1);
	this.inputs.addInput('bd',0);
	this.highGamutBox = document.createElement('div');
	this.highGamutWindow = document.createElement('div');
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
	this.blackLevelWindow = document.createElement('div');
	this.blackLevelCheck = document.createElement('input');
	this.inputs.addInput('tweakBlkCheck',this.blackLevelCheck);
	this.blackLevelInput = document.createElement('input');
	this.inputs.addInput('tweakBlk',this.blackLevelInput);
	this.highLevelBox = document.createElement('div');
	this.highLevelWindow = document.createElement('div');
	this.highLevelCheck = document.createElement('input');
	this.inputs.addInput('tweakHiCheck',this.highLevelCheck);
	this.highLevelRef = document.createElement('input');
	this.inputs.addInput('tweakHiRef',this.highLevelRef);
	this.highLevelMap = document.createElement('input');
	this.inputs.addInput('tweakHiMap',this.highLevelMap);
	this.lutAnalystBox = document.createElement('div');
	this.lutAnalystCheck = document.createElement('input');

	this.tempBox = document.createElement('div');
	this.tempWindow = document.createElement('div');
	this.tempCheck = document.createElement('input');
	this.inputs.addInput('tweakTempCheck',this.tempCheck);
	this.tempCTSlider = document.createElement('input');
	this.tempCTSliderLabel = document.createElement('label');
	this.inputs.addInput('tweakTempCTSlider',this.tempCTSlider);
	this.tempNew = document.createElement('input');
	this.inputs.addInput('tweakTempNew',this.tempNew);
	this.tempAdvancedCheck = document.createElement('input');
	this.inputs.addInput('tweakTempAdvancedCheck',this.tempAdvancedCheck);
	this.tempBase = document.createElement('input');
	this.inputs.addInput('tweakTempBase',this.tempBase);
	this.tempCATSelect = document.createElement('select');
	this.inputs.addInput('tweakTempCATSelect',this.tempCATSelect);

	this.greenBox = document.createElement('div');
	this.greenWindow = document.createElement('div');
	this.greenCheck = document.createElement('input');
	this.inputs.addInput('tweakGreenCheck',this.greenCheck);
	this.greenPMSlider = document.createElement('input');
	this.greenPMSliderLabel = document.createElement('label');
	this.inputs.addInput('tweakGreenPMSlider',this.greenPMSlider);
	this.greenLampTempSelect = document.createElement('select');
	this.inputs.addInput('tweakGreenLampTempSelect',this.greenLampTempSelect);
	this.greenAdvancedCheck = document.createElement('input');
	this.inputs.addInput('tweakGreenAdvancedCheck',this.greenAdvancedCheck);
	this.greenTemp = document.createElement('input');
	this.inputs.addInput('tweakGreenTemp',this.greenTemp);
	this.greenCATSelect = document.createElement('select');
	this.inputs.addInput('tweakGreenCATSelect',this.greenCATSelect);

	this.inputs.addInput('laCheck',this.lutAnalystCheck);
	this.lutAnalystInLUT = new LUTs();
	this.inputs.addInput('laInLUT',this.lutAnalystInLUT);
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
	this.inputs.addInput('laGamutSelect',this.lutAnalystGamutSelect);
	this.lutAnalystDLOpt = this.createRadioElement('lutAnalystRange',true);
	this.lutAnalystDDOpt = this.createRadioElement('lutAnalystRange',false);
	this.lutAnalystLLOpt = this.createRadioElement('lutAnalystRange',false);
	this.lutAnalystLDOpt = this.createRadioElement('lutAnalystRange',false);
	this.inputs.addInput('laRange',[this.lutAnalystDLOpt,this.lutAnalystDDOpt,this.lutAnalystLLOpt,this.lutAnalystLDOpt]);
	this.lutAnalystDoButton = document.createElement('input');
	this.lutAnalystDim33 = this.createRadioElement('lutAnalystDim',false);
	this.lutAnalystDim65 = this.createRadioElement('lutAnalystDim',true);
	this.inputs.addInput('laDim',[this.lutAnalystDim33,this.lutAnalystDim65]);
	this.inputs.addInput('laDoButton',this.lutAnalystDoButton);
	this.lutAnalystStoreButton = document.createElement('input');
	this.inputs.addInput('laStoreButton',this.lutAnalystStoreButton);
	this.lutAnalystStoreBinButton = document.createElement('input');
	this.inputs.addInput('laStoreBinButton',this.lutAnalystStoreBinButton);
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
	this.tempShift();
	tweakHolder.appendChild(this.tempBox);
	this.greenShift();
	tweakHolder.appendChild(this.greenBox);
	this.lutAnalyst();
	tweakHolder.appendChild(this.lutAnalystBox);
	this.box.appendChild(tweakHolder);
	this.tweakCheck.checked = true;
}
//	Set Up Data
LUTTweaksBox.prototype.blackHigh = function(blackDef,blackLevel,highRef,highDef,highMap,high709,changedGamma) {
	if (changedGamma) {
		this.blackLevelInput.value = (blackDef*100).toFixed(2).toString();
		this.highLevelRef.value = (highRef*100).toFixed(2).toString();
		this.highLevelMap.value = (highDef*100).toFixed(2).toString();
		this.highLevelRec.innerHTML = (high709*100).toFixed(2).toString();
	} else {
		this.blackLevelInput.value = (blackLevel*100).toFixed(2).toString();
		this.highLevelRef.value = (highRef*100).toFixed(2).toString();
		this.highLevelMap.value = (highMap*100).toFixed(2).toString();
		this.highLevelRec.innerHTML = (high709*100).toFixed(2).toString();
	}
	this.toggleTweakCheck();
}
//	Event Responses
LUTTweaksBox.prototype.toggleTweakCheck = function() {
	if (this.tweakCheck.checked) {
		if (this.inputs.d[1].checked) {
			this.highGamutBox.style.display = 'block';
			this.tempBox.style.display = 'block';
			this.greenBox.style.display = 'block';
		} else {
			this.highGamutBox.style.display = 'none';
			this.highGamutCheck.checked = false;
			this.tempBox.style.display = 'none';
			this.greenBox.style.display = 'none';
			this.tempCheck.checked = false;
			this.greenCheck.checked = false;
		}
		var curOut = parseInt(this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value);
		if (curOut === 9999) {
			curOut = parseInt(this.inputs.outLinGamma.options[this.inputs.outLinGamma.selectedIndex].value);
		}
		if (this.catList[curOut] != 0 && this.catList[curOut] != 3) {
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
		this.tempBox.style.display = 'none';
		this.greenBox.style.display = 'none';
		this.lutAnalystBox.style.display = 'none';
		this.highGamutCheck.checked = false;
		this.blackLevelCheck.checked = false;
		this.highLevelCheck.checked = false;
		this.tempCheck.checked = false;
		this.greenCheck.checked = false;
		this.lutAnalystCheck.checked = false;
	}
	if (this.highGamutCheck.checked) {
		this.highGamutWindow.style.display = 'inline';
	} else {
		this.highGamutWindow.style.display = 'none';
	}
	if (this.blackLevelCheck.checked) {
		this.blackLevelWindow.style.display = 'inline';
	} else {
		this.blackLevelWindow.style.display = 'none';
	}
	if (this.highLevelCheck.checked) {
		this.highLevelWindow.style.display = 'inline';
	} else {
		this.highLevelWindow.style.display = 'none';
	}
	if (this.inputs.outGamma.options.length > 0 && this.inputs.outGamut.options.length > 0 && this.highGamutSelect.options.length > 0) {
		this.lutAnalystToggleCheck();
	}
}
LUTTweaksBox.prototype.gotGammaLists = function(inList,outList,linList,catList,LA) {
	this.lutAnalystGammaSelect.length = 0;
	this.lutAnalystLinGammaSelect.length = 0;
	var max = inList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = inList[i].idx;
		option.appendChild(document.createTextNode(inList[i].name));
		this.lutAnalystGammaSelect.appendChild(option);
	}
	max = linList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = linList[i].idx;
		option.appendChild(document.createTextNode(linList[i].name));
		this.lutAnalystLinGammaSelect.appendChild(option);
	}
	this.catList = catList;
	this.gammaLA = LA;
}
LUTTweaksBox.prototype.gotGamutLists = function(laList,outList,pass,LA) {
	var max = laList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = laList[i].idx;
		option.appendChild(document.createTextNode(laList[i].name));
		this.lutAnalystGamutSelect.appendChild(option);
	}
	max = outList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = outList[i].idx;
		option.appendChild(document.createTextNode(outList[i].name));
		this.highGamutSelect.appendChild(option);
	}
	this.gamutLA = LA;
}
//
// *** Highlight Gamut Tweak ***
//		Build UI
LUTTweaksBox.prototype.highGamut = function() {
	this.highGamutBox.setAttribute('class','graybox');
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Highlight Gamut')));
	this.highGamutCheck.setAttribute('type','checkbox');
	this.highGamutBox.appendChild(this.highGamutCheck);
	this.highGamutWindow.appendChild(document.createElement('br'));
	this.highGamutWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Gamut')));
	this.highGamutWindow.appendChild(this.highGamutSelect);
	this.highGamutWindow.appendChild(document.createElement('br'));
	this.highGamutLinOpt.value = '0';
	this.highGamutWindow.appendChild(this.highGamutLinOpt);
	this.highGamutWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Linear')));
	this.highGamutLogOpt.value = '1';
	this.highGamutWindow.appendChild(this.highGamutLogOpt);
	this.highGamutWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Log')));
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
	this.highGamutWindow.appendChild(this.highGamutLin);
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
	this.highGamutWindow.appendChild(this.highGamutLog);
	this.highGamutBox.appendChild(this.highGamutWindow);
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
		this.highGamutWindow.style.display = 'inline';
		this.toggleHighGamutLinLog();
	} else {
		this.highGamutSelect.disabled = true;
		this.highGamutLinOpt.disabled = true;
		this.highGamutLogOpt.disabled = true;
		this.highGamutWindow.style.display = 'none';
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
	this.blackLevelWindow.appendChild(document.createElement('br'));
	this.blackLevelInput.setAttribute('type','number');
	this.blackLevelInput.setAttribute('step','any');
	this.blackLevelInput.setAttribute('class','ireinput');
	this.blackLevelWindow.appendChild(this.blackLevelInput);
	this.blackLevelWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.blackLevelBox.appendChild(this.blackLevelWindow);
	this.toggleBlackLevelCheck();
}
//		Set Up Data
//		Event Responses
LUTTweaksBox.prototype.toggleBlackLevelCheck = function() {
	if (this.blackLevelCheck.checked) {
		this.blackLevelInput.disabled = false;
		this.blackLevelWindow.style.display = 'inline';
	} else {
		this.blackLevelInput.disabled = true;
		this.blackLevelWindow.style.display = 'none';
	}
}
LUTTweaksBox.prototype.changeBlackLevel = function() {
	if (!isNaN(parseFloat(this.blackLevelInput.value)) && isFinite(this.blackLevelInput.value) && (parseFloat(this.blackLevelInput.value)>-7.3)) {
	} else {
			this.blackLevelInput.value = null;
	}
}
//
// *** Highlight Level Tweak ***
//		Build UI
LUTTweaksBox.prototype.highlightLevel = function() {
	this.highLevelBox.setAttribute('class','graybox');
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Highlight Level')));
	this.highLevelCheck.setAttribute('type','checkbox');
	this.highLevelBox.appendChild(this.highLevelCheck);
	this.highLevelWindow.appendChild(document.createElement('br'));
	this.highLevelWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Reflected')));
	this.highLevelRef.setAttribute('type','number');
	this.highLevelRef.setAttribute('step','any');
	this.highLevelRef.setAttribute('class','ireinput');
	this.highLevelRef.value='90';
	this.highLevelWindow.appendChild(this.highLevelRef);
	this.highLevelWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.highLevelWindow.appendChild(document.createElement('br'));
	this.highLevelWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Maps To')));
	this.highLevelWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('(')));
	this.highLevelRec = document.createElement('span');
	this.highLevelWindow.appendChild(this.highLevelRec);
	this.highLevelWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE In Rec709)')));
	this.highLevelWindow.appendChild(document.createElement('br'));
	this.highLevelMap.setAttribute('type','number');
	this.highLevelMap.setAttribute('step','any');
	this.highLevelMap.setAttribute('class','ireinput');
	this.highLevelWindow.appendChild(this.highLevelMap);
	this.highLevelWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.highLevelBox.appendChild(this.highLevelWindow);
	this.toggleHighLevelCheck();
}
//		Set Up Data
//		Event Responses
LUTTweaksBox.prototype.toggleHighLevelCheck = function() {
	if (this.highLevelCheck.checked) {
		this.highLevelRef.disabled = false;
		this.highLevelMap.disabled = false;
		this.highLevelWindow.style.display = 'inline';
	} else {
		this.highLevelRef.disabled = true;
		this.highLevelMap.disabled = true;
		this.highLevelWindow.style.display = 'none';
	}
}
LUTTweaksBox.prototype.changeHighLevelRef = function() {
	if (!isNaN(parseFloat(this.highLevelRef.value)) && isFinite(this.highLevelRef.value) && (parseFloat(this.highLevelRef.value)>0)) {
	} else {
		this.highLevelRef.value = '90';
		this.highLevelMap.value = null;
	}
}
LUTTweaksBox.prototype.changeHighLevelMap = function() {
	if (!isNaN(parseFloat(this.highLevelMap.value)) && isFinite(this.highLevelMap.value) && (parseFloat(this.highLevelMap.value)>-7.3)) {
	} else {
		this.highLevelMap.value = null;
	}
}
//
// *** Colour Temperature Tweak ***
//		Build UI
LUTTweaksBox.prototype.tempShift = function() {
	this.tempBox.setAttribute('class','graybox');
	this.tempBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Colour Temperature Shift')));
	this.tempCheck.setAttribute('type','checkbox');
	this.tempBox.appendChild(this.tempCheck);
	this.tempWindow.appendChild(document.createElement('br'));
	this.tempWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('CTO')));
	this.tempCTSlider.setAttribute('type','range');
	this.tempCTSlider.setAttribute('min',-2);
	this.tempCTSlider.setAttribute('max',2);
	this.tempCTSlider.setAttribute('step',0.125);
	this.tempCTSlider.setAttribute('value',0);
	this.tempCTSliderLabel.innerHTML = 'Clear';
	this.tempWindow.appendChild(this.tempCTSlider);
	this.tempWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('CTB')));
	this.tempWindow.appendChild(document.createElement('br'));
	this.tempWindow.appendChild(this.tempCTSliderLabel);
	this.tempWindow.appendChild(document.createElement('br'));

	this.tempWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Camera White Balance')));
	this.tempBase.setAttribute('type','number');
	this.tempBase.setAttribute('class','kelvininput');
	this.tempBase.value = '5500';
	this.tempWindow.appendChild(this.tempBase);
	this.tempWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.tempWindow.appendChild(document.createElement('br'));
	this.tempWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('New White Balance')));
	this.tempNew.setAttribute('type','number');
	this.tempNew.setAttribute('class','kelvininput');
	this.tempNew.value = '5500';
	this.tempWindow.appendChild(this.tempNew);
	this.tempWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.tempWindow.appendChild(document.createElement('br'));

	this.tempWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Advanced Settings')));
	this.tempAdvancedCheck.setAttribute('type','checkbox');
	this.tempWindow.appendChild(this.tempAdvancedCheck);
	this.tempAdvanced = document.createElement('div');
	this.tempAdvanced.appendChild(document.createElement('label').appendChild(document.createTextNode('Chromatic Adaptation Model')));
	this.tempAdvanced.appendChild(this.tempCATSelect);
	this.tempWindow.appendChild(this.tempAdvanced);
	this.tempBox.appendChild(this.tempWindow);
	this.toggleTempAdvancedCheck();
	this.toggleTempCheck();
}
//		Set Up Data
//		Event Responses
LUTTweaksBox.prototype.toggleTempCheck = function() {
	if (this.tempCheck.checked) {
		this.tempBase.disabled = false;
		this.tempNew.disabled = false;
		this.tempCATSelect.disabled = false;
		this.tempWindow.style.display = 'inline';
	} else {
		this.tempBase.disabled = true;
		this.tempNew.disabled = true;
		this.tempCATSelect.disabled = true;
		this.tempWindow.style.display = 'none';
	}
}
LUTTweaksBox.prototype.gotCATs = function(cats) {
	this.tempCATSelect.length = 0;
	var max = cats.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = cats[j].idx;
		option.appendChild(document.createTextNode(cats[j].name));
		this.tempCATSelect.appendChild(option);
	}
}
LUTTweaksBox.prototype.updateTempSlider = function() {
	var val = parseFloat(this.tempCTSlider.value);
	var ratio = Math.exp(-val*0.5415972824);
	var base = Math.round(parseFloat(this.tempBase.value));
	var temp = base*ratio;
	if (temp < 1800) {
		this.tempBase.value = Math.round(1800/ratio).toString();
		this.tempNew.value = '1800';
	} else if (temp > 21000) {
		this.tempBase.value = Math.round(21000/ratio).toString();
		this.tempNew.value = '21000';
	} else {
		this.tempNew.value = Math.round(temp).toString();
	}
	if (val<0) {
		this.tempCTSliderLabel.innerHTML = Math.abs(val).toString() + ' CTO';
	} else if (val === 0) {
		this.tempCTSliderLabel.innerHTML = 'Clear';
	} else {
		this.tempCTSliderLabel.innerHTML = val.toString() + ' CTB';
	}
}
LUTTweaksBox.prototype.toggleTempAdvancedCheck = function() {
	if (this.tempAdvancedCheck.checked) {
		this.tempAdvanced.style.display = 'block';
	} else {
		this.tempAdvanced.style.display = 'none';
	}
}
LUTTweaksBox.prototype.changeBaseTemp = function() {
	var base = Math.round(parseFloat(this.tempBase.value));
	var temp = Math.round(parseFloat(this.tempNew.value));
	if (base < 1800) {
		this.tempBase.value = '1800';
	} else if (temp > 21000) {
		this.tempBase.value = '21000';
	} else {
		this.tempBase.value = base.toString();
	}
	var val = Math.log(parseFloat(this.tempNew.value)/parseFloat(this.tempBase.value))/0.5415972824;
	var valEight = Math.round(8*val)/8;
	val = -val.toFixed(3);
	this.tempCTSlider.value = val.toString();
	if (val<0) {
		this.tempCTSliderLabel.innerHTML = Math.abs(val).toString() + ' CTO';
	} else if (val === 0) {
		this.tempCTSliderLabel.innerHTML = 'Clear';
	} else {
		this.tempCTSliderLabel.innerHTML = val.toString() + ' CTB';
	}
}
LUTTweaksBox.prototype.changeNewTemp = function() {
	var base = Math.round(parseFloat(this.tempBase.value));
	var temp = Math.round(parseFloat(this.tempNew.value));
	if (temp < 1800) {
		this.tempNew.value = '1800';
	} else if (temp > 21000) {
		this.tempNew.value = '21000';
	} else {
		this.tempNew.value = temp.toString();
	}
	var val = Math.log(parseFloat(this.tempNew.value)/parseFloat(this.tempBase.value))/0.5415972824;
	var valEight = Math.round(8*val)/8;
	val = -val.toFixed(3);
	this.tempCTSlider.value = val.toString();
	if (val<0) {
		this.tempCTSliderLabel.innerHTML = Math.abs(val).toString() + ' CTO';
	} else if (val === 0) {
		this.tempCTSliderLabel.innerHTML = 'Clear';
	} else {
		this.tempCTSliderLabel.innerHTML = val.toString() + ' CTB';
	}
}
//
// *** Green Spike Tweak ***
//		Build UI
LUTTweaksBox.prototype.greenShift = function() {
	this.greenBox.setAttribute('class','graybox');
	this.greenBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Fluori / LED Correction')));
	this.greenCheck.setAttribute('type','checkbox');
	this.greenBox.appendChild(this.greenCheck);
	this.greenWindow.appendChild(document.createElement('br'));
	this.greenWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Magenta')));
	this.greenPMSlider.setAttribute('type','range');
	this.greenPMSlider.setAttribute('min',-1.5);
	this.greenPMSlider.setAttribute('max',1.5);
	this.greenPMSlider.setAttribute('step',0.05);
	this.greenPMSlider.setAttribute('value',0);
	this.greenPMSliderLabel.innerHTML = 'Clear';
	this.greenWindow.appendChild(this.greenPMSlider);
	this.greenWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Green')));
	this.greenWindow.appendChild(document.createElement('br'));
	this.greenWindow.appendChild(this.greenPMSliderLabel);
	this.greenWindow.appendChild(document.createElement('br'));
	this.greenWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Advanced Settings')));
	this.greenAdvancedCheck.setAttribute('type','checkbox');
	this.greenWindow.appendChild(this.greenAdvancedCheck);
	this.greenAdvanced = document.createElement('div');
	this.greenAdvanced.appendChild(document.createElement('label').appendChild(document.createTextNode('Lamp Base Colour')));
	this.setupGreenLampTempSelect();
	this.greenAdvanced.appendChild(this.greenLampTempSelect);
	this.greenAdvanced.appendChild(document.createElement('br'));
	this.greenAdvanced.appendChild(document.createElement('label').appendChild(document.createTextNode('Lamp Colour Temperature')));
	this.greenTemp.setAttribute('type','number');
	this.greenTemp.setAttribute('class','kelvininput');
	this.greenAdvanced.appendChild(this.greenTemp);
	this.greenAdvanced.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.greenAdvanced.appendChild(document.createElement('br'));
	this.greenAdvanced.appendChild(document.createElement('label').appendChild(document.createTextNode('Chromatic Adaptation Model')));
	this.greenAdvanced.appendChild(this.greenCATSelect);
	this.greenWindow.appendChild(this.greenAdvanced);
	this.greenBox.appendChild(this.greenWindow);
	this.toggleGreenAdvancedCheck();
	this.toggleGreenCheck();
}
//		Set Up Data
LUTTweaksBox.prototype.setupGreenLampTempSelect = function() {
	var colours = [	'Warm Comfort Light',
					'Warm White',
					'Tungsten',
					'White',
					'Cool White',
					'Daylight',
					'Cool Daylight'
	];
	var temps = [	2500,
					2800,
					3200,
					3500,
					4300,
					5500,
					6500
	];
	this.greenTempL = [];
	this.greenTempH = [];
	var max = colours.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = temps[j].toString();
		option.appendChild(document.createTextNode(colours[j]));
		if (colours[j] === 'Cool White') {
			option.selected = true;
			this.greenTemp.value = temps[j].toString();
		}
		if (j === 0) {
			this.greenTempL[j] = 0;
			this.greenTempH[j] = (temps[j] + temps[j+1])/2;
		} else if (j === max-1) {
			this.greenTempL[j] = this.greenTempH[j-1]+1;
			this.greenTempH[j] = 99999;
		} else {
			this.greenTempL[j] = this.greenTempH[j-1]+1;
			this.greenTempH[j] = (temps[j] + temps[j+1])/2;
		}
		this.greenLampTempSelect.appendChild(option);
	}
}
//		Event Responses
LUTTweaksBox.prototype.toggleGreenCheck = function() {
	if (this.greenCheck.checked) {
		this.greenLampTempSelect.disabled = false;
		this.greenTemp.disabled = false;
		this.greenCATSelect.disabled = false;
		this.greenWindow.style.display = 'inline';
	} else {
		this.greenLampTempSelect.disabled = true;
		this.greenTemp.disabled = true;
		this.greenCATSelect.disabled = true;
		this.greenWindow.style.display = 'none';
	}
}
LUTTweaksBox.prototype.gotGreenCATs = function(cats) {
	this.greenCATSelect.length = 0;
	var max = cats.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = cats[j].idx;
		option.appendChild(document.createTextNode(cats[j].name));
		this.greenCATSelect.appendChild(option);
	}
}
LUTTweaksBox.prototype.updateGreenSlider = function() {
	var val = parseFloat(this.greenPMSlider.value);
	if (val<0) {
		this.greenPMSliderLabel.innerHTML = Math.abs(val).toString() + ' Minus Green';
	} else if (val === 0) {
		this.greenPMSliderLabel.innerHTML = 'Clear';
	} else {
		this.greenPMSliderLabel.innerHTML = Math.abs(val).toString() + ' Plus Green';
	}
}
LUTTweaksBox.prototype.toggleGreenAdvancedCheck = function() {
	if (this.greenAdvancedCheck.checked) {
		this.greenAdvanced.style.display = 'block';
	} else {
		this.greenAdvanced.style.display = 'none';
	}
}
LUTTweaksBox.prototype.changeGreenTemp = function() {
	var temp = Math.round(parseFloat(this.greenTemp.value));
	if (temp < 1800) {
		this.greenTemp.value = '1800';
	} else if (temp > 21000) {
		this.greenTemp.value = '21000';
	} else {
		this.greenTemp.value = temp.toString();
	}
	temp = Math.round(parseFloat(this.greenTemp.value));
	var max = this.greenTempL.length;
	for (var j=0; j<max; j++) {
		if (temp >= this.greenTempL[j] && temp <= this.greenTempH[j]) {
			this.greenLampTempSelect.options[j].selected = true;
			break;
		}
	}
}
LUTTweaksBox.prototype.changeGreenLampTemp = function() {
	this.greenTemp.value = this.greenLampTempSelect.options[this.greenLampTempSelect.selectedIndex].value;
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
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystGammaSelect);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('br'));
	this.lutAnalystLinGammaBox = document.createElement('div');
	this.lutAnalystLinGammaBox.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	this.lutAnalystLinGammaBox.appendChild(this.lutAnalystLinGammaSelect);
	this.lutAnalystLinGammaBox.style.display = 'none';
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystLinGammaBox);
	this.lutAnalystGamutBox = document.createElement('div');
	this.lutAnalystGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Gamut')));
	this.lutAnalystGamutBox.appendChild(this.lutAnalystGamutSelect);
	this.lutAnalystGamutBox.appendChild(document.createElement('br'));
	this.lutAnalystGamutBox.style.display = 'none';
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystGamutBox);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Analysis Dimension:')));
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystDim33);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('33x33x33')));
	this.lutAnalystAnalyseBox.appendChild(this.lutAnalystDim65);
	this.lutAnalystAnalyseBox.appendChild(document.createElement('label').appendChild(document.createTextNode('65x65x65')));
	this.lutAnalystAnalyseBox.appendChild(document.createElement('br'));
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
	this.lutAnalystStoreButton.value = 'Save Cube';
	this.lutAnalystStoreButton.disabled = false;
	this.lutAnalystStoreButton.style.display = 'none';
	this.lutAnalystBox.appendChild(this.lutAnalystStoreButton);

	this.lutAnalystStoreBinButton.setAttribute('type','button');
	this.lutAnalystStoreBinButton.setAttribute('class','buttons');
	this.lutAnalystStoreBinButton.value = 'Save Binary';
	this.lutAnalystStoreBinButton.disabled = false;
	this.lutAnalystStoreBinButton.style.display = 'none';
	this.lutAnalystBox.appendChild(this.lutAnalystStoreBinButton);

	this.lutAnalystBackButton.setAttribute('type','button');
	this.lutAnalystBackButton.setAttribute('class','buttons');
	this.lutAnalystBackButton.value = 'New LUT';
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
		validExts = ['lacube','labin'];
	}
	if (this.inputs.isApp || this.lutAnalystFileInput.value !== '') {
		this.file.loadLUTFromInput(this.lutAnalystFileInput, validExts, 'laFileData', this, 0);
	}
}
LUTTweaksBox.prototype.lutAnalystGotFile = function() {
	this.lutAnalystLoadBox.style.display = 'none';
	this.lutAnalystBackButton.style.display = 'inline';
	if (this.lutAnalystNewOpt.checked) {
		this.lutAnalystAnalyseBox.style.display = 'block';
		this.inputs.lutAnalyst.reset();
		var parsed = false;
		switch (this.inputs.laFileData.format) {
			case 'cube': parsed = this.file.parseCubeLA('laFileData', 'in');
						break;
		}
		if (parsed) {
			this.lutAnalystTitle.value = this.inputs.lutAnalyst.getTitle();
			this.lutAnalystDoButton.style.display = 'inline';
			if (this.inputs.lutAnalyst.is3D()) {
				this.lutAnalystGamutBox.style.display = 'inline';
			} else {
				this.lutAnalystGamutBox.style.display = 'none';
			}
		} else {
			this.lutAnalystReset();
		}
	} else {
		this.lutAnalystDoButton.style.display = 'none';
		this.inputs.lutAnalyst.reset();
		var parsed = false;
		switch (this.inputs.laFileData.format) {
			case 'lacube': parsed = this.file.parseLACube('laFileData');
						break;
			case 'labin': parsed = this.file.parseLABin('laFileData');
						break;
		}
		if (parsed) {
			this.lutAnalystTitle.value = this.inputs.lutAnalyst.getTitle();
			this.inputs.lutAnalyst.updateLATF();
			this.inputs.lutAnalyst.updateLACS();
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
	if (this.inputs.outGamma.options.length > 0 && this.inputs.outGamut.options.length > 0 && this.highGamutSelect.options.length > 0) {
		if (this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value === this.gammaLA) {
			this.inputs.outGamma.options[0].selected = true;
		}
		if (this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value === this.gamutLA) {
			this.inputs.outGamut.options[0].selected = true;
		}
		if (this.highGamutSelect.options[this.highGamutSelect.options.length - 1].value === this.gamutLA) {
			this.highGamutSelect.options[0].selected = true;
		}
		this.lutAnalystToggleCheck();
	}
	this.inputs.lutAnalyst.reset();
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
	this.lutAnalystStoreBinButton.style.display = 'none';
	this.lutAnalystDoButton.style.display = 'none';
	this.lutAnalystInfo.innerHTML = '';
	this.lutAnalystProgress.style.display = 'inline';
	this.lutAnalystInfoBox.style.display = 'none';
}
LUTTweaksBox.prototype.lutAnalystToggleCheck = function() {
	if (this.lutAnalystCheck.checked) {
		if (this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value != this.gammaLA) {
			var laOption = document.createElement('option');
				laOption.value = this.gammaLA;
				laOption.innerHTML = 'LA - ' + this.lutAnalystTitle.value;
			this.inputs.outGamma.appendChild(laOption);
		} else {
			this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystTitle.value;
		}
		if (this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value != this.gamutLA) {
			var laOption = document.createElement('option');
				laOption.value = this.gamutLA;
				laOption.innerHTML = 'LA - ' + this.lutAnalystTitle.value;
			this.inputs.outGamut.appendChild(laOption);
		} else {
			this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystTitle.value;
		}
		if (this.highGamutSelect.options[this.highGamutSelect.options.length - 1].value != this.gamutLA) {
			var laOption = document.createElement('option');
				laOption.value = this.gamutLA;
				laOption.innerHTML = 'LA - ' + this.lutAnalystTitle.value;
			this.highGamutSelect.appendChild(laOption);
		} else {
			this.highGamutSelect.options[this.highGamutSelect.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystTitle.value;
		}
	} else {
		if (this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value == this.gammaLA) {
			this.inputs.outGamma.remove(this.inputs.outGamma.options.length - 1);
			this.inputs.outGamma.options[0].selected = true;
		}
		if (this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value == this.gamutLA) {
			this.inputs.outGamut.remove(this.inputs.outGamut.options.length - 1);
			this.inputs.outGamut.options[0].selected = true;
		}
		if (this.highGamutSelect.options[this.highGamutSelect.options.length - 1].value == this.gamutLA) {
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
	this.inputs.lutAnalyst.getTF();
}
LUTTweaksBox.prototype.lutAnalystDone = function() {
	this.lutAnalystInfo.innerHTML = '';
	this.lutAnalystInfoBox.style.display = 'none';	
	this.lutAnalystCheck.checked = true;
	this.lutAnalystCheck.style.display = 'inline';
	this.lutAnalystToggleCheck();
	this.lutAnalystDoButton.value = 'Re-Analyse';
	this.lutAnalystStoreButton.style.display = 'inline';
    if (!this.inputs.isApp) {
        this.lutAnalystStoreBinButton.style.display = 'inline';
    }
}
LUTTweaksBox.prototype.lutAnalystStore = function(cube) {
	if (cube) {
		this.file.buildLALut(
			this.lutAnalystTitle.value,
			this.inputs.lutAnalyst.getL(),
			this.inputs.lutAnalyst.getRGB()
		);
	} else {
		this.file.buildLABinary(
			this.lutAnalystTitle.value,
			this.inputs.lutAnalyst.getL(),
			this.inputs.lutAnalyst.getRGB()
		);
	}
/*
	this.file.buildLA1DMethod(
		this.lutAnalystTitle.value,
		this.inputs.lutAnalyst.getL()
	);
*/
}
LUTTweaksBox.prototype.cleanLutAnalystTitle = function() {
	this.lutAnalystTitle.value = this.lutAnalystTitle.value.replace(/[/"/']/gi, '');
	if (this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value == this.gammaLA) {
		this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystTitle.value;
	}
	if (this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value == this.gamutLA) {
		this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystTitle.value;
	}
	if (this.highGamutSelect.options[this.highGamutSelect.options.length - 1].value == this.gamutLA) {
		this.highGamutSelect.options[this.highGamutSelect.options.length - 1].innerHTML = 'LA - ' + this.lutAnalystTitle.value;
	}
}
LUTTweaksBox.prototype.followUp = function(input) {
	switch (input) {
		case 0:	this.lutAnalystGotFile();
				break;
		default:break;
	}
}
//
// General Helper Functions
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
