/* lut-la.js
* .lacube and .labin building / parsing for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function lacubeLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
lacubeLUT.prototype.build = function(title, tfBuff, csBuff, params) {
	var tf = new Float64Array(tfBuff);
	var cs;
	// Metadata defaults
	var in1DTF = 'S-Log3'; // system default
	var in1DRG = '109'; // system default
	var in3DTF = 'S-Log3'; // system default
	var in3DCS = 'Sony S-Gamut3.cine'; // system default
	var sysCS = 'Sony S-Gamut3.cine'; // system default
	var in3DRG = '109'; // system default
	// Precision
	var precision = this.messages.getPrecision();	
	// 1D Transfer function
	if (typeof params.in1DTF !== 'undefined') {
		in1DTF = params.in1DTF;
	}
	if (typeof params.in1DEX === 'boolean' && !params.in1DEX) {
		in1DRG = '100';
	}
	var out =	'# LUT Analyst LA LUT File -------------------------------------------------------' + "\n";
	out +=		'TITLE "' + title + '"' + "\n" +
				'LUT_1D_SIZE ' + tf.length.toString() + "\n" +
				'# LUT Analyst - 1D Transfer Function Shaper - ' + in1DTF + '->' + title + ' Gamma' + "\n";
	if (typeof params.baseISO === 'number') {
		out +=	'# LA_BASE_ISO ' + params.baseISO + "\n";
	}
	out +=  '# LA_INPUT_TRANSFER_FUNCTION ' + params.in1DTF + "\n";
	out +=  '# LA_INPUT_RANGE ' + in1DRG + "\n";
	if (typeof params.in1DMin === 'number') {
		out +=	'# LA_INPUT_MIN ' + params.in1DMin + "\n";
	}
	if (typeof params.in1DMax === 'number') {
		out +=	'# LA_INPUT_MAX ' + params.in1DMax + "\n";
	}
	var m = tf.length;
	for (var j=0; j<m; j++) {
		out += tf[j].toFixed(precision).toString() + "\t" + tf[j].toFixed(precision).toString() + "\t" + tf[j].toFixed(precision).toString() + "\n";
	}
	// 3D Colourspace if present
	if (typeof csBuff !== 'undefined' && csBuff) {
		if (typeof params.in3DTF !== 'undefined') {
			in3DTF = params.in3DTF;
		}
		if (typeof params.in3DCS !== 'undefined') {
			in3DCS = params.in3DCS;
		}
		if (typeof params.sysCS !== 'undefined') {
			in3DCS = params.sysCS;
		}
		if (typeof params.in3DEX === 'boolean' && !params.in3DEX) {
			in3DRG = '100';
		}
		cs = [	new Float64Array(csBuff[0]),
				new Float64Array(csBuff[1]),
				new Float64Array(csBuff[2])];
		out +=		'# -------------------------------------------------------------------------------' + "\n";
		out +=  	'TITLE "' + title + '"' + "\n" +
					'LUT_3D_SIZE ' + Math.round(Math.pow(cs[0].length,1/3)).toString() + "\n" +
					'# LUT Analyst - 3D Colour Space Transform - ' + in3DCS + '->' + title + ' Colour' + "\n";
		if (typeof params.interpolation === 'number') {
			switch (params.interpolation) {
				case 0: out +=	'# LA_INTERPOLATION TRICUBIC' + "\n";
					break;
				case 1: out +=	'# LA_INTERPOLATION TETRAHEDRAL' + "\n";
					break;
				case 2: out +=	'# LA_INTERPOLATION TRILINEAR' + "\n";
					break;
			}
		}
		if (typeof params.baseISO === 'number') {
			out +=	'# LA_BASE_ISO ' + params.baseISO + "\n";
		}
		out +=  '# LA_INPUT_TRANSFER_FUNCTION ' + in3DTF + "\n";
		out +=  '# LA_SYSTEM_COLOURSPACE ' + sysCS + "\n";
		out +=  '# LA_INPUT_COLOURSPACE ' + in3DCS + "\n";
		out +=  '# LA_INPUT_RANGE ' + in3DRG + "\n";
		if (typeof params.in3DMin === 'number') {
			out +=	'# LA_INPUT_MIN ' + params.in3DMin + "\n";
		}
		if (typeof params.in3DMax === 'number') {
			out +=	'# LA_INPUT_MAX ' + params.in3DMax + "\n";
		}
		if (typeof params.inputMatrix !== 'undefined') {
			out +=  '# LA_INPUT_MATRIX_R ' + params.inputMatrix[0] + "\t" + params.inputMatrix[1] + "\t" + params.inputMatrix[2] + "\n";
			out +=  '# LA_INPUT_MATRIX_G ' + params.inputMatrix[3] + "\t" + params.inputMatrix[4] + "\t" + params.inputMatrix[5] + "\n";
			out +=  '# LA_INPUT_MATRIX_B ' + params.inputMatrix[6] + "\t" + params.inputMatrix[7] + "\t" + params.inputMatrix[8] + "\n";
		}
		m = cs[0].length;
		for (var j=0; j<m; j++) {
			out += cs[0][j].toFixed(precision).toString() + "\t" + cs[1][j].toFixed(precision).toString() + "\t" + cs[2][j].toFixed(precision).toString() + "\n";
		}
	}
	return out;
};
lacubeLUT.prototype.parse = function(title, text, lutMaker, gammaDest, gamutDest) {
	var max = text.length;
	var parsed = false;
	if (max === 0) {
		return false;
	}
	var gammaText = '';
	var gamutText = '';
	var both = true;
	for (var i = 0; i < max; i++) {
		if (text[i].search('# -------------------------------------------------------------------------------') >= 0) {
			gammaText = text.slice(1,i);
			gamutText = text.slice(i+1,max);
			break;
		} else if (i === max - 1) {
			gammaText = text.slice(0);
			both = false;
		}
	}
	var gammaCube = new cubeLUT(this.messages, this.isLE);
	parsed = gammaCube.parse(title, gammaText, lutMaker, gammaDest);
	if (parsed) {
		if (both) {
			var gamutCube = new cubeLUT(this.messages, this.isLE);
			parsed = gamutCube.parse(title, gamutText, lutMaker, gamutDest);
		} else {
			lutMaker.noCS();
		}
	}
	return parsed;
};
function labinLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
labinLUT.prototype.build = function(title, tfBuff, csBuff, params) {
	var tf = new Float64Array(tfBuff);
	var tfSize = tf.length;
	var out64;
	var cs,csSize;
	if (typeof csBuff !== 'undefined' && csBuff) {
		cs = [	new Float64Array(csBuff[0]),
				new Float64Array(csBuff[1]),
				new Float64Array(csBuff[2]) ];
		csSize = cs[0].length;
		out64 = new Float64Array(2 + tfSize + (3*csSize));
	} else {
		csSize = 0;
		out64 = new Float64Array(2 + tfSize);
	}
	var dim = out64.length;
// Prep input matrix as required (all zeros means no matrix specified)
	var inputMatrix = new Int32Array(9);
	if (typeof params.inputMatrix !== 'undefined') {
		for (var j=0; j<9; j++) {
			if (params.inputMatrix[j] > 19.9) {
				inputMatrix[j] = 2136746230;
				// maximum value for a signed 32-bit int is 2147483647, so leaves a bit of room
				// - and eight digits precision.
			} else if (params.inputMatrix[j] < -19.9) {
				inputMatrix[j] = -2136746230;
			} else {
				inputMatrix[j] = Math.round(params.inputMatrix[j]*107374182.4);
			}
		}
	}
// Prep input transfer function and colourspace info to add to the end of the file as required
	var in1DTF = 'S-Log3'; // system default
	var in1DRG = '109';
	var in1DMin = '0';
	var in1DMax = '1';
	var in3DTF = 'S-Log3'; // system default
	var sysCS = 'Sony S-Gamut3.cine'; // system default
	var in3DCS = 'Sony S-Gamut3.cine'; // system default
	var in3DRG = '109';
	var in3DMin = '0';
	var in3DMax = '1';
	var interpolation = 'unknown';
	var baseISO = 'unknown';
	if (typeof params.in1DTF !== 'undefined') {
		in1DTF = params.in1DTF.replace(/γ/gi,'^');
	}
	if (typeof params.in1DEX === 'boolean' && !params.in1DEX) {
		in1DRG = '100';
	}
	if (typeof params.in1DMin === 'number') {
		in1DMin = params.in1DMin.toFixed(10).toString();
	}
	if (typeof params.in1DMax === 'number') {
		in1DMax = params.in1DMax.toFixed(10).toString();
	}
	if (typeof params.sysCS !== 'undefined') {
		sysCS = params.sysCS;
	}
	if (typeof params.in3DTF !== 'undefined') {
		in3DTF = params.in3DTF.replace(/γ/gi,'^');
	}
	if (typeof params.in3DCS !== 'undefined') {
		in3DCS = params.in3DCS;
	}
	if (typeof params.in3DEX === 'boolean' && !params.in3DEX) {
		in3DRG = '100';
	}
	if (typeof params.in3DMin === 'number') {
		in3DMin = params.in3DMin.toFixed(10).toString();
	}
	if (typeof params.in3DMax === 'number') {
		in3DMax = params.in3DMax.toFixed(10).toString();
	}
	if (typeof params.interpolation === 'number') {
		switch (params.interpolation) {
			case 0: interpolation = 'tricubic';
				break;
			case 1: interpolation = 'tetrahedral';
				break;
			case 2: interpolation = 'trilinear';
				break;
		}
	}
	if (typeof params.baseISO === 'number') {
		baseISO = params.baseISO.toString();
	}
	var inMeta = '1DTF|' + in1DTF +
				 '|1DRG|' + in1DRG +
				 '|1DMIN|' + in1DMin +
				 '|1DMAX|' + in1DMax +
				 '|SYSCS|' + sysCS +
				 '|3DTF|' + in3DTF +
				 '|3DCS|' + in3DCS +
				 '|3DRG|' + in3DRG +
				 '|3DMIN|' + in3DMin +
				 '|3DMAX|' + in3DMax +
				 '|INTERPOLATION|' + interpolation +
				 '|BASEISO|' + baseISO;
	var curChar;
	var m = inMeta.length;
	var metaArray =	[];
	for (var j=0; j<m; j++) { // convert colourspace title string to ASCII code values (ie remove all above code 127);
		curChar = inMeta.charCodeAt(j);
		if (curChar < 128) {
			metaArray.push(curChar);
		}
	}
	var pad = metaArray.length%4;
	if (pad !== 0) {
		pad = 4-pad;
		var space = ' ';
		for (var j=0; j<pad; j++) {
			metaArray.push(space.charCodeAt(0));
		}
	}
	var meta = new Uint8Array(metaArray);
	var metaLength = meta.length;
//
	var out = new Int32Array(dim + 9 + Math.round(metaLength/4)); // internal processing is done on Float64s, files are scaled Int32s for same precision / smaller size
	out64.set(tf,2);
	out[0] = tfSize;
	if (csBuff) {
		out64.set(cs[0], 2 + tfSize);
		out64.set(cs[1], 2 + tfSize + csSize);
		out64.set(cs[2], 2 + tfSize + (2*csSize));
		out[1] = Math.round(Math.pow(csSize,1/3));
	} else {
		out[1] = 0;
	}
	for (var j=2; j<dim; j++) {
		if (out64[j] > 1.99) {
			out[j] = 2136746230;
			// maximum value for a signed 32-bit int is 2147483647, so leaves a bit of room
			// - and nine digits precision - roughly two more than Float32 within -2<x<2.
		} else if (out64[j] < -1.99) {
			out[j] = -2136746230;
		} else {
			out[j] = Math.round(out64[j]*1073741824);
		}
	}
	for (var j=0; j<9; j++) {
		out[j+dim] = inputMatrix[j];
	}
	var byteOut = new Uint8Array(out.buffer);
	var i;
  	if (!this.isLE) { // files are little endian, swap if system is big endian
		console.log('Big Endian System');
  		var lutArr = byteOut;
  		var max = Math.round(lutArr.length / 4); // Float32s === 4 bytes
  		var b0,b1,b2,b3;
  		for (var j=0; j<max; j++) {
  			i = j*4;
  			b0=lutArr[ i ];
  			b1=lutArr[i+1];
  			b2=lutArr[i+2];
  			b3=lutArr[i+3];
  			lutArr[ i ] = b3;
  			lutArr[i+1] = b2;
  			lutArr[i+2] = b1;
  			lutArr[i+3] = b0;
  		}
  	}
// Append TF / CS titles to the end of the file
	i = byteOut.length - metaLength;
	for (var j=0; j<metaLength; j++) {
		byteOut[i+j] = meta[j];
	}
// Send back the complete byte array
  	return byteOut;
//  	return out.buffer;
};
labinLUT.prototype.parse = function(title, buff, lutMaker, gammaDest, gamutDest) {
	var lutArr = new Uint8Array(buff);
	if (!this.isLE) { // files are little endian, swap if system is big endian
		console.log('Gamut LUTs: Big Endian System');
		var max = Math.round(lutArr.length / 4); // Float32s === 4 bytes
		var i,b0,b1,b2,b3;
		for (var j=0; j<max; j++) {
			i = j*4;
			b0=lutArr[ i ];
			b1=lutArr[i+1];
			b2=lutArr[i+2];
			b3=lutArr[i+3];
			lutArr[ i ] = b3;
			lutArr[i+1] = b2;
			lutArr[i+2] = b1;
			lutArr[i+3] = b0;
		}
	}
	var in32 = new Int32Array(buff);
	// Internal processing is Float64, files are scaled Int32
	// 1D Transfer function
	var tfS = in32[0];
	var T = new Float64Array(tfS);
	for (var j=0; j<tfS; j++){
		T[j] = parseFloat(in32[2 + j])/1073741824;
	}
	var dataEnd = 2+tfS;
	// 3D Colourspace if present
	var dim = in32[1];
	var csS,C;
	if (dim > 0) {
		csS = dim*dim*dim;
		C = [	new Float64Array(csS),
				new Float64Array(csS),
				new Float64Array(csS) ];
		for (var j=0; j<csS; j++){
			C[0][j] = parseFloat(in32[((2+tfS)) + j])/1073741824;
			C[1][j] = parseFloat(in32[((2+tfS+csS)) + j])/1073741824;
			C[2][j] = parseFloat(in32[((2+tfS+(2*csS))) + j])/1073741824;
		}
		dataEnd = 2+tfS+(3*csS);
	}
	// get input matrix details (all zeros means no matrix defined)
	var inMX = new Float64Array(9);
	var imM = false;
	if (dataEnd < in32.length) {
		for (var j=0; j<9; j++) {
			if (in32[dataEnd+j] !== 0) {
				imM = true;
				inMX[j] = parseFloat(in32[dataEnd+j])/107374182.4;
			}
		}
		dataEnd += 9;
	}
	if (!imM) {
		inMX = false;
	}
	// look for metadata info at the end of the file if present
	var in1DTF = 'S-Log3'; // system default
	var in3DTF = 'S-Log3'; // system default
	var sysCS = 'Sony S-Gamut3.cine'; // system default
	var in3DCS = 'Sony S-Gamut3.cine'; // system default
	var in1DEX = true; // system default
	var in3DEX = true; // system default
	var in1DMin = [0,0,0];
	var in1DMax = [1,1,1];
	var in3DMin = [0,0,0];
	var in3DMax = [1,1,1];
	var interpolation = false;
	var baseISO = false;
	if (dataEnd < in32.length) {
		dataEnd *= 4;
		var fileEnd = lutArr.length;
		var metaString = '';
		for (var j=dataEnd; j<fileEnd; j++) {
			metaString += String.fromCharCode(lutArr[j]).replace('^','γ');
		}
		if (metaString.search('|') >= 0) {
			var meta = metaString.split('|');
			var m = meta.length;
			if (m > 2) {
				for (var j=0; j<m; j +=2) {
					switch (meta[j]) {
						case '1DTF':
							in1DTF = meta[j+1].trim();
							break;
				 		case '1DRG':
				 			if (meta[j+1].toLowerCase() === '100') {
								in1DEX = false;
							}
							break;
				 		case '1DMIN':
							in1DMin[0] = parseFloat(meta[j+1]);
							if (isNaN(in1DMin[0])) {
								in1DMin[0] = 0;
							} else {
								in1DMin[1] = in1DMin[0];
								in1DMin[2] = in1DMin[0];
							}
							break;
				 		case '1DMAX':
							in1DMax[0] = parseFloat(meta[j+1]);
							if (isNaN(in1DMax[0])) {
								in1DMax[0] = 1;
							} else {
								in1DMax[1] = in1DMax[0];
								in1DMax[2] = in1DMax[0];
							}
							break;
				 		case 'SYSCS':
							sysCS = meta[j+1].trim();
							break;
				 		case '3DTF':
				 			in3DTF = meta[j+1].trim();
							break;
				 		case '3DCS':
				 			in3DCS = meta[j+1].trim();
							break;
				 		case '3DRG':
				 			if (meta[j+1].toLowerCase() === '100') {
								in3DEX = false;
							}
							break;
				 		case '3DMIN':
							in3DMin[0] = parseFloat(meta[j+1]);
							if (isNaN(in3DMin[0])) {
								in3DMin[0] = 0;
							} else {
								in3DMin[1] = in3DMin[0];
								in3DMin[2] = in3DMin[0];
							}
							break;
				 		case '3DMAX':
							in3DMax[0] = parseFloat(meta[j+1]);
							if (isNaN(in3DMax[0])) {
								in3DMax[0] = 1;
							} else {
								in3DMax[1] = in3DMax[0];
								in3DMax[2] = in3DMax[0];
							}
							break;
				 		case 'INTERPOLATION':
							switch (meta[j+1].trim().toLowerCase()) {
								case 'tricubic': interpolation = 0;
									break;
								case 'tetrahedral': interpolation = 1;
									break;
								case 'trilinear': interpolation = 2;
									break;
							}
							break;
				 		case 'BASEISO':
				 			if (meta[j+1].trim().toLowerCase() !== 'unknown') {
					 			baseISO = parseInt(meta[j+1].trim());
					 		}
				 			break;
					}
				}
			} else {
				in1DTF = meta[0].trim();
				in3DCS = meta[1].trim();
			}
		} else {
			in3DCS = metaString;
		}
	}
	// generate the LUT(s)
	var tfOut = {
		title: title,
		format: 'cube',
		dims: 1,
		s: tfS,
		min: in1DMin,
		max: in1DMax,
		C: [T.buffer],
		meta: {
			inputTF: in1DTF,
			inputEX: in1DEX,
			baseISO: baseISO
		}
	};
	if (!lutMaker.setLUT(gammaDest,tfOut)) {
		return false;
	}
	if (dim > 0) {
		var csOut = {
			title: 'cs',
			format: 'cube',
			dims: 3,
			s: dim,
			min: in3DMin,
			max: in3DMax,
			C: [	C[0].buffer,
					C[1].buffer,
					C[2].buffer],
			meta: {
				inputTF: in3DTF,
				systemCS: sysCS,
				inputCS: in3DCS,
				inputEX: in3DEX,
				interpolation: interpolation,
				baseISO: baseISO,
				inputMatrix: inMX
			}
		};
		if (!lutMaker.setLUT(gamutDest,csOut)) {
			return false;
		}
	} else {
		lutMaker.noCS();
	}
	return true;
};
