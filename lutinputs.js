function LUTInputs() {
}
LUTInputs.prototype.addInput = function(inputName,inputValue) {
	try {
		this[inputName] = inputValue;
		return true;
	} catch(err) {
		return false;
	}
}
