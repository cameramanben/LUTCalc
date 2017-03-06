/* lut-spi3d.js
* .spi3d LUT building / parsing for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function spi3dLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
spi3dLUT.prototype.build = function(buff, fileName, ext) {
	var lut = new Float64Array(buff);
	var info = {};
	this.messages.getInfo(info);
	var m = parseInt(info.dimension);
	var d = '';
	var j;
	for (var r=0; r<m; r++) {
		for (var g=0; g<m; g++) {
			for (var b=0; b<m; b++) {
				j = (r + (g*m) + (b*m*m))*3;
				d +=	r.toString() + ' ' + g.toString() + ' ' + b.toString() + ' ' +
						lut[ j ].toFixed(8).toString() + ' ' +
						lut[j+1].toFixed(8).toString() + ' ' +
						lut[j+2].toFixed(8).toString() + "\n";
			}
		}
	}
	return {
		lut: this.header(info) + d,
		fileName: fileName,
		ext: ext
	};
};
spi3dLUT.prototype.header = function(info) {
	var out = 'SPILUT 1.0' + "\n";
	out += '3 3' + "\n";
	out += info.dimension.toString() + ' ' + info.dimension.toString() + ' ' + info.dimension.toString() + "\n";
	return out;
};
spi3dLUT.prototype.parse = function(title, text, lutMaker, lutDest) {
	var dimensions = false;
	var size = false;
	var minimum = [0,0,0];
	var maximum = [1,1,1];
	var max = text.length;
	if (max === 0) {
		return false;
	}
	var line = text[0].trim();
	var lower = line.toLowerCase();
	if (lower.search('spilut') >= 0) {
		var i;
		for (i=0; i<max; i++) {
			line = text[i].trim();
			lower = line.toLowerCase();
			j = line.charAt(0);
			if ((!isNaN(parseFloat(j)) && isFinite(j))) {
				var vals = line.split(/\s+/g);
				if (vals.length === 2) {
					// currently unknown now to handle '3 3' line
					dimensions = 3;
				} else if (vals.length === 3) {
					if (!isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[2])) {
						// can have different sizes for each colour channel - hmmmm.
						size = [parseInt(vals[0]),parseInt(vals[1]),parseInt(vals[2])];
						// for now, LUTCalc can't handle 3D LUTs with multiple sizes
						if (size[0] !== size[1] || size[1] !== size[2] || size[2] !== size[0]) {
							return false;
						}
					}
				} else if (vals.length > 3) {
					// stop parsing when the LUT data is reached
					break;
				}
			}
		}
		if (dimensions && size) {
			var arraySize = size;
			if (dimensions === 3) {
				arraySize = size[0]*size[1]*size[2];
			}
			var R = new Float64Array(arraySize);
			var G = new Float64Array(arraySize);
			var B = new Float64Array(arraySize);
			var s;
			var t=0;
			for (var k=i; k<max; k++) {
				var line = text[k].trim();
				var j = line.charAt(0);
				if ((!isNaN(parseFloat(j)) && isFinite(j)) || j === '-') {
					var vals = line.split(/\s+/g);
					if (vals.length === 6 && (!isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[2]) && !isNaN(vals[3]) && !isNaN(vals[4]) && !isNaN(vals[5]))) {
						s = parseInt(vals[0]) + (parseInt(vals[1])*size[0]) + (parseInt(vals[2])*size[0]*size[1]);
						R[s] = parseFloat(vals[3]);
						G[s] = parseFloat(vals[4]);
						B[s] = parseFloat(vals[5]);
						t++;
					}
				}
			}
			if (t === arraySize) {
				return lutMaker.setLUT(
					lutDest,
					{
						title: title,
						format: 'spi3d',
						dims: dimensions,
						s: size[0],
						min: minimum,
						max: maximum,
						C: [R.buffer,G.buffer,B.buffer]
					}
				);
/*
				lut.setDetails({
					title: title,
					format: 'spi3d',
					dims: dimensions,
					s: size[0],
					min: minimum,
					max: maximum,
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
