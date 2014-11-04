/* lutcalc.js
* Master Javascript file for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
// Housekeeping
document.getElementById('javascriptwarning').style.display='none';
var lutCalcForm = document.getElementById('lutcalcform');
var lutInputs = new LUTInputs();
lutInputs.addInput('version','v1.0');
lutInputs.addInput('date','October 2014');
// Test for native app bridges
if (typeof window.lutCalcApp != 'undefined') {
    lutInputs.addInput('isApp',true);
} else {
    lutInputs.addInput('isApp',false);
}
// Build UI
var lutGamut = new LUTGamut(lutInputs);
var lutGamma = new LUTGamma(lutInputs);
var lutFile = new LUTFile(lutInputs);
document.getElementById('version').appendChild(document.createTextNode(lutInputs.version));
// Create HTML Structure
var left = fieldSet(lutCalcForm,false,'left');
var lutCameraBox = new LUTCameraBox(fieldSet(left,true), lutInputs);
lutGamma.defaultGamma();
var lutGammaBox = new LUTGammaBox(fieldSet(left,true), lutInputs, lutGamma, lutGamut);
var lutTweaksBox = new LUTTweaksBox(fieldSet(left,true), lutInputs, lutGamma, lutGamut, lutFile);
var right = fieldSet(lutCalcForm,false,'right');
var lutBox = new LUTLutBox(fieldSet(right,true), lutInputs, lutGamma, lutGamut);
var lutGenerate = new LUTGenerateBox(fieldSet(right,false), lutInputs, lutGamma, lutGamut, lutFile);
var lutInfoBox = new LUTInfoBox(fieldSet(right,true),lutInputs, lutGamma);
lutTweaksBox.toggleTweakCheck();
//	Set Up Form Input Events
//		Camera Box
lutInputs.camera.onchange = function(){lutCameraBox.changeCamera(); lutGamma.defaultGamma(); lutGamma.changeISO(); lutGammaBox.defaultGam();lutTweaksBox.changeGamma();lutBox.changeGamma();lutInfoBox.updateGamma();}
lutInputs.cineEI.onchange = function(){lutCameraBox.changeCineEI(); lutGamma.changeISO();lutInfoBox.updateGamma();}
lutInputs.stopShift.onchange = function(){lutCameraBox.changeShift(); lutGamma.changeShift(); lutGamma.changeISO();lutInfoBox.updateGamma();}
//		Gamma Box
lutInputs.inGamma.onchange = function(){lutGammaBox.changeGammaIn(); lutGamma.changeGamma();lutInfoBox.updateGamma();}
lutInputs.inLinGamma.onchange = function(){lutGammaBox.changeGammaIn(); lutGamma.changeGamma();lutInfoBox.updateGamma();}
lutInputs.outGamma.onchange = function(){lutGammaBox.changeGammaOut(); lutGamma.changeGamma();lutTweaksBox.changeGamma();lutBox.changeGamma();lutInfoBox.updateGamma();}
lutInputs.outLinGamma.onchange = function(){lutGammaBox.changeGammaOut(); lutGamma.changeGamma();lutTweaksBox.changeGamma();lutBox.changeGamma();lutInfoBox.updateGamma();}
lutInputs.inGamut.onchange = function(){lutGammaBox.changeInGamut();}
lutInputs.outGamut.onchange = function(){lutGammaBox.changeOutGamut();}
//		Tweaks Box
lutInputs.tweaks.onchange = function(){ lutTweaksBox.toggleTweakCheck(); }
//			Highlight Gamut Tweak
lutInputs.tweakHGCheck.onchange = function(){ lutTweaksBox.toggleHighGamutCheck(); }
lutInputs.tweakHGLinLog[0].onchange = function(){ lutTweaksBox.toggleHighGamutLinLog(); }
lutInputs.tweakHGLinLog[1].onchange = function(){ lutTweaksBox.toggleHighGamutLinLog(); }
lutInputs.tweakHGLinLow.onchange = function(){ lutTweaksBox.changeHighGamutLinLow(); }
lutInputs.tweakHGLinHigh.onchange = function(){ lutTweaksBox.changeHighGamutLinHigh(); }
lutInputs.tweakHGLow.onchange = function(){ lutTweaksBox.changeHighGamutLogLow(); }
lutInputs.tweakHGHigh.onchange = function(){ lutTweaksBox.changeHighGamutLogHigh(); }
//			Black Level Tweak
lutInputs.tweakBlkCheck.onchange = function(){ lutTweaksBox.toggleBlackLevelCheck();lutInfoBox.updateGamma(); }
lutInputs.tweakBlk.onchange = function(){ lutTweaksBox.changeBlackLevel();lutInfoBox.updateGamma(); }
//			Highlight Level Tweak
lutInputs.tweakHiCheck.onchange = function(){ lutTweaksBox.toggleHighLevelCheck();lutInfoBox.updateGamma(); }
lutInputs.tweakHiRef.onchange = function(){ lutTweaksBox.changeHighLevelRef();lutInfoBox.updateGamma(); }
lutInputs.tweakHiMap.onchange = function(){ lutTweaksBox.changeHighLevelMap();lutInfoBox.updateGamma(); }
//			LUT Analyst Tweak
if (lutInputs.isApp) {
	lutInputs.laFileInput.onclick = function(){ lutTweaksBox.lutAnalystGetFile(); }
} else {
	lutInputs.laFileInput.onchange = function(){ lutTweaksBox.lutAnalystGetFile(); }
}
lutInputs.laGammaSelect.onchange = function(){ lutTweaksBox.lutAnalystChangeGamma(); }
lutInputs.laDoButton.onclick = function(){ lutTweaksBox.lutAnalystDo(); lutGammaBox.changeGammaOut(); lutGamma.changeGamma();lutTweaksBox.changeGamma();lutBox.changeGamma();lutInfoBox.updateGamma();}
lutInputs.laTitle.onchange = function(){ lutTweaksBox.cleanLutAnalystTitle(); }
lutInputs.laBackButton.onclick = function(){ lutTweaksBox.lutAnalystReset(); lutGammaBox.changeGammaOut(); lutGamma.changeGamma();lutTweaksBox.changeGamma();lutBox.changeGamma();lutInfoBox.updateGamma();}
lutInputs.laStoreButton.onclick = function(){ lutTweaksBox.lutAnalystStore(); }
lutInputs.laCheck.onclick = function(){ lutTweaksBox.lutAnalystToggleCheck(); lutGammaBox.changeGammaOut(); lutGamma.changeGamma();lutTweaksBox.changeGamma();lutBox.changeGamma();lutInfoBox.updateGamma();}
//		LUT Box
lutInputs.name.onchange = function(){ lutBox.cleanName(); lutFile.filename(); }
lutInputs.mlutCheck.onchange = function(){ lutBox.toggleMLUT(); lutGammaBox.oneOrThree(); lutTweaksBox.toggleTweakCheck(); }
lutInputs.d[0].onchange = function(){ lutBox.oneOrThree(); lutGammaBox.oneOrThree(); lutTweaksBox.toggleTweakCheck(); }
lutInputs.d[1].onchange = function(){ lutBox.oneOrThree(); lutGammaBox.oneOrThree(); lutTweaksBox.toggleTweakCheck(); }
//		Generate Button
lutGenerate.genButton.onclick = function(){ lutGenerate.generate(); }
//		Info Box
lutInfoBox.instructionsBut.onclick = function(){ lutInfoBox.instructionsOpt(); }
lutInfoBox.changelogBut.onclick = function(){ lutInfoBox.changelogOpt(); }
lutInfoBox.gammaInfoBut.onclick = function(){ lutInfoBox.gammaInfoOpt(); }
lutInfoBox.gammaChartBut.onclick = function(){ lutInfoBox.gammaChartOpt(); }
// Functions available to native apps
function loadLUTFromApp(format, text, destination, parentIdx, next) {
    document.getElementById('testline').innerHTML = format;
	lutInputs[destination].format = format;
	lutInputs[destination].text = text.split(/[\n\u0085\u2028\u2029]|\r\n?/);
	switch (parentIdx) {
		case 7: lutTweaksBox.followUp(next);
				break;
	}
}
function tester(input) {
    document.getElementById('testline').innerHTML = input;
}
// Helper Functions
function fieldSet(parentElement,shadow,id) {
	var box = document.createElement('fieldset');
	if (id) {
		box.id = id;
	}
	if (shadow) {
		box.setAttribute('class','shadowbox');
	}
	parentElement.appendChild(box);
	return box;
}
