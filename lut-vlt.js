/* lut-vlt.js
* Panasonic Varicam .vlt LUT building / parsing for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function vltLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
vltLUT.prototype.build = function(buff) {
	var lut = new Float64Array(buff);
	var max = lut.length;
	var d = '';
	for (var j=0; j<max; j += 3) {
		d +=	Math.min(4095,Math.max(0,Math.round(lut[ j ]*4095))).toString() + ' ' +
				Math.min(4095,Math.max(0,Math.round(lut[j+1]*4095))).toString() + ' ' +
				Math.min(4095,Math.max(0,Math.round(lut[j+2]*4095))).toString() + "\n";
	}
	return this.header() + d;
}
vltLUT.prototype.header = function() {
	var info = {};
	this.messages.getInfo(info);
	var out = '# panasonic vlt file version 1.0' + "\n";
	out += '# source vlt file ""' + "\n";
	out += 'LUT_3D_SIZE ' + info.dimension.toString() + "\n\n";
	return out;
}
vltLUT.prototype.parse = function(title, text, lut) {
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
				minimum[0] = parseInt(dom[0]);
				minimum[1] = parseInt(dom[1]);
				minimum[2] = parseInt(dom[2]);
			}
		} else if (lower.search('domain_max') >= 0) {
			var dom = line.substr(parseInt(lower.search('domain_max')) + 10).trim().split(/\s+/g);
			if (!isNaN(dom[0]) && !isNaN(dom[1]) && !isNaN(dom[2])) {
				maximum[0] = parseInt(dom[0]);
				maximum[1] = parseInt(dom[1]);
				maximum[2] = parseInt(dom[2]);
			}
		} else if (lower.search('lut_3d_input_range') >= 0) {
			var ran = line.substr(parseInt(lower.search('lut_3d_input_range')) + 18).trim().split(/\s+/g);
			if (!isNaN(ran[0]) && !isNaN(ran[1])) {
				minimum[0] = parseInt(ran[0]);
				minimum[1] = minimum[0];
				minimum[2] = minimum[0];
				maximum[0] = parseInt(ran[1]);
				maximum[1] = maximum[0];
				maximum[2] = maximum[0];
			}
		} else if (lower.search('lut_1d_input_range') >= 0) {
			var ran = line.substr(parseInt(lower.search('lut_1d_input_range')) + 18).trim().split(/\s+/g);
			if (!isNaN(ran[0]) && !isNaN(ran[1])) {
				minimum[0] = parseInt(ran[0]);
				minimum[1] = minimum[0];
				minimum[2] = minimum[0];
				maximum[0] = parseInt(ran[1]);
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
					R[s] = parseFloat(vals[0])/4095;
					G[s] = parseFloat(vals[1])/4095;
					B[s] = parseFloat(vals[2])/4095;
					s++;
				}
			}
		}
		lut.setDetails({
			title: title,
			format: 'vlt',
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
