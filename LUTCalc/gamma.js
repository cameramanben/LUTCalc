/* gamma.js
* Transfer functions (gamma) web worker object for the LUTCalc Web App.
* 30th December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTGamma() {
	this.nul = false;
	this.gammas = [];
	this.isTrans = false;
	this.ver = 0;
	this.curIn = 0;
	this.curOut = 0;
	this.eiMult = 1;
	this.stopShift = 0;
	this.al = 1;
	this.bl = 0;
	this.ad = 1;
	this.bd = 0;
	this.highRef = 0.9;
	this.scale = false;
	this.inL = false;
	this.outL = true;
	this.clip = false;
	this.mlut = false;
	this.linList = [];
	this.inList = [];
	this.outList = [];
	this.catList = [];
	this.doASC = false;
	this.asc = new Float64Array([
		1,1,1,	// s - Slope / Gain
		0,0,0,	// o - Offset / Lift
		1,1,1,	// p - Power / Gamma
		1		// sat - Saturation
	]);
	this.gammaList();
}
LUTGamma.prototype.gammaList = function() {
	this.SL3 = 0;
	this.gammas.push(new LUTGammaLog(
		'S-Log3', [ 0.1677922920,-0.0155818840, 0.2556207230, 4.7368421060,10.0000000000, 0.4105571850, 0.0526315790, 0.1673609920, 0.0125000000 ]));
	this.gammas.push(new LUTGammaLog(
		'S-Log2', [ 0.330000000129966,-0.0291229262672453,0.3705223107287920,0.7077625570776260,10,0.6162444730868150,0.0375840001141552,0.0879765396,0 ]));
	this.gammas.push(new LUTGammaLog(
		'S-Log', [ 0.3241960136,-0.0286107171, 0.3705223110, 1,10.0000000000, 0.6162444740, 0.0375840000, 0.0882900450, 0.000000000000001 ]));
	this.gammas.push(new LUTGammaArri(
		'LogC (Sup 3.x & 4.x)',3));
	this.gammas.push(new LUTGammaArri(
		'LogC (Sup 2.x)',2));
	this.gammas.push(new LUTGammaLog(
		'C-Log', [ 0.3734467748,-0.0467265867, 0.45310179472141, 10.1596, 10, 0.1251224801564, 1, 0.00391002619746, -0.0452664 ]));
	this.gammas.push(new LUTGammaLog(
		'Panasonic V-Log', [ 0.198412698,-0.024801587, 0.241514, 0.9, 10, 0.598206, 0.00873, 0.181, 0.009 ]));
	this.gammas.push(new LUTGammaLog(
		'Panalog', [ 0.324196014, -0.020278938, 0.434198361, 0.956463747, 10, 0.665276427, 0.040913561, 0.088290045, 0 ]));
	this.gammas.push(new LUTGammaLog(
		'Cineon', [ 0.0000000000, 0.0000000000, 0.1260649940,22.2791018600, 2.6907845340, 0.2595160220, 0.2702335160, 0.0000000000, 0 ]));
	this.rec709 = this.gammas.length;
	this.gammas.push(new LUTGammaLin(
		'Rec709', [ 1/0.45, 4.50000000, 0.09900000, 0.01800000, 0.08100000 ]));
	this.gammas.push(new LUTGammaLin(
		'Rec2020 12-bit', [ 1/0.45, 4.50000000, 0.09930000, 0.01810000, 0.08145000 ]));
	this.gammas.push(new LUTGammaLin(
		'sRGB', [ 2.40000000,12.92000000, 0.05500000, 0.00313080, 0.04015966 ]));
	this.gammas.push(new LUTGammaLin(
		'Linear', [ 1.00000000, 1.00000000, 0.00000000,999.0000000,999.0000000 ]));
	this.gammas.push(new LUTGammaLUT(
		'Rec709 (800%)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float64Array([	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11883999,
					0.12866034, 0.14015402, 0.15348694, 0.16661814, 0.18004893, 0.19509241, 0.21196180, 0.22823182, 0.24534958, 0.26438452,
					0.28434109, 0.30597769, 0.32733539, 0.35083275, 0.37726131, 0.40365049, 0.43183059, 0.46184950, 0.49470951, 0.52865390,
					0.56485880, 0.60500363, 0.64559087, 0.68000971, 0.71766200, 0.75151050, 0.78401661, 0.81486195, 0.84112764, 0.86582068,
					0.88798658, 0.90701682, 0.92138640, 0.93687713, 0.94946030, 0.95992064, 0.96842281, 0.97612828, 0.98187260, 0.98701779,
					0.99013136, 0.99295086, 0.99486435, 0.99732630, 0.99903882, 1.00259821, 1.00607800, 1.00955872, 1.01304026, 1.01652250,
					1.02000536, 1.02348875, 1.02697261, 1.03045687, 1.03394148])
		}));
	this.gammas.push(new LUTGammaLUT(
		'LC709',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float64Array(
				[ 0.0681458330432062,0.0691434801575758,0.0705829599217986,0.0724372206445259,0.0747874173998045,0.0776429161732649,0.0811920325388074,0.0855419981338221,
				  0.0909454307534702,0.0976690797726784,0.1057777820895406,0.1155958029012708,0.1266116066854350,0.1383486226503910,0.1510262218009775,0.1646815963955523,
				  0.1793847118819159,0.1951918111528836,0.2121812541317693,0.2304357320288367,0.2499984938760508,0.2709281624411535,0.2932613077270772,0.3170617964918866,
				  0.3423063612379277,0.3695615137341154,0.3971217829388074,0.4231725001074290,0.4486077701176930,0.4736812772283969,0.4984996145517106,0.5232706256325024,
				  0.5479442434314760,0.5725367356025903,0.5970569416109482,0.6215751675531770,0.6459232811886606,0.6699759671530302,0.6936750809141740,0.7170080478474583,
				  0.7397128428660801,0.7617580170455522,0.7824392672742913,0.8009083916954056,0.8175656376203322,0.8324964241259040,0.8457970340590418,0.8575570277373410,
				  0.8678819918256108,0.8768748757833822,0.8846331515440858,0.8912549486405668,0.8968412437341152,0.9014929560172531,0.9053083874291300,0.9083859090127075,
				  0.9108262326490713,0.9127307504679862,0.9141957927663734,0.9153135383675464,0.9161978338220919,0.9170093433528834,0.9176997927663735,0.9182731424731183,
				  0.9187333528836756 ]
			)
		}));
	this.gammas.push(new LUTGammaLUT(
		'LC709A',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float64Array(
				[ 0.0690751760484848,0.0728297103786901,0.0769850051182796,0.0815808343707722,0.0864978758256109,0.0915715413065494,0.0969774025141740,0.1028781916478983,
				  0.1091478390349951,0.1155131300480449,0.1225782317505376,0.1309263253436461,0.1403471537869012,0.1508689079248778,0.1623594253036168,0.1746108013986315,
				  0.1878784532660801,0.2022370183965786,0.2180209309622678,0.2356278321531769,0.2549427384062561,0.2761380900003911,0.2987492565998045,0.3224798721943793,
				  0.3469975840860214,0.3719286248248777,0.3971008726561094,0.4222027128650537,0.4472788568813294,0.4722718767181329,0.4971765759100684,0.5219774783500978,
				  0.5466479949763440,0.5711842754669599,0.5955026274948191,0.6197116512439393,0.6432306188590422,0.6651852019544967,0.6865648023053763,0.7082626223616812,
				  0.7296929317130010,0.7507956301978983,0.7708870295194525,0.7891859348525904,0.8059247656203324,0.8210325331867545,0.8346382669036169,0.8468258306587488,
				  0.8576597322080157,0.8672077039163734,0.8755439358443793,0.8827308391279569,0.8888714829059629,0.8940610364006844,0.8983856104977517,0.9019299878681326,
				  0.9047933223781036,0.9070732102109482,0.9088591070866080,0.9102383165201858,0.9113148913094820,0.9121898344043498,0.9129595988637339,0.9137217752193059,
				  0.9145739540027369 ]
			)
		}));
	this.gammas.push(new LUTGammaLUT(
		'Varicam V709',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float64Array(
				[ 0.0704087159144412,0.0749508264215621,0.0794617799217457,0.0838732626982114,0.0881097436496700,0.0923072350428986,0.0968725459117816,0.1017817230036446,
				  0.1071977397933189,0.1131605158561053,0.1199746181561136,0.1279564714951100,0.1382298606268642,0.1497419711974320,0.1625809898335268,0.1767665423389763,
				  0.1923097643611671,0.2092816197242860,0.2276642469792305,0.2473159354901496,0.2681923921822879,0.2901870119434045,0.3132785476681936,0.3374798948802260,
				  0.3625307656773711,0.3883786421623266,0.4148573549444766,0.4419200957332817,0.4693392929132202,0.4970315823888719,0.5248468676100355,0.5525785025445056,
				  0.5800871697998300,0.6072378972356606,0.6339995314083975,0.6601914119807955,0.6856712615627407,0.7092617284315107,0.7316872568847730,0.7544506617800427,
				  0.7762530880184800,0.7962884672425837,0.8146970328178510,0.8314393694706220,0.8465944116933442,0.8601602119618826,0.8720394944493698,0.8823028426167111,
				  0.8911356461564750,0.8984703840964808,0.9042049482452085,0.9086445989987296,0.9118898079356863,0.9140557501917589,0.9151841643927341,0.9160498695958156,
				  0.9166686728274339,0.9172670369957161,0.9178298118153824,0.9183922438603406,0.9189835150172793,0.9195603550971945,0.9201371910775960,0.9207140234967608,
				  0.9212908528222833 ]
			)
		}));
	this.gammas.push(new LUTGammaPQ(
		'Dolby PQ (4300%)', {Lmax: 43}));
	this.gammas.push(new LUTGammaITUProp(
		'ITU Proposal (400%)', {m: 0.12314858 }));
	this.gammas.push(new LUTGammaITUProp(
		'ITU Proposal (800%)', {m: 0.083822216783 }));
	this.gammas.push(new LUTGammaBBC283(
		'BBC WHP283 (400%)', {m: 0.139401137752}));
	this.gammas.push(new LUTGammaBBC283(
		'BBC WHP283 (800%)', {m: 0.097401889128}));
	this.gammas.push(new LUTGammaLUT(
		'Cine+709',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float64Array(
				[ 0.0954769032273705,0.0954769032273705,0.0954769032273705,0.0954769032273705,0.0959562285059629,0.0986129722666667,0.1007855288203324,0.1029588361822092,
				  0.1050407417212121,0.1074285380684262,0.1099629372543499,0.1130464363605083,0.1177288390959922,0.1240367851088954,0.1317128550772239,0.1446664451886608,
				  0.1593985946267840,0.1769490133200391,0.1979285524238514,0.2225798091347019,0.2503051930361682,0.2801856689798631,0.3139098335757576,0.3497721297235581,
				  0.3877613456508310,0.4271625989083088,0.4681812744179862,0.5088015816062559,0.5499994622256109,0.5872390699675464,0.6241285479593353,0.6586195764848485,
				  0.6911271021012708,0.7225135523745846,0.7510633629106550,0.7792410185047898,0.8018812229200390,0.8241061586361680,0.8444257556473117,0.8612752989857283,
				  0.8756776019698924,0.8878454024414468,0.8998906007616814,0.9083085358631475,0.9159943303734116,0.9179524270561095,0.9184450504086021,0.9188426483980449,
				  0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,
				  0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,0.9188660801564027,
				  0.9188660801564027 ]
			)
		}));
	this.gammas.push(new LUTGammaLUT(
		'HG8009G40 (HG7)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float64Array([	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11877663,
					0.12870269, 0.14062508, 0.15530285, 0.17128969, 0.18975506, 0.20194191, 0.21350458, 0.22559329, 0.23818850, 0.25204391,
					0.26756238, 0.28482752, 0.30274382, 0.32158673, 0.34408764, 0.36756165, 0.39199445, 0.41935688, 0.44837377, 0.47848551,
					0.51075976, 0.54570010, 0.57983824, 0.61447689, 0.65112936, 0.68499113, 0.71891859, 0.75314337, 0.78354278, 0.81326088,
					0.84125913, 0.86479608, 0.88546580, 0.90573055, 0.92384898, 0.93988492, 0.95264785, 0.96376072, 0.97334372, 0.98062241,
					0.98709762, 0.99131747, 0.99548676, 0.99936430, 1.00048119, 1.00201680, 1.00340872, 1.00480101, 1.00619362, 1.00758652,
					1.00897966, 1.01037302, 1.01176656, 1.01316027, 1.01455411])
		}));
	this.gammas.push(new LUTGammaLUT(
		'HG8009G33 (HG8)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float64Array([	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11883999,
					0.12866695, 0.14029884, 0.15310654, 0.16395771, 0.17159488, 0.17994152, 0.18962627, 0.19913671, 0.20954062, 0.22066463,
					0.23299733, 0.24700070, 0.26155893, 0.27678437, 0.29492812, 0.31421695, 0.33371713, 0.35623191, 0.38106152, 0.40679243,
					0.43514727, 0.46554389, 0.49718732, 0.52924796, 0.56498567, 0.59981238, 0.63527053, 0.67212902, 0.70738288, 0.74196788,
					0.77508835, 0.80634606, 0.83308644, 0.86097158, 0.88602416, 0.90802721, 0.92741313, 0.94399390, 0.95904874, 0.97104303,
					0.98114013, 0.98817840, 0.99432461, 0.99942929, 1.00040913, 1.00201680, 1.00340872, 1.00480101, 1.00619362, 1.00758652,
					1.00897966, 1.01037302, 1.01176656, 1.01316027, 1.01455411])
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
	this.LA = this.gammas.length;
	this.gammas.push(new LUTGammaLA(
		'LA'));
	this.gammas.push(new LUTGammaNull(
		'Null'));
	var max = this.gammas.length;
	var logList = [], linList = [], genList = [], hdrList = [];
	for (var i=0; i < max; i++) {
		this.catList[i] = this.gammas[i].cat;
		switch(this.gammas[i].cat) {
			case 0: logList.push({name: this.gammas[i].name, idx: i});
					break;
			case 1: this.linList.push({name: this.gammas[i].name + ' - ' + this.gammas[i].gamma, idx: i});
					break;
			case 2: genList.push({name: this.gammas[i].name, idx: i});
					break;
			case 5: hdrList.push({name: this.gammas[i].name, idx: i});
					break;
			default: break;
		}
	}
	this.inList = logList.slice();
	this.inList.push({name: 'Linear / Rec709', idx: 9999});
	this.inList = this.inList.concat(hdrList);
	this.outList = logList.slice();
	this.outList.push({name: 'Linear / Rec709', idx: 9999});
	this.outList = this.outList.concat(genList);
	this.outList = this.outList.concat(hdrList);
	this.outList.push({name: this.gammas[max-1].name, idx: (max-1)});
}
// I/O functions
LUTGamma.prototype.setParams = function(params) {
	var out = {	t: 20, v: this.ver , changedGamma: false};
	if (typeof params.v !== 'number') {
		out.err = true;
		out.details = 'Missing version no.';
		return out;
	}
	if (typeof params.inGamma === 'number') {
		if (params.inGamma !== 9999) {
			if (params.inGamma !== this.curIn) {
				out.changedGamma = true;
			}
			this.curIn = params.inGamma;
			out.inGamma = this.curIn;
		} else {
			if (typeof params.inLinGamma === 'number') {
				if (params.inLinGamma !== this.curIn) {
					out.changedGamma = true;
				}
				this.curIn = params.inLinGamma;
				out.inLinGamma = this.curIn;
			}
		}
	}
	var changedOut = false;
	if (typeof params.outGamma === 'number') {
		if (params.outGamma !== 9999) {
			if (params.outGamma !== this.curOut) {
				out.changedGamma = true;
				changedOut = true;
			}
			this.curOut = params.outGamma;
			out.outGamma = this.curOut;
			if (this.gammas[this.curOut].cat === 3) {
				this.nul = true;
			} else {
				this.nul = false;
			}
		} else {
			if (typeof params.outLinGamma === 'number') {
				if (params.outLinGamma !== this.curOut) {
					out.changedGamma = true;
					changedOut = true;
				}
				this.curOut = params.outLinGamma;
				out.outLinGamma = this.curOut;
				this.nul = false;
			}
		}
	}
	if (this.gammas[this.curOut].cat !== 0 && this.gammas[this.curOut].cat !== 3){
		this.scale = true;
	} else {
		this.scale = false;
	}
	if (typeof params.defGamma === 'number') {
		var max = this.gammas.length;
		for (var j = 0; j < max; j++) {
			if (defGamma == this.gammas[j].name) {
				this.curIn = j;
				break;
			}
		}
		this.eiMult = Math.pow(2,this.stopShift);
	}
	if (typeof params.newISO === 'number') {
		var max = this.gammas.length;
		for (var j = 0; j < max; j++) {
			this.gammas[j].changeISO(params.newISO);
		}
		if (typeof params.natISO === 'number' && typeof params.camType === 'number' && params.camType === 0) {
			this.eiMult = params.newISO / params.natISO;
		}
	}
	if (typeof params.stopShift === 'number') {
		this.eiMult = Math.pow(2,params.stopShift);
	}
	out.eiMult = this.eiMult;
	if (typeof params.inL === 'boolean') {
		this.inL = params.inL;
	}
	if (typeof params.outL === 'boolean') {
		this.outL = params.outL;
	}
	if (typeof params.clip === 'boolean') {
		this.clip = params.clip;
		out.clip = this.clip;
	}
	if (typeof params.mlut === 'boolean') {
		this.mlut = params.mlut;
		out.mlut = this.mlut;
	}

	this.doASC = false;
	this.doBlack = false;
	this.doHigh = false;
	this.doFC = false;
	var changedASC = false;
	if (typeof params.tweaks === 'boolean' && params.tweaks) {
		if (typeof params.doASC === 'boolean') {
			var didASC = this.doASC;
			this.doASC = params.doASC;
			if (didASC && !this.doASC) {
				changedASC = true;
			}
		}		
		if (typeof params.blackTweak === 'boolean') {
			this.doBlack = params.blackTweak;
		}
		if (typeof params.highTweak === 'boolean') {
			this.doHigh = params.highTweak;
		}
	}
	out.doASC = this.doASC;
// self.postMessage({msg:true,details:this.doFC});
	if (typeof params.ascCDL !== 'undefined') {
		var newASC = new Float64Array(params.ascCDL);
		for (var j=0; j<10; j++) {
			if (newASC[j] !== this.asc[j]) {
				this.asc = newASC;
				if (j < 9) {
					changedASC = true;
				}
				break;
			}
		}
	}
	var changedRef = false;
	if (typeof params.highRef === 'number') {
		if (this.highRef !== params.highRef) {
			changedRef = true;
		}
		this.highRef = params.highRef;
	} else {
		this.highRef = 0.9;
	}
	var blackDefault;
	var highDefault;
	if (this.doASC) {
		blackDefault = this.gammas[this.curOut].linToLegal(this.cdlLum(0));
		highDefault = this.gammas[this.curOut].linToLegal(this.cdlLum(this.highRef/0.9));
	} else {
		blackDefault = this.gammas[this.curOut].linToLegal(0);
		highDefault = this.gammas[this.curOut].linToLegal(this.highRef/0.9);
	}
	var blackMap;
	if (typeof params.blackLevel === 'number') {
		if (Math.abs(blackDefault-params.blackLevel)>0.0001 && !changedOut && !changedASC) {
			blackMap = params.blackLevel;
		} else {
			blackMap = blackDefault;
		}
	} else {
		blackMap = blackDefault;
	}
	var highMap;
	if (typeof params.highMap === 'number') {
		if (Math.abs(highDefault-params.highMap)>0.0001 && !changedOut && !changedRef && !changedASC) {
			highMap = params.highMap;
		} else {
			highMap = highDefault;
		}
	} else {
		highMap = highDefault;
	}
	out.blackDef = blackDefault;
	out.blackLevel = blackMap;
	out.highRef = this.highRef;
	out.highDef = highDefault;
	out.high709 = this.gammas[this.rec709].linToLegal(this.highRef/0.9);
	out.highMap = highMap;

	if (!this.doBlack) {
		blackMap = blackDefault;
	}
	if (!this.doHigh) {
		highMap = highDefault;
	}
	if (!this.nul && (this.doBlack || this.doHigh)) {
		this.al = (highMap - blackMap)/(highDefault - blackDefault);
		this.bl = blackMap - (blackDefault * this.al);
		this.ad = this.al;
		this.bd = ((876*(blackMap - (this.al*blackDefault))) + (64*(1- this.al)))/1023;
	} else {
		this.al = 1;
		this.bl = 0;
		this.ad = 1;
		this.bd = 0;
	}
	if (typeof params.isTrans === 'boolean') {
		this.isTrans = params.isTrans;
	}
	this.ver = params.v;
	out.v = this.ver;
	return out;
}
LUTGamma.prototype.oneDCalc = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, start: i.start, vals: i.vals, dim: i.dim};
	var s = i.start;
	var max = i.vals;
	var o = new Float64Array(max*3);
	var d = i.dim -1;
	var cMin;
	if (this.outL && !this.clip) {
		cMin = -0.06256109481916;
	} else {
		cMin = 0;
	}
	var cMax;
	if (this.clip) {
		cMax = 1;
	} else if (this.mlut) {
		if (this.outL) {
			cMax = 1.09474885844749;
		} else {
			cMax = 1;
		}
	} else {
		cMax = 65535;
	}
	if (this.nul) {
		if (this.inL) {
			if (this.outL) {
				for (var j=0; j<max; j++) {
					o[(j*3)] = Math.min(cMax,Math.max(cMin,(s+j)/d));
					o[(j*3)+1] = o[(j*3)];
					o[(j*3)+2] = o[(j*3)];
				}
			} else {
				for (var j=0; j<max; j++) {
					o[(j*3)] = Math.min(cMax,Math.max(cMin,((876*(s+j)/d)+64)/1023));
					o[(j*3)+1] = o[(j*3)];
					o[(j*3)+2] = o[(j*3)];
				}
			}
		} else {
			if (this.outL) {
				for (var j=0; j<max; j++) {
					o[(j*3)] = Math.min(cMax,Math.max(cMin,((1023*(s+j)/d)-64)/876));
					o[(j*3)+1] = o[(j*3)];
					o[(j*3)+2] = o[(j*3)];
				}
			} else {
				for (var j=0; j<max; j++) {
					o[(j*3)] = Math.min(cMax,Math.max(cMin,(s+j)/d));
					o[(j*3)+1] = o[(j*3)];
					o[(j*3)+2] = o[(j*3)];
				}
			}
		}
	} else {
		if (this.scale) {
			if (this.inL) {
				if (this.outL) {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromLegal((s+j)/d)*this.eiMult) * this.al) + this.bl));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				} else {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToData(this.gammas[this.curIn].linFromLegal((s+j)/d)*this.eiMult) * this.al) + this.bl));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				}
			} else {
				if (this.outL) {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromData((s+j)/d)*this.eiMult) * this.ad) + this.bd));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				} else {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToData(this.gammas[this.curIn].linFromData((s+j)/d)*this.eiMult) * this.ad) + this.bd));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				}
			}
		} else {
			if (this.inL) {
				if (this.outL) {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromLegal((s+j)/d)*this.eiMult)));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				} else {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToData(this.gammas[this.curIn].linFromLegal((s+j)/d)*this.eiMult)));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				}
			} else {
				if (this.outL) {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromData((s+j)/d)*this.eiMult)));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				} else {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToData(this.gammas[this.curIn].linFromData((s+j)/d)*this.eiMult)));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				}
			}
		}
	}
	out.o = o.buffer;
	out.to = ['o'];
	return out;
}
LUTGamma.prototype.SL3Val = function(p,t,i) {
	var max = i.dim;
	var o = new Float64Array(max);
	var L;
	if (i.legIn) {
		for (var j=0; j<max; j++) {
			L = j/(max-1);
			o[j] = this.gammas[i.gamma].linToLegal(this.gammas[this.SL3].linFromData(L));
		}
	} else {
		for (var j=0; j<max; j++) {
			L = j/(max-1);
			o[j] = this.gammas[i.gamma].linToData(this.gammas[this.SL3].linFromData(L));
		}
	}
	var out = { p: p, t: t+20, v: this.ver, o: o.buffer};
	out.dim = i.dim;
	out.legIn = i.legIn;
	out.gamma = i.gamma;
	out.to = ['o'];
	return out;
}
LUTGamma.prototype.laCalcRGB = function(p,t,i) {
	var dim = i.dim;
	var d = dim -1;
	var max = dim*dim*dim*3;
	var o = new Float64Array(max);
	var j=0;
	for (var B=0; B<dim; B++) {
		for (var G=0; G<dim; G++) {
			for (var R=0; R<dim; R++) {
				o[ j ] = this.gammas[this.SL3].linFromData(R/d);
				o[j+1] = this.gammas[this.SL3].linFromData(G/d);
				o[j+2] = this.gammas[this.SL3].linFromData(B/d);
				j += 3;
			}
		}
	}
	var out = { p: p, t: t+20, v: this.ver };
	out.dim = i.dim;
	out.legIn = i.legIn;
	out.gamma = i.gamma;
	out.gamut = i.gamut;
	out.o = o.buffer;
	out.to = ['o'];
	return out;
}
LUTGamma.prototype.laCalcInput = function(p,t,i) {
	var max = i.dim;
	var o = new Float64Array(i.o);
	var max = o.length;
 self.postMessage({msg:true,details:'input gamma'+i.gamma});
	if (i.legIn) {
		for (var j=0; j<max; j++) {
			o[j] = this.gammas[i.gamma].linToLegal(o[j]);
		}
	} else {
		for (var j=0; j<max; j++) {
			o[j] = this.gammas[i.gamma].linToData(o[j]);
		}
	}
	var out = { p: p, t: t+20, v: this.ver};
	out.dim = i.dim;
	out.legIn = i.legIn;
	out.gamma = i.gamma;
	out.o = o.buffer;
	out.to = ['o'];
	return out;
}
LUTGamma.prototype.inCalcRGB = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, R:i.R, G:i.G, B:i.B, vals: i.vals, dim: i.dim, eiMult: this.eiMult};
	var B = i.B;
	var max = i.dim;
	var o = new Float64Array(i.vals*3);
	var d = i.dim -1;
	if (this.nul) {
		if (this.inL) {
			if (this.outL) {
				for (var G=0; G<max; G++) {
					for (var R=0; R<max; R++) {
						var j = (R+(G*max))*3;
						o[(j*3)] = R/d;
						o[(j*3)+1] = G/d;
						o[(j*3)+2] = B/d;
					}
				}
			} else {
				for (var G=0; G<max; G++) {
					for (var R=0; R<max; R++) {
						var j = (R+(G*max))*3;
						o[ j ] = ((876*R/d)+64)/1023;
						o[j+1] = ((876*G/d)+64)/1023;
						o[j+2] = ((876*B/d)+64)/1023;
					}
				}
			}
		} else {
			if (this.outL) {
				for (var G=0; G<max; G++) {
					for (var R=0; R<max; R++) {
						var j = (R+(G*max))*3;
						o[ j ] = ((1023*R/d)-64)/876;
						o[j+1] = ((1023*G/d)-64)/876;
						o[j+2] = ((1023*B/d)-64)/876;
					}
				}
			} else {
				for (var G=0; G<max; G++) {
					for (var R=0; R<max; R++) {
						var j = (R+(G*max))*3;
						o[ j ] = R/d;
						o[j+1] = G/d;
						o[j+2] = B/d;
					}
				}
			}
		}
	} else {
		if (this.inL) {
			for (var G=0; G<max; G++) {
				for (var R=0; R<max; R++) {
					var j = (R+(G*max))*3;
					o[ j ] = this.gammas[this.curIn].linFromLegal(R/d);
					o[j+1] = this.gammas[this.curIn].linFromLegal(G/d);
					o[j+2] = this.gammas[this.curIn].linFromLegal(B/d);
				}
			}
		} else {
			for (var G=0; G<max; G++) {
				for (var R=0; R<max; R++) {
					var j = (R+(G*max))*3;
					o[ j ] = this.gammas[this.curIn].linFromData(R/d);
					o[j+1] = this.gammas[this.curIn].linFromData(G/d);
					o[j+2] = this.gammas[this.curIn].linFromData(B/d);
				}
			}
		}
	}
	out.o = o.buffer;
	out.to = ['o'];
	return out;
}
LUTGamma.prototype.outCalcRGB = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, R:i.R, G:i.G, B:i.B, vals: i.vals, dim: i.dim };
	var o = new Float64Array(i.o);
	var cMin;
	if (this.outL && !this.clip && !this.mlut) {
		cMin = -0.06256109481916;
	} else {
		cMin = 0;
	}
	var cMax;
	if (this.clip) {
		cMax = 1;
	} else if (this.mlut) {
		if (this.outL) {
			cMax = 1.09474885844749;
		} else {
			cMax = 1;
		}
	} else {
		cMax = 65535;
	}
	var max = o.length;
	if (this.nul) {
		for (var j=0; j<max; j++) {
			o[j] = Math.min(cMax,Math.max(cMin,o[j]));
		}
	} else {
		var fc
		if (i.doFC) {
			fc = new Uint8Array(i.fc);
		}
		if (this.scale) {
			if (this.outL) {
				for (var j=0; j<max; j += 3) {
					o[ j ] = (this.gammas[this.curOut].linToLegal(o[ j ])*this.al)+this.bl;
					o[j+1] = (this.gammas[this.curOut].linToLegal(o[j+1])*this.al)+this.bl;
					o[j+2] = (this.gammas[this.curOut].linToLegal(o[j+2])*this.al)+this.bl;
					if (i.doFC) {
						switch(fc[Math.round(j/3)]) {
							case 0: o[ j ] = 0.75;	o[j+1] = 0;		o[j+2] = 0.75;	// Purple
									break;
							case 1: o[ j ] = 0;		o[j+1] = 0;		o[j+2] = 0.75;	// Blue
									break;
							case 3: o[ j ] = 0;		o[j+1] = 0.75;	o[j+2] = 0;		// Green
									break;
							case 5: o[ j ] = 0.9;	o[j+1] = 0.7;	o[j+2] = 0.7;	// Pink
									break;
							case 7: o[ j ] = 0.9;	o[j+1] = 0.45;	o[j+2] = 0;		// Orange
									break;
							case 9: o[ j ] = 0.75;	o[j+1] = 0.75;	o[j+2] = 0;		// Yellow
									break;
							case 10: o[ j ] = 0.75;	o[j+1] = 0;		o[j+2] = 0;		// Red
									break;
						}
					}
					o[ j ] = Math.min(cMax,Math.max(cMin,o[ j ]));
					o[j+1] = Math.min(cMax,Math.max(cMin,o[j+1]));
					o[j+2] = Math.min(cMax,Math.max(cMin,o[j+2]));
				}
			} else {
				for (var j=0; j<max; j += 3) {
					o[ j ] = (this.gammas[this.curOut].linToData(o[ j ])*this.ad)+this.bd;
					o[j+1] = (this.gammas[this.curOut].linToData(o[j+1])*this.ad)+this.bd;
					o[j+2] = (this.gammas[this.curOut].linToData(o[j+2])*this.ad)+this.bd;
					if (i.doFC) {
						switch(fc[Math.round(j/3)]) {
							case 0: o[ j ] = 0.7048; o[j+1] = 0.0626; o[j+2] = 0.7048;	// Purple
									break;
							case 1: o[ j ] = 0.0626; o[j+1] = 0.0626; o[j+2] = 0.7048;	// Blue
									break;
							case 3: o[ j ] = 0.0626; o[j+1] = 0.7048; o[j+2] = 0.0626;	// Green
									break;
							case 5: o[ j ] = 0.8330; o[j+1] = 0.6620; o[j+2] = 0.6620;	// Pink
									break;
							case 7: o[ j ] = 0.8330; o[j+1] = 0.4480; o[j+2] = 0.0626;	// Orange
									break;
							case 9: o[ j ] = 0.7048; o[j+1] = 0.7048; o[j+2] = 0.0626;	// Yellow
									break;
							case 10: o[ j ] = 0.7048;o[j+1] = 0.0626; o[j+2] = 0.0626;	// Red
									break;
						}
					}
					o[ j ] = Math.min(cMax,Math.max(cMin,o[ j ]));
					o[j+1] = Math.min(cMax,Math.max(cMin,o[j+1]));
					o[j+2] = Math.min(cMax,Math.max(cMin,o[j+2]));
				}
			}
		} else {
			if (this.outL) {
				for (var j=0; j<max; j += 3) {
					o[ j ] = this.gammas[this.curOut].linToLegal(o[ j ]);
					o[j+1] = this.gammas[this.curOut].linToLegal(o[j+1]);
					o[j+2] = this.gammas[this.curOut].linToLegal(o[j+2]);
					if (i.doFC) {
						switch(fc[Math.round(j/3)]) {
							case 0: o[ j ] = 0.75;	o[j+1] = 0;		o[j+2] = 0.75;	// Purple
									break;
							case 1: o[ j ] = 0;		o[j+1] = 0;		o[j+2] = 0.75;	// Blue
									break;
							case 3: o[ j ] = 0;		o[j+1] = 0.75;	o[j+2] = 0;		// Green
									break;
							case 5: o[ j ] = 0.9;	o[j+1] = 0.7;	o[j+2] = 0.7;	// Pink
									break;
							case 7: o[ j ] = 0.9;	o[j+1] = 0.45;	o[j+2] = 0;		// Orange
									break;
							case 9: o[ j ] = 0.75;	o[j+1] = 0.75;	o[j+2] = 0;		// Yellow
									break;
							case 10: o[ j ] = 0.75;	o[j+1] = 0;		o[j+2] = 0;		// Red
									break;
						}
					}
					o[ j ] = Math.min(cMax,Math.max(cMin,o[ j ]));
					o[j+1] = Math.min(cMax,Math.max(cMin,o[j+1]));
					o[j+2] = Math.min(cMax,Math.max(cMin,o[j+2]));
				}
			} else {
				for (var j=0; j<max; j += 3) {
					o[ j ] = this.gammas[this.curOut].linToData(o[ j ]);
					o[j+1] = this.gammas[this.curOut].linToData(o[j+1]);
					o[j+2] = this.gammas[this.curOut].linToData(o[j+2]);
					if (i.doFC) {
						switch(fc[Math.round(j/3)]) {
							case 0: o[ j ] = 0.7048; o[j+1] = 0.0626; o[j+2] = 0.7048;	// Purple
									break;
							case 1: o[ j ] = 0.0626; o[j+1] = 0.0626; o[j+2] = 0.7048;	// Blue
									break;
							case 3: o[ j ] = 0.0626; o[j+1] = 0.7048; o[j+2] = 0.0626;	// Green
									break;
							case 5: o[ j ] = 0.8330; o[j+1] = 0.6620; o[j+2] = 0.6620;	// Pink
									break;
							case 7: o[ j ] = 0.8330; o[j+1] = 0.4480; o[j+2] = 0.0626;	// Orange
									break;
							case 9: o[ j ] = 0.7048; o[j+1] = 0.7048; o[j+2] = 0.0626;	// Yellow
									break;
							case 10: o[ j ] = 0.7048;o[j+1] = 0.0626; o[j+2] = 0.0626;	// Red
									break;
						}
					}
					o[ j ] = Math.min(cMax,Math.max(cMin,o[ j ]));
					o[j+1] = Math.min(cMax,Math.max(cMin,o[j+1]));
					o[j+2] = Math.min(cMax,Math.max(cMin,o[j+2]));
				}
			}
		}
	}
	out.o = o.buffer;
	out.to = ['o'];
	return out;
}
LUTGamma.prototype.preview = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, line:i.line };
	var eiMult = 1;
	if (typeof i.eiMult === 'number') {
		eiMult = i.eiMult;
	}
	var f = new Float64Array(i.o);
	var max = Math.round(f.length/3);
	var o = new Uint8Array(max*4);
	var k=0;
	var l=0;
	if (this.nul) {
		for (var j=0; j<max; j++) {
			f[ l ] = Math.min(1.095,Math.max(-0.073,this.gammas[this.SL3].linToLegal(f[ l ])));
			f[l+1] = Math.min(1.095,Math.max(-0.073,this.gammas[this.SL3].linToLegal(f[l+1])));
			f[l+2] = Math.min(1.095,Math.max(-0.073,this.gammas[this.SL3].linToLegal(f[l+2])));
			o[ k ] = Math.min(255,Math.max(0,Math.round(f[ l ]*255)));
			o[k+1] = Math.min(255,Math.max(0,Math.round(f[l+1]*255)));
			o[k+2] = Math.min(255,Math.max(0,Math.round(f[l+2]*255)));
			o[k+3] = 255;
			k += 4;
			l += 3;
		}
	} else {
		var fc
		if (i.doFC) {
			fc = new Uint8Array(i.fc);
		}
		if (this.scale) {
			for (var j=0; j<max; j++) {
				f[ l ] = Math.min(1.095,Math.max(-0.073,(this.gammas[this.curOut].linToLegal(f[ l ]*eiMult)*this.al)+this.bl));
				f[l+1] = Math.min(1.095,Math.max(-0.073,(this.gammas[this.curOut].linToLegal(f[l+1]*eiMult)*this.al)+this.bl));
				f[l+2] = Math.min(1.095,Math.max(-0.073,(this.gammas[this.curOut].linToLegal(f[l+2]*eiMult)*this.al)+this.bl));
				if (i.doFC) {
					switch(fc[j]) {
						case 0: f[ l ] = 0.75;	f[l+1] = 0;		f[l+2] = 0.75;	// Purple
								break;
						case 1: f[ l ] = 0;		f[l+1] = 0;		f[l+2] = 0.75;	// Blue
								break;
						case 3: f[ l ] = 0;		f[l+1] = 0.75;	f[l+2] = 0;		// Green
								break;
						case 5: f[ l ] = 0.9;	f[l+1] = 0.7;	f[l+2] = 0.7;	// Pink
								break;
						case 7: f[ l ] = 0.9;	f[l+1] = 0.45;	f[l+2] = 0;		// Orange
								break;
						case 9: f[ l ] = 0.75;	f[l+1] = 0.75;	f[l+2] = 0;		// Yellow
								break;
						case 10: f[ l ] = 0.75;	f[l+1] = 0;		f[l+2] = 0;		// Red
								break;
					}
				}
				o[ k ] = Math.min(255,Math.max(0,Math.round(f[ l ]*255)));
				o[k+1] = Math.min(255,Math.max(0,Math.round(f[l+1]*255)));
				o[k+2] = Math.min(255,Math.max(0,Math.round(f[l+2]*255)));
				o[k+3] = 255;
				k += 4;
				l += 3;
			}
		} else {
			for (var j=0; j<max; j++) {
				f[ l ] = Math.min(1.095,Math.max(-0.073,this.gammas[this.curOut].linToLegal(f[ l ])*eiMult));
				f[l+1] = Math.min(1.095,Math.max(-0.073,this.gammas[this.curOut].linToLegal(f[l+1])*eiMult));
				f[l+2] = Math.min(1.095,Math.max(-0.073,this.gammas[this.curOut].linToLegal(f[l+2])*eiMult));
				if (i.doFC) {
					switch(fc[j]) {
						case 0: f[ l ] = 0.75;	f[l+1] = 0;		f[l+2] = 0.75;	// Purple
								break;
						case 1: f[ l ] = 0;		f[l+1] = 0;		f[l+2] = 0.75;	// Blue
								break;
						case 3: f[ l ] = 0;		f[l+1] = 0.75;	f[l+2] = 0;		// Green
								break;
						case 5: f[ l ] = 0.9;	f[l+1] = 0.7;	f[l+2] = 0.7;	// Pink
								break;
						case 7: f[ l ] = 0.9;	f[l+1] = 0.45;	f[l+2] = 0;		// Orange
								break;
						case 9: f[ l ] = 0.75;	f[l+1] = 0.75;	f[l+2] = 0;		// Yellow
								break;
						case 10: f[ l ] = 0.75;	f[l+1] = 0;		f[l+2] = 0;		// Red
								break;
					}
				}
				o[ k ] = Math.min(255,Math.max(0,Math.round(f[ l ]*255)));
				o[k+1] = Math.min(255,Math.max(0,Math.round(f[l+1]*255)));
				o[k+2] = Math.min(255,Math.max(0,Math.round(f[l+2]*255)));
				o[k+3] = 255;
				k += 4;
				l += 3;
			}
		}
	}
	out.o = o.buffer;
	out.f = f.buffer;
	out.to = ['o'];
	return out;
}
LUTGamma.prototype.previewLin = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, gamma: i.gamma, gamut: i.gamut, legal: i.legal, i: i.i };
	var input = new Float64Array(i.i);
	var max = input.length;
	var o = new Float64Array(max);
	if (i.legal) {
		for (var j=0; j<max; j++) {
			o[j] = this.gammas[i.gamma].linFromLegal(input[j]);
		}
	} else {
		for (var j=0; j<max; j++) {
			o[j] = this.gammas[i.gamma].linFromData(input[j]);
		}
	}
	out.o = o.buffer;
	out.to = ['i','o'];
	return out;
}
LUTGamma.prototype.getLists = function(p,t) {
	return {
		p: p,
		t: t+20,
		v: this.ver,
		inList: this.inList,
		outList: this.outList,
		linList: this.linList,
		catList: this.catList,
		rec709: this.rec709,
		LA: this.LA
	};
}
LUTGamma.prototype.setLA = function(p,t,i) {
	this.gammas[this.LA].setLUT(i);
	return { p: p, t:t+20, v: this.ver, i: i.title };
}
LUTGamma.prototype.setLATitle = function(p,t,i) {
	this.gammas[this.LA].setTitle(i);
	return { p: p, t:t+20, v: this.ver, i: i };
}
LUTGamma.prototype.ioNames = function(p,t) {
	var out = {};
	out.inName = this.gammas[this.curIn].name;
	out.outName = this.gammas[this.curOut].name;
	if (this.gammas[this.curIn].cat === 1) {
		out.inG = this.gammas[this.curIn].gamma;
	}
	if (this.gammas[this.curOut].cat === 1) {
		out.outG = this.gammas[this.curOut].gamma;
	}
	return {p: p, t: t+20, v: this.ver, o: out};
}
LUTGamma.prototype.chartVals = function(p,t,i) {
	var out = {p: p, t: t+20, v: this.ver, refX: i.refX, stopX: i.stopX, lutX: i.lutX, tableX: i.tableX};
	out.chartRefIns = [];
	out.chartRefOuts = [];
	var max = i.refX.length;
	for (var j=0; j<max; j++) {
		out.chartRefIns[j] = this.gammas[this.curIn].linToLegal(i.refX[j] / 0.9);
		if (this.nul) {
			out.chartRefOuts[j] = this.gammas[this.curIn].linToLegal(i.refX[j] / 0.9);
		} else {
			if (this.doASC) {
				var r,g,b;
				var l = i.refX[j]/0.9;
				i.refX[j] = (this.cdlLum(l))*0.9;
			}
			if (this.scale) {
				out.chartRefOuts[j] = (this.gammas[this.curOut].linToLegal(this.eiMult * i.refX[j] / 0.9) * this.al) + this.bl;
			} else {
				out.chartRefOuts[j] = this.gammas[this.curOut].linToLegal(this.eiMult * i.refX[j] / 0.9);
			}
		}
	}
	out.chartStopIns = [];
	out.chartStopOuts = [];
	max = i.stopX.length;
	for (var j=0; j<max; j++) {
		out.chartStopIns[j] = this.gammas[this.curIn].linToLegal(Math.pow(2,i.stopX[j]) / 5);
		if (this.nul) {
			out.chartStopOuts[j] = this.gammas[this.curIn].linToLegal(Math.pow(2,i.stopX[j]) / 5);
		} else {
			if (this.doASC) {
				var r,g,b;
				var l = Math.pow(2,i.stopX[j]) / 5;
				i.stopX[j] = this.cdlLum(l);
				if (this.scale) {
					out.chartStopOuts[j] = (this.gammas[this.curOut].linToLegal(this.eiMult * i.stopX[j]) * this.al) + this.bl;
				} else {
					out.chartStopOuts[j] = this.gammas[this.curOut].linToLegal(this.eiMult * i.stopX[j]);
				}
			} else {
				if (this.scale) {
					out.chartStopOuts[j] = (this.gammas[this.curOut].linToLegal(this.eiMult * Math.pow(2,i.stopX[j]) / 5) * this.al) + this.bl;
				} else {
					out.chartStopOuts[j] = this.gammas[this.curOut].linToLegal(this.eiMult * Math.pow(2,i.stopX[j]) / 5);
				}
			}
		}
	}
	out.chartLutOuts = [];
	max = i.lutX.length;
	for (var j=0; j<max; j++) {
		if (this.nul) {
			out.chartLutOuts[j] = ((i.lutX[j]*1023) - 64)/876;
		} else {
			if (this.doASC) {
				var r,g,b;
				var l = ((i.lutX[j]*1023)-64)/876;
				i.lutX[j] = (((this.cdlLum(l))*876)+64)/1023;
			}
			if (this.scale) {
				out.chartLutOuts[j] = (this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromData(i.lutX[j])*this.eiMult) * this.al) + this.bl;
			} else {
				out.chartLutOuts[j] = this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromData(i.lutX[j])*this.eiMult);
			}
		}
	}
	out.tableIREVals = [];
	max = i.tableX.length;
	for (var j=0; j<max; j++) {
		if (this.nul) {
			out.tableIREVals[j] = this.gammas[this.curIn].linToLegal(i.tableX[j] / 0.9);
		} else {
			if (this.doASC) {
				var r,g,b;
				var l = i.tableX[j]/0.9;
				i.tableX[j] = this.cdlLum(l)*0.9;
			}
			if (this.scale) {
				out.tableIREVals[j] = (this.gammas[this.curOut].linToLegal(this.eiMult * i.tableX[j] / 0.9) * this.al) + this.bl;
			} else {
				out.tableIREVals[j] = this.gammas[this.curOut].linToLegal(this.eiMult * i.tableX[j] / 0.9);
			}
		}
	}	
	return out;
}
LUTGamma.prototype.getPrimaries = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver };
	var i = new Float64Array(i.o);
	var o = new Float64Array(18);
	for (var j=0; j<18; j++) {
		o[j] = this.gammas[this.curOut].linToLegal(i[j]);
	}
	out.o = o.buffer;
	return out;
}
LUTGamma.prototype.cdlLum = function(l) {
	r = (l*this.asc[0])+this.asc[3];
	r = 0.2126*Math.pow((r<0)?0:r,this.asc[6]);
	g = (l*this.asc[1])+this.asc[4];
	g = 0.7152*Math.pow((g<0)?0:g,this.asc[7]);
	b = (l*this.asc[2])+this.asc[5];
	b = 0.0722*Math.pow((b<0)?0:b,this.asc[8]);
	return ((isNaN(r)?0:r)+(isNaN(g)?0:g)+(isNaN(b)?0:b));
}
// Gamma calculation objects
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
		out = (Math.pow(10, (input - this.d) / this.c) - this.b)/(this.a*0.9);
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
function LUTGammaPQ(name,params) {
	this.name = name;
	this.params = params.nits;
	this.cat = 5;
	this.Lmax = params.Lmax;
	this.n = (2610/4096)*(1/4);
	this.m = (2523/4096)*128;
	this.c1 = (3424/4096);
	this.c2 = (2413/4096)*32;
	this.c3 = (2392/4096)*32;
	this.changeISO(800);
}
LUTGammaPQ.prototype.changeISO = function(iso) {
	this.iso = iso;
	this.L = this.Lmax;
	this.e = this.linToLegal(0);
}
LUTGammaPQ.prototype.linToData = function(input) {
	return (this.linToLegal(input) * 0.85630498533724) + 0.06256109481916;
}
LUTGammaPQ.prototype.linToLegal = function(input) {
	if (input < 0) {
		return this.e;
	} else {
		var r = Math.pow(input/this.L,this.n);
		return Math.pow((this.c1+(this.c2*r))/(1+(this.c3*r)),this.m);
	}
}
LUTGammaPQ.prototype.linFromData = function(input) {
	return this.linFromLegal((input - 0.06256109481916) / 0.85630498533724);
}
LUTGammaPQ.prototype.linFromLegal = function(input) {
	if (input <= this.e) {
		return 0;
	} else {
		var r = Math.pow(input,1/this.m);
		return this.L*Math.pow((r-this.c1)/(this.c2-(this.c3*r)),1/this.n);
	}
}
function LUTGammaITUProp(name,params) {
	this.name = name;
	this.iso = 800;
	this.cat = 5;
	this.setM(params.m);
}
LUTGammaITUProp.prototype.setM = function(m) {
	this.m = m;
	this.n = 0.45*1.09930000*Math.pow(m,0.45);
	this.r = (1.09930000*Math.pow(m,0.45)*(1-(0.45*Math.log(m)))) - 0.09930000;
	this.e = this.linToLegal(m);
}
LUTGammaITUProp.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaITUProp.prototype.linToData = function(input) {
	return (this.linToLegal(input) * 0.85630498533724) + 0.06256109481916;
}
LUTGammaITUProp.prototype.linToLegal = function(input) {
	if (input > this.m) {
		return ((this.n*Math.log(input)) + this.r);
	} else if (input >= 0.01810000) {
		return (1.09930000 * Math.pow(input,0.45)) - 0.09930000;
	} else {
		return 4.5 * input;
	}
}
LUTGammaITUProp.prototype.linFromData = function(input) {
	return this.linFromLegal((input - 0.06256109481916) / 0.85630498533724);
}
LUTGammaITUProp.prototype.linFromLegal = function(input) {
	if (input > this.e) {
		return Math.exp((input-this.r)/this.n);
	} else if (input >= 0.08145000) {
		return Math.pow((input + 0.09930000)/(1.09930000),1/0.45);		
	} else {
		return (input / 4.5);
	}
}
function LUTGammaBBC283(name,params) {
	this.name = name;
	this.iso = 800;
	this.cat = 5;
	this.setM(params.m);
	this.setS(1);
}
LUTGammaBBC283.prototype.setM = function(m) {
	this.m = m;
	this.n = Math.sqrt(m)/2
	this.r = Math.sqrt(m)*(1-Math.log(Math.sqrt(m)));
	this.e = this.linToLegal(m);
}
LUTGammaBBC283.prototype.setS = function(s) { // System Gamma
	this.s = s;
}
LUTGammaBBC283.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaBBC283.prototype.linToData = function(input) {
	return (this.linToLegal(input) * 0.85630498533724) + 0.06256109481916;
}
LUTGammaBBC283.prototype.linToLegal = function(input) {
	if (input > this.m) {
		return ((this.n*Math.log(input)) + this.r);
	} else if (input>0) {
		return Math.sqrt(input);
	} else {
		return 0;
	}
}
LUTGammaBBC283.prototype.linFromData = function(input) {
	return this.linFromLegal((input - 0.06256109481916) / 0.85630498533724);
}
LUTGammaBBC283.prototype.linFromLegal = function(input) {
	if (input >this.e) {
		return Math.exp(this.s*(input-this.r)/this.n);
	} else {
		return Math.pow(input,2*this.s);
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
function LUTGammaLUT(name,params) {
	this.name = name;
	this.lut = new LUTs();
	this.lut.setInfo(name, params.format, 1, params.size, params.min, params.max);
	this.lut.addLUT(params.lut.buffer);
	this.iso = 800;
	this.cat = 2;
}
LUTGammaLUT.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaLUT.prototype.linToData = function(input) {
	if (input >= 0.0125) {
		return this.lut.lumaLCub((0.2556207230 * Math.log((input * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850);
	} else {
		return this.lut.lumaLCub((input + 0.0155818840)/0.1677922920);
	}
}
LUTGammaLUT.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
function LUTGammaLA(name) {
	this.name = name;
	this.iso = 800;
	this.cat = 4;
}
LUTGammaLA.prototype.setLUT = function(lut) {
	this.lut = new LUTs();
	this.lut.setDetails(lut);
}
LUTGammaLA.prototype.setTitle = function(name) {
	this.name = name;
}
LUTGammaLA.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaLA.prototype.linToData = function(input) {
	if (input >= 0.0125) {
		return this.lut.lumaLCub((0.2556207230 * Math.log((input * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850);
	} else {
		return this.lut.lumaLCub((input + 0.0155818840)/0.1677922920);
	}
}
LUTGammaLA.prototype.linToLegal = function(input) {
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
// Web worker code
function sendMessage(d) {
	if (gammas.isTrans && typeof d.to !== 'undefined') {
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
var gammas = new LUTGamma();
var trans = false;
addEventListener('message', function(e) {
	var d = e.data;
	if (typeof d.t === 'undefined') {
	} else if (d.t !== 0 && d.t < 20 && d.v !== gammas.ver) {
		postMessage({p: d.p, t: d.t, v: d.v, resend: true, d: d.d});
	} else {
		switch (d.t) {
			case 0:	sendMessage(gammas.setParams(d.d));
					break;
			case 1: sendMessage(gammas.oneDCalc(d.p,d.t,d.d)); // Calculate 1D (gamma only) conversion from input to output
					break;
			case 2: sendMessage(gammas.laCalcRGB(d.p,d.t,d.d));
					break;
			case 3: sendMessage(gammas.inCalcRGB(d.p,d.t,d.d)); 
					break;
			case 4: sendMessage(gammas.outCalcRGB(d.p,d.t,d.d)); 
					break;
			case 5: sendMessage(gammas.getLists(d.p,d.t)); 
					break;
			case 6: sendMessage(gammas.setLA(d.p,d.t,d.d)); 
					break;
			case 7: sendMessage(gammas.setLATitle(d.p,d.t,d.d)); 
					break;
			case 8: sendMessage(gammas.SL3Val(d.p,d.t,d.d)); 
					break;
			case 9: sendMessage(gammas.laCalcInput(d.p,d.t,d.d)); 
					break;
			case 10:sendMessage(gammas.ioNames(d.p,d.t));
					break;
			case 11:sendMessage(gammas.chartVals(d.p,d.t,d.d));
					break;
			case 12:sendMessage(gammas.preview(d.p,d.t,d.d));
					break;
			case 14:sendMessage(gammas.previewLin(d.p,d.t,d.d));
					break;
			case 15:sendMessage(gammas.getPrimaries(d.p,d.t,d.d));
					break;
		}
	}
}, false);
