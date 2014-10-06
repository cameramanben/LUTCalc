function LUTTweaksBox(fieldset, inputs, gammas, gamuts) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.gammas = gammas;
	this.gamuts = gamuts;
	this.tweakCheck = document.createElement('input');
	this.inputs.addInput('tweaks',this.tweakCheck);
	this.highGamutBox = document.createElement('div');
	this.highGamutCheck = document.createElement('input');
	this.inputs.addInput('tweakHGCheck',this.highGamutCheck);
	this.highGamutLinOpt = this.createRadioElement('highGamutLinLog',true);
	this.highGamutLogOpt = this.createRadioElement('highGamutLinLog',false);
	this.inputs.addInput('tweakHGLinLog',[this.highGamutLinOpt,this.highGamutLogOpt]);
	this.highGamutSelect = document.createElement('select');
	this.inputs.addInput('tweakHGSelect',this.highGamutSelect);
	this.highGamutLinLow = document.createElement('input');
	this.inputs.addInput('tweakHGLinLow',this.highGamutLinLow);
	this.highGamutLogLow = document.createElement('input');
	this.inputs.addInput('tweakHGLow',this.highGamutLogLow);
	this.highGamutLinHigh = document.createElement('input');
	this.inputs.addInput('tweakHGLinHigh',this.highGamutLinHigh);
	this.highGamutLogHigh = document.createElement('input');
	this.inputs.addInput('tweakHGHigh',this.highGamutLogHigh);
	this.blackLevelBox = document.createElement('div');
	this.blackLevelCheck = document.createElement('input');
	this.inputs.addInput('tweakBlkCheck',this.blackLevelCheck);
	this.blackLevelInput = document.createElement('input');
	this.inputs.addInput('tweakBlk',this.blackLevelInput);
	this.highLevelBox = document.createElement('div');
	this.highLevelCheck = document.createElement('input');
	this.inputs.addInput('tweakHiCheck',this.highLevelCheck);
	this.highLevelRef = document.createElement('input');
	this.inputs.addInput('tweakHiRef',this.highLevelRef);
	this.highLevelMap = document.createElement('input');
	this.inputs.addInput('tweakHiMap',this.highLevelMap);
	this.buildBox();
	fieldset.appendChild(this.box);
}
// Construct the UI Box
LUTTweaksBox.prototype.buildBox = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Customisation')));
	this.tweakCheck.setAttribute('type','checkbox');
	this.box.appendChild(this.tweakCheck);
	var tweakHolder = document.createElement('div');
	tweakHolder.id = 'tweakholder';
	tweakHolder.style.display = 'block';
	this.highGamut();
	tweakHolder.appendChild(this.highGamutBox);
	this.blackLevel();
	tweakHolder.appendChild(this.blackLevelBox);
	this.highlightLevel();
	tweakHolder.appendChild(this.highLevelBox);
	this.box.appendChild(tweakHolder);
	this.tweakCheck.checked = true;
