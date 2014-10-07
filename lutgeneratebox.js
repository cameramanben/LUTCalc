function LUTGenerateBox(fieldset, inputs, gammas, gamuts, file) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.gammas = gammas;
	this.gamuts = gamuts;
	this.file = file;
	this.genButton = document.createElement('input');
	this.genButton.setAttribute('type','button');
	this.genButton.value = 'Generate LUT';
	this.box.appendChild(this.genButton);
	fieldset.id = 'genbutton';
	fieldset.appendChild(this.box);
}
LUTGenerateBox.prototype.prepVars = function() {
	this.name = this.inputs.name.value;
	if (this.inputs.d[0].checked) {
		this.oneD = true;
	} else {
		this.oneD = false;
	}
	var max = this.inputs.dimension.length;
	for (var i =0; i < max; i++) {
		if (this.inputs.dimension[i].checked) {
			this.dimension = parseInt(this.inputs.dimension[i].value);
			break;
		}
	}
	this.cineEI = parseFloat(this.inputs.stopShift.value);
	this.gammaInName = this.gammas.gammas[this.gammas.curIn].name;
	if (this.gammas.gammas[this.gammas.curIn].cat === 1) {
		this.gammaInName += ' - ' + this.gammas.gammas[this.gammas.curIn].gamma;
	}
	this.gammaOutName = this.gammas.gammas[this.gammas.curOut].name;
	if (this.gammas.gammas[this.gammas.curOut].cat === 1) {
		this.gammaOutName += ' - ' + this.gammas.gammas[this.gammas.curOut].gamma;
	}
	if (this.gammas.gammas[this.gammas.curOut].cat === 3) {
		this.nul = true;
	} else {
		this.nul = false;
	}
	if (this.inputs.mlutCheck.checked) {
		this.mlut = true;
	} else {
		this.mlut = false;
	}
	this.gamuts.updateCur();
	this.gamutInName = this.gamuts.inGamuts[this.gamuts.curIn].name;
	this.gamutOutName = this.gamuts.outGamuts[this.gamuts.curOut].name;
	if (this.inputs.tweaks.checked) {
		this.doTweaks = true;
	} else {
		this.doTweaks = false;
	}
	if (this.doTweaks && this.inputs.tweakHGCheck.checked) {
		this.doHG = true;
		this.gamutHGName = this.gamuts.outGamuts[this.gamuts.curHG].name;
	} else {
		this.doHG = false;
	}
	if (this.doTweaks && this.inputs.tweakBlkCheck.checked) {
		this.blackLevel = parseFloat(this.inputs.tweakBlk.value);
	} else {
		this.blackLevel = this.gammas.baseIreOut(0);
	}
	if (this.inputs.inRange[0].checked) {
		this.legalIn = true;
	} else {
		this.legalIn = false;
	}
	if (this.inputs.outRange[0].checked) {
		this.legalOut = true;
	} else {
		this.legalOut = false;
	}
	this.credit = 'Created with LUTCalc ' + this.inputs.version + ' by Ben Turley ' + this.inputs.date;
}
LUTGenerateBox.prototype.generate = function() {
	this.prepVars();
	if (this.inputs.d[0].checked) {
		this.file.save(this.header() + this.oneDLUT(), 'cube');
	} else {
		this.file.save(this.header() + this.threeDLUT(), 'cube');
	}
}
LUTGenerateBox.prototype.oneDLUT = function() {
	var dimension = 1024;
	var max = this.inputs.dimension.length;
	for (var i=0; i<max; i++) {
		if (this.inputs.dimension[i].checked) {
			dimension = parseInt(this.inputs.dimension[i].value);
			break;
		}
	}
	var out = '';
	var range = 0;
	if (this.inputs.inRange[0].checked) {
		range += 1;
	}
	if (this.inputs.outRange[0].checked) {
		range += 2;
	}
	for (var i=0; i<dimension; i++) {
	var input = parseFloat(i)/(dimension-1);
		var output;
		switch(range) {
			case 0: output = this.gammas.dataOut(this.gammas.dataIn(input) * this.gammas.eiMult).toFixed(10).toString();
					break;
			case 1: output = this.gammas.dataOut(this.gammas.legalIn(input) * this.gammas.eiMult).toFixed(10).toString();
					break;
			case 2: output = this.gammas.legalOut(this.gammas.dataIn(input) * this.gammas.eiMult).toFixed(10).toString();
					break;
			case 3: output = this.gammas.legalOut(this.gammas.legalIn(input) * this.gammas.eiMult).toFixed(10).toString();
					break;
		}
		out += output + ' ' + output + ' ' + output + "\n";
	}
	return out;
}
LUTGenerateBox.prototype.threeDLUT = function() {
	var dimension = 33;
	var max = this.inputs.dimension.length;
	for (var i=0; i<max; i++) {
		if (this.inputs.dimension[i].checked) {
			dimension = parseFloat(this.inputs.dimension[i].value);
			break;
		}
	}
	var out = '';
	var range = 0;
	if (this.inputs.inRange[0].checked) {
		range += 1;
	}
	if (this.inputs.outRange[0].checked) {
		range += 2;
	}
	var max = Math.pow(dimension,3);
	var dim2 = Math.pow(dimension,2);
	for (var i=0; i<max; i++) {
		var input = [(i % dimension)/(dimension-1),
					 (parseInt(i/dimension) % dimension)/(dimension-1),
					 (parseInt(i/dim2) % dimension)/(dimension-1)];
		var output;
		switch(range) {
			case 0: output = this.fixedString(this.gammas.dataOutRGB(this.gamuts.outCalc(this.eiMult(this.gamuts.inCalc(this.gammas.dataInRGB(input))))));
					break;
			case 1: output = this.fixedString(this.gammas.dataOutRGB(this.gamuts.outCalc(this.eiMult(this.gamuts.inCalc(this.gammas.legalInRGB(input))))));
					break;
			case 2: output = this.fixedString(this.gammas.legalOutRGB(this.gamuts.outCalc(this.eiMult(this.gamuts.inCalc(this.gammas.dataInRGB(input))))));
					break;
			case 3: output = this.fixedString(this.gammas.legalOutRGB(this.gamuts.outCalc(this.eiMult(this.gamuts.inCalc(this.gammas.legalInRGB(input))))));
					break;
		}
		out += output[0] + ' ' + output[1] + ' ' + output[2] + "\n";
	}
	return out;
}
LUTGenerateBox.prototype.fixedString = function(rgb) {
	return [rgb[0].toFixed(10).toString(),
			rgb[1].toFixed(10).toString(),
			rgb[2].toFixed(10).toString()];
}
LUTGenerateBox.prototype.eiMult = function(rgb) {
	return [rgb[0] * this.gammas.eiMult,
			rgb[1] * this.gammas.eiMult,
			rgb[2] * this.gammas.eiMult];
}
LUTGenerateBox.prototype.header = function() {
	var out = 'TITLE "' + this.name + '"' + "\n";
	if (this.oneD) {
		out += 'LUT_1D_SIZE ' + this.dimension.toString() + "\n";
	} else {
		out += 'LUT_3D_SIZE ' + this.dimension.toString() + "\n";
	}
	if (this.nul) {
		out += '# Null LUT';
	} else {
		out += '# ';
		if (this.mlut) {
			out += 'MLUT - *** Clipped To 0-1.0947 *** - ';
		}
		if (this.oneD) {
			out += this.gammaInName + ' -> ' + this.gammaOutName;
		} else if (this.doHG) {
			out += this.gammaInName + '/' + this.gamutInName + ' -> ' + this.gammaOutName + '/' + this.gamutOutName + '(' + this.gamutHGName + ' in the highlights)';
		} else {
			out += this.gammaInName + '/' + this.gamutInName + ' -> ' + this.gammaOutName + '/' + this.gamutOutName;
		}
		out += ', CineEI Shift ' + this.cineEI.toFixed(2).toString();
		out += ', Black Level ' + this.blackLevel.toFixed(2).toString() + '% IRE';
		if (this.legalIn) {
			out += ', Legal Input -> ';
		} else {
			out += ', Data Input -> ';
		}
		if (this.legalOut) {
			out += 'Legal Output';
		} else {
			out += 'Data Output';
		}
	}
	out += ' - ' + this.credit + "\n";
	return out;
}
