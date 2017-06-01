/* splash.js
* Changes Javascript warning into a splash screen in the LUTCalc Web App.
* Also creates browser feature test and global data objects
* 17th March 2017
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
/************************* LUTInputs *************************/
/*********** Data available globally within LUTCalc **********/
function LUTInputs() {
	this.ready = [true,
		false, // 1 - camerabox
		false, // 2 - gammabox
		false, // 3 - tweaksbox
		false, // 4 - lutbox
		false, // 5 - generatebox
		false, // 6 - infobox
		false, // 7 - LUTAnalyst
		false, // 8 - preview
		false, // 9 - twkHG
		false, // 10 - twkLA
	];
	this.isMobile = false; // Assume not on a mobile until proven otherwise
}
LUTInputs.prototype.addInput = function(inputName,inputValue) {
	try {
		this[inputName] = inputValue;
		return true;
	} catch(err) {
		return false;
	}
};
LUTInputs.prototype.isReady = function(ui) {
	var ready = true;
	var m = this.ready.length;
	for (var j=0; j<m ; j++) {
		if (!this.ready[j]) {
			ready = false;
			break;
		}
	}
	if (ready) { // protect against double responses from message
		return false;
	}
	this.ready[ui] = true;
	ready = true;
	for (var j=0; j<m ; j++) {
		if (!this.ready[j]) {
			ready = false;
			break;
		}
	}
	return ready;
};
/************************** LUTTests *************************/
/******************* Browser feature tests *******************/
function LUTTests(inputs) {
	this.inputs = inputs;
	this.inputs.addInput('isTrans',false);
	this.runTests();
}
LUTTests.prototype.runTests = function() {
	this.isAppTest();
	this.isChromeAppTest();
	this.blobWorkersTest();
	this.canNotifyTest();
	this.isLETest();
};
LUTTests.prototype.isAppTest = function() { // Test for native app bridges
	if (typeof window.lutCalcApp !== 'undefined') {
    	lutInputs.addInput('isApp',true);
	} else {
    	lutInputs.addInput('isApp',false);
	}
};
LUTTests.prototype.isChromeAppTest = function() { // Test for Google Chrome app
	if (typeof chrome !== 'undefined' && typeof chrome.fileSystem !== 'undefined' && typeof chrome.fileSystem.chooseEntry !== 'undefined') {
    	lutInputs.addInput('isChromeApp',true);
	} else {
    	lutInputs.addInput('isChromeApp',false);
	}
};
LUTTests.prototype.blobWorkersTest = function() {
    lutInputs.addInput('blobWorkers',false);
	if (window.Blob && (window.URL || window.webkitURL)) {
		this.inputs.blobWorkers = true;
		var windowURL = window.URL || window.webkitURL;
		var workerString = "addEventListener('message', function(e) { postMessage({blobWorkers:e.data.test}); }, false);";
		workerString = workerString.replace('"use strict";', '');
		try {
			var _this = this;
			var gammaWorkerBlob = new Blob([ workerString ], { type: 'text/javascript' } );
			var blobURL = windowURL.createObjectURL(gammaWorkerBlob);
			this.testWorker = new Worker(blobURL);
			URL.revokeObjectURL(blobURL);
	  		this.testWorker.terminate();
			this.inputs.blobWorkers = true;
/*
			this.testWorker.addEventListener('message', function(e) {
	  			_this.inputs.blobWorkers = e.data.blobWorkers;
	  			_this.testWorker.terminate();
			}, false);
			this.testWorker.postMessage({test:true});
*/
		} catch (e) {
			this.inputs.blobWorkers = false;
		}
	}
};
LUTTests.prototype.canNotifyTest = function() { // Test for HTML5 / Chrome Notifications
	if (typeof chrome !== 'undefined' && typeof chrome.notifications !== 'undefined') {
    	lutInputs.addInput('canChromeNotify',true);
    } else {
    	lutInputs.addInput('canChromeNotify',false);
	}
};
LUTTests.prototype.isLETest = function() { // Test system endianness
	if ((new Int8Array(new Int16Array([1]).buffer)[0]) > 0) {
		lutInputs.addInput('isLE', true);
	} else {
		lutInputs.addInput('isLE', false);
	}
};
LUTTests.prototype.isTransTest = function(worker) { // Test that web workers can use transferrable objects
	var trans;
	try {
		var test = new ArrayBuffer(1);
		worker.postMessage(test, [test]);
		trans = (test.byteLength === 0);
	} catch(error) {
		trans = false;
	}
	this.inputs.isTrans = trans;
};
/******* Modal box to freeze all UI buttons and inputs *******/
var modalBox = document.createElement('div');
modalBox.className = 'modalbox-hide';
modalBox.onclick = function(here){ return function(){
	// Do nothing - stops anything else from happening whilst the modal box is active.
};}(this);
/********************* Splash screen code ********************/
function splashStart() {
	document.getElementById('titlebar').className = 'titlebar-hide';
	document.getElementById('lutcalcform').className = 'lutcalcform-hide';
	document.getElementById('footer').className = 'footer-hide';
	var splash = document.getElementById('javascriptwarning');
	splash.removeChild(splash.firstChild);
	splash.className = 'splash';
	splashTxt(splash);
	return splash;
}
var splashInterval = false;
function splashTxt(splash) {
	var splashText = document.createElement('div');
	var splashTitle =  document.createElement('h1');
	splashTitle.innerHTML = 'LUTCalc ' + lutInputs.version;
	splashText.appendChild(splashTitle);
	splashText.appendChild(document.createElement('br'));
	var splashCredit =  document.createElement('h5');
	splashCredit.innerHTML = 'Ben Turley ' + lutInputs.date;
	splashText.appendChild(splashCredit);
	splash.appendChild(splashText);
	lutInputs.addInput('splashProgress',document.createElement('span'));
	lutInputs.addInput('splashPer',0);
	var progressBox = document.createElement('span');
	progressBox.id = 'splash-progress-box';
	lutInputs.splashProgress.id = 'splash-progress';
	lutInputs.splashProgress.style.width = lutInputs.splashPer.toString() + '%';
	progressBox.appendChild(lutInputs.splashProgress);
	splash.appendChild(progressBox);
	splashInterval = setInterval(updateSplash,10);
}
function splashProg(step) {
	var s;
	if (typeof step === 'undefined') {
		s = 0.25;
	} else {
		s = step;
	}
	lutInputs.splashPer += s;
}
function updateSplash() {
	if (lutInputs.splashPer <= 100) {
		lutInputs.splashProgress.style.width = Math.round(lutInputs.splashPer).toString() + '%';
	} else {
		clearInterval(splashInterval);
		return;
	}
}

/********************** Start things up **********************/
var lutInputs = new LUTInputs();
lutInputs.addInput('version','v3.1');
lutInputs.addInput('date','May 2017');
var splash = splashStart();
var lutTests = new LUTTests(lutInputs);