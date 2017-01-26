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
	// 1D Transfer function
	var inputTF = 'S-Log3';
	if (typeof params.inputTF !== 'undefined') {
		inputTF = params.inputTF;
	}
	var out =	'# LUT Analyst LA LUT File -------------------------------------------------------' + "\n";
	out +=		'TITLE "' + title + '"' + "\n" +
				'LUT_1D_SIZE ' + tf.length.toString() + "\n" +
				'# LUT Analyst - 1D Transfer Function Shaper - ' + inputTF + '->' + title + ' Gamma' + "\n";
	if (typeof params.inputTF !== 'undefined') {
		out +=  '# LA_INPUT_TRANSFER_FUNCTION ' + params.inputTF + "\n";
	}
	var m = tf.length;
	for (var j=0; j<m; j++) {
		out += tf[j].toFixed(8).toString() + "\t" + tf[j].toFixed(8).toString() + "\t" + tf[j].toFixed(8).toString() + "\n";
	}
	// 3D Colourspace if present
	if (typeof csBuff !== 'undefined' && csBuff) {
		var inputCS = 'S-Gamut3.cine';
		if (typeof params.inputCS !== 'undefined') {
			inputCS = params.inputCS;
		}
		cs = [	new Float64Array(csBuff[0]),
				new Float64Array(csBuff[1]),
				new Float64Array(csBuff[2])];
		out +=		'# -------------------------------------------------------------------------------' + "\n";
		out +=  	'TITLE "' + title + '"' + "\n" +
					'LUT_3D_SIZE ' + Math.round(Math.pow(cs[0].length,1/3)).toString() + "\n" +
					'# LUT Analyst - 3D Colour Space Transform - ' + inputCS + '->' + title + ' Colour' + "\n";
		if (typeof params.inputTF !== 'undefined') {
			out +=  '# LA_INPUT_TRANSFER_FUNCTION ' + params.inputTF + "\n";
		}
		if (typeof params.inputCS !== 'undefined') {
			out +=  '# LA_INPUT_COLOURSPACE ' + params.inputCS + "\n";
		}
		if (typeof params.inputMatrix !== 'undefined') {
			out +=  '# LA_INPUT_MATRIX_R ' + params.inputMatrix[0] + "\t" + params.inputMatrix[1] + "\t" + params.inputMatrix[2] + "\n";
			out +=  '# LA_INPUT_MATRIX_G ' + params.inputMatrix[3] + "\t" + params.inputMatrix[4] + "\t" + params.inputMatrix[5] + "\n";
			out +=  '# LA_INPUT_MATRIX_B ' + params.inputMatrix[6] + "\t" + params.inputMatrix[7] + "\t" + params.inputMatrix[8] + "\n";
		}
		m = cs[0].length;
		for (var j=0; j<m; j++) {
			out += cs[0][j].toFixed(8).toString() + "\t" + cs[1][j].toFixed(8).toString() + "\t" + cs[2][j].toFixed(8).toString() + "\n";
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
	if (typeof params.inputCS !== 'undefined') {
		var inputCS = params.inputCS;
		var curChar;
		var csArray = [];
		var tfArray = [];
		var m = inputCS.length;
		for (var j=0; j<m; j++) { // convert colourspace title string to ASCII code values (ie remove all above code 127);
			curChar = inputCS.charCodeAt(j);
			if (curChar < 128) {
				csArray.push(curChar);
			}
		}
		if (typeof params.inputTF !== 'undefined') {
			var inputTF = params.inputTF.replace(/γ/gi,'^');
			m = inputTF.length;
			for (var j=0; j<m; j++) { // convert transfer function title string to ASCII code values (ie remove all above code 127);
				curChar = inputTF.charCodeAt(j);
				if (curChar < 128) {
					tfArray.push(curChar);
				}
			}
		}
		if (csArray.length > 0) {
			if (tfArray.length > 0) {
				var pipe = '|';
				tfArray.push(pipe.charCodeAt(0));
			}
			csArray = tfArray.concat(csArray);
			var pad = csArray.length%4;
			if (pad !== 0) {
				pad = 4-pad;
				var space = ' ';
				for (var j=0; j<pad; j++) {
					csArray.push(space.charCodeAt(0));
				}
			}
		}
		var tfcs = new Uint8Array(csArray);
		var tfcsLength = tfcs.length;
	}
//
	var out = new Int32Array(dim + 9 + Math.round(tfcsLength/4)); // internal processing is done on Float64s, files are scaled Int32s for same precision / smaller size
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
	i = byteOut.length - tfcs.length;
	for (var j=0; j<tfcsLength; j++) {
		byteOut[i+j] = tfcs[j];
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
	var inputMatrix = new Float64Array(9);
	var imM = false;
	if (dataEnd < in32.length) {
		for (var j=0; j<9; j++) {
			if (in32[dataEnd+j] !== 0) {
				imM = true;
				inputMatrix[j] = parseFloat(in32[dataEnd+j])/107374182.4;
			}
		}
		dataEnd += 9;
	}
	if (!imM) {
		inputMatrix = false;
	}
	// look for input matrix, colourspace and transfer function info at the end of the file if present
	var inputTF = '';
	var inputCS = '';
	if (dataEnd < in32.length) {
		dataEnd *= 4;
		var fileEnd = lutArr.length;
		var csDets = '';
		for (var j=dataEnd; j<fileEnd; j++) {
			csDets += String.fromCharCode(lutArr[j]).replace('^','γ');
		}
		if (csDets.search('|') >= 0) {
			var tfcsArray = csDets.split('|');
			inputTF = tfcsArray[0].trim();
			inputCS = tfcsArray[1].trim();
		} else {
			inputCS = csDets;
		}
	}
	// generate the LUT(s)
	var tfOut = {
		title: title,
		format: 'cube',
		inputTF: inputTF,
		dims: 1,
		s: tfS,
		min: [0,0,0],
		max: [1,1,1],
		C: [T.buffer]
	};
	if (!lutMaker.setLUT(gammaDest,tfOut)) {
		return false;
	}
	if (dim > 0) {
		var csOut = {
			title: 'cs',
			format: 'cube',
			inputTF: inputTF,
			inputCS: inputCS,
			inputMatrix: inputMatrix,
			dims: 3,
			s: dim,
			min: [0,0,0],
			max: [1,1,1],
			C: [	C[0].buffer,
					C[1].buffer,
					C[2].buffer]
		};
		if (!lutMaker.setLUT(gamutDest,csOut)) {
			return false;
		}
	} else {
		lutMaker.noCS();
	}
	return true;
};
