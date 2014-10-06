function LUTGamut(inputs) {
	this.inputs = inputs;
	this.inList = [];
	this.outList = [];
	this.inGamuts = [];
	this.outGamuts = [];
	this.doCompound = false;
	this.curIn = 0;
	this.curOut = 0;
	this.curHG = 0;
	this.hgLow = 0;
	this.hgHigh = 0;
	this.hgLowStop = 0;
	this.hgHighStop = 0;
	this.nul = false;
	this.gamutList();
}
LUTGamut.prototype.calc = function(rgb) {
	if (this.nul) {
		return rgb;
	} else if (this.doCompound) {
		return this.compound(this.inGamuts[this.curIn].calc(rgb));
	} else {
		return this.outGamuts[this.curOut].calc(this.inGamuts[this.curIn].calc(rgb));
	}
}
LUTGamut.prototype.inCalc = function(rgb) {
	if (this.nul) {
		return rgb;
	} else {
		return this.inGamuts[this.curIn].calc(rgb);
	}
}
LUTGamut.prototype.outCalc = function(rgb) {
	if (this.nul) {
		return rgb;
	} else if (this.doCompound) {
		return this.compound(rgb);
	} else {
		return this.outGamuts[this.curOut].calc(rgb);
	}
}
LUTGamut.prototype.compound = function(rgb) {
	var luma = ((0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]));
	if (luma <= this.hgLow) {
		return this.outGamuts[this.curOut].calc(rgb);
	} else if (luma >= this.hgHigh) {
		return this.outGamuts[this.curHG].calc(rgb);
	} else if (this.inputs.tweakHGLinLog[0].checked) {
		var prop = (this.hgHigh - luma)/(this.hgHigh - this.hgLow);
		var low = this.outGamuts[this.curOut].calc(rgb);
		var high = this.outGamuts[this.curOut].calc(rgb);
		return [(low[0] * (1-prop)) + (high[0] * prop),
				(low[1] * (1-prop)) + (high[1] * prop),
				(low[2] * (1-prop)) + (high[2] * prop)];
	} else {
		var prop = (this.hgHighStop - (Math.log(luma * 5)/Math.LN2))/(this.hgHighStop - this.hgLowStop);
		var low = this.outGamuts[this.curOut].calc(rgb);
		var high = this.outGamuts[this.curOut].calc(rgb);
		return [(low[0] * (1-prop)) + (high[0] * prop),
				(low[1] * (1-prop)) + (high[1] * prop),
				(low[2] * (1-prop)) + (high[2] * prop)];
	}
}
LUTGamut.prototype.updateCur = function() {
	this.curIn = parseInt(this.inputs.inGamut.options[this.inputs.inGamut.selectedIndex].value);
	this.curOut = parseInt(this.inputs.outGamut.options[this.inputs.outGamut.selectedIndex].value);
	if (this.inputs.tweakHGCheck.checked) {
		this.doCompound = true;
		this.curHG = parseInt(this.inputs.tweakHGSelect.options[this.inputs.tweakHGSelect.selectedIndex].value);
		this.hgLowStop = parseFloat(this.inputs.tweakHGLow.value);
		this.hgLow = Math.pow(2,this.hgLowStop)/5;
		this.hgHighStop = parseFloat(this.inputs.tweakHGHigh.value);
		this.hgHigh = Math.pow(2,this.hgHighStop)/5;
	} else {
		this.compund = false;
	}
}
LUTGamut.prototype.gamutList = function() {
	this.inGamuts.push(new LUTGamutMatrix('S-Gamut3.cine',[[1,0,0],[0,1,0],[0,0,1]]));
	this.inGamuts.push(new LUTGamutMatrix('S-Gamut3',[[1.1642234944,-0.1768455024,0.0126220080],[0.0260509511,0.9341657009,0.0397833480],[0.0246996363,0.0215592308,0.9537411328]]));
	this.inGamuts.push(new LUTGamutMatrix('S-Gamut',[[1.1642234944,-0.1768455024,0.0126220080],[0.0260509511,0.9341657009,0.0397833480],[0.0246996363,0.0215592308,0.9537411328]]));
	this.inGamuts.push(new LUTGamutMatrix('Rec709',[[0.6456794776,0.2591145470,0.0952059754],[0.0875299915,0.7596995626,0.1527704459],[0.0369574199,0.1292809048,0.8337616753]]));
	this.inGamuts.push(new LUTGamutMatrix('ACES',[[1.5554591070,-0.3932807985,-0.1621783087],[0.0090216145,0.9185569566,0.0724214290],[0.0442640666,0.0118502607,0.9438856727]]));
	this.inGamuts.push(new LUTGamutMatrix('XYZ',[[1.8467789693,-0.5259861230,-0.2105452114],[-0.4441532629,1.2594429028,0.1493999729],[0.0408554212,0.0156408893,0.8682072487]]));
	this.inGamuts.push(new LUTGamutMatrix('Alexa Wide Gamut',[[1.024107,-0.022704,-0.001402],[0.084744,0.932204,-0.016948],[0.033062,-0.036542,1.003480]]));
	this.inGamuts.push(new LUTGamutLut('Canon CP Lock Gamut',this.paramsCPIn()));
	this.inGamuts.push(new LUTGamutMatrix('Canon Cinema Gamut',[[1.187002652,-0.168132631,-0.018870191],[0.009561993,1.002334649,-0.01189741],[0.024939851,-0.186414783,1.161474861]]));
	this.inGamuts.push(new LUTGamutMatrix('Passthrough',[[1,0,0],[0,1,0],[0,0,1]]));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut3.cine',[[1,0,0],[0,1,0],[0,0,1]]));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut3',[[0.8556915182,0.1624073699,-0.0180988882],[-0.0229408919,1.0671513074,-0.0442104155],[-0.0216418068,-0.0283288236,1.0499706304]]));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut',[[0.8556915182,0.1624073699,-0.0180988882],[-0.0229408919,1.0671513074,-0.0442104155],[-0.0216418068,-0.0283288236,1.0499706304]]));
	this.outGamuts.push(new LUTGamutMatrix('Rec709',[[1.6269474097,-0.5401385389,-0.0868088709],[-0.1785155271,1.4179409275,-0.2394254003],[-0.0444361150,-0.1959199662,1.2403560812]]));
	this.outGamuts.push(new LUTGamutLut('LC709',this.paramsLC709Out()));
	this.outGamuts.push(new LUTGamutLut('LC709A',this.paramsLC709AOut()));
	this.outGamuts.push(new LUTGamutMatrix('Luma B&W',[[0.215006427,0.885132476,-0.100138903],[0.215006427,0.885132476,-0.100138903],[0.215006427,0.885132476,-0.100138903]]));
	this.outGamuts.push(new LUTGamutMatrix('ACES',[[0.6387886672,0.2723514337,0.0888598992],[-0.0039159061,1.0880732308,-0.0841573249],[-0.0299072021,-0.0264325799,1.0563397820]]));
	this.outGamuts.push(new LUTGamutMatrix('XYZ',[[0.5990839208,0.2489255161,0.1024464902],[0.2150758201,0.8850685017,-0.1001443219],[-0.0320658495,-0.0276583907,1.1487819910]]));
	this.outGamuts.push(new LUTGamutMatrix('Alexa Wide Gamut',[[0.974435,0.023802,0.001763],[-0.089226,1.071257,0.017968],[-0.035355,0.038226,0.997128]]));
	this.outGamuts.push(new LUTGamutLut('Canon CP Lock Gamut',this.paramsCPOut()));
	this.outGamuts.push(new LUTGamutMatrix('Canon Cinema Gamut',[[0.840981006,0.143882203,0.015137045],[-0.00825279,0.998163089,0.010090467],[-0.019382583,0.157113995,0.862268767]]));
	this.outGamuts.push(new LUTGamutMatrix('Passthrough',[[1,0,0],[0,1,0],[0,0,1]]));
	var max = this.inGamuts.length;
	for (var i = 0; i < max; i++) {
		this.inList.push({name: this.inGamuts[i].name,idx: i});
	}
	max = this.outGamuts.length;
	for (var i = 0; i < max; i++) {
		this.outList.push({name: this.outGamuts[i].name,idx: i});
	}	
}
function LUTGamutMatrix(name,params) {
	this.name = name;
	this.matrix = params;
}
LUTGamutMatrix.prototype.calc = function(rgb) {
	return [(this.matrix[0][0]*rgb[0])+(this.matrix[0][1]*rgb[1])+(this.matrix[0][2]*rgb[2]),
			(this.matrix[1][0]*rgb[0])+(this.matrix[1][1]*rgb[1])+(this.matrix[1][2]*rgb[2]),
			(this.matrix[2][0]*rgb[0])+(this.matrix[2][1]*rgb[1])+(this.matrix[2][2]*rgb[2])];
}
function LUTGamutLut(name,params) {
	this.name = name;
	this.hscale = params.hscale;
	this.Red = params.Red;
	this.Green = params.Green;
	this.Blue = params.Blue;
}
LUTGamutLut.prototype.calc = function(rgb) {
	var Rlog = this.lin2LogB(rgb[0]);
	var Glog = this.lin2LogB(rgb[1]);
	var Blog = this.lin2LogB(rgb[2]);
	var Rl = parseInt(Rlog);
	var Gl = parseInt(Glog);
	var Bl = parseInt(Blog);
	var Rd = 1 + Rl - Rlog;
	var Gd = 1 + Gl - Glog;
	var Bd = 1 + Bl - Blog;
	var OOO = [ this.Red[Bl][Gl][Rl],this.Green[Bl][Gl][Rl],this.Blue[Bl][Gl][Rl] ];
	var ROO = [ this.Red[Bl][Gl][Rl+1],this.Green[Bl][Gl][Rl+1],this.Blue[Bl][Gl][Rl+1] ];
	var OGO = [ this.Red[Bl][Gl+1][Rl],this.Green[Bl][Gl+1][Rl],this.Blue[Bl][Gl+1][Rl] ];
	var RGO = [ this.Red[Bl][Gl+1][Rl+1],this.Green[Bl][Gl+1][Rl+1],this.Blue[Bl][Gl+1][Rl+1] ];
	var OOB = [ this.Red[Bl+1][Gl][Rl],this.Green[Bl+1][Gl][Rl],this.Blue[Bl+1][Gl][Rl] ];
	var ROB = [ this.Red[Bl+1][Gl][Rl+1],this.Green[Bl+1][Gl][Rl+1],this.Blue[Bl+1][Gl][Rl+1] ];
	var OGB = [ this.Red[Bl+1][Gl+1][Rl],this.Green[Bl+1][Gl+1][Rl],this.Blue[Bl+1][Gl+1][Rl] ];
	var RGB = [ this.Red[Bl+1][Gl+1][Rl+1],this.Green[Bl+1][Gl+1][Rl+1],this.Blue[Bl+1][Gl+1][Rl+1] ];
	var out = [];
	out[0] = (((((OOO[0]*Rd)+(ROO[0]*(1-Rd)))*Gd)+(((OGO[0]*Rd)+(RGO[0]*(1-Rd)))*(1-Gd)))*Bd)+(((((OOB[0]*Rd)+(ROB[0]*(1-Rd)))*Gd)+(((OGB[0]*Rd)+(RGB[0]*(1-Rd)))*(1-Gd)))*(1-Bd));
	out[1] = (((((OOO[1]*Rd)+(ROO[1]*(1-Rd)))*Gd)+(((OGO[1]*Rd)+(RGO[1]*(1-Rd)))*(1-Gd)))*Bd)+(((((OOB[1]*Rd)+(ROB[1]*(1-Rd)))*Gd)+(((OGB[1]*Rd)+(RGB[1]*(1-Rd)))*(1-Gd)))*(1-Bd));
	out[2] = (((((OOO[2]*Rd)+(ROO[2]*(1-Rd)))*Gd)+(((OGO[2]*Rd)+(RGO[2]*(1-Rd)))*(1-Gd)))*Bd)+(((((OOB[2]*Rd)+(ROB[2]*(1-Rd)))*Gd)+(((OGB[2]*Rd)+(RGB[2]*(1-Rd)))*(1-Gd)))*(1-Bd));		
	out[0] = this.logB2Lin(out[0]);
	out[1] = this.logB2Lin(out[1]);
	out[2] = this.logB2Lin(out[2]);
	if (this.hscale) {
	 	if (rgb[0] >= 42.689927) {
			out[0] = out[0] * rgb[0] / 42.689927;
		}
	 	if (rgb[1] >= 42.689927) {
			out[1] = out[1] * rgb[1] / 42.689927;
		}
	 	if (rgb[2] >= 42.689927) {
			out[2] = out[2] * rgb[2] / 42.689927;
		}
	}
	return out;
}
LUTGamutLut.prototype.lin2LogB = function(lin) {
	if (lin<0) {
		var out = ((lin / 0.0155) + 1);
		if (out < 0) {
			out = 0;
		}
		return out;
	} else {
		var out = ((Math.log((640 * lin) + 1)*32/(15.21321775216870*Math.log(2))) + 1);
		if (out >= 32) {
			out = 31.999999;
		}
		return out
	}
}
LUTGamutLut.prototype.logB2Lin = function(log) {
	if (log<1) {
		return (0.0155 * log) - 0.0155;
	} else {
		return ((Math.pow(2,(log-1)*15.21321775216870/32)-1)/640);
	}
}
