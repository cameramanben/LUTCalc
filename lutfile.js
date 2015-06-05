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
		window.lutCalcApp.loadLUT(extensions.toString(), destination, parentObject.p, next);
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
		window.lutCalcApp.loadImg(extensions.toString(), destination, parentObject.p, next);
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
