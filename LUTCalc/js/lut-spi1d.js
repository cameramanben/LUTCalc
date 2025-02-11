/* lut-spi1d.js
* .3dl LUT building / parsing for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function spi1dLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
spi1dLUT.prototype.build = function(buff, fileName, ext) {
	var lut = new Float64Array(buff);
	var info = {};
	this.messages.getInfo(info);
	var max = lut.length;
	var d = '{' + "\n";
	for (var j=0; j<max; j += 3) {
		d += "\t" + lut[ j ].toFixed(12).toString();
		if (info.doASCCDL) {
			d += ' ' + lut[j+1].toFixed(12).toString();
			d += ' ' + lut[j+2].toFixed(12).toString();
		}
		d += "\n";
	}
	d += '}' + "\n";
	return {
		lut: this.header(info) + d,
		fileName: fileName,
		ext: ext
	};
};
spi1dLUT.prototype.header = function(info) {
	var out = '';
	out += 'Version 1' + "\n";
	if (this.scaleCheck) {
		out += 'From ' + info.scaleMin.toString() + ' '  + info.scaleMax.toString() + "\n";
	} else {
		out += 'From 0 1' + "\n";
	}
	out += 'Length ' + info.dimension.toString() + "\n";
	if (info.doASCCDL) {
		out += 'Components 3' + "\n";
	} else {
		out += 'Components 1' + "\n";
	}
	return out;
};
spi1dLUT.prototype.parse = function(title, text, lutMaker, lutDest) {
	var dimensions = 1;
	var channels = false;
	var size = false;
	var version = false;
	var from = 0;
	var to = 1;
	var max = text.length;
	if (max === 0) {
		return false;
	}
	var i;
	for (i=0; i<max; i++) {
		var line = text[i].trim();
		var lower = line.toLowerCase();
		if (lower.search('{') >= 0) {
			break;
		} else if (lower.search('version') >= 0) {
			version = parseInt(line.substr(parseInt(lower.search('version')) + 7).trim());
		} else if (lower.search('from') >= 0) {
			var data = line.substr(parseInt(lower.search('from')) + 4).trim().split(/\s+/g);
			from = parseFloat(data[0]);
			to = parseFloat(data[1]);
		} else if (lower.search('length') >= 0) {
			size = parseInt(line.substr(parseInt(lower.search('length')) + 6).trim());
		} else if (lower.search('components') >= 0) {
			channels = parseInt(line.substr(parseInt(lower.search('components')) + 10).trim());
		}
	}
	if (channels && size) {
		var arraySize = size;
		i++;
		if (channels === 1) {
			var L = new Float64Array(arraySize);
			var s=0;
			for (var k=i; k<max; k++) {
				var line = text[k].trim();
				if ((!isNaN(parseFloat(line)) && isFinite(line))) {
					L[s] = parseFloat(line);
					s++;
				}
			}
			if (s === size) {
			return lutMaker.setLUT(
				lutDest,
				{
					title: title,
					format: 'spi1d',
					dims: 1,
					s: size,
					min: [from,from,from],
					max: [to,to,to],
					C: [L.buffer]
				}
			);
/*
				lut.setDetails({
					title: title,
					format: 'spi1d',
					dims: 1,
					s: size,
					min: [from,from,from],
					max: [to,to,to],
					C: [L.buffer]
				});
				return true;
*/			} else {
				return false;
			}
		} else if (channels < 4) {
			var R = new Float64Array(arraySize);
			var G = new Float64Array(arraySize);
			var B = new Float64Array(arraySize);
			var s=0;
			for (var k=i; k<max; k++) {
				var line = text[k].trim();
				var j = line.charAt(0);
				if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
					var vals = line.split(/\s+/g);
					if (channels === 2 && !isNaN(vals[0]) && !isNaN(vals[1])) {
						R[s] = parseFloat(vals[0]);
						G[s] = parseFloat(vals[1]);
						B[s] = 0;
						s++;
					} else if (channels === 3 && !isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[2])) {
						R[s] = parseFloat(vals[0]);
						G[s] = parseFloat(vals[1]);
						B[s] = parseFloat(vals[2]);
						s++;
					}
				}
			}
		} else {
			return false;
		}
	} else {
		return false;
	}
};
