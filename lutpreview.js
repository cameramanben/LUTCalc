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
	this.vecButton = document.createElement('input');
	this.inputs.addInput('vecButton',this.vecButton);
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
	this.line = 0;
	this.vscope = false;
	this.vscale = 425;
	this.primaries();
	this.buildBox();
	fieldset.appendChild(this.box);
	fieldset.style.width = '48em';	
	fieldset.style.display = 'none';
}
LUTPreview.prototype.primaries = function() {
	this.pName = ['Yl','Cy','G','Mg','R','B'];
	this.p75x = [-0.375,0.0859375,-0.2890625,0.2890625,-0.0859375,0.375];
	this.p75y = [0.034598214,-0.375,-0.340401786,0.340401786,0.375,-0.034598214];
	this.p100x = [-0.5,0.114955357,-0.385416667,0.385416667,-0.114955357,0.5];
	this.p100y = [0.045758929,-0.5,-0.453869048,0.453869048,0.5,-0.045758929];
	this.pCurx = [-0.375,0.0859375,-0.2890625,0.2890625,-0.0859375,0.375];
	this.pCury = [0.034598214,-0.375,-0.340401786,0.340401786,0.375,-0.034598214];
	this.pTextx = [];
	this.pTexty = [];
	for (var j=0; j<6; j++) {
		this.p75x[j] = Math.round((this.p75x[j]*this.vscale)+480);
		this.p100x[j] = Math.round((this.p100x[j]*this.vscale)+480);
		this.pCurx[j] = Math.round((this.pCurx[j]*this.vscale)+480);
		this.p75y[j] = Math.round(270-(this.p75y[j]*this.vscale));
		this.p100y[j] = Math.round(270-(this.p100y[j]*this.vscale));
		this.pCury[j] = Math.round(270-(this.pCury[j]*this.vscale));
		this.pTextx.push(0.5*(this.p100x[j]+this.p75x[j]));
		this.pTexty.push(0.5*(this.p100y[j]+this.p75y[j]));
	}
}
LUTPreview.prototype.updatePrimaries = function(data) {
	var d = new Float64Array(data)
	var Y,Pr,Pb;
	for (var j=0; j<18; j += 3) {
		Y = (0.2126*d[j]) + ((1-0.2126-0.0722)*d[j+1]) + (0.0722*d[j+2]);
		Pb = 0.5*(d[j+2]-Y)/(1-0.0722);
		Pr = 0.5*(d[ j ]-Y)/(1-0.2126);
		this.pCurx[j/3] = Math.round((Pb*this.vscale)+480);
		this.pCury[j/3] = Math.round(270-(Pr*this.vscale));
	}
}
LUTPreview.prototype.buildBox = function() {
	this.preButton.setAttribute('type','button');
	this.preButton.value = 'Preview';
	this.drButton.setAttribute('type','button');
	this.drButton.value = 'To Low Contrast Image';
	this.vecButton.setAttribute('type','button');
	this.vecButton.value = 'Vectorscope';
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
	generateBox.box.insertBefore(this.vecButton,generateBox.button);
	generateBox.box.insertBefore(this.fileButton,generateBox.button);
	this.drButton.style.display = 'none';
	this.vecButton.style.display = 'none';
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
		this.vecButton.style.display = 'none';
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
		this.vecButton.style.display = 'inline';
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
LUTPreview.prototype.toggleVectorscope = function() {
	if (this.vscope) {
		this.vecButton.value = 'Vectorscope';
		this.vscope = false;
		this.refresh();
	} else {
		this.vecButton.value = 'Image';
		this.vscope = true;
		this.refresh();
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
	if (!this.vscope) {
		this.pData.data.set(raster,data.line*this.width*4);
	} else {
		var l = raster.length;
		var Kb = 0.0722;
		var Kr = 0.2126;
		var Y,Pb, Pr;
		var s = this.vscale;
		for (var j=0; j<l; j += 4) {
			r = parseFloat(raster[ j ])/255;
			g = parseFloat(raster[j+1])/255;
			b = parseFloat(raster[j+2])/255;
			Y = (Kr*r) + ((1-Kr-Kb)*g) + (Kb*b);
			Pb = 0.5*(b-Y)/(1-Kb);
			Pr = 0.5*(r-Y)/(1-Kr);
        	p = (
        			((480 + Math.round(s * Pb))) +
        			((270 - Math.round(s * Pr))*960)
        		) * 4;

			this.pData.data[ p ] = Math.max(64,raster[ j ]);
			this.pData.data[p+1] = Math.max(64,raster[j+1]);
			this.pData.data[p+2] = Math.max(64,raster[j+2]);
			this.pData.data[p+3] = 255;

			this.pData.data[p+4] = Math.max(64,raster[ j ]);
			this.pData.data[p+5] = Math.max(64,raster[j+1]);
			this.pData.data[p+6] = Math.max(64,raster[j+2]);
			this.pData.data[p+7] = 255;

			this.pData.data[p+3840] = Math.max(64,raster[ j ]);
			this.pData.data[p+3841] = Math.max(64,raster[j+1]);
			this.pData.data[p+3842] = Math.max(64,raster[j+2]);
			this.pData.data[p+3843] = 255;

			this.pData.data[p+3844] = Math.max(64,raster[ j ]);
			this.pData.data[p+3845] = Math.max(64,raster[j+1]);
			this.pData.data[p+3846] = Math.max(64,raster[j+2]);
			this.pData.data[p+3847] = 255;

		}
	}

	if (this.line === this.height-1) {
		this.pCtx.putImageData(this.pData,0,0);
		if (this.vscope) {
			this.drawVectorScope();
		}
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
		if (this.vscope) {
			this.clearVectorScope();
		}
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
LUTPreview.prototype.clearVectorScope = function() {
	var max = 960*540*4;
	for (var j=0; j<max; j += 4) {
		this.pData.data[ j ] = 0;
		this.pData.data[j+1] = 0;
		this.pData.data[j+2] = 0;
		this.pData.data[j+3] = 255;
	}
}
LUTPreview.prototype.drawVectorScope = function() {
	var s = this.vscale;
	this.pCtx.beginPath();
	this.pCtx.strokeStyle = '#307030';
	this.pCtx.lineWidth = 3;
	this.pCtx.font='20px "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.pCtx.textAlign = 'center';
	this.pCtx.textBaseline = 'middle';
	this.pCtx.arc(480,270,(s/2)+60,0,2*Math.PI);
	this.pCtx.stroke();
	this.pCtx.beginPath();
	this.pCtx.lineWidth = 1.5;
	this.pCtx.moveTo(460,270);
	this.pCtx.lineTo(500,270);
	this.pCtx.moveTo(480,250);
	this.pCtx.lineTo(480,290);
	for (var j=0; j<6; j++) {
		this.pCtx.moveTo(this.p75x[j]+10,this.p75y[j]);
		this.pCtx.arc(this.p75x[j],this.p75y[j],10,0,2*Math.PI);
		this.pCtx.moveTo(this.p100x[j]+10,this.p100y[j]);
		this.pCtx.arc(this.p100x[j],this.p100y[j],10,0,2*Math.PI);
		this.pCtx.strokeText(this.pName[j],this.pTextx[j],this.pTexty[j]);
	}
	this.pCtx.stroke();
	var colour = ['#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'];
	for (var j=0; j<6; j++) {
		this.pCtx.beginPath();
		this.pCtx.lineWidth = 2;
		this.pCtx.strokeStyle = colour[j];
		this.pCtx.moveTo(this.pCurx[j]+10,this.pCury[j]);
		this.pCtx.arc(this.pCurx[j],this.pCury[j],10,0,2*Math.PI);
		this.pCtx.stroke();
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
