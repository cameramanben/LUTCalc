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
function LUTPreview(fieldset,inputs,message) {
	this.box = document.createElement('fieldset');
	this.fieldSet = fieldset;
	this.inputs = inputs;
	this.message = message;
	this.p = 8;
	this.message.addUI(this.p,this);
	this.main = document.getElementById('main');
	this.right = document.getElementById('right');
	this.preButton = document.createElement('input');
	this.preButton.setAttribute('type','button');
	this.preButton.value = 'Preview';
	this.drButton = document.createElement('input');
	this.drButton.setAttribute('type','button');
	this.drButton.value = 'To Low Contrast Image';
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
LUTPreview.prototype.setUIs = function(generateBox,lutbox) {
	this.lutbox = lutbox;
	this.generateButton = generateBox.button;
	generateBox.box.insertBefore(this.preButton,generateBox.button);
	generateBox.box.insertBefore(this.drButton,generateBox.button);
	this.drButton.style.display = 'none';
}
LUTPreview.prototype.toggle = function() {
	if (this.show) {
		main.style.width = '69em';
		right.style.width = '34em';
		this.fieldSet.style.display = 'none';
		this.lutbox.style.display = 'block';
		this.generateButton.style.display = 'inline';
		this.drButton.style.display = 'none';
		this.show = false;
		this.preButton.value = 'Preview';
	} else {
		main.style.width = '86em';
		right.style.width = '52em';
		this.fieldSet.style.display = 'block';
		this.lutbox.style.display = 'none';
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
LUTPreview.prototype.buildBox = function() {
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
	this.loadDefault(true);
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
 0.1677922920,-0.0155818840, 0.2556207230, 4.7368421060,10.0000000000, 0.4105571850, 0.0526315790, 0.1673609920, 0.0125000000
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
		var input = {line: this.line, o: this.pre.buffer.slice(this.line*this.rastSize,(this.line+1)*this.rastSize), eiMult: this.eiMult}
		if (this.inputs.d[0].checked) {
			this.message.gaTx(this.p,12,input);
		} else {
			this.message.gtTx(this.p,12,input);
		}
	}
}
LUTPreview.prototype.refresh = function() {
	this.changed = false;
	var max = Math.max(this.message.getGammaThreads(),this.message.getGamutThreads());
	for (var j=0; j<max; j++) {
		this.line = j;
		var input = {line: this.line, o: this.pre.buffer.slice(this.line*this.rastSize,(this.line+1)*this.rastSize), eiMult: this.eiMult};
		if (this.inputs.d[0].checked) {
			this.message.gaTx(this.p,12,input);
		} else {
			this.message.gtTx(this.p,12,input);
		}
	}
}
