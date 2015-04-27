/* lutcamerabox.js
* Camera and ISO options UI object for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTCameraBox(fieldset, inputs, message) {
	this.inputs = inputs;
	this.message = message;
	this.message.addUI(1,this);
	this.box = document.createElement('fieldset');
	this.cameras = [];
	this.cameraList();
	this.current = 0;
	this.cameraSelect = document.createElement('select');
	this.cameraOptions();
	this.cameraSelect.options[this.current].selected = true;
	this.inputs.addInput('camera',this.cameraSelect);
	this.cameraType = document.createElement('input');
	this.inputs.addInput('cameraType',this.cameraType);
	this.nativeLabel = document.createElement('label');
	this.inputs.addInput('nativeISO',this.nativeLabel);
	this.cineeiInput = document.createElement('input');
	this.inputs.addInput('cineEI',this.cineeiInput);
	this.shiftInput = document.createElement('input');
	this.inputs.addInput('stopShift',this.shiftInput);
	this.inputs.addInput('defGammaIn',this.cameras[this.current].defgamma);
	this.inputs.addInput('defGamutIn',this.cameras[this.current].defgamut);
	this.buildBox();
	fieldset.appendChild(this.box);
}
// Construct the UI Box
LUTCameraBox.prototype.buildBox = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Camera')));
	this.box.appendChild(this.cameraSelect);
	this.cameraType.setAttribute('type','hidden');
	this.cameraType.value = this.cameras[this.current].type.toString();
	this.box.appendChild(this.cameraType);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Native ISO:')));
	this.nativeLabel.innerHTML = this.cameras[this.current].iso.toString();
	this.box.appendChild(this.nativeLabel);
	this.recorded = document.createElement('div');
	this.cineeiLabel = document.createElement('label');
	this.cineeiLabel.innerHTML = 'CineEI ISO';
	this.recorded.appendChild(this.cineeiLabel);
	this.cineeiInput.setAttribute('type','number');
	this.cineeiInput.setAttribute('class','isoinput');
	this.cineeiInput.value = this.cameras[this.current].iso.toString();
	this.recorded.appendChild(this.cineeiInput);
	this.box.appendChild(this.recorded);
	this.shifted = document.createElement('div');
	this.shifted.appendChild(document.createElement('label').appendChild(document.createTextNode('Stop Correction')));
	this.shiftInput.setAttribute('type','number');
	this.shiftInput.setAttribute('step','any');
	this.shiftInput.setAttribute('class','shiftinput');
	this.shiftInput.value = '0';
	this.shifted.appendChild(this.shiftInput);
	this.box.appendChild(this.shifted);
}
// Set Up Data
LUTCameraBox.prototype.cameraList = function() {
// Type: 0 == CineEI, 1 == Variable Parameters (Arri), 2 == Baked In Gain (Canon)
	this.cameras.push({make:"Sony",model:"PMW-F55",iso:1250,type:0,defgamma:"S-Log3",defgamut:"S-Gamut3.cine"});
	this.cameras.push({make:"Sony",model:"PMW-F5",iso:2000,type:0,defgamma:"S-Log3",defgamut:"S-Gamut3.cine"});
	this.cameras.push({make:"Sony",model:"PXW-FS7",iso:2000,type:0,defgamma:"S-Log3",defgamut:"S-Gamut3.cine"});
	this.cameras.push({make:"Sony",model:"a7s",iso:3200,type:2,defgamma:"S-Log2",defgamut:"S-Gamut"});
	this.cameras.push({make:"Sony",model:"PMW-F3",iso:800,type:0,defgamma:"S-Log",defgamut:"S-Gamut"});
	this.cameras.push({make:"Sony",model:"F35",iso:500,type:0,defgamma:"S-Log",defgamut:"S-Gamut"});
	this.cameras.push({make:"Arri",model:"Alexa / Amira",iso:800,type:1,defgamma:"LogC (Sup 3.x & 4.x)",defgamut:"Alexa Wide Gamut"});
	this.cameras.push({make:"Canon",model:"C300",iso:850,type:2,defgamma:"C-Log",defgamut:"Canon CP Lock Gamut"});
}
LUTCameraBox.prototype.cameraOptions = function() {
	var max = this.cameras.length;
	for (var i=0; i<max; i++) {
		var option = document.createElement('option');
		option.value = i;
		option.appendChild(document.createTextNode(this.cameras[i].make + ' ' + this.cameras[i].model));
		this.cameraSelect.appendChild(option);
	}
}
// Event Responses
LUTCameraBox.prototype.changeCamera = function() {
	this.current = this.cameraSelect.options.selectedIndex;
	this.inputs.defGammaIn = this.cameras[this.current].defgamma;
	this.inputs.defGamutIn = this.cameras[this.current].defgamut;
	this.nativeLabel.innerHTML = this.cameras[this.current].iso.toString();
	this.cineeiInput.value = this.cameras[this.current].iso.toString();
	this.shiftInput.value = '0';
	this.cameraType.value = this.cameras[this.current].type.toString();
	if (this.cameras[this.current].type === 2) {
		this.recorded.style.display = 'none';
		this.shifted.style.display = 'block';
	} else if (this.cameras[this.current].type === 1) {
		this.recorded.style.display = 'block';
		this.shifted.style.display = 'block';
		this.cineeiLabel.innerHTML = 'Recorded ISO';
	} else {
		this.recorded.style.display = 'block';
		this.shifted.style.display = 'block';
		this.cineeiLabel.innerHTML = 'CineEI ISO';
	}
	this.cameraType.value = this.cameras[this.current].type;
}
LUTCameraBox.prototype.changeCineEI = function(){
	if (/^([1-9]\d*)$/.test(this.cineeiInput.value)) {
	} else {
		this.cineeiInput.value = this.cameras[this.current].iso.toString();
	}
	if (this.cameras[this.current].type === 0) {
		var stopShift = (Math.log(parseFloat(this.cineeiInput.value)/parseFloat(this.nativeLabel.innerHTML))/Math.LN2);
		this.shiftInput.value = stopShift.toFixed(4).toString();
	}
}
LUTCameraBox.prototype.changeShift = function() {
	if (!isNaN(parseFloat(this.shiftInput.value)) && isFinite(this.shiftInput.value)) {
	} else {
		this.shiftInput.value = '0';
	}
	if (this.cameras[this.current].type === 0) {
		this.cineeiInput.value = Math.round((Math.pow(2,parseFloat(this.shiftInput.value)))*parseFloat(this.nativeLabel.innerHTML)).toString();
	}

}
LUTCameraBox.prototype.getInfo = function(info) {
	info.camera = this.cameraSelect.options[this.cameraSelect.selectedIndex].lastChild.nodeValue;
	info.cineEI = parseFloat(this.shiftInput.value);
}
