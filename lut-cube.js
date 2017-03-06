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
};
cubeLUT.prototype.header = function() {
	var info = {};
	this.messages.getInfo(info);
	var out = 'TITLE "' + info.name + '"' + "\n";
	if (info.oneD) {
		out += 'LUT_1D_SIZE ' + info.dimension.toString() + "\n";
	} else {
		out += 'LUT_3D_SIZE ' + info.dimension.toString() + "\n";
	}
	if (this.flavour !== 1 && (info.scaleMin !== 0 || info.scaleMax !== 1)) {
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
			out += ', Input 100% -> ';
		} else {
			out += ', Input 109% -> ';
		}
		if (info.legalOut) {
			out += 'Output 100%';
		} else {
			out += 'Output 109%';
		}
	}
	out += ' - ' + 'Created with LUTCalc ' + info.version + ' by Ben Turley ' + info.date + "\n";
	return out;
};
cubeLUT.prototype.parse = function(title, text, lutMaker, lutDest) {
	var dimensions = false;
	var size = false;
	var minimum = [0,0,0];
	var maximum = [1,1,1];
	var sysCS = '';
	var laCS = '';
	var laTF = '';
	var laRG = '';
	var laEX = true;
	var laMin,laMax;
	var baseISO = false;
	var interpolation = false;
	var laMX = false;
	var laMLines = 0;
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
		} else if (lower.search('# la_system_colourspace') >= 0) {
			sysCS = line.substr(parseInt(lower.search('# la_system_colourspace')) + 23).trim();
		} else if (lower.search('# la_input_colourspace') >= 0) {
			laCS = line.substr(parseInt(lower.search('# la_input_colourspace')) + 22).trim();
		} else if (lower.search('# la_input_transfer_function') >= 0) {
			laTF = line.substr(parseInt(lower.search('# la_input_transfer_function')) + 28).trim();
		} else if (lower.search('# la_base_iso') >= 0) {
			baseISO = parseInt(line.substr(parseInt(lower.search('# la_base_iso')) + 13).trim());
			if (isNaN(baseISO)) {
				baseISO = false;
			}
		}  else if (lower.search('# la_interpolation') >= 0) {
			switch (line.substr(parseInt(lower.search('# la_interpolation')) + 18).trim().toLowerCase()) {
				case 'tricubic': interpolation = 0;
					break;
				case 'tetrahedral': interpolation = 1;
					break;
				case 'trilinear': interpolation = 2;
					break;
			}
		} else if (lower.search('# la_input_range') >= 0) {
			laRG = line.substr(parseInt(lower.search('# la_input_range')) + 16).trim();
			if (laRG === '100') {
				laEX = false;
			}
		} else if (lower.search('# la_input_min') >= 0) {
			minimum[0] = parseFloat(line.substr(parseInt(lower.search('# la_input_min')) + 14).trim());
			if (isNaN(minimum[0])) {
				minimum[0] = 0;
			} else {
				minimum[1] = minimum[0];
				minimum[2] = minimum[0];
			}
		} else if (lower.search('# la_input_max') >= 0) {
			maximum[0] = parseFloat(line.substr(parseInt(lower.search('# la_input_max')) + 14).trim());
			if (isNaN(maximum[0])) {
				minimum[0] = 1;
			} else {
				maximum[1] = maximum[0];
				maximum[2] = maximum[0];
			}
		} else if (lower.search('# la_input_matrix_r') >= 0) {
			var mat = line.substr(parseInt(lower.search('# la_input_matrix_r')) + 19).trim().split(/\s+/g);
			if (!isNaN(mat[0]) && !isNaN(mat[1]) && !isNaN(mat[2])) {
				if (laMLines === 0) {
					laMX = new Float64Array([1,0,0,0,1,0,0,0,1]);
				}
				laMX[0] = mat[0];
				laMX[1] = mat[1];
				laMX[2] = mat[2];
				laMLines++;
			}
		} else if (lower.search('# la_input_matrix_g') >= 0) {
			var mat = line.substr(parseInt(lower.search('# la_input_matrix_g')) + 19).trim().split(/\s+/g);
			if (!isNaN(mat[0]) && !isNaN(mat[1]) && !isNaN(mat[2])) {
				if (laMLines === 0) {
					laMX = new Float64Array([1,0,0,0,1,0,0,0,1]);
				}
				laMX[3] = mat[0];
				laMX[4] = mat[1];
				laMX[5] = mat[2];
				laMLines++;
			}
		} else if (lower.search('# la_input_matrix_b') >= 0) {
			var mat = line.substr(parseInt(lower.search('# la_input_matrix_b')) + 19).trim().split(/\s+/g);
			if (!isNaN(mat[0]) && !isNaN(mat[1]) && !isNaN(mat[2])) {
				if (laMLines === 0) {
					laMX = new Float64Array([1,0,0,0,1,0,0,0,1]);
				}
				laMX[6] = mat[0];
				laMX[7] = mat[1];
				laMX[8] = mat[2];
				laMLines++;
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
		var meta = {};
		if (laTF !== '') {
			meta.inputTF = laTF;
		}
		if (sysCS !== '') {
			meta.systemCS = sysCS;
		}
		if (laCS !== '') {
			meta.inputCS = laCS;
		}
		if (laRG !== '') {
			meta.inputEX = laEX;
		}
		if (laMLines === 3) {
			meta.inputMatrix = laMX;
		}
		if (interpolation) {
			meta.interpolation = interpolation;
		}
		if (baseISO) {
			meta.baseISO = baseISO;
		}
		var params = {
				title: title,
				format: 'cube',
				dims: dimensions,
				s: size,
				min: minimum,
				max: maximum,
				C: [R.buffer,G.buffer,B.buffer],
				meta: meta
		};
		return lutMaker.setLUT(
			lutDest,
			params
		);
	} else {
		return false;
	}
};
