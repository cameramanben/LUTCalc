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
	this.CAT = new LUTGamutTemperature();
	this.green = new LUTGamutGreen();
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
	this.asc = new Float64Array([
		1,1,1,	// s - Slope / Gain
		0,0,0,	// o - Offset / Lift
		1,1,1,	// p - Power / Gamma
		1		// sat - Saturation
	]);
	this.initPSSTCDL();
	this.fcVals = new Float64Array([
		0.00078125,// Purple - Black Clip (18%-8 stops)
		0.002915728,// Blue - Just Above Black Clip (18%-6.1 stops)
		0.174110113,// Green - 18%-0.2 Stop
		0.229739671,// Green - 18%+0.2 stop
		0.354307008,// Pink - One Stop Over 18%-0.175 Stop
		0.451585762,// Pink - One Stop Over 18%+0.175 Stop
		0.885767519,// Orange - 90% White-0.175 Stop
		1.128964405,// Orange - 90% White+0.175 Stop
		10.39683067,// Yellow - White Clip (Sony F55,F5,FS7)-0.3 Stop
		12.36398501 // Red - White Clip (Sony F55,F5,FS7) 18%+6 stops
	]);

	this.doHG = false;
	this.doCT = false;
	this.doFL = false;
	this.doASCCDL = false;
	this.doPSSTCDL = false;
	this.doFC = false;

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
		'Canon CP IDT (Daylight)',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'cpouttungsten.labin',
			le: this.isLE
		}));
	this.outGamuts.push(new LUTGamutLUT(
		'Canon CP IDT (Tungsten)',
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
	out.to = [];
	if (typeof params.inGamut === 'number') {
		this.curIn = params.inGamut;
		out.inGamut = this.curIn;
	}
	if (typeof params.outGamut === 'number') {
		this.curOut = params.outGamut;
		out.outGamut = this.curOut;
	}

	if (typeof params.tweaks === 'boolean') {
		this.tweaks = params.tweaks;
	} else {
		this.tweaks = false;
	}
	out.twkCT = this.setCT(params);
	out.twkFL = this.setFL(params);
	out.twkASCCDL = this.setASCCDL(params);
	out.twkPSSTCDL = this.setPSSTCDL(params);
	out.twkHG = this.setHG(params);
	out.twkFC = this.setFC(params);

	if (typeof params.isTrans === 'boolean') {
		this.isTrans = params.isTrans;
	}
	this.ver = params.v;
	out.v = this.ver;
	return out;
}
LUTGamut.prototype.setCT = function(params) {
	var out = {};
	this.doCT = false;
	if (this.tweaks && typeof params.twkCT !== 'undefined') {
		var p = params.twkCT;
		if (typeof p.doCT === 'boolean' && p.doCT) {
			this.doCT = true;

			if (typeof p.CAT === 'number') {
				this.CAT.setCAT(p.CAT);
				out.CAT = params.CAT;
			}
			if (typeof p.camTemp === 'number' && typeof p.newTemp === 'number') {
				this.CAT.setTemps(p.newTemp,p.camTemp);
				out.camTemp = p.camTemp;
				out.newTemp = p.newTemp;
			}
		}
	}
	out.doCT = this.doCT;
	return out;
}
LUTGamut.prototype.setFL = function(params) {
	var out = {};
	this.doFL = false;
	if (this.tweaks && typeof params.twkFL !== 'undefined') {
		var p = params.twkFL;
		if (typeof p.doFL === 'boolean' && p.doFL) {
			this.doFL = true;

			if (typeof p.CAT === 'number') {
				this.green.setCAT(p.CAT);
				out.CAT = p.CAT;
			}
			if (typeof p.flMag === 'number' && typeof p.flTemp === 'number') {
				this.green.setGreen(p.flTemp,p.flMag);
				out.flMag = p.flMag;
				out.flTemp = p.flTemp;
			}
		}
	}
	out.doFL = this.doFL;
	return out;
}
LUTGamut.prototype.setASCCDL = function(params) {
	var out = {};
	this.doASCCDL = false;
	this.changedASCCDL = false;
	if (this.tweaks && typeof params.twkASCCDL !== 'undefined') {
		var p = params.twkASCCDL;
		if (typeof p.doASCCDL === 'boolean') {
			var didASCCDL = this.doASCCDL;
			this.doASCCDL = p.doASCCDL		
			if (didASCCDL && !this.doASCCDL) {
				this.changedASCCDL = true;
			}
		}
		if (typeof p.cdl !== 'undefined') {
			var newCDL = new Float64Array(p.cdl);
			for (var j=0; j<10; j++) {
				if (newCDL[j] !== this.asc[j]) {
					this.asc = newCDL;
					if (j < 9) {
						this.changedASCCDL = true;
					}
					break;
				}
			}
		}
	}
	out.doASCCDL = this.doASCCDL;
	return out;
}
LUTGamut.prototype.setPSSTCDL = function(params) {
	var out = {};
	this.doPSSTCDL = false;
	if (this.tweaks && typeof params.twkPSSTCDL !== 'undefined') {
		var p = params.twkPSSTCDL;
		if (typeof p.doPSSTCDL === 'boolean' && p.doPSSTCDL) {
			this.doPSSTCDL = true;		
			if (typeof p.c !== 'undefined') {
				this.psstC.setL(p.c);
			}
			if (typeof p.sat !== 'undefined') {
				this.psstSat.setL(p.sat);
			}
			if (typeof p.s !== 'undefined') {
				this.psstS.setL(p.s);
			}
			if (typeof p.o !== 'undefined') {
				this.psstO.setL(p.o);
			}
			if (typeof p.p !== 'undefined') {
				this.psstP.setL(p.p);
			}
			if (typeof p.chromaScale === 'boolean') {
				this.psstMC = p.chromaScale;
			}
			if (typeof p.lumaScale === 'boolean') {
				this.psstYC = p.lumaScale;
			}
		}
	}
	out.doPSSTCDL = this.doPSSTCDL;
	return out;
}
LUTGamut.prototype.initPSSTCDL = function() {
	this.psstMC = true;
	this.psstYC = false;
	this.psstC = new Ring();
  	this.psstC.setDetails({
		title: 'Colour',
		L: new Float64Array([
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0
		]).buffer,
		p: false,
		mod: 1
	});
	this.psstSat = new Ring();
  	this.psstSat.setDetails({
		title: 'Saturation',
		L: new Float64Array([
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1
		]).buffer,
		p: false
	});
	this.psstS = new Ring();
  	this.psstS.setDetails({
		title: 'Slope',
		L: new Float64Array([
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1
		]).buffer,
		p: false
	});
	this.psstO = new Ring();
  	this.psstO.setDetails({
		title: 'Offset',
		L: new Float64Array([
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0
		]).buffer,
		p: false
	});
	this.psstP = new Ring();
  	this.psstP.setDetails({
		title: 'Power',
		L: new Float64Array([
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1
		]).buffer,
		p: false
	});
	this.psstF = new Ring();
  	this.psstF.setDetails({
		title: 'Forward',
		L: new Float64Array([
			-0.0055680613049733, 0.0147567006859568, 0.0360169771021452, 0.0535793151307733, 0.0693203212902730, 0.0840226039284331, 0.0981237435904306, 0.1119212032110224, 0.1256547973468163,
			0.1395532125960851, 0.1532401783604684, 0.1657675172633559, 0.1775709068913177, 0.1889505001250262, 0.2001195960344167, 0.2112553615444404, 0.2225296284119030, 0.2341370761420996,
			0.2463352166687472, 0.2595247516121330, 0.2744679542490435, 0.2933226298747170, 0.3287624039244701, 0.4006899403301722, 0.4276051836096898, 0.4447257669774564, 0.4589794729871186,
			0.4717842618396581, 0.4837468755866364, 0.4952093965712169, 0.5064034638133755, 0.5175127750345129, 0.5287073445057027, 0.5401709526670702, 0.5521354485080856, 0.5649433872473982,
			0.5790664946157549, 0.5943630562521310, 0.6106992294013223, 0.6278535155401859, 0.6454346342920819, 0.6629428672584311, 0.6798980496803277, 0.6959546592769115, 0.7109387359446133,
			0.7250595197384678, 0.7388861383721239, 0.7524290718192624, 0.7656794919842305, 0.7786321731846290, 0.7912850081995813, 0.8036385234867822, 0.8156954169692322, 0.8274601335361318,
			0.8389384865889260, 0.8501373282818123, 0.8610305673915334, 0.8713278932938635, 0.8811222152662231, 0.8905607266992966, 0.8997506931596154, 0.9087763237074914, 0.9177085173613044,
			0.9266112386118773, 0.9355463557017536, 0.9445780422438698, 0.9537776636588980, 0.9632302573886129, 0.9730445071993322, 0.9833701078985294, 0.9944319386952867
		]).buffer,
		p: true
	});
	this.psstB = new Ring();
  	this.psstB.setDetails({
		title: 'Back',
		L: new Float64Array([
			0.042311434,
			0.828850698,
			1.852489293,
			2.158688535,
			3.183904084,
			3.970443351,
			4.994081951,
			6.325496742
		]).buffer,
		p: true
	});
	this.psstY = new Ring();
  	this.psstY.setDetails({
		title: 'Luma',
		L: new Float64Array([
			0.0722,
			0.2848,
			0.2126,
			0.6,
//			0.3082,
			0.9278,
			0.7152,
			0.7874,
			0.0722
		]).buffer,
		p: false
	});
	this.psstM = new Ring();
  	this.psstM.setDetails({
		title: 'CbCr Magnitude',
		L: new Float64Array([
			0.346430745,0.342962699,0.33969838,0.337347957,0.336560982,0.337917133,0.341937773,0.349106433,0.359887984,
			0.374737194,0.394086142,0.361208741,0.334229968,0.31322564,0.297800651,0.287381612,0.281345482,0.279049081,
			0.279803042,0.282820273,0.287167419,0.2780547,0.272555398,0.269216643,0.267119872,0.265609644,0.264162578,
			0.262344581,0.259835788,0.256508476,0.252538822,0.248681245,0.245993008,0.245298419,0.247291756,0.252580435,
			0.261730792,0.275291255,0.293766309,0.317502734,0.346430744,0.340484523,0.337392505,0.336559654,0.337660332,
			0.340582153,0.345407661,0.352427205,0.362187055,0.375589699,0.394086141,0.362588341,0.337932638,0.318643857,
			0.303748703,0.292615326,0.284863469,0.280318319,0.278996163,0.281119417,0.287167418,0.269072329,0.25607167,
			0.248148933,0.24525667,0.247440263,0.254900418,0.268012927,0.287301219,0.313327834,0.346430745
		]).buffer,
		p: false
	});
}
LUTGamut.prototype.setHG = function(params) {
	var out = {};
	this.doHG = false;
	this.curHG = this.curOut;
	if (this.tweaks && typeof params.twkHG !== 'undefined') {
		var p = params.twkHG;
		if (typeof p.doHG === 'boolean' && p.doHG) {
			this.doHG = true;
		}
		if (typeof p.gamut === 'number') {
			this.curHG = p.gamut;
		}

		if (typeof p.lin === 'boolean') {
			this.hgLin = p.lin;
			out.lin = this.hgLin;
		} else {
			this.doHG = false;
		}
		if (typeof p.low === 'number') {
			this.hgLowStop = p.low;
			this.hgLow = Math.pow(2,this.hgLowStop)/5;
			out.low = this.hgLowStop;
		} else {
			this.doHG = false;
		}
		if (typeof p.high === 'number') {
			this.hgHighStop = p.high;
			this.hgHigh = Math.pow(2,this.hgHighStop)/5;
			out.high = this.hgHighStop;
		} else {
			this.doHG = false;
		}
	}
	out.gamut = this.curHG;
	out.doHG = this.doHG;
	return out;
}
LUTGamut.prototype.setFC = function(params) {
	var out = {};
	this.doFC = false;
	this.fcVals[0] = -10;	// Purple - Black Clip
	this.fcVals[1] = -10;	// Blue - Just Above Black Clip (18%-6.1 stops)
	this.fcVals[2] = -10;	// Green - 18%-0.2 Stop
	this.fcVals[3] = -10;	// Green - 18%+0.2 stop
	this.fcVals[4] = -10;	// Pink - One Stop Over 18%-0.175 Stop
	this.fcVals[5] = -10;	// Pink - One Stop Over 18%+0.175 Stop
	this.fcVals[6] = -10;	// Orange - 90% White-0.175 Stop
	this.fcVals[7] = -10;	// Orange - 90% White+0.175 Stop
	this.fcVals[8] = -10;	// Yellow - White Clip (Sony F55,F5,FS7)-0.25 Stop
	this.fcVals[9] = -10;	// Red - White Clip (Sony F55,F5,FS7)
	this.doFCPurple = false;
	this.doFCYellow = false;
	this.doFCRed = false;
	if (this.tweaks && typeof params.twkFC !== 'undefined') {
		var p = params.twkFC;
		if (typeof p.doFC === 'boolean' && p.doFC) {
			this.doFC = true;

			var noFCs = true;
			if (typeof p.fcs !== 'undefined') {
				var fcs = p.fcs;
				if (fcs[0]) { 
					this.fcVals[0] = Math.pow(2,-8)*0.2; // default 8 stops below 18% gray
					this.doFCPurple = true;
					noFCs = false;
				}
				if (fcs[1]) {
					if (typeof p.blue === 'number') {
						this.fcVals[1] = Math.pow(2,-p.blue)*0.2;
					} else {
						this.fcVals[1] = Math.pow(2,-6.1)*0.2; // default 6.1 stops below 18% gray
					}
					this.fcVals[0] = Math.pow(2,-10)*0.2; // default 10 stops below 18% gray
					noFCs = false;
				}
				if (fcs[2]) {
					this.fcVals[2] = 0.174110113;
					this.fcVals[3] = 0.229739671;
					noFCs = false;
				}
				if (fcs[3]) {
					this.fcVals[4] = 0.354307008;
					this.fcVals[5] = 0.451585762;
					noFCs = false;
				}
				if (fcs[4]) {
					this.fcVals[6] = 0.885767519;
					this.fcVals[7] = 1.128964405;
					noFCs = false;
				}
				if (fcs[5]) {
					if (typeof p.yellow === 'number') {
						if (typeof p.red === 'number') {
							this.fcVals[8] = Math.pow(2,p.red-p.yellow)*0.2;
						} else {
							this.fcVals[8] = Math.pow(2,5.95-p.yellow)*0.2;
						}
					} else {
						if (typeof p.red === 'number') {
							this.fcVals[8] = Math.pow(2,p.red-0.26)*0.2; // default 0.26 stops below white clip
						} else {
							this.fcVals[8] = Math.pow(2,5.95-0.26)*0.2; // default 0.26 stops below white clip
						}
					}
					this.fcVals[9] = Math.pow(2,5.95)*0.2; // default 5.95 stops above mid gray
					this.doFCYellow = true;
					noFCs = false;
				}
				if (fcs[6]) {
					if (typeof p.red === 'number') {
						this.fcVals[9] = Math.pow(2,p.red)*0.2;
					} else {
						this.fcVals[9] = Math.pow(2,5.95)*0.2; // default 5.95 stops above mid gray
					}
					this.doFCRed = true;
					noFCs = false;
				}
				if (noFCs) {
					this.doFC = false;
				}
			} else {
				this.doFC = false;
			}
		}
	}
	out.blue = Math.log(this.fcVals[1]/0.2)/Math.log(2);
	out.yellow = Math.log(this.fcVals[8]/0.2)/Math.log(2);
	out.red = Math.log(this.fcVals[9]/0.2)/Math.log(2);
	out.doFC = this.doFC;
	return out;
}
LUTGamut.prototype.calc = function(p,t,i,g) {
	var buff = i.o;
	var o = new Float64Array(buff);
	var out = { p: p, t: t+20, v: this.ver, outGamut: this.curOut, o:buff};
	out.to = ['o'];
	if (g) {
		out.R = i.R;
		out.G = i.G;
		out.B = i.B;
		out.vals = i.vals;
		out.dim = i.dim;
	} else {
		out.line =  i.line;
		out.upd = i.upd;
		out.threeD = true;
	}
	if (!this.nul) {
		if (g) {
			this.inGamuts[this.curIn].lc(buff);
		}
		var max = o.length;
		var eiMult = i.eiMult;
		var Y;
// CineEI / Exposure Shift
		for (var j=0; j<max; j++) {
			if (isNaN(o[j])) {
				o[j] = 0;
			} else {
				o[j] *= eiMult;
			}
		}
// False Colour
		if (this.doFC) {
			var fc = new Uint8Array(max);
			out.fc = fc.buffer;
			out.to.push('fc');
			var k;
			for (var j=0; j<max; j += 3) {
				k = parseInt(j/3);
				Y = (0.215006425*o[j])+(0.885132479*o[j+1])+(-0.100138905*o[j+2]);
				for (var s=0; s<10; s++) {
					if (this.fcVals[s] !==-10 && Y <= this.fcVals[s]) {
						fc[k] = s;
						break;
					}
				}
				if (fc[k] === 0 && this.doFCRed && Y > this.fcVals[9]) {
					fc[k] = 10;
				} else if ((fc[k] === 0  && Y > this.fcVals[0]) || (fc[k] === 0 && !this.doFCPurple && Y < 0.1) || (fc[k] === 9 && !this.doFCYellow)) {
					fc[k] = 8;
				}
			}
		}
		out.doFC = this.doFC;
// Colour Temperature Shift
		if (this.doCT) {
			this.CAT.lc(buff);
		}
// Fluori Correction
		if (this.doFL) {
			this.green.lc(buff);
		}
// PSST-CDL
		if (this.doPSSTCDL) {
			var Pb,Pr;
			var m,h,f,y1,y2,m1,m2,col,sat,S,O,P,M,a;
			for (var j=0; j<max; j += 3) {
				Y = (0.215006425*o[j])+(0.885132479*o[j+1])+(-0.100138905*o[j+2]);
				Pb = (o[j+2]-Y)/2.200277811;
				Pr = (o[ j ]-Y)/1.569987151;
				m = Math.sqrt((Pb*Pb)+(Pr*Pr));
				h = Math.atan2(Pr,Pb)/(2*Math.PI); // converts coordinates to angle from x-axis. 0-deg = 0, 360-deg = 1
				if (h < 0) {
					h += 1;
				}
				f = this.psstF.lLCub(h);
				y1 = this.psstY.lLLin(f);
				m1 = this.psstM.lLLin(f);
				col = this.psstC.lLCub(f);
				sat = this.psstSat.lLCub(f);
				if (sat < 0) {
					sat = 0;
				}
				S = this.psstS.lLCub(f);
				if (S < 0) {
					S = 0;
				}
				O = this.psstO.lLCub(f);
				P = this.psstP.lLCub(f);
				if (P < 0) {
					P = 0;
				}
				f = (f+col)%1;
				if (this.psstYC) {
					y2 = this.psstY.lLLin(f);
				} else {
					y2 = y1;
				}
				if (this.psstMC) {
					m2 = this.psstM.lLLin(f);
				} else {
					m2 = m1;
				}
				M = m*sat*m2/m1;
				a = this.psstB.lLCub(f);
				if (m > 0.005) {
					Y = (Y*S/y1)+O;
					Y = Math.pow((Y<0)?0:Y,P);
					Y = (isNaN(Y)?0:Y);
					Y *= y2;
					Pb = M * Math.cos(a);
					Pr = M * Math.sin(a);
				} else {
					var Y2 = (Y*S/y1)+O;
					Y2 = Math.pow((Y2<0)?0:Y2,P);
					Y2 = (isNaN(Y2)?0:Y2);
					Y2 *= y2;
					Y =  (((0.005-m) * Y) + (m * Y2))/0.005;
					Pb = (((0.005-m) * Pb) + (m * M * Math.cos(a)))/0.005;
					Pr = (((0.005-m) * Pr) + (m * M * Math.sin(a)))/0.005;
				}
				o[ j ] = (Pr * 1.569987151) + Y;
				o[j+1] = Y-(0.381363617*Pr) + (0.248927044*Pb);
				o[j+2] = (Pb * 2.200277811) + Y;
			}
		}
// ASC-CDL
		if (this.doASCCDL) {
			for (var j=0; j<max; j += 3) {
				o[ j ] = (o[ j ]*this.asc[0])+this.asc[3];
				o[ j ] = Math.pow((o[ j ]<0)?0:o[ j ],this.asc[6]);
				o[ j ] = (isNaN(o[ j ])?0:o[ j ]);
				o[j+1] = (o[j+1]*this.asc[1])+this.asc[4];
				o[j+1] = Math.pow((o[j+1]<0)?0:o[j+1],this.asc[7]);
				o[j+1] = (isNaN(o[j+1])?0:o[j+1]);
				o[j+2] = (o[j+2]*this.asc[2])+this.asc[5];
				o[j+2] = Math.pow((o[j+2]<0)?0:o[j+2],this.asc[8]);
				o[j+2] = (isNaN(o[j+2])?0:o[j+2]);
				Y = (0.215006425*o[j])+(0.885132479*o[j+1])+(-0.100138905*o[j+2]);
				o[ j ] = Y + (this.asc[9]*(o[ j ]-Y));
				o[j+1] = Y + (this.asc[9]*(o[j+1]-Y));
				o[j+2] = Y + (this.asc[9]*(o[j+2]-Y));
			}
		}		
// Highlight Gamut
		if (this.doHG) {
			var h = new Float64Array(o);
			if (g) {
				this.outGamuts[this.curOut].lc(buff);
				this.outGamuts[this.curHG].lc(h.buffer);
			} else {
				this.outGamuts[this.curOut].lf(buff);
				this.outGamuts[this.curHG].lf(h.buffer);
			}
			var r;
			for (var j=0; j<max; j += 3) {
				Y = (0.215006425*o[j])+(0.885132479*o[j+1])+(-0.100138905*o[j+2]);
				if (Y >= this.hgHigh) {
					o[ j ] = h[j];
					o[j+1] = h[j+1];
					o[j+2] = h[j+2];
				} else if (Y > this.hgLow) {
					if (this.hgLin) {
						r = (this.hgHigh - Y)/(this.hgHigh - this.hgLow);
					} else {
						r = (this.hgHighStop - (Math.log(Y * 5)/Math.LN2))/(this.hgHighStop - this.hgLowStop);
					}
					o[ j ] = (o[ j ] * (r)) + (h[ j ] * (1-r));
					o[j+1] = (o[j+1] * (r)) + (h[j+1] * (1-r));
					o[j+2] = (o[j+2] * (r)) + (h[j+2] * (1-r));
				}
			}
		} else {
			if (g) {
				this.outGamuts[this.curOut].lc(buff);
			} else {
				this.outGamuts[this.curOut].lf(buff);
			}
		}
	}
	return out;
}
LUTGamut.prototype.previewLin = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, gamma: i.gamma, gamut: i.gamut, legal: i.legal, i: i.i, o: i.o };
	this.inGamuts[i.gamut].lc(i.o);
	out.to = ['i','o'];
	return out;
}
LUTGamut.prototype.psstColours = function(p,t) {
	var out = { p: p, t: t+20, v: this.ver };
	var bef64 = new Float64Array(84);
	var aft64 = new Float64Array(84);
	var f,a,m1,m2,M,Y,c,sat,Pb,Pr;
	var i=0;
	for (var j=0; j<84; j += 3) {
		f = i;
		i += 1/28;
		a = this.psstB.lLCub(f);
		m1 = this.psstM.lLLin(f);
		c = this.psstC.lLCub(f);
		sat = this.psstSat.lLCub(f);
		if (sat < 0) {
			sat = 0;
		}
		S = this.psstS.lLCub(f);
		if (S < 0) {
			S = 0;
		}
		O = this.psstO.lLCub(f);
		P = this.psstP.lLCub(f);
		if (P < 0) {
			P = 0;
		}
		M = 0.5 * m1;
		y1 = this.psstY.lLLin(f);
		Y = 0.7*y1;
		Pb = M * Math.cos(a);
		Pr = M * Math.sin(a);
		bef64[ j ] = (Pr * 1.569987151) + Y;
		bef64[j+1] = Y-(0.381363617*Pr) + (0.248927044*Pb);
		bef64[j+2] = (Pb * 2.200277811) + Y;
		f = (f+c%1);
		if (this.psstYC) {
			y2 = this.psstY.lLLin(f);
		} else {
			y2 = y1;
		}
		if (this.psstMC) {
			m2 = this.psstM.lLLin(f);
		} else {
			m2 = m1;
		}
		M = M * m2 * sat / m1;
		a = this.psstB.lLCub(f);
		Y = (Y*S/y1)+O;
		Y = Math.pow((Y<0)?0:Y,P);
		Y = (isNaN(Y)?0:Y);
		Y *= y2;
		Pb = M * Math.cos(a);
		Pr = M * Math.sin(a);
		aft64[ j ] = (Pr * 1.569987151) + Y;
		aft64[j+1] = Y-(0.381363617*Pr) + (0.248927044*Pb);
		aft64[j+2] = (Pb * 2.200277811) + Y;
	}
	this.outGamuts[this.curOut].lc(bef64.buffer);
	this.outGamuts[this.curOut].lc(aft64.buffer);
	out.b = bef64.buffer
	out.a = aft64.buffer
	out.to = ['b','a'];
	return out;
}
LUTGamut.prototype.laCalc = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, dim: i.dim, gamma: i.gamma, gamut: i.gamut, legIn: i.legIn, o: i.o };
	this.outGamuts[i.gamut].lc(i.o);
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
	var c = new Float64Array([
		0.5099575746064158,	0.47751324256890015,0.09369479745196567,
		0.19970117985279875,0.5142838920067684,	0.542787468791713,
		0.14604144406432912,0.428179824180783,	0.07286495584879325,
		0.4175758663305563,	0.13543748621410254,0.49075235454609223,
		0.3639161305420867,	0.04933341838811719,0.02082984160317242,
		0.05365973578846964,0.08610406782598536,0.4699225129429198
	]);
	this.outGamuts[this.curOut].lc(c.buffer);
	return {p: p, t: t+20, v: this.ver, o: c.buffer, to: ['o']};
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
	var rgb = this.loci.lRCub(T);
