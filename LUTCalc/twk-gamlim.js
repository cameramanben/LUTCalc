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
	// Sliders
	this.preInputBox = document.createElement('span');
	this.preIG = document.createElement('input');
	this.preIG.setAttribute('type','number');
	this.preIG.setAttribute('step',0.1);
	this.preIG.value = 2.3;
	this.preIG.className = '_input';
	this.preS = new lutSlider({
		min: -6,
		max: 6,
		value: 0,
		step: 0.1,
		title: 'Level',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		lhs: this.preInputBox,
		rhs: 'Stops',
		reset: false
	});
	this.pstS = new lutSlider({
		min: 1,
		max: 109,
		value: 100,
		step: 1,
		title: 'Level',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		rhs: '%IRE',
		reset: false
	});
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
	var preLabL = document.createElement('span');
	preLabL.innerHTML = '18% Gray +';
	var preLabR = document.createElement('span');
	preLabR.innerHTML = 'Stops /';
	var pstLabL = document.createElement('span');
	pstLabL.innerHTML = 'Ref White +';
	this.preInputBox.appendChild(preLabL);
	this.preInputBox.appendChild(this.preIG);
	this.preInputBox.appendChild(preLabR);
	this.preInputBox.appendChild(pstLabL);
	this.preBox.appendChild(this.preS.element);
	this.box.appendChild(this.preBox);
	// Post Tonemap Level Value
	this.pstBox = document.createElement('div');
	this.pstBox.className = 'twk-tab';
	this.pstBox.appendChild(this.pstS.element);
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
		out.level = Math.pow(2,this.preS.getValue()); // Effect start level in stops around 18% gray
	} else {
		out.lin = false;
		out.level = this.pstS.getValue()/100; // Effect start level in % IRE
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
		preLevel: Math.pow(2,this.preS.getValue()),
		postLevel: this.pstS.getValue()/100,
		otherGamut: this.diffGam,
		otherWhich: this.gtSelect.options[this.gtSelect.selectedIndex].lastChild.nodeValue,
		both: this.bothCheck.checked
	};
	if (this.linear) {
		data.gamutLim.when = 'pre';
	} else {
		data.gamutLim.when = 'post';
	}
};
TWKGamutLim.prototype.setSettings = function(settings) {
	if (typeof settings.gamutLim !== 'undefined') {
		var data = settings.gamutLim;
		if (typeof data.doGamutLim === 'boolean') {
			this.tweakCheck.checked = data.doGamutLim;
			this.toggleTweak();
		}
		if (typeof data.preLevel === 'number') {
			this.preS.setValue(Math.log(data.preLevel)/Math.log(2));
			this.preIG.value = Math.round((this.preS.getValue()*10) + 23)/10;
		}
		if (typeof data.postLevel === 'number') {
			this.pstS.setValue(data.postLevel*100);
		}
		if (typeof data.otherGamut === 'boolean') {
			this.diffGam = data.otherGamut;
		}
		if (typeof data.otherWhich !== 'undefined') {
			var m = this.gtSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.gtSelect.options[j].lastChild.nodeValue === data.otherWhich) {
					this.gtSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.both === 'boolean') {
			this.bothCheck.checked = data.both
		}
		if (typeof data.when !== 'undefined') {
			if (data.when === 'pre') {
				this.prePost[0].checked = true;
				this.prePost[1].checked = false;
			} else {
				this.prePost[0].checked = false;
				this.prePost[1].checked = true;
			}
			this.togglePrePost();
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
	this.preS.action = function(here){ return function(){
		here.preIG.value = Math.round((this.getValue()*10) + 23)/10;
		here.messages.gtSetParams();
	};}(this);
	this.preIG.onchange = function(here){ return function(){
		here.testPreG();
		here.messages.gtSetParams();
	};}(this);
	this.pstS.action = function(here){ return function(){
		here.preIG.value = Math.round((this.getValue()*10) + 23)/10;
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
TWKGamutLim.prototype.testPreG = function() {
	var val = Math.round(parseFloat(this.preIG.value)*10);
	if (val > 83) {
		val = 83;
	} else if (val < -37) {
		val = -37;
	}
	this.preS.setValue((val - 23)/10);
	this.preIG.value = val/10;
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
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
