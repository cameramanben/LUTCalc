function LUTGamma(inputs) {
	this.inputs = inputs;
	this.nul = false;
	this.gammas = [];
	this.curIn = 0;
	this.curOut = 0;
	this.eiMult = 1;
	this.al = 1;
	this.bl = 0;
	this.ad = 1;
	this.bd = 0;
	this.linList = [];
	this.inList = [];
	this.outList = [];
	this.gammaList();
}
LUTGamma.prototype.gammaList = function() {
	this.gammas.push(new LUTGammaLog(
		'S-Log3', [ 0.1677922920,-0.0155818840, 0.2556207230, 4.7368421060,10.0000000000, 0.4105571850, 0.0526315790, 0.1673609920, 0.0125000000 ]));
	this.gammas.push(new LUTGammaLog(
		'S-Log2', [ 0.3300057734,-0.0291175412, 0.3705098702, 0.7222408675,10.0000000000, 0.6130081516, 0.0383430371, 0.0300311298, -0.0161142648 ]));
	this.gammas.push(new LUTGammaLog(
		'S-Log', [ 0.3241960136,-0.0286107171, 0.3705223110, 1,10.0000000000, 0.6162444740, 0.0375840000, 0.0882900450, 0.000000000000001 ]));
	this.gammas.push(new LUTGammaArri(
		'LogC (Sup 3.x & 4.x)',3));
	this.gammas.push(new LUTGammaArri(
		'LogC (Sup 2.x)',2));
	this.gammas.push(new LUTGammaLog(
		'C-Log', [ 0.3734467748,-0.0467265867, 0.45310179472141, 10.1596, 10, 0.1251224801564, 1, 0.00391002619746, -0.0452664 ]));
	this.gammas.push(new LUTGammaLog(
		'Cineon', [ 0.0000000000, 0.0000000000, 0.1260649940,22.2791018600, 2.6907845340, 0.2595160220, 0.2702335160, 0.0000000000, 0 ]));
	this.rec709 = this.gammas.length;
	this.gammas.push(new LUTGammaLin(
		'Rec709', [ 2.22222222, 4.50000000, 0.09900000, 0.01800000, 0.08100000 ]));
	this.gammas.push(new LUTGammaLin(
		'sRGB', [ 2.40000000,12.92000000, 0.05500000, 0.00313080, 0.04015966 ]));
	this.gammas.push(new LUTGammaLin(
		'Linear', [ 1.00000000, 1.00000000, 0.00000000,999.0000000,999.0000000 ]));
	this.gammas.push(new LUTGammaGen(
		'Rec709 (800%)',
		{
			blk: [ 1.655756453, 0.088941781 ],
			bot: [ 3.854131936, 0.088941781 ],
			low: [ 10.81907537, 0.056085667, 0.220563835, 0.485191681, 2.707959604, 1.807046082, 0.012944215 ],
			mid: [ 0.968682118, 0.528373944, 1.14425685, 0.154431494, 0.018062214, 3.408129062, 0.476852363 ],
			high: [ 0.993058666, -1.150063914, 1.224583054, 10.0393264, 4.042674689, 1.368502419, 0.996905904 ],
			top: [ 1.004108327, -1326.098418, 1.320965242, 14389.45697, 100.4246314, 0.019824446, 2.269006452 ]
		}));
	this.gammas.push(new LUTGammaGen(
		'LC709',
		{
			blk: [ 0.9874581229, 0.080932746 ],
			bot: [ 1.858323946, 0.080932746 ],
			low: [ 1.526857247, 0.078563495, 0.235060902, 0.068508438, 0.112166199, 0.101338436, 0.005397274 ],
			mid: [ 2.817558711, 0.083067377, 0.244279261, 0.203183535, 0.27163808, 2.85122578, 0.049911087 ],
			high: [ 1.115989516, -2.742753995, 0.641957526, 16.42829629, 12.47978212, 1.23227404, 0.199892442 ],
			top: [ 0.919844334, -520.8216426, 1.114389153, 4072.220784, 67.82839892, 0.075960217, 1.599563516 ]
		}));
	this.gammas.push(new LUTGammaGen(
		'LC709A',
		{
			blk: [ 1.8297284846 , 0.096704793 ],
			bot: [ 2.323848529, 0.096704793 ],
			low: [ 2.486948014, 0.097265221, 0.195583054, 0.060769256, 0.135504602, 0.102246157, 0.005397274 ],
			mid: [ 0.803662417, 0.144248547, 0.550045128, 0.26122062, 0.149921548, 1.110222822, 0.049911087 ],
			high: [ 1.041261505, -0.181262606, 0.461582883, 1.588183826, 1.424090038, 0.972039477, 0.199892442 ],
			top: [ 0.916855923, -523.7835793, 1.074825303, 4263.05768, 70.1541868, 0.081484809, 1.599563516 ]
		}));
	this.gammas.push(new LUTGammaGen(
		'HG8009G40 (HG7)',
		{
			blk: [ 1.657465538, 0.088961256 ],
			bot: [ 3.851528647, 0.088961256 ],
			low: [ 2.602756934, 0.123004132, 0.596161731, 1.219666397, 3.916153029, 2.070011785, 0.027629714 ],
			mid: [ 1.045289863, 0.159044309, 0.864686124, 1.408429078, 0.094388444, 4.646324474, 0.200252495 ],
			high: [ 1.004184019, 0.125776412, 1.04854443, 2.017853345, 1.804882646, 1.659394503, 1.364057511 ],
			top: [ 1.009613663, -1576.404451, 1.302138745, 12925.0499, 110.9686679, 0.057341867, 2.269006452 ]
		}));
	this.gammas.push(new LUTGammaGen(
		'HG8009G33 (HG8)',
		{
			blk: [ 1.667540141, 0.08907292 ],
			bot: [ 3.828364386, 0.08907292 ],
			low: [ 11.99117731, 0.110735239, 0.456175889, 0.993920925, 11.61545323, 3.171614664, 0.018441223 ],
			mid: [ 1.114027438, 0.161493221, 0.762672852, 1.138621895, 0.056362578, 6.053243012, 0.200252495 ],
			high: [ 1.087363583, 5.592089479, 0.686418804, -10.87307199, 1.797219436, 2.100838913, 1.364057511 ],
			top: [ 1.015259124, -1220.082171, 1.438052193, 10468.77184, 283.4319762, 0.224788251, 2.269006452 ]
		}));
	this.gammas.push(new LUTGammaGen(
		'Canon WideDR',
		{
			blk: [ 4.143864904, 0.062733691 ],
			bot: [ 4.143864904, 0.062733691 ],
			low: [ 1.123724397, 0.023399556, 0.725329449, 1.793298155, 1.618753622, 1.512604528, 0.010239171 ],
			mid: [ 1.175009007, -0.889534156, 0.366778059, 1.74451447, 0.920944271, 0.662662566, 0.200816705 ],
			high: [ 1.075984367, 0.080088043, 0.54850957, 1.222465712, 1.162090342, 1.216780039, 1.001012923 ],
			top: [ 1.184590585, 0.32981997, 0.381916345, 1.047595142, 1.356034214, 1.40672617, 3.213458281 ]
		}));
	this.gammas.push(new LUTGammaNull(
		'Null'));
	var max = this.gammas.length;
	var logList = [], linList = [], genList = [];
	for (var i=0; i < max; i++) {
		switch(this.gammas[i].cat) {
			case 0: logList.push({name: this.gammas[i].name, idx: i});
					break;
			case 1: this.linList.push({name: this.gammas[i].name + ' - ' + this.gammas[i].gamma, idx: i});
					break;
			case 2: genList.push({name: this.gammas[i].name, idx: i});
					break;
			default: break;
		}
	}
	this.inList = logList.slice();
	this.inList.push({name: 'Linear / Rec709', idx: 9999});
	this.outList = logList.slice();
	this.outList.push({name: 'Linear / Rec709', idx: 9999});
	this.outList = this.outList.concat(genList);
	this.outList.push({name: this.gammas[max-1].name, idx: (max-1)});
}
LUTGamma.prototype.dataIn = function(input) {
	return this.gammas[this.curIn].linFromData(input);
}
LUTGamma.prototype.legalIn = function(input) {
	return this.gammas[this.curIn].linFromLegal(input);
}
LUTGamma.prototype.dataInRGB = function(rgb) {
	return [this.gammas[this.curIn].linFromData(rgb[0]),
			this.gammas[this.curIn].linFromData(rgb[1]),
			this.gammas[this.curIn].linFromData(rgb[2])];
}
LUTGamma.prototype.legalInRGB = function(rgb) {
	return [this.gammas[this.curIn].linFromLegal(rgb[0]),
			this.gammas[this.curIn].linFromLegal(rgb[1]),
			this.gammas[this.curIn].linFromLegal(rgb[2])];
}
LUTGamma.prototype.dataOut = function(input) {
	if (this.nul) {
		return this.gammas[this.curIn].linToData(input / this.eiMult);
	} else {
		return (this.gammas[this.curOut].linToData(input) * this.ad) + this.bd;
	}
}
LUTGamma.prototype.legalOut = function(input) {
	if (this.nul) {
		return this.gammas[this.curIn].linToLegal(input / this.eiMult);
	} else {
		return (this.gammas[this.curOut].linToLegal(input) * this.al) + this.bl;
	}
}
LUTGamma.prototype.baseIreOut = function(input) {
	return this.gammas[this.curOut].linToLegal(input) * 100;
}
LUTGamma.prototype.ireOut = function(input) {
	return ((this.gammas[this.curOut].linToLegal(input)*this.al)+this.bl) * 100;
}
LUTGamma.prototype.tenBitOut = function(input) {
	return Math.round(((this.gammas[this.curOut].linToData(input)*this.ad)+this.bd) * 1023);
}
LUTGamma.prototype.rec709IreOut = function(input) {
	return this.gammas[this.rec709].linToLegal(input) * 100;
}
LUTGamma.prototype.dataOutRGB = function(rgb) {
	if (this.nul) {
		return [this.gammas[this.curIn].linToData(rgb[0] / this.eiMult),
				this.gammas[this.curIn].linToData(rgb[1] / this.eiMult),
				this.gammas[this.curIn].linToData(rgb[2] / this.eiMult)];
	} else {
		return [(this.gammas[this.curOut].linToData(rgb[0]) * this.ad) + this.bd,
				(this.gammas[this.curOut].linToData(rgb[1]) * this.ad) + this.bd,
				(this.gammas[this.curOut].linToData(rgb[2]) * this.ad) + this.bd];
	}
}
LUTGamma.prototype.legalOutRGB = function(rgb) {
	if (this.nul) {
		return [this.gammas[this.curIn].linToLegal(rgb[0] / this.eiMult),
				this.gammas[this.curIn].linToLegal(rgb[1] / this.eiMult),
				this.gammas[this.curIn].linToLegal(rgb[2] / this.eiMult)];
	} else {
		return [(this.gammas[this.curOut].linToLegal(rgb[0]) * this.al) + this.bl,
				(this.gammas[this.curOut].linToLegal(rgb[1]) * this.al) + this.bl,
				(this.gammas[this.curOut].linToLegal(rgb[2]) * this.al) + this.bl];
	}
}
LUTGamma.prototype.inStopData = function(stop) {
	var input = Math.pow(2,stop) / 5;
	return this.gammas[this.curIn].linToData(input);
}
LUTGamma.prototype.inStopLegal = function(stop) {
	var input = Math.pow(2,stop) / 5;
	return this.gammas[this.curIn].linToLegal(input);
}
LUTGamma.prototype.outStopData = function(stop) {
	var input = Math.pow(2,stop) / 5;
	if (this.nul) {
		return this.gammas[this.curIn].linToData(input);
	} else {
		return (this.gammas[this.curOut].linToData(input * this.eiMult) * this.ad) + this.bd;
	}
}
LUTGamma.prototype.outStopLegal = function(stop) {
	var input = Math.pow(2,stop) / 5;
	if (this.nul) {
		return this.gammas[this.curIn].linToLegal(input);
	} else {
		return (this.gammas[this.curOut].linToLegal(input * this.eiMult) * this.al) + this.bl;
	}
}
LUTGamma.prototype.defaultGamma = function() {
	var max = this.gammas.length;
	var defGam = this.inputs.defGammaIn;
	for (var i = 0; i < max; i++) {
		if (defGam == this.gammas[i].name) {
			this.curIn = i;
			break;
		}
	}
	this.changeShift();
}
LUTGamma.prototype.changeGamma = function() {
	if (this.inputs.inGamma.options[this.inputs.inGamma.options.selectedIndex].value != '9999') {
		this.curIn = parseInt(this.inputs.inGamma.options[this.inputs.inGamma.options.selectedIndex].value);
	} else {
		this.curIn = parseInt(this.inputs.inLinGamma.options[this.inputs.inLinGamma.options.selectedIndex].value);
	}
	if (this.inputs.outGamma.options[this.inputs.outGamma.options.selectedIndex].value != '9999') {
		this.curOut = parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.selectedIndex].value);
		if (this.gammas[this.curOut].cat === 3) {
			this.nul = true;
		} else {
			this.nul = false;
		}
	} else {
		this.curOut = parseInt(this.inputs.outLinGamma.options[this.inputs.outLinGamma.options.selectedIndex].value);
	}
	this.changeISO();
	this.changeShift();
}
LUTGamma.prototype.changeISO = function() {
	var max = this.gammas.length;
	var newISO = parseFloat(this.inputs.cineEI.value);
	var natISO = parseFloat(this.inputs.nativeISO.innerHTML);
	for (var i = 0; i < max; i++) {
		this.gammas[i].changeISO(newISO);
	}
	if (parseInt(this.inputs.cameraType.value) == 0) {
		this.eiMult = newISO / natISO;
	}
}
LUTGamma.prototype.changeShift = function() {
	this.eiMult = Math.pow(2,parseFloat(this.inputs.stopShift.value));
}
function LUTGammaLog(name,params) {
	this.name = name;
	this.params = params;
	this.iso = 800;
	this.cat = 0;
}
LUTGammaLog.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaLog.prototype.linToData = function(input) {
	if (input >= this.params[8]) {
		return (this.params[2] * Math.log((input * this.params[3]) + this.params[6])/Math.log(this.params[4])) + this.params[5];
	} else if (this.params[0] === 0) {
		return (this.params[2] * Math.log((0.000000000000001 * this.params[3]) + this.params[6])/Math.log(this.params[4])) + this.params[5];
	} else {
		return (input - this.params[1])/this.params[0];
	}
}
LUTGammaLog.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
LUTGammaLog.prototype.linFromData = function(input) {
	if (input >= this.params[7]) {
		return (Math.pow(this.params[4],(input - this.params[5])/this.params[2]) - this.params[6])/this.params[3];		
	} else {
		return (this.params[0]*input) + this.params[1];
	}
}
LUTGammaLog.prototype.linFromLegal = function(input) {
	return this.linFromData((input * 0.85630498533724) + 0.06256109481916);
}
function LUTGammaArri(name,sup) {
	this.name = name;
	this.sup = sup;
	this.iso = 800;
	this.hiCut = false;
	this.cat = 0;
	this.hiMult = 1;
	if (this.sup == 2) {
		this.cut = 0;
		this.a = 5.061087;
		this.b = 0.089004;
		this.c = 0.2471894558;
		this.d = 0.391007;
		this.e = 4.9488401422;
		this.f = 0.1313126129;
	} else {
		this.cut = 0.0105942872;
		this.a = 5.555556;
		this.b = 0.0522539438;
		this.c = 0.2471896946;
		this.d = 0.3855374431;
		this.e = 5.3676547147;
		this.f = 0.0928092678;
	}
}
LUTGammaArri.prototype.changeISO = function(iso) {
	this.iso = iso;
	if (iso > 1507) {
		this.hiCut = true;
	} else {
		this.hiCut = false;
	}
	var shift = Math.log(this.iso/800)/Math.LN2;
	this.hiMult = (65.791419 * shift) - 60.098922;
	if (this.sup == 2) {
		this.cut = 0;
		this.a = 5.061087;
		this.b = 0.089004;
		this.c = ( 0.0000000493*(shift^2)) + (-0.0094084706*shift) + 0.2471894558;
		this.d = 0.391007;
		this.e = (-0.0856489563*(shift^2)) + (-0.7929175529*shift) + 4.9488401422;
		this.f = (-0.0000000793*(shift^2)) + ( 0.0098846077*shift) + 0.1313126129;
	} else {
		this.cut = (0.0000850381*(shift^2)) + (0.0023634140*shift) + 0.0105942872;
		this.a = 5.555556;
		this.b = (-0.0004732561*(shift^2)) + (-0.0131317314*shift) + 0.0522539438;
		this.c = ( 0.0000000472*(shift^2)) + (-0.0094085263*shift) + 0.2471896946;
		this.d = ( 0.0000084236*(shift^2)) + ( 0.0015466913*shift) + 0.3855374431;
		this.e = ( 0.0000001125*(shift^2)) + (-0.2043050951*shift) + 5.3676547147;
		this.f = ( 0.0000003478*(shift^2)) + ( 0.0000143250*shift) + 0.0928092678;
	}
}
LUTGammaArri.prototype.linToData = function(input) {
	var out;
	input = input * 0.9;
	if (input > this.cut) {
		out = ((this.c * Math.log((this.a * input) + this.b)/Math.LN10) + this.d);
	} else {
		out = ((this.e * input) + this.f);
	}
	if (this.hiCut && out > 0.844933) {
		input = input / ((Math.log((out + 8.623709243) * 0.105612045) * this.hiMult / Math.LN10) + 1);
		if (input > this.cut) {
			out = ((this.c * Math.log((this.a * input) + this.b)/Math.LN10) + this.d);
		} else {
			out = ((this.e * input) + this.f);
		}
	}
	return out;
}
LUTGammaArri.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
LUTGammaArri.prototype.linFromData = function(input) {
	var out;
	if (input > ((this.e * this.cut) + this.f)) {
		out = ((Math.pow(10, (input - this.d) / this.c) - this.b)/0.9);
	} else {
		out = ((input - this.f) / (this.e*0.9));
	}
	if (this.hiCut && input > 0.844933) {
		out = out * ((Math.log((input + 8.623709243) * 0.105612045) * this.hiMult / Math.LN10) + 1);
	}
	return out;
}
LUTGammaArri.prototype.linFromLegal = function(input) {
	return this.linFromData((input * 0.85630498533724) + 0.06256109481916);
}
function LUTGammaLin(name,params) {
	this.name = name;
	this.params = params;
	this.gamma = params[0].toFixed(2).toString();
	this.iso = 800;
	this.cat = 1;
}
LUTGammaLin.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaLin.prototype.linToData = function(input) {
	return (this.linToLegal(input) * 0.85630498533724) + 0.06256109481916;
}
LUTGammaLin.prototype.linToLegal = function(input) {
	if (input >= this.params[3]) {
		return ((1 + this.params[2]) * Math.pow(input,1 / this.params[0])) - this.params[2];
	} else {
		return this.params[1] * input;
	}
}
LUTGammaLin.prototype.linFromData = function(input) {
	return this.linFromLegal((input - 0.06256109481916) / 0.85630498533724);
}
LUTGammaLin.prototype.linFromLegal = function(input) {
	if (input >= this.params[4]) {
		return Math.pow((input + this.params[2])/(1 + this.params[2]),this.params[0]);		
	} else {
		return (input / this.params[1]);
	}
}
function LUTGammaGen(name,params) {
	this.name = name;
	this.params = params;
	this.iso = 800;
	this.cat = 2;
}
LUTGammaGen.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaGen.prototype.linToData = function(input) {
	var stop = -300;
	if (input > 0) {
		stop = Math.log(input / 0.2) / Math.LN2;
	}
	if ( input > this.params.top[6] ) {
		return this.params.top[1] + ((this.params.top[0] - this.params.top[1])/Math.pow(1+(this.params.top[4] * Math.exp(-this.params.top[2]*(stop - this.params.top[5]))),1/this.params.top[3]));
	} else if ( input > this.params.high[6] ) {
		return this.params.high[1] + ((this.params.high[0] - this.params.high[1])/Math.pow(1+(this.params.high[4] * Math.exp(-this.params.high[2]*(stop - this.params.high[5]))),1/this.params.high[3]));
	} else if ( input > this.params.mid[6] ) {
		return this.params.mid[1] + ((this.params.mid[0] - this.params.mid[1])/Math.pow(1+(this.params.mid[4] * Math.exp(-this.params.mid[2]*(stop - this.params.mid[5]))),1/this.params.mid[3]));
	} else if ( input > this.params.low[6] ) {
		return this.params.low[1] + ((this.params.low[0] - this.params.low[1])/Math.pow(1+(this.params.low[4] * Math.exp(-this.params.low[2]*(stop - this.params.low[5]))),1/this.params.low[3]));
	} else if ( input <=0 ) {
		return (this.params.blk[0] * input) + this.params.blk[1];
	} else {
		return (this.params.bot[0] * input) + this.params.bot[1];
	}
}
LUTGammaGen.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
function LUTGammaNull(name) {
	this.name = name;
	this.iso = 800;
	this.cat = 3;
}
LUTGammaNull.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaNull.prototype.linToData = function(input) {
	return (input * 0.85630498533724) + 0.06256109481916;
}
LUTGammaNull.prototype.linToLegal = function(input) {
	return input;
}
LUTGammaNull.prototype.linFromData = function(input) {
	return (input - 0.06256109481916) / 0.85630498533724;
}
LUTGammaNull.prototype.linFromLegal = function(input) {
	return input;
}
