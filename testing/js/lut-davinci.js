/* lut-davinci.js
* DaVinci Resolve 1D ilut / olut LUT building / parsing for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function davinciiLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
davinciiLUT.prototype.build = function(buff, fileName, ext) {
	var lut = new Float64Array(buff);
	var max = lut.length;
	var d = '';
	for (var j=0; j<max; j += 3) {
		d +=	Math.round(lut[ j ]*16383).toString() + ',' +
				Math.round(lut[j+1]*16383).toString() + ',' +
				Math.round(lut[j+2]*16383).toString() + ',' +
				"0\n";
	}
	return {
		lut: d,
		fileName: fileName,
		ext: ext
	};
};
davinciiLUT.prototype.parse = function(title, text, lutMaker, lutDest) {
	var dimensions = 1;
	var size = 16384;
	var max = text.length;
	if (max === 0) {
		return false;
	}
	var i;
	for (i=0; i<max; i++) {
		var line = text[i].trim();
		var lower = line.toLowerCase();
		var j = line.charAt(0);
		if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
			break;
		}
	}
	var arraySize = size;
	var R = new Float64Array(arraySize);
	var G = new Float64Array(arraySize);
	var B = new Float64Array(arraySize);
	var s=0;
	for (var k=i; k<max; k++) {
		var line = text[k].trim();
		var j = line.charAt(0);
		if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
			var vals = line.split(/,\s*/g);
			if (!isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[2])) {
				R[s] = parseFloat(vals[0])/16383;
				G[s] = parseFloat(vals[1])/16383;
				B[s] = parseFloat(vals[2])/16383;
				s++;
			}
		}
	}
	if (s === size) {
		return lutMaker.setLUT(
			lutDest,
			{
				title: title,
				format: 'davinci',
				dims: dimensions,
				s: size,
				min: [0,0,0],
				max: [1,1,1],
				C: [R.buffer,G.buffer,B.buffer]
			}
		);
/*
		lut.setDetails({
			title: title,
			format: 'davinci',
			dims: dimensions,
			s: size,
			min: [0,0,0],
			max: [1,1,1],
			C: [R.buffer,G.buffer,B.buffer]
		});
		return true;
*/
	} else {
		return false;
	}
};
function davincioLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
davincioLUT.prototype.build = function(buff, fileName, ext) {
	var lut = new Float64Array(buff);
	var max = lut.length;
	var d = '';
	for (var j=0; j<max; j += 3) {
		d +=	Math.round(lut[ j ]*16383).toString() + ',' +
				Math.round(lut[j+1]*16383).toString() + ',' +
				Math.round(lut[j+2]*16383).toString() + ',' +
				Math.round(lut[ j ]*16383).toString() + ',' +
				Math.round(lut[j+1]*16383).toString() + ',' +
				Math.round(lut[j+2]*16383).toString() + "\n";
	}
	return {
		lut: d,
		fileName: fileName,
		ext: ext
	};
};
davincioLUT.prototype.parse = function(title, text, lutMaker, lutDest) {
	var dimensions = 1;
	var size = 4096;
	var max = text.length;
	if (max === 0) {
		return false;
	}
	var i;
	for (i=0; i<max; i++) {
		var line = text[i].trim();
		var lower = line.toLowerCase();
		var j = line.charAt(0);
		if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
			break;
		}
	}
	var arraySize = size;
	var R = new Float64Array(arraySize);
	var G = new Float64Array(arraySize);
	var B = new Float64Array(arraySize);
	var s=0;
	for (var k=i; k<max; k++) {
		var line = text[k].trim();
		var j = line.charAt(0);
		if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
			var vals = line.split(/,\s*/g);
			if (!isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[2])) {
				R[s] = parseFloat(vals[0])/4095;
				G[s] = parseFloat(vals[1])/4095;
				B[s] = parseFloat(vals[2])/4095;
				s++;
			}
		}
	}
	if (s === size) {
		return lutMaker.setLUT(
			lutDest,
			{
				title: title,
				format: 'davinci',
				dims: dimensions,
				s: size,
				min: [0,0,0],
				max: [1,1,1],
				C: [R.buffer,G.buffer,B.buffer]
			}
		);
/*
		lut.setDetails({
			title: title,
			format: 'davinci',
			dims: dimensions,
			s: size,
			min: [0,0,0],
			max: [1,1,1],
			C: [R.buffer,G.buffer,B.buffer]
		});
		return true;
*/
	} else {
		return false;
	}
};
