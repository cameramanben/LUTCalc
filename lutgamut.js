/* lutgamut.js
* Colour Space (gamut) conversion object for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
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
	this.inGamuts.push(new LUTGamutCanonIDT('Canon CP IDT (Daylight)',{ camera: 0, day: true }));
	this.inGamuts.push(new LUTGamutCanonIDT('Canon CP IDT (Tungsten)',{ camera: 0, day: false }));
	this.inGamuts.push(new LUTGamutMatrix('Panasonic V-Gamut',[[1.3316572111,-0.1875611006,-0.1440961107],[-0.0280131243,0.9887375645,0.0392755599],[0.0125574527,-0.0050679052,0.9925104526]]));
	this.inGamuts.push(new LUTGamutMatrix('Canon Cinema Gamut',[[1.187002652,-0.168132631,-0.018870191],[0.009561993,1.002334649,-0.01189741],[0.024939851,-0.186414783,1.161474861]]));
	this.inGamuts.push(new LUTGamutMatrix('Passthrough',[[1,0,0],[0,1,0],[0,0,1]]));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut3.cine',[[1,0,0],[0,1,0],[0,0,1]]));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut3',[[0.8556915182,0.1624073699,-0.0180988882],[-0.0229408919,1.0671513074,-0.0442104155],[-0.0216418068,-0.0283288236,1.0499706304]]));
	this.outGamuts.push(new LUTGamutMatrix('S-Gamut',[[0.8556915182,0.1624073699,-0.0180988882],[-0.0229408919,1.0671513074,-0.0442104155],[-0.0216418068,-0.0283288236,1.0499706304]]));
	this.outGamuts.push(new LUTGamutMatrix('Rec709',[[1.6269474097,-0.5401385389,-0.0868088709],[-0.1785155271,1.4179409275,-0.2394254003],[-0.0444361150,-0.1959199662,1.2403560812]]));
	this.outGamuts.push(new LUTGamutLUT(
		'LC709',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: this.paramsLC709Out()
		}));
	this.outGamuts.push(new LUTGamutLUT(
		'LC709A',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: this.paramsLC709AOut()
		}));
	this.outGamuts.push(new LUTGamutLUT(
		'Sony Cine+709',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: this.paramsCine709Out()
		}));
	this.outGamuts.push(new LUTGamutMatrix('Luma B&W',[[0.215006427,0.885132476,-0.100138903],[0.215006427,0.885132476,-0.100138903],[0.215006427,0.885132476,-0.100138903]]));
	this.outGamuts.push(new LUTGamutMatrix('ACES',[[0.6387886672,0.2723514337,0.0888598992],[-0.0039159061,1.0880732308,-0.0841573249],[-0.0299072021,-0.0264325799,1.0563397820]]));
	this.outGamuts.push(new LUTGamutMatrix('XYZ',[[0.5990839208,0.2489255161,0.1024464902],[0.2150758201,0.8850685017,-0.1001443219],[-0.0320658495,-0.0276583907,1.1487819910]]));
	this.outGamuts.push(new LUTGamutMatrix('Alexa Wide Gamut',[[0.974435,0.023802,0.001763],[-0.089226,1.071257,0.017968],[-0.035355,0.038226,0.997128]]));
	this.outGamuts.push(new LUTGamutLUT(
		'Canon CP Lock (Daylight)',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: this.paramsCPDaylightOut()
		}));
	this.outGamuts.push(new LUTGamutLUT(
		'Canon CP Lock (Tungsten)',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: this.paramsCPTungstenOut()
		}));
	this.outGamuts.push(new LUTGamutMatrix('Canon Cinema Gamut',[[0.840981006,0.143882203,0.015137045],[-0.00825279,0.998163089,0.010090467],[-0.019382583,0.157113995,0.862268767]]));
	this.outGamuts.push(new LUTGamutMatrix('Panasonic V-Gamut',[[0.752982595,0.143370216,0.103647188],[0.021707697,1.015318836,-0.037026533],[-0.009416053,0.003370418,1.006045635]]));
	this.LA = this.outGamuts.length;
	this.outGamuts.push(new LUTGamutLA('LA'));
	this.pass = this.outGamuts.length;
	this.outGamuts.push(new LUTGamutMatrix('Passthrough',[[1,0,0],[0,1,0],[0,0,1]]));
	var max = this.inGamuts.length;
	for (var i = 0; i < max; i++) {
		this.inList.push({name: this.inGamuts[i].name,idx: i});
	}
	max = this.outGamuts.length;
	for (var i = 0; i < max; i++) {
		if (i != this.LA) {
			this.outList.push({name: this.outGamuts[i].name,idx: i});
		}
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
function LUTGamutLUT(name,params) {
	this.name = name;
	this.lut = new LUTs();
	this.lut.setInfo(name, params.format, 3, params.size, params.min, params.max);
	this.lut.addLUT(params.lut.R,params.lut.G,params.lut.B);
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
function LUTGamutLA(name) {
	this.name = name;
}
LUTGamutLA.prototype.setLUT = function(lut) {
	this.lut = lut;
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
		this.cR = [  1.08190037262167000,-0.1802987013687820, 0.09839832874710690,
					 1.94585453645180000,-0.5095399369373750,-0.47489567735516000,
					-0.77808675219706800,-0.7412266070049000, 0.55789443704270100,
					-3.27787395719078000, 0.2548784176387170, 3.45581530576474000,
					 0.33547171397473900,-0.4335212547847600,-1.65050137344141000, 1.46581418175682,
					 0.94464656660567600,-0.7236530991558810,-0.37107650116785700];
		this.cG = [	-0.00858997792576314, 1.0067374011962100, 0.00185257672955608,
					 0.08487361382964520, 0.3476269064489020, 0.00202302744639390,
					-0.07905084140915240,-0.1794975829587160,-0.17597512335707200,
					 2.30205579706951000,-0.6272576133852190,-2.90795250918851000,
					 1.37002437502321000,-0.1086681585655630,-2.21150552827555000, 1.53315057595445,
					-0.54318870669950500, 1.6379303849037600,-0.44458861683658700];
		this.cB = [	 0.12696639806511000,-0.0118914411278690, 0.88492504306275900,
					 1.34780279822258000, 1.0364735225736500, 0.45911328995592200,
					-0.87815742229526800,-1.3066278750436000,-0.65860431341328300,
					-1.44440779967030000, 0.5566765887851730, 2.18798497054968000,
					-1.43030768398665000,-0.0388323570817641, 2.63698573112453000,-1.66598882056039,
					 0.33450249360103000,-1.6585693073090100, 0.52195618454768500];
		this.aR = [ 0.823223367723, 0.260915231496,-0.084138599391];
		this.aG = [ 0.096394889772, 0.852946788690, 0.050658321584];
		this.aB = [ 0.106008725778, 0.034764063926, 0.859227210333];
	} else {
		this.cR = [	 0.9638030044548990,-0.1607222025706550, 0.19691919811575600,
					 2.0344468563981900,-0.4426769314510210,-0.40798378153750900,
					-0.6407033231292540,-0.8602427982478480, 0.31715997796744600,
					-4.8056708010296600, 0.2711837039756700, 5.10690050495570000,
					 0.3408958169205850,-0.4869417385078620,-2.23737935753692000, 1.96647555251297,
					 1.3020405176624300,-1.0650311762855400,-0.39247302266737800];
		this.cG = [ -0.0421935892309314, 1.0484595917518300,-0.00626600252090315,
					-0.1064388968872160, 0.3629086214707810, 0.11807070047226100,
					 0.0193542539838734,-0.1560830295432670,-0.23781164949643300,
					 1.6791642058219800,-0.6328353271678970,-1.95984471387461000,
					 0.9532214645628140, 0.0599085176294623,-1.66452046236246000, 1.14041188349761,
					-0.3875526235503080, 1.1482009968551200,-0.33615394141170900];
		this.cB = [	 0.1702950331350280,-0.0682984448537245, 0.89800341171869700,
					 1.2210682199239900, 1.6019486592292500, 0.37759919113712400,
					-0.8257814284875310,-1.4459086807674900,-0.92892596103534400,
					-0.8385489974558520, 0.7580939721711600, 1.32966795243196000,
					-1.2002190566835500,-0.2548389958451290, 2.33232411639308000,-1.86381505762773,
					 0.1115760389564230,-1.1259331584976600, 0.75169318615728700];
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
