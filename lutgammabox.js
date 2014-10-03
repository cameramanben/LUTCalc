function LUTGammaBox(fieldset,inputs,gammas,gamuts) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.gammas = gammas;
	this.gamuts = gamuts;
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
	this.options();
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
LUTGammaBox.prototype.options = function() {
	var max = this.gammas.inList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gammas.inList[i].idx;
		option.appendChild(document.createTextNode(this.gammas.inList[i].name));
		this.inGammaSelect.appendChild(option);
	}
	max = this.gammas.outList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gammas.outList[i].idx;
		option.appendChild(document.createTextNode(this.gammas.outList[i].name));
		this.outGammaSelect.appendChild(option);
	}
	max = this.gammas.linList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		var option2 = document.createElement('option');
		option.value = this.gammas.linList[i].idx;
		option2.value = this.gammas.linList[i].idx;
		option.appendChild(document.createTextNode(this.gammas.linList[i].name));
		option2.appendChild(document.createTextNode(this.gammas.linList[i].name));
		this.inLinSelect.appendChild(option);
		this.outLinSelect.appendChild(option2);
	}
	max = this.gamuts.inList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gamuts.inList[i].idx;
		option.appendChild(document.createTextNode(this.gamuts.inList[i].name));
		this.inGamutSelect.appendChild(option);
	}
	max = this.gamuts.outList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gamuts.outList[i].idx;
		option.appendChild(document.createTextNode(this.gamuts.outList[i].name));
		this.outGamutSelect.appendChild(option);
	}
}
LUTGammaBox.prototype.defaultGam = function() {
	var max = this.gammas.inList.length;
	var defGamma = this.inputs.defGammaIn;
	for (var i = 0; i < max; i++) {
		if (defGamma == this.gammas.inList[i].name) {
			this.inGammaSelect.options[i].selected = true;
			break;
		}
	}
	max = this.gamuts.inList.length;
	var defGamut = this.inputs.defGamutIn;
	for (var i = 0; i < max; i++) {
		if (defGamut == this.gamuts.inList[i].name) {
			this.inGamutSelect.options[i].selected = true;
			break;
		}
	}
}
// Event Responses
LUTGammaBox.prototype.changeGammaIn = function() {
	if (this.inGammaSelect.options[this.inGammaSelect.options.selectedIndex].value == '9999') {
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
		this.outGamutSelect.options[this.outGamutSelect.options.length - 1].selected = true;
	} else if (this.outGamutSelect.options[this.outGamutSelect.options.length - 1].selected) {
		this.outGamutSelect.options[0].selected = true;
	}
}
LUTGammaBox.prototype.changeOutGamut = function() {
	if (this.outGamutSelect.options[this.outGamutSelect.options.length - 1].selected) {
		this.inGamutSelect.options[this.inGamutSelect.options.length - 1].selected = true;
	} else if (this.inGamutSelect.options[this.inGamutSelect.options.length - 1].selected) {
		max = this.gamuts.inList.length;
		var defGamut = this.inputs.defGamutIn;
		for (var i = 0; i < max; i++) {
			if (defGamut == this.gamuts.inList[i].name) {
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
