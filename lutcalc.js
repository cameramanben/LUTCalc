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
lutInputs.addInput('version','v1.5 beta');
lutInputs.addInput('date','February 2015');
// Test for native app bridges
if (typeof window.lutCalcApp != 'undefined') {
    lutInputs.addInput('isApp',true);
} else {
    lutInputs.addInput('isApp',false);
}
// Build UI
var lutMessage = new LUTMessage(lutInputs);
var lutFile = new LUTFile(lutInputs);
document.getElementById('version').appendChild(document.createTextNode(lutInputs.version));
// Create HTML Structure
var left = fieldSet(lutCalcForm,false,'left');
var lutCameraBox = new LUTCameraBox(fieldSet(left,true), lutInputs, lutMessage);
var lutGammaBox = new LUTGammaBox(fieldSet(left,true), lutInputs, lutMessage);
var lutTweaksBox = new LUTTweaksBox(fieldSet(left,true), lutInputs, lutMessage, lutFile);
var lutAnalyst = new LUTAnalyst(lutInputs, lutMessage);
lutInputs.addInput('lutAnalyst',lutAnalyst);
var right = fieldSet(lutCalcForm,false,'right');
var lutBox = new LUTLutBox(fieldSet(right,true), lutInputs, lutMessage);
var lutGenerate = new LUTGenerateBox(fieldSet(right,false), lutInputs, lutMessage, lutFile);
var lutInfoBox = new LUTInfoBox(fieldSet(right,true),lutInputs, lutMessage);
// Set Up Data
lutMessage.gaTx(0,5,{});
lutMessage.gtTx(0,5,{});
// Set Up Form Input Events
//		Camera Box
lutInputs.camera.onchange = function(){
	lutCameraBox.changeCamera();
	lutGammaBox.defaultGam();
	lutMessage.gaSetParams();
	lutBox.changeGamma();
}
lutInputs.cineEI.onchange = function(){
	lutCameraBox.changeCineEI();
	lutMessage.gaSetParams();
}
lutInputs.stopShift.onchange = function(){
	lutCameraBox.changeShift();
	lutMessage.gaSetParams();
}
//		Gamma Box
lutInputs.inGamma.onchange = function(){
	lutGammaBox.changeGammaIn();
	lutMessage.gaSetParams();
}
lutInputs.inLinGamma.onchange = function(){
	lutGammaBox.changeGammaIn();
	lutMessage.gaSetParams();
}
lutInputs.outGamma.onchange = function(){
	lutGammaBox.changeGammaOut();
	lutBox.changeGamma();
	lutMessage.gaSetParams();
}
lutInputs.outLinGamma.onchange = function(){
	lutGammaBox.changeGammaOut();
	lutBox.changeGamma();
	lutMessage.gaSetParams();
}
lutInputs.inGamut.onchange = function(){
	lutGammaBox.changeInGamut();
	lutMessage.gtSetParams();
}
lutInputs.outGamut.onchange = function(){
	lutGammaBox.changeOutGamut();
	lutMessage.gtSetParams();
}
//		Tweaks Box
lutInputs.tweaks.onchange = function(){
	lutTweaksBox.toggleTweakCheck();
	lutMessage.gaSetParams();
}
//			Highlight Gamut Tweak
lutInputs.tweakHGCheck.onchange = function(){
	lutTweaksBox.toggleHighGamutCheck();
}
lutInputs.tweakHGSelect.onchange = function(){
	lutMessage.gtSetParams();
}
lutInputs.tweakHGLinLog[0].onchange = function(){
	lutTweaksBox.toggleHighGamutLinLog();
}
lutInputs.tweakHGLinLog[1].onchange = function(){
	lutTweaksBox.toggleHighGamutLinLog();
}
lutInputs.tweakHGLinLow.onchange = function(){
	lutTweaksBox.changeHighGamutLinLow();
}
lutInputs.tweakHGLinHigh.onchange = function(){
	lutTweaksBox.changeHighGamutLinHigh();
}
lutInputs.tweakHGLow.onchange = function(){
	lutTweaksBox.changeHighGamutLogLow();
}
lutInputs.tweakHGHigh.onchange = function(){
	lutTweaksBox.changeHighGamutLogHigh();
}
//			Black Level Tweak
lutInputs.tweakBlkCheck.onchange = function(){
	lutTweaksBox.toggleBlackLevelCheck();
	lutMessage.gaSetParams();
}
lutInputs.tweakBlk.onchange = function(){
	lutTweaksBox.changeBlackLevel();
	lutMessage.gaSetParams();
}
//			Highlight Level Tweak
lutInputs.tweakHiCheck.onchange = function(){
	lutTweaksBox.toggleHighLevelCheck();
	lutMessage.gaSetParams();
}
lutInputs.tweakHiRef.onchange = function(){
	lutTweaksBox.changeHighLevelRef();
	lutMessage.gaSetParams();
}
lutInputs.tweakHiMap.onchange = function(){
	lutTweaksBox.changeHighLevelMap();
	lutMessage.gaSetParams();
}
//			LUT Analyst Tweak
if (lutInputs.isApp) {
	lutInputs.laFileInput.onclick = function(){
		lutTweaksBox.lutAnalystGetFile();
	}
} else {
	lutInputs.laFileInput.onchange = function(){
		lutTweaksBox.lutAnalystGetFile();
	}
}
lutInputs.laGammaSelect.onchange = function(){
	lutTweaksBox.lutAnalystChangeGamma();
}
lutInputs.laDoButton.onclick = function(){ 
	lutTweaksBox.lutAnalystDo();
//	lutGammaBox.changeGammaOut();
//	lutMessage.gaSetParams();
//	lutTweaksBox.changeGamma();
//	lutBox.changeGamma();
//	lutInfoBox.updateGamma();
}
lutInputs.laTitle.onchange = function(){
	lutTweaksBox.cleanLutAnalystTitle();
}
lutInputs.laBackButton.onclick = function(){
	lutTweaksBox.lutAnalystReset();
	lutGammaBox.changeGammaOut();
	lutMessage.gaSetParams();
//	lutTweaksBox.changeGamma();
	lutBox.changeGamma();
//	lutInfoBox.updateGamma();
}
lutInputs.laStoreButton.onclick = function(){
	lutTweaksBox.lutAnalystStore();
}
lutInputs.laCheck.onclick = function(){
	lutTweaksBox.lutAnalystToggleCheck();
	lutGammaBox.changeGammaOut();
	lutMessage.gaSetParams();
//	lutTweaksBox.changeGamma();
	lutBox.changeGamma();
//	lutInfoBox.updateGamma();
}
//		LUT Box
lutInputs.name.onchange = function(){
	lutBox.cleanName();
	lutFile.filename();
}
lutInputs.mlutCheck.onchange = function(){
	lutBox.toggleMLUT();
	lutGammaBox.oneOrThree();
	lutTweaksBox.toggleTweakCheck();
}
lutInputs.d[0].onchange = function(){
	lutBox.oneOrThree();
	lutGammaBox.oneOrThree();
	lutTweaksBox.toggleTweakCheck();
}
lutInputs.d[1].onchange = function(){
	lutBox.oneOrThree();
	lutGammaBox.oneOrThree();
	lutTweaksBox.toggleTweakCheck();
}
lutInputs.inRange[0].onchange = function(){
	lutMessage.gaSetParams();
}
lutInputs.inRange[1].onchange = function(){
	lutMessage.gaSetParams();
}
lutInputs.outRange[0].onchange = function(){
	lutMessage.gaSetParams();
}
lutInputs.outRange[1].onchange = function(){
	lutMessage.gaSetParams();
}
//		Generate Button
lutGenerate.genButton.onclick = function(){
	lutGenerate.generate();
}
//		Info Box
lutInfoBox.instructionsBut.onclick = function(){
	lutInfoBox.instructionsOpt();
}
lutInfoBox.chartType[0].onchange = function(){
	lutInfoBox.changeChart();
}
lutInfoBox.chartType[1].onchange = function(){
	lutInfoBox.changeChart();
}
lutInfoBox.chartType[2].onchange = function(){
	lutInfoBox.changeChart();
}
lutInfoBox.changelogBut.onclick = function(){
	lutInfoBox.changelogOpt();
}
lutInfoBox.gammaInfoBut.onclick = function(){
	lutInfoBox.gammaInfoOpt();
}
lutInfoBox.gammaChartBut.onclick = function(){
	lutInfoBox.gammaChartOpt();
}
// Functions available to native apps
function loadLUTFromApp(format, text, destination, parentIdx, next) {
	lutInputs[destination].format = format;
	lutInputs[destination].text = text.split(/[\n\u0085\u2028\u2029]|\r\n?/);
	switch (parseInt(parentIdx)) {
		case 7: lutTweaksBox.followUp(parseInt(next));
				break;
	}
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
