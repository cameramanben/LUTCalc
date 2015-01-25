/* lalut.js
* LA LUT calculation extensions to LUTs object for the LUTCalc Web App.
* 31st December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
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
				var den = (gamma[low+1] - gamma[low]);
				var l = 0.5;
				if (den != 0) {
					l = (aim - gamma[low])/den; //First approximation
				}
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
						invGamma[i] = NaN;
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
	var minX = invGamma[minY];
	var maxX = invGamma[maxY];
	if (isNaN(minX)) {
		for (i=minY; i<invDim; i++) {
			if (!isNaN(invGamma[i])) {
				minY = i;
				minX = invGamma[minY];
				break;
			}
		}
	}
	if (isNaN(maxX)) {
		for (i=maxY; i>0; i--) {
			if (!isNaN(invGamma[i])) {
				maxY = i;
				maxX = invGamma[maxY];
				break;
			}
		}
	}
	var minD = ((4 * invGamma[minY+1]) - (3 * invGamma[minY]) - invGamma[minY+2])/2;
	var maxD = (0.5 * invGamma[maxY - 2]) - (2 * invGamma[maxY - 1]) + (1.5 * invGamma[maxY]);
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
				if (rRowR[a] < -65535) {
					rRowR[a] = -65535;
				} else if (rRowR[a] > 65535) {
					rRowR[a] = 65535;
				}
				if (rRowG[a] < -65535) {
					rRowG[a] = -65535;
				} else if (rRowG[a] > 65535) {
					rRowG[a] = 65535;
				}
				if (rRowB[a] < -65535) {
					rRowB[a] = -65535;
				} else if (rRowB[a] > 65535) {
					rRowB[a] = 65535;
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
