/* lutpreview.js
* Realtime preview object for the LUTCalc Web App.
* 18th February 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTPreview(fieldset,inputs,message,file) {
	this.box = document.createElement('fieldset');
	this.fieldSet = fieldset;
	this.inputs = inputs;
	this.message = message;
	this.file = file;
	this.p = 8;
	this.message.addUI(this.p,this);
	this.main = document.getElementById('main');
	this.right = document.getElementById('right');
	this.preButton = document.createElement('input');
	this.inputs.addInput('preButton',this.preButton);
	this.drButton = document.createElement('input');
	this.inputs.addInput('drButton',this.drButton);
	this.fileButton = document.createElement('input');
	this.inputs.addInput('preFileButton',this.fileButton);
	this.fileInput = document.createElement('input');
	this.inputs.addInput('preFileInput',this.fileInput);
	this.inputs.addInput('preFileData',{});
	this.hdrDefault = true;
	this.width = 960;
	this.height = 540;
	this.rastSize = this.width*8*3;
	this.eiMult = 1;
	this.show = false;
	this.changed = false;
	this.line=0;
	this.buildBox();
	fieldset.appendChild(this.box);
	fieldset.style.width = '48em';	
	fieldset.style.display = 'none';
}
LUTPreview.prototype.buildBox = function() {
	this.preButton.setAttribute('type','button');
	this.preButton.value = 'Preview';
	this.drButton.setAttribute('type','button');
	this.drButton.value = 'To Low Contrast Image';
	this.fileButton.setAttribute('type','button');
	this.fileInput.setAttribute('type','file');
	this.fileInput.style.display = 'none';
	this.box.appendChild(this.fileInput);
	this.fileButton.value = 'Load Preview...';
	this.fileButton.style.display = 'none';
	this.pCan = document.createElement('canvas');
	this.pCan.width = this.width.toString();
	this.pCan.height = this.height.toString();
	this.pCan.style.width = '48em';
	this.pCan.style.height = '27em';
	this.pCtx = this.pCan.getContext('2d');
	this.pData = this.pCtx.createImageData(this.width,this.height);
	this.box.appendChild(this.pCan);
	this.lCan = document.createElement('canvas');
	this.lCan.width = this.width.toString();
	this.lCan.height = this.height.toString();
	this.lCan.style.width = '48em';
	this.lCan.style.height = '27em';
	this.lCan.style.display = 'none';
	this.lCtx = this.lCan.getContext('2d');
	this.box.appendChild(this.lCan);
	this.buildPopup();
	this.loadDefault(true);
}
LUTPreview.prototype.buildPopup = function() {
	this.preCSBoxHolder = document.createElement('div');
	this.inputs.addInput('preBox',this.preCSBoxHolder);	
	this.preCSBoxHolder.style.display = 'none';
	this.preCSBoxHolder.setAttribute('class','popupholder');
	this.preCSBox = document.createElement('div');
	this.preCSBox.setAttribute('class','popup');
	this.preGammaSelect = document.createElement('select');
	this.inputs.addInput('preGammaSelect',this.preGammaSelect);	
	this.preGamutSelect = document.createElement('select');
	this.inputs.addInput('preGamutSelect',this.preGamutSelect);	
	this.preLegalRange = this.createRadioElement('prerange', false);
	this.preDataRange = this.createRadioElement('prerange', true);
	this.inputs.addInput('preRange',[this.preLegalRange,this.preDataRange]);	
	this.preOKButton = document.createElement('input');
	this.inputs.addInput('preOK',this.preOKButton);	
	this.preOKButton.setAttribute('type','button');
	this.preOKButton.value = 'OK';
	this.preCancelButton = document.createElement('input');
	this.inputs.addInput('preCancel',this.preCancelButton);	
	this.preCancelButton.setAttribute('type','button');
	this.preCancelButton.value = 'Cancel';
	this.preCSBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Loading Preview Image')));
	this.preCSBox.appendChild(document.createElement('br'));
	this.preCSBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Image Gamma')));
	this.preCSBox.appendChild(this.preGammaSelect);
	this.preCSBox.appendChild(document.createElement('br'));
	this.preCSBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Image Colour Space')));
	this.preCSBox.appendChild(this.preGamutSelect);
	this.preCSBox.appendChild(document.createElement('br'));
	this.preCSBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Legal Range')));
	this.preCSBox.appendChild(this.preLegalRange);
	this.preCSBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Data Range')));
	this.preCSBox.appendChild(this.preDataRange);
	this.preCSBox.appendChild(document.createElement('br'));
	this.preCSBox.appendChild(this.preOKButton);
	this.preCSBox.appendChild(this.preCancelButton);
	this.preCSBoxHolder.appendChild(this.preCSBox);
	document.getElementById('body').appendChild(this.preCSBoxHolder);
}
LUTPreview.prototype.preSelects = function() {
	this.preGammaSelect.length = 0;
	this.preGamutSelect.length = 0;
	var max1 = this.inputs.inGamma.options.length;
	var max2 = this.inputs.inLinGamma.options.length;
	for (var j=0; j<max1; j++) {
		if (this.inputs.inGamma.options[j].value === '9999') {
			for (var k=0; k<max2; k++) {
				var option = document.createElement('option');
				option.value = this.inputs.inLinGamma.options[k].value;
				option.appendChild(this.inputs.inLinGamma.options[k].lastChild.cloneNode(false));
				this.preGammaSelect.appendChild(option);
			}
		} else {
			var option = document.createElement('option');
			option.value = this.inputs.inGamma.options[j].value;
			option.appendChild(this.inputs.inGamma.options[j].lastChild.cloneNode(false));
			this.preGammaSelect.appendChild(option);
		}
	}
	var max1 = this.inputs.inGamut.options.length;
	for (var j=0; j<max1; j++) {
		if (this.inputs.inGamut.options[j].lastChild.data !== 'Passthrough') {
			var option = document.createElement('option');
			option.value = this.inputs.inGamut.options[j].value;
			option.appendChild(this.inputs.inGamut.options[j].lastChild.cloneNode(false));
			this.preGamutSelect.appendChild(option);
		}
	}
	this.preCSBoxHolder.style.display = 'block';
}
LUTPreview.prototype.setUIs = function(generateBox,lutbox) {
	this.lutbox = lutbox;
	this.generateButton = generateBox.button;
	generateBox.box.insertBefore(this.preButton,generateBox.button);
	generateBox.box.insertBefore(this.drButton,generateBox.button);
	generateBox.box.insertBefore(this.fileButton,generateBox.button);
	this.drButton.style.display = 'none';
}
LUTPreview.prototype.toggle = function() {
	if (this.show) {
		main.style.width = '69em';
		right.style.width = '34em';
		this.fieldSet.style.display = 'none';
		this.lutbox.style.display = 'block';
		this.fileButton.style.display = 'none';
		this.generateButton.style.display = 'inline';
		this.drButton.style.display = 'none';
		this.show = false;
		this.preButton.value = 'Preview';
	} else {
		main.style.width = '86em';
		right.style.width = '52em';
		this.fieldSet.style.display = 'block';
		this.lutbox.style.display = 'none';
		this.fileButton.style.display = 'inline';
		this.generateButton.style.display = 'none';
		this.drButton.style.display = 'inline';
		this.show = true;
		this.preButton.value = 'Hide Preview';
		this.refresh();
	}
}
LUTPreview.prototype.toggleDefault = function() {
	if (this.hdrDefault) {
		this.changed = true;
		this.drButton.value = 'To High Contrast Image';
		this.hdrDefault = false;
		this.loadDefault(false);
	} else {
		this.changed = true;
		this.drButton.value = 'To Low Contrast Image';
		this.hdrDefault = true;
		this.loadDefault(true);
	}
}
LUTPreview.prototype.loadDefault = function(hdr) {
	this.gotMSB = false;
	this.gotLSB = false;
	var msb = new Image();
	var lsb = new Image();
	msb.onload = (function(input) {
		var box = input.box;
		var MSB = input.msb;
		return function(e) {
			box.pCtx.drawImage(MSB,0,0);
			box.gotMSB = true;
			box.loadedDefault();
		};
	})({
		box: this,
		msb: msb
	});
	lsb.onload = (function(input) {
		var box = input.box;
		var LSB = input.lsb;
		return function(e) {
			box.lCtx.drawImage(LSB,0,0);
			box.gotLSB = true;
			box.loadedDefault();
		};
	})({
		box: this,
		lsb: lsb
	});
	if (hdr) {
		msb.src = "HDRPreviewMSB.png";
		lsb.src = "HDRPreviewLSB.png";
	} else {
		msb.src = "LDRPreviewMSB.png";
		lsb.src = "LDRPreviewLSB.png";
	}
}
LUTPreview.prototype.loadedDefault = function() {
	if (this.gotLSB && this.gotMSB) {
		// Convert 8-bit Most Significant Bits (MSB) and Least Significant Bits (LSB) S-Log3 pngs into a Float64 Array
		// of linear RGB values
		var lsb = this.lCtx.getImageData(0,0,960,540);
		var msb = this.pCtx.getImageData(0,0,960,540);
		var max = Math.round(msb.data.length/4);
		this.pre = new Float64Array(max*3);
		for (var j=0; j<max; j++) {
			this.pre[(j*3)+0] = this.sl3ToLin(parseFloat((msb.data[(j*4)+0]*256)+lsb.data[(j*4)+0])/65535);
			this.pre[(j*3)+1] = this.sl3ToLin(parseFloat((msb.data[(j*4)+1]*256)+lsb.data[(j*4)+1])/65535);
			this.pre[(j*3)+2] = this.sl3ToLin(parseFloat((msb.data[(j*4)+2]*256)+lsb.data[(j*4)+2])/65535);
		}
	}
	if (this.changed) {
		this.refresh();
	}
}
LUTPreview.prototype.sl3ToLin = function(input) {
 	if (input >= 0.1673609920) {
		return (Math.pow(10,(input - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
	} else {
		return (0.1677922920*input) - 0.0155818840;
	}
}
LUTPreview.prototype.isChanged = function(eiMult) {
	this.changed = true;
	if (typeof eiMult === 'number') {
		this.eiMult = eiMult;
	}
	if (this.show) {
		this.refresh();
	}
}
LUTPreview.prototype.gotLine = function(data) {
	var raster = new Uint8Array(data.o);
	this.pData.data.set(raster,data.line*this.width*4);
	if (this.line === this.height-1) {
		this.pCtx.putImageData(this.pData,0,0);
		this.line = 0;
		if (this.show && this.changed) {
			this.refresh();
		}
	} else if (this.show) {
		this.line++;
		var input = {line: this.line, o: this.pre.buffer.slice(this.line*this.rastSize,(this.line+1)*this.rastSize), eiMult: this.eiMult, to: ['o']}
		if (this.inputs.d[0].checked) {
			this.message.gaTx(this.p,12,input);
		} else {
			this.message.gtTx(this.p,12,input);
		}
	}
}
LUTPreview.prototype.refresh = function() {
	if (typeof this.pre !== 'undefined') {
		this.changed = false;
		var max = Math.max(this.message.getGammaThreads(),this.message.getGamutThreads());
		for (var j=0; j<max; j++) {
			this.line = j;
			var input = {line: this.line, o: this.pre.buffer.slice(this.line*this.rastSize,(this.line+1)*this.rastSize), eiMult: this.eiMult, to: ['o']};
			if (this.inputs.d[0].checked) {
				this.message.gaTx(this.p,12,input);
			} else {
				this.message.gtTx(this.p,12,input);
			}
		}
	}
}
LUTPreview.prototype.preGetImg = function() {
	var validExts = ['jpg','png','bmp'];
	if (this.inputs.isApp || this.fileInput.value !== '') {
		this.file.loadImgFromInput(this.fileInput, validExts, 'preFileData', this, 0);
	}
}
LUTPreview.prototype.preGotImg = function() {
    var w = this.inputs.preFileData.w;
	var h = this.inputs.preFileData.h;
	var wS = 960;
	var hS = h * wS / w;
	var fCan = document.createElement('canvas');
	fCan.width = '960';
	fCan.height = '540';
	var fCtx = fCan.getContext('2d');
	fCtx.drawImage(this.inputs.preFileData.pic,0,0,wS,hS);
	var f = fCtx.getImageData(0,0,960,540);
	var max = Math.round(f.data.length/4);
	this.preIn = new Float64Array(max*3);
	var r,g,b;
	var k=0;
	for (var j=0; j<max; j++) {
		this.preIn[(j*3)+0] = parseFloat(f.data[(j*4)+0])/255;
		this.preIn[(j*3)+1] = parseFloat(f.data[(j*4)+1])/255;
		this.preIn[(j*3)+2] = parseFloat(f.data[(j*4)+2])/255;
	}
	this.preSelects();
}
LUTPreview.prototype.prepPreview = function() {
	this.message.gaTx(8,14,{
		gamma: parseInt(this.preGammaSelect.options[this.preGammaSelect.options.selectedIndex].value),
		gamut: parseInt(this.preGamutSelect.options[this.preGamutSelect.options.selectedIndex].value),
		legal: this.preLegalRange.checked,
		i: this.preIn.buffer
	});
}
LUTPreview.prototype.preppedPreview = function(buff) {
	this.pre = new Float64Array(buff);
	this.drButton.value = 'To Default Test Images';
	this.refresh();
}
LUTPreview.prototype.followUp = function(d) {
	switch (d) {
        case 0: this.preGotImg();
			break;
	}
}
LUTPreview.prototype.createRadioElement = function(name, checked) {
    var radioInput;
    try {
        var radioHtml = '<input type="radio" name="' + name + '"';
        if ( checked ) {
            radioHtml += ' checked="checked"';
        }
        radioHtml += '/>';
        radioInput = document.createElement(radioHtml);
    } catch( err ) {
        radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', name);
        if ( checked ) {
            radioInput.setAttribute('checked', 'checked');
        }
    }
    return radioInput;
}
