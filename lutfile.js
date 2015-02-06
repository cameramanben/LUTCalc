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
LUTFile.prototype.loadFromInput = function(fileInput, extensions, destination, parentObject, next) {
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
LUTFile.prototype.filename = function(filename) {
	return filename.replace(/[^a-z0-9_\-\ ]/gi, '').replace(/[^a-z0-9_\-]/gi, '_');
}
LUTFile.prototype.parseCubeLA = function(data, dest) {
	var text = this.inputs[data].text;
	var title = 'LUTAnalyst';
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
	var oneDHead =  '# LUT Analyst LA LUT File -------------------------------------------------------' + "\n" +
					'TITLE "' + title + '"' + "\n" +
					'LUT_1D_SIZE ' + oneD.s.toString() + "\n" +
					'# LUT Analyst - 1D Transfer Function Shaper - S-Log3->' + title + ' Gamma' + "\n";
	var separator = '# -------------------------------------------------------------------------------' + "\n";
	var threeDHead =  'TITLE "' + title + '"' + "\n" +
					'LUT_3D_SIZE ' + threeD.s.toString() + "\n" +
					'# LUT Analyst - 3D Colour Space Transform - S-Gamut3.cine->' + title + ' Colour' + "\n";
	return oneDHead + this.buildLA1DData(oneD) + separator + threeDHead + this.buildLA3DData(threeD);
//	return '# S-Gamut3.cine->' + title + ' 3D LUT array for LUTCalc' + "\n" + this.buildLA3DAsArray(threeD);
}
LUTFile.prototype.buildLA1DData = function(lut) {
	var dim = lut.s;
	var out = '';
	for (var i=0; i<dim; i++) {
		out += lut.L[i].toFixed(8).toString() + "\t" + lut.L[i].toFixed(8).toString() + "\t" + lut.L[i].toFixed(8).toString() + "\n";
	}
	return out;
}
LUTFile.prototype.buildLA3DData = function(lut) {
	var dim = lut.s;
	var out = '';
	for (var b=0; b<dim; b++) {
		for (var g=0; g<dim; g++) {
			for (var r=0; r<dim; r++) {
				out +=	lut.R[b][g][r].toFixed(8).toString() + "\t" +
						lut.G[b][g][r].toFixed(8).toString() + "\t" +
						lut.B[b][g][r].toFixed(8).toString() + "\n";
			}
		}
	}
	return out
}
LUTFile.prototype.buildLA3DAsArray = function(lut) {
	var redText,greenText,blueText;
	redText = "\t" + 'out.R =' + "\n";
	greenText = "\t" + 'out.G =' + "\n";
	blueText = "\t" + 'out.B =' + "\n";
	redText += "\t\t" + '[';
	greenText += "\t\t" + '[';
	blueText += "\t\t" + '[';
	for (var b=0; b<33; b++) {
		if (b>0) {
			redText += "\t\t" + ' ';
			greenText += "\t\t" + ' ';
			blueText += "\t\t" + ' ';
		}
		redText += '[';
		greenText += '[';
		blueText += '[';
		for (var g=0; g<33; g++) {
			if (g>0) {
				redText += "\t\t" + '  ';
				greenText += "\t\t" + '  ';
				blueText += "\t\t" + '  ';
			}
			redText += '[';
			greenText += '[';
			blueText += '[';
			for (var r=0; r<33; r++) {
				var R = lut.R[b][g][r];
				var G = lut.G[b][g][r];
				var B = lut.B[b][g][r];
				if (isNaN(R)) {
					redText += '        NaN,';
				} else if (R>=0) {
					redText += ' ' + R.toFixed(8).toString() + ',';
				} else {
					redText += R.toFixed(8).toString() + ',';
				}
				if (isNaN(G)) {
					greenText += '        NaN,';
				} else if (G>=0) {
					greenText += ' ' + G.toFixed(8).toString() + ',';
				} else {
					greenText += G.toFixed(8).toString() + ',';
				}
				if (isNaN(B)) {
					blueText += '        NaN,';
				} else if (B>=0) {
					blueText += ' ' + B.toFixed(8).toString() + ',';
				} else {
					blueText += B.toFixed(8).toString() + ',';
				}
			}
			redText = redText.substring(0, redText.length - 1) + '],' + "\n";
			greenText = greenText.substring(0, greenText.length - 1) + '],' + "\n";
			blueText = blueText.substring(0, blueText.length - 1) + '],' + "\n";
		}
		redText = redText.substring(0, redText.length - 2) + '],' + "\n";
		greenText = greenText.substring(0, greenText.length - 2) + '],' + "\n";
		blueText = blueText.substring(0, blueText.length - 2) + '],' + "\n";
	}
	redText = redText.substring(0, redText.length - 2) + '];' + "\n";
	greenText = greenText.substring(0, greenText.length - 2) + '];' + "\n";
	blueText = blueText.substring(0, blueText.length - 2) + '];' + "\n";
	return (redText+greenText+blueText);
}
