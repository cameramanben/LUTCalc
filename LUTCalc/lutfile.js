/* lutfile.js
* File I/O handling object for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTFile(inputs) {
	this.inputs = inputs;
	this.filesaver = true;
	try {
		var isFileSaverSupported = !!new Blob();
	} catch(e){
		this.filesaver = false;
	}
}
LUTFile.prototype.save = function(data, fileName, extension) {
    if (this.inputs.isApp) { // From native app detection in lutcalc.js
        return window.lutCalcApp.saveLUT(data, this.filename(fileName), extension);
    } else if (this.filesaver) { // Detect FileSaver.js applicability for browsers other than Safari and older IE
		saveAs(new Blob([data], {type: 'text/plain;charset=UTF-8'}), this.filename(fileName) + '.' + extension);
		return true;
	} else { // Fall back to opening LUT in a new tab for user to save with 'Save As...'
		window.open("data:text/plain," + encodeURIComponent(data),"_blank");
		return true;
	}
}
LUTFile.prototype.saveBinary = function(data, fileName, extension) {
    if (this.inputs.isApp) { // From native app detection in lutcalc.js
        return window.lutCalcApp.saveBIN(new Uint8Array(data), this.filename(fileName), extension);
    } else if (this.filesaver) { // Detect FileSaver.js applicability for browsers other than Safari and older IE
		saveAs(new Blob([data], {type: 'application/octet-binary'}), this.filename(fileName) + '.' + extension);
		return true;
	} else { 
		console.log('Browser does not support file saving.');
		return false;
	}
}
LUTFile.prototype.loadLUTFromInput = function(fileInput, extensions, destination, parentObject, next) {
	if (this.inputs.isApp) {
		window.lutCalcApp.loadLUT(extensions.toString(), destination, parentObject.index, next);
	} else {
		var file = fileInput.files[0];
		var valid = false;
		var dot = file.name.lastIndexOf('.');
		var ext = '';
		if (dot != -1) {
			dot++;
			ext = file.name.substr(dot).toLowerCase();
			var max = extensions.length;
			for (var i=0; i<max; i++) {
				if (ext === extensions[i]) {
					valid = true;
					break;
				}
			}
		}
		if (valid) {
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				var reader = new FileReader();
				var localDestination = this.inputs[destination];
				localDestination.format = ext;
				localDestination.title = file.name.substr(0,file.name.length-ext.length-1);
				if (ext === 'labin') {
					reader.onload = (function(theFile){
						var theDestination = localDestination;
    					return function(e){
    						theDestination.buff = e.target.result;
							parentObject.followUp(next);
    					};
    				})(file);
					reader.onerror = function(theFile) { return function() {
						alert("Error reading file.");
						inputBox.value = '';
					}; }(file);
					reader.readAsArrayBuffer(file);
				} else {
					reader.onload = (function(theFile){
						var theDestination = localDestination;
    					return function(e){
    						theDestination.text = e.target.result.split(/[\n\u0085\u2028\u2029]|\r\n?/);
							parentObject.followUp(next);
    					};
    				})(file);
					reader.onerror = function(theFile) { return function() {
						alert("Error reading file.");
						inputBox.value = '';
					}; }(file);
					reader.readAsText(file);
				}
			} else {
				alert("Can't load LUT - your browser is not set to support Javascript File APIs.");
				fileInput.value = '';
			}
		} else {
			fileInput.value = '';
			alert("LUTCalc does not understand this file.");
		}
	}
}
LUTFile.prototype.loadImgFromInput = function(fileInput, extensions, destination, parentObject, next) {
	if (this.inputs.isApp) {
		window.lutCalcApp.loadImg(extensions.toString(), destination, parentObject.index, next);
	} else {
		var file = fileInput.files[0];
		var valid = false;
		var dot = file.name.lastIndexOf('.');
		var ext = '';
		if (dot != -1) {
			dot++;
			ext = file.name.substr(dot).toLowerCase();
			var max = extensions.length;
			for (var i=0; i<max; i++) {
				if (ext === extensions[i]) {
					valid = true;
					break;
				}
			}
		}
		if (valid) {
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				var reader = new FileReader();
				var localDestination = this.inputs[destination];
				localDestination.format = ext;
				localDestination.title = file.name.substr(0,file.name.length-ext.length-1);
				reader.onload = (function(theFile){
					var theDestination = localDestination;
    				return function(e){
    					theDestination.pic = new Image();
    					theDestination.pic.onload = function(e){
    						theDestination.w = theDestination.pic.width;
	    					theDestination.h = theDestination.pic.height;
	 						parentObject.followUp(next);
    					};
    					theDestination.pic.src = e.target.result;
    				};
    			})(file);
				reader.onerror = function(theFile) { return function() {
					alert("Error reading file.");
					inputBox.value = '';
				}; }(file);
				reader.readAsDataURL(file);
			} else {
				alert("Can't load image - your browser is not set to support Javascript File APIs.");
				fileInput.value = '';
			}
		} else {
			fileInput.value = '';
			alert("LUTCalc does not understand this image type.");
		}
	}
}
LUTFile.prototype.filename = function(filename) {
	return filename.replace(/[^a-z0-9_\-\ ]/gi, '').replace(/[^a-z0-9_\-]/gi, '_');
}
LUTFile.prototype.parseLABin = function(data) {
	var buffer = this.inputs[data].buff;
	var title = this.inputs[data].title;
	if (!this.inputs.isLE) { // files are little endian, swap if system is big endian
		console.log('Gamut LUTs: Big Endian System');
		var lutArr = new Uint8Array(buffer);
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
	var in32 = new Int32Array(buffer);
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
		C: [T.buffer],
		dest: 'tf'
	};
	this.inputs.lutAnalyst.setLUT(tfOut);
	var csOut = {
		title: 'cs',
		format: 'cube',
		dims: 3,
		s: dim,
		min: [0,0,0],
		max: [1,1,1],
		C: [	C[0].buffer,
				C[1].buffer,
				C[2].buffer],
		dest: 'cs'
	};
	this.inputs.lutAnalyst.setLUT(csOut);
	return true;
}
LUTFile.prototype.parseCubeLA = function(data, dest) {
	var text = this.inputs[data].text;
	var title = this.inputs[data].title;
	var dimensions = false;
	var size = false;
	var minimum = [0,0,0];
	var maximum = [1,1,1];
	var max = text.length;
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
				if (!isNaN(vals[0]) && !isNaN(vals[1]) && !isNaN(vals[1])) {
					R[s] = parseFloat(vals[0]);
					G[s] = parseFloat(vals[1]);
					B[s] = parseFloat(vals[2]);
					s++;
				}
			}
		}
		var out = {
				title: title,
				format: 'cube',
				dims: dimensions,
				s: size,
				min: minimum,
				max: maximum,
				C: [R.buffer,G.buffer,B.buffer],
				dest: dest
			};
		this.inputs.lutAnalyst.setLUT(out);
		return true;
	} else {
		return false;
	}
}
LUTFile.prototype.parseLACube = function(data) {
	var max = this.inputs[data].text.length;
	var both = true;
	for (var i = 0; i < max; i++) {
		if (this.inputs[data].text[i].search('# -------------------------------------------------------------------------------') >= 0) {
			this.inputs.laGammaLUT.text = this.inputs[data].text.slice(1,i);
			this.inputs.laGamutLUT.text = this.inputs[data].text.slice(i+1,max);
			break;
		} else if (i === max - 1) {
			this.inputs.laGammaLUT.text = this.inputs[data].text.slice(0);
			both = false;
		}
	}
	if (this.parseCubeLA('laGammaLUT', 'tf')) {
		if (both && !this.parseCubeLA('laGamutLUT', 'cs')) {
			return false;
		} else {
			return true;
		}
	} else {
		return false;
	}
}
LUTFile.prototype.buildLALut = function(title,oneD,threeD) {
	var tf = new Float64Array(oneD);
	var cs = [	new Float64Array(threeD[0]),
				new Float64Array(threeD[1]),
				new Float64Array(threeD[2])];
	var oneDHead =  '# LUT Analyst LA LUT File -------------------------------------------------------' + "\n" +
					'TITLE "' + title + '"' + "\n" +
					'LUT_1D_SIZE ' + tf.length.toString() + "\n" +
					'# LUT Analyst - 1D Transfer Function Shaper - S-Log3->' + title + ' Gamma' + "\n";
	var separator = '# -------------------------------------------------------------------------------' + "\n";
	var threeDHead =  'TITLE "' + title + '"' + "\n" +
					'LUT_3D_SIZE ' + Math.round(Math.pow(cs[0].length,1/3)).toString() + "\n" +
					'# LUT Analyst - 3D Colour Space Transform - S-Gamut3.cine->' + title + ' Colour' + "\n";
	this.save(	oneDHead + this.buildLA1DData(tf) + separator + threeDHead + this.buildLA3DData(cs),
				title,
				'lacube'
	);
}
LUTFile.prototype.buildLA1DData = function(L) {
	var dim = L.length;
	var out = '';
	for (var i=0; i<dim; i++) {
		out += L[i].toFixed(8).toString() + "\t" + L[i].toFixed(8).toString() + "\t" + L[i].toFixed(8).toString() + "\n";
	}
	return out;
}
LUTFile.prototype.buildLA3DData = function(RGB) {
	var dim = RGB[0].length;
	var out = '';
	for (var i=0; i<dim; i++) {
		out += RGB[0][i].toFixed(8).toString() + "\t" + RGB[1][i].toFixed(8).toString() + "\t" + RGB[2][i].toFixed(8).toString() + "\n";
	}
	return out
}
LUTFile.prototype.buildLA1DMethod = function(title,oneD) {
	var L = new Float64Array(oneD);
	var dim = L.length;
	var out = '// ' + title + "\n";
	out += "\t\t" + '{' + "\n";
	out += "\t\t\t" + "format: 'cube'," + "\n";
	out += "\t\t\t" + 'size: ' + dim.toString() + ',' + "\n";
	out += "\t\t\t" + 'min: [0,0,0],' + "\n";
	out += "\t\t\t" + 'max: [1,1,1],' + "\n";
	out += "\t\t\t" + 'lut: new Float64Array(' + "\n";
	out += "\t\t\t\t" + '[ ';
	var lineTot = 0;
	for (var j=0; j<dim; j++) {
		out += L[j].toFixed(16).toString() + ',';
		lineTot = (lineTot+1)%8;
		if (lineTot === 0) {
			out += "\n\t\t\t\t  ";
		}
	}
	out = out.substring(0, out.length - 1) + ' ]' + "\n\t\t\t" + ')' + "\n\t\t" + '}));' + "\n";
	window.open("data:text/plain," + encodeURIComponent(out),"_blank");
}
LUTFile.prototype.buildLABinary = function(title,L,RGB) {
	var tf = new Float64Array(L);
	var cs = [	new Float64Array(RGB[0]),
				new Float64Array(RGB[1]),
				new Float64Array(RGB[2]) ];
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
  	if (!this.inputs.isLE) { // files are little endian, swap if system is big endian
		console.log('Big Endian System');
  		var lutArr = new Uint8Array(out.buffer);
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
  	this.saveBinary(out.buffer,title,'labin');
}
