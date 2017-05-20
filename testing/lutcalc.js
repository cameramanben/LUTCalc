/* lutcalc.js
* Master Javascript file for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
// Window resize adjustments
function maxHeights() {
	if (window.getComputedStyle(mobileBox).display === 'none') { // Wide screens
		var HF = parseInt(document.getElementById('titlebar').clientHeight) + parseInt(document.getElementById('footer').clientHeight);
		document.getElementById('instructions-box').style.height = '22em';
		document.getElementById('tweaksholder').style.height = 'auto';
		var VP = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;
		var M = VP - HF - 12;
		var CG = parseInt(lutCameraBox.getHeight()) + parseInt(lutGammaBox.getHeight());
		var TWK = M - CG;
		lutTweaksBox.setMaxHeight(TWK);
		if (M < 420) {
			M = 420;
		}
		left.style.height = M.toString() + 'px';
		right.style.height = M.toString() + 'px';
	} else { // Narrow screens
		if (lutMobile && lutMobile.cur === 'inf') {
			left.style.height = 'auto';
			var VP = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;
			var R = VP - left.clientHeight - document.getElementById('mob-status').clientHeight - 14;
			document.getElementById('instructions-box').style.height = (R-32).toString() + 'px';
			right.style.height = R.toString() + 'px';
		} else if (lutMobile && lutMobile.cur === 'twk') {
			right.style.height = 'auto';
			var VP = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;
			var L = VP - right.clientHeight - document.getElementById('mob-status').clientHeight - 14;
			document.getElementById('tweaksholder').style.height = (L-16).toString() + 'px';
			left.style.height = L.toString() + 'px';
		} else {
			right.style.height = 'auto';
			var VP = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;
			var L = VP - right.clientHeight - document.getElementById('mob-status').clientHeight - 14;
			left.style.height = L.toString() + 'px';
		}
	}
}
// Helper Functions
function lutcalcReady(p) {
	splashProg(9);
	if (lutInputs.isReady(p)) {
		clearInterval(splashInterval);
		if (window.getComputedStyle(mobileBox).display !== 'none') { // Mobile-specific CSS in use or external mobile test confirmed, assume that device is a mobile
			lutInputs.isMobile = true;
		}
		// Set Up Events
		lutFormats.events();
		lutCameraBox.events();
		lutGammaBox.events();
		lutTweaksBox.events();
		lutBox.events();
		lutGenerate.events();
		lutPreview.events();
		lutInfoBox.events();
		splash.style.display = 'none';
		document.getElementById('titlebar').className = 'titlebar';
		document.getElementById('lutcalcform').className = 'lutcalcform';
		document.getElementById('footer').className = 'footer';
		lutMobile = new LUTMobile(mobileBox, lutInputs, lutMessage, modalBox,{
			preview: lutPreview,
			generate: lutGenerate,
			info: lutInfoBox
		});
		lutMobile.events();
		window.onresize = function(){
			maxHeights();
		};
		window.onorientationchange = function(){
			maxHeights();
		};
		maxHeights();
		lutMessage.setReady();
		// Populate Settings
		lutMessage.gtSetParams();
		lutMessage.gaSetParams();
	}
}
function notifyUser(title,message) {
	if (lutInputs.canChromeNotify) {
		chrome.notifications.create(
			'lutcalc-' + Math.random().toString(),
			{
				type: 'basic',
				iconUrl: 'img/logo64.png',
				title: title,
				message: message,
				priority: 0
			},
			function(id) {
				timer = setTimeout(function(){
					chrome.notifications.clear(id);
				}, 2500);
			}
		);
	}
}
// DOM Functions
function fieldSet(parentElement,shadow,id) {
	var box = document.createElement('fieldset');
	if (id) {
		box.id = id;
	}
	if (shadow) {
		box.className = 'shadowbox';
	}
	parentElement.appendChild(box);
	return box;
}
function lutSlider(p, list) {
	// Collect all sliders in the DOM is requested
	if (typeof list !== 'undefined') {
		list.push(this);
	}
	// Set up the range
	this.min = 0;
	if (typeof p.min === 'number') {
		this.min = p.min;
	}
	this.max = 100;
	if (typeof p.max === 'number') {
		this.max = p.max;
	}
	this.val = 50;
	if (typeof p.value === 'number') {
		this.val = p.value;
	}
	this.def = this.val;
	// Build the slider
	this.element = document.createElement('div');
	// CSS Styling
	if (typeof p.style === 'string') {
		this.style = p.style;
	} else {
		this.style = 'slider';
	}
	this.v = false;
	if (typeof p.v === 'boolean' && p.v) {
		this.v = true;
		this.style += '-v';
	}
	this.element.className = this.style;
	// Slider title if defined
	if (typeof p.title === 'string') {
		var titleBox = document.createElement('div');
		titleBox.className = '_titlebox';
		this.element.appendChild(titleBox);
		this.title = document.createElement('span');
		this.title.innerHTML = p.title;
		titleBox.appendChild(this.title);
	}
	// Input Box limit to slider limit or not
	this.inputLim = true;
	if (typeof p.inputLim === 'boolean' && !p.inputLim) {
		this.inputLim = false;
	}
	// Input Box decimal places - default is 2, inputDP = false is unlimited
	this.inputDP = 100;
	if (typeof p.inputDP === 'number' && parseInt(p.inputDP) >= 0) {
		this.inputDP = Math.pow(10,parseInt(p.inputDP));
	} else if (typeof p.inputDP === 'boolean' && !p.inputDP) {
		this.inputDP = false;
	}
	// Form Box - holds slider itself and inputs / labels to make horizontal / vertical easier
	this.formBox = document.createElement('div');
	this.formBox.className = '_formbox';
	this.element.appendChild(this.formBox);
	// Slider component
	this.sliderBox = document.createElement('div');
	this.sliderBox.className = '_sliderbox';
	this.formBox.appendChild(this.sliderBox);
	this.slider = document.createElement('input');
	this.slider.setAttribute('type','range');
	this.slider.className = '_slider';
	if (typeof p.step === 'number') {
		this.step = parseFloat(p.step);
	} else if (typeof p.step === 'string' && p.step.toLowerCase() === 'any') {
		this.step = 'any';
	} else {
		this.step = 1;
	}
	// Allow for logear (logarithmic) spread along the slider range
	if (typeof p.mid === 'number' && parseFloat(p.mid) !==  (this.min+this.max)/2) {
		this.mid = parseFloat(p.mid);
		this.log = true;
		this.a = ((this.min*this.min)-(2*this.min*this.mid)+(this.mid*this.mid))/(this.min-(2*this.mid)+this.max);
		this.b = Math.log(((this.max-this.min)/this.a)+1);
		this.c = this.min - this.a;
		this.slider.setAttribute('step','any');
		this.slider.setAttribute('min',0);
		this.slider.setAttribute('max',1);
		this.slider.setAttribute('value',Math.log((this.def-this.c)/this.a)/this.b);
		// Standard min / max / step values for a range slider
	} else {
		this.log = false;
		if (this.step) {
			this.slider.setAttribute('step',this.step);
		} else {
			this.slider.setAttribute('step','any');
		}
		this.slider.setAttribute('min',this.min);
		this.slider.setAttribute('max',this.max);
		this.slider.value = this.def;
	}
	// Rotatebox - to get around the annoying '-webkit-appearance: none' / -webkit-appearance: vertical slider' paradox
	var rotateBox = document.createElement('div');
	rotateBox.className = '_rotatebox';
	rotateBox.appendChild(this.slider);
	this.sliderBox.appendChild(rotateBox);
	// Labels and input box
	this.dataBox = document.createElement('div');
	this.dataBox.className = '_databox';
	this.formBox.appendChild(this.dataBox);
	var minSide = '';
	this.minSide = document.createElement('span');
	this.minSide.className = '_minside';
	if (typeof p.minLabel === 'string') {
		this.minSide.innerHTML = p.minLabel;
		minSide = p.minLabel;
	}
	var maxSide = '';
	this.maxSide = document.createElement('span');
	this.maxSide.className = '_maxside';
	if (typeof p.maxLabel === 'string') {
		this.maxSide.innerHTML = p.maxLabel;
		maxSide = p.maxLabel;
	}
	this.input = false;
	this.data = false;
	if (typeof p.input === 'string' || typeof p.reset !== 'undefined') {
		var inputBox = document.createElement('div');
		inputBox.className = '_inputbox';
		this.dataBox.appendChild(inputBox);
		if (typeof p.lhs === 'string') {
			var lhs = document.createElement('label');
			lhs.className = '_lhs';
			lhs.innerHTML = p.lhs;
			inputBox.appendChild(lhs);
		} else if (typeof p.lhs !== 'undefined' && typeof p.lhs !== 'boolean') {
			p.lhs.className = '_lhs';
			inputBox.appendChild(p.lhs);
		}
		// Number input - must be numeric and glows red if not in 'step'
		if (p.input === 'number') {
			this.input = document.createElement('input');
			this.input.className = '_input';
			this.input.setAttribute('type','number');
			if (this.step) {
				this.input.setAttribute('step',this.step);
			} else {
				this.input.setAttribute('step','any');
			}
			this.input.value = this.def;
			inputBox.appendChild(this.input);
		} else if (p.input === 'text') {
		// Text input - anything goes, so relies on lutSlider's bounds checking
			this.input = document.createElement('input');
			this.input.className = '_input';
			this.input.setAttribute('type','text');
			this.input.value = this.def.toString();
			inputBox.appendChild(this.input);
		} else if (p.input === 'label') {
		// Label - not an input, but displays a numeric value for the slider position
			this.data = document.createElement('span');
			this.data.className = '_datalabel';
			// Text can be added for negative values, positive values and zero
			this.dataFormat = [ '-[[VALUE]]', '0', '[[VALUE]]' ];
			if (typeof p.dataFormat !== 'undefined') {
				if (typeof p.dataFormat.neg === 'string') {
					this.dataFormat[0] = p.dataFormat.neg;
				}
				if (typeof p.dataFormat.zero === 'string') {
					this.dataFormat[1] = p.dataFormat.zero;
				}
				if (typeof p.dataFormat.pos === 'string') {
					this.dataFormat[2] = p.dataFormat.pos;
				}
			}
			this.setData(parseFloat(this.def));
			inputBox.appendChild(this.data);
		}
		if (typeof p.rhs === 'string') {
			var rhs = document.createElement('label');
			rhs.className = '_rhs';
			rhs.innerHTML = p.rhs;
			inputBox.appendChild(rhs);
		} else if (typeof p.rhs !== 'undefined' && typeof p.rhs !== 'boolean') {
			p.rhs.className = '_rhs';
			inputBox.appendChild(p.rhs);
		}
		this.resetButton = false;
		if (typeof p.reset === 'string') {
			this.resetButton = document.createElement('input');
			this.resetButton.setAttribute('type','button');
			this.resetButton.className = '_reset';
			this.resetButton.value = p.reset;
			inputBox.appendChild(this.resetButton);
		} else if (typeof p.reset === 'boolean' && p.reset) {
			this.resetButton = document.createElement('input');
			this.resetButton.setAttribute('type','button');
			this.resetButton.className = '_reset';
			this.resetButton.value = 'Reset';
			inputBox.appendChild(this.resetButton);
		}
		this.resetAllButton = false;
		if (typeof p.resetAll === 'string') {
			this.resetAllButton = document.createElement('input');
			this.resetAllButton.setAttribute('type','button');
			this.resetAllButton.className = '_reset';
			this.resetAllButton.value = p.reset;
			inputBox.appendChild(this.resetAllButton);
		} else if (typeof p.resetAll === 'boolean' && p.resetAll) {
			this.resetAllButton = document.createElement('input');
			this.resetAllButton.setAttribute('type','button');
			this.resetAllButton.className = '_reset';
			this.resetAllButton.value = 'Reset All';
			inputBox.appendChild(this.resetAllButton);
		}
	} else {
		var input = document.createElement('span');
		input.className = '_noinput';
		input.innerHTML = (minSide.length > maxSide.length) ? minSide : maxSide;
		this.dataBox.appendChild(input);
	}
	this.dataBox.appendChild(this.minSide);
	this.dataBox.appendChild(this.maxSide);
	// Set up events
	this.events();
};
lutSlider.prototype.events = function() {
	if (this.log) {
		this.slider.addEventListener('input', function(here){ return function(e){
			e.stopImmediatePropagation();
			e.stopPropagation();
			here.testNLData(true);
			here.action();
		};}(this), false);
		this.slider.addEventListener('change', function(here){ return function(e){
			e.stopImmediatePropagation();
			e.stopPropagation();
			here.testNLData(true);
			here.action();
		};}(this), false);
		if (this.input) {
			this.input.addEventListener('change', function(here){ return function(e){
				e.stopImmediatePropagation();
				e.stopPropagation();
				here.testNLData(false);
				here.action();
			};}(this), false);
		}
	} else {
		this.slider.addEventListener('input', function(here){ return function(e){
			e.stopImmediatePropagation();
			e.stopPropagation();
			here.testData(true);
			here.action();
		};}(this), false);
		this.slider.addEventListener('change', function(here){ return function(e){
			e.stopImmediatePropagation();
			e.stopPropagation();
			here.testData(true);
			here.action();
		};}(this), false);
		if (this.input) {
			this.input.addEventListener('change', function(here){ return function(e){
				e.stopImmediatePropagation();
				e.stopPropagation();
				here.testData(false);
				here.action();
			};}(this), false);
		}
	}
	if (this.resetButton) {
		this.resetButton.onclick = function(here){ return function(){
			here.reset();
			here.action();
		};}(this);
	}
	if (this.resetAllButton) {
		this.resetAllButton.onclick = function(here){ return function(){
			here.resetAll();
		};}(this);
	}
};
lutSlider.prototype.testData = function(slider) {
	var val;
	if (slider) {
		if (this.input || this.data) {
			val = parseFloat(this.slider.value);
			if (this.inputDP === 1) {
				val = Math.round(val);
			} else if (this.inputDP > 1) {
				val = Math.round(val*this.inputDP)/this.inputDP;
			}
			if (this.input) {
				this.input.value = val;
			} else {
				this.setData(val);
			}
		}
	} else {
		val = parseFloat(this.input.value);
		if (isNaN(val)) {
			val = parseFloat(this.slider.value);
		} else if (val < this.min) {
			val = this.min;
		} else if (this.inputLim && val > this.max) {
			val = this.max;
		} else {
			if (this.step) {
				val = (Math.round((val-this.min)/this.step)*this.step)+this.min;
			}
			if (this.inputDP === 1) {
				val = Math.round(val);
			} else if (this.inputDP > 1) {
				val = Math.round(val*this.inputDP)/this.inputDP;
			}
		}
		this.input.value = val;
		this.slider.value = val;
	}
};
lutSlider.prototype.testNLData = function(slider) {
	var val;
	if (slider) {
		val = (this.a*Math.exp(this.b*parseFloat(this.slider.value)))+this.c;
		if (this.step) {
			var s = (Math.round((val-this.min)/this.step)*this.step)+this.min;
			if (val !== s) {
				this.slider.value = Math.log((s-this.c)/this.a)/this.b;
			}
			val = s;
		}
		if (this.input || this.data) {
			if (this.inputDP === 1) {
				val = Math.round(val);
			} else if (this.inputDP > 1) {
				val = Math.round(val*this.inputDP)/this.inputDP;
			}
			if (this.input) {
				this.input.value = val;
			} else {
				this.setData(val);
			}
		}
	} else {
		val = parseFloat(this.input.value);
		if (isNaN(val)) {
			val = (this.a*Math.exp(this.b*parseFloat(this.slider.value)))+this.c;
		} else if (val < this.min) {
			val = this.min;
		} else if (this.inputLim && val > this.max) {
			val = this.max;
		} else {
			if (this.step) {
				val = (Math.round((val-this.min)/this.step)*this.step)+this.min;
			}
			if (this.inputDP === 1) {
				val = Math.round(val);
			} else if (this.inputDP > 1) {
				val = Math.round(val*this.inputDP)/this.inputDP;
			}
		}
		this.input.value = val;
		this.slider.value = Math.log((val-this.c)/this.a)/this.b;
	}
};
lutSlider.prototype.setMobile = function(isMob) {
	if (isMob) {
		this.element.className = this.style + '-mob';
	} else {
		this.element.className = this.style;
	}
};
lutSlider.prototype.setData = function(val) {
	val = parseFloat(val);
	if (val < 0) {
		this.data.innerHTML = this.dataFormat[0].replace('[[VALUE]]',Math.abs(val));
	} else if (val > 0) {
		this.data.innerHTML = this.dataFormat[2].replace('[[VALUE]]',Math.abs(val));
	} else {
		this.data.innerHTML = this.dataFormat[1];
	}
};
lutSlider.prototype.getValue = function() {
	if (this.input) {
		return parseFloat(this.input.value);
	} else {
		var val;
		if (this.log) {
			return (this.a*Math.exp(this.b*parseFloat(this.slider.value)))+this.c;
		} else {
			return parseFloat(this.slider.value);
		}
	}
};
lutSlider.prototype.setValue = function(val) {
	if (!isNaN(val)) {
		if (this.input) {
			this.input.value = parseFloat(val);
			if (this.log) {
				this.testNLData(false);
			} else {
				this.testData(false);
			}
		} else {
			if (this.log) {
				this.slider.value = Math.log((parseFloat(val)-this.c)/this.a)/this.b;
				this.testNLData(true);
			} else {
				this.slider.value = parseFloat(val);
				this.testData(true);
			}
		}
	}
};
lutSlider.prototype.setMax = function(val) {
	if (!isNaN(val)) {
		this.max = parseFloat(val);
		if (this.log) {
			this.a = ((this.min*this.min)-(2*this.min*this.mid)+(this.mid*this.mid))/(this.min-(2*this.mid)+this.max);
			this.b = Math.log(((this.max-this.min)/this.a)+1);
			this.c = this.min - this.a;
		} else {
			this.slider.setAttribute('max',this.max);
		}
		if (this.input) {
			if (this.log) {
				this.testNLData(false);
			} else {
				this.testData(false);
			}
		} else {
			if (this.log) {
				if ((this.a*Math.exp(this.b*parseFloat(this.slider.value)))+this.c > this.max) {
					this.slider.value = 1;
				}
				this.testNLData(true);
			} else {
				if (parseFloat(this.slider.value) > this.max) {
					this.slider.value = this.max;
				}
				this.testData(true);
			}
		}
	}
};
lutSlider.prototype.reset = function() {
	if (this.input) {
		this.input.value = this.def;
		if (this.log) {
			this.testNLData(false);
		} else {
			this.testData(false);
		}
	} else {
		if (this.log) {
			this.slider.value = Math.log((parseFloat(this.def)-this.c)/this.a)/this.b;
			this.testNLData(true);
		} else {
			this.slider.value = parseFloat(this.def);
			this.testData(true);
		}
	}
};
lutSlider.prototype.show = function() {
	this.element.className = this.style;
};
lutSlider.prototype.hide = function() {
	this.element.className = this.style + '-hide';
};
lutSlider.prototype.resetAll = function() {
	// empty function to be replaced with whatever item-specific action is required.
};
lutSlider.prototype.action = function() {
	// empty function to be replaced with whatever item-specific action is required post bounds-checking.
};
function lutRadioElement(name, checked) {
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

// Declare variables
var lutCalcForm,
	mobileBox,
	lutMessage,
	lutFile,
	left,
	lutCameraBox,
	lutTweaksBox,
	right,
	lutPreview,
	lutBox,
	lutGenerate,
	lutInfoBox,
	lutMobile;
// Build app once the DOM is loaded
document.addEventListener("DOMContentLoaded", function() { // setTimeout gives time for asynchronous browser tests to finish (eg inline web workers)
	// Housekeeping
	lutCalcForm = document.getElementById('lutcalcform');
	// Build UI
	lutMessage = new LUTMessage(lutInputs);
	lutTests.isTransTest(lutMessage.getWorker());
	lutFile = new LUTFile(lutInputs, lutMessage);
	lutFormats = new LUTFormats(lutInputs, lutMessage, lutFile);
	document.getElementById('version').appendChild(document.createTextNode(lutInputs.version));
	// Create HTML Structure
	document.getElementById('main').className = 'base-main';
	document.getElementById('main').appendChild(modalBox);
	modalBox.className = 'modalbox';
	mobileBox = fieldSet(lutCalcForm,false,'mob-box');
	right = fieldSet(lutCalcForm,false,'right');
	right.className = 'right-base';
	left = fieldSet(lutCalcForm,false,'left');
	left.className = 'left-base';
	lutCameraBox = new LUTCameraBox(fieldSet(left,true,'box-cam'), lutInputs, lutMessage);
	lutGammaBox = new LUTGammaBox(fieldSet(left,true,'box-gam'), lutInputs, lutMessage);
	lutTweaksBox = new LUTTweaksBox(fieldSet(left,true,'box-twk'), lutInputs, lutMessage, lutFile, lutFormats);
	lutBox = new LUTLutBox(fieldSet(right,true,'box-lut'), lutInputs, lutMessage, lutFormats);
	lutGenerate = new LUTGenerateBox(fieldSet(right,false,'box-gen'), lutInputs, lutMessage, lutFile, lutFormats);
	lutPreview = new LUTPreview(fieldSet(right,true,'box-pre'), lutInputs, lutMessage, lutFile);
	lutPreview.uiExternal(lutGenerate.getBox());
	lutInfoBox = new LUTInfoBox(fieldSet(right,true,'box-inf'),lutInputs, lutMessage);
	// Set Up Data
	lutMessage.gaTx(0,5,{});
	lutMessage.gtTx(0,5,{});
	lutMessage.gtTx(0,11,{});
	lutGammaBox.oneOrThree();
});
