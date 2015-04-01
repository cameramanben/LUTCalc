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

	this.cdlBox = document.createElement('div');
	this.cdlWindow = document.createElement('div');
	this.cdlCheck = document.createElement('input');
	this.inputs.addInput('tweakCDLCheck',this.cdlCheck);
	this.cdlSatSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLSatSlider',this.cdlSatSlider);
	this.cdlSatVal = document.createElement('input');
	this.inputs.addInput('tweakCDLSatVal',this.cdlSatVal);
	this.cdlChannelSelect = document.createElement('select');
	this.inputs.addInput('tweakCDLChannelSelect',this.cdlChannelSelect);
	this.cdlL = document.createElement('div');
	this.cdlLSSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLLSSlider',this.cdlLSSlider);
	this.cdlLSVal = document.createElement('input');
	this.inputs.addInput('tweakCDLLSVal',this.cdlLSVal);
	this.cdlLOSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLLOSlider',this.cdlLOSlider);
	this.cdlLOVal = document.createElement('input');
	this.inputs.addInput('tweakCDLLOVal',this.cdlLOVal);
	this.cdlLPSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLLPSlider',this.cdlLPSlider);
	this.cdlLPVal = document.createElement('input');
	this.inputs.addInput('tweakCDLLPVal',this.cdlLPVal);
	this.cdlR = document.createElement('div');
	this.cdlRSSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLRSSlider',this.cdlRSSlider);
	this.cdlRSVal = document.createElement('input');
	this.inputs.addInput('tweakCDLRSVal',this.cdlRSVal);
	this.cdlROSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLROSlider',this.cdlROSlider);
	this.cdlROVal = document.createElement('input');
	this.inputs.addInput('tweakCDLROVal',this.cdlROVal);
	this.cdlRPSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLRPSlider',this.cdlRPSlider);
	this.cdlRPVal = document.createElement('input');
	this.inputs.addInput('tweakCDLRPVal',this.cdlRPVal);
	this.cdlG = document.createElement('div');
	this.cdlGSSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLGSSlider',this.cdlGSSlider);
	this.cdlGSVal = document.createElement('input');
	this.inputs.addInput('tweakCDLGSVal',this.cdlGSVal);
	this.cdlGOSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLGOSlider',this.cdlGOSlider);
	this.cdlGOVal = document.createElement('input');
	this.inputs.addInput('tweakCDLGOVal',this.cdlGOVal);
	this.cdlGPSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLGPSlider',this.cdlGPSlider);
	this.cdlGPVal = document.createElement('input');
	this.inputs.addInput('tweakCDLGPVal',this.cdlGPVal);
	this.cdlB = document.createElement('div');
	this.cdlBSSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLBSSlider',this.cdlBSSlider);
	this.cdlBSVal = document.createElement('input');
	this.inputs.addInput('tweakCDLBSVal',this.cdlBSVal);
	this.cdlBOSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLBOSlider',this.cdlBOSlider);
	this.cdlBOVal = document.createElement('input');
	this.inputs.addInput('tweakCDLBOVal',this.cdlBOVal);
	this.cdlBPSlider = document.createElement('input');
	this.inputs.addInput('tweakCDLBPSlider',this.cdlBPSlider);
	this.cdlBPVal = document.createElement('input');
	this.inputs.addInput('tweakCDLBPVal',this.cdlBPVal);
	this.cdlSatReset = document.createElement('input');
	this.inputs.addInput('tweakCDLSatReset',this.cdlSatReset);
	this.cdlLSReset = document.createElement('input');
	this.inputs.addInput('tweakCDLLSReset',this.cdlLSReset);
	this.cdlLOReset = document.createElement('input');
	this.inputs.addInput('tweakCDLLOReset',this.cdlLOReset);
	this.cdlLPReset = document.createElement('input');
	this.inputs.addInput('tweakCDLLPReset',this.cdlLPReset);
	this.cdlRSReset = document.createElement('input');
	this.inputs.addInput('tweakCDLRSReset',this.cdlRSReset);
	this.cdlROReset = document.createElement('input');
	this.inputs.addInput('tweakCDLROReset',this.cdlROReset);
	this.cdlRPReset = document.createElement('input');
	this.inputs.addInput('tweakCDLRPReset',this.cdlRPReset);
	this.cdlGSReset = document.createElement('input');
	this.inputs.addInput('tweakCDLGSReset',this.cdlGSReset);
	this.cdlGOReset = document.createElement('input');
	this.inputs.addInput('tweakCDLGOReset',this.cdlGOReset);
	this.cdlGPReset = document.createElement('input');
	this.inputs.addInput('tweakCDLGPReset',this.cdlGPReset);
	this.cdlBSReset = document.createElement('input');
	this.inputs.addInput('tweakCDLBSReset',this.cdlBSReset);
	this.cdlBOReset = document.createElement('input');
	this.inputs.addInput('tweakCDLBOReset',this.cdlBOReset);
	this.cdlBPReset = document.createElement('input');
	this.inputs.addInput('tweakCDLBPReset',this.cdlBPReset);

	this.fcBox = document.createElement('div');
	this.fcWindow = document.createElement('div');
	this.fcCheck = document.createElement('input');
	this.inputs.addInput('tweakFCCheck',this.fcCheck);
	this.fcPurpleCheck = document.createElement('input');
	this.inputs.addInput('tweakFCPurpleCheck',this.fcPurpleCheck);
	this.fcBlueCheck = document.createElement('input');
	this.inputs.addInput('tweakFCBlueCheck',this.fcBlueCheck);
	this.fcBlueInput = document.createElement('input');
	this.inputs.addInput('tweakFCBlueWidth',this.fcBlueInput);
	this.fcGreenCheck = document.createElement('input');
	this.inputs.addInput('tweakFCGreenCheck',this.fcGreenCheck);
	this.fcPinkCheck = document.createElement('input');
	this.inputs.addInput('tweakFCPinkCheck',this.fcPinkCheck);
	this.fcOrangeCheck = document.createElement('input');
	this.inputs.addInput('tweakFCOrangeCheck',this.fcOrangeCheck);
	this.fcYellowCheck = document.createElement('input');
	this.inputs.addInput('tweakFCYellowCheck',this.fcYellowCheck);
	this.fcYellowInput = document.createElement('input');
	this.inputs.addInput('tweakFCYellowWidth',this.fcYellowInput);
	this.fcRedCheck = document.createElement('input');
	this.inputs.addInput('tweakFCRedCheck',this.fcRedCheck);

	this.lutAnalystBox = document.createElement('div');
	this.lutAnalystCheck = document.createElement('input');
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
	this.ascCDL();
	tweakHolder.appendChild(this.cdlBox);
	this.falseColour();
	tweakHolder.appendChild(this.fcBox);
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
			this.cdlBox.style.display = 'block';
			this.fcBox.style.display = 'block';
		} else {
			this.highGamutBox.style.display = 'none';
			this.highGamutCheck.checked = false;
			this.tempBox.style.display = 'none';
			this.greenBox.style.display = 'none';
			this.cdlBox.style.display = 'none';
			this.fcBox.style.display = 'block';
			this.tempCheck.checked = false;
			this.greenCheck.checked = false;
			this.cdlCheck.checked = false;
			this.fcCheck.checked = false;
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
		this.cdlBox.style.display = 'none';
		this.lutAnalystBox.style.display = 'none';
		this.highGamutCheck.checked = false;
		this.blackLevelCheck.checked = false;
		this.highLevelCheck.checked = false;
		this.tempCheck.checked = false;
		this.greenCheck.checked = false;
		this.cdlCheck.checked = false;
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
// *** ASC-CDL Tweak ***
//		Build UI
LUTTweaksBox.prototype.ascCDL = function() {
	var oMin = -0.5;
	var oMax = 0.5;
	this.cdlBox.setAttribute('class','graybox');
	this.cdlBox.appendChild(document.createElement('label').appendChild(document.createTextNode('ASC-CDL')));
	this.cdlCheck.setAttribute('type','checkbox');
	this.cdlBox.appendChild(this.cdlCheck);

	this.cdlWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Saturation')));
	this.cdlSatSlider.setAttribute('type','range');
	this.cdlSatSlider.setAttribute('min',0);
	this.cdlSatSlider.setAttribute('max',2);
	this.cdlSatSlider.setAttribute('step',0.05);
	this.cdlSatSlider.setAttribute('value',1);
	this.cdlWindow.appendChild(this.cdlSatSlider);
	this.cdlSatVal.setAttribute('type','text');
	this.cdlSatVal.setAttribute('class','smallinput');
	this.cdlSatVal.value = '1';
	this.cdlWindow.appendChild(this.cdlSatVal);
	this.cdlSatReset.setAttribute('type','button');
	this.cdlSatReset.setAttribute('class','smallbutton');
	this.cdlSatReset.setAttribute('value','Reset');
	this.cdlWindow.appendChild(this.cdlSatReset);
	this.cdlWindow.appendChild(document.createElement('br'));
	this.cdlWindow.appendChild(document.createElement('label').appendChild(document.createTextNode('Colour Channel')));
	this.cdlChannelOptions();
	this.cdlWindow.appendChild(this.cdlChannelSelect);

	this.cdlL.appendChild(document.createElement('label').appendChild(document.createTextNode('Slope ')));
	this.cdlLSSlider.setAttribute('type','range');
	this.cdlLSSlider.setAttribute('min',0);
	this.cdlLSSlider.setAttribute('max',2);
	this.cdlLSSlider.setAttribute('step',0.01);
	this.cdlLSSlider.setAttribute('value',1);
	this.cdlL.appendChild(this.cdlLSSlider);
	this.cdlLSVal.setAttribute('type','text');
	this.cdlLSVal.setAttribute('class','smallinput');
	this.cdlLSVal.value = '1';
	this.cdlL.appendChild(this.cdlLSVal);
	this.cdlLSReset.setAttribute('type','button');
	this.cdlLSReset.setAttribute('class','smallbutton');
	this.cdlLSReset.setAttribute('value','Reset');
	this.cdlL.appendChild(this.cdlLSReset);
	this.cdlL.appendChild(document.createElement('br'));
	this.cdlL.appendChild(document.createElement('label').appendChild(document.createTextNode('Offset ')));
	this.cdlLOSlider.setAttribute('type','range');
	this.cdlLOSlider.setAttribute('min',oMin);
	this.cdlLOSlider.setAttribute('max',oMax);
	this.cdlLOSlider.setAttribute('step',0.01);
	this.cdlLOSlider.setAttribute('value',0);
	this.cdlL.appendChild(this.cdlLOSlider);
	this.cdlLOVal.setAttribute('type','text');
	this.cdlLOVal.setAttribute('class','smallinput');
	this.cdlLOVal.value = '0';
	this.cdlL.appendChild(this.cdlLOVal);
	this.cdlLOReset.setAttribute('type','button');
	this.cdlLOReset.setAttribute('class','smallbutton');
	this.cdlLOReset.setAttribute('value','Reset');
	this.cdlL.appendChild(this.cdlLOReset);
	this.cdlL.appendChild(document.createElement('br'));
	this.cdlL.appendChild(document.createElement('label').appendChild(document.createTextNode('Power ')));
	this.cdlLPSlider.setAttribute('type','range');
	this.cdlLPSlider.setAttribute('min',0);
	this.cdlLPSlider.setAttribute('max',2);
	this.cdlLPSlider.setAttribute('step',0.01);
	this.cdlLPSlider.setAttribute('value',1);
	this.cdlL.appendChild(this.cdlLPSlider);
	this.cdlLPVal.setAttribute('type','text');
	this.cdlLPVal.setAttribute('class','smallinput');
	this.cdlLPVal.value = '1';
	this.cdlL.appendChild(this.cdlLPVal);
	this.cdlLPReset.setAttribute('type','button');
	this.cdlLPReset.setAttribute('class','smallbutton');
	this.cdlLPReset.setAttribute('value','Reset');
	this.cdlL.appendChild(this.cdlLPReset);
	this.cdlL.style.display = 'block';
	this.cdlWindow.appendChild(this.cdlL);

	this.cdlR.appendChild(document.createElement('label').appendChild(document.createTextNode('Slope ')));
	this.cdlRSSlider.setAttribute('type','range');
	this.cdlRSSlider.setAttribute('min',0);
	this.cdlRSSlider.setAttribute('max',2);
	this.cdlRSSlider.setAttribute('step',0.01);
	this.cdlRSSlider.setAttribute('value',1);
	this.cdlR.appendChild(this.cdlRSSlider);
	this.cdlRSVal.setAttribute('type','text');
	this.cdlRSVal.setAttribute('class','smallinput');
	this.cdlRSVal.value = '1';
	this.cdlR.appendChild(this.cdlRSVal);
	this.cdlRSReset.setAttribute('type','button');
	this.cdlRSReset.setAttribute('class','smallbutton');
	this.cdlRSReset.setAttribute('value','Reset');
	this.cdlR.appendChild(this.cdlRSReset);
	this.cdlR.appendChild(document.createElement('br'));
	this.cdlR.appendChild(document.createElement('label').appendChild(document.createTextNode('Offset ')));
	this.cdlROSlider.setAttribute('type','range');
	this.cdlROSlider.setAttribute('min',oMin);
	this.cdlROSlider.setAttribute('max',oMax);
	this.cdlROSlider.setAttribute('step',0.01);
	this.cdlROSlider.setAttribute('value',0);
	this.cdlR.appendChild(this.cdlROSlider);
	this.cdlROVal.setAttribute('type','text');
	this.cdlROVal.setAttribute('class','smallinput');
	this.cdlROVal.value = '0';
	this.cdlR.appendChild(this.cdlROVal);
	this.cdlROReset.setAttribute('type','button');
	this.cdlROReset.setAttribute('class','smallbutton');
	this.cdlROReset.setAttribute('value','Reset');
	this.cdlR.appendChild(this.cdlROReset);
	this.cdlR.appendChild(document.createElement('br'));
	this.cdlR.appendChild(document.createElement('label').appendChild(document.createTextNode('Power ')));
	this.cdlRPSlider.setAttribute('type','range');
	this.cdlRPSlider.setAttribute('min',0);
	this.cdlRPSlider.setAttribute('max',2);
	this.cdlRPSlider.setAttribute('step',0.01);
	this.cdlRPSlider.setAttribute('value',1);
	this.cdlR.appendChild(this.cdlRPSlider);
	this.cdlRPVal.setAttribute('type','text');
	this.cdlRPVal.setAttribute('class','smallinput');
	this.cdlRPVal.value = '1';
	this.cdlR.appendChild(this.cdlRPVal);
	this.cdlRPReset.setAttribute('type','button');
	this.cdlRPReset.setAttribute('class','smallbutton');
	this.cdlRPReset.setAttribute('value','Reset');
	this.cdlR.appendChild(this.cdlRPReset);
	this.cdlR.style.display = 'none';
	this.cdlWindow.appendChild(this.cdlR);

	this.cdlG.appendChild(document.createElement('label').appendChild(document.createTextNode('Slope ')));
	this.cdlGSSlider.setAttribute('type','range');
	this.cdlGSSlider.setAttribute('min',0);
	this.cdlGSSlider.setAttribute('max',2);
	this.cdlGSSlider.setAttribute('step',0.01);
	this.cdlGSSlider.setAttribute('value',1);
	this.cdlG.appendChild(this.cdlGSSlider);
	this.cdlGSVal.setAttribute('type','text');
	this.cdlGSVal.setAttribute('class','smallinput');
	this.cdlGSVal.value = '1';
	this.cdlG.appendChild(this.cdlGSVal);
	this.cdlGSReset.setAttribute('type','button');
	this.cdlGSReset.setAttribute('class','smallbutton');
	this.cdlGSReset.setAttribute('value','Reset');
	this.cdlG.appendChild(this.cdlGSReset);
	this.cdlG.appendChild(document.createElement('br'));
	this.cdlG.appendChild(document.createElement('label').appendChild(document.createTextNode('Offset ')));
	this.cdlGOSlider.setAttribute('type','range');
	this.cdlGOSlider.setAttribute('min',oMin);
	this.cdlGOSlider.setAttribute('max',oMax);
	this.cdlGOSlider.setAttribute('step',0.01);
	this.cdlGOSlider.setAttribute('value',0);
	this.cdlG.appendChild(this.cdlGOSlider);
	this.cdlGOVal.setAttribute('type','text');
	this.cdlGOVal.setAttribute('class','smallinput');
	this.cdlGOVal.value = '0';
	this.cdlG.appendChild(this.cdlGOVal);
	this.cdlGOReset.setAttribute('type','button');
	this.cdlGOReset.setAttribute('class','smallbutton');
	this.cdlGOReset.setAttribute('value','Reset');
	this.cdlG.appendChild(this.cdlGOReset);
	this.cdlG.appendChild(document.createElement('br'));
	this.cdlG.appendChild(document.createElement('label').appendChild(document.createTextNode('Power ')));
	this.cdlGPSlider.setAttribute('type','range');
	this.cdlGPSlider.setAttribute('min',0);
	this.cdlGPSlider.setAttribute('max',2);
	this.cdlGPSlider.setAttribute('step',0.01);
	this.cdlGPSlider.setAttribute('value',1);
	this.cdlG.appendChild(this.cdlGPSlider);
	this.cdlGPVal.setAttribute('type','text');
	this.cdlGPVal.setAttribute('class','smallinput');
	this.cdlGPVal.value = '1';
	this.cdlG.appendChild(this.cdlGPVal);
	this.cdlGPReset.setAttribute('type','button');
	this.cdlGPReset.setAttribute('class','smallbutton');
	this.cdlGPReset.setAttribute('value','Reset');
	this.cdlG.appendChild(this.cdlGPReset);
	this.cdlG.style.display = 'none';
	this.cdlWindow.appendChild(this.cdlG);

	this.cdlB.appendChild(document.createElement('label').appendChild(document.createTextNode('Slope ')));
	this.cdlBSSlider.setAttribute('type','range');
	this.cdlBSSlider.setAttribute('min',0);
	this.cdlBSSlider.setAttribute('max',2);
	this.cdlBSSlider.setAttribute('step',0.01);
	this.cdlBSSlider.setAttribute('value',1);
	this.cdlB.appendChild(this.cdlBSSlider);
	this.cdlBSVal.setAttribute('type','text');
	this.cdlBSVal.setAttribute('class','smallinput');
	this.cdlBSVal.value = '1';
	this.cdlB.appendChild(this.cdlBSVal);
	this.cdlBSReset.setAttribute('type','button');
	this.cdlBSReset.setAttribute('class','smallbutton');
	this.cdlBSReset.setAttribute('value','Reset');
	this.cdlB.appendChild(this.cdlBSReset);
	this.cdlB.appendChild(document.createElement('br'));
	this.cdlB.appendChild(document.createElement('label').appendChild(document.createTextNode('Offset ')));
	this.cdlBOSlider.setAttribute('type','range');
	this.cdlBOSlider.setAttribute('min',oMin);
	this.cdlBOSlider.setAttribute('max',oMax);
	this.cdlBOSlider.setAttribute('step',0.01);
	this.cdlBOSlider.setAttribute('value',0);
	this.cdlB.appendChild(this.cdlBOSlider);
	this.cdlBOVal.setAttribute('type','text');
	this.cdlBOVal.setAttribute('class','smallinput');
	this.cdlBOVal.value = '0';
	this.cdlB.appendChild(this.cdlBOVal);
	this.cdlBOReset.setAttribute('type','button');
	this.cdlBOReset.setAttribute('class','smallbutton');
	this.cdlBOReset.setAttribute('value','Reset');
	this.cdlB.appendChild(this.cdlBOReset);
	this.cdlB.appendChild(document.createElement('br'));
	this.cdlB.appendChild(document.createElement('label').appendChild(document.createTextNode('Power ')));
	this.cdlBPSlider.setAttribute('type','range');
	this.cdlBPSlider.setAttribute('min',0);
	this.cdlBPSlider.setAttribute('max',2);
	this.cdlBPSlider.setAttribute('step',0.01);
	this.cdlBPSlider.setAttribute('value',1);
	this.cdlB.appendChild(this.cdlBPSlider);
	this.cdlBPVal.setAttribute('type','text');
	this.cdlBPVal.setAttribute('class','smallinput');
	this.cdlBPVal.value = '1';
	this.cdlB.appendChild(this.cdlBPVal);
	this.cdlBPReset.setAttribute('type','button');
	this.cdlBPReset.setAttribute('class','smallbutton');
	this.cdlBPReset.setAttribute('value','Reset');
	this.cdlB.appendChild(this.cdlBPReset);
	this.cdlB.style.display = 'none';
	this.cdlWindow.appendChild(this.cdlB);

	this.cdlWindow.style.display = 'none';
	this.cdlBox.appendChild(this.cdlWindow);
}
//		Set Up Data
LUTTweaksBox.prototype.cdlChannelOptions = function() {
	var channels = ['Luma','Red','Green','Blue'];
	for (var j=0; j<4; j++) {
		var option = document.createElement('option');
		option.value = j.toString();
		option.appendChild(document.createTextNode(channels[j]));
		this.cdlChannelSelect.appendChild(option);
	}
}
//		Event Responses
LUTTweaksBox.prototype.toggleCDLCheck = function() {
	if (this.cdlCheck.checked) {
		this.cdlWindow.style.display = 'block';
	} else {
		this.cdlWindow.style.display = 'none';
	}
}
LUTTweaksBox.prototype.cdlChangeChannel = function() {
	this.cdlL.style.display = 'none';
	this.cdlR.style.display = 'none';
	this.cdlG.style.display = 'none';
	this.cdlB.style.display = 'none';
	switch (this.cdlChannelSelect.selectedIndex) {
		case 0: this.cdlL.style.display = 'block';
				break;
		case 1: this.cdlR.style.display = 'block';
				break;
		case 2: this.cdlG.style.display = 'block';
				break;
		case 3: this.cdlB.style.display = 'block';
				break;
	}
}
LUTTweaksBox.prototype.cdlUpdateSat = function(slider) {
	var s,S;
	if (slider) {
		s = this.cdlSatSlider.value;
		S = parseFloat(s);
	} else {
		s = this.cdlSatVal.value;
		S = parseFloat(s);
		if (isNaN(S)) {
			s = this.cdlSatSlider.value;
			S = parseFloat(s);
		} else if (S < 0) {
			s = '0';
			S = 0;
		}
	}
	this.cdlSatVal.value = s;
	this.cdlSatSlider.value = s;
}
LUTTweaksBox.prototype.cdlSyncL = function() {
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	var r = parseFloat(this.cdlRSVal.value);
	var g = parseFloat(this.cdlGSVal.value);
	var b = parseFloat(this.cdlBSVal.value);
	var lS = ((r+g+b)/3);
	this.cdlLSSlider.value = ((Math.log((lS-c4)/c3)-c2)/c1).toString();
	this.cdlLSVal.value = lS.toString();
	r = parseFloat(this.cdlROVal.value);
	g = parseFloat(this.cdlGOVal.value);
	b = parseFloat(this.cdlBOVal.value);
	var lO = ((r+g+b)/3);
	this.cdlLOSlider.value = lO.toString();
	this.cdlLOVal.value = lO.toString();
	r = parseFloat(this.cdlRPVal.value);
	g = parseFloat(this.cdlGPVal.value);
	b = parseFloat(this.cdlBPVal.value);
	var lP = ((r+g+b)/3);
	this.cdlLPSlider.value = ((Math.log((lP-c4)/c3)-c2)/c1).toString();
	this.cdlLPVal.value = lP.toString();
}
LUTTweaksBox.prototype.cdlUpdateLS = function(slider) {
	var s,S;
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	if (slider) {
		s = this.cdlLSSlider.value;
		S = (c3*Math.exp((c1*parseFloat(s))+c2)) + c4;
	} else {
		s = this.cdlLSVal.value;
		S = parseFloat(s);
		if (isNaN(S)) {
			s = this.cdlLSSlider.value;
			S = (c3*Math.exp((c1*parseFloat(s))+c2)) + c4;
		} else if (S < 0) {
			s = '0';
			S = 0;
		}
	}
	this.cdlLSVal.value = S.toString();
	this.cdlLSSlider.value = ((Math.log((S-c4)/c3)-c2)/c1).toString();
	var rS = parseFloat(this.cdlRSVal.value);
	var gS = parseFloat(this.cdlGSVal.value);
	var bS = parseFloat(this.cdlBSVal.value);
	var aS = (rS+gS+bS)/3;
	var r,g,b;
	var offset = S-aS;
	r = (rS + offset);
	g = (gS + offset);
	b = (bS + offset);
	if (r<0) {r=0;}
	if (g<0) {g=0;}
	if (b<0) {b=0;}
	this.cdlRSVal.value = r.toString();
	this.cdlGSVal.value = g.toString();
	this.cdlBSVal.value = b.toString();
	this.cdlRSSlider.value = ((Math.log((r-c4)/c3)-c2)/c1).toString();
	this.cdlGSSlider.value = ((Math.log((g-c4)/c3)-c2)/c1).toString();
	this.cdlBSSlider.value = ((Math.log((b-c4)/c3)-c2)/c1).toString();
	this.cdlSyncL();
}
LUTTweaksBox.prototype.cdlUpdateLO = function(slider) {
	var o,O;
	if (slider) {
		o = this.cdlLOSlider.value;
		O = parseFloat(o);
	} else {
		o = this.cdlLOVal.value;
		O = parseFloat(o);
		if (isNaN(O)) {
			o = this.cdlLOSlider.value;
			O = parseFloat(o);
		}
	}
	this.cdlLOVal.value = o;
	this.cdlLOSlider.value = o;
	var rO = parseFloat(this.cdlROVal.value);
	var gO = parseFloat(this.cdlGOVal.value);
	var bO = parseFloat(this.cdlBOVal.value);
	var aO = (rO+gO+bO)/3;
	var r,g,b;
	var offset = O - aO;
	r = (rO + offset).toString();
	g = (gO + offset).toString();
	b = (bO + offset).toString();
	this.cdlROVal.value = r;
	this.cdlGOVal.value = g;
	this.cdlBOVal.value = b;
	this.cdlROSlider.value = r;
	this.cdlGOSlider.value = g;
	this.cdlBOSlider.value = b;
}
LUTTweaksBox.prototype.cdlUpdateLP = function(slider) {
	var p,P;
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	if (slider) {
		p = this.cdlLPSlider.value;
		P = (c3*Math.exp((c1*parseFloat(p))+c2)) + c4;
	} else {
		p = this.cdlLPVal.value;
		P = parseFloat(p);
		if (isNaN(P)) {
			p = this.cdlLPSlider.value;
			P = (c3*Math.exp((c1*parseFloat(p))+c2)) + c4;
		} else if (P < 0) {
			p = '0';
			P = 0;
		}
	}
	this.cdlLPVal.value = P.toString();
	this.cdlLPSlider.value = ((Math.log((P-c4)/c3)-c2)/c1).toString();
	var rP = parseFloat(this.cdlRPVal.value);
	var gP = parseFloat(this.cdlGPVal.value);
	var bP = parseFloat(this.cdlBPVal.value);
	var aP = (rP+gP+bP)/3;
	var r,g,b;
	var offset = P - aP;
	r = (rP + offset);
	g = (gP + offset);
	b = (bP + offset);
	if (r<0) {r=0;}
	if (g<0) {g=0;}
	if (b<0) {b=0;}
	this.cdlRPVal.value = r.toString();
	this.cdlGPVal.value = g.toString();
	this.cdlBPVal.value = b.toString();
	this.cdlRPSlider.value = ((Math.log((r-c4)/c3)-c2)/c1).toString();
	this.cdlGPSlider.value = ((Math.log((g-c4)/c3)-c2)/c1).toString();
	this.cdlBPSlider.value = ((Math.log((b-c4)/c3)-c2)/c1).toString();
	this.cdlSyncL();
}
LUTTweaksBox.prototype.cdlUpdateS = function(channel,slider) {
	var s,S;
	var val,sli;
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	switch (channel) {
		case 0:	val = this.cdlRSVal;
				sli = this.cdlRSSlider;
				break;
		case 1:	val = this.cdlGSVal;
				sli = this.cdlGSSlider;
				break;
		case 2:	val = this.cdlBSVal;
				sli = this.cdlBSSlider;
				break;
	}
	if (slider) {
		s = sli.value;
		S = (c3*Math.exp((c1*parseFloat(s))+c2)) + c4;
	} else {
		s = val.value;
		S = parseFloat(s);
		if (isNaN(S)) {
			s = sli.value;
			S = (c3*Math.exp((c1*parseFloat(s))+c2)) + c4;
		} else if (S < 0) {
			s = '0';
			S = 0;
		}
	}
	val.value = S.toString();
	sli.value = ((Math.log((S-c4)/c3)-c2)/c1).toString();
	this.cdlSyncL();
}
LUTTweaksBox.prototype.cdlUpdateO = function(channel,slider) {
	var o,O;
	var val,sli;
	switch (channel) {
		case 0:	val = this.cdlROVal;
				sli = this.cdlROSlider;
				break;
		case 1:	val = this.cdlGOVal;
				sli = this.cdlGOSlider;
				break;
		case 2:	val = this.cdlBOVal;
				sli = this.cdlBOSlider;
				break;
	}
	if (slider) {
		o = sli.value;
	} else {
		o = val.value;
		if (isNaN(parseFloat(o))) {
			o = sli.value;
		}
	}
	val.value = o;
	sli.value = o;
	this.cdlSyncL();
}
LUTTweaksBox.prototype.cdlUpdateP = function(channel,slider) {
	var p,P;
	var val,sli;
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	switch (channel) {
		case 0:	val = this.cdlRPVal;
				sli = this.cdlRPSlider;
				break;
		case 1:	val = this.cdlGPVal;
				sli = this.cdlGPSlider;
				break;
		case 2:	val = this.cdlBPVal;
				sli = this.cdlBPSlider;
				break;
	}
	if (slider) {
		p = sli.value;
		P = (c3*Math.exp((c1*parseFloat(p))+c2)) + c4;
	} else {
		p = val.value;
		P = parseFloat(p);
		if (isNaN(P)) {
			p = sli.value;
			P = (c3*Math.exp((c1*parseFloat(p))+c2)) + c4;
		} else if (P < 0) {
			p = '0';
			P = 0;
		}
	}
	val.value = P.toString();
	sli.value = ((Math.log((P-c4)/c3)-c2)/c1).toString();
	this.cdlSyncL();
}
LUTTweaksBox.prototype.cdlResetSat = function() {
	this.cdlSatSlider.value = '1';
	this.cdlSatVal.value = '1';
}
LUTTweaksBox.prototype.cdlResetS = function() {
	this.cdlLSSlider.value = '1';
	this.cdlLSVal.value = '1';
	this.cdlRSSlider.value = '1';
	this.cdlRSVal.value = '1';
	this.cdlGSSlider.value = '1';
	this.cdlGSVal.value = '1';
	this.cdlBSSlider.value = '1';
	this.cdlBSVal.value = '1';
}
LUTTweaksBox.prototype.cdlResetO = function() {
	this.cdlLOSlider.value = '0';
	this.cdlLOVal.value = '0';
	this.cdlROSlider.value = '0';
	this.cdlROVal.value = '0';
	this.cdlGOSlider.value = '0';
	this.cdlGOVal.value = '0';
	this.cdlBOSlider.value = '0';
	this.cdlBOVal.value = '0';
}
LUTTweaksBox.prototype.cdlResetP = function() {
	this.cdlLPSlider.value = '1';
	this.cdlLPVal.value = '1';
	this.cdlRPSlider.value = '1';
	this.cdlRPVal.value = '1';
	this.cdlGPSlider.value = '1';
	this.cdlGPVal.value = '1';
	this.cdlBPSlider.value = '1';
	this.cdlBPVal.value = '1';
}
//
// *** False Colour ***
//		Build UI
LUTTweaksBox.prototype.falseColour = function() {
	this.fcBox.setAttribute('class','graybox');
	this.fcBox.appendChild(document.createElement('label').appendChild(document.createTextNode('False Colour')));
	this.fcCheck.setAttribute('type','checkbox');
	this.fcBox.appendChild(this.fcCheck);

	var purpleBox = document.createElement('div');
	purpleBox.setAttribute('class','whitebox');
	purpleBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Purple - Black Clip')));
	this.fcPurpleCheck.setAttribute('type','checkbox');
	this.fcPurpleCheck.checked = true;
	purpleBox.appendChild(this.fcPurpleCheck);
	purpleBox.style.display = 'block';
	this.fcWindow.appendChild(purpleBox);

	var blueBox = document.createElement('div');
	blueBox.setAttribute('class','whitebox');
	blueBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Blue - Just Above Black Clip')));
	this.fcBlueCheck.setAttribute('type','checkbox');
	this.fcBlueCheck.checked = true;
	blueBox.appendChild(this.fcBlueCheck);
	blueBox.appendChild(document.createElement('br'));
	this.fcBlueInput.setAttribute('type','number');
	this.fcBlueInput.setAttribute('step','any');
	this.fcBlueInput.setAttribute('class','ireinput');
	this.fcBlueInput.value = '6.1';
	blueBox.appendChild(this.fcBlueInput);
	blueBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops Below 18% Gray')));
	blueBox.style.display = 'block';
	this.fcWindow.appendChild(blueBox);

	var greenBox = document.createElement('div');
	greenBox.setAttribute('class','whitebox');
	greenBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Green - 18% Mid Gray')));
	this.fcGreenCheck.setAttribute('type','checkbox');
	this.fcGreenCheck.checked = true;
	greenBox.appendChild(this.fcGreenCheck);
	greenBox.style.display = 'block';
	this.fcWindow.appendChild(greenBox);

	var pinkBox = document.createElement('div');
	pinkBox.setAttribute('class','whitebox');
	pinkBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Pink - One Stop Over Mid Gray')));
	this.fcPinkCheck.setAttribute('type','checkbox');
	this.fcPinkCheck.checked = true;
	pinkBox.appendChild(this.fcPinkCheck);
	pinkBox.style.display = 'block';
	this.fcWindow.appendChild(pinkBox);

	var orangeBox = document.createElement('div');
	orangeBox.setAttribute('class','whitebox');
	orangeBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Orange - 90% White')));
	this.fcOrangeCheck.setAttribute('type','checkbox');
	this.fcOrangeCheck.checked = false;
	orangeBox.appendChild(this.fcOrangeCheck);
	orangeBox.style.display = 'block';
	this.fcWindow.appendChild(orangeBox);

	var yellowBox = document.createElement('div');
	yellowBox.setAttribute('class','whitebox');
	yellowBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Yellow - Just Below White Clip')));
	this.fcYellowCheck.setAttribute('type','checkbox');
	this.fcYellowCheck.checked = true;
	yellowBox.appendChild(this.fcYellowCheck);
	yellowBox.appendChild(document.createElement('br'));
	this.fcYellowInput.setAttribute('type','number');
	this.fcYellowInput.setAttribute('step','any');
	this.fcYellowInput.setAttribute('class','ireinput');
	this.fcYellowInput.value = '0.26';
	yellowBox.appendChild(this.fcYellowInput);
	yellowBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops Below White Clip')));
	yellowBox.style.display = 'block';
	this.fcWindow.appendChild(yellowBox);

	var redBox = document.createElement('div');
	redBox.setAttribute('class','whitebox');
	redBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Red - White Clip')));
	this.fcRedCheck.setAttribute('type','checkbox');
	this.fcRedCheck.checked = true;
	redBox.appendChild(this.fcRedCheck);
	redBox.style.display = 'block';
	this.fcWindow.appendChild(redBox);

	this.fcBox.appendChild(this.fcWindow);
	this.toggleFalseColourCheck();
}
//		Set Up Data
//		Event Responses
LUTTweaksBox.prototype.toggleFalseColourCheck = function() {
	if (this.fcCheck.checked) {
		this.fcWindow.style.display = 'block';
	} else {
		this.fcWindow.style.display = 'none';
	}
}
LUTTweaksBox.prototype.changeFalseColourBlue = function() {
	if (!isNaN(parseFloat(this.fcBlueInput.value)) && isFinite(this.fcBlueInput.value)) {
		if (parseFloat(this.fcBlueInput.value)<1) {
			this.fcBlueInput.value = '1';
		}
	} else {
		this.fcBlueInput.value = '6.1';
	}
}
LUTTweaksBox.prototype.changeFalseColourYellow = function() {
	if (!isNaN(parseFloat(this.fcYellowInput.value)) && isFinite(this.fcYellowInput.value)) {
		 if (parseFloat(this.fcYellowInput.value)<0.0001) {
			this.fcYellowInput.value = '0.0001';
		 } else if (parseFloat(this.fcYellowInput.value)>3) {
			this.fcYellowInput.value = '3';
		 }
	} else {
		this.fcYellowInput.value = '0.26';
	}
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
