/* lutinputs.js
* Simple object for sharing form inputs between objects in the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
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
var lutInputs = new LUTInputs();
