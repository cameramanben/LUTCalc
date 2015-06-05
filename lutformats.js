/* lutformats.js
* General LUT file format building / parsing object for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTFormats(inputs, messages, file) {
	this.inputs = inputs;
	this.messages = messages;
	this.file = file;
	this.formats = [];
	this.types = [];
	this.exts = [];
	this.mluts = [];
	this.grades = [];
	this.formatsList();
	this.mlutsList();
	this.gradesList();
	this.io();
}
LUTFormats.prototype.io = function() {
	this.inputs.addInput('laCube', new lacubeLUT(this.messages, this.inputs.isLE));
	this.inputs.addInput('laBin', new labinLUT(this.messages, this.inputs.isLE));
	var gradeSelect = document.createElement('select');
	var max = this.grades.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j;
		option.appendChild(document.createTextNode(this.grades[j].title));
		gradeSelect.appendChild(option);
	}
	gradeSelect.className = 'lut-opt';
	this.inputs.addInput('gradeSelect', gradeSelect);
	var mlutSelect = document.createElement('select');
	max = this.mluts.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j;
		option.appendChild(document.createTextNode(this.mluts[j].title));
		mlutSelect.appendChild(option);
	}
	mlutSelect.className = 'lut-opt-hide';
	this.inputs.addInput('mlutSelect', mlutSelect);
	this.inputs.addInput('bClip', 0);
	this.inputs.addInput('wClip', 67025937); // 1023 * 65519 (the largest integer representable with a 16-bit half float)
}
LUTFormats.prototype.formatsList = function() {
	this.addFormat('cube','cube',new cubeLUT(this.messages, this.inputs.isLE));
	this.addFormat('vlt','vlt',new vltLUT(this.messages, this.inputs.isLE));
	this.addFormat('ilut','ilut',new davinciiLUT(this.messages, this.inputs.isLE));
	this.addFormat('olut','olut',new davincioLUT(this.messages, this.inputs.isLE));
}
LUTFormats.prototype.addFormat = function(type,ext,format) {
	this.types.push(type);
	this.exts.push(ext);
	this.formats.push(format);
}
LUTFormats.prototype.gradesList = function() {
	this.grades.push({
		title: 'General cube LUT', type: 'cube',
		oneD: true, threeD: true, defThree: true,
		oneDim: [1024,4096], threeDim: [17,33,65],
		defDim: 33,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		bClip: 0, wClip: 67025937
	});
	this.grades.push({
		title: 'DaVinci Resolve cube', type: 'cube',
		oneD: true, threeD: true, defThree: true,
		oneDim: [1024,4096], threeDim: [17,33,65],
		defDim: 65,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		bClip: 0, wClip: 67025937
	});
	this.grades.push({
		title: 'Lumetri / Speedgrade cube', type: 'cube',
		oneD: true, threeD: true, defThree: true,
		oneDim: [1024,4096], threeDim: [17,33,65],
		defDim: 65,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: false,
		bClip: 0, wClip: 67025937
	});
	this.grades.push({
		title: 'DaVinci Resolve 1D ilut', type: 'ilut',
		oneD: true, threeD: false, defThree: false,
		oneDim: [16384], threeDim: [],
		defDim: 16384,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		bClip: 0, wClip: 67025937
	});
	this.grades.push({
		title: 'DaVinci Resolve 1D olut', type: 'olut',
		oneD: true, threeD: false, defThree: false,
		oneDim: [4096], threeDim: [],
		defDim: 4096,
		legIn: true, datIn: true, defLegIn: true,
		legOut: true, datOut: true, defLegOut: true,
		bClip: 0, wClip: 1023
	});
	var max = this.grades.length;
	var max2 = this.types.length;
	for (var j=0; j<max; j++) {
		for (var k=0; j<max2; k++) {
			if (this.grades[j].type === this.types[k]) {
				this.grades[j].idx = k;
				break;
			}
		}
	}
}
LUTFormats.prototype.mlutsList = function() {
	this.mluts.push({
		title: 'Sony User 3D MLUT', type: 'cube',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [17,33],
		defDim: 33,
		legIn: false, datIn: true, defLegIn: false,
		legOut: true, datOut: false, defLegOut: true,
		bClip: 64, wClip: 1023
	});
/*
	this.mluts.push({
		title: 'Varicam 3D MLUT', type: 'vlt',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [17],
		defDim: 17,
		legIn: false, datIn: true, defLegIn: false,
		legOut: false, datOut: true, defLegOut: false,
		bClip: 0, wClip: 1023
	});
*/
	var max = this.mluts.length;
	var max2 = this.types.length;
	for (var j=0; j<max; j++) {
		for (var k=0; j<max2; k++) {
			if (this.mluts[j].type === this.types[k]) {
				this.mluts[j].idx = k;
				break;
			}
		}
	}
}
LUTFormats.prototype.validExts = function() {
	return this.exts.slice(0);
}

