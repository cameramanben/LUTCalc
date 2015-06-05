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
	this.upd = 0;
	this.main = document.getElementById('main');
	this.right = document.getElementById('right');
	this.preButton = document.createElement('input');
	this.inputs.addInput('preButton',this.preButton);
	this.sizeButton = document.createElement('input');
	this.inputs.addInput('sizeButton',this.sizeButton);
	this.drButton = document.createElement('input');
	this.inputs.addInput('drButton',this.drButton);
	this.wavCheck = document.createElement('input');
	this.inputs.addInput('wavCheck',this.wavCheck);
	this.vecCheck = document.createElement('input');
	this.inputs.addInput('vecCheck',this.vecCheck);
	this.rgbCheck = document.createElement('input');
	this.inputs.addInput('rgbCheck',this.rgbCheck);
	this.fileButton = document.createElement('input');
	this.inputs.addInput('preFileButton',this.fileButton);
	this.fileInput = document.createElement('input');
	this.inputs.addInput('preFileInput',this.fileInput);
	this.inputs.addInput('preFileData',{});
	this.preOpt = 0;
	this.width = 960;
	this.height = 540;
	this.rastSize = this.width*8*3;
	this.eiMult = 1;
	this.show = false;
	this.changed = false;
	this.line = 0;
	this.small = true;
	this.wform = false;
	this.vscope = false;
	this.parade = false;
	this.vscale = 410;
	this.primaries();
	this.buildBox();
	fieldset.appendChild(this.box);
	fieldset.style.width = '32em';	
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
	this.sizeButton.setAttribute('type','button');
	this.sizeButton.value = 'Large Image';
	this.sizeButton.style.display = 'none';
	this.drButton.setAttribute('type','button');
	this.drButton.value = 'Low Contrast';
	this.fileButton.setAttribute('type','button');
	this.fileInput.setAttribute('type','file');
	this.fileInput.style.display = 'none';
	this.box.appendChild(this.fileInput);
	this.fileButton.value = 'Load Preview...';
	this.fileButton.style.display = 'none';
	this.wavCheck.setAttribute('type','checkbox');
	this.wavCheck.checked = false;
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Waveform')));
	this.box.appendChild(this.wavCheck);	
	this.vecCheck.setAttribute('type','checkbox');
	this.vecCheck.checked = false;
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Vectorscope')));
	this.box.appendChild(this.vecCheck);	
	this.rgbCheck.setAttribute('type','checkbox');
	this.rgbCheck.checked = false;
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('RGB Parade')));
	this.box.appendChild(this.rgbCheck);	
	this.box.appendChild(document.createElement('br'));
	
	this.pCan = document.createElement('canvas');
	this.pCan.setAttribute('id','can-preview');
	this.pCan.width = this.width.toString();
	this.pCan.height = this.height.toString();
	this.pCan.style.width = '32em';
	this.pCan.style.height = '18em';
	this.pCtx = this.pCan.getContext('2d');
	this.pData = this.pCtx.createImageData(this.width,this.height);
	this.box.appendChild(this.pCan);
	this.lCan = document.createElement('canvas');
	this.pCan.setAttribute('id','can-hidden');
	this.lCan.width = this.width.toString();
	this.lCan.height = this.height.toString();
	this.lCan.style.width = '32em';
	this.lCan.style.height = '18em';
	this.lCan.style.display = 'none';
	this.lCtx = this.lCan.getContext('2d');
	this.box.appendChild(this.lCan);

	this.wCan = document.createElement('canvas'); // Waveform
	this.wCan.setAttribute('id','can-waveform');
	this.wCan.width = this.width.toString();
	this.wCan.height = this.height.toString();
	this.wCan.style.width = '32em';
	this.wCan.style.height = '18em';
	this.wCan.style.display = 'none';
	this.wCtx = this.wCan.getContext('2d');
	this.wData = this.wCtx.createImageData(this.width,this.height);
	this.box.appendChild(this.wCan);

	this.vCan = document.createElement('canvas'); // Vectorscope
	this.vCan.setAttribute('id','can-vector');
	this.vCan.width = this.width.toString();
	this.vCan.height = this.height.toString();
	this.vCan.style.width = '32em';
	this.vCan.style.height = '18em';
	this.vCan.style.display = 'none';
	this.vCtx = this.vCan.getContext('2d');
	this.vData = this.vCtx.createImageData(this.width,this.height);
	this.box.appendChild(this.vCan);

	this.rgbCan = document.createElement('canvas'); // RGB Parade
	this.pCan.setAttribute('id','can-parade');
	this.rgbCan.width = this.width.toString();
	this.rgbCan.height = this.height.toString();
	this.rgbCan.style.width = '32em';
	this.rgbCan.style.height = '18em';
	this.rgbCan.style.display = 'none';
	this.rgbCtx = this.rgbCan.getContext('2d');
	this.rgbData = this.rgbCtx.createImageData(this.width,this.height);
	this.box.appendChild(this.rgbCan);

	this.buildPopup();
	this.loadDefault(0);
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
	generateBox.box.insertBefore(this.sizeButton,generateBox.button);
	generateBox.box.insertBefore(this.drButton,generateBox.button);
	generateBox.box.insertBefore(this.fileButton,generateBox.button);
	this.drButton.style.display = 'none';
}

