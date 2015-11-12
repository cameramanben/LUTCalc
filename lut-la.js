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
lacubeLUT.prototype.build = function(title, tfBuff, csBuff) {
	var tf = new Float64Array(tfBuff);
	var cs = [	new Float64Array(csBuff[0]),
				new Float64Array(csBuff[1]),
				new Float64Array(csBuff[2])];
	var out =	'# LUT Analyst LA LUT File -------------------------------------------------------' + "\n";
	out +=		'TITLE "' + title + '"' + "\n" +
				'LUT_1D_SIZE ' + tf.length.toString() + "\n" +
				'# LUT Analyst - 1D Transfer Function Shaper - S-Log3->' + title + ' Gamma' + "\n";
	var max = tf.length;
	for (var j=0; j<max; j++) {
		out += tf[j].toFixed(8).toString() + "\t" + tf[j].toFixed(8).toString() + "\t" + tf[j].toFixed(8).toString() + "\n";
	}
	out +=		'# -------------------------------------------------------------------------------' + "\n";
	out +=  	'TITLE "' + title + '"' + "\n" +
				'LUT_3D_SIZE ' + Math.round(Math.pow(cs[0].length,1/3)).toString() + "\n" +
				'# LUT Analyst - 3D Colour Space Transform - S-Gamut3.cine->' + title + ' Colour' + "\n";
	max = cs[0].length;
	for (var j=0; j<max; j++) {
		out += cs[0][j].toFixed(8).toString() + "\t" + cs[1][j].toFixed(8).toString() + "\t" + cs[2][j].toFixed(8).toString() + "\n";
	}
	return out;
};
lacubeLUT.prototype.parse = function(title, text, gammaLut, gamutLut) {
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
	parsed = gammaCube.parse(title, gammaText, gammaLut);
	if (both && parsed) {
		var gamutCube = new cubeLUT(this.messages, this.isLE);
		parsed = gamutCube.parse(title, gamutText, gamutLut);
	}
	return parsed;
};
function labinLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
labinLUT.prototype.build = function(title, tfBuff, csBuff) {
	var tf = new Float64Array(tfBuff);
	var cs = [	new Float64Array(csBuff[0]),
				new Float64Array(csBuff[1]),
				new Float64Array(csBuff[2]) ];
	var tfSize = tf.length;
	var csSize = cs[0].length;
	var out64 = new Float64Array(2 + tfSize + (3*csSize));
	out64.set(tf,2);
	out64.set(cs[0], 2 + tfSize);
	out64.set(cs[1], 2 + tfSize + csSize);
	out64.set(cs[2], 2 + tfSize + (2*csSize));
	var dim = out64.length;
	var out = new Int32Array(dim); // internal processing is done on Float64s, files are scaled Int32s for same precision / smaller size
	out[0] = tfSize;
	out[1] = Math.round(Math.pow(csSize,1/3));
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
	var byteOut = new Uint8Array(out.buffer);
  	if (!this.isLE) { // files are little endian, swap if system is big endian
		console.log('Big Endian System');
  		var lutArr = byteOut;
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
  	return byteOut;
//  	return out.buffer;
};
labinLUT.prototype.parse = function(title, buff, gammaLut, gamutLut) {
	if (!this.isLE) { // files are little endian, swap if system is big endian
		console.log('Gamut LUTs: Big Endian System');
		var lutArr = new Uint8Array(buff);
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
	var tfS = in32[0];
	var dim = in32[1];
	var csS = dim*dim*dim;
	// Internal processing is Float64, files are scaled Int32
	var T = new Float64Array(tfS);
	for (var j=0; j<tfS; j++){
		T[j] = parseFloat(in32[2 + j])/1073741824;
	}
	var C = [	new Float64Array(csS),
				new Float64Array(csS),
				new Float64Array(csS) ];
	for (var j=0; j<csS; j++){
		C[0][j] = parseFloat(in32[((2+tfS)) + j])/1073741824;
		C[1][j] = parseFloat(in32[((2+tfS+csS)) + j])/1073741824;
		C[2][j] = parseFloat(in32[((2+tfS+(2*csS))) + j])/1073741824;
	}
	var tfOut = {
		title: title,
		format: 'cube',
		dims: 1,
		s: tfS,
		min: [0,0,0],
		max: [1,1,1],
		C: [T.buffer]
	};
	gammaLut.setDetails(tfOut);
	var csOut = {
		title: 'cs',
		format: 'cube',
		dims: 3,
		s: dim,
		min: [0,0,0],
		max: [1,1,1],
		C: [	C[0].buffer,
				C[1].buffer,
				C[2].buffer]
	};
	gamutLut.setDetails(csOut);
	if (T.length > 0 || C[0].length > 0) {
		return true;
	} else {
		return false;
	}
};