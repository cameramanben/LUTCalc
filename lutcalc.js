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
var lutCalcForm,
	lutTests,
	lutMessage,
	lutFile,
	left,
	lutCameraBox,
	lutTweaksBox,
	lutAnalyst,
	right,
	lutPreview,
	lutBox,
	lutGenerate,
	lutInfoBox;
document.addEventListener("DOMContentLoaded", function() {
	// Housekeeping
	document.getElementById('javascriptwarning').style.display='none';
	lutCalcForm = document.getElementById('lutcalcform');
	lutInputs.addInput('version','v1.9 beta 2');
	lutInputs.addInput('date','February 2015');
	// Browser feature tests
	lutTests = new LUTTests(lutInputs);
	// Build UI
	lutMessage = new LUTMessage(lutInputs);
	lutTests.isTransTest(lutMessage.getWorker());
	lutFile = new LUTFile(lutInputs);
	document.getElementById('version').appendChild(document.createTextNode(lutInputs.version));
	// Create HTML Structure
	left = fieldSet(lutCalcForm,false,'left');
	lutCameraBox = new LUTCameraBox(fieldSet(left,true), lutInputs, lutMessage);
	lutGammaBox = new LUTGammaBox(fieldSet(left,true), lutInputs, lutMessage);
	lutTweaksBox = new LUTTweaksBox(fieldSet(left,true), lutInputs, lutMessage, lutFile);
	lutAnalyst = new LUTAnalyst(lutInputs, lutMessage);
	lutInputs.addInput('lutAnalyst',lutAnalyst);
	right = fieldSet(lutCalcForm,false,'right');
	lutPreview = new LUTPreview(fieldSet(right,true), lutInputs, lutMessage, lutFile);
	lutBox = new LUTLutBox(fieldSet(right,true), lutInputs, lutMessage);
	lutGenerate = new LUTGenerateBox(fieldSet(right,false), lutInputs, lutMessage, lutFile);
	lutPreview.setUIs(lutGenerate.getBox(),lutBox.getFieldSet());
	lutInfoBox = new LUTInfoBox(fieldSet(right,true),lutInputs, lutMessage);
	// Set Up Data
	lutMessage.gaTx(0,5,{});
	lutMessage.gtTx(0,5,{});
	lutMessage.gtTx(0,11,{});
	lutBox.oneOrThree();
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
	//		Tweaks Box
	lutInputs.tweaks.onchange = function(){
		lutTweaksBox.toggleTweakCheck();
		lutMessage.gaSetParams();
		lutMessage.gtSetParams();
	}
	//			Highlight Gamut Tweak
	lutInputs.tweakHGCheck.onchange = function(){
		lutTweaksBox.toggleHighGamutCheck();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakHGSelect.onchange = function(){
		lutMessage.gtSetParams();
	}
	lutInputs.tweakHGLinLog[0].onchange = function(){
		lutTweaksBox.toggleHighGamutLinLog();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakHGLinLog[1].onchange = function(){
		lutTweaksBox.toggleHighGamutLinLog();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakHGLinLow.onchange = function(){
		lutTweaksBox.changeHighGamutLinLow();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakHGLinHigh.onchange = function(){
		lutTweaksBox.changeHighGamutLinHigh();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakHGLow.onchange = function(){
		lutTweaksBox.changeHighGamutLogLow();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakHGHigh.onchange = function(){
		lutTweaksBox.changeHighGamutLogHigh();
		lutMessage.gtSetParams();
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
	//			Colour Temperature tweakBlk
	lutInputs.tweakTempCheck.onchange = function(){
		lutTweaksBox.toggleTempCheck();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakTempCTSlider.onchange = function(){
		lutTweaksBox.updateTempSlider();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakTempNew.onchange = function(){
		lutTweaksBox.changeNewTemp();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakTempAdvancedCheck.onchange = function(){
		lutTweaksBox.toggleTempAdvancedCheck();
	}
	lutInputs.tweakTempBase.onchange = function(){
		lutTweaksBox.changeBaseTemp();
		lutMessage.gtSetParams();
	}
	lutInputs.tweakTempCATSelect.onchange = function(){
		lutMessage.gtSetParams();
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
	}
	lutInputs.laTitle.onchange = function(){
		lutTweaksBox.cleanLutAnalystTitle();
	}
	lutInputs.laBackButton.onclick = function(){
		lutTweaksBox.lutAnalystReset();
		lutGammaBox.changeGammaOut();
		lutMessage.gaSetParams();
		lutBox.changeGamma();
	}
	lutInputs.laStoreButton.onclick = function(){
		lutTweaksBox.lutAnalystStore(true);
	}
	lutInputs.laStoreBinButton.onclick = function(){
		lutTweaksBox.lutAnalystStore(false);
	}
	lutInputs.laCheck.onclick = function(){
		lutTweaksBox.lutAnalystToggleCheck();
		lutGammaBox.changeGammaOut();
		lutMessage.gaSetParams();
		lutBox.changeGamma();
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
		lutMessage.gaSetParams();
	}
	lutInputs.clipCheck.onchange = function(){
		lutMessage.gaSetParams();
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
	//		Preview Box
	lutInputs.preFileButton.onclick = function(){
		var e = new MouseEvent('click');
		lutInputs.preFileInput.dispatchEvent(e);
	}
	if (lutInputs.isApp) {
		lutInputs.preFileInput.onclick = function(){
			lutPreview.preGetImg();
		}
	} else {
		lutInputs.preFileInput.onchange = function(){
			lutPreview.preGetImg();
		}
	}
	lutInputs.preOK.onclick = function(){
		lutInputs.preBox.style.display = 'none';
		lutPreview.prepPreview();
	}
	lutInputs.preCancel.onclick = function(){
		lutInputs.preBox.style.display = 'none';
	}
	lutInputs.preButton.onclick = function(){
		lutPreview.toggle();
	}
	lutInputs.drButton.onclick = function(){
		lutPreview.toggleDefault();
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
});
// Functions available to native apps
function loadLUTFromApp(format, content, destination, parentIdx, next) {
	lutInputs[destination].format = format;
	if (format.toLowerCase() === 'labin') {
		lutInputs[destination].buff = content;
	} else {
		lutInputs[destination].text = content.split(/[\n\u0085\u2028\u2029]|\r\n?/);
	}
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