LUTFormats.prototype.gradeMLUT = function() {
	if (this.inputs.lutUsage[0].checked) {
		this.inputs.gradeSelect.className = 'lut-opt';
		this.inputs.mlutSelect.className = 'lut-opt-hide';
	} else {
		this.inputs.gradeSelect.className = 'lut-opt-hide';
		this.inputs.mlutSelect.className = 'lut-opt';
	}
	this.updateOptions();
}
LUTFormats.prototype.updateOptions = function() {
	var cur;
	if (this.inputs.lutUsage[0].checked) {
		var idx = parseInt(this.inputs.gradeSelect.options[this.inputs.gradeSelect.selectedIndex].value)
		cur = this.grades[idx];
	} else {
		var idx = parseInt(this.inputs.mlutSelect.options[this.inputs.mlutSelect.selectedIndex].value)
		cur = this.mluts[idx];
	}
	// 1D or 3D
	this.inputs.d[0].disabled = !cur.oneD;
	this.inputs.d[1].disabled = !cur.threeD;
	if (cur.defThree) {
		this.inputs.oneDBox.className = 'graybox-hide';
		this.inputs.threeDBox.className = 'graybox';
		this.inputs.d[1].checked = true;
	} else {
		this.inputs.oneDBox.className = 'graybox';
		this.inputs.threeDBox.className = 'graybox-hide';
		this.inputs.d[0].checked = true;
	}
	// 1D size options
	var dim;	
	this.inputs.dimension[0].className = 'lut-opt-hide';
	this.inputs.dimensionLabel[0].className = 'lut-opt-hide';
	this.inputs.dimension[1].className = 'lut-opt-hide';	
	this.inputs.dimensionLabel[1].className = 'lut-opt-hide';
	if (cur.oneDim.length > 0) {
		dim = cur.oneDim[0].toString()
		this.inputs.dimension[0].value = dim;
		if (cur.defDim === cur.oneDim[0]) {
			this.inputs.dimension[0].checked = true;
		}
		this.inputs.dimensionLabel[0].removeChild(this.inputs.dimensionLabel[0].firstChild);
		this.inputs.dimensionLabel[0].appendChild(document.createTextNode(dim));
		this.inputs.dimension[0].className = 'lut-opt';
		this.inputs.dimensionLabel[0].className = 'lut-opt';
	}
	if (cur.oneDim.length === 2) {
		dim = cur.oneDim[1].toString()
		this.inputs.dimension[1].value = dim;
		if (cur.defDim === cur.oneDim[1]) {
			this.inputs.dimension[1].checked = true;
		}
		this.inputs.dimensionLabel[1].removeChild(this.inputs.dimensionLabel[1].firstChild);
		this.inputs.dimensionLabel[1].appendChild(document.createTextNode(dim));
		this.inputs.dimension[1].className = 'lut-opt';
		this.inputs.dimensionLabel[1].className = 'lut-opt';
	}
	// 3D size options
	this.inputs.dimension[2].className = 'lut-opt-hide';
	this.inputs.dimensionLabel[2].className = 'lut-opt-hide';
	this.inputs.dimension[3].className = 'lut-opt-hide';	
	this.inputs.dimensionLabel[3].className = 'lut-opt-hide';	
	this.inputs.dimension[4].className = 'lut-opt-hide';	
	this.inputs.dimensionLabel[4].className = 'lut-opt-hide';
	if (cur.threeDim.length > 0) {
		dim = cur.threeDim[0].toString();
		this.inputs.dimension[2].value = dim;
		if (cur.defDim === cur.threeDim[0]) {
			this.inputs.dimension[2].checked = true;
		}
		this.inputs.dimensionLabel[2].removeChild(this.inputs.dimensionLabel[2].firstChild);
		this.inputs.dimensionLabel[2].appendChild(document.createTextNode(dim + 'x' + dim + 'x' + dim));
		this.inputs.dimension[2].className = 'lut-opt';
		this.inputs.dimensionLabel[2].className = 'lut-opt';
	}
	if (cur.threeDim.length > 1) {
		dim = cur.threeDim[1].toString();
		this.inputs.dimension[3].value = dim;
		if (cur.defDim === cur.threeDim[1]) {
			this.inputs.dimension[3].checked = true;
		}
		this.inputs.dimensionLabel[3].removeChild(this.inputs.dimensionLabel[3].firstChild);
		this.inputs.dimensionLabel[3].appendChild(document.createTextNode(dim + 'x' + dim + 'x' + dim));
		this.inputs.dimension[3].className = 'lut-opt';
		this.inputs.dimensionLabel[3].className = 'lut-opt';
	}
	if (cur.threeDim.length === 3) {
		dim = cur.threeDim[2].toString();
		this.inputs.dimension[4].value = dim;
		if (cur.defDim === cur.threeDim[2]) {
			this.inputs.dimension[4].checked = true;
		}
		this.inputs.dimensionLabel[4].removeChild(this.inputs.dimensionLabel[4].firstChild);
		this.inputs.dimensionLabel[4].appendChild(document.createTextNode(dim + 'x' + dim + 'x' + dim));
		this.inputs.dimension[4].className = 'lut-opt';
		this.inputs.dimensionLabel[4].className = 'lut-opt';
	}
	// Input range
	this.inputs.inRange[0].disabled = !cur.legIn;
	this.inputs.inRange[1].disabled = !cur.datIn;
	if (cur.defLegIn) {
		this.inputs.inRange[0].checked = true;
	} else {
		this.inputs.inRange[1].checked = true;
	}
	// Output range
	this.inputs.outRange[0].disabled = !cur.legOut;
	this.inputs.outRange[1].disabled = !cur.datOut;
	if (cur.defLegOut) {
		this.inputs.outRange[0].checked = true;
	} else {
		this.inputs.outRange[1].checked = true;
	}
	// Check if input and output range can match for log or null output
	var curOut = parseInt(this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value);
	if (curOut === 9999) {
		curOut = parseInt(this.inputs.outLinGamma.options[this.inputs.outLinGamma.selectedIndex].value);
	}
	if (this.inputs.gammaCatList[curOut] === 0 || this.inputs.gammaCatList[curOut] === 3) {
		if (this.inputs.inRange[1].checked && cur.datOut) {
			this.inputs.outRange[1].checked = true;
		} else if (cur.legOut) {
			this.inputs.outRange[0].checked = true;
		}
	}
	// Set black clip and white clip levels for the format
	this.inputs.bClip = cur.bClip;
	this.inputs.wClip = cur.wClip;
}
LUTFormats.prototype.resetOptions = function() {
	// 1D or 3D
	this.inputs.d[0].disabled = false;
	this.inputs.d[1].disabled = false;
	this.inputs.d[1].checked = true;
	// 1D size options
	this.inputs.dimension[0].value = '1024';
	this.inputs.dimension[0].className = 'lut-opt';
	this.inputs.dimensionLabel[0].removeChild(this.inputs.dimensionLabel[0].firstChild);
	this.inputs.dimensionLabel[0].appendChild(document.createTextNode('1024'));
	this.inputs.dimensionLabel[0].className = 'lut-opt';
	this.inputs.dimension[1].value = '4096';
	this.inputs.dimension[1].className = 'lut-opt';
	this.inputs.dimensionLabel[1].removeChild(this.inputs.dimensionLabel[1].firstChild);
	this.inputs.dimensionLabel[1].appendChild(document.createTextNode('4096'));
	this.inputs.dimensionLabel[1].className = 'lut-opt';
	// 3D size options
	this.inputs.dimension[2].value = '17';
	this.inputs.dimension[2].className = 'lut-opt';
	this.inputs.dimensionLabel[2].removeChild(this.inputs.dimensionLabel[2].firstChild);
	this.inputs.dimensionLabel[2].appendChild(document.createTextNode('17x17x17'));
	this.inputs.dimensionLabel[2].className = 'lut-opt';
	this.inputs.dimension[3].value = '33';
	this.inputs.dimension[3].checked = true;
	this.inputs.dimension[3].className = 'lut-opt';
	this.inputs.dimensionLabel[3].removeChild(this.inputs.dimensionLabel[3].firstChild);
	this.inputs.dimensionLabel[3].appendChild(document.createTextNode('33x33x33'));
	this.inputs.dimensionLabel[3].className = 'lut-opt';
	this.inputs.dimension[4].value = '65';
	this.inputs.dimension[4].className = 'lut-opt';
	this.inputs.dimensionLabel[4].removeChild(this.inputs.dimensionLabel[4].firstChild);
	this.inputs.dimensionLabel[4].appendChild(document.createTextNode('65x65x65'));
	this.inputs.dimensionLabel[4].className = 'lut-opt';
	// Input Range
	this.inputs.inRange[0].disabled = false;
	this.inputs.inRange[1].disabled = false;
	this.inputs.inRange[1].checked = true;
	// Output Range
	this.inputs.outRange[0].disabled = false;
	this.inputs.outRange[1].disabled = false;
	var curOut = parseInt(this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value);
	if (curOut === 9999) {
		curOut = parseInt(this.inputs.outLinGamma.options[this.inputs.outLinGamma.selectedIndex].value);
	}
	if (this.inputs.gammaCatList[curOut] === 0 || this.inputs.gammaCatList[curOut] === 3) {
		this.inputs.outRange[1].checked = true;
	} else {
		this.inputs.outRange[0].checked = true;
	}
	// Set black clip and white clip levels for the format
	this.inputs.bClip = cur.bClip;
	this.inputs.wClip = cur.wClip;
}

LUTFormats.prototype.output = function(buff) {
	var idx;
	if (this.inputs.lutUsage[0].checked) {
		idx = this.grades[parseInt(this.inputs.gradeSelect.options[this.inputs.gradeSelect.selectedIndex].value)].idx;
	} else {
		idx = this.mluts[parseInt(this.inputs.mlutSelect.options[this.inputs.mlutSelect.selectedIndex].value)].idx;
	}
	var out = this.formats[idx].build(buff);
	if (out !== '') {
		this.file.save(out, this.inputs.name.value, this.exts[idx]);
	}
}
LUTFormats.prototype.build = function(type,buff) {
	var max = this.types.length;
	for (var j=0; j<max; j++) {
		if (this.types[j] === type) {
			return this.formats[j].build(buff);
		}
	}
	return false;
}
LUTFormats.prototype.parse = function(ext, title, text, lut) {
	var max = this.types.length;
	for (var j=0; j<max; j++) {
		if (this.exts[j] === ext) {
			return this.formats[j].parse(title, text, lut);
		}
	}
	return false;
}