LUTPreview.prototype.toggle = function() {
	if (this.show) {
		main.style.width = '69em';
		right.style.width = '33em';
		this.fieldSet.style.display = 'none';
		this.lutbox.style.display = 'block';
		this.sizeButton.style.display = 'none';
		this.fileButton.style.display = 'none';
		this.generateButton.style.display = 'inline';
		this.drButton.style.display = 'none';
		this.show = false;
		this.preButton.value = 'Preview';
	} else {
		if (this.small) {
			main.style.width = '72em';
			right.style.width = '36em';
		} else {
			main.style.width = '86em';
			right.style.width = '52em';
		}
		this.fieldSet.style.display = 'block';
		this.lutbox.style.display = 'none';
		this.sizeButton.style.display = 'inline';
		this.fileButton.style.display = 'inline';
		this.generateButton.style.display = 'none';
		this.drButton.style.display = 'inline';
		this.show = true;
		this.preButton.value = 'Hide Preview';
		this.refresh();
	}
}
LUTPreview.prototype.toggleSize = function() {
	if (this.small) {
		main.style.width = '86em';
		right.style.width = '52em';
		this.pCan.style.width = '48em';
		this.pCan.style.height = '27em';
		this.lCan.style.width = '48em';
		this.lCan.style.height = '27em';
		this.wCan.style.width = '48em';
		this.wCan.style.height = '27em';
		this.vCan.style.width = '48em';
		this.vCan.style.height = '27em';
		this.rgbCan.style.width = '48em';
		this.rgbCan.style.height = '27em';
		this.sizeButton.value = 'Small Image';
		this.small = false;
	} else {
		main.style.width = '72em';
		right.style.width = '36em';
		this.pCan.style.width = '32em';
		this.pCan.style.height = '18em';
		this.lCan.style.width = '32em';
		this.lCan.style.height = '18em';
		this.wCan.style.width = '32em';
		this.wCan.style.height = '18em';
		this.vCan.style.width = '32em';
		this.vCan.style.height = '18em';
		this.rgbCan.style.width = '32em';
		this.rgbCan.style.height = '18em';
		this.sizeButton.value = 'Large Image';
		this.small = true;
	}
}
LUTPreview.prototype.toggleDefault = function() {
	switch(this.preOpt) {
		case 0:
			this.changed = true;
			this.preOpt = 1;
			this.drButton.value = 'Rec709 Gamut';
			this.loadDefault(1);
			break;
		case 1:
			this.changed = true;
			this.preOpt = 2;
			this.drButton.value = 'High Contrast';
			this.loadDefault(2);
			break;
		case 2:
			this.changed = true;
			this.preOpt = 0;
			this.drButton.value = 'Low Contrast';
			this.loadDefault(0);
			break;	
	}
}
LUTPreview.prototype.toggleWaveform = function() {
	if (this.wavCheck.checked) {
		this.wform = true;
		this.wCan.style.display = 'block';
		this.refresh();
	} else {
		this.wform = false;
		this.wCan.style.display = 'none';
		this.refresh();
	}
}
LUTPreview.prototype.toggleVectorscope = function() {
	if (this.vecCheck.checked) {
		this.vscope = true;
		this.vCan.style.display = 'block';
		this.refresh();
	} else {
		this.vscope = false;
		this.vCan.style.display = 'none';
		this.refresh();
	}
}
LUTPreview.prototype.toggleParade = function() {
	if (this.rgbCheck.checked) {
		this.parade = true;
		this.rgbCan.style.display = 'block';
		this.refresh();
	} else {
		this.parade = false;
		this.rgbCan.style.display = 'none';
		this.refresh();
	}
}

