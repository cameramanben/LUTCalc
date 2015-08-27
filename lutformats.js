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
	this.p = 11;
	this.messages.addUI(this.p,this);
	this.file = file;
	this.curIdx = 0;
	this.curType = 0;
	this.formats = [];
	this.types = [];
	this.exts = [];
	this.txt = [];
	this.mluts = [];
	this.grades = [];
	this.lastGamma = -1;
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
LUTFormats.prototype.events = function() {
	this.inputs.lutUsage[0].onclick = function(here){ return function(){
		here.gradeMLUT();
		here.messages.changeFormat();
	};}(this);
	this.inputs.lutUsage[1].onclick = function(here){ return function(){
		here.gradeMLUT();
		here.messages.changeFormat();
	};}(this);
	this.inputs.gradeSelect.onchange = function(here){ return function(){
		here.updateOptions();
		here.messages.changeFormat();
	};}(this);
	this.inputs.mlutSelect.onchange = function(here){ return function(){
		here.updateOptions();
		here.messages.changeFormat();
	};}(this);
}
LUTFormats.prototype.formatsList = function() {
	this.addFormat('cube1','cube',true,new cubeLUT(this.messages, this.inputs.isLE, 1));
	this.addFormat('cube2','cube',true,new cubeLUT(this.messages, this.inputs.isLE, 2));
	this.addFormat('cube3','cube',true,new cubeLUT(this.messages, this.inputs.isLE, 3));
	this.addFormat('vlt','vlt',true,new vltLUT(this.messages, this.inputs.isLE));
	this.addFormat('threedl1','3dl',true,new threedlLUT(this.messages, this.inputs.isLE, 1));
	this.addFormat('threedl2','3dl',true,new threedlLUT(this.messages, this.inputs.isLE, 2));
	this.addFormat('threedl3','3dl',true,new threedlLUT(this.messages, this.inputs.isLE, 3));
	this.addFormat('ilut','ilut',true,new davinciiLUT(this.messages, this.inputs.isLE));
	this.addFormat('olut','olut',true,new davincioLUT(this.messages, this.inputs.isLE));
	this.addFormat('lut','lut',true,new lutLUT(this.messages, this.inputs.isLE));
	this.addFormat('spi1d','spi1d',true,new spi1dLUT(this.messages, this.inputs.isLE));
	this.addFormat('spi3d','spi3d',true,new spi3dLUT(this.messages, this.inputs.isLE));
	this.addFormat('ncp','ncp',false,new ncpLUT(this.messages, this.inputs.isLE));
}
LUTFormats.prototype.addFormat = function(type,ext,txt,format) {
	this.types.push(type);
	this.exts.push(ext);
	this.txt.push(txt);
	this.formats.push(format);
}
LUTFormats.prototype.gradesList = function() {
	this.grades.push({
		title: 'General cube LUT (.cube)', type: 'cube1',
		oneD: true, threeD: true, defThree: true,
		oneDim: [1024,4096], threeDim: [17,33,65],
		defDim: 33,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: false,
		resSDI: false,
		bClip: 0, wClip: 67025937, hard: false
	});
	this.grades.push({
		title: 'DaVinci Resolve (.cube)', type: 'cube2',
		oneD: true, threeD: true, defThree: true,
		oneDim: [1024,4096], threeDim: [17,33,65],
		defDim: 65,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: true,
		setBits: false,
		resSDI: false,
		bClip: -1023, wClip: 67025937, hard: false
	});
	this.grades.push({
		title: 'Lumetri / Speedgrade (.cube)', type: 'cube3',
		oneD: true, threeD: true, defThree: true,
		oneDim: [1024,4096], threeDim: [16,32,64],
		defDim: 65,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: false,
		scaling: true,
		setBits: false,
		resSDI: false,
		bClip: -1023, wClip: 67025937, hard: false
	});
	this.grades.push({
		title: 'DaVinci Resolve 1D (.ilut)', type: 'ilut',
		oneD: true, threeD: false, defThree: false,
		oneDim: [16384], threeDim: [],
		defDim: 16384,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: false,
		resSDI: false,
		bClip: 0, wClip: 67025937, hard: false
	});
	this.grades.push({
		title: 'DaVinci Resolve 1D (.olut)', type: 'olut',
		oneD: true, threeD: false, defThree: false,
		oneDim: [4096], threeDim: [],
		defDim: 4096,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: true,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: false,
		resSDI: false,
		bClip: 0, wClip: 1023, hard: false
	});
	this.grades.push({
		title: 'Assimilate 1D (.lut)', type: 'lut',
		oneD: true, threeD: false, defThree: false,
		oneDim: [4096], threeDim: [],
		defDim: 4096,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: false,
		resSDI: false,
		bClip: 0, wClip: 1023, hard: true
	});
	this.grades.push({
		title: 'Assimilate 3D (.3dl)', type: 'threedl1',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [16,32,64],
		defDim: 32,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: true, inBits: 10, outBits: 12,
		resSDI: false,
		bClip: 0, wClip: 1023, hard: true
	});
	this.grades.push({
		title: 'SPI 3D (.spi3d)', type: 'spi3d',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [16,32,64],
		defDim: 32,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: false,
		resSDI: false,
		bClip: 0, wClip: 67025937, hard: false
	});
	this.grades.push({
		title: 'SPI 1D (.spi1d)', type: 'spi1d',
		oneD: true, threeD: false, defThree: false,
		oneDim: [4096,16384], threeDim: [],
		defDim: 4096,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: true,
		setBits: false,
		resSDI: false,
		bClip: -1023, wClip: 67025937, hard: false
	});
	this.grades.push({
		title: 'Flame 3D (.3dl)', type: 'threedl1',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [17,33,65],
		defDim: 17,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: true, inBits: 10, outBits: 12,
		resSDI: false,
		bClip: 0, wClip: 1023, hard: true
	});
	this.grades.push({
		title: 'Lustre 3D (.3dl)', type: 'threedl2',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [17,33,65],
		defDim: 33,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: true, inBits: 10, outBits: 12,
		resSDI: false,
		bClip: 0, wClip: 1023, hard: true
	});
	this.grades.push({
		title: 'Kodak 3D (.3dl)', type: 'threedl3',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [17,33,65],
		defDim: 17,
		someGammas: false,
		legIn: true, datIn: true, defLegIn: false,
		legOut: true, datOut: true, defLegOut: true,
		scaling: false,
		setBits: true, inBits: 10, outBits: 12,
		resSDI: false,
		bClip: 0, wClip: 1023, hard: true
	});
	var max = this.grades.length;
	var max2 = this.types.length;
	for (var j=0; j<max; j++) {
		for (var k=0; k<max2; k++) {
			if (this.grades[j].type === this.types[k]) {
				this.grades[j].idx = k;
				break;
			}
		}
	}
}
LUTFormats.prototype.mlutsList = function() {
	this.mluts.push({
		title: 'Sony User 3D MLUT (.cube)', type: 'cube1',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [17,33],
		defDim: 33,
		someGammas: false,
		legIn: false, datIn: true, defLegIn: false,
		legOut: true, datOut: false, defLegOut: true,
		scaling: false,
		setBits: false,
		resSDI: 1,
		bClip: 64, wClip: 1019, hard: false
	});
/*
	this.mluts.push({
		title: 'Varicam 3D MLUT (.vlt)', type: 'vlt',
		oneD: false, threeD: true, defThree: true,
		oneDim: [], threeDim: [17],
		defDim: 17,
		someGammas: false,
		legIn: false, datIn: true, defLegIn: false,
		legOut: false, datOut: true, defLegOut: false,
		scaling: false,
		setBits: false,
		resSDI: false,
		bClip: 0, wClip: 1019, hard: true
	});
*/
	this.mluts.push({
		title: 'Nikon Custom Picture (.ncp)', type: 'ncp',
		oneD: true, threeD: false, defThree: false,
		oneDim: [256], threeDim: [],
		defDim: 256,
		someGammas: ['Nikon Standard','Nikon Neutral','Nikon Vivid','Nikon Monochrome','Nikon Portrait','Nikon Landscape'],
		legIn: true, datIn: false, defLegIn: true,
		legOut: true, datOut: false, defLegOut: true,
		scaling: false,
		setBits: false,
		resSDI: false,
		bClip: 64, wClip: 1019, hard: true
	});
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
LUTFormats.prototype.isTxt = function() {
	return this.txt.slice(0);
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
LUTFormats.prototype.oneOrThree = function() {
	var cur;
	if (this.inputs.lutUsage[0].checked) {
		var idx = parseInt(this.inputs.gradeSelect.options[this.inputs.gradeSelect.selectedIndex].value)
		cur = this.grades[idx];
	} else {
		var idx = parseInt(this.inputs.mlutSelect.options[this.inputs.mlutSelect.selectedIndex].value)
		cur = this.mluts[idx];
	}
	// 1D or 3D
	if (this.inputs.d[0].checked) {
		this.inputs.oneDBox.className = 'graybox';
		this.inputs.threeDBox.className = 'graybox-hide';
		if (!cur.defThree) {
			var max = cur.oneDim.length;
			for (var j=0; j<max; j++) {
				if (cur.oneDim[j] === cur.defDim) {
					this.inputs.dimension[j].checked = true;
				}
			}
		} else {
			this.inputs.dimension[cur.oneDim.length-1].checked = true;
		}
	} else {
		this.inputs.oneDBox.className = 'graybox-hide';
		this.inputs.threeDBox.className = 'graybox';
		if (cur.defThree) {
			var max = cur.threeDim.length;
			for (var j=0; j<max; j++) {
				if (cur.threeDim[j] === cur.defDim) {
					this.inputs.dimension[j+2].checked = true;
				}
			}
		} else {
			if (cur.threeDim.length > 1) {
					this.inputs.dimension[3].checked = true;
			} else {
					this.inputs.dimension[2].checked = true;
			}
		}
	}
}
LUTFormats.prototype.updateOptions = function() {
	var curIdx = this.curIdx;
	var changedType = false;
	var cur, idx;
	if (this.inputs.lutUsage[0].checked) {
		if (this.curType === 1) {
			changedType = true;
			this.curType = 0;
		}
		idx = parseInt(this.inputs.gradeSelect.options[this.inputs.gradeSelect.selectedIndex].value)
		cur = this.grades[idx];
	} else {
		if (this.curType === 0) {
			changedType = true;
			this.curType = 1;
		}
		idx = parseInt(this.inputs.mlutSelect.options[this.inputs.mlutSelect.selectedIndex].value)
		cur = this.mluts[idx];
	}
	// Special settings fo particular formats
	if (cur.type === 'ncp') {
		this.inputs.nikonBox.className = 'emptybox';
	} else {
		this.inputs.nikonBox.className = 'emptybox-hide';
	}	
	// Check if all input gamma options are allowed and enable / disable as appropriate
	if (cur.someGammas) {
		var max = this.inputs.inGamma.options.length;
		var max2 = cur.someGammas.length;
		var changeIdx = true;
		var defIdx = 0;
		for (var j=0; j<max; j++) {
			this.inputs.inGamma.options[j].disabled = true;
			this.inputs.inGamma.options[j].style.display = 'none';
			for (var k=0; k<max2; k++) {
				if (this.inputs.inGamma.options[j].lastChild.nodeValue === cur.someGammas[k]) {
					if (k === 0) {
						defIdx = j;
					}
					this.inputs.inGamma.options[j].disabled = false;
					this.inputs.inGamma.options[j].style.display = 'block';
					if (this.inputs.inGamma.options[j].selected) {
						changeIdx = false;
					}
					break;
				}
			}
		}
		if (changeIdx) {
			var oldIdx = this.inputs.inGamma.options.selectedIndex;
			this.inputs.inGamma.options[defIdx].selected = true;
			this.inputs.inGamma.options[oldIdx].disabled = true;
			this.inputs.inGamma.options[oldIdx].style.display = 'none';
		}
	} else {
		var max = this.inputs.inGamma.options.length;
		for (var j=0; j<max; j++) {
			this.inputs.inGamma.options[j].disabled = false;
			this.inputs.inGamma.options[j].style.display = 'block';
		}
	}
	// 1D or 3D
	this.inputs.d[0].disabled = !cur.oneD;
	this.inputs.d[1].disabled = !cur.threeD;
	if (idx !== curIdx || changedType) { // Set to default only if the LUT format has changed
		if (cur.defThree) {
			this.inputs.oneDBox.className = 'graybox-hide';
			this.inputs.threeDBox.className = 'graybox';
			this.inputs.d[1].checked = true;
		} else {
			this.inputs.oneDBox.className = 'graybox';
			this.inputs.threeDBox.className = 'graybox-hide';
			this.inputs.d[0].checked = true;
		}
	}
	// 1D size options
	if (idx !== curIdx || changedType) { // Set to default only if the LUT format has changed
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
	}
	// 3D size options
	if (idx !== curIdx || changedType) { // Set to default only if the LUT format has changed
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
	}
	// Input range
	if (idx !== curIdx || changedType || parseInt(this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value) !== this.lastGamma) { // Set to default only if the LUT format has changed
		this.inputs.inRange[0].disabled = !cur.legIn;
		this.inputs.inRange[1].disabled = !cur.datIn;
		if (cur.defLegIn) {
			this.inputs.inRange[0].checked = true;
		} else {
			this.inputs.inRange[1].checked = true;
		}
	}
	// Output range
	if (idx !== curIdx || changedType || parseInt(this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value) !== this.lastGamma) { // Set to default only if the LUT format has changed
		this.inputs.outRange[0].disabled = !cur.legOut;
		this.inputs.outRange[1].disabled = !cur.datOut;
		if (cur.defLegOut) {
			this.inputs.outRange[0].checked = true;
		} else {
			this.inputs.outRange[1].checked = true;
		}
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
	this.lastGamma = parseInt(this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value);
	// Custom input scaling
	if (idx !== curIdx || changedType) { // Set to default only if the LUT format has changed
		if (cur.scaling) {
			this.inputs.scaleBox.className = 'emptybox';
		} else {
			this.inputs.scaleBox.className = 'emptybox-hide';
			this.inputs.scaleMin.value = '0';
			this.inputs.scaleMax.value = '1.0';
		}
	}
	// set LUT bit depth (3dl etc.)
	if (idx !== curIdx || changedType) { // Set to default only if the LUT format has changed
		if (cur.setBits) {
			this.inputs.bitsBox.className = 'emptybox';
			this.inputs.inBitsSelect.options[(cur.inBits - 10)/2].selected = true;
			this.inputs.outBitsSelect.options[(cur.outBits - 10)/2].selected = true;
		} else {
			this.inputs.bitsBox.className = 'emptybox-hide';
		}
	}
	// Set black clip and white clip levels for the format
	if (idx !== curIdx || changedType) { // Set to default only if the LUT format has changed
		this.inputs.bClip = cur.bClip;
		this.inputs.wClip = cur.wClip;
	}
	// Release hard clip option
	if (idx !== curIdx || changedType) { // Set to default only if the LUT format has changed
		if (cur.hard) {
			this.inputs.clipCheck.disabled = true;
			this.inputs.clipCheck.checked = true;
		} else {
			this.inputs.clipCheck.disabled = false;
			this.inputs.clipCheck.checked = false;
		}
	}
	// Line up current and changed indeces
	this.curIdx = idx;
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
	// Release hard clip option
	this.inputs.clipCheck.disabled = false;
	this.inputs.clipCheck.checked = false;
}
LUTFormats.prototype.output = function(buff) {
	var idx;
	if (this.inputs.lutUsage[0].checked) {
		idx = this.grades[parseInt(this.inputs.gradeSelect.options[this.inputs.gradeSelect.selectedIndex].value)].idx;
	} else {
		idx = this.mluts[parseInt(this.inputs.mlutSelect.options[this.inputs.mlutSelect.selectedIndex].value)].idx;
	}
	var out = this.formats[idx].build(buff, this.inputs.name.value, this.exts[idx]);
	if (out) {
		if (this.txt[idx]) {
			this.file.save(out.lut, out.fileName, out.ext);
		} else {
			this.file.saveBinary(out.lut, out.fileName, out.ext);
		}
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
LUTFormats.prototype.parse = function(ext, title, data, lut) {
	var max = this.types.length;
	for (var j=0; j<max; j++) {
		if (this.exts[j] === ext) {
			return this.formats[j].parse(title, data, lut);
		}
	}
	return false;
}
