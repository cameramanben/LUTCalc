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
	lutBox = new LUTLutBox(fieldSet(right,true), lutInputs, lutMessage, lutFormats);
	lutGenerate = new LUTGenerateBox(fieldSet(right,false), lutInputs, lutMessage, lutFile, lutFormats);
	lutPreview = new LUTPreview(fieldSet(right,true), lutInputs, lutMessage, lutFile);
	lutPreview.uiExternal(lutGenerate.getBox());
	lutInfoBox = new LUTInfoBox(fieldSet(right,true),lutInputs, lutMessage);
	document.getElementById('main').appendChild(modalBox);
	modalBox.className = 'modalbox';
	// Set Up Data
	lutMessage.gaTx(0,5,{});
	lutMessage.gtTx(0,5,{});
	lutMessage.gtTx(0,11,{});
	lutGammaBox.oneOrThree();
	// Set Up Events
	window.onresize = function(){
		maxHeights();
	};
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
function lutcalcReady(p) {
	if (lutInputs.isReady(p)) {
		lutFormats.events();
		lutCameraBox.events();
		lutGammaBox.events();
		lutTweaksBox.events();
		lutBox.events();
		lutGenerate.events();
		lutPreview.events();
		lutInfoBox.events();
		splash.style.display = 'none';
		modalBox.className = 'modalbox-hide';
		lutMessage.setReady();
		lutMessage.gtSetParams();
		lutMessage.gaSetParams();
	}
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
function notifyUser(title,message) {
	if (lutInputs.canChromeNotify) {
		chrome.notifications.create(
			'lutcalc-' + Math.random().toString(),
			{
				type: 'basic',
				iconUrl: 'img/logo64.png',
				title: title,
				message: message,
				priority: 0
			},
			function(id) {
				timer = setTimeout(function(){
					chrome.notifications.clear(id);
				}, 2500);
			}
		);
	}
}
