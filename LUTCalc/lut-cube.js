/* lut-cube.js
* .cube LUT building / parsing for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function cubeLUT(messages, isLE, flavour) {
	this.messages = messages;
	this.isLE = isLE;
	this.flavour = flavour;
}
cubeLUT.prototype.build = function(buff, fileName, ext) {
	var lut = new Float64Array(buff);
	var max = lut.length;
	var d = '';
	for (var j=0; j<max; j += 3) {
		d +=	lut[ j ].toFixed(6).toString() + ' ' +
				lut[j+1].toFixed(6).toString() + ' ' +
				lut[j+2].toFixed(6).toString() + "\n";
	}
	return {
		lut: this.header() + d,
		fileName: fileName,
		ext: ext
	};
}
cubeLUT.prototype.header = function() {
	var info = {};
	this.messages.getInfo(info);
	var out = 'TITLE "' + info.name + '"' + "\n";
	if (info.oneD) {
		out += 'LUT_1D_SIZE ' + info.dimension.toString() + "\n";
	} else {
		out += 'LUT_3D_SIZE ' + info.dimension.toString() + "\n";
	}
	if (this.flavour !== 1 && this.scaleMin !== 0 && this.scaleMax !== 1) {
		if (this.flavour === 2) {
			if (info.dimension === 1) {
				out += 'LUT_3D_INPUT_RANGE ' + info.scaleMin + ' ' + info.scaleMax + "\n";
			} else {
				out += 'LUT_1D_INPUT_RANGE ' + info.scaleMin + ' ' + info.scaleMax + "\n";
			}
		} else if (this.flavour === 3) {
			out += 'DOMAIN_MIN ' + info.scaleMin + ' ' + info.scaleMin + ' ' + info.scaleMin + "\n";
			out += 'DOMAIN_MAX ' + info.scaleMax + ' ' + info.scaleMax + ' ' + info.scaleMax + "\n";
		}
	}
	if (info.nul) {
		out += '# Null LUT';
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
			out += 'Legal Output';
		} else {
			out += 'Data Output';
		}
	}
	out += ' - ' + 'Created with LUTCalc ' + info.version + ' by Ben Turley ' + info.date + "\n";
	return out;
}
cubeLUT.prototype.parse = function(title, text, lut) {
	var dimensions = false;
	var size = false;
	var minimum = [0,0,0];
	var maximum = [1,1,1];
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
		} else if (lower.search('title') >= 0) {
			title = line.substr(lower.search('title') + 5).trim().replace(/"/g, '');
		} else if (lower.search('lut_3d_size') >= 0) {
			var dim = line.substr(lower.search('lut_3d_size') + 11).trim();
			if (!isNaN(dim)) {
				dimensions = 3;
				size = parseInt(dim);
			}
		} else if (lower.search('lut_1d_size') >= 0) {
			var dim = line.substr(parseInt(lower.search('lut_1d_size')) + 11).trim();
			if (!isNaN(dim)) {
				dimensions = 1;
				size = parseInt(dim);
			}
		} else if (lower.search('domain_min') >= 0) {
			var dom = line.substr(parseInt(lower.search('domain_min')) + 10).trim().split(/\s+/g);
			if (!isNaN(dom[0]) && !isNaN(dom[1]) && !isNaN(dom[2])) {
				minimum[0] = parseFloat(dom[0]);
				minimum[1] = parseFloat(dom[1]);
				minimum[2] = parseFloat(dom[2]);
			}
		} else if (lower.search('domain_max') >= 0) {
			var dom = line.substr(parseInt(lower.search('domain_max')) + 10).trim().split(/\s+/g);
			if (!isNaN(dom[0]) && !isNaN(dom[1]) && !isNaN(dom[2])) {
				maximum[0] = parseFloat(dom[0]);
				maximum[1] = parseFloat(dom[1]);
				maximum[2] = parseFloat(dom[2]);
			}
		} else if (lower.search('lut_3d_input_range') >= 0) {
			var ran = line.substr(parseInt(lower.search('lut_3d_input_range')) + 18).trim().split(/\s+/g);
			if (!isNaN(ran[0]) && !isNaN(ran[1])) {
				minimum[0] = parseFloat(ran[0]);
				minimum[1] = minimum[0];
				minimum[2] = minimum[0];
				maximum[0] = parseFloat(ran[1]);
				maximum[1] = maximum[0];
				maximum[2] = maximum[0];
			}
		} else if (lower.search('lut_1d_input_range') >= 0) {
			var ran = line.substr(parseInt(lower.search('lut_1d_input_range')) + 18).trim().split(/\s+/g);
			if (!isNaN(ran[0]) && !isNaN(ran[1])) {
				minimum[0] = parseFloat(ran[0]);
				minimum[1] = minimum[0];
				minimum[2] = minimum[0];
				maximum[0] = parseFloat(ran[1]);
				maximum[1] = maximum[0];
				maximum[2] = maximum[0];
			}
		}
	}
	if (dimensions && size) {
		var arraySize = size;
		if (dimensions === 3) {
			arraySize = size*size*size;
		}
		var R = new Float64Array(arraySize);
		var G = new Float64Array(arraySize);
		var B = new Float64Array(arraySize);
		var s=0;
		for (var k=i; k<max; k++) {
			var line = text[k].trim();
			var j = line.charAt(0);
			if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
				var vals = line.split(/\s+/g);
				if (!isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[2])) {
					R[s] = parseFloat(vals[0]);
					G[s] = parseFloat(vals[1]);
					B[s] = parseFloat(vals[2]);
					s++;
				}
			}
		}
		lut.setDetails({
			title: title,
			format: 'cube',
			dims: dimensions,
			s: size,
			min: minimum,
			max: maximum,
			C: [R.buffer,G.buffer,B.buffer]
		});
		return true;
	} else {
		return false;
	}
}