// rgb is the XYZ vector transformed by matrix M 
	return [(this.M[this.cur][0]*rgb[0])+(this.M[this.cur][1]*rgb[1])+(this.M[this.cur][2]*rgb[2]),
			(this.M[this.cur][3]*rgb[0])+(this.M[this.cur][4]*rgb[1])+(this.M[this.cur][5]*rgb[2]),
			(this.M[this.cur][6]*rgb[0])+(this.M[this.cur][7]*rgb[1])+(this.M[this.cur][8]*rgb[2])];
}
LUTGamutTemperature.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	for (var j=0; j<max; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (this.net[0]*r)+(this.net[1]*g)+(this.net[2]*b);
		c[j+1] = (this.net[3]*r)+(this.net[4]*g)+(this.net[5]*b);
		c[j+2] = (this.net[6]*r)+(this.net[7]*g)+(this.net[8]*b);
	}
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
	var xyz = this.loci.lRCub(T);
	var xyz1 = this.loci.lRCub(T-0.00005);
	var xyz2 = this.loci.lRCub(T+0.00005);
	var dydx = (xyz2[1]-xyz1[1])/(xyz2[0]-xyz1[0]);
	var d = -dydx;
	var x = -this.m * 0.041048757* Math.pow(1/(1+(d*d)),0.5);
	var y = x*d;
	x += xyz[0];
	y += xyz[1];
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
LUTGamutGreen.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	for (var j=0; j<max; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (this.net[0]*r)+(this.net[1]*g)+(this.net[2]*b);
		c[j+1] = (this.net[3]*r)+(this.net[4]*g)+(this.net[5]*b);
		c[j+2] = (this.net[6]*r)+(this.net[7]*g)+(this.net[8]*b);
	}
}
function LUTGamutMatrix(name,params) {
	this.name = name;
	this.matrix = params;
}
LUTGamutMatrix.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	for (var j=0; j<max; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (this.matrix[0]*r)+(this.matrix[1]*g)+(this.matrix[2]*b);
		c[j+1] = (this.matrix[3]*r)+(this.matrix[4]*g)+(this.matrix[5]*b);
		c[j+2] = (this.matrix[6]*r)+(this.matrix[7]*g)+(this.matrix[8]*b);
	}
}
LUTGamutMatrix.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	for (var j=0; j<max; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (this.matrix[0]*r)+(this.matrix[1]*g)+(this.matrix[2]*b);
		c[j+1] = (this.matrix[3]*r)+(this.matrix[4]*g)+(this.matrix[5]*b);
		c[j+2] = (this.matrix[6]*r)+(this.matrix[7]*g)+(this.matrix[8]*b);
	}
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
LUTGamutLUT.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.0125) {
			c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			c[j] = (c[j] + 0.0155818840)/0.1677922920;
		}
	}
	this.lut.rRsCub(buff);
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.1673609920) {
			c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			c[j] = (0.1677922920 * c[j]) - 0.0155818840;
		}
	}
}
LUTGamutLUT.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.0125) {
			c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			c[j] = (c[j] + 0.0155818840)/0.1677922920;
		}
	}
	this.lut.rRsLin(buff);
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.1673609920) {
			c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			c[j] = (0.1677922920 * c[j]) - 0.0155818840;
		}
	}
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
LUTGamutLA.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.0125) {
			c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			c[j] = (c[j] + 0.0155818840)/0.1677922920;
		}
	}
	this.lut.rRsCub(buff);
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.1673609920) {
			c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			c[j] = (0.1677922920 * c[j]) - 0.0155818840;
		}
	}
}
LUTGamutLA.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.0125) {
			c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			c[j] = (c[j] + 0.0155818840)/0.1677922920;
		}
	}
	this.lut.rRsLin(buff);
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.1673609920) {
			c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			c[j] = (0.1677922920 * c[j]) - 0.0155818840;
		}
	}
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
LUTGamutCanonIDT.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var R2, G2, B2;
	var off;
	var lin = new Float64Array(3);
	for (var j=0; j<m; j++) {
// Linear to C-Log ire
		off = (10.1596*c[j])+1;
		if (off <= 0 ) {
			off = 0.00000000001;
		}
		c[j] = (0.529136*Math.log(oR)/Math.LN10) + 0.0730597;
	}
	for (var j=0; j<m; j += 3) {
		R2 = c[ j ]*c[ j ];
		G2 = c[j+1]*c[j+1];
		B2 = c[j+2]*c[j+2];
		var vec = new Float64Array([
			c[ j ],					c[j+1],			c[j+2],
			c[ j ]*c[j+1],			c[j+1]*c[j+2],	c[j+2]*c[ j ],
			R2,						G2,				B2,
			R2*c[j+1],				R2*c[j+2],		c[ j ]*G2,
			c[ j ]*c[j+1]*c[j+2],	c[ j ]*B2,		G2*c[j+2],		c[j+1]*B2,
			c[ j ]*R2,				c[j+1]*G2,		c[j+2]*B2
		]);
// ACES conversion stage 1 (C-Log space)
		c[ j ] =	(this.cR[0]  * vec[0] ) + (this.cR[1]  * vec[1] ) + (this.cR[2]  * vec[2] ) +
			  		(this.cR[3]  * vec[3] ) + (this.cR[4]  * vec[4] ) + (this.cR[5]  * vec[5] ) +
			  		(this.cR[6]  * vec[6] ) + (this.cR[7]  * vec[7] ) + (this.cR[8]  * vec[8] ) +
			  		(this.cR[9]  * vec[9] ) + (this.cR[10] * vec[10]) + (this.cR[11] * vec[11]) +
			  		(this.cR[12] * vec[12]) + (this.cR[13] * vec[13]) + (this.cR[14] * vec[14]) + (this.cR[15] * vec[15]) +
			  		(this.cR[16] * vec[16]) + (this.cR[17] * vec[17]) + (this.cR[18] * vec[18]);
		c[j+1] =	(this.cG[0]  * vec[0] ) + (this.cG[1]  * vec[1] ) + (this.cG[2]  * vec[2] ) +
			  		(this.cG[3]  * vec[3] ) + (this.cG[4]  * vec[4] ) + (this.cG[5]  * vec[5] ) +
			  		(this.cG[6]  * vec[6] ) + (this.cG[7]  * vec[7] ) + (this.cG[8]  * vec[8] ) +
			  		(this.cG[9]  * vec[9] ) + (this.cG[10] * vec[10]) + (this.cG[11] * vec[11]) +
			  		(this.cG[12] * vec[12]) + (this.cG[13] * vec[13]) + (this.cG[14] * vec[14]) + (this.cG[15] * vec[15]) +
			  		(this.cG[16] * vec[16]) + (this.cG[17] * vec[17]) + (this.cG[18] * vec[18]);
		c[j+2] =	(this.cB[0]  * vec[0] ) + (this.cB[1]  * vec[1] ) + (this.cB[2]  * vec[2] ) +
			  		(this.cB[3]  * vec[3] ) + (this.cB[4]  * vec[4] ) + (this.cB[5]  * vec[5] ) +
			  		(this.cB[6]  * vec[6] ) + (this.cB[7]  * vec[7] ) + (this.cB[8]  * vec[8] ) +
			  		(this.cB[9]  * vec[9] ) + (this.cB[10] * vec[10]) + (this.cB[11] * vec[11]) +
			  		(this.cB[12] * vec[12]) + (this.cB[13] * vec[13]) + (this.cB[14] * vec[14]) + (this.cB[15] * vec[15]) +
			  		(this.cB[16] * vec[16]) + (this.cB[17] * vec[17]) + (this.cB[18] * vec[18]);
// C-Log back to linear
		lin[0] = this.clip((Math.pow(10,(c[ j ]-0.0730597)/0.529136)-1)/10.1596);
		lin[1] = this.clip((Math.pow(10,(c[j+1]-0.0730597)/0.529136)-1)/10.1596);
		lin[2] = this.clip((Math.pow(10,(c[j+2]-0.0730597)/0.529136)-1)/10.1596);
// CP -> ACES stage 2 -> S-Gamut3.cine
		c[ j ] = this.clip((this.aR[0] * lin[0]) + (this.aR[1] * lin[1]) + (this.aR[2] * lin[2]));
		c[j+1] = this.clip((this.aG[0] * lin[0]) + (this.aG[1] * lin[1]) + (this.aG[2] * lin[2]));
		c[j+2] = this.clip((this.aB[0] * lin[0]) + (this.aB[1] * lin[1]) + (this.aB[2] * lin[2]));
	}
}
LUTGamutCanonIDT.prototype.lf = function(buff) {
	this.lc(buff);
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
importScripts('lut.js','ring.js');
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
			case 1: sendMessage(gamuts.calc(d.p,d.t,d.d,true)); 
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
			case 12:sendMessage(gamuts.calc(d.p,d.t,d.d,false)); 
					break;
			case 14:sendMessage(gamuts.previewLin(d.p,d.t,d.d));
					break;
			case 15:sendMessage(gamuts.getPrimaries(d.p,d.t));
					break;
			case 16:sendMessage(gamuts.psstColours(d.p,d.t));
					break;
		}
	}
}.bind(this), false);
