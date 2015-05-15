/* lutgammabox.js
* Transfer curve and colour space conversion (Gamma and Gamut) options UI object for the LUTCalc Web App.
* 9th January 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTGammaBox(fieldset,inputs,message) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.message = message;
	this.p = 2;
	this.message.addUI(this.p,this);
	this.gamutPass = 0;
	this.gamutLA = 0;
	this.inGammaSelect = document.createElement('select');
	this.inputs.addInput('inGamma',this.inGammaSelect);
	this.inLinSelect = document.createElement('select');
	this.inputs.addInput('inLinGamma',this.inLinSelect);
	this.inGamutSelect = document.createElement('select');
	this.inputs.addInput('inGamut',this.inGamutSelect);
	this.outGammaSelect = document.createElement('select');
	this.inputs.addInput('outGamma',this.outGammaSelect);
	this.outLinSelect = document.createElement('select');
	this.inputs.addInput('outLinGamma',this.outLinSelect);
	this.outGamutSelect = document.createElement('select');
	this.inputs.addInput('outGamut',this.outGamutSelect);
	this.buildBox();
	fieldset.appendChild(this.box);
}
// Construct the UI Box
LUTGammaBox.prototype.buildBox = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Recorded Gamma')));
	this.box.appendChild(this.inGammaSelect);
	this.box.appendChild(document.createElement('br'));
	this.inLin = document.createElement('div');
	this.inLin.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	this.inLin.appendChild(this.inLinSelect);
	this.box.appendChild(this.inLin);
	this.inGamutBox = document.createElement('div');
	this.inGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Recorded Gamut')));
	this.inGamutBox.appendChild(this.inGamutSelect);
	this.box.appendChild(this.inGamutBox);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Output Gamma')));
	this.box.appendChild(this.outGammaSelect);
	this.box.appendChild(document.createElement('br'));
	this.outLin = document.createElement('div');
	this.outLin.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	this.outLin.appendChild(this.outLinSelect);
	this.box.appendChild(this.outLin);
	this.outGamutBox = document.createElement('div');
	this.outGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Output Gamut')));
	this.outGamutBox.appendChild(this.outGamutSelect);
	this.box.appendChild(this.outGamutBox);
	this.inLin.style.display = 'none';
	this.inGamutBox.style.display = 'none';
	this.outLin.style.display = 'none';
	this.outGamutBox.style.display = 'none';
}
// Set Up Data
LUTGammaBox.prototype.gotGammaLists = function(inList,outList,linList) {
	this.inGammaSelect.length = 0;
	this.outGammaSelect.length = 0;
	this.inLinSelect.length = 0;
	this.outLinSelect.length = 0;
	var max = inList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = inList[i].idx;
		option.appendChild(document.createTextNode(inList[i].name));
		this.inGammaSelect.appendChild(option);
	}
	max = outList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = outList[i].idx;
		option.appendChild(document.createTextNode(outList[i].name));
		this.outGammaSelect.appendChild(option);
	}
	max = linList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		var option2 = document.createElement('option');
		option.value = linList[i].idx;
		option2.value = linList[i].idx;
		option.appendChild(document.createTextNode(linList[i].name));
		option2.appendChild(document.createTextNode(linList[i].name));
		this.inLinSelect.appendChild(option);
		this.outLinSelect.appendChild(option2);
	}
}
LUTGammaBox.prototype.gotGamutLists = function(inList,outList,pass,LA) {
	max = inList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = inList[i].idx;
		option.appendChild(document.createTextNode(inList[i].name));
		this.inGamutSelect.appendChild(option);
	}
	max = outList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = outList[i].idx;
		option.appendChild(document.createTextNode(outList[i].name));
		this.outGamutSelect.appendChild(option);
	}
	this.gamutPass = pass;
	this.gamutLA = LA;
}
LUTGammaBox.prototype.defaultGam = function() {
	var max = this.inGammaSelect.length;
	var defGamma = this.inputs.defGammaIn;
	for (var i = 0; i < max; i++) {
		if (defGamma === this.inGammaSelect.options[i].lastChild.nodeValue) {
			this.inGammaSelect.options[i].selected = true;
			break;
		}
	}
	max = this.inGamutSelect.length;
	var defGamut = this.inputs.defGamutIn;
	for (var i = 0; i < max; i++) {
		if (defGamut === this.inGamutSelect.options[i].lastChild.nodeValue) {
			this.inGamutSelect.options[i].selected = true;
			break;
		}
	}
}
// Event Responses
LUTGammaBox.prototype.changeGammaIn = function() {
	if (this.inGammaSelect.options[this.inGammaSelect.options.selectedIndex].value === '9999') {
		this.inLin.style.display = 'block';
	} else {
		this.inLin.style.display = 'none';
	}
}
LUTGammaBox.prototype.changeGammaOut = function() {
	if (this.outGammaSelect.options[this.outGammaSelect.options.selectedIndex].value == '9999') {
		this.outLin.style.display = 'block';
	} else {
		this.outLin.style.display = 'none';
	}
}
LUTGammaBox.prototype.changeInGamut = function() {
	if (this.inGamutSelect.options[this.inGamutSelect.options.length - 1].selected) {
		var max = this.outGamutSelect.options.length;
		for (var i=0; i<max; i++) {
			if (this.outGamutSelect.options[i].value == this.gamutPass) {
				this.outGamutSelect.options[i].selected = true;
				break;
			}
		}
	} else if (this.outGamutSelect.options[this.outGamutSelect.options.selectedIndex].value == this.gamutPass) {
		this.outGamutSelect.options[0].selected = true;
	}
}
LUTGammaBox.prototype.changeOutGamut = function() {
	if (this.outGamutSelect.options[this.outGamutSelect.options.selectedIndex].value == this.gamutPass) {
		this.inGamutSelect.options[this.inGamutSelect.options.length - 1].selected = true;
	} else if (this.inGamutSelect.options[this.inGamutSelect.options.length - 1].selected) {
		var max = this.inGamutSelect.length;
		var defGamut = this.inputs.defGamutIn;
		for (var i = 0; i < max; i++) {
			if (defGamut === this.inGamutSelect.options[i].lastChild.nodeValue) {
				this.inGamutSelect.options[i].selected = true;
				break;
			}
		}
	}
}
LUTGammaBox.prototype.oneOrThree = function() {
	if (this.inputs.d[0].checked) {
		this.inGamutBox.style.display = 'none';
		this.outGamutBox.style.display = 'none';
	} else {
		this.inGamutBox.style.display = 'block';
		this.outGamutBox.style.display = 'block';
	}
}
LUTGammaBox.prototype.getInfo = function(info) {
	if (this.inGammaSelect.options[this.inGammaSelect.selectedIndex].value !== '9999') {
		info.inGammaName = this.inGammaSelect.options[this.inGammaSelect.selectedIndex].lastChild.nodeValue;
	} else {
		info.inGammaName = this.inLinSelect.options[this.inLinSelect.selectedIndex].lastChild.nodeValue;
	}
	if (this.outGammaSelect.options[this.outGammaSelect.selectedIndex].value !== '9999') {
		info.outGammaName = this.outGammaSelect.options[this.outGammaSelect.selectedIndex].lastChild.nodeValue;
	} else {
		info.outGammaName = this.outLinSelect.options[this.outLinSelect.selectedIndex].lastChild.nodeValue;
	}
	if (this.outGammaSelect.options[this.outGammaSelect.selectedIndex].lastChild.nodeValue === 'Null') {
		info.nul = true;
	} else {
		info.nul = false;
	}
	info.inGamutName = this.inGamutSelect.options[this.inGamutSelect.selectedIndex].lastChild.nodeValue;
	info.outGamutName = this.outGamutSelect.options[this.outGamutSelect.selectedIndex].lastChild.nodeValue;
}
