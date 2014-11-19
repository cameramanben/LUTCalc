/* luts.js
* LUT handling and calculation object for the LUTCalc Web App.
* 8th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTs() {
	this.title = '';
	this.format = ''; // Currently just 'cube'
	this.d = 1; // 1D or 3D
	this.s = 1024; // Dimension - eg 1024 or 4096 for 1D, 17, 33 or 65 for 3D
	this.min = [0,0,0]; // Lowest input value
	this.max = [1,1,1]; // Highest input value
	this.R = []; // LUT Array of Red values
	this.G = []; // LUT Array of Green values
	this.B = []; // LUT Array of Blue values
	this.L = []; // LUT Array of Luma values (1D only)
}
LUTs.prototype.setInfo = function(title, format, dimensions, size, min, max) {
	this.title = title;
	this.format = format;
	this.d = dimensions;
	this.s = size;
	this.min[0] = min[0];
	this.min[1] = min[1];
	this.min[2] = min[2];
	this.max[0] = max[0];
	this.max[1] = max[1];
	this.max[2] = max[2];
	this.R.length = 0;
	this.G.length = 0;
	this.B.length = 0;
	this.L.length = 0;
}
LUTs.prototype.reset = function() {
	this.title = '';
	this.format = '';
	this.d = 1;
	this.s = 1024;
	this.min = [0,0,0];
	this.max = [1,1,1];
	this.R.length = 0;
	this.G.length = 0;
	this.B.length = 0;
	this.L.length = 0;
}
LUTs.prototype.addLUT = function(lutR,lutG,lutB) {
	if (this.d == 3 || (lutG && lutB)) {
		this.R = lutR;
		this.G = lutG;
		this.B = lutB;
		this.buildL();
	} else {
		this.L = lutR;
	}
}
LUTs.prototype.buildL = function() { // 1D LUTs tend to be the same for each channel, but don't need to be. one time luma calculation to speed things up later
	for (var i=0; i<this.s; i++) {
		if (this.d == 1) {
			this.L[i] = (0.2126 * this.R[i]) + (0.7152 * this.G[i]) + (0.0722 * this.B[i]);
		} else {
			this.L[i] = (0.2126 * this.R[i][i][i]) + (0.7152 * this.G[i][i][i]) + (0.0722 * this.B[i][i][i]);
		}
	}
}
LUTs.prototype.calcTransferFromSL3 = function(gammas,gam,legIn,legOut) {
	var s = this.s -1;
	var sl3ToGam = [];
	var oneDDim = this.s;
	if (oneDDim < 256) {
		oneDDim = 256;
	}
// Create 1024-point 1D S-Log3 -> LUT Gamma LUT.
	for (var z=0; z<oneDDim; z++) {	
		var input = z/(oneDDim - 1);
// S-Log3 Data -> Linear
		if (input >= 0.1673609920) {
			input = (Math.pow(10,(input - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			input = (0.1677922920 * input) - 0.0155818840;
		}
// Linear -> LUT Input Gamma
		if (legIn) {
			input = gammas.gammas[gam].linToLegal(input);
		} else {
			input = gammas.gammas[gam].linToData(input);
		}
		var py = this.lumaLCub(input);
		if (legOut) {
			py = ((py * 876) + 64)/1023;
		}
		sl3ToGam.push(py);
	}
// var printout = '';
// for (var i=0; i<sl3ToGam.length; i++) {
// 	printout += sl3ToGam[i].toFixed(8).toString() + ', ';
// }
// window.open("data:text/plain," + encodeURIComponent(printout),"_blank");
	return sl3ToGam;
}
LUTs.prototype.calcSG3ToGamut = function(outLut, gamma, gammas, gam, legIn, legOut) {
	var dim = outLut.s;
	var gamDim = gamma.length;
	var t = gamDim - 1;
	var invDim = 4096;
	var s = invDim - 1;
// First find the base FromSL3 indices for all the ToSL3 indices
	var invGamma = [];
	var minY = 999;
	var maxY = -1;
	for (var i=0; i < gamDim; i++) {
		var py = gamma[i]*s;
		if (py < minY) {
			minY = py;
		} else if (py > maxY) {
			maxY = py;
		}
	}
	minY = Math.floor(minY) + 1;
	maxY = Math.floor(maxY);
	for (var i=minY; i <= maxY; i++) {
		var low = -999;
		for (var j=1; j < gamDim; j++) {
			if (gamma[j]*s > i) {
				low = j-1;
				break;
			}
		}
		if (low > -999) {
			if (gamma[low]*s == i) {
				invGamma[i] = low/t;
			} else {
// Newton Raphson to get better approximation
				var aim = i/s;
				var l = (aim - gamma[low])/(gamma[low+1] - gamma[low]); //First approximation
				var p0 = gamma[low];
				var p1 = gamma[low + 1];
				var d0,d1;
				if (low == 0) {
					d0 = ((4 * gamma[1]) - (3 * gamma[0]) - gamma[2])/2;
				} else {
					d0 = (gamma[low + 1] - gamma[low - 1])/2;
				}
				if (low == t - 1) {
					d1 = (2 * gamma[t - 2]) + ((gamma[t - 1] - gamma[t - 3])/2) - (4 * gamma[t - 1]) + (2 * gamma[t]);
				} else {
					d1 = (gamma[low + 2] - gamma[low])/2;
				}
				var na = (2 * p0) + d0 - (2 * p1) + d1;
				var nb = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
				var nc = d0;
				var nd = p0;
				for (var w=0; w<5; w++) {
					var f =  (na * l * l * l) + (nb * l * l) + (nc * l) + nd - aim;
					if (Math.abs(f) < 0.0000000001) {
						invGamma[i] = (l + low)/t;
						break;
					} else if (isNaN(f)) {
						break;
					} else {
						invGamma[i] = (l + low)/t;
						var df = (3 * na * l * l) + (3 * nb * l) + nc;
						l = l - (f / df);
					}
				}
			}
		} else {
			invGamma[i] = -999;
		} 
	}
	var minD = ((4 * invGamma[minY+1]) - (3 * invGamma[minY]) - invGamma[minY+2])/2;
	var maxD = (0.5 * invGamma[maxY - 2]) - (2 * invGamma[maxY - 1]) + (1.5 * invGamma[maxY]);
	var minX = invGamma[minY];
	var maxX = invGamma[maxY];
	if (minY > 0) {
		for (var i=minY - 1; i >= 0 ; i--) {
			var j = minY - i;
			invGamma[i] = minX - (minD * j);
		}	
	}
	if (maxY < invDim) {
		for (var i=maxY + 1; i < invDim ; i++) {
			var j = i - maxY;
			invGamma[i] = maxX + (maxD * j);
		}	
	}
	var invMax = invDim-1;
// Create S-Log3->S-Log3 S-Gamut3.cine->LUT Gamut 3D LUT by comparing test LUT with 1D data
	var rOut = [];
	var gOut = [];
	var bOut = [];
	for (var c=0; c<dim; c++) {
		var gRowR = [];
		var gRowG = [];
		var gRowB = [];
		for (var b=0; b<dim; b++) {
			var rRowR = [];
			var rRowG = [];
			var rRowB = [];
			for (var a=0; a<dim; a++) {
				var input = [];
				var output = [];
				var ry,gy,by;
// S-Log3 Data -> Linear
				var A = a/(dim-1);
				var B = b/(dim-1);
				var C = c/(dim-1);
				if (A >= 0.1673609920) {
					input[0] = (Math.pow(10,(A - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
				} else {
					input[0] = (0.1677922920 * A) - 0.0155818840;
				}
				if (B >= 0.1673609920) {
					input[1] = (Math.pow(10,(B - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
				} else {
					input[1] = (0.1677922920 * B) - 0.0155818840;
				}
				if (C >= 0.1673609920) {
					input[2] = (Math.pow(10,(C - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
				} else {
					input[2] = (0.1677922920 * C) - 0.0155818840;
				}
// Linear -> Input Gamma
				input[0] = gammas.gammas[gam].linToData(input[0]);
				input[1] = gammas.gammas[gam].linToData(input[1]);
				input[2] = gammas.gammas[gam].linToData(input[2]);
				if (legIn) {
					input[0] = ((input[0]*1023)-64)/876;
					input[1] = ((input[1]*1023)-64)/876;
					input[2] = ((input[2]*1023)-64)/876;
				}
// Calculate 3D LUT Value
				output = this.rgbRGBCub(input);
				if (legOut) {
					ry = ((output[0]*876)+64)/1023;
					gy = ((output[1]*876)+64)/1023;
					by = ((output[2]*876)+64)/1023;
				} else {
					ry = output[0];
					gy = output[1];
					by = output[2];
				}
// Invert Values to S-Log3 Gamma
				var rb = Math.floor(ry*s);
				var gb = Math.floor(gy*s);
				var bb = Math.floor(by*s);
				if (rb < 0) {
					rRowR[a] = invGamma[0] + (minD * ry * s);
				} else if (rb >= invDim) {
					rRowR[a] = invGamma[invMax] + (maxD * ((ry * s) - invMax));
				} else {
					rRowR[a] = invGamma[rb] + (ry - (rb/s));
				}
				if (gb < 0) {
					rRowG[a] = invGamma[0] + (minD * ry * s);
				} else if (gb >= invDim) {
					rRowG[a] = invGamma[invMax] + (maxD * ((gy * s) - invMax));
				} else {
					rRowG[a] = invGamma[gb] + (gy - (gb/s));
				}
				if (bb < 0) {
					rRowB[a] = invGamma[0] + (minD * ry * s);
				} else if (bb >= invDim) {
					rRowB[a] = invGamma[invMax] + (maxD * ((by * s) - invMax));
				} else {
					rRowB[a] = invGamma[bb] + (by - (bb/s));
				}
if (isNaN(rRowR[a]) || isNaN(rRowG[a]) || isNaN(rRowB[a])) {
	console.log('rb - ' + rb + ' , gb - ' + gb + ' , bb - ' + bb);
	console.log('ry - ' + ry + ' , gy - ' + gy + ' , by - ' + by);
} 
			}
			gRowR[b] = rRowR.slice(0);
			gRowG[b] = rRowG.slice(0);
			gRowB[b] = rRowB.slice(0);
		}
		rOut[c] = gRowR.slice(0);
		gOut[c] = gRowG.slice(0);
		bOut[c] = gRowB.slice(0);
	}
	outLut.addLUT(rOut.slice(0),gOut.slice(0),bOut.slice(0));
	return true;
}
LUTs.prototype.lumaLCub = function(L) {
	var max = this.s - 1;
	L = L * max;
	if (L < 0) {
		var dy = ((4 * this.L[1]) - (3 * this.L[0]) - this.L[2])/2;
		return this.L[0] + (L * dy);
	} else if (L >= max) {
		var dy = (0.5 * this.L[max - 2]) - (2 * this.L[max - 1]) + (1.5 * this.L[max]);
		return this.L[max] + ((L - max) * dy);
	} else {
		var base = Math.floor(L);
		var p0 = this.L[base];
		var p1 = this.L[base + 1];
		var d0,d1;
		if (base == 0) {
			d0 = ((4 * this.L[1]) - (3 * this.L[0]) - this.L[2])/2;
		} else {
			d0 = (this.L[base + 1] - this.L[base - 1])/2;
		}
		if (base == max - 1) {
			d1 = (2 * this.L[max - 2]) + ((this.L[max - 1] - this.L[max - 3])/2) - (4 * this.L[max - 1]) + (2 * this.L[max]);
		} else {
			d1 = (this.L[base + 2] - this.L[base])/2;
		}
		var a = (2 * p0) + d0 - (2 * p1) + d1;
		var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
		var c = d0;
		var d = p0;
		var l = L - base;
		return (a * (l * l * l)) + (b * (l * l)) + (c * l) + d;
	}
}
LUTs.prototype.lumaLLin = function(L) {
	var max = this.s - 1;
	L = L * max;
	if (L < 0) {
		var dy = ((4 * this.L[1]) - (3 * this.L[0]) - this.L[2])/2;
		return this.L[0] + (L * dy);
	} else if (L >= max) {
		var dy = (0.5 * this.L[max - 2]) - (2 * this.L[max - 1]) + (1.5 * this.L[max]);
		return this.L[max] + ((L - max) * dy);
	} else {
		var base = Math.floor(L);
		var dy = L - base;
		return (this.L[base] * (1 - dy)) + (this.L[base + 1] * dy); 
	}
}
LUTs.prototype.lumaRGBCub = function(L) {
	var max = this.s - 1;
	L = L * max;
	if (this.d == 1) {
		if (this.R.length == 0) {
			var out;
			if (L < 0) {
				var dy = ((4 * this.L[1]) - (3 * this.L[0]) - this.L[2])/2;
				out = this.L[0] + (L * dy);
			} else if (L >= max) {
				var dy = (0.5 * this.L[max - 2]) - (2 * this.L[max - 1]) + (1.5 * this.L[max]);
				out = this.L[max] + ((L - max) * dy);
			} else {
				var base = Math.floor(L);
				var p0 = this.L[base];
				var p1 = this.L[base + 1];
				var d0,d1;
				if (base == 0) {
					d0 = ((4 * this.L[1]) - (3 * this.L[0]) - this.L[2])/2;
				} else {
					d0 = (this.L[base + 1] - this.L[base - 1])/2;
				}
				if (base == max - 1) {
					d1 = (2 * this.L[max - 2]) + ((this.L[max - 1] - this.L[max - 3])/2) - (4 * this.L[max - 1]) + (2 * this.L[max]);
				} else {
					d1 = (this.L[base + 2] - this.L[base])/2;
				}
				var a = (2 * p0) + d0 - (2 * p1) + d1;
				var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
				var c = d0;
				var d = p0;
				var l = L - base;
				out = (a * (l * l * l)) + (b * (l * l)) + (c * l) + d;
			}
			return [out,out,out];
		} else {
			var out = [];
			for (var i = 0; i < 3; i++) {
				var C = [];
				switch (i) {
					case 0: C = this.R;
							break;
					case 1: C = this.G;
							break;
					case 2: C = this.B;
							break;
				}
				if (L < 0) {
					var dy = ((4 * C[1]) - (3 * C[0]) - C[2])/2;
					out[i] = C[0] + (L * dy);
				} else if (L >= max) {
					var dy = (0.5 * C[max - 2]) - (2 * C[max - 1]) + (1.5 * C[max]);
					out[i] = C[max] + ((L - max) * dy);
				} else {
					var base = Math.floor(L);
					var p0 = C[base];
					var p1 = C[base + 1];
					var d0,d1;
					if (base == 0) {
						d0 = ((4 * C[1]) - (3 * C[0]) - C[2])/2;
					} else {
						d0 = (C[base + 1] - C[base - 1])/2;
					}
					if (base == max - 1) {
						d1 = (2 * C[max - 2]) + ((C[max - 1] - C[max - 3])/2) - (4 * C[max - 1]) + (2 * C[max]);
					} else {
						d1 = (C[base + 2] - C[base])/2;
					}
					var a = (2 * p0) + d0 - (2 * p1) + d1;
					var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
					var c = d0;
					var d = p0;
					var l = L - base;
					out[i] = (a * (l * l * l)) + (b * (l * l)) + (c * l) + d;
				}
			}
			return out;
		}
	} else {
		var out = [];
		for (var i = 0; i < 3; i++) {
			var C = [];
			switch (i) {
				case 0: C = this.R;
						break;
				case 1: C = this.G;
						break;
				case 2: C = this.B;
						break;
			}
			if (L < 0) {
				var dy = ((4 * C[1][1][1]) - (3 * C[0][0][0]) - C[2][2][2])/2;
				out[i] = C[0][0][0] + (L * dy);
			} else if (L >= max) {
				var dy = (0.5 * C[max - 2][max - 2][max - 2]) - (2 * C[max - 1][max - 1][max - 1]) + (1.5 * C[max][max][max]);
				out[i] = C[max][max][max] + ((L - max) * dy);
			} else {
				var base = Math.floor(L);
				var p0 = C[base][base][base];
				var p1 = C[base + 1][base + 1][base + 1];
				var d0,d1;
				if (base == 0) {
					d0 = ((4 * C[1][1][1]) - (3 * C[0][0][0]) - C[2][2][2])/2;
				} else {
					d0 = (C[base + 1][base + 1][base + 1] - C[base - 1][base - 1][base - 1])/2;
				}
				if (base == max - 1) {
					d1 = (2 * C[max - 2][max - 2][max - 2]) + ((C[max - 1][max - 1][max - 1] - C[max - 3][max - 3][max - 3])/2) - (4 * C[max - 1][max - 1][max - 1]) + (2 * C[max][max][max]);
				} else {
					d1 = (C[base + 2][base + 2][base + 2] - C[base][base][base])/2;
				}
				var a = (2 * p0) + d0 - (2 * p1) + d1;
				var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
				var c = d0;
				var d = p0;
				var l = L - base;
				rout[i] = (a * (l * l * l)) + (b * (l * l)) + (c * l) + d;
			}
		}
		return out;
	}
}
LUTs.prototype.lumaRGBLin = function(L) {
	var max = this.s - 1;
	L = L * max;
	if (this.d == 1) {
		if (this.R.length == 0) {
			var out;
			if (L < 0) {
				var dy = ((4 * this.L[1]) - (3 * this.L[0]) - this.L[2])/2;
				out = this.L[0] + (L * dy);
			} else if (L >= max) {
				var dy = (0.5 * this.L[max - 2]) - (2 * this.L[max - 1]) + (1.5 * this.L[max]);
				out = this.L[max] + ((L - max) * dy);
			} else {
				var base = Math.floor(L);
				var dy = L - base;
				out = (this.L[base] * (1 - dy)) + (this.L[base + 1] * dy);
			}
			return [out,out,out];
		} else {
			var out = [];
			for (var i = 0; i < 3; i++) {
				var C = [];
				switch (i) {
					case 0: C = this.R;
							break;
					case 1: C = this.G;
							break;
					case 2: C = this.B;
							break;
				}
				if (L < 0) {
					var dy = ((4 * C[1]) - (3 * C[0]) - C[2])/2;
					out[i] = C[0] + (L * dy);
				} else if (L >= max) {
					var dy = (0.5 * C[max - 2]) - (2 * C[max - 1]) + (1.5 * C[max]);
					out[i] = C[max] + ((L - max) * dy);
				} else {
					var base = Math.floor(L);
					var dy = L - base;
					out[i] = (C[base] * (1 - dy)) + (C[base + 1] * dy);
				}
			}
			return out;
		}
	} else {
		var out = [];
		for (var i = 0; i < 3; i++) {
			var C = [];
			switch (i) {
				case 0: C = this.R;
						break;
				case 1: C = this.G;
						break;
				case 2: C = this.B;
						break;
			}
			if (L < 0) {
				var dy = ((4 * C[1][1][1]) - (3 * C[0][0][0]) - C[2][2][2])/2;
				out[i] = C[0][0][0] + (L * dy);
			} else if (L >= max) {
				var dy = (0.5 * C[max - 2][max - 2][max - 2]) - (2 * C[max - 1][max - 1][max - 1]) + (1.5 * C[max][max][max]);
				out[i] = C[max][max][max] + ((L - max) * dy);
			} else {
				var base = Math.floor(L);
				var dy = L - base;
				out[i] = (C[base][base][base] * (1 - dy)) + (C[base + 1][base + 1][base + 1] * dy);
			}
		}
		return out;
	}
}
LUTs.prototype.rgbLCub = function(rgb) {
	var out = [];
	// Let rgbRGBCub sort things out then just calculate Lout using Rec709 coefficients
	out = this.rgbRGBCub(rgb);
	return (0.2126*out[0]) + (0.7152*out[1]) + (0.0722*out[2]);
}
LUTs.prototype.rgbLLin = function(rgb) {
	if (this.d == 1 && this.R.length == 0) {
		return this.lumaLLin((0.2126*rgb[0]) + (0.7152*rgb[1]) + (0.0722*rgb[2]));
	} else {
		var max = this.s - 1;
		if (this.d == 1) {
			var out = [];
			for (var i = 0; i < 3; i++) {
				var C = [];
				switch (i) {
					case 0: C = this.R;
							break;
					case 1: C = this.G;
							break;
					case 2: C = this.B;
							break;
				}
				var l = rgb[i] * max;
				if (l < 0) {
					var dy = ((4 * C[1]) - (3 * C[0]) - C[2])/2;
					out[i] = C[0] + (l * dy);
				} else if (l >= max) {
					var dy = (0.5 * C[max - 2]) - (2 * C[max - 1]) + (1.5 * C[max]);
					out[i] = C[max] + ((l - max) * dy);
				} else {
					var base = Math.floor(l);
					var dy = l - base;
					out[i] = (C[base] * (1 - dy)) + (C[base + 1] * dy);
				}
			}
			return (0.2126*out[0]) + (0.7152*out[1]) + (0.0722*out[2]);
		} else {
			var out = [];
			var ord = rgb.slice(0).sort(function(a, b){return b-a});
			if (ord[0] > 1) {
				var m = ord[0];
				var RGB = [rgb[0]/m,rgb[1]/m,rgb[2]/m];
				var neg = [false,false,false];
				if (rgb[0] < 0) {
					RGB[0] = 0;
					neg[0] = true;
				}
				if (rgb[1] < 0) {
					RGB[1] = 0;
					neg[1] = true;
				}
				if (rgb[2] < 0) {
					RGB[2] = 0;
					neg[2] = true;
				}
				out = this.rgbRGBLin(RGB);
				if (neg[0]) {
					out[0] = this.lumaLLin(rgb[0]);
				} else {
					out[0] = out[0] * this.lumaLLin(rgb[0])/this.lumaLLin(RGB[0]);
				}
				if (neg[1]) {
					out[1] = this.lumaLLin(rgb[1]);
				} else {
					out[1] = out[1] * this.lumaLLin(rgb[1])/this.lumaLLin(RGB[1]);
				}
				if (neg[2]) {
					out[2] = this.lumaLLin(rgb[2]);
				} else {
					out[2] = out[2] * this.lumaLLin(rgb[2])/this.lumaLLin(RGB[2]);
				}
				return (0.2126*out[0]) + (0.7152*out[1]) + (0.0722*out[2]);
			} else {
				var RGB = rgb.slice(0);
				var neg = [false,false,false];
				if (rgb[0] < 0) {
					RGB[0] = 0;
					neg[0] = true;
				}
				if (rgb[1] < 0) {
					RGB[1] = 0;
					neg[1] = true;
				}
				if (rgb[2] < 0) {
					RGB[2] = 0;
					neg[2] = true;
				}
				out = this.rgbRGBLin(RGB);
				if (neg[0]) {
					out[0] = this.lumaLLin(rgb[0]);
				}
				if (neg[1]) {
					out[1] = this.lumaLLin(rgb[1]);
				}
				if (neg[2]) {
					out[2] = this.lumaLLin(rgb[2]);
				}
				return (0.2126*out[0]) + (0.7152*out[1]) + (0.0722*out[2]);
			}
		}
	}
}
LUTs.prototype.rgbRGBCub = function(rgb) {
	// 1D case where R,G & B have the same gammas
	if (this.d == 1 && this.R.length == 0) {
		return [this.lumaLCub(rgb[0]),this.lumaLCub(rgb[1]),this.lumaLCub(rgb[2])];
	// Generalised 1D case (R, G & B can have differing gammas
	} else if (this.d == 1) {
		var max = this.s - 1;
		var out = [];
		// Loop through each ouput colour channel in turn
		for (var i = 0; i < 3; i++) {
			var C = [];
			switch (i) {
				case 0: C = this.R;
						break;
				case 1: C = this.G;
						break;
				case 2: C = this.B;
						break;
			}
			// Scale basic luma (0-1.0) range to array dimension
			var l = rgb[i] * max;
			// If current luma < 0, calculate gradient as the gradient at 0 of a quadratic fitting the bottom three points in the array
			// Then linearly scale from the array's 0 value
			if (l < 0) {
				var dy = ((4 * C[1]) - (3 * C[0]) - C[2])/2;
				out[i] = C[0] + (l * dy);
			// If current luma > 1, calculate gradient as the gradient at 1 of a quadratic fitting the top three points in the array
			// Then linearly scale from the array's last value
			} else if (l >= max) {
				var dy = (0.5 * C[max - 2]) - (2 * C[max - 1]) + (1.5 * C[max]);
				out[i] = C[max] + ((l - max) * dy);
			// Otherwise, cubic interpolate the output value from the LUT array
			} else {
				var base = Math.floor(l);
				var p0 = C[base];
				var p1 = C[base + 1];
				var d0,d1;
				// First and last gradients calculated fitting three points to quadratics
				if (base == 0) {
					d0 = ((4 * C[1]) - (3 * C[0]) - C[2])/2;
				} else {
					d0 = (C[base + 1] - C[base - 1])/2;
				}
				if (base == max - 1) {
					d1 = (2 * C[max - 2]) + ((C[max - 1] - C[max - 3])/2) - (4 * C[max - 1]) + (2 * C[max]);
				} else {
					d1 = (C[base + 2] - C[base])/2;
				}
				// Cubic polynomial - f(x) - parameters from known f(0), f'(0), f(1), f'(1)
				var a = (2 * p0) + d0 - (2 * p1) + d1;
				var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
				var c = d0;
				var d = p0;
				l = l - base;
				// Basic cubic polynomial calculation
				out[i] = (a * (l * l * l)) + (b * (l * l)) + (c * l) + d;
			}
		}
		return out;
	} else {
		var max = this.s - 1;
		var out = [];
		var input = [];
		var clip = max * 0.999999999999;
		var rL = false;
		var gL = false;
		var bL = false;
		var rH = false;
		var gH = false;
		var bH = false;
		// Scale basic RGB (0-1.0) range to array dimension
		input[0] = rgb[0] * max;
		input[1] = rgb[1] * max;
		input[2] = rgb[2] * max;
		// If 0 > input >= 1 for a colour channel, clip it (to a tiny fraction below 1 in the case of the upper limit)
		if (input[0] < 0) {
			input[0] = 0;
			rL = true;
		} else if (input [0] >= max) {
			input[0] = clip;
			rH = true;
		}
		if (input[1] < 0) {
			input[1] = 0;
			gL = true;
		} else if (input [1] >= max) {
			input[1] = clip;
			gH = true;
		}
		if (input[2] < 0) {
			input[2] = 0;
			bL = true;
		} else if (input [2] >= max) {
			input[2] = clip;
			bH = true;
		}
		// Now get tricubic interpolated value from prepared input values
		out = [
			this.triCubic(this.R, max, input),
			this.triCubic(this.G, max, input),
			this.triCubic(this.B, max, input)
			];
		// If any of the input channels were clipped, replace their output value with linear extrapolation from the edge point
		if (rL) {
			var p0 = this.triCubic(this.R, max, [0,input[1],input[2]]);
			var p1 = this.triCubic(this.R, max, [1,input[1],input[2]]);
			var p2 = this.triCubic(this.R, max, [2,input[1],input[2]]);
			var dy = ((4 * p1) - (3 * p0) - p2)/2;
			out[0] = p0 + (rgb[0] * max * dy);
		} else if (rH) {
			var p0 = this.triCubic(this.R, max, [clip - 2,input[1],input[2]]);
			var p1 = this.triCubic(this.R, max, [clip - 1,input[1],input[2]]);
			var p2 = this.triCubic(this.R, max, [clip,input[1],input[2]]);
			var dy = (0.5 * p0) - (2 * p1) + (1.5 * p2);
			out[0] = p2 + ((rgb[0] - 1) * max * dy);
		}
		if (gL) {
			var p0 = this.triCubic(this.G, max, [input[0],0,input[2]]);
			var p1 = this.triCubic(this.G, max, [input[0],1,input[2]]);
			var p2 = this.triCubic(this.G, max, [input[0],2,input[2]]);
			var dy = ((4 * p1) - (3 * p0) - p2)/2;
			out[1] = p0 + (rgb[1] * max * dy);
		} else if (gH) {
			var p0 = this.triCubic(this.G, max, [input[0],clip - 2,input[2]]);
			var p1 = this.triCubic(this.G, max, [input[0],clip - 1,input[2]]);
			var p2 = this.triCubic(this.G, max, [input[0],clip,input[2]]);
			var dy = (0.5 * p0) - (2 * p1) + (1.5 * p2);
			out[1] = p2 + ((rgb[1] - 1) * max * dy);
		}
		if (bL) {
			var p0 = this.triCubic(this.B, max, [input[0],input[1],0]);
			var p1 = this.triCubic(this.B, max, [input[0],input[1],1]);
			var p2 = this.triCubic(this.B, max, [input[0],input[1],2]);
			var dy = ((4 * p1) - (3 * p0) - p2)/2;
			out[2] = p0 + (rgb[2] * max * dy);
		} else if (bH) {
			var p0 = this.triCubic(this.B, max, [input[0],input[1],clip - 2]);
			var p1 = this.triCubic(this.B, max, [input[0],input[1],clip - 1]);
			var p2 = this.triCubic(this.B, max, [input[0],input[1],clip]);
			var dy = (0.5 * p0) - (2 * p1) + (1.5 * p2);
			out[2] = p2 + ((rgb[2] - 1) * max * dy);
		}
		// Return the calculated value
		return out;
	}
}
LUTs.prototype.triCubic = function(C, max, RGB) {
	var rB = Math.floor(RGB[0]);
	var r = RGB[0] - rB;
	var gB = Math.floor(RGB[1]);
	var g = RGB[1] - gB;
	var bB = Math.floor(RGB[2]);
	var bl = RGB[2] - bB;
// Initial Control Points
	var Pooo = C[ bB ][ gB ][ rB ];
	var Proo = C[ bB ][ gB ][rB+1];
	var Pogo = C[ bB ][gB+1][ rB ];
	var Prgo = C[ bB ][gB+1][rB+1];
	var Poob = C[bB+1][ gB ][ rB ];
	var Prob = C[bB+1][ gB ][rB+1];
	var Pogb = C[bB+1][gB+1][ rB ];
	var Prgb = C[bB+1][gB+1][rB+1];
// Slope along red axis at control points
	var rDooo, rDogo, rDoob, rDogb;
	var rDnoo, rDngo, rDnob, rDngb;
	if (rB == 0) {
		rDooo = ((4*C[ bB ][ gB ][1]) - (3*C[ bB ][ gB ][0]) - C[ bB ][ gB ][2])/2;
		rDogo = ((4*C[ bB ][gB+1][1]) - (3*C[ bB ][gB+1][0]) - C[ bB ][gB+1][2])/2;
		rDoob = ((4*C[bB+1][ gB ][1]) - (3*C[bB+1][ gB ][0]) - C[bB+1][ gB ][2])/2;
		rDogb = ((4*C[bB+1][gB+1][1]) - (3*C[bB+1][gB+1][0]) - C[bB+1][gB+1][2])/2;
		rDnoo = rDooo;
		rDngo = rDogo;
		rDnob = rDoob;
		rDngb = rDogb;
	} else {
		rDooo = (Proo - C[ bB ][ gB ][rB-1])/2;		
		rDogo = (Prgo - C[ bB ][gB+1][rB-1])/2;		
		rDoob = (Prob - C[bB+1][ gB ][rB-1])/2;		
		rDogb = (Prgb - C[bB+1][gB+1][rB-1])/2;	
		if (rB == 1) {
			rDnoo = ((4*C[ bB ][ gB ][1]) - (3*C[ bB ][ gB ][0]) - C[ bB ][ gB ][2])/2;
			rDngo = ((4*C[ bB ][gB+1][1]) - (3*C[ bB ][gB+1][0]) - C[ bB ][gB+1][2])/2;
			rDnob = ((4*C[bB+1][ gB ][1]) - (3*C[bB+1][ gB ][0]) - C[bB+1][ gB ][2])/2;
			rDngb = ((4*C[bB+1][gB+1][1]) - (3*C[bB+1][gB+1][0]) - C[bB+1][gB+1][2])/2;
		} else {
			rDnoo = (Pooo - C[ bB ][ gB ][rB-2])/2;		
			rDngo = (Pogo - C[ bB ][gB+1][rB-2])/2;		
			rDnob = (Poob - C[bB+1][ gB ][rB-2])/2;		
			rDngb = (Pogb - C[bB+1][gB+1][rB-2])/2;	
		}	
	}
	var rDroo, rDrgo, rDrob, rDrgb;
	var rDpoo, rDpgo, rDpob, rDpgb;
	if (rB == max - 1) {
		rDroo = (2*C[ bB ][ gB ][max-2]) + ((C[ bB ][ gB ][max-1] - C[ bB ][ gB ][max-3])/2) - (4*C[ bB ][ gB ][max-1]) + (2*C[ bB ][ gB ][max]);
		rDrgo = (2*C[ bB ][gB+1][max-2]) + ((C[ bB ][gB+1][max-1] - C[ bB ][gB+1][max-3])/2) - (4*C[ bB ][gB+1][max-1]) + (2*C[ bB ][gB+1][max]);
		rDrob = (2*C[bB+1][ gB ][max-2]) + ((C[bB+1][ gB ][max-1] - C[bB+1][ gB ][max-3])/2) - (4*C[bB+1][ gB ][max-1]) + (2*C[bB+1][ gB ][max]);
		rDrgb = (2*C[bB+1][gB+1][max-2]) + ((C[bB+1][gB+1][max-1] - C[bB+1][gB+1][max-3])/2) - (4*C[bB+1][gB+1][max-1]) + (2*C[bB+1][gB+1][max]);
		rDpoo = rDroo;
		rDpgo = rDrgo;
		rDpob = rDrob;
		rDpgb = rDrgb;
	} else {
		rDroo = (C[ bB ][ gB ][rB+2] - Pooo)/2;
		rDrgo = (C[ bB ][gB+1][rB+2] - Pogo)/2;
		rDrob = (C[bB+1][ gB ][rB+2] - Poob)/2;
		rDrgb = (C[bB+1][gB+1][rB+2] - Pogb)/2;
		if (rB == max - 2) {
			rDpoo = (2*C[ bB ][ gB ][max-2]) + ((C[ bB ][ gB ][max-1] - C[ bB ][ gB ][max-3])/2) - (4*C[ bB ][ gB ][max-1]) + (2*C[ bB ][ gB ][max]);
			rDpgo = (2*C[ bB ][gB+1][max-2]) + ((C[ bB ][gB+1][max-1] - C[ bB ][gB+1][max-3])/2) - (4*C[ bB ][gB+1][max-1]) + (2*C[ bB ][gB+1][max]);
			rDpob = (2*C[bB+1][ gB ][max-2]) + ((C[bB+1][ gB ][max-1] - C[bB+1][ gB ][max-3])/2) - (4*C[bB+1][ gB ][max-1]) + (2*C[bB+1][ gB ][max]);
			rDpgb = (2*C[bB+1][gB+1][max-2]) + ((C[bB+1][gB+1][max-1] - C[bB+1][gB+1][max-3])/2) - (4*C[bB+1][gB+1][max-1]) + (2*C[bB+1][gB+1][max]);
		} else {
			rDpoo = (C[ bB ][ gB ][rB+2] - Proo)/2;
			rDpgo = (C[ bB ][gB+1][rB+2] - Prgo)/2;
			rDpob = (C[bB+1][ gB ][rB+2] - Prob)/2;
			rDpgb = (C[bB+1][gB+1][rB+2] - Prgb)/2;
		}
	}
// Slope along green axis at control points
	var gDooo, gDroo, gDoob, gDrob;
	var gDono, gDrno, gDonb, gDrnb;
	if (gB == 0) {
		gDooo = ((4*C[ bB ][1][ rB ]) - (3*C[ bB ][0][ rB ]) - C[ bB ][2][ rB ])/2;
		gDroo = ((4*C[ bB ][1][rB+1]) - (3*C[ bB ][0][rB+1]) - C[ bB ][2][rB+1])/2;
		gDoob = ((4*C[bB+1][1][ rB ]) - (3*C[bB+1][0][ rB ]) - C[bB+1][2][ rB ])/2;
		gDrob = ((4*C[bB+1][1][rB+1]) - (3*C[bB+1][0][rB+1]) - C[bB+1][2][rB+1])/2;
	} else {
		gDooo = (Pogo - C[ bB ][gB-1][ rB ])/2;
		gDroo = (Prgo - C[ bB ][gB-1][rB+1])/2;
		gDoob = (Pogb - C[bB+1][gB-1][ rB ])/2;
		gDrob = (Prgb - C[bB+1][gB-1][rB+1])/2;
		gDono = gDooo;
		gDrno = gDroo;
		gDonb = gDoob;
		gDrnb = gDrob;
		if (gB == 1) {
			gDono = ((4*C[ bB ][1][ rB ]) - (3*C[ bB ][0][ rB ]) - C[ bB ][2][ rB ])/2;
			gDrno = ((4*C[ bB ][1][rB+1]) - (3*C[ bB ][0][rB+1]) - C[ bB ][2][rB+1])/2;
			gDonb = ((4*C[bB+1][1][ rB ]) - (3*C[bB+1][0][ rB ]) - C[bB+1][2][ rB ])/2;
			gDrnb = ((4*C[bB+1][1][rB+1]) - (3*C[bB+1][0][rB+1]) - C[bB+1][2][rB+1])/2;
		} else {
			gDono = (Pooo - C[ bB ][gB-1][ rB ])/2;
			gDrno = (Proo - C[ bB ][gB-1][rB+1])/2;
			gDonb = (Poob - C[bB+1][gB-1][ rB ])/2;
			gDrnb = (Prob - C[bB+1][gB-1][rB+1])/2;
		}
	}
	var gDogo, gDrgo, gDogb, gDrgb;
	var gDopo, gDrpo, gDopb, gDrpb;
	if (gB == max - 1) {
		gDogo = (2*C[ bB ][max-2][ rB ]) + ((C[ bB ][max-1][ rB ] - C[ bB ][max-3][ rB ])/2) - (4*C[ bB ][max-1][ rB ]) + (2*C[ bB ][max][ rB ]);
		gDrgo = (2*C[ bB ][max-2][rB+1]) + ((C[ bB ][max-1][rB+1] - C[ bB ][max-3][rB+1])/2) - (4*C[ bB ][max-1][rB+1]) + (2*C[ bB ][max][rB+1]);
		gDogb = (2*C[bB+1][max-2][ rB ]) + ((C[bB+1][max-1][ rB ] - C[bB+1][max-3][ rB ])/2) - (4*C[bB+1][max-1][ rB ]) + (2*C[bB+1][max][ rB ]);
		gDrgb = (2*C[bB+1][max-2][rB+1]) + ((C[bB+1][max-1][rB+1] - C[bB+1][max-3][rB+1])/2) - (4*C[bB+1][max-1][rB+1]) + (2*C[bB+1][max][rB+1]);
	} else {
		gDogo = (C[ bB ][gB+2][ rB ] - Pooo)/2;
		gDrgo = (C[ bB ][gB+2][rB+1] - Proo)/2;
		gDogb = (C[bB+1][gB+2][ rB ] - Poob)/2;
		gDrgb = (C[bB+1][gB+2][rB+1] - Prob)/2;
		gDopo = gDogo;
		gDrpo = gDrgo;
		gDopb = gDogb;
		gDrpb = gDrgb;
		if (gB == max - 2) {
			gDopo = (2*C[ bB ][max-2][ rB ]) + ((C[ bB ][max-1][ rB ] - C[ bB ][max-3][ rB ])/2) - (4*C[ bB ][max-1][ rB ]) + (2*C[ bB ][max][ rB ]);
			gDrpo = (2*C[ bB ][max-2][rB+1]) + ((C[ bB ][max-1][rB+1] - C[ bB ][max-3][rB+1])/2) - (4*C[ bB ][max-1][rB+1]) + (2*C[ bB ][max][rB+1]);
			gDopb = (2*C[bB+1][max-2][ rB ]) + ((C[bB+1][max-1][ rB ] - C[bB+1][max-3][ rB ])/2) - (4*C[bB+1][max-1][ rB ]) + (2*C[bB+1][max][ rB ]);
			gDrpb = (2*C[bB+1][max-2][rB+1]) + ((C[bB+1][max-1][rB+1] - C[bB+1][max-3][rB+1])/2) - (4*C[bB+1][max-1][rB+1]) + (2*C[bB+1][max][rB+1]);
		} else {
			gDopo = (C[ bB ][gB+2][ rB ] - Pogo)/2;
			gDrpo = (C[ bB ][gB+2][rB+1] - Prgo)/2;
			gDopb = (C[bB+1][gB+2][ rB ] - Pogb)/2;
			gDrpb = (C[bB+1][gB+2][rB+1] - Prgb)/2;
		}
	}
// Slope along blue axis at control points
	var bDooo, bDroo, bDogo, bDrgo;
	var bDoon, bDron, bDogn, bDrgn;
	if (bB == 0) {
		bDooo = ((4*C[1][ gB ][ rB ]) - (3*C[0][ gB ][ rB ]) - C[2][ gB ][ rB ])/2;
		bDroo = ((4*C[1][ gB ][rB+1]) - (3*C[0][ gB ][rB+1]) - C[2][ gB ][rB+1])/2;
		bDogo = ((4*C[1][gB+1][ rB ]) - (3*C[0][gB+1][ rB ]) - C[2][gB+1][ rB ])/2;
		bDrgo = ((4*C[1][gB+1][rB+1]) - (3*C[0][gB+1][rB+1]) - C[2][gB+1][rB+1])/2;
		bDoon = bDooo;
		bDron = bDroo;
		bDogn = bDogo;
		bDrgn = bDrgo;
	} else {
		bDooo = (Poob - C[bB-1][ gB ][ rB ])/2;
		bDroo = (Prob - C[bB-1][ gB ][rB+1])/2;
		bDogo = (Pogb - C[bB-1][gB+1][ rB ])/2;
		bDrgo = (Prgb - C[bB-1][gB+1][rB+1])/2;
		if (bB == 1) {
			bDoon = ((4*C[1][ gB ][ rB ]) - (3*C[0][ gB ][ rB ]) - C[2][ gB ][ rB ])/2;
			bDron = ((4*C[1][ gB ][rB+1]) - (3*C[0][ gB ][rB+1]) - C[2][ gB ][rB+1])/2;
			bDogn = ((4*C[1][gB+1][ rB ]) - (3*C[0][gB+1][ rB ]) - C[2][gB+1][ rB ])/2;
			bDrgn = ((4*C[1][gB+1][rB+1]) - (3*C[0][gB+1][rB+1]) - C[2][gB+1][rB+1])/2;
		} else {
			bDoon = (Pooo - C[bB-1][ gB ][ rB ])/2;
			bDron = (Proo - C[bB-1][ gB ][rB+1])/2;
			bDogn = (Pogo - C[bB-1][gB+1][ rB ])/2;
			bDrgn = (Prgo - C[bB-1][gB+1][rB+1])/2;
		}
	}
	var bDoob, bDrob, bDogb, bDrgb;
	var bDoop, bDrop, bDogp, bDrgp;
	if (bB == max - 1) {
		bDoob = (2*C[max-2][ gB ][ rB ]) + ((C[max-1][ gB ][ rB ] - C[max-3][ gB ][ rB ])/2) - (4*C[max-1][ gB ][ rB ]) + (2*C[max][ gB ][ rB ]);
		bDrob = (2*C[max-2][ gB ][rB+1]) + ((C[max-1][ gB ][rB+1] - C[max-3][ gB ][rB+1])/2) - (4*C[max-1][ gB ][rB+1]) + (2*C[max][ gB ][rB+1]);
		bDogb = (2*C[max-2][gB+1][ rB ]) + ((C[max-1][gB+1][ rB ] - C[max-3][gB+1][ rB ])/2) - (4*C[max-1][gB+1][ rB ]) + (2*C[max][gB+1][ rB ]);
		bDrgb = (2*C[max-2][gB+1][rB+1]) + ((C[max-1][gB+1][rB+1] - C[max-3][gB+1][rB+1])/2) - (4*C[max-1][gB+1][rB+1]) + (2*C[max][gB+1][rB+1]);
		bDoop = bDoob;
		bDrop = bDrob;
		bDogp = bDogb;
		bDrgp = bDrgb;
	} else {
		bDoob = (C[bB+2][ gB ][ rB ] - Pooo)/2;
		bDrob = (C[bB+2][ gB ][rB+1] - Proo)/2;
		bDogb = (C[bB+2][gB+1][ rB ] - Pogo)/2;
		bDrgb = (C[bB+2][gB+1][rB+1] - Prgo)/2;
		if (bB == max - 2) {
			bDoop = (2*C[max-2][ gB ][ rB ]) + ((C[max-1][ gB ][ rB ] - C[max-3][ gB ][ rB ])/2) - (4*C[max-1][ gB ][ rB ]) + (2*C[max][ gB ][ rB ]);
			bDrop = (2*C[max-2][ gB ][rB+1]) + ((C[max-1][ gB ][rB+1] - C[max-3][ gB ][rB+1])/2) - (4*C[max-1][ gB ][rB+1]) + (2*C[max][ gB ][rB+1]);
			bDogp = (2*C[max-2][gB+1][ rB ]) + ((C[max-1][gB+1][ rB ] - C[max-3][gB+1][ rB ])/2) - (4*C[max-1][gB+1][ rB ]) + (2*C[max][gB+1][ rB ]);
			bDrgp = (2*C[max-2][gB+1][rB+1]) + ((C[max-1][gB+1][rB+1] - C[max-3][gB+1][rB+1])/2) - (4*C[max-1][gB+1][rB+1]) + (2*C[max][gB+1][rB+1]);
		} else {
			bDoop = (C[bB+2][ gB ][ rB ] - Poob)/2;
			bDrop = (C[bB+2][ gB ][rB+1] - Prob)/2;
			bDogp = (C[bB+2][gB+1][ rB ] - Pogb)/2;
			bDrgp = (C[bB+2][gB+1][rB+1] - Prgb)/2;
		}
	}
// Polynomial coefficiants
	var a,b;
// First calculate four control points along red axis.
	a = (2 * Pooo) + rDooo - (2 * Proo) + rDroo;
	b = - (3 * Pooo) - (2 * rDooo) + (3 * Proo) - rDroo;
	var Poo = (a * r * r * r) + (b * r * r) + (rDooo * r) + Pooo; // Poo
	a = (2 * Pogo) + rDogo - (2 * Prgo) + rDrgo;
	b = - (3 * Pogo) - (2 * rDogo) + (3 * Prgo) - rDrgo;
	var Pgo = (a * r * r * r) + (b * r * r) + (rDogo * r) + Pogo; // Pgo
	a = (2 * Poob) + rDoob - (2 * Prob) + rDrob;
	b = - (3 * Poob) - (2 * rDoob) + (3 * Prob) - rDrob;
	var Pob = (a * r * r * r) + (b * r * r) + (rDoob * r) + Poob; // Pob
	a = (2 * Pogb) + rDogb - (2 * Prgb) + rDrgb;
	b = - (3 * Pogb) - (2 * rDogb) + (3 * Prgb) - rDrgb;
	var Pgb = (a * r * r * r) + (b * r * r) + (rDogb * r) + Pogb; // Pgb
// Now calculate slope along green axis at the new control points
	var gDnoo, gDngo, gDnob, gDngb;
	if (rB == 0) {
		gDnoo = gDooo;
		gDngo = gDogo;
		gDnob = gDoob;
		gDngb = gDogb;
	} else {
		if (gB == 0) {
			gDnoo = ((4*C[ bB ][1][rB-1]) - (3*C[ bB ][0][rB-1]) - C[ bB ][2][rB-1])/2;
			gDnob = ((4*C[bB+1][1][rB-1]) - (3*C[bB+1][0][rB-1]) - C[bB+1][2][rB-1])/2;
		} else {
			gDnoo = (C[ bB ][gB+1][rB-1] - C[ bB ][gB-1][rB-1])/2;
			gDnob = (C[bB+1][gB+1][rB-1] - C[bB+1][gB-1][rB-1])/2;
		}
		if (gB == max - 1) {
			gDngo = (2*C[ bB ][max-2][rB-1]) + ((C[ bB ][max-1][rB-1] - C[ bB ][max-3][rB-1])/2) - (4*C[ bB ][max-1][rB-1]) + (2*C[ bB ][max][rB-1]);
			gDngb = (2*C[bB+1][max-2][rB-1]) + ((C[bB+1][max-1][rB-1] - C[bB+1][max-3][rB-1])/2) - (4*C[bB+1][max-1][rB-1]) + (2*C[bB+1][max][rB-1]);
		} else {
			gDngo = (C[ bB ][gB+2][rB-1] - C[ bB ][ gB ][rB-1])/2;
			gDngb = (C[bB+1][gB+2][rB-1] - C[bB+1][ gB ][rB-1])/2;
		}
	}
	var gDpoo, gDpgo, gDpob, gDpgb;
	if (rB == max - 1) {
		gDpoo = gDroo;
		gDpgo = gDrgo;
		gDpob = gDrob;
		gDpgb = gDrgb;
	} else {
		if (gB == 0) {
			gDpoo = ((4*C[ bB ][1][rB+2]) - (3*C[ bB ][0][rB+2]) - C[ bB ][2][rB+2])/2;
			gDpob = ((4*C[bB+1][1][rB+2]) - (3*C[bB+1][0][rB+2]) - C[bB+1][2][rB+2])/2;
		} else {
			gDpoo = (Prgo - C[ bB ][gB-1][rB+2])/2;
			gDpob = (Prgb - C[bB+1][gB-1][rB+2])/2;
		}
		if (gB == max - 1) {
			gDpgo = (2*C[ bB ][max-2][rB+2]) + ((C[ bB ][max-1][rB+2] - C[ bB ][max-3][rB+2])/2) - (4*C[ bB ][max-1][rB+2]) + (2*C[ bB ][max][rB+2]);
			gDpgb = (2*C[bB+1][max-2][rB+2]) + ((C[bB+1][max-1][rB+2] - C[bB+1][max-3][rB+2])/2) - (4*C[bB+1][max-1][rB+2]) + (2*C[bB+1][max][rB+2]);
		} else {
			gDpgo = (C[ bB ][gB+2][rB+2] - C[ bB ][ gB ][rB+2])/2;
			gDpgb = (C[bB+1][gB+2][rB+2] - C[bB+1][ gB ][rB+2])/2;
		}
	}
	var gDrDooo = (gDroo - gDnoo)/2;
	var gDrDroo = (gDpoo - gDooo)/2;
	var gDrDogo = (gDrgo - gDngo)/2;
	var gDrDrgo = (gDpgo - gDogo)/2;
	var gDrDoob = (gDrob - gDnob)/2;
	var gDrDrob = (gDpob - gDoob)/2;
	var gDrDogb = (gDrgb - gDngb)/2;
	var gDrDrgb = (gDpgb - gDogb)/2;
	a = (2 * gDooo) + gDrDooo - (2 * gDroo) + gDrDroo;
	b = - (3 * gDooo) - (2 * gDrDooo) + (3 * gDroo) - gDrDroo;
	var gDoo = (a * r * r * r) + (b * r * r) + (gDrDooo * r) + gDooo; // gDoo
	a = (2 * gDogo) + gDrDogo - (2 * gDrgo) + gDrDrgo;
	b = - (3 * gDogo) - (2 * gDrDogo) + (3 * gDrgo) - gDrDrgo;
	var gDgo = (a * r * r * r) + (b * r * r) + (gDrDogo * r) + gDogo; // gDgo
	a = (2 * gDoob) + gDrDoob - (2 * gDrob) + gDrDrob;
	b = - (3 * gDoob) - (2 * gDrDoob) + (3 * gDrob) - gDrDrob;
	var gDob = (a * r * r * r) + (b * r * r) + (gDrDoob * r) + gDoob; // gDob
	a = (2 * gDogb) + gDrDogb - (2 * gDrgb) + gDrDrgb;
	b = - (3 * gDogb) - (2 * gDrDogb) + (3 * gDrgb) - gDrDrgb;
	var gDgb = (a * r * r * r) + (b * r * r) + (gDrDogb * r) + gDogb; // gDgb
// Now calculate two control points along the green axis
	a = (2 * Poo) + gDoo - (2 * Pgo) + gDgo;
	b = - (3 * Poo) - (2 * gDoo) + (3 * Pgo) - gDgo;
	var Po = (a * g * g * g) + (b * g * g) + (gDoo * g) + Poo; // Po
	a = (2 * Pob) + gDob - (2 * Pgb) + gDgb;
	b = - (3 * Pob) - (2 * gDob) + (3 * Pgb) - gDgb;
	var Pb = (a * g * g * g) + (b * g * g) + (gDob * g) + Pob; // Pb
// Now find the slope along the blue axis at the four red axis calculated control points
	var bDnoo, bDngo, bDnob, bDngb;
	if (rB == 0) {
		bDnoo = bDooo;
		bDngo = bDogo;
		bDnob = bDoob;
		bDngb = bDogb;
	} else {
		if (bB == 0) {
			bDnoo = ((4*C[1][ gB ][rB-1]) - (3*C[0][ gB ][rB-1]) - C[2][ gB ][rB-1])/2;
			bDngo = ((4*C[1][gB+1][rB-1]) - (3*C[0][gB+1][rB-1]) - C[2][gB+1][rB-1])/2;
		} else {
			bDnoo = (C[bB+1][ gB ][rB-1] - C[bB-1][ gB ][rB-1])/2;
			bDngo = (C[bB+1][gB+1][rB-1] - C[bB-1][gB+1][rB-1])/2;
		}
		if (bB == max - 1) {
			bDnob = (2*C[max-2][ gB ][rB-1]) + ((C[max-1][ gB ][rB-1] - C[max-3][ gB ][rB-1])/2) - (4*C[max-1][ gB ][rB-1]) + (2*C[max][ gB ][rB-1]);
			bDngb = (2*C[max-2][gB+1][rB-1]) + ((C[max-1][gB+1][rB-1] - C[max-3][gB+1][rB-1])/2) - (4*C[max-1][gB+1][rB-1]) + (2*C[max][gB+1][rB-1]);
		} else {
			bDnob = (C[bB+2][ gB ][rB-1] - C[ bB ][ gB ][rB-1])/2;
			bDngb = (C[bB+2][gB+1][rB-1] - C[ bB ][gB+1][rB-1])/2;
		}
	}
	var bDpoo, bDpgo, bDpob, bDpgb;
	if (rB == max - 1) {
		bDpoo = bDroo;
		bDpgo = bDrgo;
		bDpob = bDrob;
		bDpgb = bDrgb;
	} else {
		if (bB == 0) {
			bDpoo = ((4*C[1][ gB ][rB+2]) - (3*C[0][ gB ][rB+2]) - C[2][ gB ][rB+2])/2;
			bDpgo = ((4*C[1][gB+1][rB+2]) - (3*C[0][gB+1][rB+2]) - C[2][gB+1][rB+2])/2;
		} else {
			bDpoo = (C[bB+1][ gB ][rB+2] - C[bB-1][ gB ][rB+2])/2;
			bDpgo = (C[bB+1][gB+1][rB+2] - C[bB-1][gB+1][rB+2])/2;
		}
		if (bB == max - 1) {
			bDpob = (2*C[max-2][ gB ][rB+2]) + ((C[max-1][ gB ][rB+2] - C[max-3][ gB ][rB+2])/2) - (4*C[max-1][ gB ][rB+2]) + (2*C[max][ gB ][rB+2]);
			bDpgb = (2*C[max-2][gB+1][rB+2]) + ((C[max-1][gB+1][rB+2] - C[max-3][gB+1][rB+2])/2) - (4*C[max-1][gB+1][rB+2]) + (2*C[max][gB+1][rB+2]);
		} else {
			bDpob = (C[bB+2][ gB ][rB+2] - C[ bB ][ gB ][rB+2])/2;
			bDpgb = (C[bB+2][gB+1][rB+2] - C[ bB ][gB+1][rB+2])/2;
		}
	}
	var bDrDooo = (bDroo - bDnoo)/2;
	var bDrDroo = (bDpoo - bDooo)/2;
	var bDrDogo = (bDrgo - bDngo)/2;
	var bDrDrgo = (bDpgo - bDogo)/2;
	var bDrDoob = (bDrob - bDnob)/2;
	var bDrDrob = (bDpob - bDoob)/2;
	var bDrDogb = (bDrgb - bDngb)/2;
	var bDrDrgb = (bDpgb - bDogb)/2;
	a = (2 * bDooo) + bDrDooo - (2 * bDroo) + bDrDroo;
	b = - (3 * bDooo) - (2 * bDrDooo) + (3 * bDroo) - bDrDroo;
	var bDoo = (a * r * r * r) + (b * r * r) + (bDrDooo * r) + bDooo; // bDoo
	a = (2 * bDogo) + bDrDogo - (2 * bDrgo) + bDrDrgo;
	b = - (3 * bDogo) - (2 * bDrDogo) + (3 * bDrgo) - bDrDrgo;
	var bDgo = (a * r * r * r) + (b * r * r) + (bDrDogo * r) + bDogo; // bDgo
	a = (2 * bDoob) + bDrDoob - (2 * bDrob) + bDrDrob;
	b = - (3 * bDoob) - (2 * bDrDoob) + (3 * bDrob) - bDrDrob;
	var bDob = (a * r * r * r) + (b * r * r) + (bDrDoob * r) + bDoob; // bDob
	a = (2 * bDogb) + bDrDogb - (2 * bDrgb) + bDrDrgb;
	b = - (3 * bDogb) - (2 * bDrDogb) + (3 * bDrgb) - bDrDrgb;
	var bDgb = (a * r * r * r) + (b * r * r) + (bDrDogb * r) + bDogb; // gDgb
// Now find the slope along the blue axis at eight notional green points (green = -1, green = +2) as was done for red points
	var bDono, bDrno, bDonb, bDrnb;
	if (gB == 0) {
		bDono = bDooo;
		bDrno = bDroo;
		bDonb = bDoob;
		bDrnb = bDrob;
	} else {
		if (bB == 0) {
			bDono = ((4*C[1][gB-1][ rB ]) - (3*C[0][gB-1][ rB ]) - C[2][gB-1][ rB ])/2;
			bDrno = ((4*C[1][gB-1][rB+1]) - (3*C[0][gB-1][rB+1]) - C[2][gB-1][rB+1])/2;
		} else {
			bDono = (C[bB+1][gB-1][ rB ] - C[bB-1][gB-1][ rB ])/2;
			bDrno = (C[bB+1][gB-1][rB+1] - C[bB-1][gB-1][rB+1])/2;
		}
		if (bB == max - 1) {
			bDonb = (2*C[max-2][gB-1][ rB ]) + ((C[max-1][gB-1][ rB ] - C[max-3][gB-1][ rB ])/2) - (4*C[max-1][gB-1][ rB ]) + (2*C[max][gB-1][ rB ]);
			bDrnb = (2*C[max-2][gB-1][rB+1]) + ((C[max-1][gB-1][rB+1] - C[max-3][gB-1][rB+1])/2) - (4*C[max-1][gB-1][rB+1]) + (2*C[max][gB-1][rB+1]);
		} else {
			bDonb = (C[bB+2][gB-1][ rB ] - C[ bB ][gB-1][ rB ])/2;
			bDrnb = (C[bB+2][gB-1][rB+1] - C[ bB ][gB-1][rB+1])/2;
		}
	}
	var bDopo, bDrpo, bDopb, bDrpb;
	if (gB == max - 1) {
		bDopo = bDogo;
		bDrpo = bDrgo;
		bDopb = bDogb;
		bDrpb = bDrgb;
	} else {
		if (bB == 0) {
			bDopo = ((4*C[1][gB+2][ rB ]) - (3*C[0][gB+2][ rB ]) - C[2][gB+2][ rB ])/2;
			bDrpo = ((4*C[1][gB+2][rB+1]) - (3*C[0][gB+2][rB+1]) - C[2][gB+2][rB+1])/2;
		} else {
			bDopo = (C[bB+1][gB+2][ rB ] - C[bB-1][gB+2][ rB ])/2;
			bDrpo = (C[bB+1][gB+2][rB+1] - C[bB-1][gB+2][rB+1])/2;
		}
		if (bB == max - 1) {
			bDopb = (2*C[max-2][gB+2][ rB ]) + ((C[max-1][gB+2][ rB ] - C[max-3][gB+2][ rB ])/2) - (4*C[max-1][gB+2][ rB ]) + (2*C[max][gB+2][ rB ]);
			bDrpb = (2*C[max-2][gB+2][rB+1]) + ((C[max-1][gB+2][rB+1] - C[max-3][gB+2][rB+1])/2) - (4*C[max-1][gB+2][rB+1]) + (2*C[max][gB+2][rB+1]);
		} else {
			bDopb = (C[bB+2][gB+2][ rB ] - C[ bB ][gB+2][ rB ])/2;
			bDrpb = (C[bB+2][gB+2][rB+1] - C[ bB ][gB+2][rB+1])/2;
		}
	}
// Now the blue axis slope at the eight notional corners
	var bDnno, bDnnb;
	if (rB == 0 || gB == 0) {
		bDnno = bDooo;
		bDnnb = bDoob;
	} else {
		if (bB == 0) {
			bDnno = ((4*C[1][gB-1][rB-1]) - (3*C[0][gB-1][rB-1]) - C[2][gB-1][rB-1])/2;
		} else {
			bDnno = (C[bB+1][gB-1][rB-1] - C[bB-1][gB-1][rB-1])/2;
		}
		if (bB == max - 1) {
			bDnnb = (2*C[max-2][gB-1][rB-1]) + ((C[max-1][gB-1][rB-1] - C[max-3][gB-1][rB-1])/2) - (4*C[max-1][gB-1][rB-1]) + (2*C[max][gB-1][rB-1]);
		} else {
			bDnnb = (C[bB+2][gB-1][rB-1] - C[bB][gB-1][rB-1])/2;
		}
	}
	if (rB == 0 || gB == max - 1) {
		bDnpo = bDogo;
		bDnpb = bDogb;
	} else {
		if (bB == 0) {
			bDnpo = ((4*C[1][gB+2][rB-1]) - (3*C[0][gB+2][rB-1]) - C[2][gB+2][rB-1])/2;
		} else {
			bDnpo = (C[bB+1][gB+2][rB-1] - C[bB-1][gB+2][rB-1])/2;
		}
		if (bB == max - 1) {
			bDnpb = (2*C[max-2][gB+2][rB-1]) + ((C[max-1][gB+2][rB-1] - C[max-3][gB+2][rB-1])/2) - (4*C[max-1][gB+2][rB-1]) + (2*C[max][gB+2][rB-1]);
		} else {
			bDnpb = (C[bB+2][gB+2][rB-1] - C[bB][gB+2][rB-1])/2;
		}
	}
	if (rB == max - 1 || gB == 0) {
		bDpno = bDroo;
		bDpnb = bDrob;
	} else {
		if (bB == 0) {
			bDpno = ((4*C[1][gB-1][rB+2]) - (3*C[0][gB-1][rB+2]) - C[2][gB-1][rB+2])/2;
		} else {
			bDpno = (C[bB+1][gB-1][rB+2] - C[bB-1][gB-1][rB+2])/2;
		}
		if (bB == max - 1) {
			bDpnb = (2*C[max-2][gB-1][rB+2]) + ((C[max-1][gB-1][rB+2] - C[max-3][gB-1][rB+2])/2) - (4*C[max-1][gB-1][rB+2]) + (2*C[max][gB-1][rB+2]);
		} else {
			bDpnb = (C[bB+2][gB-1][rB+2] - C[bB][gB-1][rB+2])/2;
		}
	}
	if (rB == max - 1 || gB == max - 1) {
		bDppo = bDrgo;
		bDppb = bDrgb;
	} else {
		if (bB == 0) {
			bDppo = ((4*C[1][gB+2][rB+2]) - (3*C[0][gB+2][rB+2]) - C[2][gB+2][rB+2])/2;
		} else {
			bDppo = (C[bB+1][gB+2][rB+2] - C[bB-1][gB+2][rB+2])/2;
		}
		if (bB == max - 1) {
			bDppb = (2*C[max-2][gB+2][rB+2]) + ((C[max-1][gB+2][rB+2] - C[max-3][gB+2][rB+2])/2) - (4*C[max-1][gB+2][rB+2]) + (2*C[max][gB+2][rB+2]);
		} else {
			bDppb = (C[bB+2][gB+2][rB+2] - C[bB][gB+2][rB+2])/2;
		}
	}
// Now get the blue slope control points along the red axis for calculating blue slope at green control points 8)
	var bDrDono = (bDrno - bDnno)/2;
	var bDrDrno = (bDpno - bDono)/2;
	var bDrDopo = (bDrpo - bDnpo)/2;
	var bDrDrpo = (bDppo - bDopo)/2;
	var bDrDonb = (bDrnb - bDnnb)/2;
	var bDrDrnb = (bDpnb - bDonb)/2;
	var bDrDopb = (bDrpb - bDnpb)/2;
	var bDrDrpb = (bDppb - bDopb)/2;
	a = (2 * bDono) + bDrDono - (2 * bDrno) + bDrDrno;
	b = - (3 * bDono) - (2 * bDrDono) + (3 * bDrno) - bDrDrno;
	var bDno = (a * r * r * r) + (b * r * r) + (bDrDono * r) + bDono; // bDno
	a = (2 * bDopo) + bDrDopo - (2 * bDrpo) + bDrDrpo;
	b = - (3 * bDopo) - (2 * bDrDopo) + (3 * bDrpo) - bDrDrpo;
	var bDpo = (a * r * r * r) + (b * r * r) + (bDrDopo * r) + bDopo; // bDpo
	a = (2 * bDonb) + bDrDonb - (2 * bDrnb) + bDrDrnb;
	b = - (3 * bDonb) - (2 * bDrDonb) + (3 * bDrnb) - bDrDrnb;
	var bDnb = (a * r * r * r) + (b * r * r) + (bDrDonb * r) + bDonb; // bDnb
	a = (2 * bDopb) + bDrDopb - (2 * bDrpb) + bDrDrpb;
	b = - (3 * bDopb) - (2 * bDrDopb) + (3 * bDrpb) - bDrDrpb;
	var bDpb = (a * r * r * r) + (b * r * r) + (bDrDogb * r) + bDopb; // gDpb
// Now calculate the blue slope at the two green control points
	var bDgDoo = (bDgo - bDno)/2;
	var bDgDgo = (bDpo - bDoo)/2;
	var bDgDob = (bDgb - bDnb)/2;
	var bDgDgb = (bDpb - bDob)/2;
	a = (2 * bDoo) + bDgDoo - (2 * bDgo) + bDgDgo;
	b = - (3 * bDoo) - (2 * bDgDoo) + (3 * bDgo) - bDgDgo;
	var bDo = (a * g * g * g) + (b * g * g) + (bDgDoo * g) + bDoo; // bDo
	a = (2 * bDob) + bDgDob - (2 * bDgb) + bDgDgb;
	b = - (3 * bDob) - (2 * bDgDob) + (3 * bDgb) - bDgDgb;
	var bDb = (a * g * g * g) + (b * g * g) + (bDgDob * g) + bDob; // bDb
// Finally we get to the point - literally !
	a = (2 * Po) + bDo - (2 * Pb) + bDb;
	b = - (3 * Po) - (2 * bDo) + (3 * Pb) - bDb;
	return ((a * bl * bl * bl) + (b * bl * bl) + (bDo * bl) + Po); // P
}
LUTs.prototype.rgbRGBLin = function(input) {
	var rgb = input.slice(0);
	if (this.d == 1 && this.R.length == 0) {
		return [this.lumaLLin(rgb[0]),this.lumaLLin(rgb[1]),this.lumaLLin(rgb[2])];
	} else {
		var max = this.s - 1;
		if (this.d == 1) {
			var out = [];
			for (var i = 0; i < 3; i++) {
				var C = [];
				switch (i) {
					case 0: C = this.R;
							break;
					case 1: C = this.G;
							break;
					case 2: C = this.B;
							break;
				}
				var l = rgb[i] * max;
				if (l < 0) {
					var dy = ((4 * C[1]) - (3 * C[0]) - C[2])/2;
					out[i] = C[0] + (l * dy);
				} else if (l >= max) {
					var dy = (0.5 * C[max - 2]) - (2 * C[max - 1]) + (1.5 * C[max]);
					out[i] = C[max] + ((l - max) * dy);
				} else {
					var base = Math.floor(l);
					var dy = l - base;
					out[i] = (C[base] * (1 - dy)) + (C[base + 1] * dy);
				}
			}
			return out;
		} else {
			var out = [];
			rgb[0] = rgb[0] * max;
			rgb[1] = rgb[1] * max;
			rgb[2] = rgb[2] * max;
			var ord = rgb.slice(0).sort(function(a, b){return b-a});
			var rgbIn = rgb.slice(0);
			if (ord[0] >= max) {
				var m = ord[0] * 1.0000000000001 / max;
				rgbIn = [rgb[0]/m,rgb[1]/m,rgb[2]/m];
				var neg = [false,false,false];
				if (rgb[0] < 0) {
					rgbIn[0] = 0;
					neg[0] = true;
				}
				if (rgb[1] < 0) {
					rgbIn[1] = 0;
					neg[1] = true;
				}
				if (rgb[2] < 0) {
					rgbIn[2] = 0;
					neg[2] = true;
				}
				var lR = Math.floor(rgb[0]);
				var rR = rgbIn[0] - lR;
				var lG = Math.floor(rgb[1]);
				var rG = rgbIn[1] - lG;
				var lB = Math.floor(rgb[2]);
				var rB = rgbIn[2] - lB;
				var OOO = [ this.R[ lB ][ lG ][ lR ],this.G[ lB ][ lG ][ lR ],this.B[ lB ][ lG ][ lR ] ];
				var ROO = [ this.R[ lB ][ lG ][lR+1],this.G[ lB ][ lG ][lR+1],this.B[ lB ][ lG ][lR+1] ];
				var OGO = [ this.R[ lB ][lG+1][ lR ],this.G[ lB ][lG+1][ lR ],this.B[ lB ][lG+1][ lR ] ];
				var RGO = [ this.R[ lB ][lG+1][lR+1],this.G[ lB ][lG+1][lR+1],this.B[ lB ][lG+1][lR+1] ];
				var OOB = [ this.R[lB+1][ lG ][ lR ],this.G[lB+1][ lG ][ lR ],this.B[lB+1][ lG ][ lR ] ];
				var ROB = [ this.R[lB+1][ lG ][lR+1],this.G[lB+1][ lG ][lR+1],this.B[lB+1][ lG ][lR+1] ];
				var OGB = [ this.R[lB+1][lG+1][ lR ],this.G[lB+1][lG+1][ lR ],this.B[lB+1][lG+1][ lR ] ];
				var RGB = [ this.R[lB+1][lG+1][lR+1],this.G[lB+1][lG+1][lR+1],this.B[lB+1][lG+1][lR+1] ];
				out = [	(((((OOO[0]*(1-rR))+(ROO[0]*rR))*(1-rG))+(((OGO[0]*(1-rR))+(RGO[0]*rR))*rG))*(1-rB))+(((((OOB[0]*(1-rR))+(ROB[0]*rR))*(1-rG))+(((OGB[0]*(1-rR))+(RGB[0]*rR))*rG))*rB),
						(((((OOO[1]*(1-rR))+(ROO[1]*rR))*(1-rG))+(((OGO[1]*(1-rR))+(RGO[1]*rR))*rG))*(1-rB))+(((((OOB[1]*(1-rR))+(ROB[1]*rR))*(1-rG))+(((OGB[1]*(1-rR))+(RGB[1]*rR))*rG))*rB),
						(((((OOO[2]*(1-rR))+(ROO[2]*rR))*(1-rG))+(((OGO[2]*(1-rR))+(RGO[2]*rR))*rG))*(1-rB))+(((((OOB[2]*(1-rR))+(ROB[2]*rR))*(1-rG))+(((OGB[2]*(1-rR))+(RGB[2]*rR))*rG))*rB)];
				if (neg[0]) {
					out[0] = this.lumaLLin(input[0]);
				} else {
					out[0] = out[0] * this.lumaLLin(input[0])/this.lumaLLin(rgbIn[0]/max);
				}
				if (neg[1]) {
					out[1] = this.lumaLLin(input[1]);
				} else {
					out[1] = out[1] * this.lumaLLin(input[1])/this.lumaLLin(rgbIn[1]/max);
				}
				if (neg[2]) {
					out[2] = this.lumaLLin(input[2]);
				} else {
					out[2] = out[2] * this.lumaLLin(input[2])/this.lumaLLin(rgbIn[2]/max);
				}
				return out;
			} else {
				var neg = [false,false,false];
				if (rgb[0] < 0) {
					rgbIn[0] = 0;
					neg[0] = true;
				}
				if (rgb[1] < 0) {
					rgbIn[1] = 0;
					neg[1] = true;
				}
				if (rgb[2] < 0) {
					rgbIn[2] = 0;
					neg[2] = true;
				}
				var lR = Math.floor(rgb[0]);
				var rR = rgbIn[0] - lR;
				var lG = Math.floor(rgb[1]);
				var rG = rgbIn[1] - lG;
				var lB = Math.floor(rgb[2]);
				var rB = rgbIn[2] - lB;
				var OOO = [ this.R[ lB ][ lG ][ lR ],this.G[ lB ][ lG ][ lR ],this.B[ lB ][ lG ][ lR ] ];
				var ROO = [ this.R[ lB ][ lG ][lR+1],this.G[ lB ][ lG ][lR+1],this.B[ lB ][ lG ][lR+1] ];
				var OGO = [ this.R[ lB ][lG+1][ lR ],this.G[ lB ][lG+1][ lR ],this.B[ lB ][lG+1][ lR ] ];
				var RGO = [ this.R[ lB ][lG+1][lR+1],this.G[ lB ][lG+1][lR+1],this.B[ lB ][lG+1][lR+1] ];
				var OOB = [ this.R[lB+1][ lG ][ lR ],this.G[lB+1][ lG ][ lR ],this.B[lB+1][ lG ][ lR ] ];
				var ROB = [ this.R[lB+1][ lG ][lR+1],this.G[lB+1][ lG ][lR+1],this.B[lB+1][ lG ][lR+1] ];
				var OGB = [ this.R[lB+1][lG+1][ lR ],this.G[lB+1][lG+1][ lR ],this.B[lB+1][lG+1][ lR ] ];
				var RGB = [ this.R[lB+1][lG+1][lR+1],this.G[lB+1][lG+1][lR+1],this.B[lB+1][lG+1][lR+1] ];
				out = [	(((((OOO[0]*(1-rR))+(ROO[0]*rR))*(1-rG))+(((OGO[0]*(1-rR))+(RGO[0]*rR))*rG))*(1-rB))+(((((OOB[0]*(1-rR))+(ROB[0]*rR))*(1-rG))+(((OGB[0]*(1-rR))+(RGB[0]*rR))*rG))*rB),
						(((((OOO[1]*(1-rR))+(ROO[1]*rR))*(1-rG))+(((OGO[1]*(1-rR))+(RGO[1]*rR))*rG))*(1-rB))+(((((OOB[1]*(1-rR))+(ROB[1]*rR))*(1-rG))+(((OGB[1]*(1-rR))+(RGB[1]*rR))*rG))*rB),
						(((((OOO[2]*(1-rR))+(ROO[2]*rR))*(1-rG))+(((OGO[2]*(1-rR))+(RGO[2]*rR))*rG))*(1-rB))+(((((OOB[2]*(1-rR))+(ROB[2]*rR))*(1-rG))+(((OGB[2]*(1-rR))+(RGB[2]*rR))*rG))*rB)];
				if (neg[0]) {
					out[0] = this.lumaLLin(input[0]);
				}
				if (neg[1]) {
					out[1] = this.lumaLLin(input[1]);
				}
				if (neg[2]) {
					out[2] = this.lumaLLin(input[2]);
				}
				return out;
			}
		}
	}
}
