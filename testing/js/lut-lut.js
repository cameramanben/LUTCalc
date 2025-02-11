/* lut-lut.js
* .lut LUT building / parsing for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function lutLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
lutLUT.prototype.build = function(buff, fileName, ext) {
	var lut = new Float64Array(buff);
	var max = lut.length;
	var s = Math.round(max / 3)-1;
	var r = '';
	var g = '';
	var b = '';
	for (var j=0; j<max; j += 3) {
		r += Math.round(lut[ j ]*s).toString() + "\n";
		g += Math.round(lut[j+1]*s).toString() + "\n";
		b += Math.round(lut[j+2]*s).toString() + "\n";
	}
	return {
		lut: this.header() + r + g + b,
		fileName: fileName,
		ext: ext
	};
};
lutLUT.prototype.header = function() {
	var info = {};
	this.messages.getInfo(info);
	var out = '# Created with LUTCalc ' + info.version + ' by Ben Turley ' + info.date + "\n";
	out += '# "' + info.name + '"' + "\n";
	if (info.nul) {
		out += '# Null LUT' + "\n";
	} else {
		out += '# ';
		if (info.mlut) {
			out += 'MLUT';
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
			out += 'Legal Output' + "\n";
		} else {
			out += 'Data Output' + "\n";
		}
	}
	out += 'LUT: 3 ' + info.dimension.toString() + "\n";
	return out;
};
lutLUT.prototype.parse = function(title, text, lutMaker, lutDest) {
	var dimensions = 1;
	var channels = false;
	var size = false;
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
		} else if (lower.search('lut:') >= 0) {
			var data = line.substr(parseInt(lower.search('lut:')) + 4).trim().split(/\s+/g);
			channels = parseInt(data[0]);
			size = parseInt(data[1]);
		}
	}
	if (channels && size) {
		var arraySize = size;
		var div = size-1;
		if (channels === 1) {
			var L = new Float64Array(arraySize);
			var s=0;
			max = i+size;
			for (var k=i; k<max; k++) {
				var line = text[k].trim();
				if ((!isNaN(parseFloat(line)) && isFinite(line))) {
					L[s] = parseFloat(line)/div;
					s++;
				}
			}
			if (s === size) {
				return lutMaker.setLUT(
					lutDest,
					{
						title: title,
						format: 'lut',
						dims: 1,
						s: size,
						min: [0,0,0],
						max: [1,1,1],
						C: [L.buffer]
					}
				);
/*
				lut.setDetails({
					title: title,
					format: 'lut',
					dims: 1,
					s: size,
					min: [0,0,0],
					max: [1,1,1],
					C: [L.buffer]
				});
				return true;
*/
			} else {
				return false;
			}
		} else if (channels >= 3) {
			var R = new Float64Array(arraySize);
			var G = new Float64Array(arraySize);
			var B = new Float64Array(arraySize);
			var s=0;
			max = i+size;
			for (var k=i; k<max; k++) {
				var r = text[k].trim();
				var g = text[k+size].trim();
				var b = text[k+(2*size)].trim();
				if ((!isNaN(parseFloat(r)) && isFinite(r)) && (!isNaN(parseFloat(g)) && isFinite(g)) && (!isNaN(parseFloat(b)) && isFinite(b))) {
					R[s] = parseFloat(r)/div;
					G[s] = parseFloat(g)/div;
					B[s] = parseFloat(b)/div;
					s++;
				}
			}
			if (s === size) {
				return lutMaker.setLUT(
					lutDest,
					{
						title: title,
						format: 'lut',
						dims: 1,
						s: size,
						min: [0,0,0],
						max: [1,1,1],
						C: [R.buffer,G.buffer,B.buffer]
					}
				);
/*
				lut.setDetails({
					title: title,
					format: 'lut',
					dims: 1,
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
		} else {
			return false;
		}
	} else {
		return false;
	}
};
