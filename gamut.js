/* gamut.js
* Colour Space (gamut) conversion web worker object for the LUTCalc Web App.
* 30th December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTGamut() {
	this.nul = false;
	this.inGamuts = [];
	this.outGamuts = [];
	this.isTrans = false;
	this.ver = 0;
	this.curIn = 0;
	this.curOut = 0;
	this.doTemp = false;
	this.doGreen = false;
	this.CAT = new LUTGamutTemperature();
	this.green = new LUTGamutGreen();
	this.doHG = false;
	this.curHG = 0;
	this.hgLow = 0;
	this.hgHigh = 0;
	this.hgLin = true;
	this.hgLowStop = 0;
	this.hgHighStop = 0;
	this.LA = 0;
	this.pass = 0;
	this.inList = [];
	this.outList = [];
	this.laList = [];
	if ((new Int8Array(new Int16Array([1]).buffer)[0]) > 0) {
		this.isLE = true;
	} else {
		this.isLE = false;
	}
	this.gamutList();
}
LUTGamut.prototype.gamutList = function() {
	this.SG3C = 0;
	this.inGamuts.push(new LUTGamutMatrix('S-Gamut3.cine',new Float64Array([1,0,0, 0,1,0, 0,0,1])));
	this.inGamuts.push(new LUTGamutMatrix('S-Gamut3',new Float64Array([1.1642234944,-0.1768455024,0.0126220080, 0.0260509511,0.9341657009,0.0397833480, 0.0246996363,0.0215592308,0.9537411328])));
	this.inGamuts.push(new LUTGamutMatrix('S-Gamut',new Float64Array([1.1642234944,-0.1768455024,0.0126220080, 0.0260509511,0.9341657009,0.0397833480, 0.0246996363,0.0215592308,0.9537411328])));
	this.inGamuts.push(new LUTGamutMatrix('Rec709',new Float64Array([0.6456794776,0.2591145470,0.0952059754, 0.0875299915,0.7596995626,0.1527704459, 0.0369574199,0.1292809048,0.8337616753])));
	this.inGamuts.push(new LUTGamutMatrix('Rec2020',new Float64Array([1.0381440618,-0.0954526919,0.0573086300, 0.0479489221,0.7938618493,0.1581892287, 0.0301320543,0.0408857929,0.9289821529])));
	this.inGamuts.push(new LUTGamutMatrix('ACES',new Float64Array([1.5554591070,-0.3932807985,-0.1621783087, 0.0090216145,0.9185569566,0.0724214290, 0.0442640666,0.0118502607,0.9438856727])));
	this.inGamuts.push(new LUTGamutMatrix('XYZ',new Float64Array([1.8467789693,-0.5259861230,-0.2105452114, -0.4441532629,1.2594429028,0.1493999729, 0.0408554212,0.0156408893,0.8682072487])));
	this.inGamuts.push(new LUTGamutMatrix('Alexa Wide Gamut',new Float64Array([1.024107,-0.022704,-0.001402, 0.084744,0.932204,-0.016948, 0.033062,-0.036542,1.003480])));
	this.inGamuts.push(new LUTGamutCanonIDT('Canon CP IDT (Daylight)',{ camera: 0, day: true }));
	this.inGamuts.push(new LUTGamutCanonIDT('Canon CP IDT (Tungsten)',{ camera: 0, day: false }));
	this.inGamuts.push(new LUTGamutMatrix('Panasonic V-Gamut',new Float64Array([1.3316572111,-0.1875611006,-0.1440961107, -0.0280131243,0.9887375645,0.0392755599, 0.0125574527,-0.0050679052,0.9925104526])));
	this.inGamuts.push(new LUTGamutMatrix('Canon Cinema Gamut',new Float64Array([1.187002652,-0.168132631,-0.018870191, 0.009561993,1.002334649,-0.01189741, 0.024939851,-0.186414783,1.161474861])));
	this.inGamuts.push(new LUTGamutMatrix('Passthrough',new Float64Array([1,0,0, 0,1,0, 0,0,1])));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut3.cine',new Float64Array([1,0,0, 0,1,0, 0,0,1])));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut3',new Float64Array([0.8556915182,0.1624073699,-0.0180988882, -0.0229408919,1.0671513074,-0.0442104155, -0.0216418068,-0.0283288236,1.0499706304])));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut',new Float64Array([0.8556915182,0.1624073699,-0.0180988882, -0.0229408919,1.0671513074,-0.0442104155, -0.0216418068,-0.0283288236,1.0499706304])));
	this.outGamuts.push(new LUTGamutMatrix('Rec709',new Float64Array([1.6269474097,-0.5401385389,-0.0868088709, -0.1785155271,1.4179409275,-0.2394254003, -0.0444361150,-0.1959199662,1.2403560812])));
	this.outGamuts.push(new LUTGamutMatrix('Rec2020',new Float64Array([0.9600463439,0.1195329788,-0.0795793226, -0.0522394796,1.2643057472,-0.2120662678, -0.0288405067,-0.0595209682,1.0883614748])));
	this.outGamuts.push(new LUTGamutLUT(
		'LC709',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'LC709.labin',
			le: this.isLE
		}));
	this.outGamuts.push(new LUTGamutLUT(
		'LC709A',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'LC709A.labin',
			le: this.isLE
		}));
	this.outGamuts.push(new LUTGamutLUT(
		'Varicam V709',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'V709.labin',
			le: this.isLE
		}));
	this.outGamuts.push(new LUTGamutMatrix('Luma B&W',new Float64Array([0.215006427,0.885132476,-0.100138903, 0.215006427,0.885132476,-0.100138903, 0.215006427,0.885132476,-0.100138903])));
	this.outGamuts.push(new LUTGamutMatrix('ACES',new Float64Array([0.6387886672,0.2723514337,0.0888598992, -0.0039159061,1.0880732308,-0.0841573249, -0.0299072021,-0.0264325799,1.0563397820])));
	this.outGamuts.push(new LUTGamutMatrix('XYZ',new Float64Array([0.5990839208,0.2489255161,0.1024464902, 0.2150758201,0.8850685017,-0.1001443219, -0.0320658495,-0.0276583907,1.1487819910])));
	this.outGamuts.push(new LUTGamutMatrix('Alexa Wide Gamut',new Float64Array([0.974435,0.023802,0.001763, -0.089226,1.071257,0.017968, -0.035355,0.038226,0.997128])));
	this.outGamuts.push(new LUTGamutLUT(
		'Canon CP Lock (Daylight)',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'cpouttungsten.labin',
			le: this.isLE
		}));
	this.outGamuts.push(new LUTGamutLUT(
		'Canon CP Lock (Tungsten)',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'cpoutdaylight.labin',
			le: this.isLE
		}));
	this.outGamuts.push(new LUTGamutMatrix('Canon Cinema Gamut',new Float64Array([0.840981006,0.143882203,0.015137045, -0.00825279,0.998163089,0.010090467, -0.019382583,0.157113995,0.862268767])));
	this.outGamuts.push(new LUTGamutMatrix('Panasonic V-Gamut',new Float64Array([0.752982595,0.143370216,0.103647188, 0.021707697,1.015318836,-0.037026533, -0.009416053,0.003370418,1.006045635])));
	this.LA = this.outGamuts.length;
	this.outGamuts.push(new LUTGamutLA('LA'));
	this.pass = this.outGamuts.length;
	this.outGamuts.push(new LUTGamutMatrix('Passthrough',new Float64Array([1,0,0, 0,1,0, 0,0,1])));
	var max = this.inGamuts.length;
	for (var i = 0; i < max; i++) {
		this.inList.push({name: this.inGamuts[i].name,idx: i});
	}
	var max2 = this.outGamuts.length;
	for (var i = 0; i < max2; i++) {
		if (i != this.LA) {
			this.outList.push({name: this.outGamuts[i].name,idx: i});
		}
	}
	max = this.inList.length;
	max2 = this.outList.length
	for (var i=0; i<max; i++) {
		this.laList.push({name: this.inList[i].name});
		for (var j=0; j<max2; j++) {
			if (this.laList[i].name === this.outList[j].name) {
				this.laList[i].idx = this.outList[j].idx;
				break;
			}
		}
	}
}
LUTGamut.prototype.getCATs = function(p,t) {
	return {
		p: p,
		t: t+20,
		v: this.ver,
		o: [this.CAT.getCATs(), this.green.getCATs()]
	};
}
// I/O functions
LUTGamut.prototype.setParams = function(params) {
	var out = {	t: 20, v: this.ver };
	if (typeof params.v !== 'number') {
		out.err = true;
		out.details = 'Missing version no.';
		return out;
	}
	if (typeof params.inGamut === 'number') {
		this.curIn = params.inGamut;
		out.inGamut = this.curIn;
	}
	if (typeof params.outGamut === 'number') {
		this.curOut = params.outGamut;
		out.outGamut = this.curOut;
	}
	if (typeof params.hgGamut === 'number') {
		this.curHG = params.hgGamut;
		out.hgGamut = this.curHG;
	}
	this.doHG = false;
	out.doHG = false;
	this.doTemp = false;
	out.doTemp = false;
	this.doGreen = false;
	out.doGreen = false;
	if (typeof params.tweaks === 'boolean' && params.tweaks) {
		if (typeof params.doHG === 'boolean') {
			this.doHG = params.doHG;
			out.doHG = this.doHG;
		}
		if (typeof params.doTemp === 'boolean') {
			this.doTemp = params.doTemp;
			out.doTemp = this.doTemp;
		}
		if (typeof params.doGreen === 'boolean') {
			this.doGreen = params.doGreen;
			out.doGreen = this.doGreen;
		}
	}
	if (typeof params.CAT === 'number') {
		this.CAT.setCAT(params.CAT);
		out.CAT = params.CAT;
	}
	if (typeof params.baseTemp === 'number' && typeof params.newTemp === 'number') {
		this.CAT.setTemps(params.newTemp,params.baseTemp);
		out.baseTemp = params.baseTemp;
		out.newTemp = params.newTemp;
	}
	if (typeof params.greenCAT === 'number') {
		this.green.setCAT(params.greenCAT);
		out.greenCAT = params.greenCAT;
	}
	if (typeof params.greenTemp === 'number' && typeof params.greenMag === 'number') {
		this.green.setGreen(params.greenTemp,params.greenMag);
		out.greenTemp = params.greenTemp;
		out.greenMag = params.greenMag;
	}
	if (typeof params.hgLin === 'boolean') {
		this.hgLin = params.hgLin;
		out.hgLin = this.hgLin;
	} else {
		this.doHG = false;
		out.doHG = false;
	}
	if (typeof params.hgLowStop === 'number') {
		this.hgLowStop = params.hgLowStop;
		this.hgLow = Math.pow(2,this.hgLowStop)/5;
		out.hgLowStop = this.hgLowStop;
		out.hgLow = this.hgLow;
	} else {
		this.doHG = false;
		out.doHG = false;
	}
	if (typeof params.hgHighStop === 'number') {
		this.hgHighStop = params.hgHighStop;
		this.hgHigh = Math.pow(2,this.hgHighStop)/5;
		out.hgHighStop = this.hgHighStop;
		out.hgHigh = this.hgHigh;
	} else {
		this.doHG = false;
		out.doHG = false;
	}
	if (typeof params.isTrans === 'boolean') {
		this.isTrans = params.isTrans;
	}
	this.ver = params.v;
	out.v = this.ver;
	return out;
}
LUTGamut.prototype.calc = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, R:i.R, G:i.G, B:i.B, vals: i.vals, dim: i.dim};
	if (!this.nul) {
		var o = new Float64Array(i.o);
		var max = o.length / 3;
		var eiMult = i.eiMult;
		for (var j=0; j<max; j++) {
			var k = j*3;
			var c = this.inGamuts[this.curIn].calc([o[k],o[k+1],o[k+2]]);
			c[0] *= eiMult;
			c[1] *= eiMult;
			c[2] *= eiMult;
			if (this.doTemp) {
				c = this.CAT.calc(c.slice(0));
			}
			if (this.doGreen) {
				c = this.green.calc(c.slice(0));
			}
			if (this.doHG) {
				var luma = ((0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]));
				if (luma <= this.hgLow) {
					var g = this.outGamuts[this.curOut].calc(c);
					o[ k ] = g[0];
					o[k+1] = g[1];
					o[k+2] = g[2];
				} else if (luma >= this.hgHigh) {
					var g = this.outGamuts[this.curHG].calc(c);
					o[ k ] = g[0];
					o[k+1] = g[1];
					o[k+2] = g[2];
				} else {
					var prop;
					if (this.hgLin) {
						prop = (this.hgHigh - luma)/(this.hgHigh - this.hgLow);
					} else {
						prop = (this.hgHighStop - (Math.log(luma * 5)/Math.LN2))/(this.hgHighStop - this.hgLowStop);
					}
					var low = this.outGamuts[this.curOut].calc(c);
					var high = this.outGamuts[this.curOut].calc(c);
					o[ k ] = (low[0] * (1-prop)) + (high[0] * prop);
					o[k+1] = (low[1] * (1-prop)) + (high[1] * prop);
					o[k+2] = (low[2] * (1-prop)) + (high[2] * prop);
				}
			} else {
				var g = this.outGamuts[this.curOut].calc(c);
				o[ k ] = g[0];
				o[k+1] = g[1];
				o[k+2] = g[2];
			}
		out.o = o.buffer;
		out.to = ['o'];
		}
	} else {
		out.o = i.o;
		out.to = ['o'];
	}
	return out;
}
LUTGamut.prototype.preview = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, line: i.line};
	var o = new Float64Array(i.o);
	if (!this.nul) {
		var max = o.length / 3;
		var eiMult = i.eiMult;
		for (var j=0; j<max; j++) {
			var k = j*3;
			var c = [o[k]*eiMult,o[k+1]*eiMult,o[k+2]*eiMult];
			if (this.doTemp) {
				c = this.CAT.calc(c.slice(0));
			}
			if (this.doGreen) {
				c = this.green.calc(c.slice(0));
			}
			if (this.doHG) {
				var luma = ((0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]));
				if (luma <= this.hgLow) {
					var g = this.outGamuts[this.curOut].fast(c);
					o[ k ] = g[0];
					o[k+1] = g[1];
					o[k+2] = g[2];
				} else if (luma >= this.hgHigh) {
					var g = this.outGamuts[this.curHG].fast(c);
					o[ k ] = g[0];
					o[k+1] = g[1];
					o[k+2] = g[2];
				} else {
					var prop;
					if (this.hgLin) {
						prop = (this.hgHigh - luma)/(this.hgHigh - this.hgLow);
					} else {
						prop = (this.hgHighStop - (Math.log(luma * 5)/Math.LN2))/(this.hgHighStop - this.hgLowStop);
					}
					var low = this.outGamuts[this.curOut].fast(c);
					var high = this.outGamuts[this.curOut].fast(c);
					o[ k ] = (low[0] * (1-prop)) + (high[0] * prop);
					o[k+1] = (low[1] * (1-prop)) + (high[1] * prop);
					o[k+2] = (low[2] * (1-prop)) + (high[2] * prop);
				}
			} else {
				var g = this.outGamuts[this.curOut].fast(c);
				o[ k ] = g[0];
				o[k+1] = g[1];
				o[k+2] = g[2];
			}
		}
	}
	out.o = o.buffer;
	out.to = ['o'];
	return out;
}
LUTGamut.prototype.previewLin = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, gamma: i.gamma, gamut: i.gamut, legal: i.legal, i: i.i };
	var o = new Float64Array(i.o);
	var max = Math.round(o.length/3);
	var k;
	for (var j=0; j<max; j++) {
		k=j*3;
		var c = this.inGamuts[i.gamut].calc([o[k],o[k+1],o[k+2]]);
		o[ k ] = c[0];
		o[k+1] = c[1];
		o[k+2] = c[2];
	}
	out.o = o.buffer;
	out.to = ['i','o'];
	return out;
}
LUTGamut.prototype.laCalc = function(p,t,i) {
		var o = new Float64Array(i.o);
		var dim = i.dim;
		var max = dim*dim*dim;
		for (var j=0; j<max; j++) {
			var k = j*3;
			var g = this.outGamuts[i.gamut].calc([o[k],o[k+1],o[k+2]]);
			o[ k ] = g[0];
			o[k+1] = g[1];
			o[k+2] = g[2];
		}
	var out = { p: p, t: t+20, v: this.ver};
	out.dim = i.dim;
	out.legIn = i.legIn;
	out.gamma = i.gamma;
	out.gamut = i.gamut;
	out.o = o.buffer;
	out.to = ['o'];
	return out;
}
LUTGamut.prototype.getLists = function(p,t) {
	return {
		p: p,
		t: t+20,
		v: this.ver,
		inList: this.inList,
		outList: this.outList,
		laList: this.laList,
		pass: this.pass,
		LA: this.LA
	};
}
LUTGamut.prototype.setLA = function(p,t,i) {
	this.outGamuts[this.LA].setLUT(i);
	return { p: p, t:t+20, v: this.ver, i: i.title };
}
LUTGamut.prototype.setLATitle = function(p,t,i) {
	this.outGamuts[this.LA].setTitle(i);
	return { p: p, t:t+20, v: this.ver, i: i };
}
LUTGamut.prototype.ioNames = function(p,t) {
	var out = {};
	out.inName = this.inGamuts[this.curIn].name;
	out.outName = this.outGamuts[this.curOut].name;
	out.hgName = this.outGamuts[this.curHG].name;
	return {p: p, t: t+20, v: this.ver, o: out};
}
LUTGamut.prototype.getPrimaries = function(p,t) {
	var out = new Float64Array(18);
	var c = [];
	c = this.outGamuts[this.curOut].calc([0.5099575746064158, 0.47751324256890015, 0.09369479745196567]);
	out[0] = c[0];
	out[1] = c[1];
	out[2] = c[2];
	c = this.outGamuts[this.curOut].calc([0.19970117985279875, 0.5142838920067684, 0.542787468791713]);
	out[3] = c[0];
	out[4] = c[1];
	out[5] = c[2];
	c = this.outGamuts[this.curOut].calc([0.14604144406432912, 0.428179824180783, 0.07286495584879325]);
	out[6] = c[0];
	out[7] = c[1];
	out[8] = c[2];
	c = this.outGamuts[this.curOut].calc([0.4175758663305563, 0.13543748621410254, 0.49075235454609223]);
	out[9] = c[0];
	out[10] = c[1];
	out[11] = c[2];
	c = this.outGamuts[this.curOut].calc([0.3639161305420867, 0.04933341838811719, 0.02082984160317242]);
	out[12] = c[0];
	out[13] = c[1];
	out[14] = c[2];
	c = this.outGamuts[this.curOut].calc([0.05365973578846964, 0.08610406782598536, 0.4699225129429198]);
	out[15] = c[0];
	out[16] = c[1];
	out[17] = c[2];
	return {p: p, t: t+20, v: this.ver, o: out.buffer};
}
// Gamut calculation objects
function LUTGamutTemperature() {
	this.cur = 0;
	this.names = [];
	this.M = [];
	this.SG3C = [];
	this.SG3CI = [];
	this.net = [];
	this.t1 = 5500;
	this.t2 = 5500;
	this.loci = new LUTs();
	this.setLoci();
	this.models();
}
LUTGamutTemperature.prototype.setLoci = function() {
	this.loci.setDetails({
		title: 'loci',
		format: 'cube',
		dims: 1,
		s: 65,
		min: [0,0,0],
		max: [1,1,1],
		C: [new Float64Array(
			[1.34656,1.24451,1.17117,1.11848,1.08017,1.05187,1.03065,1.01455,
			 1.00197,0.99234,0.98506,0.97960,0.97557,0.97264,0.97058,0.96920,
			 0.96835,0.96791,0.96780,0.96794,0.96828,0.96877,0.96937,0.97006,
			 0.97082,0.97163,0.97246,0.97332,0.97419,0.97507,0.97594,0.97681,
			 0.97767,0.97852,0.97936,0.98017,0.98098,0.98176,0.98253,0.98327,
			 0.98400,0.98471,0.98540,0.98607,0.98673,0.98736,0.98798,0.98858,
			 0.98917,0.98974,0.99029,0.99083,0.99135,0.99186,0.99236,0.99284,
			 0.99331,0.99376,0.99421,0.99464,0.99506,0.99547,0.99586,0.99625,
			 0.99663]),
			new Float64Array(
		    [1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1]),
			new Float64Array(
			[0.10372,0.16741,0.24024,0.31663,0.39400,0.47089,0.54644,0.62019,
			 0.69148,0.75874,0.82247,0.88270,0.93953,0.99307,1.04350,1.09097,
			 1.13565,1.17772,1.21733,1.25466,1.28985,1.32304,1.35437,1.38397,
			 1.41196,1.43844,1.46352,1.48728,1.50983,1.53123,1.55157,1.57090,
			 1.58931,1.60684,1.62355,1.63949,1.65471,1.66925,1.68316,1.69646,
			 1.70920,1.72141,1.73311,1.74434,1.75512,1.76548,1.77544,1.78502,
			 1.79423,1.80311,1.81166,1.81991,1.82786,1.83553,1.84294,1.85010,
			 1.85702,1.86371,1.87018,1.87645,1.88251,1.88839,1.89408,1.89960,
			 1.90495])
			]
	});
}
LUTGamutTemperature.prototype.models = function() {
	this.addModel(
		'Bradford Chromatic Adaptation',
		[0.8951,0.2664,-0.1614, -0.7502,1.7135,0.0367, 0.0389,-0.0685,1.0296],
		[0.598711644,0.463059543,-0.120392007, -0.082077156,1.328805893,-0.206292353, -0.024443328,-0.079421069,1.193630992],
		[1.597166837,-0.552657842,0.065578923, 0.104813502,0.724142189,0.13572344, 0.039681001, 0.03686512, 0.84815347]
	);
	this.addModel(
		'Von Kries',
		[0.40024,0.7076,-0.08081, -0.2263,1.16532,0.0457, 0,0,0.91822],
		[0.39455624,0.728139495,-0.122692012, 0.113594054,0.973792194,-0.087384485, -0.029443504,-0.025396488,1.0548346],
		[3.244909721,-2.421724712,0.176808131, -0.371196824,1.306166354,0.0650299, 0.08163784,-0.036149767,0.954516833]
	);
	this.addModel(
		'Sharp',
		[1.2694,-0.0988,-0.1706, -0.8364,1.8006,0.0357, 0.0297,-0.0315,1.0018],
		[0.744698072,0.233259804,-0.056042374, -0.114953021,1.384465638,-0.224994593, -0.021105664,-0.048194746,1.157047005],
		[1.309466843,-0.219904425,0.020663226, 0.113375079,0.708183505,0.143201847, 0.028608388,0.02548686,0.870610859]
	);
	this.addModel(
		'CMCCAT2000',
		[0.7982,0.3389,-0.1371, -0.5918,1.5512,0.0406, 0.0008,0.0239,0.9753],
		[0.555474209,0.502434028,-0.109664133, -0.022214126,1.224481209,-0.169331156, -0.025654244,-0.005622951,1.118095584],
		[1.774110042,-0.727666932,0.063804524, 0.037840809,0.801720007,0.125128797, 0.040896529,-0.012664134,0.896471164]
	);
	this.addModel(
		'CAT02',
		[0.7328,0.4296,-0.1624, -0.7036,1.6975,0.0061, 0.003,0.0136,0.9834],
		[0.536612763,0.567129769,-0.154511408, -0.056619844,1.327091072,-0.235068767, -0.026811273,-0.014415553,1.128657587],
		[1.787333656,-0.762881579,0.085795558, 0.083966529,0.719397261,0.161325823, 0.043530577,-0.008933903,0.890106885]
	);
	this.addModel(
		'XYZ Scaling',
		[1,0,0, 0,1,0, 0,0,1],
		[0.599083921,0.248925516,0.10244649, 0.21507582,0.885068502,-0.100144322, -0.03206585,-0.027658391,1.148781991],
		[1.846778969,-0.525986123,-0.210545211, -0.444153263,1.259442903,0.149399973, 0.040855421,0.015640889,0.868207249]
	);
}
LUTGamutTemperature.prototype.addModel = function(name,M,SG3C,SG3CI) {
	this.names.push(name);
	this.M.push(M);
	this.SG3C.push(SG3C);
	this.SG3CI.push(SG3CI);
}
LUTGamutTemperature.prototype.getCATs = function() {
	var max = this.names.length;
	var out = [];
	for (var j=0; j<max; j++) {
		out.push({idx: j, name: this.names[j]});
	}
	return out;
}
LUTGamutTemperature.prototype.setCAT = function(cat) {
	this.cur = cat;
	this.setMatrix();
}
LUTGamutTemperature.prototype.setTemps = function(t1,t2) {
	this.t1 = t1;
	this.t2 = t2;
	this.setMatrix();
}
LUTGamutTemperature.prototype.setMatrix = function() {
	var w2 = this.w(this.t1);
	var w1 = this.w(this.t2);
	var W = [w1[0]/w2[0],w1[1]/w2[1],w1[2]/w2[2]];
	var xyz = [	W[0]*this.SG3C[this.cur][0],W[0]*this.SG3C[this.cur][1],W[0]*this.SG3C[this.cur][2],
				W[1]*this.SG3C[this.cur][3],W[1]*this.SG3C[this.cur][4],W[1]*this.SG3C[this.cur][5],
				W[2]*this.SG3C[this.cur][6],W[2]*this.SG3C[this.cur][7],W[2]*this.SG3C[this.cur][8] ];
	this.net = new Float64Array([
				(this.SG3CI[this.cur][0]*xyz[0])+(this.SG3CI[this.cur][1]*xyz[3])+(this.SG3CI[this.cur][2]*xyz[6]), (this.SG3CI[this.cur][0]*xyz[1])+(this.SG3CI[this.cur][1]*xyz[4])+(this.SG3CI[this.cur][2]*xyz[7]), (this.SG3CI[this.cur][0]*xyz[2])+(this.SG3CI[this.cur][1]*xyz[5])+(this.SG3CI[this.cur][2]*xyz[8]),
				(this.SG3CI[this.cur][3]*xyz[0])+(this.SG3CI[this.cur][4]*xyz[3])+(this.SG3CI[this.cur][5]*xyz[6]), (this.SG3CI[this.cur][3]*xyz[1])+(this.SG3CI[this.cur][4]*xyz[4])+(this.SG3CI[this.cur][5]*xyz[7]), (this.SG3CI[this.cur][3]*xyz[2])+(this.SG3CI[this.cur][4]*xyz[5])+(this.SG3CI[this.cur][5]*xyz[8]),
				(this.SG3CI[this.cur][6]*xyz[0])+(this.SG3CI[this.cur][7]*xyz[3])+(this.SG3CI[this.cur][8]*xyz[6]), (this.SG3CI[this.cur][6]*xyz[1])+(this.SG3CI[this.cur][7]*xyz[4])+(this.SG3CI[this.cur][8]*xyz[7]), (this.SG3CI[this.cur][6]*xyz[2])+(this.SG3CI[this.cur][7]*xyz[5])+(this.SG3CI[this.cur][8]*xyz[8])
	]);
}
LUTGamutTemperature.prototype.w = function(t) {
	var T = (parseFloat(t)-1800)/19200;
	var rgb = this.loci.lumaRGBCub(T);
// rgb is the XYZ vector transformed by matrix M 
	return [(this.M[this.cur][0]*rgb[0])+(this.M[this.cur][1]*rgb[1])+(this.M[this.cur][2]*rgb[2]),
			(this.M[this.cur][3]*rgb[0])+(this.M[this.cur][4]*rgb[1])+(this.M[this.cur][5]*rgb[2]),
			(this.M[this.cur][6]*rgb[0])+(this.M[this.cur][7]*rgb[1])+(this.M[this.cur][8]*rgb[2])];
}
LUTGamutTemperature.prototype.calc = function(rgb) {
	return [(this.net[0]*rgb[0])+(this.net[1]*rgb[1])+(this.net[2]*rgb[2]),
			(this.net[3]*rgb[0])+(this.net[4]*rgb[1])+(this.net[5]*rgb[2]),
			(this.net[6]*rgb[0])+(this.net[7]*rgb[1])+(this.net[8]*rgb[2])];
}

function LUTGamutGreen() {
	this.cur = 0;
	this.names = [];
	this.M = [];
	this.SG3C = [];
	this.SG3CI = [];
	this.net = [];
	this.m = 0;
	this.t = 5500;
	this.loci = new LUTs();
	this.setLoci();
	this.models();
}
LUTGamutGreen.prototype.setLoci = function() {
	this.loci.setDetails({
		title: 'loci',
		format: 'cube',
		dims: 1,
		s: 65,
		min: [0,0,0],
		max: [1,1,1],
		C: [new Float64Array(
			[0.549554281,0.515981903,0.485678486,0.459314076,0.436578981,0.416952596,0.399927196,0.385065683,
			 0.3720036,0.360710179,0.350863077,0.34224204,0.334660345,0.327961725,0.322016063,0.316715103,
			 0.311968633,0.307701254,0.303849707,0.3003607,0.297189137,0.294296685,0.291650622,0.289222888,
			 0.286989321,0.28492903,0.283023883,0.281258078,0.279617799,0.278090919,0.276666763,0.275335899,
			 0.274089972,0.272921555,0.27182403,0.270791487,0.269818625,0.268900689,0.268033395,0.267212878,
			 0.266435644,0.265698526,0.264998648,0.264333394,0.263700379,0.263097425,0.262522539,0.261973896,
			 0.261449821,0.260948772,0.260469333,0.260010195,0.259570151,0.259148084,0.258742963,0.258353827,
			 0.257979789,0.257620022,0.257273756,0.256940277,0.256618916,0.256309051,0.256010098,0.255721513,
			 0.255442786]),
			new Float64Array(
			[0.408116416,0.414606817,0.414694684,0.410660277,0.404174524,0.396390777,0.38803413,0.379544456,
			 0.371270504,0.363493931,0.356185759,0.349369467,0.343042515,0.337186884,0.331776025,0.326779327,
			 0.322164915,0.317901341,0.313958564,0.310308465,0.306925075,0.303784628,0.300865504,0.298148114,
			 0.295614754,0.293249445,0.29103778,0.288966769,0.287024695,0.285200986,0.283486092,0.28187138,
			 0.280349037,0.27891198,0.277553785,0.276268614,0.275051153,0.273896563,0.272800426,0.271758707,
			 0.270767715,0.269824064,0.268924652,0.268066625,0.267247361,0.266464443,0.26571564,0.264998896,
			 0.264312306,0.263654108,0.26302267,0.262416477,0.26183412,0.261274291,0.260735771,0.260217427,
			 0.259718197,0.259237094,0.258773194,0.258325631,0.257893596,0.25747633,0.257073122,0.256683302,
			 0.256306244]),
			new Float64Array(
		    [1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1])
			]
	});
}
LUTGamutGreen.prototype.models = function() {
	this.addModel(
		'Bradford Chromatic Adaptation',
		[0.8951,0.2664,-0.1614, -0.7502,1.7135,0.0367, 0.0389,-0.0685,1.0296],
		[0.598711644,0.463059543,-0.120392007, -0.082077156,1.328805893,-0.206292353, -0.024443328,-0.079421069,1.193630992],
		[1.597166837,-0.552657842,0.065578923, 0.104813502,0.724142189,0.13572344, 0.039681001, 0.03686512, 0.84815347]
	);
	this.addModel(
		'Von Kries',
		[0.40024,0.7076,-0.08081, -0.2263,1.16532,0.0457, 0,0,0.91822],
		[0.39455624,0.728139495,-0.122692012, 0.113594054,0.973792194,-0.087384485, -0.029443504,-0.025396488,1.0548346],
		[3.244909721,-2.421724712,0.176808131, -0.371196824,1.306166354,0.0650299, 0.08163784,-0.036149767,0.954516833]
	);
	this.addModel(
		'Sharp',
		[1.2694,-0.0988,-0.1706, -0.8364,1.8006,0.0357, 0.0297,-0.0315,1.0018],
		[0.744698072,0.233259804,-0.056042374, -0.114953021,1.384465638,-0.224994593, -0.021105664,-0.048194746,1.157047005],
		[1.309466843,-0.219904425,0.020663226, 0.113375079,0.708183505,0.143201847, 0.028608388,0.02548686,0.870610859]
	);
	this.addModel(
		'CMCCAT2000',
		[0.7982,0.3389,-0.1371, -0.5918,1.5512,0.0406, 0.0008,0.0239,0.9753],
		[0.555474209,0.502434028,-0.109664133, -0.022214126,1.224481209,-0.169331156, -0.025654244,-0.005622951,1.118095584],
		[1.774110042,-0.727666932,0.063804524, 0.037840809,0.801720007,0.125128797, 0.040896529,-0.012664134,0.896471164]
	);
	this.addModel(
		'CAT02',
		[0.7328,0.4296,-0.1624, -0.7036,1.6975,0.0061, 0.003,0.0136,0.9834],
		[0.536612763,0.567129769,-0.154511408, -0.056619844,1.327091072,-0.235068767, -0.026811273,-0.014415553,1.128657587],
		[1.787333656,-0.762881579,0.085795558, 0.083966529,0.719397261,0.161325823, 0.043530577,-0.008933903,0.890106885]
	);
	this.addModel(
		'XYZ Scaling',
		[1,0,0, 0,1,0, 0,0,1],
		[0.599083921,0.248925516,0.10244649, 0.21507582,0.885068502,-0.100144322, -0.03206585,-0.027658391,1.148781991],
		[1.846778969,-0.525986123,-0.210545211, -0.444153263,1.259442903,0.149399973, 0.040855421,0.015640889,0.868207249]
	);
}
LUTGamutGreen.prototype.addModel = function(name,M,SG3C,SG3CI) {
	this.names.push(name);
	this.M.push(M);
	this.SG3C.push(SG3C);
	this.SG3CI.push(SG3CI);
}
LUTGamutGreen.prototype.getCATs = function() {
	var max = this.names.length;
	var out = [];
	for (var j=0; j<max; j++) {
		out.push({idx: j, name: this.names[j]});
	}
	return out;
}
LUTGamutGreen.prototype.setCAT = function(cat) {
	this.cur = cat;
	this.setMatrix();
}
LUTGamutGreen.prototype.setGreen = function(t,m) {
	this.t = t;
	this.m = m;
	this.setMatrix();
}
LUTGamutGreen.prototype.setMatrix = function() {
	var W = this.shift();
	var xyz = [	W[0]*this.SG3C[this.cur][0],W[0]*this.SG3C[this.cur][1],W[0]*this.SG3C[this.cur][2],
				W[1]*this.SG3C[this.cur][3],W[1]*this.SG3C[this.cur][4],W[1]*this.SG3C[this.cur][5],
				W[2]*this.SG3C[this.cur][6],W[2]*this.SG3C[this.cur][7],W[2]*this.SG3C[this.cur][8] ];
	this.net = new Float64Array([
				(this.SG3CI[this.cur][0]*xyz[0])+(this.SG3CI[this.cur][1]*xyz[3])+(this.SG3CI[this.cur][2]*xyz[6]), (this.SG3CI[this.cur][0]*xyz[1])+(this.SG3CI[this.cur][1]*xyz[4])+(this.SG3CI[this.cur][2]*xyz[7]), (this.SG3CI[this.cur][0]*xyz[2])+(this.SG3CI[this.cur][1]*xyz[5])+(this.SG3CI[this.cur][2]*xyz[8]),
				(this.SG3CI[this.cur][3]*xyz[0])+(this.SG3CI[this.cur][4]*xyz[3])+(this.SG3CI[this.cur][5]*xyz[6]), (this.SG3CI[this.cur][3]*xyz[1])+(this.SG3CI[this.cur][4]*xyz[4])+(this.SG3CI[this.cur][5]*xyz[7]), (this.SG3CI[this.cur][3]*xyz[2])+(this.SG3CI[this.cur][4]*xyz[5])+(this.SG3CI[this.cur][5]*xyz[8]),
				(this.SG3CI[this.cur][6]*xyz[0])+(this.SG3CI[this.cur][7]*xyz[3])+(this.SG3CI[this.cur][8]*xyz[6]), (this.SG3CI[this.cur][6]*xyz[1])+(this.SG3CI[this.cur][7]*xyz[4])+(this.SG3CI[this.cur][8]*xyz[7]), (this.SG3CI[this.cur][6]*xyz[2])+(this.SG3CI[this.cur][7]*xyz[5])+(this.SG3CI[this.cur][8]*xyz[8])
	]);
}
LUTGamutGreen.prototype.shift = function() {
	var T = (parseFloat(this.t)-1800)/19200;
	var xyz = this.loci.lumaRGBCub(T);
	var xyz1 = this.loci.lumaRGBCub(T-0.00005);
	var xyz2 = this.loci.lumaRGBCub(T+0.00005);
	var dydx = (xyz2[1]-xyz1[1])/(xyz2[0]-xyz1[0]);
	var d = -dydx;
	var x = -this.m * 0.041048757* Math.pow(1/(1+(d*d)),0.5);
	var y = x*d;
	x += xyz[0];
	y += xyz[1];
 // self.postMessage({msg:true,details:'d - ' + d});
	var w1 = this.w([x/y,1,((1-x)/y)-1]);
	var w2 = this.w([xyz[0]/xyz[1],1,((1-xyz[0])/xyz[1])-1]);
	var out = [w1[0]/w2[0],w1[1]/w2[1],w1[2]/w2[2]];
	return out;
}
LUTGamutGreen.prototype.w = function(rgb) {
// rgb is the XYZ vector transformed by matrix M 
	return [(this.M[this.cur][0]*rgb[0])+(this.M[this.cur][1]*rgb[1])+(this.M[this.cur][2]*rgb[2]),
			(this.M[this.cur][3]*rgb[0])+(this.M[this.cur][4]*rgb[1])+(this.M[this.cur][5]*rgb[2]),
			(this.M[this.cur][6]*rgb[0])+(this.M[this.cur][7]*rgb[1])+(this.M[this.cur][8]*rgb[2])];
}
LUTGamutGreen.prototype.calc = function(rgb) {
	return [(this.net[0]*rgb[0])+(this.net[1]*rgb[1])+(this.net[2]*rgb[2]),
			(this.net[3]*rgb[0])+(this.net[4]*rgb[1])+(this.net[5]*rgb[2]),
			(this.net[6]*rgb[0])+(this.net[7]*rgb[1])+(this.net[8]*rgb[2])];
}

function LUTGamutMatrix(name,params) {
	this.name = name;
	this.matrix = params;
}
LUTGamutMatrix.prototype.calc = function(rgb) {
	return [(this.matrix[0]*rgb[0])+(this.matrix[1]*rgb[1])+(this.matrix[2]*rgb[2]),
			(this.matrix[3]*rgb[0])+(this.matrix[4]*rgb[1])+(this.matrix[5]*rgb[2]),
			(this.matrix[6]*rgb[0])+(this.matrix[7]*rgb[1])+(this.matrix[8]*rgb[2])];
}
LUTGamutMatrix.prototype.fast = function(rgb) {
	return [(this.matrix[0]*rgb[0])+(this.matrix[1]*rgb[1])+(this.matrix[2]*rgb[2]),
			(this.matrix[3]*rgb[0])+(this.matrix[4]*rgb[1])+(this.matrix[5]*rgb[2]),
			(this.matrix[6]*rgb[0])+(this.matrix[7]*rgb[1])+(this.matrix[8]*rgb[2])];
}
function LUTGamutLUT(name,params) {
	this.name = name;
	this.lut = new LUTs();
	var xhr = new XMLHttpRequest();
	xhr.open('GET', params.filename, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = (function(lut) {
		var lut = lut;
		return function(e) {
			var lutBuf = this.response;
  			if (!lut.le) { // files are little endian, swap if system is big endian
self.postMessage({msg:true,details:'Gamut LUTs: Big Endian System'});
  				var lutArr = new Uint8Array(lutBuf);
  				var max = Math.round(lutArr.length / 4); // Float32s === 4 bytes
  				var i,b0,b1,b2,b3;
  				for (var j=0; j<max; j++) {
  					i = j*4;
  					b0=lutArr[ i ];
  					b1=lutArr[i+1];
  					b2=lutArr[i+2];
  					b3=lutArr[i+3];
  					lutArr[ i ] = b3;
  					lutArr[i+1] = b2;
  					lutArr[i+2] = b1;
  					lutArr[i+3] = b0;
  				}
  			}
  			var in32 = new Int32Array(lutBuf);
  			var tfS = in32[0];
	  		var dim = in32[1];
 			var csS = dim*dim*dim;
// Internal processing is Float64, files are scaled Int32
 			var C = [	new Float64Array(csS),
 						new Float64Array(csS),
 						new Float64Array(csS) ];
 			for (var j=0; j<csS; j++){
 				C[0][j] = parseFloat(in32[((2+tfS)) + j])/1073741824;
 				C[1][j] = parseFloat(in32[((2+tfS+csS)) + j])/1073741824;
 				C[2][j] = parseFloat(in32[((2+tfS+(2*csS))) + j])/1073741824;
 			}
  			lut.lut.setDetails({
				title: lut.name,
				format: lut.format,
				dims: 3,
				s: dim,
				min: lut.min,
				max: lut.max,
				C: [	C[0].buffer,
 						C[1].buffer,
 						C[2].buffer ]
			});
		};
	})({
		name: name,
		lut: this.lut,
		format: params.format,
		min: params.min,
		max: params.max,
		le: params.le
	});
	xhr.send();
//	this.lut.setInfo(name, params.format, 3, params.size, params.min, params.max);
//	this.lut.addLUT(params.lut[0],params.lut[1],params.lut[2]);
}
LUTGamutLUT.prototype.calc = function(rgb) {
	var input = [];
	for (var i = 0; i < 3; i++) {
		if (rgb[i] >= 0.0125) {
			input[i] = (0.2556207230 * Math.log((rgb[i] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			input[i] = (rgb[i] + 0.0155818840)/0.1677922920;
		}
	}
	var output = this.lut.rgbRGBCub(input);
	for (var i = 0; i < 3; i++) {
		if (output[i] >= 0.1673609920) {
			output[i] = (Math.pow(10,(output[i] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			output[i] = (0.1677922920 * output[i]) - 0.0155818840;
		}
	}
	return output;
}
LUTGamutLUT.prototype.fast = function(rgb) {
	var input = [];
	for (var i = 0; i < 3; i++) {
		if (rgb[i] >= 0.0125) {
			input[i] = (0.2556207230 * Math.log((rgb[i] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			input[i] = (rgb[i] + 0.0155818840)/0.1677922920;
		}
	}
	var output = this.lut.rgbRGBLin(input);
	for (var i = 0; i < 3; i++) {
		if (output[i] >= 0.1673609920) {
			output[i] = (Math.pow(10,(output[i] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			output[i] = (0.1677922920 * output[i]) - 0.0155818840;
		}
	}
	return output;
}
function LUTGamutLA(name) {
	this.name = name;
}
LUTGamutLA.prototype.setLUT = function(lut) {
	this.lut = new LUTs();
	this.lut.setDetails(lut);
}
LUTGamutLA.prototype.setTitle = function(name) {
	this.name = name;
}
LUTGamutLA.prototype.calc = function(rgb) {
	var input = [];
	for (var i = 0; i < 3; i++) {
		if (rgb[i] >= 0.0125) {
			input[i] = (0.2556207230 * Math.log((rgb[i] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			input[i] = (rgb[i] + 0.0155818840)/0.1677922920;
		}
	}
	var output = this.lut.rgbRGBCub(input);
	for (var i = 0; i < 3; i++) {
		if (output[i] >= 0.1673609920) {
			output[i] = (Math.pow(10,(output[i] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			output[i] = (0.1677922920 * output[i]) - 0.0155818840;
		}
	}
	return output;
}
LUTGamutLA.prototype.fast = function(rgb) {
	var input = [];
	for (var i = 0; i < 3; i++) {
		if (rgb[i] >= 0.0125) {
			input[i] = (0.2556207230 * Math.log((rgb[i] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			input[i] = (rgb[i] + 0.0155818840)/0.1677922920;
		}
	}
	var output = this.lut.rgbRGBLin(input);
	for (var i = 0; i < 3; i++) {
		if (output[i] >= 0.1673609920) {
			output[i] = (Math.pow(10,(output[i] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			output[i] = (0.1677922920 * output[i]) - 0.0155818840;
		}
	}
	return output;
}
function LUTGamutCanonIDT(name, params) {
	this.name = name;
	this.day = true;
	if (typeof params.day !== 'undefined') {
		this.day = params.day;
	}
	this.setParams();
}
LUTGamutCanonIDT.prototype.setParams = function() {
	if (this.day) {
		this.cR = new Float64Array([
					 1.08190037262167000,-0.1802987013687820, 0.09839832874710690,
					 1.94585453645180000,-0.5095399369373750,-0.47489567735516000,
					-0.77808675219706800,-0.7412266070049000, 0.55789443704270100,
					-3.27787395719078000, 0.2548784176387170, 3.45581530576474000,
					 0.33547171397473900,-0.4335212547847600,-1.65050137344141000, 1.46581418175682,
					 0.94464656660567600,-0.7236530991558810,-0.37107650116785700]);
		this.cG = new Float64Array([
					-0.00858997792576314, 1.0067374011962100, 0.00185257672955608,
					 0.08487361382964520, 0.3476269064489020, 0.00202302744639390,
					-0.07905084140915240,-0.1794975829587160,-0.17597512335707200,
					 2.30205579706951000,-0.6272576133852190,-2.90795250918851000,
					 1.37002437502321000,-0.1086681585655630,-2.21150552827555000, 1.53315057595445,
					-0.54318870669950500, 1.6379303849037600,-0.44458861683658700]);
		this.cB = new Float64Array([
					 0.12696639806511000,-0.0118914411278690, 0.88492504306275900,
					 1.34780279822258000, 1.0364735225736500, 0.45911328995592200,
					-0.87815742229526800,-1.3066278750436000,-0.65860431341328300,
					-1.44440779967030000, 0.5566765887851730, 2.18798497054968000,
					-1.43030768398665000,-0.0388323570817641, 2.63698573112453000,-1.66598882056039,
					 0.33450249360103000,-1.6585693073090100, 0.52195618454768500]);
		this.aR = [ 0.823223367723, 0.260915231496,-0.084138599391];
		this.aG = [ 0.096394889772, 0.852946788690, 0.050658321584];
		this.aB = [ 0.106008725778, 0.034764063926, 0.859227210333];
	} else {
		this.cR = new Float64Array([
					 0.9638030044548990,-0.1607222025706550, 0.19691919811575600,
					 2.0344468563981900,-0.4426769314510210,-0.40798378153750900,
					-0.6407033231292540,-0.8602427982478480, 0.31715997796744600,
					-4.8056708010296600, 0.2711837039756700, 5.10690050495570000,
					 0.3408958169205850,-0.4869417385078620,-2.23737935753692000, 1.96647555251297,
					 1.3020405176624300,-1.0650311762855400,-0.39247302266737800]);
		this.cG = new Float64Array([
					-0.0421935892309314, 1.0484595917518300,-0.00626600252090315,
					-0.1064388968872160, 0.3629086214707810, 0.11807070047226100,
					 0.0193542539838734,-0.1560830295432670,-0.23781164949643300,
					 1.6791642058219800,-0.6328353271678970,-1.95984471387461000,
					 0.9532214645628140, 0.0599085176294623,-1.66452046236246000, 1.14041188349761,
					-0.3875526235503080, 1.1482009968551200,-0.33615394141170900]);
		this.cB = new Float64Array([
					 0.1702950331350280,-0.0682984448537245, 0.89800341171869700,
					 1.2210682199239900, 1.6019486592292500, 0.37759919113712400,
					-0.8257814284875310,-1.4459086807674900,-0.92892596103534400,
					-0.8385489974558520, 0.7580939721711600, 1.32966795243196000,
					-1.2002190566835500,-0.2548389958451290, 2.33232411639308000,-1.86381505762773,
					 0.1115760389564230,-1.1259331584976600, 0.75169318615728700]);
		this.aR = [ 0.842214480521, 0.232440308247,-0.074654788940];
		this.aG = [ 0.075529615153, 0.807108792984, 0.117361591909];
		this.aB = [ 0.094854198428,-0.036214914664, 0.941360716273];
	}
}
LUTGamutCanonIDT.prototype.clip = function(input) {
	if (input > 65535) {
		return 65535;
	} else {
		return input;
	}
}
LUTGamutCanonIDT.prototype.calc = function(rgb) {
	// Linear to C-Log ire
	var R, G, B;
	var offsetR = (10.1596*rgb[0])+1;
	if (offsetR <= 0 ) {
		offsetR = 0.00000000001;
	}
	R = (0.529136*Math.log(offsetR)/Math.LN10) + 0.0730597;
	var offsetG = (10.1596*rgb[1])+1;
	if (offsetG <= 0 ) {
		offsetG = 0.00000000001;
	}
	G = (0.529136*Math.log(offsetG)/Math.LN10) + 0.0730597;
	var offsetB = (10.1596*rgb[2])+1;
	if (offsetB <= 0 ) {
		offsetB = 0.00000000001;
	}
	B = (0.529136*Math.log(offsetB)/Math.LN10) + 0.0730597;
	var R2 = R*R;
	var G2 = G*G;
	var B2 = B*B;
	var vec = [ R,		G,		B,
				R*G,	G*B,	B*R,
				R2,		G2,		B2,
				R2*G,	R2*B,	R*G2,
				R*G*B,	R*B2,	G2*B,	G*B2,
				R*R2,	G*G2,	B*B2 ];
	// ACES conversion stage 1 (C-Log space)
	var mid = [];
	mid[0] =	(this.cR[0]  * vec[0] ) + (this.cR[1]  * vec[1] ) + (this.cR[2]  * vec[2] ) +
		  		(this.cR[3]  * vec[3] ) + (this.cR[4]  * vec[4] ) + (this.cR[5]  * vec[5] ) +
		  		(this.cR[6]  * vec[6] ) + (this.cR[7]  * vec[7] ) + (this.cR[8]  * vec[8] ) +
		  		(this.cR[9]  * vec[9] ) + (this.cR[10] * vec[10]) + (this.cR[11] * vec[11]) +
		  		(this.cR[12] * vec[12]) + (this.cR[13] * vec[13]) + (this.cR[14] * vec[14]) + (this.cR[15] * vec[15]) +
		  		(this.cR[16] * vec[16]) + (this.cR[17] * vec[17]) + (this.cR[18] * vec[18]);
	mid[1] =	(this.cG[0]  * vec[0] ) + (this.cG[1]  * vec[1] ) + (this.cG[2]  * vec[2] ) +
		  		(this.cG[3]  * vec[3] ) + (this.cG[4]  * vec[4] ) + (this.cG[5]  * vec[5] ) +
		  		(this.cG[6]  * vec[6] ) + (this.cG[7]  * vec[7] ) + (this.cG[8]  * vec[8] ) +
		  		(this.cG[9]  * vec[9] ) + (this.cG[10] * vec[10]) + (this.cG[11] * vec[11]) +
		  		(this.cG[12] * vec[12]) + (this.cG[13] * vec[13]) + (this.cG[14] * vec[14]) + (this.cG[15] * vec[15]) +
		  		(this.cG[16] * vec[16]) + (this.cG[17] * vec[17]) + (this.cG[18] * vec[18]);
	mid[2] =	(this.cB[0]  * vec[0] ) + (this.cB[1]  * vec[1] ) + (this.cB[2]  * vec[2] ) +
		  		(this.cB[3]  * vec[3] ) + (this.cB[4]  * vec[4] ) + (this.cB[5]  * vec[5] ) +
		  		(this.cB[6]  * vec[6] ) + (this.cB[7]  * vec[7] ) + (this.cB[8]  * vec[8] ) +
		  		(this.cB[9]  * vec[9] ) + (this.cB[10] * vec[10]) + (this.cB[11] * vec[11]) +
		  		(this.cB[12] * vec[12]) + (this.cB[13] * vec[13]) + (this.cB[14] * vec[14]) + (this.cB[15] * vec[15]) +
		  		(this.cB[16] * vec[16]) + (this.cB[17] * vec[17]) + (this.cB[18] * vec[18]);
	// C-Log back to linear
	var lin = [];
	lin[0] = this.clip((Math.pow(10,(mid[0]-0.0730597)/0.529136)-1)/10.1596);
	lin[1] = this.clip((Math.pow(10,(mid[1]-0.0730597)/0.529136)-1)/10.1596);
	lin[2] = this.clip((Math.pow(10,(mid[2]-0.0730597)/0.529136)-1)/10.1596);
	// CP -> ACES stage 2 -> S-Gamut3.cine
	var output = [];
	output[0] = this.clip((this.aR[0] * lin[0]) + (this.aR[1] * lin[1]) + (this.aR[2] * lin[2]));
	output[1] = this.clip((this.aG[0] * lin[0]) + (this.aG[1] * lin[1]) + (this.aG[2] * lin[2]));
	output[2] = this.clip((this.aB[0] * lin[0]) + (this.aB[1] * lin[1]) + (this.aB[2] * lin[2]));
	return output;
}
LUTGamutCanonIDT.prototype.fast = function(rgb) {
	return this.calc(rgb);
}
// Web worker code
function sendMessage(d) {
	if (gamuts.isTrans && typeof d.to !== 'undefined') {
		var max = d.to.length;
		var objArray = [];
		for (var j=0; j < max; j++) {
			objArray.push(d[d.to[j]]);
		}
		postMessage(d,objArray);
	} else {
		postMessage(d);
	}
}
importScripts('lut.js');
var gamuts = new LUTGamut();
var trans = false;
this.addEventListener('message', function(e) {
	var d = e.data;
	if (typeof d.t === 'undefined') {
	} else if (d.t !== 0 && d.t < 20 && d.v !== gamuts.ver) {
		this.postMessage({p: d.p, t: d.t, v: d.v, resend: true, d: d.d});
	} else {
		switch (d.t) {
			case 0:	sendMessage(gamuts.setParams(d.d));
					break;
			case 1: sendMessage(gamuts.calc(d.p,d.t,d.d)); 
					break;
			case 2: sendMessage(gamuts.laCalc(d.p,d.t,d.d)); 
					break;
			case 5: sendMessage(gamuts.getLists(d.p,d.t)); 
					break;
			case 6: sendMessage(gamuts.setLA(d.p,d.t,d.d)); 
					break;
			case 7: sendMessage(gamuts.setLATitle(d.p,d.t,d.d)); 
					break;
			case 10:sendMessage(gamuts.ioNames(d.p,d.t));
					break;
			case 11:sendMessage(gamuts.getCATs(d.p,d.t));
					break;
			case 12:sendMessage(gamuts.preview(d.p,d.t,d.d)); 
					break;
			case 14:sendMessage(gamuts.previewLin(d.p,d.t,d.d));
					break;
			case 15:sendMessage(gamuts.getPrimaries(d.p,d.t));
					break;
		}
	}
}.bind(this), false);
