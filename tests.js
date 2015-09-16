function LUTTests(inputs) {
	this.inputs = inputs;
	this.inputs.addInput('isTrans',false);
	this.runTests();
}
LUTTests.prototype.runTests = function() {
	this.isAppTest();
	this.isChromeAppTest();
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
