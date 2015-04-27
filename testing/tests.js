function LUTTests(inputs) {
	this.inputs = inputs;
	this.inputs.addInput('isTrans',false);
	this.runTests();
}
LUTTests.prototype.runTests = function() {
	this.isAppTest();
	this.isLETest();
}
LUTTests.prototype.isAppTest = function() { // Test for native app bridges
	if (typeof window.lutCalcApp != 'undefined') {
    	lutInputs.addInput('isApp',true);
	} else {
    	lutInputs.addInput('isApp',false);
	}
}
LUTTests.prototype.isLETest = function() { // Test system endianness
	if ((new Int8Array(new Int16Array([1]).buffer)[0]) > 0) {
		lutInputs.addInput('isLE', true);
	} else {
		lutInputs.addInput('isLE', false);
	}
}
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
}
