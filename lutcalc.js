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
// Declare variables
var titFootHeight,
	lutCalcForm,
	lutTests,
	lutMessage,
	lutFile,
	left,
	lutCameraBox,
	lutTweaksBox,
	right,
	lutPreview,
	lutBox,
	lutGenerate,
	lutInfoBox;
document.addEventListener("DOMContentLoaded", function() {
// return window.lutCalcApp.logOSX('started');
	// Housekeeping
	titFootHeight = parseInt(document.getElementById('titlebar').clientHeight) + parseInt(document.getElementById('footer').clientHeight);
	lutCalcForm = document.getElementById('lutcalcform');
	// Browser feature tests
	lutTests = new LUTTests(lutInputs);
	// Build UI
	lutMessage = new LUTMessage(lutInputs);
	lutTests.isTransTest(lutMessage.getWorker());
	lutFile = new LUTFile(lutInputs);
	lutFormats = new LUTFormats(lutInputs, lutMessage, lutFile);
	document.getElementById('version').appendChild(document.createTextNode(lutInputs.version));
	// Create HTML Structure
	left = fieldSet(lutCalcForm,false,'left');
	lutCameraBox = new LUTCameraBox(fieldSet(left,true), lutInputs, lutMessage);
	lutGammaBox = new LUTGammaBox(fieldSet(left,true), lutInputs, lutMessage);
	lutTweaksBox = new LUTTweaksBox(fieldSet(left,true), lutInputs, lutMessage, lutFile, lutFormats);
	right = fieldSet(lutCalcForm,false,'right');
	lutPreview = new LUTPreview(fieldSet(right,true), lutInputs, lutMessage, lutFile);
	lutBox = new LUTLutBox(fieldSet(right,true), lutInputs, lutMessage, lutFormats);
	lutGenerate = new LUTGenerateBox(fieldSet(right,false), lutInputs, lutMessage, lutFile, lutFormats);
	lutPreview.uiExternal(lutGenerate.getBox(),lutBox.getFieldSet());
	lutInfoBox = new LUTInfoBox(fieldSet(right,true),lutInputs, lutMessage);
	// Set Up Data
	lutMessage.gaTx(0,5,{});
	lutMessage.gtTx(0,5,{});
	lutMessage.gtTx(0,11,{});
	lutGammaBox.oneOrThree();
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
	//		Formats
	lutInputs.lutUsage[0].onclick = function(){
		lutFormats.gradeMLUT();
		lutGammaBox.oneOrThree();
		lutTweaksBox.toggleTweaks();
		lutMessage.gaSetParams();
	}
	lutInputs.lutUsage[1].onclick = function(){
		lutFormats.gradeMLUT();
		lutGammaBox.oneOrThree();
		lutTweaksBox.toggleTweaks();
		lutMessage.gaSetParams();
	}
	lutInputs.gradeSelect.onchange = function(){
		lutFormats.updateOptions();
		lutGammaBox.oneOrThree();
		lutTweaksBox.toggleTweaks();
		lutMessage.gaSetParams();
	}
	lutInputs.mlutSelect.onchange = function(){
		lutFormats.updateOptions();
		lutGammaBox.oneOrThree();
		lutTweaksBox.toggleTweaks();
		lutMessage.gaSetParams();
	}
	//		LUT Box
	lutInputs.name.onchange = function(){
		lutBox.cleanName();
		lutFile.filename();
	}
	lutInputs.clipCheck.onchange = function(){
		lutMessage.gaSetParams();
	}
	lutInputs.d[0].onchange = function(){
		lutFormats.oneOrThree();
		lutGammaBox.oneOrThree();
		lutTweaksBox.toggleTweaks();
		lutMessage.gtSetParams();
		lutMessage.gaSetParams();
	}
	lutInputs.d[1].onchange = function(){
		lutFormats.oneOrThree();
		lutGammaBox.oneOrThree();
		lutTweaksBox.toggleTweaks();
		lutMessage.gtSetParams();
		lutMessage.gaSetParams();
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
	lutInputs.scaleMin.oninput = function(){
		lutMessage.gaSetParams();
	}
	lutInputs.scaleMax.oninput = function(){
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
	lutInfoBox.gammaInfoBut.onclick = function(){
		lutInfoBox.gammaInfoOpt();
	}
	lutInfoBox.gammaChartBut.onclick = function(){
		lutInfoBox.gammaChartOpt();
	}
	window.onresize = function(){
		maxHeights();
	}
});
// Window resize adjustments
function maxHeights() {
	var winHeight = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;
	var mainHeight = winHeight - titFootHeight - 12;
	var camGam = parseInt(lutCameraBox.getHeight()) + parseInt(lutGammaBox.getHeight());
	var tweakHeight = mainHeight - camGam;
	lutTweaksBox.setMaxHeight(tweakHeight);
	if (mainHeight < 420) {
		mainHeight = 420;
	}
	left.style.height = mainHeight.toString() + 'px';
	right.style.height = mainHeight.toString() + 'px';
}
// Helper Functions
function lutcalcReady() {
	splash.style.display = 'none';
}
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