LUTPreview.prototype.loadDefault = function(opt) {
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
	switch(opt) {
		case 0:
			msb.src = "HDRPreviewMSB.png";
			lsb.src = "HDRPreviewLSB.png";
			break;
		case 1:
			msb.src = "LDRPreviewMSB.png";
			lsb.src = "LDRPreviewLSB.png";
			break;
		case 2:
			msb.src = "CWMSB.png";
			lsb.src = "CWLSB.png";
			break;
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
	if (data.upd === this.upd) {
		var raster8 = new Uint8Array(data.o);
		this.pData.data.set(raster8,data.line*this.width*4);
		var raster = new Float64Array(data.f);
		var l = raster.length;
		if (this.vscope) {
			var Kb = 0.0722;
			var Kr = 0.2126;
			var Y,Pb, Pr;
			var s = this.vscale;
			var k=0;
			for (var j=0; j<l; j += 3) {
				r = Math.max(0,(raster[ j ]));
				g = Math.max(0,(raster[j+1]));
				b = Math.max(0,(raster[j+2]));
				Y = (Kr*r) + ((1-Kr-Kb)*g) + (Kb*b);
				Pb = 0.5*(b-Y)/(1-Kb);
				Pr = 0.5*(r-Y)/(1-Kr);
	        	p = (
	        			((480 + Math.round(s * Pb))) +
	        			((270 - Math.round(s * Pr))*960)
	        		) * 4;
	
				this.vData.data[ p ] = Math.max(64,raster8[ k ]);
				this.vData.data[p+1] = Math.max(64,raster8[k+1]);
				this.vData.data[p+2] = Math.max(64,raster8[k+2]);
				this.vData.data[p+3] = 255;
	
				this.vData.data[p+4] = Math.max(64,raster8[ k ]);
				this.vData.data[p+5] = Math.max(64,raster8[k+1]);
				this.vData.data[p+6] = Math.max(64,raster8[k+2]);
				this.vData.data[p+7] = 255;
	
				this.vData.data[p+3840] = Math.max(64,raster8[ k ]);
				this.vData.data[p+3841] = Math.max(64,raster8[k+1]);
				this.vData.data[p+3842] = Math.max(64,raster8[k+2]);
				this.vData.data[p+3843] = 255;
	
				this.vData.data[p+3844] = Math.max(64,raster8[ k ]);
				this.vData.data[p+3845] = Math.max(64,raster8[k+1]);
				this.vData.data[p+3846] = Math.max(64,raster8[k+2]);
				this.vData.data[p+3847] = 255;
	
				k += 4;
			}
		}
		if (this.wform) {
			var x,y,p;
			var k = 0;
			for (var j=0; j<l; j += 3) {
				x = (j%2880)/3;
				y = 555-Math.round(((((0.2126*raster[ j ])+(0.7152*raster[j+1])+(0.0722*raster[j+2]))*876)+64)*550/1023);
				p = (3840*y) + (4*x);
	
				this.wData.data[ p ] = Math.max(80,raster8[ k ]);
				this.wData.data[p+1] = Math.max(80,raster8[k+1]);
				this.wData.data[p+2] = Math.max(80,raster8[k+2]);
				this.wData.data[p+3] = 255;
				
				k += 4;
			}
		}
		if (this.parade) {
			var x,r,g,b;
			var k = 0;
			for (var j=0; j<l; j += 3) {
				x = 4*Math.round((j%2880)/9);
				r = (3840*(555 - Math.round(((raster[ j ]*876)+64)*550/1023))) + x;
				g = (3840*(555 - Math.round(((raster[j+1]*876)+64)*550/1023))) + x + 1280;
				b = (3840*(555 - Math.round(((raster[j+2]*876)+64)*550/1023))) + x + 2560;
	
				this.rgbData.data[ r ] = 200;
				this.rgbData.data[r+1] = 0;
				this.rgbData.data[r+2] = 0;
				this.rgbData.data[r+3] = 255;
	
				this.rgbData.data[ g ] = 0;
				this.rgbData.data[g+1] = 200;
				this.rgbData.data[g+2] = 0;
				this.rgbData.data[g+3] = 255;
				
				this.rgbData.data[ b ] = 0;
				this.rgbData.data[b+1] = 0;
				this.rgbData.data[b+2] = 200;
				this.rgbData.data[b+3] = 255;
	
				k += 4;
			}
		}
		if (this.line === this.height-1) {
			this.pCtx.putImageData(this.pData,0,0);
			if (this.wform) {
				this.wCtx.putImageData(this.wData,0,0);
				this.drawWaveform();
			}
			if (this.vscope) {
				this.vCtx.putImageData(this.vData,0,0);
				this.drawVectorScope();
			}
			if (this.parade) {
				this.rgbCtx.putImageData(this.rgbData,0,0);
				this.drawParade();
			}
			this.line = 0;
			if (this.show && this.changed) {
				this.refresh();
			}
		} else if (this.show) {
			this.line++;
			var input = {line: this.line, upd: data.upd, o: this.pre.buffer.slice(this.line*this.rastSize,(this.line+1)*this.rastSize), eiMult: this.eiMult, to: ['o']}
			if (this.inputs.d[0].checked) {
				this.message.gaTx(this.p,12,input);
			} else {
				this.message.gtTx(this.p,12,input);
			}
		}
	}
}
LUTPreview.prototype.refresh = function() {
	if (typeof this.pre !== 'undefined') {
		this.changed = false;
		if (this.wform) {
			this.clearWaveform();
		}
		if (this.vscope) {
			this.clearVectorScope();
		}
		if (this.parade) {
			this.clearParade();
		}
		var max = Math.max(this.message.getGammaThreads(),this.message.getGamutThreads());
		this.upd++;
		for (var j=0; j<max; j++) {
			this.line = j;
			var input = {line: this.line, upd:this.upd, o: this.pre.buffer.slice(this.line*this.rastSize,(this.line+1)*this.rastSize), eiMult: this.eiMult, to: ['o']};
			if (this.inputs.d[0].checked) {
				this.message.gaTx(this.p,12,input);
			} else {
				this.message.gtTx(this.p,12,input);
			}
		}
	}
}
LUTPreview.prototype.clearWaveform = function() {
	var max = 960*540*4;
	for (var j=0; j<max; j += 4) {
		this.wData.data[ j ] = 0;
		this.wData.data[j+1] = 0;
		this.wData.data[j+2] = 0;
		this.wData.data[j+3] = 255;
	}
}
LUTPreview.prototype.clearVectorScope = function() {
	var max = 960*540*4;
	for (var j=0; j<max; j += 4) {
		this.vData.data[ j ] = 0;
		this.vData.data[j+1] = 0;
		this.vData.data[j+2] = 0;
		this.vData.data[j+3] = 255;
	}
}
LUTPreview.prototype.clearParade = function() {
	var max = 960*540*4;
	for (var j=0; j<max; j += 4) {
		this.rgbData.data[ j ] = 0;
		this.rgbData.data[j+1] = 0;
		this.rgbData.data[j+2] = 0;
		this.rgbData.data[j+3] = 255;
	}
}
LUTPreview.prototype.drawWaveform = function() {
	this.wCtx.beginPath();
	this.wCtx.strokeStyle = '#307030';
	this.wCtx.lineWidth = 1;
	this.wCtx.font='10px "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.wCtx.textAlign = 'center';
	this.wCtx.textBaseline = 'bottom';
	for (var j=0; j<11; j++) {
		y = 555-(((parseFloat(j/10)*876)+64)*550/1023);
		this.wCtx.moveTo(0,y);
		this.wCtx.lineTo(960,y);
		this.wCtx.strokeText((j * 10).toString() + '%',20,y);
		this.wCtx.strokeText((j * 10).toString() + '%',940,y);
	}
	this.wCtx.stroke();
}
LUTPreview.prototype.drawVectorScope = function() {
	var s = this.vscale;
	this.vCtx.beginPath();
	this.vCtx.strokeStyle = '#307030';
	this.vCtx.lineWidth = 3;
	this.vCtx.font='20px "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.vCtx.textAlign = 'center';
	this.vCtx.textBaseline = 'middle';
	this.vCtx.arc(480,270,(s/2)+60,0,2*Math.PI);
	this.vCtx.stroke();
	this.vCtx.beginPath();
	this.vCtx.lineWidth = 1.5;
	this.vCtx.moveTo(460,270);
	this.vCtx.lineTo(500,270);
	this.vCtx.moveTo(480,250);
	this.vCtx.lineTo(480,290);
	for (var j=0; j<6; j++) {
		this.vCtx.moveTo(this.p75x[j]+10,this.p75y[j]);
		this.vCtx.arc(this.p75x[j],this.p75y[j],10,0,2*Math.PI);
		this.vCtx.moveTo(this.p100x[j]+10,this.p100y[j]);
		this.vCtx.arc(this.p100x[j],this.p100y[j],10,0,2*Math.PI);
		this.vCtx.strokeText(this.pName[j],this.pTextx[j],this.pTexty[j]);
	}
	this.vCtx.stroke();
	var colour = ['#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'];
	for (var j=0; j<6; j++) {
		this.vCtx.beginPath();
		this.vCtx.lineWidth = 2;
		this.vCtx.strokeStyle = colour[j];
		this.vCtx.moveTo(this.pCurx[j]+10,this.pCury[j]);
		this.vCtx.arc(this.pCurx[j],this.pCury[j],10,0,2*Math.PI);
		this.vCtx.stroke();
	}
}
LUTPreview.prototype.drawParade = function() {
	this.rgbCtx.beginPath();
	this.rgbCtx.strokeStyle = '#707070';
	this.rgbCtx.lineWidth = 1;
	this.rgbCtx.font='10px "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.rgbCtx.textAlign = 'center';
	this.rgbCtx.textBaseline = 'bottom';
	for (var j=0; j<11; j++) {
		y = 555-(((parseFloat(j/10)*876)+64)*550/1023);
		this.rgbCtx.moveTo(0,y);
		this.rgbCtx.lineTo(960,y);
		this.rgbCtx.strokeText((j * 10).toString() + '%',20,y);
		this.rgbCtx.strokeText((j * 10).toString() + '%',940,y);
	}
	this.rgbCtx.stroke();
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
