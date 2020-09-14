/* lutcamerabox.js
* Camera and ISO options UI object for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTCameraBox(fieldset, inputs, messages) {
	this.inputs = inputs;
	this.messages = messages;
	this.p = 1;
	this.messages.addUI(this.p,this);
	this.box = document.createElement('fieldset');
	fieldset.appendChild(this.box);
	this.build();
	lutcalcReady(this.p);
}
LUTCameraBox.prototype.build = function() {
	this.io();
	this.ui();
};
LUTCameraBox.prototype.io = function() {
	this.cameras = [];
	this.cameraList();
	this.current = 0;
	this.manufacturerSelect = document.createElement('select');
	this.cameraSelect = document.createElement('select');
	this.manufacturerOptions();
	this.cameraOptions();
	this.inputs.addInput('bclip',this.cameras[this.current].bclip);
	this.inputs.addInput('wclip',this.cameras[this.current].wclip);
//	this.cameraSelect.options[this.current].selected = true;
	this.inputs.addInput('camera',this.cameraSelect);
	this.cameraType = document.createElement('input');
	this.cameraType.setAttribute('type','hidden');
	this.cameraType.value = this.cameras[this.current].type.toString();
	this.inputs.addInput('cameraType',this.cameraType);
	this.nativeLabel = document.createElement('label');
	this.inputs.addInput('nativeISO',this.nativeLabel);
	this.cineeiInput = document.createElement('input');
	this.cineeiInput.setAttribute('type','number');
	this.cineeiInput.className = 'iso-input';
	this.cineeiInput.value = this.cameras[this.current].iso.toString();
	this.inputs.addInput('cineEI',this.cineeiInput);
	this.shiftInput = document.createElement('input');
	this.shiftInput.setAttribute('type','number');
	this.shiftInput.setAttribute('step','any');
	this.shiftInput.className = 'shift-input';
	this.shiftInput.value = '0';
	this.inputs.addInput('stopShift',this.shiftInput);
	this.inputs.addInput('defGammaIn',this.cameras[this.current].defgamma);
	this.inputs.addInput('defGamutIn',this.cameras[this.current].defgamut);
};
LUTCameraBox.prototype.ui = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Camera')));
	this.box.appendChild(this.manufacturerSelect);
	this.box.appendChild(this.cameraSelect);
	this.box.appendChild(this.cameraType);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Native ISO:')));
	this.nativeLabel.innerHTML = this.cameras[this.current].iso.toString();
	this.box.appendChild(this.nativeLabel);
	this.recorded = document.createElement('div');
	this.cineeiLabel = document.createElement('label');
	this.cineeiLabel.innerHTML = 'CineEI ISO';
	this.recorded.appendChild(this.cineeiLabel);
	this.recorded.appendChild(this.cineeiInput);
	this.box.appendChild(this.recorded);
	this.shifted = document.createElement('div');
	this.shifted.appendChild(document.createElement('label').appendChild(document.createTextNode('Stop Correction')));
	this.shifted.appendChild(this.shiftInput);
	this.box.appendChild(this.shifted);
};
LUTCameraBox.prototype.events = function() {
	this.manufacturerSelect.onchange = function(here){ return function(){
		here.cameraOptions();
		here.changeCamera();
		here.messages.changeCamera();
	};}(this);
	this.cameraSelect.onchange = function(here){ return function(){
		here.changeCamera();
		here.messages.changeCamera();
	};}(this);
	this.cineeiInput.onchange = function(here){ return function(){
		here.changeCineEI();
		here.messages.gaSetParams();
	};}(this);
	this.shiftInput.onchange = function(here){ return function(){
		here.changeShift();
		here.messages.gaSetParams();
	};}(this);
};
// Set Up Data
LUTCameraBox.prototype.cameraList = function() {
// Type: 0 == CineEI, 1 == Variable Parameters (Arri), 2 == Baked In Gain (Canon)
	this.cameras.push({make:"Sony",model:"Venice",iso:500,type:0,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine (Venice)",bclip:-9,wclip:6});
	this.cameras.push({make:"Sony",model:"Venice (High Base)",iso:2500,type:0,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine (Venice)",bclip:-9,wclip:6});
	this.cameras.push({make:"Sony",model:"PXW-FX9",iso:800,type:0,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"PXW-FX9 (High Base)",iso:4000,type:0,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"PMW-F55",iso:1250,type:0,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"PMW-F5",iso:2000,type:0,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"PXW-FS7",iso:2000,type:0,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"PXW-FS5",iso:3200,type:2,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"NEX-FS700",iso:2000,type:2,defgamma:"S-Log2",defgamut:"Sony S-Gamut",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"a7s mkII",iso:1600,type:2,defgamma:"S-Log3",defgamut:"Sony S-Gamut3.cine",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"a7s",iso:3200,type:2,defgamma:"S-Log2",defgamut:"Sony S-Gamut",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"F65",iso:800,type:0,defgamma:"S-Log3",defgamut:"Sony S-Gamut3",bclip:-8,wclip:6});
	this.cameras.push({make:"Sony",model:"PMW-F3",iso:800,type:0,defgamma:"S-Log",defgamut:"Sony S-Gamut",bclip:-6.6,wclip:5.5});
	this.cameras.push({make:"Sony",model:"F35",iso:500,type:0,defgamma:"S-Log",defgamut:"Sony S-Gamut",bclip:-6.6,wclip:5.5});
	this.cameras.push({make:"ARRI",model:"Alexa / Amira",iso:800,type:1,defgamma:"LogC (Sup 3.x & 4.x)",defgamut:"Alexa Wide Gamut",bclip:-6.6,wclip:7.4});
	this.cameras.push({make:"RED",model:"Epic DRAGON",iso:800,type:0,defgamma:"REDLogFilm",defgamut:"DRAGONColor2",bclip:-10,wclip:6.3});
	this.cameras.push({make:"Canon",model:"C300",iso:850,type:2,defgamma:"C-Log",defgamut:"Canon CP IDT (Daylight)",bclip:-6.7,wclip:5.3});
	this.cameras.push({make:"Canon",model:"C300mkII",iso:800,type:2,defgamma:"Canon C-Log2",defgamut:"Canon Cinema Gamut",bclip:-8.7,wclip:6.3});
	this.cameras.push({make:"Canon",model:"C300mkIII",iso:800,type:2,defgamma:"Canon C-Log2",defgamut:"Canon Cinema Gamut",bclip:-8.7,wclip:6.3});
	this.cameras.push({make:"Canon",model:"C500",iso:850,type:2,defgamma:"C-Log",defgamut:"Canon Cinema Gamut",bclip:-6.7,wclip:5.3});
	this.cameras.push({make:"Canon",model:"C500mkIII",iso:800,type:2,defgamma:"Canon C-Log2",defgamut:"Canon Cinema Gamut",bclip:-8.7,wclip:6.3});
	this.cameras.push({make:"Panasonic",model:"Varicam 35",iso:800,type:2,defgamma:"Panasonic V-Log",defgamut:"Panasonic V-Gamut",bclip:-7.5,wclip:6.5});
	this.cameras.push({make:"Panasonic",model:"Varicam 35 (High Base)",iso:5000,type:2,defgamma:"Panasonic V-Log",defgamut:"Panasonic V-Gamut",bclip:-7.5,wclip:6.5});
	this.cameras.push({make:"Panasonic",model:"AU-EVA1",iso:800,type:2,defgamma:"Panasonic V-Log",defgamut:"Panasonic V-Gamut",bclip:-7.5,wclip:6.5});
	this.cameras.push({make:"Panasonic",model:"AU-EVA1 (High Base)",iso:2500,type:2,defgamma:"Panasonic V-Log",defgamut:"Panasonic V-Gamut",bclip:-7.5,wclip:6.5});
	this.cameras.push({make:"Panasonic",model:"GH4",iso:200,type:2,defgamma:"Panasonic V-Log",defgamut:"Panasonic V-Gamut",bclip:-8,wclip:4});
	this.cameras.push({make:"Panasonic",model:"GH5",iso:200,type:2,defgamma:"Panasonic V-Log",defgamut:"Panasonic V-Gamut",bclip:-8,wclip:4});
	this.cameras.push({make:"Blackmagic",model:"Pocket Cinema 6k",iso:400,type:2,defgamma:"BMD Pocket Film",defgamut:"Passthrough",bclip:-7.5,wclip:5.9});
	this.cameras.push({make:"Blackmagic",model:"Pocket Cinema 6k (High Base)",iso:3200,type:2,defgamma:"BMD Pocket Film",defgamut:"Passthrough",bclip:-6.5,wclip:5.6});
	this.cameras.push({make:"Blackmagic",model:"Pocket Cinema 4k",iso:400,type:2,defgamma:"BMD Pocket Film",defgamut:"Passthrough",bclip:-7.6,wclip:5.5});
	this.cameras.push({make:"Blackmagic",model:"Pocket Cinema 4k (High Base)",iso:3200,type:2,defgamma:"BMD Pocket Film",defgamut:"Passthrough",bclip:-7.2,wclip:5.1});
	this.cameras.push({make:"GoPro",model:"Hero",iso:400,type:2,defgamma:"Protune",defgamut:"Protune Native",bclip:-9,wclip:3.3});
	this.cameras.push({make:"DJI",model:"Mavic 2",iso:400,type:2,defgamma:"DJI DLog-M",defgamut:"Passthrough",bclip:-10.3,wclip:3.7});
	this.cameras.push({make:"DJI",model:"Zenmuse X7",iso:400,type:2,defgamma:"DJI X5/X7 DLog",defgamut:"Passthrough",bclip:-9.2,wclip:4.8});
	this.cameras.push({make:"DJI",model:"Zenmuse X5S",iso:500,type:2,defgamma:"DJI X5/X7 DLog",defgamut:"Passthrough",bclip:-7.7,wclip:5.13});
	this.cameras.push({make:"DJI",model:"Zenmuse X3",iso:100,type:2,defgamma:"DJI X3 DLog",defgamut:"Passthrough",bclip:-7,wclip:3});
	this.cameras.push({make:"Nikon",model:"Z6",iso:800,type:2,defgamma:"Nikon N-Log",defgamut:"Rec2020",bclip:-6,wclip:6});
	this.cameras.push({make:"Nikon",model:"Z7",iso:800,type:2,defgamma:"Nikon N-Log",defgamut:"Rec2020",bclip:-6,wclip:6});
//	this.cameras.push({make:"Nikon",model:"Z780",iso:800,type:2,defgamma:"NLog",defgamut:"Rec2020",bclip:-6,wclip:6});
	this.cameras.push({make:"Nikon",model:"D800",iso:100,type:2,defgamma:"Nikon Neutral",defgamut:"Passthrough",bclip:-10.9,wclip:3.5});
	this.cameras.push({make:"",model:"Generic",iso:800,type:2,defgamma:"Cineon",defgamut:"Rec709",bclip:-10,wclip:10});
};
LUTCameraBox.prototype.clearSelect = function(sel) {
	var m = sel.options.length;
	for (var j=0; j<m; j++) {
		sel.remove(0);
	}
};
LUTCameraBox.prototype.manufacturerOptions = function() {
	var manufacturers = ["Sony", "ARRI", "RED", "Canon", "Panasonic", "Blackmagic", "GoPro", "DJI", "Nikon", "All"];
	var max = manufacturers.length;
	for (var i=0; i<max; i++) {
		var option = document.createElement('option');
		option.value = manufacturers[i];
		option.appendChild(document.createTextNode(manufacturers[i]));
		if (manufacturers[i] === 'Sony') {
			option.selected = true;
		}
		this.manufacturerSelect.appendChild(option);
	}
}
LUTCameraBox.prototype.cameraOptions = function() {
	this.clearSelect(this.cameraSelect);
	var max = this.cameras.length;
	var currentMake = this.manufacturerSelect.options[this.manufacturerSelect.selectedIndex].value;
	if (currentMake === "All") {
		for (var i=0; i<max; i++) {
			var option = document.createElement('option');
			option.value = i;
			option.appendChild(document.createTextNode(this.cameras[i].make + " " + this.cameras[i].model));
			if (this.cameraSelect.options.length === 0) {
				this.current = i;
				option.selected = true;
			}
			this.cameraSelect.appendChild(option);
		}
	} else {
		for (var i=0; i<max; i++) {
			if (this.cameras[i].make === currentMake || this.cameras[i].make === "") {
				var option = document.createElement('option');
				option.value = i;
				option.appendChild(document.createTextNode(this.cameras[i].model));
				if (this.cameraSelect.options.length === 0) {
					this.current = i;
					option.selected = true;
				}
				this.cameraSelect.appendChild(option);
			}
		}
	}
};
// Event Responses
LUTCameraBox.prototype.changeCamera = function() {
	this.current = parseInt(this.cameraSelect.options[this.cameraSelect.selectedIndex].value);
	this.inputs.defGammaIn = this.cameras[this.current].defgamma;
	this.inputs.defGamutIn = this.cameras[this.current].defgamut;
	var m = this.inputs.inGammaSubs.options.length;
	var found = false;
	var allIdx = m-1;
	for (var j=0; j<m; j++) {
		if (this.inputs.inGammaSubs.options[j].lastChild.nodeValue === this.cameras[this.current].make) {
			this.inputs.inGammaSubs.options[j].selected = true;
			found = true;
			break;
		} else if (this.inputs.inGammaSubs.options[j].lastChild.nodeValue === 'All') {
			allIdx = j;
		}
	}
	if (!found) {
		this.inputs.inGammaSubs.options[allIdx].selected = true;
	}
	found = false;
	allIdx = m-1;
	m = this.inputs.inGamutSubs.options.length;
	for (var j=0; j<m; j++) {
		if (this.inputs.inGamutSubs.options[j].lastChild.nodeValue === this.cameras[this.current].make) {
			this.inputs.inGamutSubs.options[j].selected = true;
			found = true;
			break;
		} else if (this.inputs.inGamutSubs.options[j].lastChild.nodeValue === 'All') {
			allIdx = j;
		}
	}
	if (!found) {
		this.inputs.inGamutSubs.options[allIdx].selected = true;
	}
	this.inputs.bclip = this.cameras[this.current].bclip;
	this.inputs.wclip = this.cameras[this.current].wclip;
	if (this.cameras[this.current].model === 'Generic') {
		this.nativeLabel.innerHTML = 'N/A';
	} else {
		this.nativeLabel.innerHTML = this.cameras[this.current].iso.toString();
	}
	this.cineeiInput.value = this.cameras[this.current].iso.toString();
	this.shiftInput.value = '0';
	this.cameraType.value = this.cameras[this.current].type.toString();
	if (this.cameras[this.current].type === 2) {
		this.recorded.className = 'base-inputbox-hide';
		this.shifted.className = 'base-inputbox';
	} else if (this.cameras[this.current].type === 1) {
		this.recorded.className = 'base-inputbox';
		this.shifted.className = 'base-inputbox';
		this.cineeiLabel.innerHTML = 'Recorded ISO';
	} else {
		this.recorded.className = 'base-inputbox';
		this.shifted.className = 'base-inputbox';
		this.cineeiLabel.innerHTML = 'CineEI ISO';
	}
	this.cameraType.value = this.cameras[this.current].type;
};
LUTCameraBox.prototype.changeCineEI = function(){
	if (/^([1-9]\d*)$/.test(this.cineeiInput.value)) {
	} else {
		this.cineeiInput.value = this.cameras[this.current].iso.toString();
	}
	if (this.cameras[this.current].type === 0) {
		var stopShift = (Math.log(parseFloat(this.cineeiInput.value)/parseFloat(this.nativeLabel.innerHTML))/Math.LN2);
		this.shiftInput.value = stopShift.toFixed(4).toString();
	}
};
LUTCameraBox.prototype.changeShift = function() {
	if (!isNaN(parseFloat(this.shiftInput.value)) && isFinite(this.shiftInput.value)) {
	} else {
		this.shiftInput.value = '0';
	}
	if (this.cameras[this.current].type === 0) {
		this.cineeiInput.value = Math.round((Math.pow(2,parseFloat(this.shiftInput.value)))*parseFloat(this.nativeLabel.innerHTML)).toString();
	}

};
LUTCameraBox.prototype.getInfo = function(info) {
	var idx = parseInt(this.cameraSelect.options[this.cameraSelect.selectedIndex].value);
	info.camera = this.cameras[idx].make + " " + this.cameras[idx].model;
	info.camera = info.camera.trim();
	info.cineEI = parseFloat(this.shiftInput.value);
};
LUTCameraBox.prototype.getSettings = function(data) {
	var camIdx = parseInt(this.cameraSelect.options[this.cameraSelect.selectedIndex].value);
	data.cameraBox = {
		make: this.cameras[camIdx].make,
		model: this.cameras[camIdx].model,
		shift: parseFloat(this.shiftInput.value)
	};
};
LUTCameraBox.prototype.setSettings = function(settings) {
	if (typeof settings.cameraBox !== 'undefined') {
		var data = settings.cameraBox;
		if (typeof data.model === 'string') {
			var m = this.cameras.length;
			for (var j=0; j<m; j++) {
				if (this.cameras[j].model === data.model) {
					this.cameraSelect.options[j].selected = true;
					break;
				}
			}
			this.changeCamera();
		}
		if (typeof data.shift === 'number') {
			this.shiftInput.value = data.shift.toString();
			this.changeShift();
		}
	}
};
LUTCameraBox.prototype.getHeight = function() {
	return this.box.clientHeight;
};
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
