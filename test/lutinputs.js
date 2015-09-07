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
}
LUTInputs.prototype.addInput = function(inputName,inputValue) {
	try {
		this[inputName] = inputValue;
		return true;
	} catch(err) {
		return false;
	}
}
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
}
var lutInputs = new LUTInputs();