//	this.toggleTweakCheck();
}
LUTTweaksBox.prototype.highGamut = function() {
	this.highGamutBox.setAttribute('class','graybox');
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Highlight Gamut')));
	this.highGamutCheck.setAttribute('type','checkbox');
	this.highGamutBox.appendChild(this.highGamutCheck);
	this.highGamutBox.appendChild(document.createElement('br'));
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Gamut')));
	var max = this.gamuts.outList.length;
	for (var i=0; i < max; i++) {
		var option = document.createElement('option');
		option.value = this.gamuts.outList[i].idx;
		option.appendChild(document.createTextNode(this.gamuts.outList[i].name));
		this.highGamutSelect.appendChild(option);
	}
	this.highGamutBox.appendChild(this.highGamutSelect);
	this.highGamutBox.appendChild(document.createElement('br'));
	this.highGamutLinOpt.value = '0';
	this.highGamutBox.appendChild(this.highGamutLinOpt);
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Linear')));
	this.highGamutLogOpt.value = '1';
	this.highGamutBox.appendChild(this.highGamutLogOpt);
	this.highGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Log')));
	this.highGamutLin = document.createElement('div');
	this.highGamutLin.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover Low % Reflected')));
	this.highGamutLin.appendChild(document.createElement('br'));
	this.highGamutLinLow.setAttribute('type','number');
	this.highGamutLinLow.setAttribute('class','ireinput');
	this.highGamutLinLow.value = '18';
	this.highGamutLin.appendChild(this.highGamutLinLow);
	this.highGamutLin.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.highGamutLin.appendChild(document.createElement('br'));
	this.highGamutLin.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover High % Reflected')));
	this.highGamutLin.appendChild(document.createElement('br'));
	this.highGamutLinHigh.setAttribute('type','number');
	this.highGamutLinHigh.setAttribute('class','ireinput');
	this.highGamutLinHigh.value = '90';
	this.highGamutLin.appendChild(this.highGamutLinHigh);
	this.highGamutBox.appendChild(this.highGamutLin);
	this.highGamutLin.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.highGamutLog = document.createElement('div');
	this.highGamutLog.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover Low Stops From 18% Grey')));
	this.highGamutLog.appendChild(document.createElement('br'));
	this.highGamutLogLow.setAttribute('type','text');
	this.highGamutLogLow.value = '0';
	this.highGamutLog.appendChild(this.highGamutLogLow);
	this.highGamutLog.appendChild(document.createElement('br'));
	this.highGamutLog.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover High Stops From 18% Grey')));
	this.highGamutLog.appendChild(document.createElement('br'));
	this.highGamutLogHigh.setAttribute('type','text');
	this.highGamutLogHigh.value = (Math.log(5)/Math.LN2).toFixed(4).toString();
	this.highGamutLog.appendChild(this.highGamutLogHigh);
	this.highGamutBox.appendChild(this.highGamutLog);
	this.toggleHighGamutLinLog();
	this.toggleHighGamutCheck();
}
LUTTweaksBox.prototype.blackLevel = function() {
	this.blackLevelBox.setAttribute('class','graybox');
	this.blackLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Black Level')));
	this.blackLevelCheck.setAttribute('type','checkbox');
	this.blackLevelBox.appendChild(this.blackLevelCheck);
	this.blackLevelBox.appendChild(document.createElement('br'));
	this.blackLevelInput.setAttribute('type','number');
	this.blackLevelInput.setAttribute('step','any');
	this.blackLevelInput.setAttribute('class','ireinput');
	this.blackLevelBox.appendChild(this.blackLevelInput);
	this.blackLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.blackLevelDefault();
	this.toggleBlackLevelCheck();
}
LUTTweaksBox.prototype.highlightLevel = function() {
	this.highLevelBox.setAttribute('class','graybox');
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Highlight Level')));
	this.highLevelCheck.setAttribute('type','checkbox');
	this.highLevelBox.appendChild(this.highLevelCheck);
	this.highLevelBox.appendChild(document.createElement('br'));
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Reflected')));
	this.highLevelRef.setAttribute('type','number');
	this.highLevelRef.setAttribute('step','any');
	this.highLevelRef.setAttribute('class','ireinput');
	this.highLevelRef.value='90';
	this.highLevelBox.appendChild(this.highLevelRef);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.highLevelBox.appendChild(document.createElement('br'));
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Maps To')));
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('(')));
	this.highLevelRec = document.createElement('span');
	this.highLevelBox.appendChild(this.highLevelRec);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE In Rec709)')));
	this.highLevelBox.appendChild(document.createElement('br'));
	this.highLevelMap.setAttribute('type','number');
	this.highLevelMap.setAttribute('step','any');
	this.highLevelMap.setAttribute('class','ireinput');
	this.highLevelDefault();
	this.highLevelBox.appendChild(this.highLevelMap);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.toggleHighLevelCheck();
}
// Set Up Data
LUTTweaksBox.prototype.blackLevelDefault = function() {
	this.blackLevelInput.value = this.gammas.baseIreOut(0).toFixed(2).toString();
}
LUTTweaksBox.prototype.highLevelDefault = function() {
	this.highLevelRec.innerHTML = this.gammas.rec709IreOut(parseFloat(this.highLevelRef.value)/90).toFixed(2).toString();
	this.highLevelMap.value = this.gammas.baseIreOut(parseFloat(this.highLevelRef.value)/90).toFixed(2).toString();
}
LUTTweaksBox.prototype.legToDat = function(input) {
	return ((input * 876) + 64)/1023;
}
LUTTweaksBox.prototype.createRadioElement = function(name, checked) {
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
// Event Responses
LUTTweaksBox.prototype.toggleTweakCheck = function() {
	if (this.tweakCheck.checked) {
		if (this.inputs.d[1].checked) {
			this.highGamutBox.style.display = 'block';
		} else {
			this.highGamutBox.style.display = 'none';
			this.highGamutCheck.checked = false;
		}
		if (this.gammas.gammas[this.gammas.curOut].cat != 0 && this.gammas.gammas[this.gammas.curOut].cat != 3) {
			this.blackLevelBox.style.display = 'block';
			this.highLevelBox.style.display = 'block';
		} else {
			this.blackLevelBox.style.display = 'none';
			this.highLevelBox.style.display = 'none';
			this.blackLevelCheck.checked = false;
			this.highLevelCheck.checked = false;
		}
	} else {
		this.highGamutBox.style.display = 'none';
		this.blackLevelBox.style.display = 'none';
		this.highLevelBox.style.display = 'none';
		this.highGamutCheck.checked = false;
		this.blackLevelCheck.checked = false;
		this.highLevelCheck.checked = false;
	}
	this.updateScaling();
}
LUTTweaksBox.prototype.toggleHighGamutCheck = function() {
	if (this.highGamutCheck.checked) {
		this.highGamutSelect.disabled = false;
		this.highGamutLinOpt.disabled = false;
		this.highGamutLogOpt.disabled = false;
		this.toggleHighGamutLinLog();
	} else {
		this.highGamutSelect.disabled = true;
		this.highGamutLinOpt.disabled = true;
		this.highGamutLogOpt.disabled = true;
		this.highGamutLin.style.display = 'none';
		this.highGamutLog.style.display = 'none';
	}
}
LUTTweaksBox.prototype.toggleHighGamutLinLog = function() {
	if (this.highGamutLinOpt.checked) {
		this.highGamutLin.style.display = 'block';
		this.highGamutLog.style.display = 'none';
	} else {
		this.highGamutLin.style.display = 'none';
		this.highGamutLog.style.display = 'block';
	}
}
LUTTweaksBox.prototype.changeHighGamutLinLow = function() {
	if (/^([1-9]\d*)$/.test(this.highGamutLinLow.value)) {
		if (parseInt(this.highGamutLinLow.value) >= parseInt(this.highGamutLinHigh.value)) {
			this.highGamutLinLow.value = (parseInt(this.highGamutLinHigh.value) - 1).toString();
		}
		this.highGamutLogLow.value = (Math.log(parseFloat(this.highGamutLinLow.value)/18)/Math.LN2).toFixed(4).toString();
	} else {
		this.highGamutLinLow.value = '18';
		this.highGamutLogLow.value = '0';
		this.changeHighGamutLinLow();
	}
}
LUTTweaksBox.prototype.changeHighGamutLinHigh = function() {
	if (/^([1-9]\d*)$/.test(this.highGamutLinHigh.value)) {
		if (parseInt(this.highGamutLinHigh.value) <= parseInt(this.highGamutLinLow.value)) {
			this.highGamutLinHigh.value = (parseInt(this.highGamutLinLow.value) + 1).toString();
		} else if (parseInt(this.highGamutLinHigh.value) < 2){
			this.highGamutLinHigh.value = '2';
		}
		this.highGamutLogHigh.value = (Math.log(parseFloat(this.highGamutLinHigh.value)/18)/Math.LN2).toFixed(4).toString();
	} else {
		this.highGamutLinHigh.value = '90';
		this.highGamutLogHigh.value = (Math.log(5)/Math.LN2).toFixed(4).toString();
		this.changeHighGamutLinHigh();
	}
}
LUTTweaksBox.prototype.changeHighGamutLogLow = function() {
	if (!isNaN(parseFloat(this.highGamutLogLow.value)) && isFinite(this.highGamutLogLow.value)) {
		if (parseFloat(this.highGamutLogLow.value) >= parseFloat(this.highGamutLogHigh.value)) {
			this.highGamutLogLow.value = (parseFloat(this.highGamutLogHigh.value) - 0.1).toFixed(4).toString();
		}
		this.highGamutLinLow.value = (Math.round(Math.pow(2,parseFloat(this.highGamutLogLow.value)*18))).toString();
	} else {
		this.highGamutLinLow.value = '18';
		this.highGamutLogLow.value = '0';
		this.changeHighGamutLogLow();
	}
}
LUTTweaksBox.prototype.changeHighGamutLogHigh = function() {
	if (!isNaN(parseFloat(this.highGamutLogHigh.value)) && isFinite(this.highGamutLogHigh.value)) {
		if (parseFloat(this.highGamutLogHigh.value) <= parseFloat(this.highGamutLogLow.value)) {
			this.highGamutLogHigh.value = (parseFloat(this.highGamutLogLow.value) + 0.1).toFixed(4).toString();
		}
		this.highGamutLinHigh.value = (Math.round(Math.pow(2,parseFloat(this.highGamutLogHigh.value)*18))).toString();
	} else {
		this.highGamutLinHigh.value = '90';
		this.highGamutLogHigh.value = (Math.log(5)/Math.LN2).toFixed(4).toString();
		this.changeHighGamutLogHigh();
	}
}
LUTTweaksBox.prototype.toggleBlackLevelCheck = function() {
	if (this.blackLevelCheck.checked) {
		this.blackLevelInput.disabled = false;
	} else {
		this.blackLevelInput.disabled = true;
	}
	this.updateScaling();
}
LUTTweaksBox.prototype.changeBlackLevel = function() {
	if (!isNaN(parseFloat(this.blackLevelInput.value)) && isFinite(this.blackLevelInput.value) && (parseFloat(this.blackLevelInput.value)>-7.3)) {
	} else {
			this.blackLevelDefault();
	}
	this.updateScaling();
}
LUTTweaksBox.prototype.toggleHighLevelCheck = function() {
	if (this.highLevelCheck.checked) {
		this.highLevelRef.disabled = false;
		this.highLevelMap.disabled = false;
	} else {
		this.highLevelRef.disabled = true;
		this.highLevelMap.disabled = true;
	}
	this.updateScaling();
}
LUTTweaksBox.prototype.changeHighLevelRef = function() {
	if (!isNaN(parseFloat(this.highLevelRef.value)) && isFinite(this.highLevelRef.value) && (parseFloat(this.highLevelRef.value)>0)) {
	} else {
		this.highLevelRef.value = '90';
	}
	this.highLevelDefault();
	this.updateScaling();
}
LUTTweaksBox.prototype.changeHighLevelMap = function() {
	if (!isNaN(parseFloat(this.highLevelMap.value)) && isFinite(this.highLevelMap.value) && (parseFloat(this.highLevelMap.value)>-7.3)) {
	} else {
		this.highLevelDefault();
	}
	this.updateScaling();
}
LUTTweaksBox.prototype.updateScaling = function() {
	if (this.tweakCheck.checked) {
		var blackDef = this.gammas.baseIreOut(0) / 100;
		var blackNew = blackDef;
		if (this.blackLevelCheck.checked) {
			blackNew = parseFloat(this.blackLevelInput.value) / 100;
			if (Math.abs(blackNew-blackDef)<0.0001) {
				blackNew = blackDef;
			}
		}
		var highRef = 1;
		var highDefMap = 1;
		var highNewMap = 1;
		if (this.highLevelCheck.checked) {
			highRef = parseFloat(this.highLevelRef.value)/90;
			highDefMap = parseFloat(this.gammas.baseIreOut(highRef))/100;
			highNewMap = parseFloat(this.highLevelMap.value)/100;
			if (Math.abs(highNewMap-highDefMap)<0.0001) {
				highNewMap = highDefMap;
			}
		}
		this.gammas.al = (highNewMap - blackNew)/(highDefMap - blackDef);
		this.gammas.bl = blackNew - (blackDef * this.gammas.al);
		this.gammas.ad = this.gammas.al;
		this.gammas.bd = this.legToDat(blackNew) - (this.legToDat(blackDef) * this.gammas.ad);
	} else {
		this.gammas.al = 1;
		this.gammas.bl = 0;
		this.gammas.ad = 1;
		this.gammas.bd = 0;
	}
}
LUTTweaksBox.prototype.changeGamma = function() {
	this.blackLevelDefault();
	this.highLevelRef.value='90';
	this.highLevelDefault();
	this.toggleTweakCheck();
}
