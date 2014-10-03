function LUTFile(inputs) {
	this.inputs = inputs;
	this.filesaver = true;
	try {
		var isFileSaverSupported = !!new Blob();
	} catch(e){
		this.filesaver = false;
	}
}
LUTFile.prototype.save = function(data, extension) {
/* Remove Sentenza Desktop code
	if (typeof Stz != 'undefined') { // Detect Sentenza Desktop for Mac App version
		if (Stz.fileAccessible_(Stz.pathDesktop_() + '/LUTCalc') != true) {
			Stz.newDirectory_(Stz.pathDesktop_() + '/LUTCalc');
			if (Stz.fileAccessible_(Stz.pathDesktop_() + '/LUTCalc') != true) {
				Stz.messageBox_({title:'LUTCalc Problem', message:'Folder Desktop/LUTCalc' + ' Unavailable'});
				return false;
			}
		}
		Stz.writeStringsToFile_({path:Stz.pathDesktop_() + '/LUTCalc', filename:this.filename() + '.' + extension, content:data});
		Stz.messageBox_({title:'LUT Generated', message:'LUT Saved in Desktop/LUTCalc as ' + this.filename() + '.' + extension});
		return true;
	} else
*/
	if (this.filesaver) { // Detect FileSaver.js applicability for browsers other than Safari and older IE
		saveAs(new Blob([data], {type: 'text/plain;charset=UTF-8'}), this.filename() + '.' + extension);
		return true;
	} else { // Fall back to opening LUT in a new tab for user to save with 'Save As...'
		window.open("data:text/plain," + encodeURIComponent(data),"_blank");
		return true;
	}
}
LUTFile.prototype.filename = function() {
	return this.inputs.name.value.replace(/[^a-z0-9_\-\ ]/gi, '').replace(/[^a-z0-9_\-]/gi, '_');
}
