/* lutgeneratebox.js
* 'Generate' button UI object and LUT construction code for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTGenerateBox(fieldset, inputs, message, file) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.message = message;
	this.p = 5;
	this.message.addUI(this.p,this);
	this.lT = 0;
	this.dimension = 0;
	this.lut;
	this.file = file;
	this.gamutInName = '';
	this.gamutOutName = '';
	this.gamutHGName = '';
	this.baseIRE = 0;
	this.genButton = document.createElement('input');
	this.genButton.setAttribute('type','button');
	this.genButton.value = 'Generate LUT';
	this.box.appendChild(this.genButton);
	fieldset.id = 'genbutton';
	fieldset.appendChild(this.box);
}
LUTGenerateBox.prototype.getBox = function() {
	return { box: this.box, button: this.genButton };
}
LUTGenerateBox.prototype.gotBaseIRE = function(baseIRE) {
	this.baseIRE = baseIRE;
}
LUTGenerateBox.prototype.getInfo = function() {
	var info = {};
	this.message.getInfo(info);
	return info;
}
LUTGenerateBox.prototype.prepVars = function() {
//	this.name = this.inputs.name.value;
//	if (this.inputs.d[0].checked) {
//		this.oneD = true;
//	} else {
//		this.oneD = false;
//	}
//	var max = this.inputs.dimension.length;
//	for (var i =0; i < max; i++) {
//		if (this.inputs.dimension[i].checked) {
//			this.dimension = parseInt(this.inputs.dimension[i].value);
//			break;
//		}
//	}
//	this.cineEI = parseFloat(this.inputs.stopShift.value);
//	if (this.inputs.inGamma.options[this.inputs.inGamma.selectedIndex].value !== '9999') {
//		this.gammaInName = this.inputs.inGamma.options[this.inputs.inGamma.selectedIndex].lastChild.nodeValue;
//	} else {
//		this.gammaInName = this.inputs.inLinGamma.options[this.inputs.inLinGamma.selectedIndex].lastChild.nodeValue;
//	}
//	if (this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value !== '9999') {
//		this.gammaOutName = this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue;
//	} else {
//		this.gammaOutName = this.inputs.outLinGamma.options[this.inputs.outLinGamma.selectedIndex].lastChild.nodeValue;
//	}
//	if (this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue === 'Null') {
//		this.nul = true;
//	} else {
//		this.nul = false;
//	}
//	if (this.inputs.mlutCheck.checked) {
//		this.mlut = true;
//	} else {
//		this.mlut = false;
//	}
//	if (this.inputs.clipCheck.checked) {
//		this.hardClip = true;
//	} else {
//		this.hardClip = false;
//	}
//	if (this.inputs.tweaks.checked) {
//		this.doTweaks = true;
//	} else {
//		this.doTweaks = false;
//	}
//	this.gamutInName = this.inputs.inGamut.options[this.inputs.inGamut.selectedIndex].lastChild.nodeValue;
//	this.gamutOutName = this.inputs.outGamut.options[this.inputs.outGamut.selectedIndex].lastChild.nodeValue;
//	this.gamutHGName = this.inputs.tweakHGSelect.options[this.inputs.tweakHGSelect.selectedIndex].lastChild.nodeValue;
//	if (this.doTweaks && this.inputs.tweakHGCheck.checked) {
//		this.doHG = true;
//	} else {
//		this.doHG = false;
//	}
//	if (this.doTweaks && this.inputs.tweakBlkCheck.checked) {
//		this.blackLevel = parseFloat(this.inputs.tweakBlk.value);
//	} else {
//		this.blackLevel = this.baseIRE;
//	}
//	if (this.inputs.inRange[0].checked) {
//		this.legalIn = true;
//	} else {
//		this.legalIn = false;
//	}
//	if (this.inputs.outRange[0].checked) {
//		this.legalOut = true;
//	} else {
//		this.legalOut = false;
//	}
//	this.credit = 'Created with LUTCalc ' + this.inputs.version + ' by Ben Turley ' + this.inputs.date;
}
LUTGenerateBox.prototype.generate = function() {
	if (this.inputs.d[0].checked) {
		this.oneDLUT();
	} else {
		this.threeDLUT();
	}
}
LUTGenerateBox.prototype.oneDLUT = function() {
	this.dimension = 1024;
	var max = this.inputs.dimension.length;
	for (var i=0; i<max; i++) {
		if (this.inputs.dimension[i].checked) {
			this.dimension = parseInt(this.inputs.dimension[i].value);
			break;
		}
	}
	this.lut = new Float64Array(((this.dimension)*3));
	var chunks = 2;
	var chunk = parseInt(this.dimension / chunks);
	for (var j=0; j<chunks; j++) {
		var start = chunk*j;
		if ((start + chunk) > this.dimension) {
			this.message.gaTx(this.p,1,{start: start,vals: (this.dimension-start),dim: this.dimension});
		} else {
			this.message.gaTx(this.p,1,{start: start,vals: chunk,dim: this.dimension});
		}
	}
}
LUTGenerateBox.prototype.threeDLUT = function() {
	this.dimension = 33;
	var max = this.inputs.dimension.length;
	for (var i=0; i<max; i++) {
		if (this.inputs.dimension[i].checked) {
			this.dimension = parseInt(this.inputs.dimension[i].value);
			break;
		}
	}
	var chunks = this.dimension;
	var chunk = this.dimension * this.dimension;
	this.lut = new Float64Array(chunk*chunks*3);
	for (var j=0; j<chunks; j++) {
		var R = 0;
		var G = 0;
		var B = j;
		this.message.gaTx(this.p,3,{R:R, G:G, B:B, vals:chunk, dim:this.dimension});
	}
}
LUTGenerateBox.prototype.got1D = function(d) {
	var o = new Float64Array(d.o);
	this.lut.set(o, d.start*3);
	this.lT += d.vals;
	if (this.lT === this.dimension) {
		this.lT = 0;
		this.output();
	}
}
LUTGenerateBox.prototype.got3D = function(d) {
	var o = new Float64Array(d.o);
	this.lut.set(o, d.vals*d.B*3);
	this.lT++;
	if (this.lT === this.dimension) {
		this.lT = 0;
		this.output();
	}
}
LUTGenerateBox.prototype.output = function() {
		var max = this.lut.length / 3;
		var d = '';
		for (var j=0; j<max; j++) {
			d += this.lut[(j*3)].toFixed(6).toString() + ' ' + this.lut[(j*3)+1].toFixed(6).toString() + ' ' + this.lut[(j*3)+2].toFixed(6).toString() + "\n";
		}
		this.file.save(this.header() + d, this.inputs.name.value, 'cube');
}
LUTGenerateBox.prototype.fixedString = function(rgb) {
	return [parseFloat(rgb[0]).toFixed(10).toString(),
			parseFloat(rgb[1]).toFixed(10).toString(),
			parseFloat(rgb[2]).toFixed(10).toString()];
}
LUTGenerateBox.prototype.header = function() {
	var info = this.getInfo();
	var out = 'TITLE "' + info.name + '"' + "\n";
	if (info.oneD) {
		out += 'LUT_1D_SIZE ' + this.dimension.toString() + "\n";
	} else {
		out += 'LUT_3D_SIZE ' + this.dimension.toString() + "\n";
	}
	if (info.nul) {
		out += '# Null LUT';
	} else {
		out += '# ';
		if (info.mlut) {
			out += 'MLUT - *** Clipped To 0-1.0947 *** - ';
		}
		if (info.doFC) {
			out += '*** FALSE COLOUR - DO NOT BAKE IN *** ';
		}
		if (info.oneD) {
			out += info.inGammaName + ' -> ' + info.outGammaName;
		} else if (this.doHG) {
			out += info.inGammaName + '/' + info.inGamutName + ' -> ' + info.outGammaName + '/' + info.outGamutName + '(' + info.hgGamutName + ' in the highlights)';
		} else {
			out += info.inGammaName + '/' + info.inGamutName + ' -> ' + info.outGammaName + '/' + info.outGamutName;
		}
		out += ', CineEI Shift ' + info.cineEI.toFixed(2).toString();
		out += ', Black Level ' + info.blackLevel + '% IRE';
		if (info.legalIn) {
			out += ', Legal Input -> ';
		} else {
			out += ', Data Input -> ';
		}
		if (info.legalOut) {
			out += 'Legal Output';
		} else {
			out += 'Data Output';
		}
	}
	out += ' - ' + 'Created with LUTCalc ' + info.version + ' by Ben Turley ' + info.date + "\n";
	return out;
}
