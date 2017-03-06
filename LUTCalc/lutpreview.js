/* lutpreview.js
* Realtime preview object for the LUTCalc Web App.
* 29th June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTPreview(fieldset,inputs,messages,file) {
	this.box = document.createElement('fieldset');
	this.fieldset = fieldset;
	this.inputs = inputs;
	this.messages = messages;
	this.file = file;
	this.p = 8;
	this.messages.addUI(this.p,this);
	this.main = document.getElementById('main');
	this.right = document.getElementById('right');
	this.io();
	this.ui();
}
LUTPreview.prototype.io = function() {
	this.upd = 0;
	// Preview window io
	this.preButton = document.createElement('input');
	this.preButton.setAttribute('type','button');
	this.preButton.value = 'Preview';
	this.sizeButton = document.createElement('input');
	this.sizeButton.setAttribute('type','button');
	this.sizeButton.value = 'Large Image';
	//
	this.defSelect = document.createElement('select');
	var defs = [
		'High Contrast',
		'Low Contrast',
		'Rec709 Gamut',
		'xy / uv Chromacity',
		'Grayscale'
	];
	this.chromOpt = 3;
	for (var j=0; j<5; j++) {
		var option = document.createElement('option');
		option.value = j;
		option.appendChild(document.createTextNode(defs[j]));
		this.defSelect.appendChild(option);
	}
	var defFiles = [
		'HDRPreview',
		'LDRPreview',
		'CW',
		'xyuv',
		'Gray'
	];
	var defExts = [
		'png',
		'png',
		'png',
		'png',
		'png'
	];
	var m = defFiles.length;
	var shed = document.getElementById('shed');
	shed.style.display = 'none';
	for (var j=0; j<m; j++) {
//		var MSB = this.inputs['defmsb'+j];
		var MSB = document.createElement('img');
		MSB.alt = 'defmsb' + j;
		MSB.id = 'defmsb' + j;
		MSB.src = defFiles[j] + 'MSB.' + defExts[j];
		shed.appendChild(MSB);
//		var LSB = this.inputs['deflsb'+j];
		var LSB = document.createElement('img');
		LSB.alt = 'deflsb' + j;
		LSB.id = 'deflsb' + j;
		LSB.src = defFiles[j] + 'LSB.' + defExts[j];
		shed.appendChild(LSB);
	}
	//
	this.buttonHolder = document.createElement('fieldset');
	this.buttonHolder.className = 'button-holder';
	this.preLeg = this.createRadioElement('prelegdat',true);
	this.preDat = this.createRadioElement('prelegdat',false);
	this.wavCheck = document.createElement('input');
	this.wavCheck.setAttribute('type','checkbox');
	this.wavCheck.checked = false;
	this.vecCheck = document.createElement('input');
	this.vecCheck.setAttribute('type','checkbox');
	this.vecCheck.checked = false;
	this.rgbCheck = document.createElement('input');
	this.rgbCheck.setAttribute('type','checkbox');
	this.rgbCheck.checked = false;
	this.fileButton = document.createElement('input');
	this.fileButton.setAttribute('type','button');
	this.fileButton.value = 'Load Preview...';
	this.fileInput = document.createElement('input');
	this.fileInput.setAttribute('type','file');
	this.inputs.addInput('preFileData',{});
	this.show = false;
	this.inputs.addInput('showPreview',this.show);
	// File popup io
	this.preCSBoxHolder = document.createElement('div');
	this.preGammaSelect = document.createElement('select');
	this.preGamutSelect = document.createElement('select');
	this.preLegalRange = this.createRadioElement('prerange', false);
	this.preDataRange = this.createRadioElement('prerange', true);
	this.preOKButton = document.createElement('input');
	this.preOKButton.setAttribute('type','button');
	this.preOKButton.value = 'OK';
	this.preCancelButton = document.createElement('input');
	this.preCancelButton.setAttribute('type','button');
	this.preCancelButton.value = 'Cancel';
	// Windowless buttons
	this.sizeButton.style.display = 'none';
	this.fileButton.style.display = 'none';
};
LUTPreview.prototype.ui = function() {
	this.buttonHolder.appendChild(this.sizeButton);
	this.buttonHolder.appendChild(this.defSelect);
	this.buttonHolder.appendChild(this.fileButton);
	this.box.appendChild(this.buttonHolder);

	this.fileInput.style.display = 'none';
	this.box.appendChild(this.fileInput);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('100%')));
	this.box.appendChild(this.preLeg);	
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('109%')));
	this.box.appendChild(this.preDat);	
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Waveform')));
	this.box.appendChild(this.wavCheck);	
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Vectorscope')));
	this.box.appendChild(this.vecCheck);	
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('RGB Parade')));
	this.box.appendChild(this.rgbCheck);	
	this.box.appendChild(document.createElement('br'));

	// RGB Values box
	this.rgbBox = document.createElement('div');
	this.rgbBox.appendChild(document.createTextNode('10-Bit Values - R:'));
	this.rgbR = document.createElement('div');
	this.rgbR.className = 'fixed-width-no';
	this.rgbR.innerHTML = '0';
	this.rgbBox.appendChild(this.rgbR);
	this.rgbBox.appendChild(document.createTextNode('G:'));
	this.rgbG = document.createElement('div');
	this.rgbG.className = 'fixed-width-no';
	this.rgbG.innerHTML = '0';
	this.rgbBox.appendChild(this.rgbG);
	this.rgbBox.appendChild(document.createTextNode('B:'));
	this.rgbB = document.createElement('div');
	this.rgbB.className = 'fixed-width-no';
	this.rgbB.innerHTML = '0';
	this.rgbBox.appendChild(this.rgbB);
	this.box.appendChild(this.rgbBox);

	this.uiCanvases();

	this.fieldset.style.width = '32em';	
	this.fieldset.style.display = 'none';
	this.fieldset.appendChild(this.box);

	this.uiPopup();
};
LUTPreview.prototype.uiCanvases = function() {
	this.width = 960;
	this.height = 540;
	this.rastSize = this.width*8*3;
	this.wform = false;
	this.vscope = false;
	this.parade = false;
	this.vscale = 410;
	this.changed = false;
	this.eiMult = 1;
	this.line = 0;
	this.small = true;
	this.leg = true;
	this.initPrimaries();
	// Preview image canvases
	this.pBox = document.createElement('div');
	this.pBox.setAttribute('id','preview-box');
	this.pCan = document.createElement('canvas');
	this.pCan.setAttribute('id','can-preview');
	this.inputs.addInput('previewCanvas',this.pCan);
	this.pCan.width = this.width.toString();
	this.pCan.height = this.height.toString();
//	this.pCan.style.width = '32em';
//	this.pCan.style.height = '18em';
	this.pCtx = this.pCan.getContext('2d');
	this.pData = this.pCtx.createImageData(this.width,this.height);
	this.pRaw = new Float64Array(this.width * this.height * 3);
	this.inputs.addInput('preRaw',this.pRaw);
	this.pBox.appendChild(this.pCan);
	this.sCan = document.createElement('canvas');
	this.sCan.setAttribute('id','can-sampler');
	this.inputs.addInput('samplerCanvas',this.sCan);
	this.sCan.width = this.width.toString();
	this.sCan.height = this.height.toString();
//	this.sCan.style.width = '32em';
//	this.sCan.style.height = '18em';
	this.sCan.style.display = 'none';
	this.sCtx = this.sCan.getContext('2d');
	this.inputs.addInput('samplerCtx',this.sCtx);
	this.pBox.appendChild(this.sCan);
	this.oCan = document.createElement('canvas');
	this.oCan.setAttribute('id','can-overlay');
	this.oCan.width = this.width.toString();
	this.oCan.height = this.height.toString();
//	this.oCan.style.width = '32em';
//	this.oCan.style.height = '18em';
	this.oCan.style.display = 'none';
	this.oCtx = this.oCan.getContext('2d');
	this.pBox.appendChild(this.oCan);
	this.box.appendChild(this.pBox);
	this.lCan = document.createElement('canvas');
	this.lCan.setAttribute('id','can-hide');
	this.lCan.width = this.width.toString();
	this.lCan.height = this.height.toString();
	this.lCan.style.width = '32em';
	this.lCan.style.height = '18em';
	this.lCan.style.display = 'none';
	this.lCtx = this.lCan.getContext('2d');
	this.box.appendChild(this.lCan);
	// Waveform
	this.wCan = document.createElement('canvas');
	this.wCan.setAttribute('id','can-waveform');
	this.wCan.width = this.width.toString();
	this.wCan.height = this.height.toString();
	this.wCan.style.width = '32em';
	this.wCan.style.height = '18em';
	this.wCan.style.display = 'none';
	this.wCtx = this.wCan.getContext('2d');
	this.wData = this.wCtx.createImageData(this.width,this.height);
	this.box.appendChild(this.wCan);
	// Vectorscope
	this.vCan = document.createElement('canvas');
	this.vCan.setAttribute('id','can-vector');
	this.vCan.width = this.width.toString();
	this.vCan.height = this.height.toString();
	this.vCan.style.width = '32em';
	this.vCan.style.height = '18em';
	this.vCan.style.display = 'none';
	this.vCtx = this.vCan.getContext('2d');
	this.vData = this.vCtx.createImageData(this.width,this.height);
	this.box.appendChild(this.vCan);
	// RGB parade
	this.rgbCan = document.createElement('canvas');
	this.rgbCan.setAttribute('id','can-parade');
	this.rgbCan.width = this.width.toString();
	this.rgbCan.height = this.height.toString();
	this.rgbCan.style.width = '32em';
	this.rgbCan.style.height = '18em';
	this.rgbCan.style.display = 'none';
	this.rgbCtx = this.rgbCan.getContext('2d');
	this.rgbData = this.rgbCtx.createImageData(this.width,this.height);
	this.box.appendChild(this.rgbCan);
	this.def = [];
	this.defNext = 4;
	this.defOpt = 0;
//	this.loadDefault(this.defNext);
	this.defaultImgs(this.defNext);
};
LUTPreview.prototype.uiPopup = function() {
	modalBox.className = 'modalbox-hide';
	this.preCSBoxHolder.style.display = 'none';
	this.preCSBoxHolder.setAttribute('class','popupholder');
	this.preCSBox = document.createElement('div');
	this.preCSBox.setAttribute('class','popup');
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
//	document.getElementById('body').appendChild(this.preCSBoxHolder);
	modalBox.appendChild(this.preCSBoxHolder);
};
LUTPreview.prototype.uiExternal = function(genBox) {
	this.generateButton = genBox.button;
	genBox.box.insertBefore(this.preButton, genBox.button);
	this.defSelect.style.display = 'none';
};
LUTPreview.prototype.events = function() {
	this.fileButton.onclick = function(here){ return function(){
		if (here.inputs.isApp) {
			here.preGetImg();
		} else {
			var e = new MouseEvent('click');
			here.fileInput.dispatchEvent(e);
		}
	};}(this);
	if (this.inputs.isApp) {
		this.fileInput.onclick = function(here){ return function(){
			here.preGetImg();
		};}(this);
	} else {
		this.fileInput.onchange = function(here){ return function(){
			here.preGetImg();
		};}(this);
	}
	this.preOKButton.onclick = function(here){ return function(){
		here.preCSBoxHolder.style.display = 'none';
		modalBox.className = 'modalbox-hide';
		here.prepPreview();
	};}(this);
	this.preCancelButton.onclick = function(here){ return function(){
		here.preCSBoxHolder.style.display = 'none';
		modalBox.className = 'modalbox-hide';
	};}(this);
	this.preButton.onclick = function(here){ return function(){
		here.toggle();
	};}(this);
	this.sizeButton.onclick = function(here){ return function(){
		here.toggleSize();
	};}(this);
	this.defSelect.onchange = function(here){ return function(){
		here.toggleDefault();
	};}(this);
	this.preLeg.onclick = function(here){ return function(){
		here.toggleRange();
	};}(this);
	this.preDat.onclick = function(here){ return function(){
		here.toggleRange();
	};}(this);
	this.wavCheck.onclick = function(here){ return function(){
		here.toggleWaveform();
	};}(this);
	this.vecCheck.onclick = function(here){ return function(){
		here.toggleVectorscope();
	};}(this);
	this.rgbCheck.onclick = function(here){ return function(){
		here.toggleParade();
	};}(this);
	this.pCan.onmousemove = function(here){ return function(e){
		here.rgbVals(e.clientX, e.clientY);
	};}(this);
	this.pCan.onclick = function(here){ return function(e){
		here.messages.previewSample(e.clientX, e.clientY);
	};}(this);
	this.oCan.onmousemove = function(here){ return function(e){
		here.rgbVals(e.clientX, e.clientY);
	};}(this);
	this.oCan.onclick = function(here){ return function(e){
		here.messages.previewSample(e.clientX, e.clientY);
	};}(this);
	this.sCan.onmousemove = function(here){ return function(e){
		here.rgbVals(e.clientX, e.clientY);
	};}(this);
	this.sCan.onclick = function(here){ return function(e){
		here.messages.previewSample(e.clientX, e.clientY);
	};}(this);
};
// Base data
LUTPreview.prototype.initPrimaries = function() {
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
};
LUTPreview.prototype.updatePrimaries = function(data) {
	var d = new Float64Array(data);
	var Y,Pr,Pb;
	for (var j=0; j<18; j += 3) {
		Y = (0.2126*d[j]) + ((1-0.2126-0.0722)*d[j+1]) + (0.0722*d[j+2]);
		Pb = 0.5*(d[j+2]-Y)/(1-0.0722);
		Pr = 0.5*(d[ j ]-Y)/(1-0.2126);
		this.pCurx[j/3] = Math.round((Pb*this.vscale)+480);
		this.pCury[j/3] = Math.round(270-(Pr*this.vscale));
	}
};
// Image loading
LUTPreview.prototype.defaultImgs = function(opt) {
	this.gotMSB = false;
	this.gotLSB = false;
	var MSB = document.getElementById('defmsb' + opt);
	var LSB = document.getElementById('deflsb' + opt);
	if (MSB.complete) {
		this.loadedMSB(opt)
	} else {
		MSB.addEventListener('load',(function(i){
                return function(){
                    i.here.loadedMSB(i.opt);
                }
            })({here:this,opt:opt}),
            false
        );
	}
	if (LSB.complete) {
		this.loadedLSB(opt)
	} else {
		LSB.addEventListener('load',(function(i){
                return function(){
                    i.here.loadedLSB(i.opt);
                }
            })({here:this,opt:opt}),
            false
        );
	}
};
LUTPreview.prototype.loadedMSB = function(opt) {
	this.pCtx.drawImage(document.getElementById('defmsb' + opt),0,0);
	this.gotMSB = true;
	this.loadedDefault();
}
LUTPreview.prototype.loadedLSB = function(opt) {
	this.lCtx.drawImage(document.getElementById('deflsb' + opt),0,0);
	this.gotLSB = true;
	this.loadedDefault();
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
		case 3:
			msb.src = "xyuvMSB.png";
			lsb.src = "xyuvLSB.png";
			break;
		case 4:
			msb.src = "GrayMSB.png";
			lsb.src = "GrayLSB.png";
			break;
	}
};
LUTPreview.prototype.loadedDefault = function() {
	if (this.gotLSB && this.gotMSB) {
		// Convert 8-bit Most Significant Bits (MSB) and Least Significant Bits (LSB) S-Log3 pngs into a Float64 Array
		// of linear RGB values
		var lsb = this.lCtx.getImageData(0,0,960,540);
		var msb = this.pCtx.getImageData(0,0,960,540);
		var max = Math.round(msb.data.length/4);
		var def = new Float64Array(max*3);
		if (this.defNext === 3) {
			var x,y,z;
			for (var j=0; j<max; j++) {
				x = parseFloat((msb.data[(j*4)+0]*256)+lsb.data[(j*4)+0])/65535;
				y = parseFloat((msb.data[(j*4)+1]*256)+lsb.data[(j*4)+1])/65535;
				z = parseFloat((msb.data[(j*4)+2]*256)+lsb.data[(j*4)+2])/65535;
// Change this if I move from S-Gamut3.cine
				def[(j*3)+0] = (1.8467789693*x) + (-0.5259861230*y) + (-0.2105452114*z);
				def[(j*3)+1] = (-0.4441532629*x) + (1.2594429028*y) + (0.1493999729*z);
				def[(j*3)+2] = (0.0408554212*x) + (0.0156408893*y) + (0.8682072487*z);
			}
		} else {
			for (var j=0; j<max; j++) {
				def[(j*3)+0] = this.sl3ToLin(parseFloat((msb.data[(j*4)+0]*256)+lsb.data[(j*4)+0])/65535);
				def[(j*3)+1] = this.sl3ToLin(parseFloat((msb.data[(j*4)+1]*256)+lsb.data[(j*4)+1])/65535);
				def[(j*3)+2] = this.sl3ToLin(parseFloat((msb.data[(j*4)+2]*256)+lsb.data[(j*4)+2])/65535);
			}
		}
		this.def[this.defNext] = def;
		this.defNext--;
		if (this.defNext >= 0) {
//			this.loadDefault(this.defNext);
			this.defaultImgs(this.defNext);
		} else {
			this.pre = this.def[0];
			var shed = document.getElementById('shed');
			var imgs = [];
			[].push.apply(imgs,shed.getElementsByTagName('img'));
			max = imgs.length-1;
			for (var j=max; j>=0; j--) {
				shed.removeChild(imgs[j]);
				imgs[j] = null;
			}
			this.refresh();
			lutcalcReady(this.p);
		}
	}
};
LUTPreview.prototype.updatePopup = function() {
	this.preGammaSelect.length = 0;
	this.preGamutSelect.length = 0;
	var max1 = this.inputs.inGammaOpts.length;
	var max2 = this.inputs.inLinGammaOpts.length;
	for (var j=0; j<max1; j++) {
		if (this.inputs.inGammaOpts[j].value === '9999') {
			for (var k=0; k<max2; k++) {
				var option = document.createElement('option');
				option.value = this.inputs.inLinGammaOpts[k].value;
				option.appendChild(this.inputs.inLinGammaOpts[k].lastChild.cloneNode(false));
				this.preGammaSelect.appendChild(option);
			}
		} else {
			var option = document.createElement('option');
			option.value = this.inputs.inGammaOpts[j].value;
			option.appendChild(this.inputs.inGammaOpts[j].lastChild.cloneNode(false));
			this.preGammaSelect.appendChild(option);
		}
	}
	var max1 = this.inputs.inGamut.options.length;
	for (var j=0; j<max1; j++) {
		if (this.inputs.inGamutOpts[j].lastChild.nodeValue !== 'Passthrough') {
			var option = document.createElement('option');
			option.value = this.inputs.inGamutOpts[j].value;
			option.appendChild(this.inputs.inGamutOpts[j].lastChild.cloneNode(false));
			this.preGamutSelect.appendChild(option);
		}
	}
	this.preCSBoxHolder.style.display = 'block';
	modalBox.className = 'modalbox';
};
LUTPreview.prototype.preGetImg = function() {
    var validExts;
    if (this.inputs.isApp) {
        validExts = ['jpg','jpeg','png','bmp','tiff','tif'];
    } else {
        validExts = ['jpg','jpeg','png','bmp'];
    }
	if (this.inputs.isApp || this.fileInput.value !== '') {
		this.file.loadImgFromInput(this.fileInput, validExts, 'preFileData', this, 0);
	}
};
LUTPreview.prototype.followUp = function(d) {
	switch (d) {
        case 0: this.preGotImg();
			break;
	}
};
LUTPreview.prototype.preGotImg = function() {
	if (this.inputs.isApp) {
		this.preIn = this.inputs.preFileData.imageData;
	} else {
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
	}
	this.updatePopup();
};
LUTPreview.prototype.prepPreview = function() {
	this.messages.gaTx(8,14,{
		gamma: parseInt(this.preGammaSelect.options[this.preGammaSelect.options.selectedIndex].value),
		gamut: parseInt(this.preGamutSelect.options[this.preGamutSelect.options.selectedIndex].value),
		legal: this.preLegalRange.checked,
		i: this.preIn.buffer
	});
};
LUTPreview.prototype.preppedPreview = function(buff) {
	this.def[5] = new Float64Array(buff);
	this.pre = this.def[5];
	if (this.defSelect.options.length === 5) {
		var option = document.createElement('option');
		option.value = 5;
		this.defSelect.appendChild(option);
		this.defSelect.options[5].appendChild(document.createTextNode(this.inputs.preFileData.title));
	}
	this.defSelect.options[5].removeChild(this.defSelect.options[5].firstChild);
	this.defSelect.options[5].appendChild(document.createTextNode(this.inputs.preFileData.title));
	this.defSelect.options[5].selected = true;
//	this.refresh();
	this.toggleDefault();
};
// Scope drawing
LUTPreview.prototype.clearWaveform = function() {
	var max = 960*540*4;
	for (var j=0; j<max; j += 4) {
		this.wData.data[ j ] = 0;
		this.wData.data[j+1] = 0;
		this.wData.data[j+2] = 0;
		this.wData.data[j+3] = 255;
	}
};
LUTPreview.prototype.clearVectorScope = function() {
	var max = 960*540*4;
	for (var j=0; j<max; j += 4) {
		this.vData.data[ j ] = 0;
		this.vData.data[j+1] = 0;
		this.vData.data[j+2] = 0;
		this.vData.data[j+3] = 255;
	}
};
LUTPreview.prototype.clearParade = function() {
	var max = 960*540*4;
	for (var j=0; j<max; j += 4) {
		this.rgbData.data[ j ] = 0;
		this.rgbData.data[j+1] = 0;
		this.rgbData.data[j+2] = 0;
		this.rgbData.data[j+3] = 255;
	}
};
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
};
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
};
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
};
// Preview drawing
LUTPreview.prototype.isChanged = function(eiMult) {
	this.changed = true;
	if (typeof eiMult === 'number') {
		this.eiMult = eiMult;
	}
	if (this.show) {
		this.refresh();
	}
};
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
		this.pRaw.set(raster,data.line*this.width*3);
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
			var input = {
				line: this.line,
				upd: data.upd,
				o: this.pre.buffer.slice(this.line*this.rastSize,(this.line+1)*this.rastSize),
				leg: this.leg,
				eiMult: this.eiMult,
				to: ['o']
			};
			if (this.inputs.d[0].checked) {
				this.messages.gaTx(this.p,12,input);
			} else {
				this.messages.gtTx(this.p,12,input);
			}
		}
	}
};
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
		var max = Math.max(this.messages.getGammaThreads(),this.messages.getGamutThreads());
		this.upd++;
		for (var j=0; j<max; j++) {
			this.line = j;
			var input = {line: this.line, upd:this.upd, o: this.pre.buffer.slice(this.line*this.rastSize,(this.line+1)*this.rastSize), leg:this.leg, eiMult: this.eiMult, to: ['o']};
			if (this.inputs.d[0].checked) {
				this.messages.gaTx(this.p,12,input);
			} else {
				this.messages.gtTx(this.p,12,input);
			}
		}
	}
};
LUTPreview.prototype.testXY = function() {
	if (this.show && this.defOpt === this.chromOpt) {
		this.messages.gtTx(3,19,{});
	}
};
LUTPreview.prototype.updateXY = function(data) {
	var scale = 0.9 * this.height;
	var width = this.width;
	var height = this.height;
	var offset = (height - scale) / 2;
	var m = data.length;
	var b = m/2;
	var ctx = this.oCtx;
	ctx.clearRect(0, 0, this.width, this.height);
	var x,y;
	var u,v,den;
	ctx.font = '18pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	// Input
	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'RGB(240,64,64)';
	ctx.fillStyle = 'RGB(240,64,64)';
	x = offset + (scale * data[0]);
	y = scale * (1 - data[1]);
	ctx.moveTo(x + 2.5, y);
	ctx.arc(x, y, 2.5, 0, 2 * Math.PI, false);
	x = offset + (scale * data[2]);
	y = scale * (1 - data[3]);
	ctx.moveTo(x, y);
	for (var j=2; j<b; j += 2) {
		x = offset + (scale * data[j]);
		y = scale * (1 - data[j+1]);
		ctx.lineTo(x,y);
	}
	ctx.closePath();
	den = (12 * data[1]) - (2 * data[0]) + 3;
	u = ((4*data[0]/den)*scale/0.65) - (1.5*offset) + (width/2);
	v = scale - ((6*data[1]/den)*scale/0.65) - (1.5*offset);
	ctx.moveTo(u + 2.5, v);
	ctx.arc(u, v, 2.5, 0, 2 * Math.PI, false);
	den = (12 * data[3]) - (2 * data[2]) + 3;
	u = ((4*data[2]/den)*scale/0.65) - (1.5*offset) + (width/2);
	v = scale - ((6*data[3]/den)*scale/0.65) - (1.5*offset);
	ctx.moveTo(u, v);
	for (var j=2; j<b; j += 2) {
		den = (12 * data[j+1]) - (2 * data[j]) + 3;
		u = ((4*data[j]/den)*scale/0.65) - (1.5*offset) + (width/2);
		v = scale - ((6*data[j+1]/den)*scale/0.65) - (1.5*offset);
		ctx.lineTo(u,v);
	}
	ctx.closePath();
	ctx.fillText('Recorded: ' + this.inputs.inGamut.options[this.inputs.inGamut.selectedIndex].lastChild.nodeValue, width/4,0.15*height);
	ctx.stroke();
	// Output
	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'RGB(90,90,240)';
	ctx.fillStyle = 'RGB(90,90,240)';
	x = offset + (scale * data[b]);
	y = scale * (1 - data[b+1]);
	ctx.moveTo(x + 2.5, y);
	ctx.arc(x, y, 2.5, 0, 2 * Math.PI, false);
	x = offset + (scale * data[b+2]);
	y = scale * (1 - data[b+3]);
	ctx.moveTo(x, y);
	for (var j=b+2; j<m; j += 2) {
		x = offset + (scale * data[j]);
		y = scale * (1 - data[j+1]);
		ctx.lineTo(x,y);
	}
	ctx.closePath();
	den = (12 * data[b+1]) - (2 * data[b]) + 3;
	u = ((4*data[b]/den)*scale/0.65) - (1.5*offset) + (width/2);
	v = scale - ((6*data[b+1]/den)*scale/0.65) - (1.5*offset);
	ctx.moveTo(u + 2.5, v);
	ctx.arc(u, v, 2.5, 0, 2 * Math.PI, false);
	den = (12 * data[b+3]) - (2 * data[b+2]) + 3;
	u = ((4*data[b+2]/den)*scale/0.65) - (1.5*offset) + (width/2);
	v = scale - ((6*data[b+3]/den)*scale/0.65) - (1.5*offset);
	ctx.moveTo(u, v);
	for (var j=b+2; j<m; j += 2) {
		den = (12 * data[j+1]) - (2 * data[j]) + 3;
		u = ((4*data[j]/den)*scale/0.65) - (1.5*offset) + (width/2);
		v = scale - ((6*data[j+1]/den)*scale/0.65) - (1.5*offset);
		ctx.lineTo(u,v);
	}
	ctx.closePath();
	ctx.fillText('Output: ' + this.inputs.outGamut.options[this.inputs.outGamut.selectedIndex].lastChild.nodeValue, width/4,(0.15*height)+30);
	ctx.stroke();
};
// General helper functions
LUTPreview.prototype.sl3ToLin = function(input) {
 	if (input >= 0.1673609920) {
		return (Math.pow(10,(input - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
	} else {
		return (0.1677922920*input) - 0.0155818840;
	}
};
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
};
LUTPreview.prototype.getCanVal = function(x,y) {
	x = Math.round(x*960);
	y = Math.round(y*540);
	var t;
	var out = new Float64Array(3);
	var xj, yk;
	var div;
	for (var j=0; j<3; j++) {
		for (var k=0; k<3; k++) {
			xj = x + j;
			if (xj < 0) {
				xj = 0;
			} else if (xj > 960) {
				xj = 960;
			}
			yk = y + k;
			if (yk < 0) {
				yk = 0;
			} else if (yk > 540) {
				yk = 540;
			}
			t = (x + (y*960))*3;
			if (j === 1 && k === 1) {
				div = 4;
			} else if (j === 1 || k === 1) {
				div = 8;
			} else {
				div = 16;
			}
			out[0] += this.pre[ t ]/div;
			out[1] += this.pre[t+1]/div;
			out[2] += this.pre[t+2]/div;
		}
	}
	var s = Math.pow(Math.pow(out[0],2) + Math.pow(out[1],2) + Math.pow(out[2],2),0.5);
	return out;
};
// Event responses
LUTPreview.prototype.toggle = function() {
	if (this.show) {
		main.style.width = '69em';
		right.style.width = '33em';
		this.fieldset.style.display = 'none';
		this.sizeButton.style.display = 'none';
		this.fileButton.style.display = 'none';
		this.defSelect.style.display = 'none';
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
		this.fieldset.style.display = 'block';
		this.sizeButton.style.display = 'inline';
		this.fileButton.style.display = 'inline';
		this.defSelect.style.display = 'inline';
		this.show = true;
		this.preButton.value = 'Hide Preview';
		this.refresh();
	}
	this.inputs.showPreview = this.show;
	this.messages.showPreview();
};
LUTPreview.prototype.toggleSize = function() {
	if (this.small) {
		main.style.width = '86em';
		right.style.width = '52em';
		this.pCan.style.width = '48em';
		this.pCan.style.height = '27em';
		this.pCan.style.marginBottom = '-0.25em';
		this.sCan.style.width = '48em';
		this.sCan.style.height = '27em';
		this.sCan.style.marginTop = '-27em';
		this.sCan.style.marginBottom = '-0.25em';
		this.oCan.style.width = '48em';
		this.oCan.style.height = '27em';
		this.oCan.style.marginTop = '-27em';
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
		this.pCan.style.marginBottom = '-0.25em';
		this.sCan.style.width = '32em';
		this.sCan.style.height = '18em';
		this.sCan.style.marginTop = '-18em';
		this.sCan.style.marginBottom = '-0.25em';
		this.oCan.style.width = '32em';
		this.oCan.style.height = '18em';
		this.oCan.style.marginTop = '-18em';
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
};
LUTPreview.prototype.toggleDefault = function() {
	this.defOpt = this.defSelect.options.selectedIndex;
	if (this.defOpt === this.chromOpt) {
		this.oCan.style.display = 'block';
		this.testXY();
	} else {
		this.oCan.style.display = 'none';
	}
	this.changed = true;
	this.pre = this.def[this.defOpt];
	this.refresh();
};
LUTPreview.prototype.toggleRange = function() {
	if (this.preLeg.checked) {
		this.leg = true;
	} else {
		this.leg = false;
	}
	this.refresh();
};
LUTPreview.prototype.toggleWaveform = function() {
	if (this.wavCheck.checked) {
		this.wform = true;
		this.wCan.style.display = 'block';
	} else {
		this.wform = false;
		this.wCan.style.display = 'none';
	}
	this.refresh();
};
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
};
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
};
LUTPreview.prototype.rgbVals = function(x,y) {
	var rect = this.pCan.getBoundingClientRect();
	x = Math.round(960*(x - rect.left)/rect.width);
	y = 960*Math.round(540*(y - rect.top)/rect.height);
	var i = (x + y)*3;
	this.rgbR.innerHTML = Math.min(1023,Math.round(876*this.pRaw[ i ])+64).toString();
	this.rgbG.innerHTML = Math.min(1023,Math.round(876*this.pRaw[i+1])+64).toString();
	this.rgbB.innerHTML = Math.min(1023,Math.round(876*this.pRaw[i+2])+64).toString();
};
LUTPreview.prototype.rgbSamples = function(gridX,gridY) {
	var m = gridX.length; // sample count
	var out = new Float64Array(m*3); // r,g,b samples list to return to twk-samples.js
//	var stop = new Float64Array(m);
	var k,l;
	var x,y,i;
//	var r,g,b;
	var step = 3*960;
	for (var j=0; j<m; j++) {
		l = j*3;
		x = Math.min(958,Math.max(1,Math.round(960*gridX[j])));
		y = 960 * Math.min(538,Math.max(1,Math.round(540*gridY[j])));
		i = (x + y)*3;
		out[ l ] = this.pRaw[ i ];
		out[l+1] = this.pRaw[i+1];
		out[l+2] = this.pRaw[i+2];
		out[ l ] += this.pRaw[i-3];
		out[l+1] += this.pRaw[i-2];
		out[l+2] += this.pRaw[i-1];
		out[ l ] += this.pRaw[i+3];
		out[l+1] += this.pRaw[i+4];
		out[l+2] += this.pRaw[i+5];
		out[ l ] += this.pRaw[ i  + step];
		out[l+1] += this.pRaw[i+1 + step];
		out[l+2] += this.pRaw[i+2 + step];
		out[ l ] += this.pRaw[ i  - step];
		out[l+1] += this.pRaw[i+1 - step];
		out[l+2] += this.pRaw[i+2 - step];
		out[ l ] += this.pRaw[i-3 + step]*0.7;
		out[l+1] += this.pRaw[i-2 + step]*0.7;
		out[l+2] += this.pRaw[i-1 + step]*0.7;
		out[ l ] += this.pRaw[i-3 - step]*0.7;
		out[l+1] += this.pRaw[i-2 - step]*0.7;
		out[l+2] += this.pRaw[i-1 - step]*0.7;
		out[ l ] += this.pRaw[i+3 + step]*0.7;
		out[l+1] += this.pRaw[i+4 + step]*0.7;
		out[l+2] += this.pRaw[i+5 + step]*0.7;
		out[ l ] += this.pRaw[i+3 - step]*0.7;
		out[l+1] += this.pRaw[i+4 - step]*0.7;
		out[l+2] += this.pRaw[i+5 - step]*0.7;
		out[ l ] /= 7.8;
		out[l+1] /= 7.8;
		out[l+2] /= 7.8;
//		r = this.pre[ i ] + this.pre[i-3] + this.pre[i+3] + this.pre[ i  + step] + this.pre[ i  - step] + ((this.pre[i-3 + step] + this.pre[i-3 - step] + this.pre[i+3 + step] + this.pre[i+3 - step])*0.7);
//		g = this.pre[i+1] + this.pre[i-2] + this.pre[i+4] + this.pre[i+1 + step] + this.pre[i+1 - step] + ((this.pre[i-2 + step] + this.pre[i-2 - step] + this.pre[i+4 + step] + this.pre[i+4 - step])*0.7);
//		g = this.pre[i+2] + this.pre[i-1] + this.pre[i+5] + this.pre[i+2 + step] + this.pre[i+2 - step] + ((this.pre[i-1 + step] + this.pre[i-1 - step] + this.pre[i+5 + step] + this.pre[i+5 - step])*0.7);
//		stop[j] = ((0.21507582011558746*r) + (0.8850685017437284*g) + (-0.10014432185931582*b))/7.8;
	}
	return {
		title:this.defSelect.options[this.defSelect.selectedIndex].text,
		samples: out
//		stops: stop
	};
};
