/* lut-3dl.js
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
function threedlLUT(messages, isLE, flavour) {
	this.messages = messages;
	this.isLE = isLE;
	this.flavour = flavour;
}
threedlLUT.prototype.build = function(buff, fileName, ext) {
	var info = {};
	this.messages.getInfo(info);
	var lut = new Float64Array(buff);
	var max = lut.length;
	var d = '';
	var max = info.dimension;
	var mult = (Math.pow(2,info.inBits)-1)/(max-1);
	for (var j=0; j<max; j++) {
		d += Math.ceil(j*mult) + ' ';
	}
	d = d.slice(0,d.length - 1);
	d += "\n";
	var t;
	mult = Math.pow(2,info.outBits)-1;
	for (var r=0; r<max; r++) {
		for (var g=0; g<max; g++) {
			for (var b=0; b<max; b++) {
				t = (r + (g*max) + (b*max*max))*3;
				if (lut[ t ] > 0) {
					d += Math.round(lut[ t ]*mult).toString() + ' ';
				} else {
					d += '0 ';
				}
				if (lut[t+1] > 0) {
					d += Math.round(lut[t+1]*mult).toString() + ' ';
				} else {
					d += '0 ';
				}
				if (lut[t+2] > 0) {
					d += Math.round(lut[t+2]*mult).toString() + "\n";
				} else {
					d += '0' + "\n";
				}
			}
		}
	}
	switch (this.flavour) {
		case 1: // Flame
			return {
				lut: this.header(info) + d,
				fileName: fileName,
				ext: ext
			};
			break;
		case 2: // Lustre
			return {
				lut: this.header(info) + d + this.footer(info),
				fileName: fileName,
				ext: ext
			};
			break;
		case 3: // Kodak
			return {
				lut: this.header(info) + d,
				fileName: fileName,
				ext: ext
			};
			break;
	}
}
threedlLUT.prototype.header = function(info) {
	var out = '';
	var date = new Date();
	out += '# Created with LUTCalc ' + info.version + ' by Ben Turley ' + info.date + ' #' + "\n";
	out += '# IDENTIFICATION: LUTCalc - 3DLUT' + "\n";
	out += '# CREATOR: LUTCalc ' + info.version + "\n";
	out += '# USER: LUTCalc' + "\n";
	out += '# DATA: ' +
			date.getUTCFullYear() + '-' +
			this.addZero(date.getUTCMonth()) + '-' +
			this.addZero(date.getUTCDate()) + 'T' +
			this.addZero(date.getUTCHours()) + ':' +
			this.addZero(date.getUTCMinutes()) + ':' +
			this.addZero(date.getUTCSeconds()) + ' #' + "\n";
	out += '# NUMBER OF COLUMNS: 3' + "\n";
	out += '# NUMBER OF ROWS: ' + Math.pow(info.dimension,3).toString() + "\n";
	out += '# NUMBER OF NODES: ' + info.dimension.toString() + "\n";
	out += '# INPUT RANGE: ' + info.inBits.toString() + "\n";
	out += '# OUTPUT RANGE: ' + info.outBits.toString() + "\n";
	out += '# TITLE : ' + info.name + "\n";
	out += '# DESCRIPTION : ';
	if (info.nul) {
		out += ' Null LUT';
	} else {
		if (info.mlut) {
			out += 'MLUT';
		}
		if (info.doFC) {
			out += '*** FALSE COLOUR - DO NOT BAKE IN *** ';
		}
		if (this.doHG) {
			out += info.inGammaName + '/' + info.inGamutName + ' -> ' + info.outGammaName + '/' + info.outGamutName + '(' + info.hgGamutName + ' in the highlights)';
		} else {
			out += info.inGammaName + '/' + info.inGamutName + ' -> ' + info.outGammaName + '/' + info.outGamutName;
		}
		out += ', Stop Shift ' + info.cineEI.toFixed(2).toString();
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
	out += "\n";
	if (this.flavour === 2) {
		out += '3DMESH' + "\n";
		out += 'Mesh ';
		switch (info.dimension) {
			case 9: out += '3 ';
					break;
			case 17: out += '4 ';
					break;
			case 33: out += '5 ';
					break;
			case 65: out += '6 ';
					break;
			case 129: out += '7 ';
					break;
		}
		out += info.outBits.toString() + "\n";
	}
	return out;
}
threedlLUT.prototype.addZero = function(i) {
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}
threedlLUT.prototype.footer = function(info) {
	var out = '';
	out += 'LUT8' + "\n";
	out += 'gamma 1.0' + "\n";
	return out;
}
threedlLUT.prototype.parse = function(title, text, lut) {
	var size = false;
	var minimum = [0,0,0];
	var maximum = [1,1,1];
	var maxIn = 0;
	var setMaxIn = false;
	var maxOut = false;
	var mOut = 0;
	var format = 'threedl1';
	var mesh = false;
	var outBits = false;
	var shaper;
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
			// The first line with just numbers will be the shaper
			var shape = line.trim().split(/\s+/g);
			var m = shape.length;
			shaper = new Float64Array(m);
			for (var l=0; l<m; l++) {
				shaper[l] = parseFloat(shape[l]);
				if (!setMaxIn && shaper[l] > maxIn) {
					maxIn = shaper[l];
				}
				if (isNaN(shaper[l])) {
					return false;
				}
			}
			i++;
			break;
		} else if (lower.search('3dmesh') >= 0) {
			// 3DMESH line distinguishes two types
			mesh = true;
			format = 'threedl2';
		} else if (lower.search('mesh') >= 0) {
			mesh = true;
			format = 'threedl2';
			var bits = line.substr(lower.search('mesh') + 4).trim().split(/\s+/g);
			if (!isNaN(bits[0]) && !isNaN(bits[1])) {
				size = Math.pow(2,parseInt(bits[0]))+1;
				outBits = parseInt(bits[1]);
				maxOut = Math.pow(2,outBits)-1;
			}
		} else if (lower.search('number of rows:') >= 0) {
			var val = parseFloat(line.substr(lower.search('number of rows:') + 15));
			if (!isNaN(val)) {
				size = Math.round(Math.pow(val, 1/3));
			}
		} else if (lower.search('number of nodes:') >= 0) {
			var val = parseInt(line.substr(lower.search('number of nodes:') + 16));
			if (!isNaN(val)) {
				size = val;
			}
		} else if (lower.search('input range:') >= 0) {
			var val = parseInt(line.substr(lower.search('input range:') + 12).trim());
			if (!isNaN(val)) {
				maxIn = Math.pow(2,val)-1;
			}
		} else if (lower.search('output range:') >= 0) {
			var val = parseInt(line.substr(lower.search('output range:') + 13).trim());
			if (!isNaN(val)) {
				outBits = val;
				maxOut = Math.pow(2,outBits)-1;
			}
		} else if (lower.search('title:') >= 0) {
			title = line.substr(lower.search('title:') + 6).trim();
		} else if (lower.search('gamma') >= 0) {
			// Unused at the moment
		} else if (lower.search('lut8') >= 0) {
			// Unused at the moment
		}
	}
	if (!size) {
		// 3D LUT dimension does not need to match shaper, without 'Mesh', must be gauged from the number of entries. Yuck!
		size = 0;
		for (var k=i; k<max; k++) {
			var line = text[k].trim();
			var j = line.charAt(0);
			if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
				size++;
			}
		}
		size = Math.round(Math.pow(size, 1/3));
	}
	if (size > 0) {
		var spline = false;
		var doShaper = false;
		var m = shaper.length;
		if (!setMaxIn) {
			if (maxIn < 511) {
				maxIn = 255;
			} else if (maxIn < 2047) {
				maxIn = 1023;
			} else if (maxIn < 8191) {
				maxIn = 4095;
			} else if (maxIn < 32767) {
				maxIn = 16383;
			} else {
				maxIn = 65535;
			}
		}
		for (var j=0; j<m; j++) {
			if (Math.round(shaper[j]) !== Math.ceil(maxIn*j/(m-1))) {
				doShaper = true;
			}
		}
		if (doShaper) {
			for (var j=0; j<m; j++) {
				shaper[j] /= maxIn;
			}
//			var lutSpline = new LUTSpline(shaper.buffer);
//			spline = new Float64Array(lutSpline.getReverse());
			spline = shaper;
		}
		var arraySize = size*size*size;
		var R = new Float64Array(arraySize);
		var G = new Float64Array(arraySize);
		var B = new Float64Array(arraySize);
		var s=0;
		var r=0;
		var g=0;
		var b=0;
		var t;
		for (var k=i; k<max; k++) {
			var line = text[k].trim();
			var j = line.charAt(0);
			if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
				var vals = line.split(/\s+/g);
				if (!isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[2])) {
					t = r + (g*size) + (b*size*size);
					R[t] = parseFloat(vals[0]);
					G[t] = parseFloat(vals[1]);
					B[t] = parseFloat(vals[2]);
					if (maxOut) {
						R[t] /= maxOut;
						G[t] /= maxOut;
						B[t] /= maxOut;
					} else {
						if (R[s] > mOut) {
							mOut = R[s];
						}
						if (G[s] > mOut) {
							mOut = G[s];
						}
						if (B[s] > mOut) {
							mOut = B[s];
						}
					}
					b++;
					if (b === size) {
						b=0;
						g++;
					}
					if (g === size) {
						g=0;
						r++;
					}
					s++;
				}
			} else if (lower.search('gamma') >= 0) {
				// Unused at the moment
			} else if (lower.search('lut8') >= 0) {
				// Unused at the moment
			}
		}
		if (s === arraySize) {
			if (!maxOut) {
				if (mOut < 511) {
					maxOut = 255;
				} else if (mOut < 2047) {
					maxOut = 1023;
				} else if (mOut < 8191) {
					maxOut = 4095;
				} else if (mOut < 32767) {
					maxOut = 16383;
				} else {
					maxOut = 65535;
				}
				for (var j=0; j<arraySize; j++) {
					R[j] /= maxOut;
					G[j] /= maxOut;
					B[j] /= maxOut;
				}
			}
			if (doShaper) {
				lut.setDetails({
					title: title,
					format: format,
					dims: 3,
					s: size,
					min: minimum,
					max: maximum,
					spline: spline.buffer,
					C: [R.buffer,G.buffer,B.buffer]
				});
			} else {
				lut.setDetails({
					title: title,
					format: format,
					dims: 3,
					s: size,
					min: minimum,
					max: maximum,
					C: [R.buffer,G.buffer,B.buffer]
				});
			}
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}
