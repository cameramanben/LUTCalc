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
				rRowR[a] = invGamma[rb] + (ry - (rb/s));
				rRowG[a] = invGamma[gb] + (gy - (gb/s));
				rRowB[a] = invGamma[bb] + (by - (bb/s));
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
	if (this.d == 1 && this.R.length == 0) {
		return this.lumaLCub((0.2126*rgb[0]) + (0.7152*rgb[1]) + (0.0722*rgb[2]));
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
					l = l - base;
					out[i] = (a * (l * l * l)) + (b * (l * l)) + (c * l) + d;
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
				out = this.rgbRGBCub(RGB);
				if (neg[0]) {
					out[0] = this.lumaLCub(rgb[0]);
				} else {
					out[0] = out[0] * this.lumaLCub(rgb[0])/this.lumaLCub(RGB[0]);
				}
				if (neg[1]) {
					out[1] = this.lumaLCub(rgb[1]);
				} else {
					out[1] = out[1] * this.lumaLCub(rgb[1])/this.lumaLCub(RGB[1]);
				}
				if (neg[2]) {
					out[2] = this.lumaLCub(rgb[2]);
				} else {
					out[2] = out[2] * this.lumaLCub(rgb[2])/this.lumaLCub(RGB[2]);
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
				out = this.rgbRGBCub(RGB);
				if (neg[0]) {
					out[0] = this.lumaLCub(rgb[0]);
				}
				if (neg[1]) {
					out[1] = this.lumaLCub(rgb[1]);
				}
				if (neg[2]) {
					out[2] = this.lumaLCub(rgb[2]);
				}
				return (0.2126*out[0]) + (0.7152*out[1]) + (0.0722*out[2]);
			}
		}
	}
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
	if (this.d == 1 && this.R.length == 0) {
		return [this.lumaLCub(rgb[0]),this.lumaLCub(rgb[1]),this.lumaLCub(rgb[2])];
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
					l = l - base;
					out[i] = (a * (l * l * l)) + (b * (l * l)) + (c * l) + d;
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
// Interpolation code goes here
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
// End of interpolation code
				if (neg[0]) {
					out[0] = this.lumaLCub(input[0]);
				} else {
					out[0] = out[0] * this.lumaLCub(input[0])/this.lumaLCub(rgbIn[0]/max);
				}
				if (neg[1]) {
					out[1] = this.lumaLCub(input[1]);
				} else {
					out[1] = out[1] * this.lumaLCub(input[1])/this.lumaLCub(rgbIn[1]/max);
				}
				if (neg[2]) {
					out[2] = this.lumaLCub(input[2]);
				} else {
					out[2] = out[2] * this.lumaLCub(input[2])/this.lumaLCub(rgbIn[2]/max);
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
// Interpolation code goes here
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
// End of interpolation code
				if (neg[0]) {
					out[0] = this.lumaLCub(input[0]);
				}
				if (neg[1]) {
					out[1] = this.lumaLCub(input[1]);
				}
				if (neg[2]) {
					out[2] = this.lumaLCub(input[2]);
				}
				return out;
			}
		}
	}
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
