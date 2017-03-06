/* twk-gamlim.js
* A gamut limiter to avoid ugly clipping for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKGamutLim(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKGamutLim.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	// Max Start Value
	// Pre / Post option radios
	this.linear = false;
	this.prePost = [];
	this.prePost[0] = this.createRadioElement('prePostRadio',false);
	this.prePost[1] = this.createRadioElement('prePostRadio',true);
	// Linear Space Level Slider
	this.preSlider = document.createElement('input');
	this.preSlider.setAttribute('type','range');
	this.preSlider.setAttribute('min',-6);
	this.preSlider.setAttribute('max',6);
	this.preSlider.setAttribute('step',0.1);
	this.preSlider.setAttribute('value',0);
	// Linear Space Level Input 18% Gray
	this.gOff = 23;
	this.gMin = this.gOff - 60;
	this.gMax = 60 - this.gOff;
	this.preInputG = document.createElement('input');
	this.preInputG.setAttribute('type','number');
	this.preInputG.setAttribute('step',0.1);
	this.preInputG.value = 2.3;
	this.preInputG.className = 'smallinput';
	// Linear Space Level Input 90% White
	this.preInput = document.createElement('input');
	this.preInput.setAttribute('type','number');
	this.preInput.setAttribute('step',0.1);
	this.preInput.value = 0;
	this.preInput.className = 'smallinput';
	// Post Tone Map Level Slider
	this.pstSlider = document.createElement('input');
	this.pstSlider.setAttribute('type','range');
	this.pstSlider.setAttribute('min',1);
	this.pstSlider.setAttribute('max',109);
	this.pstSlider.setAttribute('step',1);
	this.pstSlider.setAttribute('value',100);
	// Post Tone Map Level Input
	this.pstInput = document.createElement('input');
	this.pstInput.setAttribute('type','number');
	this.pstInput.setAttribute('step',1);
	this.pstInput.value = 100;
	this.pstInput.className = 'smallinput';
	// Gamut List
	this.gtSelect = document.createElement('select');
	this.gamutList = this.inputs.gamutMatrixList;
	m = this.gamutList.length;
	var opt = document.createElement('option');
	opt.value = 9999;
	opt.appendChild(document.createTextNode('Match Output Gamut'));
	this.gtSelect.appendChild(opt);
	for (var j=0; j<m; j++) {
		var option = document.createElement('option');
		option.value = this.gamutList[j].idx;
		option.appendChild(document.createTextNode(this.gamutList[j].name));
		this.gtSelect.appendChild(option);
	}
	this.diffGam = false;
	this.bothCheck = document.createElement('input');
	this.bothCheck.setAttribute('type','checkbox');
	this.bothCheck.className = 'twk-checkbox';
	this.bothCheck.checked = true;
};
TWKGamutLim.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Gamut Limiter')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	// Pre / Post radio choice
	this.box.appendChild(this.prePost[0]);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Linear Space')));
	this.box.appendChild(this.prePost[1]);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Post Gamma')));
	// Linear Space Level Value
	this.preBox = document.createElement('div');
	this.preBox.className = 'twk-tab-hide';
	this.preBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Level')));
	this.preBox.appendChild(this.preSlider);
	this.preBox.appendChild(document.createElement('br'));
	this.preBox.appendChild(document.createElement('label').appendChild(document.createTextNode('18% Gray +')));
	this.preBox.appendChild(this.preInputG);
	this.preBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops / Ref White +')));
	this.preBox.appendChild(this.preInput);
	this.preBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops')));
	this.box.appendChild(this.preBox);
	// Post Tonemap Level Value
	this.pstBox = document.createElement('div');
	this.pstBox.className = 'twk-tab';
	this.pstBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Level')));
	this.pstBox.appendChild(this.pstSlider);
	this.pstBox.appendChild(this.pstInput);
	this.pstBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.box.appendChild(this.pstBox);
	// Limit to other colourspaces
	this.gtBox = document.createElement('div');
	this.gtBox.className = 'twk-tab';
	this.gtBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Gamut To Limit To')));
	this.gtBox.appendChild(this.gtSelect);
	this.bothBox = document.createElement('div');
	this.bothBox.className = 'twk-tab-hide';
	this.bothBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Protect Both')));
	this.bothBox.appendChild(this.bothCheck);
	this.gtBox.appendChild(this.bothBox);
	this.box.appendChild(this.gtBox);
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKGamutLim.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked && this.inputs.d[1].checked) {
		if (this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue !== 'Null') {
			this.holder.className = 'tweakholder';
		} else {
			this.holder.className = 'tweakholder-hide';
			this.tweakCheck.checked = false;
		}
	} else {
		this.holder.className = 'tweakholder-hide';
		this.tweakCheck.checked = false;
	}
	this.toggleTweak();
};
TWKGamutLim.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKGamutLim.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKGamutLim.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doGamutLim = true;
	} else {
		out.doGamutLim = false;
	}
	if (this.linear) {
		out.lin = true;
		out.level = Math.pow(2,parseFloat(this.preSlider.value)); // Effect start level in stops around 18% gray
	} else {
		out.lin = false;
		out.level = parseFloat(this.pstSlider.value)/100; // Effect start level in % IRE
	}
	if (this.diffGam) {
		out.gamut = this.gtSelect.options[this.gtSelect.selectedIndex].lastChild.nodeValue;
		out.both = this.bothCheck.checked;
	}
	params.twkGamutLim = out;
};
TWKGamutLim.prototype.setParams = function(params) {
	if (typeof params.twkGamutLim !== 'undefined') {
		var p = params.twkGamutLim;
		this.toggleTweaks();
	}
};
TWKGamutLim.prototype.getSettings = function(data) {
	data.gamutLim = {
		doGamutLim: this.tweakCheck.checked,
	};
};
TWKGamutLim.prototype.setSettings = function(settings) {
	if (typeof settings.gamutLim !== 'undefined') {
		var data = settings.gamutLim;
		if (typeof data.doGamutLim === 'boolean') {
			this.tweakCheck.checked = data.doGamutLim;
			this.toggleTweak();
		}
	}
};
TWKGamutLim.prototype.getInfo = function(info) {
	// Provides metadata to LUT formats
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doGamutLim = true;
	} else {
		info.doGamutLim = false;
	}
};
TWKGamutLim.prototype.isCustomGamma = function() {
	return false;
};
TWKGamutLim.prototype.isCustomGamut = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
	return false;
};
TWKGamutLim.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.prePost[0].onchange = function(here){ return function(){
		here.togglePrePost();
	};}(this);
	this.prePost[1].onchange = function(here){ return function(){
		here.togglePrePost();
	};}(this);
	this.preSlider.oninput = function(here){ return function(){
		here.testPre(true);
		here.messages.gtSetParams();
	};}(this);
	this.preInput.onchange = function(here){ return function(){
		here.testPre(false);
		here.messages.gtSetParams();
	};}(this);
	this.preInputG.onchange = function(here){ return function(){
		here.testPreG();
		here.messages.gtSetParams();
	};}(this);
	this.pstSlider.oninput = function(here){ return function(){
		here.testPst(true);
		here.messages.gtSetParams();
	};}(this);
	this.pstInput.onchange = function(here){ return function(){
		here.testPst(false);
		here.messages.gtSetParams();
	};}(this);
	this.gtSelect.onchange = function(here){ return function(){
		here.diffGamut();
		here.messages.gtSetParams();
	};}(this);
	this.bothCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKGamutLim.prototype.togglePrePost = function() {
	if (this.prePost[0].checked) {
		this.linear = true;
		this.preBox.className = 'twk-tab';
		this.pstBox.className = 'twk-tab-hide';
	} else {
		this.linear = false;
		this.preBox.className = 'twk-tab-hide';
		this.pstBox.className = 'twk-tab';
	}
	this.messages.gtSetParams();
};
TWKGamutLim.prototype.testPre = function(slider) {
	var val;
	if (slider) {
		val = parseFloat(this.preSlider.value);
	} else {
		val = parseFloat(this.preInput.value);
	}
	if (val > 6) {
		val = 6;
	} else if (val < -6) {
		val = -6;
	}
	this.preSlider.value = val;
	this.preInput.value = val;
	this.preInputG.value = Math.round((val*10) + this.gOff)/10;
};
TWKGamutLim.prototype.testPreG = function() {
	var val = Math.round(parseFloat(this.preInputG.value)*10);
	if (val > this.gMax) {
		val = this.gMax;
	} else if (val < this.gMin) {
		val = this.gMin;
	}
	this.preSlider.value = (val - this.gOff)/10;
	this.preInput.value = (val - this.gOff)/10;
	this.preInputG.value = val/10;
};
TWKGamutLim.prototype.testPst = function(slider) {
	var val;
	if (slider) {
		val = parseFloat(this.pstSlider.value);
	} else {
		val = parseFloat(this.pstInput.value);
	}
	if (val > 109) {
		val = 109;
	} else if (val < 1) {
		val = 1;
	}
	this.pstSlider.value = val;
	this.pstInput.value = val;
};
TWKGamutLim.prototype.diffGamut = function() {
	if (this.gtSelect.selectedIndex > 0 && this.gtSelect.options[this.gtSelect.selectedIndex].lastChild.nodeValue !== this.inputs.outGamut.options[this.inputs.outGamut.selectedIndex].lastChild.nodeValue) {
		this.bothBox.className = 'twk-tab';
		this.diffGam = true;
	} else {
		this.bothBox.className = 'twk-tab-hide';
		this.diffGam = false;
	}
};
TWKGamutLim.prototype.changeGamut = function() {
	var gtList = this.inputs.outGamut;
	var m = this.gtSelect.length;
	var matrix = false;
	for (var j=1; j<m; j++) {
		if (gtList.options[gtList.selectedIndex].lastChild.nodeValue === this.gtSelect.options[j].lastChild.nodeValue) {
			matrix = true;
			break;
		}
	}
	if (matrix) {
		this.gtBox.className = 'twk-tab';
		this.diffGamut();
	} else {
		this.gtBox.className = 'twk-tab-hide';
		this.diffGam = false;
	}
}
TWKGamutLim.prototype.createRadioElement = function(name, checked) {
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

