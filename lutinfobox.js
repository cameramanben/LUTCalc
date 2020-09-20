/* lutinfobox.js
* LUTCalc / Gamma / Gamut information UI objects for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTInfoBox(fieldset,inputs,messages) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.messages = messages;
	this.p = 6;
	this.messages.addUI(this.p,this);
	this.build();
	fieldset.appendChild(this.box);
	lutcalcReady(this.p);
}
LUTInfoBox.prototype.build = function() {
 this.io();
 this.ui();
};
LUTInfoBox.prototype.io = function() {
	this.instructionsBut = document.createElement('input');
	this.instructionsBut.setAttribute('type','button');
	this.instructionsBut.id = 'infoinsbutton';
	this.instructionsBut.value = 'Instructions';
	this.gammaInfoBut = document.createElement('input');
	this.gammaInfoBut.setAttribute('type','button');
	this.gammaInfoBut.value = 'Tables';
	this.gammaChartBut = document.createElement('input');
	this.gammaChartBut.setAttribute('type','button');
	this.gammaChartBut.value = 'Charts';
	this.gammaPrintBut = document.createElement('input');
	this.gammaPrintBut.setAttribute('type','button');
	this.gammaPrintBut.value = 'Print Chart';
	this.gammaPrintBut.className = 'print-button';
	this.printBox = document.getElementById('printable');
	this.printTitle = document.createElement('h1');
	this.printBox.appendChild(this.printTitle);
	this.printDetails = document.createElement('p');
	this.printBox.appendChild(this.printDetails);
};
LUTInfoBox.prototype.ui = function() {
	this.instructionsBox = document.createElement('div');
	this.instructionsBox.id = 'instructions-box';
	this.instructions();
	this.instructionsBox.className = 'info-tab-hide';
	this.gammaInfoBox = document.createElement('div');
	this.gammaInfo();
	this.gammaInfoBox.className = 'info-tab-hide';
	this.gammaChartBox = document.createElement('div');
	this.gammaChart();
	this.gammaChartBox.className = 'info-tab';
	this.box.appendChild(this.instructionsBut);
	this.box.appendChild(this.gammaInfoBut);
	this.box.appendChild(this.gammaChartBut);
	this.box.appendChild(this.gammaPrintBut);
	this.box.appendChild(this.instructionsBox);
	this.box.appendChild(this.gammaInfoBox);
	this.box.appendChild(this.gammaChartBox);
	this.printChartBox = document.createElement('div');
	this.printBox.appendChild(this.printChartBox);
};
LUTInfoBox.prototype.events = function() {
	this.insMainCam.onclick = function(here){ return function(){ here.showCamInfo(); };}(this);
	this.insCamBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insMainGam.onclick = function(here){ return function(){ here.showGamInfo(); };}(this);
	this.insGamBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insMainTwk.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insMainLut.onclick = function(here){ return function(){ here.showLutInfo(); };}(this);
	this.insLutBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insMainPre.onclick = function(here){ return function(){ here.showPreInfo(); };}(this);
	this.insPreBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insMainGen.onclick = function(here){ return function(){ here.showGenInfo(); };}(this);
	this.insGenBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insMainGst.onclick = function(here){ return function(){ here.showGstInfo(); };}(this);
	this.insGstBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insMainSet.onclick = function(here){ return function(){ here.showSetInfo(); };}(this);
	this.insSetBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insMainInf.onclick = function(here){ return function(){ here.showInfInfo(); };}(this);
	this.insInfBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.creditsButton.onclick = function(here){ return function(){ here.showCdtInfo(); };}(this);
	this.insCdtBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.changelogButton.onclick = function(here){ return function(){ here.showClgInfo(); };}(this);
	this.insClgBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insCustHG.onclick = function(here){ return function(){ here.showCustHGInfo(); };}(this);
	this.custHGBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustWht.onclick = function(here){ return function(){ here.showCustWhtInfo(); };}(this);
	this.custWhtBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustColour.onclick = function(here){ return function(){ here.showCustColourInfo(); };}(this);
	this.custColourBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustKnee.onclick = function(here){ return function(){ here.showCustKneeInfo(); };}(this);
	this.custKneeBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustBhi.onclick = function(here){ return function(){ here.showCustBhiInfo(); };}(this);
	this.custBhiBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustDCC.onclick = function(here){ return function(){ here.showCustDCCInfo(); };}(this);
	this.custDCCBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustGlim.onclick = function(here){ return function(){ here.showCustGlimInfo(); };}(this);
	this.custGlimBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustSDRS.onclick = function(here){ return function(){ here.showCustSDRSInfo(); };}(this);
	this.custSDRSBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustBgm.onclick = function(here){ return function(){ here.showCustBgmInfo(); };}(this);
	this.custBgmBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustPsst.onclick = function(here){ return function(){ here.showCustPsstInfo(); };}(this);
	this.custPsstBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustASC.onclick = function(here){ return function(){ here.showCustASCInfo(); };}(this);
	this.custASCBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustMulti.onclick = function(here){ return function(){ here.showCustMultiInfo(); };}(this);
	this.custMultiBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustFC.onclick = function(here){ return function(){ here.showCustFCInfo(); };}(this);
	this.custFCBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustSamp.onclick = function(here){ return function(){ here.showCustSampInfo(); };}(this);
	this.custSampBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustLA.onclick = function(here){ return function(){ here.showCustLAInfo(); };}(this);
	this.custLABack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.instructionsBut.onclick = function(here){ return function(){
		here.instructionsOpt();
		here.messages.mobileOpt('inf');
	};}(this);
	this.chartType[0].onchange = function(here){ return function(){
		here.changeChart();
	};}(this);
	this.chartType[1].onchange = function(here){ return function(){
		here.changeChart();
	};}(this);
	this.chartType[2].onchange = function(here){ return function(){
		here.changeChart();
	};}(this);
	this.gammaInfoBut.onclick = function(here){ return function(){
		here.gammaInfoOpt();
		here.messages.mobileOpt('set');
	};}(this);
	this.gammaChartBut.onclick = function(here){ return function(){
		here.gammaChartOpt();
		here.messages.mobileOpt('set');
	};}(this);
	this.gammaPrintBut.onclick = function(here){ return function(){
		here.gammaPrint();
	};}(this);
};
// Construct the UI Box
LUTInfoBox.prototype.instructions = function() {
	this.instructionsBox.className = 'info-tab-ins';
	this.createMainscreen();
	this.instructionsBox.appendChild(this.mainscreen);
	this.createCamInfo();
	this.instructionsBox.appendChild(this.insCam);
	this.createGamInfo();
	this.instructionsBox.appendChild(this.insGam);
	this.createTwkInfo();
	this.instructionsBox.appendChild(this.insTwk);
	this.createLutInfo();
	this.instructionsBox.appendChild(this.insLut);
	this.createPreInfo();
	this.instructionsBox.appendChild(this.insPre);
	this.createGenInfo();
	this.instructionsBox.appendChild(this.insGen);
	this.createGstInfo();
	this.instructionsBox.appendChild(this.insGst);
	this.createSetInfo();
	this.instructionsBox.appendChild(this.insSet);
	this.createInfInfo();
	this.instructionsBox.appendChild(this.insInf);
	this.createCdtInfo();
	this.instructionsBox.appendChild(this.insCdt);
	this.createClgInfo();
	this.instructionsBox.appendChild(this.insClg);
	this.createCustColour();
	this.instructionsBox.appendChild(this.custColour);
	this.createCustWht();
	this.instructionsBox.appendChild(this.custWht);
	this.createCustPsst();
	this.instructionsBox.appendChild(this.custPsst);
	this.createCustASC();
	this.instructionsBox.appendChild(this.custASC);
	this.createCustMulti();
	this.instructionsBox.appendChild(this.custMulti);
	this.createCustHG();
	this.instructionsBox.appendChild(this.custHG);
	this.createCustKnee();
	this.instructionsBox.appendChild(this.custKnee);
	this.createCustBhi();
	this.instructionsBox.appendChild(this.custBhi);
	this.createCustSDRS();
	this.instructionsBox.appendChild(this.custSDRS);
	this.createCustBgm();
	this.instructionsBox.appendChild(this.custBgm);
	this.createCustDCC();
	this.instructionsBox.appendChild(this.custDCC);
	this.createCustGlim();
	this.instructionsBox.appendChild(this.custGlim);
	this.createCustFC();
	this.instructionsBox.appendChild(this.custFC);
	this.createCustSamp();
	this.instructionsBox.appendChild(this.custSamp);
	this.createCustLA();
	this.instructionsBox.appendChild(this.custLA);
};
LUTInfoBox.prototype.showMainscreen = function() {
	this.hideAll();
	this.mainscreen.className = 'info-page';
};
LUTInfoBox.prototype.showCamInfo = function() {
	this.hideAll();
	this.insCam.className = 'info-page';
};
LUTInfoBox.prototype.showGamInfo = function() {
	this.hideAll();
	this.insGam.className = 'info-page';
};
LUTInfoBox.prototype.showCustscreen = function() {
	this.hideAll();
	this.insTwk.className = 'info-page';
};
LUTInfoBox.prototype.showLutInfo = function() {
	this.hideAll();
	this.insLut.className = 'info-page';
};
LUTInfoBox.prototype.showPreInfo = function() {
	this.hideAll();
	this.insPre.className = 'info-page';
};
LUTInfoBox.prototype.showGenInfo = function() {
	this.hideAll();
	this.insGen.className = 'info-page';
};
LUTInfoBox.prototype.showGstInfo = function() {
	this.hideAll();
	this.insGst.className = 'info-page';
};
LUTInfoBox.prototype.showSetInfo = function() {
	this.hideAll();
	this.insSet.className = 'info-page';
};
LUTInfoBox.prototype.showInfInfo = function() {
	this.hideAll();
	this.insInf.className = 'info-page';
};
LUTInfoBox.prototype.showCdtInfo = function() {
	this.hideAll();
	this.insCdt.className = 'info-page';
};
LUTInfoBox.prototype.showClgInfo = function() {
	this.hideAll();
	this.insClg.className = 'info-page';
};
LUTInfoBox.prototype.showCustColourInfo = function() {
	this.hideAll();
	this.custColour.className = 'info-page';
};
LUTInfoBox.prototype.showCustWhtInfo = function() {
	this.hideAll();
	this.custWht.className = 'info-page';
};
LUTInfoBox.prototype.showCustPsstInfo = function() {
	this.hideAll();
	this.custPsst.className = 'info-page';
};
LUTInfoBox.prototype.showCustASCInfo = function() {
	this.hideAll();
	this.custASC.className = 'info-page';
};
LUTInfoBox.prototype.showCustMultiInfo = function() {
	this.hideAll();
	this.custMulti.className = 'info-page';
};
LUTInfoBox.prototype.showCustHGInfo = function() {
	this.hideAll();
	this.custHG.className = 'info-page';
};
LUTInfoBox.prototype.showCustKneeInfo = function() {
	this.hideAll();
	this.custKnee.className = 'info-page';
};
LUTInfoBox.prototype.showCustBhiInfo = function() {
	this.hideAll();
	this.custBhi.className = 'info-page';
};
LUTInfoBox.prototype.showCustSDRSInfo = function() {
	this.hideAll();
	this.custSDRS.className = 'info-page';
};
LUTInfoBox.prototype.showCustBgmInfo = function() {
	this.hideAll();
	this.custBgm.className = 'info-page';
};
LUTInfoBox.prototype.showCustDCCInfo = function() {
	this.hideAll();
	this.custDCC.className = 'info-page';
};
LUTInfoBox.prototype.showCustGlimInfo = function() {
	this.hideAll();
	this.custGlim.className = 'info-page';
};
LUTInfoBox.prototype.showCustFCInfo = function() {
	this.hideAll();
	this.custFC.className = 'info-page';
};
LUTInfoBox.prototype.showCustSampInfo = function() {
	this.hideAll();
	this.custSamp.className = 'info-page';
};
LUTInfoBox.prototype.showCustLAInfo = function() {
	this.hideAll();
	this.custLA.className = 'info-page';
};
LUTInfoBox.prototype.hideAll = function() {
	this.mainscreen.className = 'info-page-hide';
	this.insCam.className = 'info-page-hide';
	this.insGam.className = 'info-page-hide';
	this.insTwk.className = 'info-page-hide';
	this.insLut.className = 'info-page-hide';
	this.insPre.className = 'info-page-hide';
	this.insGen.className = 'info-page-hide';
	this.insGst.className = 'info-page-hide';
	this.insSet.className = 'info-page-hide';
	this.insInf.className = 'info-page-hide';
	this.insCdt.className = 'info-page-hide';
	this.insClg.className = 'info-page-hide';
	this.custColour.className = 'info-page-hide';
	this.custWht.className = 'info-page-hide';
	this.custPsst.className = 'info-page-hide';
	this.custASC.className = 'info-page-hide';
	this.custMulti.className = 'info-page-hide';
	this.custHG.className = 'info-page-hide';
	this.custKnee.className = 'info-page-hide';
	this.custBhi.className = 'info-page-hide';
	this.custSDRS.className = 'info-page-hide';
	this.custBgm.className = 'info-page-hide';
	this.custDCC.className = 'info-page-hide';
	this.custGlim.className = 'info-page-hide';
	this.custFC.className = 'info-page-hide';
	this.custSamp.className = 'info-page-hide';
	this.custLA.className = 'info-page-hide';
};
LUTInfoBox.prototype.createMainscreen = function() {
	this.mainscreen = document.createElement('div');
	this.mainscreen.id = 'ins-mainscreen';
	var click = document.createElement('p');
	click.innerHTML = 'Click an area for information:';
	this.mainscreen.appendChild(click);
	var mainBox = document.createElement('div');
	mainBox.id = 'ins-mainbox';
	this.mainscreen.appendChild(mainBox);

	var header = this.createFigure('empty','pngs/main-header.png',33.6842);
	header.id = 'ins-main-header';	
	mainBox.appendChild(header);
	var left = document.createElement('div');
	left.id = 'ins-main-left';
	mainBox.appendChild(left);
	var right = document.createElement('div');
	right.id = 'ins-main-right';
	mainBox.appendChild(right);
	var footer = this.createFigure('empty','pngs/main-footer.png',45.7143);
	footer.id = 'ins-main-footer';	
	mainBox.className = 'info-page-hide';
	mainBox.appendChild(footer);

	this.insMainCam = this.createFigure('main','pngs/main-cam.png',5.614);
	this.insMainCam.id = 'ins-main-cam';
	var camInf = document.createElement('p');
	camInf.className = 'ins-main-title';
	camInf.innerHTML = 'Set Camera';
	this.insMainCam.appendChild(camInf);
	left.appendChild(this.insMainCam);

	this.insMainGam = this.createFigure('main','pngs/main-gam.png',4.493);
	this.insMainGam.id = 'ins-main-gam';
	var gamInf = document.createElement('p');
	gamInf.className = 'ins-main-title';
	gamInf.innerHTML = 'Set Gamma / Gamut';
	this.insMainGam.appendChild(gamInf);
	left.appendChild(this.insMainGam);

	this.insMainTwk = this.createFigure('main','pngs/main-twk.png',1.1808);
	this.insMainTwk.id = 'ins-main-twk';
	var twkInf = document.createElement('p');
	twkInf.className = 'ins-main-title';
	twkInf.innerHTML = 'Adjustments';
	this.insMainTwk.appendChild(twkInf);
	left.appendChild(this.insMainTwk);

	var spacer = document.createElement('div');
	spacer.id = 'ins-main-spacer';	
	left.appendChild(spacer);

	this.insMainLut = this.createFigure('main','pngs/main-lut.png',2.4615);
	this.insMainLut.id = 'ins-main-lut';
	var genInf = document.createElement('p');
	genInf.className = 'ins-main-title';
	genInf.innerHTML = 'Generate LUT';
	this.insMainLut.appendChild(genInf);
	right.appendChild(this.insMainLut);

	var buttons = document.createElement('div');
	buttons.id = 'ins-main-buttons';
	right.appendChild(buttons);

	this.insMainPre = document.createElement('div');
	this.insMainPre.className = 'fig-but';
	var wrapper = document.createElement('div');
	this.insMainPre.appendChild(wrapper);
	var fig = document.createElement('div');
	wrapper.appendChild(fig);
	this.insMainPre.id = 'ins-main-pre';
	var preInf = document.createElement('p');
	preInf.className = 'ins-main-title';
	preInf.innerHTML = 'Preview Window';
	this.insMainPre.appendChild(preInf);
	buttons.appendChild(this.insMainPre);

	this.insMainGen = this.createFigure('but','pngs/main-but-gen.png',5.6667);
	this.insMainGen.id = 'ins-main-gen';
	buttons.appendChild(this.insMainGen);

	this.insMainGst = this.createFigure('but','pngs/main-but-gst.png',5.6667);
	this.insMainGst.id = 'ins-main-gst';
	buttons.appendChild(this.insMainGst);

	this.insMainSet = this.createFigure('but','pngs/main-but-set.png',3.75);
	this.insMainSet.id = 'ins-main-set';
	buttons.appendChild(this.insMainSet);

	this.insMainInf = this.createFigure('main','pngs/main-inf.png',1.3115);
	this.insMainInf.id = 'ins-main-inf';
	var infInf = document.createElement('p');
	infInf.className = 'ins-main-title';
	infInf.innerHTML = 'Charts / Tables / Instructions';
	this.insMainInf.appendChild(infInf);
	right.appendChild(this.insMainInf);

	var credits = document.createElement('h5');
	credits.className = 'creditbutton';

	this.changelogButton = document.createElement('a');
	this.changelogButton.innerHTML = 'Changelog';
	credits.appendChild(this.changelogButton);
	this.creditsButton = document.createElement('a');
	this.creditsButton.innerHTML = 'Credits';
	credits.appendChild(this.creditsButton);
	mainBox.appendChild(credits);
};
LUTInfoBox.prototype.createCamInfo = function() {
	this.insCam = document.createElement('div');
	this.insCam.id = 'ins-cam';
	this.insCamBack = document.createElement('input');
	this.insCamBack.setAttribute('type','button');
	this.insCamBack.value = 'Back';
	this.insCam.appendChild(this.insCamBack);
	this.insCamInfo = document.createElement('div');
	this.insCamInfo.setAttribute('class','infotext');
	this.insCamInfo.appendChild(this.createFigure('box','pngs/ins-cam-1.png',5.6));
	this.addInfo(this.insCamInfo,false,null,'This box defines which camera model the LUT generated is to be used with.');
	this.addInfo(this.insCamInfo,false,null,'Camera manufacturers take differing approaches to recording log, which primarily effect how exposure corrections are handled.');
	this.addInfo(this.insCamInfo,true,'The Sony Approach','Sony have arguably the most pure approach to log. The entire dynamic range of the camera is captured, with changes in ISO being stored purely as metadata in the clip file.');
	this.addInfo(this.insCamInfo,true,null,'Post production software is then expected to read the metadata and automatically do the exposure adjustment.');
	this.addInfo(this.insCamInfo,true,null,'In practice this does not currently always work, so LUTCalc can be used to create exposure corrected LUTs, eg LC709A with a 1-stop push.');
	this.addInfo(this.insCamInfo,true,null,"Exposure can be entered either as the CineEI ISO value used, or as a stop correction from the base ISO, which is shown as 'Native ISO' next to the camera model.");
	this.addInfo(this.insCamInfo,true,'The Canon Approach','The C300 has popularised log recording with CP Lock, but only records in 8-bit. Log is normally recorded in at least 10-bit, to ensure a broad spread of picture data even after the contrast is increased in post.');
	this.addInfo(this.insCamInfo,true,null,'In order to have a reasonable result in the midtones and highlights, C-Log spreads information very thinly in the shadows. Storing exposure shifts as metadata and performing the adjustment in post would work very badly when pushing to increase the ISO, so Canon bakes in the exposure shift.');
	this.addInfo(this.insCamInfo,true,null,'Consequently, the full dynamic range of the camera is only captured at the base ISO.');
	this.addInfo(this.insCamInfo,true,null,"LUTCalc allows you to generate exposure shifts, but as the ISO is arbitrary, it only shows the 'exposure correction' option for the Cine EOS cameras. LUTs for the C300 will also be appropriate for the C100 and C500");
	this.addInfo(this.insCamInfo,true,'The Arri Approach','Somewhere between the other two, in LogC Arri adjusts the log parameters with ISO, incorporating a slight knee at high ISOs. Combined with higher bit depths than in the C300, this means that the full dynamic range is always captured.');
	this.addInfo(this.insCamInfo,true,null,'Whilst adding complexity behind the scenes, this is arguably the most elegant approach, ensuring the edit sees footage exposed as intended regardless of metadata capabilities (unlike Sony) yet avoiding clipping the dynamic range (unlike Canon).');
	this.insCam.className = 'info-page-hide';
	this.insCam.appendChild(this.insCamInfo);
};
LUTInfoBox.prototype.createGamInfo = function() {
	this.insGam = document.createElement('div');
	this.insGam.id = 'ins-gam';
	this.insGamBack = document.createElement('input');
	this.insGamBack.setAttribute('type','button');
	this.insGamBack.value = 'Back';
	this.insGam.appendChild(this.insGamBack);
	this.insGamInfo = document.createElement('div');
	this.insGamInfo.setAttribute('class','infotext');
	this.insGamInfo.appendChild(this.createFigure('box','pngs/ins-gam-1.png',4.48));
	this.addInfo(this.insGamInfo,false,null,'This box is used to set the transfer function and colour space that the camera records to and the basic combination that the LUT is intended to output.');
	this.addInfo(this.insGamInfo,false,null,"The menus refer to 'Gamma' and 'Gamut' as these terms are in common use and generally understood in the context, though the accurate terms should be 'Transfer Function' and 'Colour Space'.");
	this.addInfo(this.insGamInfo,false,null,'There are four types of transfer function offered:');
	this.addInfo(this.insGamInfo,true,'Log Curves','These are designed to spread picture information evenly between stops and are how cameras are able to capture high dynamic range within limited bit depth whilst allowing extensive manipulation in post.');
	this.addInfo(this.insGamInfo,true,null,'They are not intended to be used uncorrected, appearing very flat and dull. For this reason they are also not very suitable for setting exposures to. Examples are S-Log, S-Log2 and S-Log3 on Sony cameras, C-Log on Canon cameras and LogC on Arris.');
	this.addInfo(this.insGamInfo,true,'Linear And Gamma Curves',"These are offered when 'Linear/Rec709' is selected in the gamma boxes. Pure linear is effectively the sensor response of the camera; the value is proportional to the number of photons hitting the sensor.");
	this.addInfo(this.insGamInfo,true,null,'Displays generally expect the linear signal to be adjusted with a power function, raising the linear value in relation to a power known as the gamma. sRGB is common in computing and photography, Rec709 is the standard for HDTV and Rec2020 is a slight refinement of Rec709 for UHDTV and deeper bit depths.');
	this.addInfo(this.insGamInfo,true,'Creative Curves','These are curves which are not defined by standards, though generally relate to them. An example is Rec709(800%) which is a Sony interpretation of Rec709 with a smooth knee to extend the dynamic range captured to 800% IRE at a recording level of 109%. These are the main choices for useful camera gammas.');
	this.addInfo(this.insGamInfo,true,'Hybrid Gamma Curves',"These are the high dynamic range (HDR) replacements for the current Rec709/Rec2020 curves in displays. Two systems with differing approaches have become standardised under ITU Rec2100.");
	this.addInfo(this.insGamInfo,true,null,"Hybrid-Log Gamma or HLG is a curve developed by the BBC in the UK and NHK in Japan. In the spec, 100% conventional gamma maps to 50% HLG, with values below this behaving as a conventional power curve gamma.  Above this though, HLG transitions to a log response, with an even distribution stop to stop in the highlights. As such, it is designed to offer compatibility with conventional screens, but with extended dynamic range for HDR screens. HLG is 'scene referred'.");
	this.addInfo(this.insGamInfo,true,null,"Perceptual Quantisation or PQ is a system developed by Dolby as a 'clean slate' HDR system. It spreads data based upon the human eye's ability to perceive gradations (ie banding) and is ultimately targeted at 12-bit transmission. PQ is display referenced.");
	this.addInfo(this.insGamInfo,true,null,"LUTCalc's model is based upon scene referred calculations, so includes display referred to scene referred options for PQ, known as OOTFs. These are the PQ reference OOTF, the HLG reference OOTF (to be used for conversions between PQ and HLG and back) and a 'no OOTF' PQ option.");
	this.addInfo(this.insGamInfo,true,null,"LUTCalc also includes a couple of earlier HDR proposals developed on the way to Rec2100.");
	this.addInfo(this.insGamInfo,false,null,'There are two main types of colour space:');
	this.addInfo(this.insGamInfo,true,'Matrix','These are gamuts where a picture can be changed from one to another via a 3x3 matrix performed on linear data. There are capture ones such as the S-Gamuts, Arri Wide Gamut and Canon Cinema Gamut, photometric and intermediate ones such as XYZ and ACES and output gamuts such as Rec709 and Rec2020 (the last two have very similar transfer functions, but the Rec2020 colour space is much wider than the Rec709 one).');
	this.addInfo(this.insGamInfo,true,'LUT','These are ones where the conversion from another colour space is complex and may be irreversible, so LUTCalc stores them as LUTs internally. The advantage is that they can have more complex responses than basic matrices, changing saturation with colour and exposure or tuning the look to favour skin tones or natural greens. Examples include LC709 and LC709A, based on the look profiles produced by Sony.');
	this.addInfo(this.insGamInfo,true,null,'LC709 as a colour space gives a similar though arguably subtler colour response than the basic Rec709 matrix');
	this.insGam.className = 'info-page-hide';
	this.insGam.appendChild(this.insGamInfo);
};
LUTInfoBox.prototype.createTwkInfo = function() {
	this.insTwk = document.createElement('div');
	this.insTwk.id = 'ins-twk';
	this.insCustBack = document.createElement('input');
	this.insCustBack.setAttribute('type','button');
	this.insCustBack.value = 'Back';
	this.insTwk.appendChild(this.insCustBack);
	var click = document.createElement('p');
	click.appendChild(document.createTextNode('Click an area for information:'));
	this.insTwk.appendChild(click);
	this.custscreen = document.createElement('div');
	this.custscreen.id = 'ins-custscreen';
	this.custbox = document.createElement('div');
	this.custbox.id = 'ins-cust-box';
	var header = document.createElement('div');
	header.id = 'ins-cust-header';	
	this.custbox.appendChild(this.createFigure('empty','pngs/cust-header.png',19.4348));
	this.insCustColour = this.createFigure('cust','pngs/cust-colour.png',15.9643);
	this.custbox.appendChild(this.insCustColour);
	this.insCustWht = this.createFigure('cust','pngs/cust-wht.png',15.9643);
	this.custbox.appendChild(this.insCustWht);
	this.insCustPsst = this.createFigure('cust','pngs/cust-psst.png',15.9643);
	this.custbox.appendChild(this.insCustPsst);
	this.insCustASC = this.createFigure('cust','pngs/cust-asc.png',15.9643);
	this.custbox.appendChild(this.insCustASC);
	this.insCustMulti = this.createFigure('cust','pngs/cust-multi.png',15.9643);
	this.custbox.appendChild(this.insCustMulti);
	this.insCustHG = this.createFigure('cust','pngs/cust-hg.png',15.9643);
	this.custbox.appendChild(this.insCustHG);
	this.insCustKnee = this.createFigure('cust','pngs/cust-knee.png',15.9643);
	this.custbox.appendChild(this.insCustKnee);
	this.insCustBhi = this.createFigure('cust','pngs/cust-bhi.png',15.9643);
	this.custbox.appendChild(this.insCustBhi);
	this.insCustBgm = this.createFigure('cust','pngs/cust-bgm.png',15.9643);
	this.custbox.appendChild(this.insCustBgm);
	this.insCustSDRS = this.createFigure('cust','pngs/cust-sdrs.png',15.9643);
	this.custbox.appendChild(this.insCustSDRS);
	this.insCustDCC = this.createFigure('cust','pngs/cust-dcc.png',15.9643);
	this.custbox.appendChild(this.insCustDCC);
	this.insCustGlim = this.createFigure('cust','pngs/cust-glim.png',15.9643);
	this.custbox.appendChild(this.insCustGlim);
	this.insCustFC = this.createFigure('cust','pngs/cust-fc.png',15.9643);
	this.custbox.appendChild(this.insCustFC);
	this.insCustSamp = this.createFigure('cust','pngs/cust-samp.png',15.9643);
	this.custbox.appendChild(this.insCustSamp);
	this.insCustLA = this.createFigure('cust','pngs/cust-la.png',6.4783);
	this.custbox.appendChild(this.insCustLA);
	this.custscreen.appendChild(this.custbox);
	this.custscreen.appendChild(document.createElement('br'));
	this.insTwk.className = 'info-page-hide';
	this.insTwk.appendChild(this.custscreen);
};
LUTInfoBox.prototype.createLutInfo = function() {
	this.insLut = document.createElement('div');
	this.insLut.id = 'ins-lut';
	this.insLutBack = document.createElement('input');
	this.insLutBack.setAttribute('type','button');
	this.insLutBack.value = 'Back';
	this.insLut.appendChild(this.insLutBack);
	this.insLutInfo = document.createElement('div');
	this.insLutInfo.setAttribute('class','infotext');
	this.insLutInfo.appendChild(this.createFigure('box','pngs/ins-lut-1.png',2.4615));
	this.addInfo(this.insLutInfo,false,null,'This is the box where the format of the LUT to be generated is decided.');
	this.addInfo(this.insLutInfo,false,null,"The first option is 'LUT Title / Filename'. As well as being used as the filename for saving the LUT, this appears within the file as the title. This may help keep track of LUTs in case filenames change. LUTCalc will make sure that it is appropriately formatted.");
	this.addInfo(this.insLutInfo,false,null,"Next to the title box is the 'Auto Title' button. Clicking this will generate a title based upon the current input and output choices, plus any black level and colour saturation customisation.");
	this.addInfo(this.insLutInfo,false,null,'LUTCalc produces 1D and 3D LUTs:');
	this.addInfo(this.insLutInfo,true,'1D','these are used for contrast control, with each colour channel changed independently.');
	this.addInfo(this.insLutInfo,true,null,'With a 1D LUT it is practical to store every possible 8-bit, 10-bit or 16-bit value. As such the adjustment can be arbitrarily complex, which may well be useful for storing an extensive grade, but with smooth curves such as those built in to LUTCalc and the use of cubic interpolation, considerably fewer control point are needed for an effective result.');
	this.addInfo(this.insLutInfo,true,'3D','3D LUTs input combinations of red, green and blue values to reference output values. This allows for sophisticated adjustment of colours across the gamut and exposure range. Where a 1024-point 1D LUT covers every possible 10-bit input value for one channel, a 3D LUT would need to be 1024x1024x1024-point to consider every possible RGB combination.');
	this.addInfo(this.insLutInfo,true,null,'This would be impractically large and complex, so 3D LUTs are generally of a much smaller dimension and use interpolation to obtain intermediate values. LUTCalc can produce the most common 3D sizes for a chosen LUT format.');
	this.addInfo(this.insLutInfo,true,null,'Sony F cameras accept 33x33x33 cubes and this size does a very good job of reproducing the kinds of effects possible in LUTCalc. 65x65x65 is much larger, but gives greater precision for post software where the size is less of an issue.');
	this.addInfo(this.insLutInfo,false,null,'After the dimension settings come the range options. Cube LUTs contain floating point values rather than integers, and generally map 0 to be black and 1 to be white. Values can actually be greater or less than these, but 0 and 1 are the reference points. What 0 and 1 actually represent depends on the video range used.');
	this.addInfo(this.insLutInfo,true,'100%',"10-bit binary can store 1024 different values, in the decimal range 0-1023. In analogue video picture information was stored within a voltage range defined as a percentage 0%-100%. Values just outside were that classed 'super black' and 'super white'.");
	this.addInfo(this.insLutInfo,true,null,"In digital video, 0% IRE has been defined as 10-bit 64 in decimal, with 100% IRE at 10-bit 940. With 'legal range' set 0 in the LUT equates to 0% IRE and 1 equates to 100% IRE. On this scale, 10-bit 0 would be -0.073 and 10-bit 1023 1.095.");
	this.addInfo(this.insLutInfo,true,null,"This is a commonly expected output range in software such as DaVinci Resolve and is the output range of Sony monitor LUTs (MLUTS).");
	this.addInfo(this.insLutInfo,true,'109%','this treats the full range of 10-bit values as mapping to the 0-1 LUT range. Technically, the top and bottom couple of values are generally reserved, but for the sake of simplicity that can be ignored here. LUTs can output values outside of the 0-1 range, but can only consider input values within it. If a log recording goes outside of legal range (generally only above 1), then the LUT input needs to be data range to make sure that no data is lost.');
	this.addInfo(this.insLutInfo,true,null,'S-Log2 and Canon C-Log both go above legal range, and for consistency Sony recommends working with S-Log3 set to data range in software such as Resolve. Sony MLUTs are data in, legal out.');
	this.addInfo(this.insLutInfo,false,null,'LUTCalc will generally default to data in, legal out, though if both the input and output gammas are log curves then it will set data in data out, on the assumption that further LUTs or corrections will be applied.');
	this.addInfo(this.insLutInfo,false,null,'It has also been suggested that the Lumetri plugin in Adobe Premiere CC expects data in, data out in order to give the correct look. The best suggestion is to test and compare in the software to be used in post.');
	this.addInfo(this.insLutInfo,false,null,'The final set of options sets the levels and output format correctly for a particular task or camera.');
	this.addInfo(this.insLutInfo,true,'Grading LUT','This brings up a set of options for generating LUTs suitable for postproduction software. The default option is a generic .cube file, but a number of alternate formats and specific pieces of software are also available.');
	this.addInfo(this.insLutInfo,true,'Camera LUT (MLUT)','This option is for generating LUT suitable for loading into a camera for use as a monitor LUT, or MLUT.');
	this.addInfo(this.insLutInfo,false,null,'Some LUT formats allow for scaling of the inputs, to allow for inputs which needs to lie outside of 0-1.0. An example would be a linear to log LUT, where the linear range between 0 and 1.0 is only a small portion of a log curve. Scaling means that the input range in this case could be between 0 and 12.0.');
	this.addInfo(this.insLutInfo,false,null,'Where a LUT format supports scaling, LUTCalc will display minimum and maximum boxes. These default to 0 and 1.0 respectively, and generally do not need to be changed.');
	this.insLutInfo.appendChild(this.createFigure('box','pngs/ins-lut-2.png',5.818));
	this.addInfo(this.insLutInfo,true,'Hard Clip','Many LUT formats permit output values beyond 0-1. This allows limited dynamic range conversions such as linear or Rec709 to be performed non-destructively, ie the overexposed data can still be pulled back into range.');
	this.addInfo(this.insLutInfo,true,null,'Some software does not handle out of range values correctly, so this drop down allows for clipping of black (0), white (1) or both black and white.');
	this.addInfo(this.insLutInfo,true,null,"If clipping is applied and the output range for LUTs is set to 'Data', an additional checkbox will appear, '0%-100%'. Check this and the clipping will be held to legal range, ie for 10-bit data range black is 64 and white 959 out of 1023.");
	this.addInfo(this.insLutInfo,true,null,'Use of hard clipping does mean that data outside of the clipped range is lost.');
	this.insLut.className = 'info-page-hide';
	this.insLut.appendChild(this.insLutInfo);
};
LUTInfoBox.prototype.createPreInfo = function() {
	this.insPre = document.createElement('div');
	this.insPre.id = 'ins-gen';
	this.insPreBack = document.createElement('input');
	this.insPreBack.setAttribute('type','button');
	this.insPreBack.value = 'Back';
	this.insPre.appendChild(this.insPreBack);
	this.insPreInfo = document.createElement('div');
	this.insPreInfo.setAttribute('class','infotext');
	this.insPreInfo.appendChild(this.createFigure('box','pngs/ins-pre-1.jpg',1.437));
	this.addInfo(this.insPreInfo,false,null,"Clicking 'Preview' brings up a test image below the row of buttons. By default it is displayed legal range and reflects any adjustments made.");
	this.addInfo(this.insPreInfo,false,null,'LUTCalc includes five test images built in, with the option to load an additional image.');
	this.addInfo(this.insPreInfo,true,'High Contrast','This image covers around eleven or twelve stops and with the brightest highlights around 5 1/2 stops above 18% gray.');
	this.addInfo(this.insPreInfo,true,'Low Contrast','This image is against greenscreen and stays within the dynamic range of Rec709, with highlights about 2 1/3 stops above 18% gray.');
	this.addInfo(this.insPreInfo,true,'Rec709 Gamut','This visualises colours across the entire Rec709 colour gamut. The layout matches the positions of the colours on a Rec709 vectorscope.');
	this.addInfo(this.insPreInfo,true,'xy / uv Chromacity','Here the entire gamut of human vision (CIE 1931 standard observer, XYZ) is displayed in standard chromacity charts. CIE1931 xy is the conventional representation of the XYZ gamut, where CIE1960 uv is a more linear representation used in colour temperature calculations. The Planck Locus (colour temperature line) is shown as a white curve.');
	this.insPreInfo.appendChild(this.createFigure('box','pngs/ins-pre-2.jpg',1.7778));
	this.addInfo(this.insPreInfo,true,null,'On top of this are overlaid triangles representing the primaries of the current selected recording gamut and the net output gamut after adjustment, plus dot markers of the white points. Highly nonlinear adjustments (ie PSST-CDL) are not factored in to the triangle calculation, though White Balance and ASC-CDL are. Complex colour spaces (eg LC709 and LC709A assume the Rec709 primaries as their base).');
	this.addInfo(this.insPreInfo,true,null,'the region where the two triangles overlap is a guide to the range of colours available in the finished image.');
	this.addInfo(this.insPreInfo,true,'Grayscale','A 16-stop grayscale. The upper portion smoothly shifts from 8 stops below mid gray to 7 stops above, with the lower portion going in one-stop steps. The vertical line marks 18% gray. On the waveform, this image will match up with the Stop/IRE chart.');
	this.addInfo(this.insPreInfo,false,null,'The high and low contrast images include a set of Rec709 75% and 100% primary and secondary boxes, a 16-stop grayscale and a colour chart on the right.');
	this.addInfo(this.insPreInfo,false,null,'The high contrast image also includes colour charts four stops above and below base and the low contrast chart two stops above and below.');
	this.addInfo(this.insPreInfo,false,null,'As the cursor moves over the preview window, the output 10-bit code values at that point are displayed above the image.');
	this.addInfo(this.insPreInfo,false,null,"An image recorded in a known colour space can also be loaded in place of the defaults by clicking 'Load Preview...'. The webapp version of LUTCalc accepts 8-bit formats, such as JPEG, PNG and BMP. LUTCalc For Mac can additionally read 16-bit TIFF and PNG images.");
	this.addInfo(this.insPreInfo,false,null,'Once loaded, the new image becomes available with the default selections.');
	this.addInfo(this.insPreInfo,false,null,"By default the preview image is displayed legal range (0%-100%), but by clicking '109%' the image is darkened a little to give a representation of extended range details (0%-109%).");
	this.addInfo(this.insPreInfo,false,null,"'Large Image' / 'Small Image' toggles between the default small preview image and a larger version which requires scrolling to view the scopes.");
	this.addInfo(this.insPreInfo,false,null,'Above the preview window are the scope options:');
	this.insPreInfo.appendChild(this.createFigure('box','pngs/ins-pre-3.png',4.7059));
	this.addInfo(this.insPreInfo,true,'WFM','Waveform monitor. The horizontal axis is the same as the test image, whilst the vertical axis is luma values of all the pixels in that column. The scale lines are blocks of 10% IRE and the full range runs from -7% to +109%.');
	this.addInfo(this.insPreInfo,true,'Vector','Vectorscope. This is a polar plot of the image chroma. LUTCalc includes standard 75% and 100% Rec709 boxes (the two rows of green circles). In pure Rec709 75% colourspace (gamma and gamut) colour bars should fall dead centre of the inner green circles.');
	this.addInfo(this.insPreInfo,true,null,'In addition there is a set of 75% Rec709 boxes that have been mapped to the current chosen colour space. These are the colour of their associated primary or secondary and will lie inside the green ones.');
	this.addInfo(this.insPreInfo,true,null,'These give a guide to the size and nature of the chosen colour space, and also where a test chart should lie for correcting colour casts without changing colour space.');
	this.addInfo(this.insPreInfo,true,'RGB','RGB Parade. Similar to the waveform, but the red, green and blue components are separated horizontally.');
	this.insPre.className = 'info-page-hide';
	this.insPre.appendChild(this.insPreInfo);
};
LUTInfoBox.prototype.createGenInfo = function() {
	this.insGen = document.createElement('div');
	this.insGen.id = 'ins-gen';
	this.insGenBack = document.createElement('input');
	this.insGenBack.setAttribute('type','button');
	this.insGenBack.value = 'Back';
	this.insGen.appendChild(this.insGenBack);
	this.insGenInfo = document.createElement('div');
	this.insGenInfo.setAttribute('class','infotext');
	this.addInfo(this.insGenInfo,false,'Generate','The GO button!');
	this.addInfo(this.insGenInfo,false,null,'In most browsers you will either be given a choice of where to save your LUT, or it will automatically go to the Downloads folder.');
	this.addInfo(this.insGenInfo,false,null,'In some versions of Safari it may just appear in a new browser tab. In that case you will need to save it manually.');
	this.addInfo(this.insGenInfo,false,null,'LUTCalc For Mac allows you to choose the destination for saving.');
	this.insGen.className = 'info-page-hide';
	this.insGen.appendChild(this.insGenInfo);
};
LUTInfoBox.prototype.createGstInfo = function() {
	this.insGst = document.createElement('div');
	this.insGst.id = 'ins-gst';
	this.insGstBack = document.createElement('input');
	this.insGstBack.setAttribute('type','button');
	this.insGstBack.value = 'Back';
	this.insGst.appendChild(this.insGstBack);
	this.insGstInfo = document.createElement('div');
	this.insGstInfo.setAttribute('class','infotext');
	this.addInfo(this.insGstInfo,false,'Generate Set','allows you to batch generate multiple versions of your LUT across a range of exposure compensations.');
	this.addInfo(this.insGstInfo,false,null,'The options available are to set the lower and upper bounds of the exposure range you wish to generate, then the step size in fractions of a stop.');
	this.addInfo(this.insGstInfo,false,null,'The default is to produce a set from two stops below native to two stops above, in steps of 1/3 of a stop.');
	this.insGst.className = 'info-page-hide';
	this.insGst.appendChild(this.insGstInfo);
};
LUTInfoBox.prototype.createSetInfo = function() {
	this.insSet = document.createElement('div');
	this.insSet.id = 'ins-set';
	this.insSetBack = document.createElement('input');
	this.insSetBack.setAttribute('type','button');
	this.insSetBack.value = 'Back';
	this.insSet.appendChild(this.insSetBack);
	this.insSetInfo = document.createElement('div');
	this.insSetInfo.setAttribute('class','infotext');
	this.addInfo(this.insSetInfo,false,'Settings','Here you have the option to save the current state of all the options and customisations in LUTCalc, or to reload preferred settings previously saved.');
	this.addInfo(this.insSetInfo,false,null,"The settings are saved in files ending '.lutcalc'.");
	this.insSet.className = 'info-page-hide';
	this.insSet.appendChild(this.insSetInfo);
};
LUTInfoBox.prototype.createInfInfo = function() {
	this.insInf = document.createElement('div');
	this.insInf.id = 'ins-inf';
	this.insInfBack = document.createElement('input');
	this.insInfBack.setAttribute('type','button');
	this.insInfBack.value = 'Back';
	this.insInf.appendChild(this.insInfBack);
	this.insInfPic = document.createElement('div');
	this.insInfPic.id = 'ins-inf-pic';
	this.insInf.appendChild(this.insInfPic);
	this.insInfInfo = document.createElement('div');
	this.insInfInfo.setAttribute('class','infotext');
	this.insInfInfo.appendChild(this.createFigure('box','pngs/ins-inf-1.png',1.3099));
	this.addInfo(this.insInfInfo,false,null,'This box contains provides information about the current LUT under construction including suggested exposure values and transfer curves, plus instructions for LUTCalc.');
	this.addInfo(this.insInfInfo,false,'Instructions','Hopefully fairly obvious, after all here you are!');
	this.addInfo(this.insInfInfo,false,'Tables','This shows tables of % IRE and 10-bit values for the current output curve, both for common reflectances and for stops above and below 18% gray. The Stop to stop values are given first for with the LUT applied, and then the pre-LUT equivalents. Useful if applying LUTs in a monitor with a pre-LUT waveform.');
	this.addInfo(this.insInfInfo,false,'Charts','This provides three different ways of comparing input and output levels:');
	this.addInfo(this.insInfInfo,true,'Ref/IRE','Reflectance levels of the scene (eg 18% gray, 90% white) against % IRE. The simplest chart, but as the x-axis is linear it is hard to read anything meaningful from it.');
	this.addInfo(this.insInfInfo,true,'Stop/IRE','Shows the output level against input stops. Clearly shows the difference between linear/gamma (keep increasing in slope), log curves (tend towards a straight line slope in the highlights and curves with knee (tend towards a horizontal line in the highlights). Also gives a good idea of dynamic range in stops.');
	this.addInfo(this.insInfInfo,true,null,'Areas beyond the range of the chosen camera are shaded. When the CineEI ISO is changed or Stop Correction is applied the level of 18% gray in the underlying recording is shown with a pink vertical line.');
	this.addInfo(this.insInfInfo,true,'LUT In/Out','similar to Stop/IRE, but better shows true black (black is technically minus infinity stops, so Stop/IRE never quite shows it).');
	this.addInfo(this.insInfInfo,false,null,'The charts tab also includes a table of % IRE and 10-bit values for the current curve.');
	this.insInf.className = 'info-page-hide';
	this.insInf.appendChild(this.insInfInfo);
};
LUTInfoBox.prototype.createCdtInfo = function() {
	this.insCdt = document.createElement('div');
	this.insCdt.id = 'ins-cdt';
	this.insCdtBack = document.createElement('input');
	this.insCdtBack.setAttribute('type','button');
	this.insCdtBack.value = 'Back';
	this.insCdt.appendChild(this.insCdtBack);
	this.insCdtInfo = document.createElement('div');
	this.insCdtInfo.setAttribute('class','infotext');
	this.addInfo(this.insCdtInfo,false,null,'All code written by Ben Turley except in the online version:');
	this.addInfo(this.insCdtInfo,true,'FileSaver.js','HTML5 saveAs() polyfill included in the online version of LUTCalc.');
	this.addInfo(this.insCdtInfo,true,null,'By Eli Gray under MIT licence on GitHub.');
	this.addInfo(this.insCdtInfo,true,'Blob.js','W3C Blob polyfill included in the online version of LUTCalc.');
	this.addInfo(this.insCdtInfo,true,null,'By Eli Gray & Devin Samarin under MIT licence on GitHub.');
	this.addInfo(this.insCdtInfo,false,null,'Where available curves and colourspaces included in LUTCalc are derived from publicly available technical documentation from manufacturers and standards bodies.');
	this.addInfo(this.insCdtInfo,false,null,'Other curves have been derived from analysis of my own test images, checked where possible against available sources such as LUTs and charts in marketing materials.');
	this.addInfo(this.insCdtInfo,false,null,'Links to many of the technical documents used in creating LUTCalc are available on the LUTCalc website at www.lutcalc.net.');
	this.insCdt.className = 'info-page-hide';
	this.insCdt.appendChild(this.insCdtInfo);
};
LUTInfoBox.prototype.createClgInfo = function() {
	this.insClg = document.createElement('div');
	this.insClg.id = 'ins-clg';
	this.insClgBack = document.createElement('input');
	this.insClgBack.setAttribute('type','button');
	this.insClgBack.value = 'Back';
	this.insClg.appendChild(this.insClgBack);
	this.insClgInfo = document.createElement('div');
	this.insClgInfo.setAttribute('class','infotext');
	this.addInfo(this.insClgInfo,false,null,"v3.3 Beta 1");
	this.addInfo(this.insClgInfo,true,null,"* New Feature - Additional cameras; Sony, Panasonic, DJI, Nikon.");
	this.addInfo(this.insClgInfo,true,null,"* New Feature - Sony Venice-tuned S-Gamut3 and S-Gamut3.cine using primaries calculated from Sony's IDTs (these shouldn't be camera-specific, the S-Gamut primaries should be set in stone, but Sony definitely offers different ones for the Venice).");
	this.addInfo(this.insClgInfo,true,null,"* New Feature - Added Nikon N-Log gamma curve.");
	this.addInfo(this.insClgInfo,true,null,"* New Feature - Fixed point precision setting within settings, so that LUT files can be more precise than the default six or eight decimal places. Good for scene linear output LUTs.");
	this.addInfo(this.insClgInfo,true,null,"* New Feature - Added Sony s709 colourspace, estimated using Venice ACES primaries to reduce green on FS7 / FX9. TBD if this is the right approach.");
	this.addInfo(this.insClgInfo,true,null,"* Feature Change - Improved Arri LogC high ISO highlight response.");
	this.addInfo(this.insClgInfo,true,null,"* Bugfix - Fixed Lumetri / Speedgrade cube linear and conventional gamma settings.");
	this.addInfo(this.insClgInfo,true,null,"* Feature Change - Added 33x LUT option to SmallHD, confirmed SmallHD preset over HDMI and SDI using FX9 and a6500 with latest PageOS4.");
	this.addInfo(this.insClgInfo,false,null,"v3.2 Beta 1");
	this.addInfo(this.insClgInfo,true,null,"New Feature - DJI DLog and DGamut (Zenmuse X5 and X7 version).");
	this.addInfo(this.insClgInfo,true,null,"New Feature - DJI DLog-M based upon test images taken by Mark Walter a Mavic 2.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - 'SDR Saturation' improves HLG compatibility on SDR displays by increasing saturation as per the BT.2390 spec. Available with all HDR options.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Black Gamma was not available for 1D LUTs.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Custom input scaling does not appear or be applied unless explicitly checked. Could cause unexpected results with DaVinci and Adobe cubes if not needed.");
	this.addInfo(this.insClgInfo,false,null,"v3.1.2");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Correct output of 'LUT_1D_INPUT_RANGE' or 'LUT_3D_INPUT_RANGE' in Resolve-style cube files with input scaling.");
	this.addInfo(this.insClgInfo,false,null,"v3.1.1");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - User preview images were not loading.");
	this.addInfo(this.insClgInfo,false,null,"v3.1");
	this.addInfo(this.insClgInfo,true,null,"New Feature - 'Display Colourspace Converter' tool to quickly convert current look to other base colourspaces (eg Rec709 version and then DCI-P3 version).");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Sony Cinegamma 3 and Cinegamma 4 based upon analysis of test images taken with an a7s.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Separation on Rec2100 OOTFs and OETF/EOTFs for display referred conversions in PQ and Hybrid-log Gamma.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Splash screen displays progress bar.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Full rewrite of the underlying high dynamic range (HDR) PQ and Hybrid-Log Gamma code.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - User interface improvements - online version now uses responsive design principals.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Colour sliders in 'MultiTone' tool now correctly reflect the Gamut Limiter.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed problem with saving 1D-only LUTAnalyst lacubes and laluts.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed issue with Mac App not reading LUTs with upper-case file extensions.");
	this.addInfo(this.insClgInfo,false,null,"v3.0");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Choice of tricubic, tetrahedral and trilinear interpolation for analysis and use in LUTAnalyst.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Completely new gamut limiter algorithm and code. Legalises colours and fixes potential LUT overshoots when going from a wide Gamut such as S-Gamut3 to a narrow one such as Rec709.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - P3 Colourspace now available with DCI, D60 and D65 white points.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Sony Standard Gammas STD 1-6.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - 'Auto Title' button. Clicking it creates a LUT title containing input and output gamma and gamut details, plus basic info of customisation (currently black level and saturation).");
	this.addInfo(this.insClgInfo,true,null,"New Feature - 'Declip' button on the LUTAnalyst tool. Where LUTs appear to have been clamped (ie the maximum output value is exactly 1.0 and or the minimum exactly 0.0), the declip process will attempt to extrapolate the clipped values, then limit them within a sensible range without hard clipping.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - 'DaVinci Resolve 12+ auto' preset option, to reflect that Resolve 12's default 'auto' clip range setting.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Custom Colour Space can now set primaries from a matrix and white point / illuminant.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Complete rewrite of 3D interpolation / extrapolation code for efficiency, accuracy, clarity and maintainability.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Extensive rewrite of LUTAnalyst code for improved accuracy.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Reworked 1D interpolation code for speed and efficiency.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - New code for estimating the gamut triangle on the 'xy / uv chromacity' preview. Much more robust and efficient.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change / Bugfix - Extensive rewrite of 'Custom Colour Space' code.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Improved interpretation of Canon EOS Standard and Normal gammas.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed Javascript policies which stopped LUTCalc working on Internet Explorer / Edge browser.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Gamut Limiter tool was blocking LUT generation.");
	this.addInfo(this.insClgInfo,false,null,"v2.91");
	this.addInfo(this.insClgInfo,true,null,"New Feature - RED Gamma 1 and RED Gamma 2 using data from https://github.com/videovillage/RED-Conversion-LUTs.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Bolex Log and Bolex Wide Gamut.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Reanalysed RED Gamma 4 against RED's 1D LUTs.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - BMD4.6kFilm Gamma output range.");
	this.addInfo(this.insClgInfo,false,null,"v2.90");
	this.addInfo(this.insClgInfo,true,null,"New Feature - BMDFilm4.6k Gamma.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Canon EOS Standard Gamma (plus a version scaled to within legal range).");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Canon Normal 1,2,3 & 4.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - BBC 0.4, 0.5 and 0.6 Gammas.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - RGB Sampler for sampling multiple points on preview images.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Reanalysed BMDFilm and BMDFilm4k Gamma.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed 'Print Chart' bug from the last update.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed issue in Mac App where white balances could not be taken from the CIE xy / uv preview image.");
	this.addInfo(this.insClgInfo,true,null,"Feature Removal - ALEXA-X-2 Gamut until I have reanalysed the tone map used.");
	this.addInfo(this.insClgInfo,false,null,"v2.60");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Batch-generate sets of exposure compensation LUTs across a user-selectable EI range and step size.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Gamut Limiter. Aims to contain the YPbPr of the output to within the display's range (Rec709/sRGB or Rec2020) when going from a wide gamut to a narrower one, even if the luminance is above legal and extended.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - White and Black clipping can be set individually, and either to the LUT's output range, or always legal.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Preview display and charts now reflect any legal-range clipping applied.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - The 'Log Info' information button is now 'Tables', and shows IRE and 10-bit values for the current output gamma, both for various common reflectances and for each of +/- 8 stops around 18% gray.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - 1350% reflectance has been replaced by 'Clip', to reflect the white clip level of the currently selected camera.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed broken ACEScc input code. ACEScc as a 'Rec Gamma' option now works as expected.");
	this.addInfo(this.insClgInfo,false,null,"v2.54");
	this.addInfo(this.insClgInfo,true,null,"Feature Change / Bugfix - RED Log3G10 code updated to version 2 of the spec, with bugfix to the chart input gamma code.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Rec2100 PQ gamma option including display linear code.");
	this.addInfo(this.insClgInfo,false,null,"v2.53");
	this.addInfo(this.insClgInfo,true,null,"New Feature - REDWideGamutRGB and Log3G10.");
	this.addInfo(this.insClgInfo,false,null,"v2.52");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed Canon C-Log3 bug.");
	this.addInfo(this.insClgInfo,false,null,"v2.51");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Canon C-Log3.");
	this.addInfo(this.insClgInfo,false,null,"v2.5");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Black Gamma.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Sony FS5 camera option.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Panasonic GH4 V-Log camera option.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - When using LUTAnalyst, the preview window was not automatically updating to reflect the analysed colour gamut.");
	this.addInfo(this.insClgInfo,false,null,"v2.4");
	this.addInfo(this.insClgInfo,true,null,"New Feature - LUTAnalyst automatically sets output gamma and gamut to the analysed LUT.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Alexa Classic 709 (Alexa-X-2) gamma and gamut.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Amira Rec709 gamma.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Improved LogC calculations from Arri's ACES IDTs.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Improved luminance coefficient calculation from colourspace primaries.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Improved flexibility in preset range settings for particular curve / format combinations.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - xy/uv gamut outlines were failing for LUTAnalyst colourspaces.");
	this.addInfo(this.insClgInfo,false,null,"v2.3.8");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Print out the Stop vs IRE chart, plus exposure table and IRE / 10-bit values for each stop from -8 to +8.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - ProPhoto / ROMM RGB colourspace and gamma.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Experimentally-derived DJI D-Log gamma for Zenmuse X3 / Osmo.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - added 14-bit (16384 point) output option to 1D cube files.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Linear and conventional gamma options are now listed under 'Linear / γ' rather than 'Linear / Rec709' to avoid confusion.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change / Provisional Bugfix - changed the way that Dolby PQ is scaled due to user feedback.");
	this.addInfo(this.insClgInfo,false,null,"v2.3.7");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - typo meant that SPI3D files were generated without the mesh sizes.");
	this.addInfo(this.insClgInfo,false,null,"v2.3.6");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Improved / more robust gamma reversal code for LUTAnalyst.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Provisional SmallHD preset based on SmallHD feedback - pending confirmation.");
	this.addInfo(this.insClgInfo,false,null,"v2.3.5");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Hybrid-log gamma.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - All Sony Hypergammas (1-8) plus Cinegammas 1 and 2 are now included (HG4 is also the same as Cinegamma 1, HG2 the same as Cinegamma 2).");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Rec709(800%) with black at 3% (the built-in LUT in Sony CineEI mode) is now included as an input gamma option. Not an ideal situation, but can be used to reverse an accidentally burnt-in LUT in CineEI mode.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Hypergammas 7 & 8 plus Rec709 (800%) have been recalculated along withe the other Hypergammas for precision.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - fixed slight offset to x-axis in LUT in / LUT out chart.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed initial black clip / white clip bounds on the stop chart not displaying.");
	this.addInfo(this.insClgInfo,false,null,"v2.3.4");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - More flexible PQ selection.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed settings loading bug.");
	this.addInfo(this.insClgInfo,false,null,"v2.3.3");
	this.addInfo(this.insClgInfo,true,null,"Reversion - New information confirms the original interpretation of V709. Removed the alternative and restored the .vlt preset.");
	this.addInfo(this.insClgInfo,false,null,"v2.3.2");
	this.addInfo(this.insClgInfo,true,null,"New Feature - FCP X Color Finale / Color Grading Central LUT Utility Preset.");
	this.addInfo(this.insClgInfo,false,null,"v2.3.1");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Generic camera option where the user selects the recorded gamma and gamut.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Gamma and gamut options properly hidden or revealed in OSX App.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - LUTAnalyst gamuts could become hidden when the format changed.");
	this.addInfo(this.insClgInfo,false,null,"v2.3");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Gammas and Gamuts available sorted by manufacturer, type (log, display, HDR Display, etc) or as the previous flat list.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Additional MLUT format presets: Zacuto Gratical, Divergent Scopebox, AJA LUT-box.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - 'Display gamma correction' preset for say mapping scene linear to Rec709 or γ2.4 to PQ.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - GoPro Protune Gamma and Gamut (from ACES devel matrix and Cineform blog).");
	this.addInfo(this.insClgInfo,true,null,"New Feature - DRAGONColor, DRAGONColor2, REDColor, REDColor2, REDColor3, REDColor4 gamuts (from ACES devel matrices).");
	this.addInfo(this.insClgInfo,true,null,"New Feature - REDGamma3 and REDGamma4 (from LUTs on manufacturer's website).");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Further Dolby PQ options listed by display nits for a 90% reference white.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Good Broyden's used to estimate gamut primary triangles for LUTAnalyst-read LUTs.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Binary file saving now works in the OSX App.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fixed different binary saving bug in Chrome App.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Re-analysed the Panasonic V-709 LUTs for both gamma and gamut. Lack of availability of a Varicam 35 has lead to uncertainty over the correct ranges to choose. Pending confirmation both interpretations of the gamma are given, though the .vlt preset assumes the new assumption of range.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Fix incomplete input scaling bugfix from v2.2, which meant that scaling was only applied if both lower and upper bounds were changed.");
	this.addInfo(this.insClgInfo,false,null,"v2.2.2");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Additional pure gamma curves, plus Rec709 and sRGB now show their effective pure gamma value with the actual exponent in brackets.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - LUTAnalyst has an undocumented feature of reversing analysed gammas to provide a 'Recorded Gamma' option. This was disabled and is now functioning again.");
	this.addInfo(this.insClgInfo,false,null,"v2.2");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Multitone. This combines two adjustments. You can set colour saturation on a stop-by-stop basis (eg for lower saturation in the highlights), and then set one or more colour 'washes' - a tint to zero saturation - at arbitrary stop levels. With Multitone you can create washes, duotones, tritones etc, or create alternatives to LC709A.");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Custom Colour Spaces. Select 'Custom' in the recorded or output gamut boxes and a new panel appears where you can define one or more custom colour spaces, either using xy white point and primaries, or by entering matrix values and selecting the intended internal or working colour space.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - LUTCalc For Mac now works on OSX 10.8 Mountain Lion.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Modal popup dialogs. Ensures that none of the other controls can be changed when a modal dialog box is up (eg 'Load Preview' details).");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - cube files which did not use input scaling would still include the scaling command, potentially breaking compatibility with some software.");
	this.addInfo(this.insClgInfo,false,null,"v2.1");
	this.addInfo(this.insClgInfo,true,null,"New Feature - Knee adjustment. Add or adjust a knee with any output gamma. clip levels, range and smoothness (from hard conventional video knee to smoothly curved 'cinegamma') are all adjustable.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - changing the output gamma was not correctly setting the output range for the chosen format preset.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - file format and details settings were not correctly stored or loaded with 'Save Settings' and 'Load Settings'.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix - Values in Resolve 'ilut' and 'olut' format LUTs were separated with spaces rather than commas.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Simplified the LUT output calculation process for easier maintainance and development.");
	this.addInfo(this.insClgInfo,true,null,"Feature Change - Colour charts on preview defaults now circles, allowing variation in the YPbPr values which will eventually allow larger dots on the Vectorscope.");
	this.addInfo(this.insClgInfo,false,null,"v2.0");
	this.addInfo(this.insClgInfo,true,null,"Updated instructions to reflect added features and changes to the interface.");
	this.addInfo(this.insClgInfo,true,null,"Added 'Lock Value' options to black level and highlight level adjustments.");
	this.addInfo(this.insClgInfo,true,null,"Black / highlight bug when loading settings fixed by 'Lock Value' options.");
	this.addInfo(this.insClgInfo,true,null,"Reintroduced nominal colour temperature select box for fluorescent adjustments.");
	this.addInfo(this.insClgInfo,true,null,"Removed fileSaver.js and Blob.js from Chrome App version - now all original code.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC18");
	this.addInfo(this.insClgInfo,true,null,"Current settings can now be saved and loaded later. At present black level / highlight level settings do not reload.");
	this.addInfo(this.insClgInfo,true,null,"CIE chromacity chart preview now overlays the output gamut triangle and white point where possible (currently all matrix-based colourspaces). It adapts to whitepoint and saturation shifts, though does not take into account PSST-CDL, with its scope for extreme nonlinearity.");
	this.addInfo(this.insClgInfo,true,null,"White balance picker handles more extreme colour choices.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC17");
	this.addInfo(this.insClgInfo,true,null,"Further improvement of White Balance code.");
	this.addInfo(this.insClgInfo,true,null,"Additional preview default showing the CIE 1931 xy and CIE 1960 uv chromacity diagrams with Planck locus. Gives a guide to the saturation limits / clipping of the current output colourspace.");
	this.addInfo(this.insClgInfo,true,null,"White Balance now includes a 'click on preview' option. Once activated, clicking a spot on the preview window will attempt to calculate the CCT and Duv at that point and apply them to the White Balance adjustments.");
	this.addInfo(this.insClgInfo,true,null,"Improvements to the Correlated Colour Temperature (CCT) calculation code.");
	this.addInfo(this.insClgInfo,true,null,"Preview images are now chosen from a selection list, rather than toggling from one to the next.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC16");
	this.addInfo(this.insClgInfo,true,null,"Overhaul of the white balance adjustments code and Planck Locus calculation.");
	this.addInfo(this.insClgInfo,true,null,"Planck locus data calculated from Planck equation and CIE 1931 data at 5nm intervals from 360-830.");
	this.addInfo(this.insClgInfo,true,null,"Colour temperature and Fluori adjustments combined into one 'White Balance' adjustement tool.");
	this.addInfo(this.insClgInfo,true,null,"Colour temperature shifts calculated from mired values rather than mappings from lighting gel data, then converted to working colour space's white point.");
	this.addInfo(this.insClgInfo,true,null,"Fluori adjustment fixes to ensure that it is a Duv shift at the lamp's nominal CCT.");
	this.addInfo(this.insClgInfo,true,null,"LUT file options and generate button now remain visible when the preview window is on.");
	this.addInfo(this.insClgInfo,true,null,"The cursor becomes a crosshair over the preview window, with 10-bit code values for the output image at that point displayed above.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC15");
	this.addInfo(this.insClgInfo,true,null,"Added ACEScg colour space (AP1) with ACEScc and ACESproxy gammas.");
	this.addInfo(this.insClgInfo,true,null,"Beta - added Nikon .NCP LUT format with initial Nikon styles support.");
	this.addInfo(this.insClgInfo,true,null,"LUT formats can now specify acceptable input gammas (eg Nikon styles for NCP).");
	this.addInfo(this.insClgInfo,true,null,"Refined and improved CAT calculations for colour temperature and fluori magenta/green shifts.");
	this.addInfo(this.insClgInfo,true,null,"Default CAT is now CIECAT02 throughout.");
	this.addInfo(this.insClgInfo,true,null,"Fixed Canon IDT out - daylight and tungsten calculated options are now the right way around.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC14");
	this.addInfo(this.insClgInfo,true,null,"Tweaked Preview 'data range' option so that black remains black (it shows 10-bit 64 to 10-bit 1023). Changed the options to '100%' and '109%'.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC13");
	this.addInfo(this.insClgInfo,true,null,"Fixed Highlight Gamut bug which could cause freezing / crashing");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC12");
	this.addInfo(this.insClgInfo,true,null,"Added legal / data toggle to the Preview so that it can be used to display the whole data range.");
	this.addInfo(this.insClgInfo,true,null,"Preview code adjustment to avoid reloading / glitches.");
	this.addInfo(this.insClgInfo,true,null,"Fixed MLUT clipping bug.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC11");
	this.addInfo(this.insClgInfo,true,null,"Colourspace calculation overhaul. All gamuts transforms are now calculated at startup from chromacity / whitepoint data. Luma coefficients and CATs are calculated from the choice of working gamut (currently S-Gamut3.cine), which can now be any of the available options.");
	this.addInfo(this.insClgInfo,true,null,"This makes it easier to add Gamuts / Colourspaces. DCI-P3, DCI-P3D60, Canon's DCI-P3+, Adobe RGB and Adobe Wide Gamut RGB have been added.");
	this.addInfo(this.insClgInfo,true,null,"New attempt at the C300 colourspace - still a work in progress!");
	this.addInfo(this.insClgInfo,true,null,"More accurate colour temperature shifts.");
	this.addInfo(this.insClgInfo,true,null,"Simplified fluorescent / LED green / magenta control.");
	this.addInfo(this.insClgInfo,true,null,"Fixed a bug where the output range was not adjusting correctly for non-log gammas.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC10");
	this.addInfo(this.insClgInfo,true,null,"LUTCalc For Mac can now read in 16-bit TIFFs and PNGs for use in the preview window.");
	this.addInfo(this.insClgInfo,true,null,"Added a 16-stop grayscale to the preview defaults.");
	this.addInfo(this.insClgInfo,true,null,"Updated instructions.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC9");
	this.addInfo(this.insClgInfo,true,null,"Added support for more LUT formats: .3dl (Flame / Assimilate flavour, Lustre flavour and Kodak flavour), .lut (assimilate flavour), .spi1d and .spi3d.");
	this.addInfo(this.insClgInfo,true,null,"LUTAnalyst support for nonlinear input values (shaper LUTs) and scaled input values (common with narrow dynamic range inputs such as linear or Rec709).");
	this.addInfo(this.insClgInfo,true,null,"Scaled inputs can be used with LUT generation (where the format allows it).");
	this.addInfo(this.insClgInfo,true,null,"LUTAnalyst will attempt to provide a reversed transfer function to the 'Recorded Gamma' options.");
	this.addInfo(this.insClgInfo,true,null,"Bugfixes");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC8");
	this.addInfo(this.insClgInfo,true,null,"Bugfix");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC7");
	this.addInfo(this.insClgInfo,true,null,"Simplified output range choices with usage and application selections. The user can choose to build a LUT intended for post grading, or one for use in a camera or on set (MLUT), and then choose the particular grading application or camera and LUTCalc will offer appropriate settings and save to the correct file format.");
	this.addInfo(this.insClgInfo,true,null,"Generalised LUT reading / writing code. LUTAnalyst can now understand .cubes, DaVinci .iluts and .oluts and Panasonic .vlts. LUTCalc can construct LUT files in these formats, and it is now straightforward to add more.");
	this.addInfo(this.insClgInfo,true,null,"Bugfix to PSST-CDL interpolation code - adjustments should now appear more logical.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC6");
	this.addInfo(this.insClgInfo,true,null,"Added an approximation of the forthcoming Canon Log 2 curve in the C300 mkII. This is derived from data in a chart shown in Canon's 'Introducing the Canon EOS C300 Mark II' video, hence is only an approximation. It appears to be very similar to Arri's LogC, with slightly lower-contrast shadows.");
	this.addInfo(this.insClgInfo,true,null,"Scrollbars now more smoothly adapt to display size, appearing only when the browser window cannot fit all information.");
	this.addInfo(this.insClgInfo,true,null,"The default previews now include a Rec709 colourwheel. This displays the range of colours available with the Rec709 gamut in an arrangement akin to a completely full vectorscope. The default previews cycle: High Contrast -> Low Contrast -> Rec709 Gamut -> back to High Contrast.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC5");
	this.addInfo(this.insClgInfo,true,null,"Added sensor black and white clip and 18% gray (when exposure compensation is applied) to Stop/IRE chart.");
	this.addInfo(this.insClgInfo,true,null,"Various bug fixes to PSST-CDL controls.");
	this.addInfo(this.insClgInfo,true,null,"Refined PSST-CDL parameters.");
	this.addInfo(this.insClgInfo,true,null,"Added PSST-CDL instructions.");
	this.addInfo(this.insClgInfo,true,null,"Fixed bug where Linear / Rec709 input gamma options were not generating LUTs.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC4");
	this.addInfo(this.insClgInfo,true,null,"Preview speedups.");
	this.addInfo(this.insClgInfo,true,null,"Bug Fixes.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC3");
	this.addInfo(this.insClgInfo,true,null,"Tidied and made consistent the code for customisation tweaks. Each tweak is now an individual object file, following a consistent basic structure both at the UI stage and in the calculation code.");
	this.addInfo(this.insClgInfo,true,null,"Added splash screen to immediately hide the Javascript warning and then hide the splash when the UI has loaded.");
	this.addInfo(this.insClgInfo,true,null,"Added initial code for 'PSST-CDL' customisation; (P)rimary (S)econdary (S)kin (T)one colour decision list. Quickly allows complex adjustment to individual sectors of the vectorscope using controls familiar from the ASC-CDL.");
	this.addInfo(this.insClgInfo,true,null,"Added option to False Colour to set the white clip level in stops above 18% gray.");
	this.addInfo(this.insClgInfo,true,null,"Improved the coefficients used for S-Gamut3.cine luminance.");
	this.addInfo(this.insClgInfo,true,null,"Initial tidying of UI control code to change from object.style.display approach over to object.className. Visuals are then completely controlled by style sheets, allowing fundamental reskinning for different platforms / applications.");
	this.addInfo(this.insClgInfo,true,null,"Speedup in preview from increased use of transferrable objects.");
	this.addInfo(this.insClgInfo,true,null,"Allow 1D LUTs to include the ASC-CDL customisation (minus the saturation control).");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC2");
	this.addInfo(this.insClgInfo,true,null,"Fixed bug which turned off customisations.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 RC1");
	this.addInfo(this.insClgInfo,true,null,"Fixed 'Highlight Level' maps to box bug.");
	this.addInfo(this.insClgInfo,true,null,"Allow black level and highlight level adjustment with log curves.");
	this.addInfo(this.insClgInfo,true,null,"Fixed Canon CP IDT not available in LUTAnalyst bug.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 Beta 9");
	this.addInfo(this.insClgInfo,true,null,"Simplified False Colour calculation. Now works with every output gamma / gamut / tweak option.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 Beta 8");
	this.addInfo(this.insClgInfo,true,null,"Added False Colour.");
	this.addInfo(this.insClgInfo,true,null,"Black Level and Highlight Level now take into account ASC-CDL.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 Beta 4");
	this.addInfo(this.insClgInfo,true,null,"Added ASC CDL controls tweak.");
	this.addInfo(this.insClgInfo,true,null,"Added Waveform.");
	this.addInfo(this.insClgInfo,true,null,"Added RGB Parade.");
	this.addInfo(this.insClgInfo,true,null,"Preview, Waveform, Vectorscope and Parade can now all be displayed at the same time.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 Beta 3");
	this.addInfo(this.insClgInfo,true,null,"Added green correction tool.");
	this.addInfo(this.insClgInfo,true,null,"Added Vectorscope option to previews. Includes Rec709 75% and 100% boxes, plus a set of Rec709 75% boxes mapped to the current colour space.");
	this.addInfo(this.insClgInfo,true,null,"Adjusted test image primary boxes to be Rec709 75% and 100% colours.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 Beta 2");
	this.addInfo(this.insClgInfo,true,null,"Fixed missing FileSaver.js and Blob.js files.");
	this.addInfo(this.insClgInfo,true,null,"Added Google Chrome packaged app code.");
	this.addInfo(this.insClgInfo,false,null,"v1.9 Beta 1");
	this.addInfo(this.insClgInfo,true,null,"Added real-time(ish) preview, currently with built-in low and high-contrast test images.");
	this.addInfo(this.insClgInfo,true,null,"Test images include 75% saturation primaries and secondaries in Rec709 and Rec2020, 16-stop grayscale and colour charts at correct exposure and +/- 2 stops (low contrast image) and  +/- 4 stops (high contrast image).");
	this.addInfo(this.insClgInfo,true,null,"Test images are 16-bit and stored as most significant bits (MSB) and least significant bits (LSB) 8-bit PNGs.");
	this.addInfo(this.insClgInfo,true,null,"Added colour temperature adjustment to tweaks. Available to 3D LUTs. Can be set as either CTO / CTB values or as recorded and desired colour temperature (advanced settings). Also under advanced various chromatic adaptation models are available for the adjustment.");
	this.addInfo(this.insClgInfo,true,null,"Added Rec2020 colour space.");
	this.addInfo(this.insClgInfo,true,null,"Fixed matrix bug from previous beta.");
	this.addInfo(this.insClgInfo,true,null,"Bumped version number to 1.9 as new features and changes are substantial enough for final release to be v2.0.");
	this.addInfo(this.insClgInfo,false,null,"v1.5 Beta 3");
	this.addInfo(this.insClgInfo,true,null,"Fixed a LUTAnalyst input gamut bug. Recalculated V709.");
	this.addInfo(this.insClgInfo,false,null,"v1.5 Beta 2");
	this.addInfo(this.insClgInfo,true,null,"Built-in colour-spaces based on LUTs now have their data stored in binary versions of LUTAnalyst files. Previously they were human-readable javascript variable declarations.");
	this.addInfo(this.insClgInfo,true,null,"The format now is Int32Array blobs stored in files ending 'labin'. LUTCalc uses Float64s internally (Javascript treats standard floats as 64-bit). Scaling 32-bit integers maintains much more precision than Float32s considering that the actual range is not generally more than 0-1 (the format allows -2 - +2).");
	this.addInfo(this.insClgInfo,true,null,"The format is little endian, first value the length of the transfer function (gamma) array, second value the length of the colour space array, then gamma and colour space data.");
	this.addInfo(this.insClgInfo,true,null,"This is a much more compact way to store the data, so 65x65x65 colour spaces are a little over twice the size of the previous 33x33x33 ones. Consequently LC709 and LC709A now produce SL3/SG3.cine to LC709(A) 3D LUTs numerically identical to the Sony look profiles.");
	this.addInfo(this.insClgInfo,true,null,"LC709 and LC709A colour spaces have been recalculated, Cine709 has been dropped (the transfer function is still available, and it is easy to import it with LUTAnalyst if needed).");
	this.addInfo(this.insClgInfo,true,null,"Tweaked the Brent method root finding code to be more robust.");
	this.addInfo(this.insClgInfo,false,null,"v1.5 Beta");
	this.addInfo(this.insClgInfo,true,null,"Major rewrite of the transfer function (gamma), colour space (gamut), LUT and LUTAnalyst code bases.");
	this.addInfo(this.insClgInfo,true,null,"Web workers are now used extensively for multithreading speed.");
	this.addInfo(this.insClgInfo,true,null,"Strided 1D typed arrays are gradually replacing multidimensional arrays for basic speed and for efficiency in passing to web workers.");
	this.addInfo(this.insClgInfo,true,null,"Linear interpolation code has been tidied up. Cubic is generally used, but with multithreading linear should be fast enough to allow real-time previews in a future version.");
	this.addInfo(this.insClgInfo,true,null,"Fixed a LUTAnalyst bug which could cause the wrong input gamut option to be used giving faulty results.");
	this.addInfo(this.insClgInfo,true,null,"Added a basic implementation of the Dolby PQ transfer function for high dynamic range displays. As it stands, rather than a nits scale, it is set to place 18% gray at the same 10-bit value as for Rec709.");
	this.addInfo(this.insClgInfo,true,null,"Added two alternative HDR transfer function proposals based on extending Rec709/Rec2020 with log highlights region. Both have 400% and 800% options.");
	this.addInfo(this.insClgInfo,true,null,"Added Panalog.");
	this.addInfo(this.insClgInfo,true,null,"Other small bugfixes.");
	this.addInfo(this.insClgInfo,false,null,"v1.3");
	this.addInfo(this.insClgInfo,true,null,"New Canon CP Lock output gamuts. Should be more reliable across the gamut for dropping in with Canon CP lock material.");
	this.addInfo(this.insClgInfo,false,null,"v1.22");
	this.addInfo(this.insClgInfo,true,null,"Added Panasonic Varicam V-Log and V-Gamut.");
	this.addInfo(this.insClgInfo,false,null,"v1.21");
	this.addInfo(this.insClgInfo,true,null,"Log gamma and LUTAnalyst range checking bugfixes.");
	this.addInfo(this.insClgInfo,false,null,"v1.2");
	this.addInfo(this.insClgInfo,true,null,"Added charts for % Reflectance against LUT % IRE and LUT % IRE in against LUT % IRE out.");
	this.addInfo(this.insClgInfo,true,null,"Fixed missing term in Arri LogC input equation.");
	this.addInfo(this.insClgInfo,false,null,"v1.1");
	this.addInfo(this.insClgInfo,true,null,"Canon CP Gamut In replaced by Canon CP IDT (Daylight) and Canon CP IDT (Tungsten). Beta testing. These use matrix coefficients from the ACES IDTs published by Canon for the C300, C500 and C100.Tungsten for 3200 or warmer, Daylight for 4300 and up.");
	this.addInfo(this.insClgInfo,true,null,"Canon CP Gamut Out replaced by LUTs derived from the IDTs using Newton-Raphson to invert. Alpha testing.");
	this.addInfo(this.insClgInfo,true,null,"CP Gamut In -> CP Gamut Out does not currently produce expected results. Possibly due to the reduced gamut of CP Rec709.");
	this.addInfo(this.insClgInfo,true,null,"Removed code duplication in the tricubic calculations, and made out-of-bounds handling more sensible. This has slowed the tricubic somewhat. I will look to optimise.");
	this.addInfo(this.insClgInfo,true,null,"Fixed MLUT bugs which meant that the appropriate clipping was not happening, and that changing to a log output gamma with MLUT checked would lead to the wrong output scaling.");
	this.addInfo(this.insClgInfo,true,null,"Provisional fix for an out-of-bounds (NaN) bug in LUTAnalyst with gammas of less dynamic range than S-Log3, ie Canon C-Log.");
	this.addInfo(this.insClgInfo,false,null,"v1.0");
	this.addInfo(this.insClgInfo,true,null,"Introduced 'LUTAnalyst' - a tool to convert 1D and 3D LUTs (currently cubes) to 1D S-Log3 to new transfer gamma LUTs plus 3D S-Gamut3.cine to new colour space gamut LUTs. LUTCalc can then use these to use the new gamma and / or gamut as you can with any of the built in options.");
	this.addInfo(this.insClgInfo,true,null,"Totally recoded the handling of LUTs as data sources in LUTCalc.");
	this.addInfo(this.insClgInfo,true,null,"Substantially improved LC709 and LC709A colour transforms - added in Cine+Rec709.");
	this.addInfo(this.insClgInfo,true,null,"Added initial cubic interpolation for 1D and tricubic interpolation for 3D code.");
	this.addInfo(this.insClgInfo,false,null,"v0.9991");
	this.addInfo(this.insClgInfo,true,null,"Released code on Github");
	this.addInfo(this.insClgInfo,true,null,"UI CSS tweaks and removal of Sentenza Desktop code for the time being as no binary release. Web App only again for now!");
	this.addInfo(this.insClgInfo,false,null,"v0.999");
	this.addInfo(this.insClgInfo,true,null,"Total rewrite of the code base to be modular and object oriented. Simplifies altering and adding features.");
	this.addInfo(this.insClgInfo,true,null,"Shifted UI to match between the Mac app and web app versions and hopefully make options as clear as possible.");
	this.addInfo(this.insClgInfo,true,null,"Added LUT-based Canon CP Lock Gamut in and out derived from analysing numerous side-by-side test images. Far from perfect and consider experimental, but seems to give a good match going from Sony to Canon and a really good match going from Canon to Sony. Definitely shows the advantage of the 10-bit, 14-stop Sony cameras! The main caveats are that limitations on the free Excel solver make the saturated blue and cyan trickier to optimize and I do not have a C300 to check against, just the (numerous) test images I took to build the gamut.");
	this.addInfo(this.insClgInfo,true,null,"Added Arri LogC gamma options along with Arri Wide Gamut. Arri's approach to log does odd things from ISO 1600 and up, feathering the highlight to avoid clipping. I have tried to factor in the shoulder point by comparing Arri LUT Generator LUTs with the stock equation. As such, this option is somewhere between experimental and more useful for comparing charts than producing LUTs :-).");
	this.addInfo(this.insClgInfo,false,null,"v0.991");
	this.addInfo(this.insClgInfo,true,null,"Fixed bug with customising Canon WideDR.");
	this.addInfo(this.insClgInfo,true,null,"Cleaned up layout.");
	this.addInfo(this.insClgInfo,false,null,"v0.99");
	this.addInfo(this.insClgInfo,true,null,"First version of Mac App.");
	this.addInfo(this.insClgInfo,true,null,"Total overhaul of colour transforms and recalculation of all estimated gammas.");
	this.addInfo(this.insClgInfo,true,null,"Colour transforms are now done either by conventional matrices, using colour LUTs or combinations of both.");
	this.addInfo(this.insClgInfo,true,null,"Calculated LC709 and LC709A colour LUTs from the Sony looks. This required an improved mapping of the gamma curves.");
	this.addInfo(this.insClgInfo,true,null,"Tweaks to the S-Log2 gamma calculation should mean better high ISO CineEI shifts. It has now been finessed using the Sony S-Log2 to Rec709 ilut in Resolve.");
	this.addInfo(this.insClgInfo,true,null,"Canon C-Log is now directly from an equation published by Canon.");
	this.addInfo(this.insClgInfo,true,null,"Added a table of IRE and 10-bit values for the current output gamma to the 'Gamma Info' tab. This includes any customisations so will give a good guide to appropriate recording levels.");
	this.addInfo(this.insClgInfo,false,null,"v0.981");
	this.addInfo(this.insClgInfo,true,null,"Housekeeping Release.");
	this.addInfo(this.insClgInfo,true,null,"Added fileSaver.js and Blob.js by Eli Grey (eligrey.com) to allow saving directly to .cube files rather than the new tab Kludge. Not only a lot easier and neater, by just saving to file the LUT process is MUCH quicker.");
	this.addInfo(this.insClgInfo,true,null,"To go with the file saving, the 'LUT Title' option has now become 'LUT Title / Filename', and will now be used as the filename for the .cube.");
	this.addInfo(this.insClgInfo,true,null,"When a log gamma is selected for output, the range defaults to 'data'. Other curves (and with MLUT selected) default to 'legal' range. This is more appropriate for further processing of log curves.");
	this.addInfo(this.insClgInfo,true,null,"3D Gamuts default to 'Passthrough' (gamma only), pending colour overhaul.");
	this.addInfo(this.insClgInfo,true,null,"LUT values are fixed length at 10 decimal places (that ought to do for now ;-) ).");
	this.addInfo(this.insClgInfo,false,null,"v0.98");
	this.addInfo(this.insClgInfo,true,null,"Added 'Rec709 Like' as options for both recorded and output gamma. This really means 'Gamma Corrected Linear', but to avoid confusion over the two meanings of gamma and to keep consistency with the 'Rec709 (No Knee) option of previous versions it's 'Rec709 Like' for now :-).");
	this.addInfo(this.insClgInfo,true,null,"Rec709 Like brings up an additional option box for selecting the gamma correction. The choices are currently 'Rec709', 'sRGB' and 'Linear'. The first two use the gammas specified in their respective standards and 'Linear' means a gamma of 1 (this doubles up on the output option of 'Linear', but allows for linear input and again maintains consistency with previous versions).");
	this.addInfo(this.insClgInfo,false,null,"v0.97");
	this.addInfo(this.insClgInfo,true,null,"Added 'Gamma Chart' button that displays the input and output gammas plotted data range value against stop (IE 9+, Safari 5.1+, Chrome, Firefox, Opera).");
	this.addInfo(this.insClgInfo,true,null,"Added S-Log as a gamma option (along with PMW-F3 and F35 as camera options).");
	this.addInfo(this.insClgInfo,false,null,"v0.96");
	this.addInfo(this.insClgInfo,true,null,"Added highlight scaling as an option for remapping preferred IRE values without affecting black. Also improved black scaling code to work with it.");
	this.addInfo(this.insClgInfo,true,null,"Started code cleanup.");
	this.addInfo(this.insClgInfo,true,null,"'Passthrough' is now a functional option for gamuts. It means that the colour gamut is unprocessed, ie a 3D LUT behaves like a 1D gamma only LUT. Use it for making an MLUT version of a 1D LUT.");
	this.addInfo(this.insClgInfo,true,null,"Added reflected value mapping IREs for various gammas to the 'Gamma Info' tab.");
	this.addInfo(this.insClgInfo,false,null,"v0.95");
	this.addInfo(this.insClgInfo,true,null,"Differently calculated, more precise LC709 / LC709A curves.");
	this.addInfo(this.insClgInfo,false,null,"v0.94");
	this.addInfo(this.insClgInfo,true,null,"Further range bugfix to LC709 / LC709A.");
	this.addInfo(this.insClgInfo,true,null,"Added separate input range and output range options. Sony Look Profiles are data input / legal output.");
	this.addInfo(this.insClgInfo,false,null,"v0.93");
	this.addInfo(this.insClgInfo,true,null,"Fixed errors in LC709 and LC709A from treating the Look Profiles as data (extended) range rather than legal range. Black level was set too low and white too high.");
	this.addInfo(this.insClgInfo,true,null,"Added options for creating either legal level (64-940, 0%-100% IRE) LUTs or data level (0-1023, -7%-109% IRE). Previously the LUTs were generated to work with a data levels workflow only.");
	this.addInfo(this.insClgInfo,true,null,"Added a check to the MLUT option to ensure the correct (legal) range.");
	this.addInfo(this.insClgInfo,false,null,"v0.92");
	this.addInfo(this.insClgInfo,true,null,"Gets named 'LUTCalc'");
	this.addInfo(this.insClgInfo,true,null,"Improved 709 matrix from profiling F55 in Custom Mode, rather than Sony published matrix.");
	this.addInfo(this.insClgInfo,true,null,"Added Canon Cinema Gamut from Canon published matrix.");
	this.addInfo(this.insClgInfo,true,null,"Added Canon WideDR Gamma out.");
	this.addInfo(this.insClgInfo,true,null,"Added info page about the log gammas.");
	this.addInfo(this.insClgInfo,false,null,"v0.91");
	this.addInfo(this.insClgInfo,true,null,"Improved Canon CP Lock matrix.");
	this.addInfo(this.insClgInfo,false,null,"v0.9");
	this.addInfo(this.insClgInfo,true,null,"Added 'Black Level' adjustment to customisation options for non-log output gammas.");
	this.addInfo(this.insClgInfo,false,null,"v0.8");
	this.addInfo(this.insClgInfo,true,null,"Added 'Camera MLUT' option to keep things in range for use in the camera (tested on v4.1).");
	this.addInfo(this.insClgInfo,false,null,"v0.7");
	this.addInfo(this.insClgInfo,true,null,"Added 'Canon CP Lock Gamut' as an input/output Gamut option. Combine with the C-Log Gamma option for quick matching of C300 material with F5/55.");
	this.addInfo(this.insClgInfo,true,null,"The gamma is accurate and from the official Canon LUT, but the gamut conversion is estimated from test shots");
	this.addInfo(this.insClgInfo,true,null,"Consider it experimental and test!");
	this.addInfo(this.insClgInfo,true,null,"I don't have a C300 available for further testing, so feedback would be great.");
	this.addInfo(this.insClgInfo,true,null,"Added 'Customisation' box, with 'Highlight Gamut' option.");
	this.addInfo(this.insClgInfo,true,null,"Highlight gamut is only available with 3D LUTs, and allows a transition to a second gamut/matrix in the highlights. This should allow more complex colour handling, as with the Type A Sony Look.");
	this.addInfo(this.insClgInfo,true,null,"Added 'B&W (Rec709 Luma)' as an output Gamut option.");
	this.addInfo(this.insClgInfo,true,null,"Fixed an IRE scaling bug on the 'Linear' output Gamma option.");
	this.addInfo(this.insClgInfo,true,null,"Fixed a silly bug with some input Gamut options which meant that S-Log2 and C-Log material were being treated as S-Gamut3.cine regardless of input Gamut choice.");
	this.addInfo(this.insClgInfo,false,null,"v0.6");
	this.addInfo(this.insClgInfo,true,null,"First release as Javascript web app.");
	this.addInfo(this.insClgInfo,true,null,"Initial inclusion of colour space matrices to 3D LUTs.");
	this.addInfo(this.insClgInfo,false,null,"v0.5");
	this.addInfo(this.insClgInfo,true,null,"Fixed incorrect LUT 3D SIZE in 65x65x65 version.");
	this.addInfo(this.insClgInfo,false,null,"v0.4");
	this.addInfo(this.insClgInfo,true,null,"Added Cineon.");
	this.addInfo(this.insClgInfo,true,null,"Fixed stupid error on S-Log2 input for 1D LUTs.");
	this.addInfo(this.insClgInfo,false,null,"v0.3");
	this.addInfo(this.insClgInfo,true,null,"Separate 33x33x33 and 65x65x65 versions. Added 1024-point 1D version.");
	this.addInfo(this.insClgInfo,true,null,"Cleaned up 'Calc' sheet for clarity and to allow 1D LUTs.");
	this.addInfo(this.insClgInfo,true,null,"Corrected curves against stop chart for clarity.");
	this.addInfo(this.insClgInfo,true,null,"Added 'Exposure Only' option that just shifts the input curve.");
	this.addInfo(this.insClgInfo,false,null,"v0.2");
	this.addInfo(this.insClgInfo,true,null,"65x65x65 LUTs.");
	this.addInfo(this.insClgInfo,false,null,"v0.1");
	this.addInfo(this.insClgInfo,true,null,"First Release.");
	this.insClg.className = 'info-page-hide';
	this.insClg.appendChild(this.insClgInfo);
};
LUTInfoBox.prototype.createCustColour = function() {
	this.custColour = document.createElement('div');
	this.custColour.id = 'cust-colour';
	this.custColourBack = document.createElement('input');
	this.custColourBack.setAttribute('type','button');
	this.custColourBack.value = 'Back';
	this.custColour.appendChild(this.custColourBack);
	this.custColourInfo = document.createElement('div');
	this.custColourInfo.setAttribute('class','infotext');
	this.addInfo(this.custColourInfo,false,'Custom Colour Space',"This panel appears for 3D LUTs when 'Custom' is selected as either the recorded or output gamut.");
	this.addInfo(this.custColourInfo,false,null,'It is a technical option for creating additional colour space / gamut options from either xy white point and primaries or via matrix values to one of the built-in options.');
	this.addInfo(this.custColourInfo,false,null,'As such it is a tool intended for a specific, specialist use.');
	this.addInfo(this.custColourInfo,false,null,'Put another way, as a cameraman it is not something I expect to find myself using!');
	this.custColourInfo.appendChild(this.createFigure('tweak','pngs/cust-colour-1.png',1.6654));
	this.addInfo(this.custColourInfo,false,'White Point & Primaries',"With this you define a colourspace by defining the white point either with xy values or from a drop-down list of standard illuminants. The primaries are then set by entering further xy values.");
	this.addInfo(this.custColourInfo,false,null,"LUTCalc's processing colourspace uses D65 as its white point, so if the custom colourspace uses a different white point, a chromatic adaptation transform, or CAT, is used. By default LUTCalc uses CIECAT02, though other options such as Bradford can be selected from the CAT model list.");
	this.custColourInfo.appendChild(this.createFigure('tweak','pngs/cust-colour-2.png',1.0067));
	this.addInfo(this.custColourInfo,false,'Matrix','with this panel you can enter matrix values directly. You can toggle between input and output matrix and LUTCalc will automatically generate the inverse. By default the working colourspace is set to Rec709, but this can be changed to whatever is appropriate for the matrix values.');
	this.addInfo(this.custColourInfo,false,'Set Primaries',"When an appropriately formed matrix is entered and differs from the matrices generated from the Primaries and White Point panel, a 'Set Primaries' button becomes available. Pressing this calculates the primaries from the matrix entered plus the white point and CAT chosen, and displays them in the 'Primaries and White Point' panel.");
	this.addInfo(this.custColourInfo,false,'Update With Colourspace','This option recalculates the matrix values whenever the colourspace is changed.');
	this.addInfo(this.custColourInfo,false,null,"As with the 'White Point & Primaries' panel, the CAT can be changed. With the 'Matrix' panel it is used to go between the selected working colourspace and LUTCalc's internal processing space.");
	this.addInfo(this.custColourInfo,false,null,'The matrices are applied to linear image data.');
	this.addInfo(this.custColourInfo,false,null,"Initially the 'Matrix' panel is completely independent of the 'White Point & Primaries' panel. If you change anything under 'White Point & Primaries', the matrix panel will lock to it and calculate from the white point and primary options.");
	this.addInfo(this.custColourInfo,false,'New / Remove',"You can create multiple custom colour spaces and save them with the main 'Save Settings' button.");
	this.addInfo(this.custColourInfo,false,'Input Choice / Output Choice',"Use these options to set which colourspaces will be used when the recorded and output gamuts are set to 'Custom'.");
	this.custColour.className = 'info-page-hide';
	this.custColour.appendChild(this.custColourInfo);
};
LUTInfoBox.prototype.createCustWht = function() {
	this.custWht = document.createElement('div');
	this.custWht.setAttribute('id','cust-cts');
	this.custWhtBack = document.createElement('input');
	this.custWhtBack.setAttribute('type','button');
	this.custWhtBack.value = 'Back';
	this.custWht.appendChild(this.custWhtBack);
	this.custWhtInfo = document.createElement('div');
	this.custWhtInfo.setAttribute('class','infotext');
	this.custWhtInfo.appendChild(this.createFigure('tweak','pngs/cust-wht-1.png',1.9227));
	this.addInfo(this.custWhtInfo,false,null,"'White Balance' warms or cools the picture to fine tune white balances, or to provide intermediate temperatures unavailable in camera (eg CineEI on the Sony F cameras) through a LUT.");
	this.addInfo(this.custWhtInfo,false,null,'It also includes the complementary green / magenta shift to correct for lightsources away from the nominal colour temperature.');
	this.addInfo(this.custWhtInfo,false,null,'Temperature adjustments can be made using a slider which approximates the values of CTO and CTB lighting gel, or for more photometrically precise adjustment the recorded and desired colour temperatures can be entered.');
	this.addInfo(this.custWhtInfo,false,null,'Green / magenta adjustments for correcting lighting such as fluorescents are made with a similar plus green / minus green slider.');
	this.addInfo(this.custWhtInfo,false,null,"the nature of the green / magenta shift is dependent upon the lightsource's nominal temperature relative to the reference white balance. By default this is locked to the colour temperature shift, but by clicking 'Unlock Lightsource From New White' you can set the lamp's nominal temperature separately from the CTO / CTB shift.");
	this.custWhtInfo.appendChild(this.createFigure('box','pngs/cust-wht-2.png',4.766));
	this.addInfo(this.custWhtInfo,false,null,"When the preview window is active, a button marked 'Preview Click For White' becomes available. Once activated, clicking on the preview window will cause LUTCalc to attempt to white balance to the chosen area.");
	this.addInfo(this.custWhtInfo,false,null,'Activating the advanced options brings up a selection of nominal temperatures for fluorescent lamps, rather than entering a colour temperature directly.');
	this.addInfo(this.custWhtInfo,false,null,'The adjustments are done using a Von Kries-style chromatic transform - by default the relatively standard CIECAT02 - but with the advanced option the choice of CAT matrix becomes user selectable.');
	this.custWht.className = 'info-page-hide';
	this.custWht.appendChild(this.custWhtInfo);
};
LUTInfoBox.prototype.createCustPsst = function() {
	this.custPsst = document.createElement('div');
	this.custPsst.setAttribute('id','cust-psst');
	this.custPsstBack = document.createElement('input');
	this.custPsstBack.setAttribute('type','button');
	this.custPsstBack.value = 'Back';
	this.custPsst.appendChild(this.custPsstBack);
	this.custPsstInfo = document.createElement('div');
	this.custPsstInfo.setAttribute('class','infotext');
	this.custPsstInfo.appendChild(this.createFigure('tweak','pngs/cust-psst-1.png',1.697));
	this.addInfo(this.custPsstInfo,false,null,'PSST-CDL is intended to take the controls provided by ASC-CDL and apply them selectively to specific ranges of colours on the vectorscope.');
	this.addInfo(this.custPsstInfo,false,null,"PSST stands for (P)rimary, (S)econdary and (S)kin (T)one. The default window allows adjustment to reds, greens and blues (primaries), magentas, yellows and cyans (secondaries) and skin tone (based on a combination of a Vectorscope 'I'-line and colour chart 'Light Skin' and 'Dark Skin' values). Adjustments are interpolated between these base colours.");
	this.addInfo(this.custPsstInfo,true,'Colour',"Similar to the 'Hue' in HSV and HSL, Colour here is the offset from the chosen base colour. PSST separates each base colour by a value of 1, so red to skin tone is 1, red to green is 3 and magenta to cyan in 5.");
	this.addInfo(this.custPsstInfo,true,null,'7 equates to a complete circuit (blue -> blue) and negative values are allowed (blue to green is 6 or -1).');
	this.addInfo(this.custPsstInfo,true,'Saturation','Adjusts the colour intensity within the chosen colour range. 1 is the default, 0 is a Rec709 grayscale.');
	this.addInfo(this.custPsstInfo,true,'Slope','Analogous to gain, an input value is multiplied by this. Defined as any value from 0 (a flat line) up, the default value is 1.0.');
	this.addInfo(this.custPsstInfo,true,null,'LUTCalc applies the PSST-CDL on linear data, so slope behaves like an exposure adjustment. 0.5 = one stop down, 0.25 = two stops. 2 = one stop up, 4 = two stops.');
	this.addInfo(this.custPsstInfo,true,'Offset',"a value simply added or subtracted from an input value, carried out after the slope");
	this.addInfo(this.custPsstInfo,true,'Power',"Analogous to 'gamma', once an input value has had the slope and offset applied, it is raised to the power of the power parameter. The range is any value from zero up.");
	this.addInfo(this.custPsstInfo,false,null,"The seven base colours allow for some interesting effects, but for greater control PSST-CDL can specify adjustments for intermediate colours. This is done by clicking 'Refinements'");
	this.custPsstInfo.appendChild(this.createFigure('tweak','pngs/cust-psst-2.jpg',1.4737));
	this.addInfo(this.custPsstInfo,false,null,'The Refinements window shows a set of vertical sliders which can be used to make adjustments to both the seven base colours and intermediate colours. Rather like a graphic equalizer.');
	this.addInfo(this.custPsstInfo,false,null,"The initial intermediate values are interpolated from any adjustments made in the 'Base Adjustments' window.");
	this.addInfo(this.custPsstInfo,false,null,'Refinements defaults to adjusting Saturation, but this can be changed to Colour, Slope, Offset or Power.');
	this.addInfo(this.custPsstInfo,false,null,'To fix an intermediate value, click on the checkbox beneath the slider. A ticked checkbox will not be interpolated by Base Adjustment changes.');
	this.addInfo(this.custPsstInfo,false,null,'The spectrum background displays the effect of PSST adjustments in the current colour space (top and bottom before, centre after).');
	this.custPsstInfo.appendChild(this.createFigure('box','pngs/cust-psst-3.png',6.137));
	this.addInfo(this.custPsstInfo,false,null,'The primaries and secondaries on a Rec709 vectorscope take the shape of a squashed hexagon, ie the distance from the centre (grayscale) to the edges (100% saturation) varies with colour. Equally, the luma (Y) value of a full saturation varies with colour, reflecting the sensitivity of human vision.');
	this.addInfo(this.custPsstInfo,false,null,'By default, when a PSST colour shift is applied, PSST-CDL will attempt to scale the magnitude on the vectorscope to match the difference between the values for the initial and final colours. For a full match, the Y value would also need to be scaled. However this tends to produce extreme results on real images, so is off by default.');
	this.addInfo(this.custPsstInfo,false,null,'The advanced settings in PSST-CDL allow these two scalings to be turned on or off.');
	this.custPsst.className = 'info-page-hide';
	this.custPsst.appendChild(this.custPsstInfo);
};
LUTInfoBox.prototype.createCustASC = function() {
	this.custASC = document.createElement('div');
	this.custASC.setAttribute('id','cust-cdl');
	this.custASCBack = document.createElement('input');
	this.custASCBack.setAttribute('type','button');
	this.custASCBack.value = 'Back';
	this.custASC.appendChild(this.custASCBack);
	this.custASCInfo = document.createElement('div');
	this.custASCInfo.setAttribute('class','infotext');
	this.custASCInfo.appendChild(this.createFigure('tweak','pngs/cust-asc-1.png',2.6047));
	this.addInfo(this.custASCInfo,false,null,'The ASC-CDL is a set of transforms developed by the American Society of Cinematographers intended to provide consistent adjustments across software and cameras.');
	this.addInfo(this.custASCInfo,false,null,'It is also a system of XML code for conveying those adjustments between systems and from frame to frame.');
	this.addInfo(this.custASCInfo,false,null,'LUTCalc provides the controls as a simple and clear way of adjusting the picture, but does not implement the full ASC-CDL system.');
	this.addInfo(this.custASCInfo,false,null,'The ASC-CDL is based around three basic parameters applied to each of the red, green and blue channels, plus a saturation parameter which couples all three:');
	this.addInfo(this.custASCInfo,true,'Slope','Analogous to gain, an input value is multiplied by this. Defined as any value from 0 (a flat line) up, the default value is 1.0.');
	this.addInfo(this.custASCInfo,true,null,'LUTCalc applies the ASC-CDL on linear data, so slope behaves like an exposure adjustment. 0.5 = one stop down, 0.25 = two stops. 2 = one stop up, 4 = two stops.');
	this.addInfo(this.custASCInfo,true,'Offset',"The definition and implementation of 'lift' can change between pieces of software, so the ASC uses the term 'offset' and defines it as a value simply added or subtracted from an input value. In the ASC-CDL this is carried out after the slope");
	this.addInfo(this.custASCInfo,true,'Power',"Analogous to 'gamma', once an input value has had the slope and offset applied, it is raised to the power of the power parameter. The range is any value from zero up.");
	this.addInfo(this.custASCInfo,true,'Saturation','All other ASC-CDL controls are applied on a colour channel by colour channel basis. Saturation takes the luma value of the RGB colour and scales the components such that a value of 0 gives a Rec709 grayscale, 1.0 leaves the image unaffected and anything above 1.0 increases the colour saturation.');
	this.addInfo(this.custASCInfo,false,null,'For simplicity, LUTCalc includes a luma channel alongside the red, green and blue and locking the individual channel adjustments together.');
	this.custASC.className = 'info-page-hide';
	this.custASC.appendChild(this.custASCInfo);
};
LUTInfoBox.prototype.createCustMulti = function() {
	this.custMulti = document.createElement('div');
	this.custMulti.setAttribute('id','cust-multi');
	this.custMultiBack = document.createElement('input');
	this.custMultiBack.setAttribute('type','button');
	this.custMultiBack.value = 'Back';
	this.custMulti.appendChild(this.custMultiBack);
	this.custMultiInfo = document.createElement('div');
	this.custMultiInfo.setAttribute('class','infotext');
	this.custMultiInfo.appendChild(this.createFigure('tweak','pngs/cust-multi-1.jpg',1.2308));
	this.addInfo(this.custMultiInfo,false,null,'Multitone combines two adjustments to quickly produce sophisticated colour effects tuned from stop to stop - saturation control and duotone.');
	this.addInfo(this.custMultiInfo,false,'Saturation Control','Within the limited data range of conventional digital recordings (8 or 10-bit integers) there is also a limit to the range of colours that can be represented for a given colourspace at a given luminence. This is the gamut.');
	this.addInfo(this.custMultiInfo,false,null,'Outside of this range colours will tend to clip. For pure primaries the result is solid blocks of colour, but for mixtures of the colour channels it can result in colours shifting away from expectation.');
	this.addInfo(this.custMultiInfo,false,null,"For example, Rec709 blue has a much lower luminence than green or red; as luminance increases past blue's limit, the other colour channels can take over.");
	this.addInfo(this.custMultiInfo,false,null,'The the row of saturation sliders in Multitone can be used to adjust saturation on a stop-by-stop basis, for example reducing the saturation as the level approaches 90% white (around 2 1/3 stops above 18% gray).');
	this.addInfo(this.custMultiInfo,false,null,"'Reset Saturation' will bring the colours back to their original intensity.");
	this.addInfo(this.custMultiInfo,false,'Duotone','A popular effect in traditional black and white printing is Duotone. This overlays a colour tint in the midtones and highlights with another in the shadows (generally black). The second control in Multitone extends this effect.');
	this.addInfo(this.custMultiInfo,false,null,"Clicking the 'Monochrome' button under the saturation sliders sets every stop to zero saturation. By default this means black and white.");
	this.addInfo(this.custMultiInfo,false,null,"At the most basic level this can be changed to a colour wash either by adjusting the 'Hue' and 'Saturation' sliders in the lower box, or by clicking on the gray square to bring up a colour picker.");
	this.custMultiInfo.appendChild(this.createFigure('box','pngs/cust-multi-2.jpg',1.3742));
	this.addInfo(this.custMultiInfo,false,null,'The picker shows the hue and saturation options of the Rec709 gamut mapped into the current colourspace. Most of the gamut options are wide enough to avoid clipping using any of these colours, though care should be taken when the output gamut is Rec709 that highly saturated choices - particularly blues - can lead to colour clipping in the highlights.');
	this.addInfo(this.custMultiInfo,false,null,"From the basic colour wash a duotone effect can be created by clicking the '+' button and selecting a second colour. The 'Stop' slider sets the luminance level where the colour choice is defined. Multitone interpolates between multiple colours.");
	this.addInfo(this.custMultiInfo,false,null,'Further colours can be added for tritone, quadtone, quintone etc.');
	this.addInfo(this.custMultiInfo,false,'Multitone','Combining the two effects can produce interesting results quickly. For example, saturation could be feathered downwards from 18% gray to 90% white, but towards a slightly warm wash, which then shifts towards pure grayscale in high highlights.');
	this.addInfo(this.custMultiInfo,false,null,"Coupled with the 'Knee' tool it is possible to produce very useful looks from the basic Rec709 gamma and gamut options which could hold up more robustly to further adjustment than LUT-derived colourspaces (such as LC709A).");
	this.custMulti.className = 'info-page-hide';
	this.custMulti.appendChild(this.custMultiInfo);
};
LUTInfoBox.prototype.createCustHG = function() {
	this.custHG = document.createElement('div');
	this.custHG.setAttribute('id','cust-gam');
	this.custHGBack = document.createElement('input');
	this.custHGBack.setAttribute('type','button');
	this.custHGBack.value = 'Back';
	this.custHG.appendChild(this.custHGBack);
	this.custHGInfo = document.createElement('div');
	this.custHGInfo.setAttribute('class','infotext');
	this.custHGInfo.appendChild(this.createFigure('tweak','pngs/cust-hg-1.png',2.8903));
	this.addInfo(this.custHGInfo,false,null,"With 'Highlight Gamut' a second colour space or gamut can be applied above a user-selectable exposure range.");
	this.addInfo(this.custHGInfo,false,null,'The transition can be calculated linearly, over a range of reflectance percentages (eg between 18% gray and 90% white) or logarithmically, set in stops above or below 18% gray.');
	this.addInfo(this.custHGInfo,false,null,'With this effects such as muted or black and white highlights with saturated midtones can be achieved in a LUT.');
	this.custHG.className = 'info-page-hide';
	this.custHG.appendChild(this.custHGInfo);
};
LUTInfoBox.prototype.createCustKnee = function() {
	this.custKnee = document.createElement('div');
	this.custKnee.setAttribute('id','cust-knee');
	this.custKneeBack = document.createElement('input');
	this.custKneeBack.setAttribute('type','button');
	this.custKneeBack.value = 'Back';
	this.custKnee.appendChild(this.custKneeBack);
	this.custKneeInfo = document.createElement('div');
	this.custKneeInfo.setAttribute('class','infotext');
	this.custKneeInfo.appendChild(this.createFigure('tweak','pngs/cust-knee-1.png',1.6057));
	this.addInfo(this.custKneeInfo,false,null,"The 'Knee' tool provides a means to capture a wide dynamic range whilst maintaining contrast in the midtones.");
	this.addInfo(this.custKneeInfo,false,'Legal Range / Extended Range','Sets the output IRE level at the defined white clip level. Legal range clips at 99% IRE (to allow for differences between colour channels). Extended range clips to 1% below 10-bit 1019.');
	this.addInfo(this.custKneeInfo,false,'Knee Start Level','The exposure level - in stops above 18% gray - at which the knee takes over from the base gamma.');
	this.addInfo(this.custKneeInfo,false,'Clip Level',"The exposure level - in stops above 18% gray - at which the knee reaches the clip level set with 'Legal Range / Extended Range'. For very wide dynamic ranges (Sony and Arri cameras can handle six or seven stops of headroom) keeping the knee start level low will help ensure a smooth rolloff.");
	this.addInfo(this.custKneeInfo,false,null,'Setting Knee Start Level too high with a high value of Clip Level can lead to ugly overshoots. These can be seen in and remedied with the charts normally visible where these instructions are.');
	this.addInfo(this.custKneeInfo,false,'Slope At Clip','The knee angle at the clip level. It is in % IRE per stop. A value of zero tends to lead to extremely compressed highlights and means that any values above white clip (such as in a grading LUT with exposure adjustment) will be indistinguishable, so a slight slope is generally advisable.');
	this.addInfo(this.custKneeInfo,false,'Smoothness','By default the LUTCalc creates a smooth, cubic knee rolloff. This is the prevailing approach in modern cameras. Adjusting the smoothness down will tend towards a hard, linear transition more akin to conventional video cameras such as Beta-SP and Digibeta.');
	this.addInfo(this.custKneeInfo,false,null,'With the current algorithm the cubic transition can overshoot where an extremely wide dynamic range is compressed into a very narrow range (high Knee Start Level). If that is required then setting smoothness to zero will avoid the overshoot.');
	this.custKnee.className = 'info-page-hide';
	this.custKnee.appendChild(this.custKneeInfo);
};
LUTInfoBox.prototype.createCustBhi = function() {
	this.custBhi = document.createElement('div');
	this.custBhi.setAttribute('id','cust-bhi');
	this.custBhiBack = document.createElement('input');
	this.custBhiBack.setAttribute('type','button');
	this.custBhiBack.value = 'Back';
	this.custBhi.appendChild(this.custBhiBack);
	this.custBhiInfo = document.createElement('div');
	this.custBhiInfo.setAttribute('class','infotext');
	this.custBhiInfo.appendChild(this.createFigure('tweak','pngs/cust-bhi-1.png',6.4));
	this.addInfo(this.custBhiInfo,false,null,'Black Level and Highlight Level apply an offset and scaling after all other adjustments and conversions have been applied.');
	this.custBhiInfo.appendChild(this.createFigure('tweak','pngs/cust-bhi-2.png',3.7333));
	this.addInfo(this.custBhiInfo,false,'Black Level','initially gives the % IRE level of 0% black in the output transfer function or gamma. This can then be fixed against highlight adjustments or reset, for example to thicken the black level by a measured amount.');
	this.addInfo(this.custBhiInfo,false,null,'Black Level and Highlight Level include ASC-CDL adjustments in their calculations, so any ASC-CDL adjustments should be made before Black Level and Highlight Level adjustments.');
	this.addInfo(this.custBhiInfo,false,null,"By default LUTCalc resets the Black and highlight levels when the underlying base level changes (eg when the output gamma is changed). 'Lock Value' prevents LUTCalc from changing the customised level.");
	this.custBhiInfo.appendChild(this.createFigure('tweak','pngs/cust-bhi-3.png',2.6988));
	this.addInfo(this.custBhiInfo,false,'Highlight Level','this will give the % IRE level of a selectable reflectance percentage (initially 90% white) for the output curve. Also shown is the equivalent % IRE in the Rec709 display gamma.');
	this.addInfo(this.custBhiInfo,false,null,'The output level can then be altered and LUTCalc will scale the output curve.');
	this.addInfo(this.custBhiInfo,false,null,'As with Black Level, Highlight Level incorporates ASC-CDL adjustments, so any ASC-CDL adjustments should be made before Black Level and Highlight Level adjustments.');
	this.addInfo(this.custBhiInfo,false,null,'Black and Highlight Level adjustments work together, for example to adjust the LC709 and LC709A curves from being legal range - peaking just below 100% - to extended range (Reflected 1350% maps to 108.9%) without changing the black level.');
	this.custBhi.className = 'info-page-hide';
	this.custBhi.appendChild(this.custBhiInfo);
};
LUTInfoBox.prototype.createCustSDRS = function() {
	this.custSDRS = document.createElement('div');
	this.custSDRS.setAttribute('id','cust-sdrs');
	this.custSDRSBack = document.createElement('input');
	this.custSDRSBack.setAttribute('type','button');
	this.custSDRSBack.value = 'Back';
	this.custSDRS.appendChild(this.custSDRSBack);
	this.custSDRSInfo = document.createElement('div');
	this.custSDRSInfo.setAttribute('class','infotext');
	this.custSDRS.className = 'info-page-hide';
	this.custSDRS.appendChild(this.custSDRSInfo);
};
LUTInfoBox.prototype.createCustBgm = function() {
	this.custBgm = document.createElement('div');
	this.custBgm.setAttribute('id','cust-bgm');
	this.custBgmBack = document.createElement('input');
	this.custBgmBack.setAttribute('type','button');
	this.custBgmBack.value = 'Back';
	this.custBgm.appendChild(this.custBgmBack);
	this.custBgmInfo = document.createElement('div');
	this.custBgmInfo.setAttribute('class','infotext');
	this.custBgmInfo.appendChild(this.createFigure('tweak','pngs/cust-bgm-1.png',3.8291));
	this.addInfo(this.custBgmInfo,false,null,'Black Gamma is a tool for adjusting contrast in the shadows without altering the level of black itself.');
	this.addInfo(this.custBgmInfo,false,'Stop Limit','This sets the maximum level at which black gamma has an effect. As with the other tools in LUTCalc, it is set based upon the real-world levels being recorded. The value is in stops, with zero being the level of an 18% gray target.');
	this.addInfo(this.custBgmInfo,false,'Feather','This attempts to smooth the transition between the black gamma and the underlying tone curve. It sets the number of stops below the stop limit in which to transition between the two.');
	this.addInfo(this.custBgmInfo,false,'Power','Sets the gamma or power value for the black gamma region. Values below 1 lead to reduced contrast, whilst values above 1 lead to increased contrast, emphasising shadows. A value of 1 has no effect.');
	this.custBgm.className = 'info-page-hide';
	this.custBgm.appendChild(this.custBgmInfo);
};
LUTInfoBox.prototype.createCustDCC = function() {
	this.custDCC = document.createElement('div');
	this.custDCC.setAttribute('id','cust-dcc');
	this.custDCCBack = document.createElement('input');
	this.custDCCBack.setAttribute('type','button');
	this.custDCCBack.value = 'Back';
	this.custDCC.appendChild(this.custDCCBack);
	this.custDCCInfo = document.createElement('div');
	this.custDCCInfo.setAttribute('class','infotext');
	this.custDCCInfo.appendChild(this.createFigure('tweak','pngs/cust-dcc-1.png',7.226));
	this.addInfo(this.custDCCInfo,false,null,"'Display Colourspace Converter' sits after all other colour adjustments and allows a look created for one colourspace to be adapted for another.");
	this.addInfo(this.custDCCInfo,false,null,"For example, it can be used to make a version of a look created for Rec709 displays that gives the same result on a DCI-P3 display.");
	this.custDCC.className = 'info-page-hide';
	this.custDCC.appendChild(this.custDCCInfo);
};
LUTInfoBox.prototype.createCustGlim = function() {
	this.custGlim = document.createElement('div');
	this.custGlim.setAttribute('id','cust-glim');
	this.custGlimBack = document.createElement('input');
	this.custGlimBack.setAttribute('type','button');
	this.custGlimBack.value = 'Back';
	this.custGlim.appendChild(this.custGlimBack);
	this.custGlimInfo = document.createElement('div');
	this.custGlimInfo.setAttribute('class','infotext');
	this.addInfo(this.custGlimInfo,false,null,'When going from a wide gamut, such as ACES or Arri Wide Gamut to a narrower one, such as Rec709 or sRGB, the range of colours outside of the destination gamut will generally result in RGB values beyond what is legal or even recordable within a limited codec range.');
	this.addInfo(this.custGlimInfo,false,null,'Tone maps and gamma corrections reduce this issue, and hard clipping can prevent it, but at the risk of unexpected colours and harsh transitions.');
	this.addInfo(this.custGlimInfo,false,null,'The Gamut Limiter tool aims to protect against out-of-bounds colours by desaturating anything too vibrant back within limits.');
	this.addInfo(this.custGlimInfo,false,null,'It can either be applied in linear space or more usually after all other tonemaps, gamma corrections and other contrast adjustments have been made.');
	this.custGlimInfo.appendChild(this.createFigure('tweak','pngs/cust-glim-1.png',4.766));
	this.addInfo(this.custGlimInfo,false,'Post Gamma','Applied after all other contrast adjustments, the Gamut Limiter will ensure that colour values do not go out of range on the final image.');
	this.addInfo(this.custGlimInfo,false,null,'By default, any pixel which has a difference of greater than 100% IRE between the brightest and darkest colour channel will be adjusted such that the difference is limited to 100% whilst maintaining the luma value.');
	this.addInfo(this.custGlimInfo,false,null,"The tolerance can be reduced, by adjusting the 'Level' value down, resulting in increasingly desaturated highlights, then midtones then shadows and can also be increased to 109%.");
	this.custGlimInfo.appendChild(this.createFigure('tweak','pngs/cust-glim-2.png',3.9298));
	this.addInfo(this.custGlimInfo,false,'Linear Space','This option applies the limiting to the pure, linear signal which is used for colour transform operations. It is rather less straightforward to use, with the level set according to the stops above 18% Mid Gray or 90% reflectance white.');
	this.addInfo(this.custGlimInfo,false,null,'As such, the effectiveness is determined by the white clip of the output gamma / tonemap used. The default fits to an un-kneed linear or basic gamma (Rec709, DCI). Log recordings potentially have considerably more highlight latitude available than this. The level should therefore be set with regard to white clip of the IRE vs Stop charts.');
	this.addInfo(this.custGlimInfo,false,null,"The potential usefulness of the linear space option is that it is mathematically simpler and arguably 'truer', with desaturation calculated against luminance.");
	this.custGlimInfo.appendChild(this.createFigure('tweak','pngs/cust-glim-3.png',3.9646));
	this.addInfo(this.custGlimInfo,false,'Gamut To Limit To','In addition to the output gamut, it is possible to limit chroma to within a second gamut. This might be useful where a finished clip may then be gamma and gamut corrected for a secondary use, such as Rec709 and P3 DCI versions.');
	this.addInfo(this.custGlimInfo,false,null,'Whilst limiting could be done separately for each version, applying to both offers the potential of consistency between different output applications.');
	this.addInfo(this.custGlimInfo,false,null,"By default when a second gamut is selected from the drop down box, both options will be limited to, and a tick box will show 'Protect Both'");
	this.addInfo(this.custGlimInfo,false,null,'Unticking this wil result in only the secondary gamut being considered in the limiting process.');
	this.custGlim.className = 'info-page-hide';
	this.custGlim.appendChild(this.custGlimInfo);
};
LUTInfoBox.prototype.createCustFC = function() {
	this.custFC = document.createElement('div');
	this.custFC.setAttribute('id','cust-fls');
	this.custFCBack = document.createElement('input');
	this.custFCBack.setAttribute('type','button');
	this.custFCBack.value = 'Back';
	this.custFC.appendChild(this.custFCBack);
	this.custFCInfo = document.createElement('div');
	this.custFCInfo.setAttribute('class','infotext');
	this.custFCInfo.appendChild(this.createFigure('tweak','pngs/cust-fc-1.png',1.4132));
	this.addInfo(this.custFCInfo,false,null,"'False Colour' changes luminance ranges to fixed colours as an exposure aid for wide dynamic range log recording.");
	this.addInfo(this.custFCInfo,false,null,'The colours and ranges LUTCalc uses are based on those used by Sony. They are:');
	this.addInfo(this.custFCInfo,true,'Purple','Black clip (actually 10 stops below 18% gray).');
	this.addInfo(this.custFCInfo,true,'Blue','Just above black clip. Default is 6.1 stops below 18% gray, but this can be changed to taste.');
	this.addInfo(this.custFCInfo,true,'Green','18% gray +/- 0.2 stops. Exposure datum.');
	this.addInfo(this.custFCInfo,true,'Pink','One stop over 18% gray +/- 0.175 stops. Common reference for caucasian skin.');
	this.addInfo(this.custFCInfo,true,'Orange','90% white +/- 0.175 stops. Off by default as not included by Sony, 90% white is a common datum in broadcast video.');
	this.addInfo(this.custFCInfo,true,'Yellow','Just below white clip. The default is 0.26 stops below clip, but this can also be changed.');
	this.addInfo(this.custFCInfo,true,'Red','White clip (5.95 stops above 18% gray).');
	this.addInfo(this.custFCInfo,false,null,'False colours map to the original real world exposure levels, regardless of the chosen input and output colour spaces.');
	this.addInfo(this.custFCInfo,false,null,'False colour LUTs should be 33x33x33 or larger.');
	this.custFC.className = 'info-page-hide';
	this.custFC.appendChild(this.custFCInfo);
};
LUTInfoBox.prototype.createCustSamp = function() {
	this.custSamp = document.createElement('div');
	this.custSamp.setAttribute('id','cust-samp');
	this.custSampBack = document.createElement('input');
	this.custSampBack.setAttribute('type','button');
	this.custSampBack.value = 'Back';
	this.custSamp.appendChild(this.custSampBack);
	this.custSampInfo = document.createElement('div');
	this.custSampInfo.setAttribute('class','infotext');
	this.custSampInfo.appendChild(this.createFigure('tweak','pngs/cust-samp-1.png',2.0645));
	this.addInfo(this.custSampInfo,false,null,"RGB Sampler is a tool for capturing sets of pixel RGB code values from the preview window. It becomes available when the preview window is visible.");
	this.addInfo(this.custSampInfo,false,null,'A grid of sample point can be constructed, and then used to compare preview images.');
	this.addInfo(this.custSampInfo,false,'Set Sample Grid',"Pressing this initially reveals two further buttons - 'Start Click To Add Sample Point' and 'Reset Grid'.");
	this.addInfo(this.custSampInfo,true,'Start Click To Add Sample Point',"Pressing this allows you to define points on the preview window you wish to sample. Take the cursor over to the preview, click and a circle should appear containing a number - initially '1'. Move and click again and a circle containing '2' will appear. In this way you can build up a set of points to sample. When you have all the points required, you can click 'Stop Click To Add Sample Point' to avoid accidentally adding more. The grid overlay can be hidden by clicking 'Hide Sample Grid'.");
	this.addInfo(this.custSampInfo,false,null,'The actual area sampled is a weighted average of nine pixels at the centre of the circle - much smaller than the circle itself.');
	this.addInfo(this.custSampInfo,true,'Reset Grid','Grayed out until you have created at least one a sample point, this will remove all sample points so that you can start again.');
	this.addInfo(this.custSampInfo,false,'File Name','This is filename under which the samples should be saved.');
	this.addInfo(this.custSampInfo,false,'Component Separator','The separator character to be used between the red, green and blue component values. Defaults to a tab.');
	this.addInfo(this.custSampInfo,false,'Sample Separator','The separator character to be used between each RGB sample. Defaults to a new line.');
	this.addInfo(this.custSampInfo,false,'Sample Precision','The scaling used on the sample values. 8, 10 or 12-bit integers covering full range, or floating point values from -0.07 to 1.09. The online version of LUTCalc is restricted to reading in user images at 8-bit depth, but the Mac App version can read 16-bit tiffs and pngs.');
	this.addInfo(this.custSampInfo,false,'Include Grid Coordinates',"When a set of samples is taken, it automatically includes the filename of the preview image followed by a list of the red, green and blue values. If 'Include Grid Coordinates' is selected, the file will also contain the coordinates on the image (between 0-1.0 of the width and height) of each sample point next to the relevent values. This may be useful if the grid is changed between samples.");
	this.addInfo(this.custSampInfo,false,'Take Samples','Click this to read a set of samples from the image.');
	this.addInfo(this.custSampInfo,false,'Save Samples','Save all currently collected samples to a file.');
	this.addInfo(this.custSampInfo,false,'Clear Sample Data','Clear all currently collected samples from memory. Once you have saved your sample file, you can either continue to build up more data or press this button to start afresh.');
	this.custSamp.className = 'info-page-hide';
	this.custSamp.appendChild(this.custSampInfo);
};
LUTInfoBox.prototype.createCustLA = function() {
	this.custLA = document.createElement('div');
	this.custLA.setAttribute('id','cust-lut');
	this.custLABack = document.createElement('input');
	this.custLABack.setAttribute('type','button');
	this.custLABack.value = 'Back';
	this.custLA.appendChild(this.custLABack);
	this.custLAInfo = document.createElement('div');
	this.custLAInfo.setAttribute('class','infotext');
	this.custLAInfo.appendChild(this.createFigure('tweak','pngs/cust-la-1.png',6.5882));
	this.addInfo(this.custLAInfo,false,null,'LUTAnalyst is a tool for reading LUT files and converting them for use on S-Log3/S-Gamut3.cine material.');
	this.addInfo(this.custLAInfo,false,null,'It currently understands the following formats: .cube, .3dl, .ilut, .olut, .lut (Assimilate format), .spi1D, .spi3D and .vlt.');
	this.addInfo(this.custLAInfo,false,null,'Once a file is loaded LUTCalc can create a generalised 1D LUT of the transfer function or gamma and a generally close approximation of the colour space.');
	this.addInfo(this.custLAInfo,false,null,"There are several potential uses for the 'LALUTs' produced:");
	this.addInfo(this.custLAInfo,true,'Information',"Visualise the response curves and exposure characteristics of customised or 'hand rolled' LUTs generated by grading software.");
	this.addInfo(this.custLAInfo,true,'Exposure Adjustment','Ideally software should read video file metadata to automatically apply exposure adjustment. Frequently this does not currently happen, so combining exposure adjustment and colour correction into one LUT can help whilst preventing data loss to clipped values.');
	this.addInfo(this.custLAInfo,true,'Camera Matching','If different camera models are used together, versions of a LUT tuned to each camera can be produced, hopefully simplifying the process of matching in post.');
	this.addInfo(this.custLAInfo,false,null,"By selecting 'Load Existing Analysed LA LUT' LUTAnalyst can load a precalculated LALUT file and add the gamma and gamut to the list of available options. LALUT files end in either .lalut or .labin.");
	this.addInfo(this.custLAInfo,false,null,"Selecting a functional cube LUT file under the 'Import New LUT' option starts a two-stage process.");
	this.custLAInfo.appendChild(this.createFigure('tweak','pngs/cust-la-2.png',1.8667));
	this.addInfo(this.custLAInfo,false,null,"If the LUT contains a title line, then this should appear under 'LUT Title'. If not, the filename is used which can then be changed.");
	this.addInfo(this.custLAInfo,false,null,'The input gamma and gamut that the LUT is designed for should then be specified.');
	this.addInfo(this.custLAInfo,false,null,'LUTAnalyst breaks up a LUT into a 1D transfer function and a 3D colour space. The dimension of the colour space LALUT can be 33x33x33 or 65x65x65. The way that LUTAnalyst now works, matching the analysis dimension to the LUT being analysed, but larger can sometimes be helpful, so 65x65x65 is the default.');
	this.addInfo(this.custLAInfo,false,null,'Analysis Method relates to the 3D interpolation technique used. Tricubic is smooth and complex, but prone to overshoots, tetrahedral is the most computationally simple and is becoming the standard approach in postproduction LUT use and trilinear is a 3D extension on linear interpolation. Tetrahedral is the default.');
	this.addInfo(this.custLAInfo,false,null,'The final main options are the input and output ranges of the LUT to be analysed. LUTCalc defaults to 109%->100% as this is a common setup, but diferences between range settings can be surprisingly subtle, so testing may well be required.');
	this.addInfo(this.custLAInfo,false,null,"Clicking the 'Advanced Settings' box brings up the option to specify the interpolation techniques used to apply the analysed LUT to the preview window and for final LUT generation.");
	this.addInfo(this.custLAInfo,false,null,"'Advanced Settings' also includes a 'Declip' button which becomes available when a LUT to be analysed has been clipped to within a range of 0-1.0. If this does not apply, the button is marked 'Unclipped' and grayed out. Otherwise 'Declip' attempts to extrapolate back the lost clipped data. It is not always an improvement, but can sometimes be helpful.");
	this.addInfo(this.custLAInfo,false,null,"Pressing 'New LUT' at any time restarts the whole process, but clicking 'Analyse' should start a process which takes a few seconds. When complete, the analysed LUT should appear as an option at the end of the gamma and gamut lists, and one or two new buttons should appear in the LUTAnalyst box.");
	this.custLAInfo.appendChild(this.createFigure('tweak','pngs/cust-la-3.png',1.3827));
	this.addInfo(this.custLAInfo,false,null,"'Save Cube' stores the 1D and 3D LUTAnalyst LUTs as a single file combining two cube files. 'Save Binary' stores them in a smaller, simpler binary format. LUTCalc For Mac cannot currently save the binary versions, though it can read them.");
	this.addInfo(this.custLAInfo,false,null,"'Re-Analyse' reperforms the analysis, for example if the LUT Range was incorrectly set.");
	this.custLA.className = 'info-page-hide';
	this.custLA.appendChild(this.custLAInfo);
};
LUTInfoBox.prototype.addInfo = function(infoBox,indent,title,text) {
	var para = document.createElement('p');
	if (indent) {
		para.className = 'indentpara';
	}
	if (typeof title === 'string') {
		var titleText = document.createElement('strong');
		titleText.appendChild(document.createTextNode(title));
		para.appendChild(titleText);
		para.appendChild(document.createTextNode(' - '));
	}
	para.appendChild(document.createTextNode(text));
	infoBox.appendChild(para);
};
LUTInfoBox.prototype.gammaInfo = function() {
	this.tableRefVals = new Float64Array([0,0.18,0.38,0.44,0.9,7.2,Math.pow(2,parseFloat(this.inputs.wclip))*0.18]);
	this.tableIREVals = new Float64Array(7);
	this.gammaInfoBox.className = 'info-tab';
	this.addText(this.gammaInfoBox,'Output gamma including any customisations:');
	var curires = document.createElement('table');
	curires.className = 'ref-table';
	var curiresHead = document.createElement('thead');
	curiresHead.appendChild(this.addRow(['Reflected %','0','18','38','44','90','720','Clip'], 'th'));
	curires.appendChild(curiresHead);
	var curiresBody = document.createElement('tbody');
	var curvarsRow = this.addRow(['10-bit Values','-','-','-','-','-','-','-'],'td');
	this.lutOutVals = [];
	[].push.apply(this.lutOutVals,curvarsRow.getElementsByTagName('td'));
	var curiresRow = this.addRow(['LUTted %IRE','-','-','-','-','-','-','-'],'td');
	this.lutOutIREs = [];
	[].push.apply(this.lutOutIREs,curiresRow.getElementsByTagName('td'));
	curiresBody.appendChild(curiresRow);
	curiresBody.appendChild(curvarsRow);
	curires.appendChild(curiresBody);
	this.gammaInfoBox.appendChild(curires);

	this.addText(this.gammaInfoBox,'Post LUT:');
	var tableStopsNeg = document.createElement('table');
	tableStopsNeg.className = 'ire-table';
	var tableStopsNegHead = document.createElement('thead');
	tableStopsNegHead.appendChild(this.addRow(['Stop','-8','-7','-6','-5','-4','-3','-2','-1','0'], 'th'));
	tableStopsNeg.appendChild(tableStopsNegHead);
	var tableStopsNegBody = document.createElement('tbody');
	var tableVarsNegRow = this.addRow(['10-bit','-','-','-','-','-','-','-','-','-'],'td');
	this.tableStopsNegVals = [];
	[].push.apply(this.tableStopsNegVals,tableVarsNegRow.getElementsByTagName('td'));
	var tableIREsNegRow = this.addRow(['%IRE','-','-','-','-','-','-','-','-','-'],'td');
	this.tableStopsNegIREs = [];
	[].push.apply(this.tableStopsNegIREs,tableIREsNegRow.getElementsByTagName('td'));
	tableStopsNegBody.appendChild(tableIREsNegRow);
	tableStopsNegBody.appendChild(tableVarsNegRow);
	tableStopsNeg.appendChild(tableStopsNegBody);
	this.gammaInfoBox.appendChild(tableStopsNeg);
	var tableStopsPos = document.createElement('table');
	tableStopsPos.className = 'ire-table';
	var tableStopsPosHead = document.createElement('thead');
	tableStopsPosHead.appendChild(this.addRow(['Stop','0','1','2','3','4','5','6','7','8'], 'th'));
	tableStopsPos.appendChild(tableStopsPosHead);
	var tableStopsPosBody = document.createElement('tbody');
	var tableVarsPosRow = this.addRow(['10-bit','-','-','-','-','-','-','-','-','-'],'td');
	this.tableStopsPosVals = [];
	[].push.apply(this.tableStopsPosVals,tableVarsPosRow.getElementsByTagName('td'));
	var tableIREsPosRow = this.addRow(['%IRE','-','-','-','-','-','-','-','-','-'],'td');
	this.tableStopsPosIREs = [];
	[].push.apply(this.tableStopsPosIREs,tableIREsPosRow.getElementsByTagName('td'));
	tableStopsPosBody.appendChild(tableIREsPosRow);
	tableStopsPosBody.appendChild(tableVarsPosRow);
	tableStopsPos.appendChild(tableStopsPosBody);
	this.gammaInfoBox.appendChild(tableStopsPos);

	this.preLUTLabel = document.createElement('p');
	this.preLUTLabel.innerHTML = 'Pre LUT - ' + this.gammaInName + ':';
	this.gammaInfoBox.appendChild(this.preLUTLabel);
	var tableStopsPreNeg = document.createElement('table');
	tableStopsPreNeg.className = 'ire-table';
	var tableStopsPreNegHead = document.createElement('thead');
	tableStopsPreNegHead.appendChild(this.addRow(['Stop','-8','-7','-6','-5','-4','-3','-2','-1','0'], 'th'));
	tableStopsPreNeg.appendChild(tableStopsPreNegHead);
	var tableStopsPreNegBody = document.createElement('tbody');
	var tableVarsPreNegRow = this.addRow(['10-bit','-','-','-','-','-','-','-','-','-'],'td');
	this.tableStopsPreNegVals = [];
	[].push.apply(this.tableStopsPreNegVals,tableVarsPreNegRow.getElementsByTagName('td'));
	var tableIREsPreNegRow = this.addRow(['%IRE','-','-','-','-','-','-','-','-','-'],'td');
	this.tableStopsPreNegIREs = [];
	[].push.apply(this.tableStopsPreNegIREs,tableIREsPreNegRow.getElementsByTagName('td'));
	tableStopsPreNegBody.appendChild(tableIREsPreNegRow);
	tableStopsPreNegBody.appendChild(tableVarsPreNegRow);
	tableStopsPreNeg.appendChild(tableStopsPreNegBody);
	this.gammaInfoBox.appendChild(tableStopsPreNeg);
	var tableStopsPrePos = document.createElement('table');
	tableStopsPrePos.className = 'ire-table';
	var tableStopsPrePosHead = document.createElement('thead');
	tableStopsPrePosHead.appendChild(this.addRow(['Stop','0','1','2','3','4','5','6','7','8'], 'th'));
	tableStopsPrePos.appendChild(tableStopsPrePosHead);
	var tableStopsPrePosBody = document.createElement('tbody');
	var tableVarsPrePosRow = this.addRow(['10-bit','-','-','-','-','-','-','-','-','-'],'td');
	this.tableStopsPrePosVals = [];
	[].push.apply(this.tableStopsPrePosVals,tableVarsPrePosRow.getElementsByTagName('td'));
	var tableIREsPrePosRow = this.addRow(['%IRE','-','-','-','-','-','-','-','-','-'],'td');
	this.tableStopsPrePosIREs = [];
	[].push.apply(this.tableStopsPrePosIREs,tableIREsPrePosRow.getElementsByTagName('td'));
	tableStopsPrePosBody.appendChild(tableIREsPrePosRow);
	tableStopsPrePosBody.appendChild(tableVarsPrePosRow);
	tableStopsPrePos.appendChild(tableStopsPrePosBody);
	this.gammaInfoBox.appendChild(tableStopsPrePos);
};
LUTInfoBox.prototype.gammaChart = function() {
	var m = 129;
	var d = m - 1;
	var k;
	this.gammaInName = '';
	this.gammaOutName = '';
	this.refX = new Float64Array(m);
	this.stopX = new Float64Array(m);
	this.lutIn = new Float64Array(m);
	for (var j=0; j<m; j++) {
		k = j/d;
		this.refX[j] = 14*k;
		this.stopX[j] = (16*k)-8;
		this.lutIn[j] = k;
	}
	this.refIn = new Float64Array(m);
	this.refOut = new Float64Array(m);
	this.stopIn = new Float64Array(m);
	this.stopOut = new Float64Array(m);
	this.lutOut = new Float64Array(m);

	this.gammaChartBox.className = 'info-tab';
	this.chartType = [];
	this.chartType[0] = this.createRadioElement('charttype', false);
	this.gammaChartBox.appendChild(this.chartType[0]);
	this.gammaChartBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Ref/IRE')));
	this.chartType[1] = this.createRadioElement('charttype', true);
	this.gammaChartBox.appendChild(this.chartType[1]);
	this.gammaChartBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stop/IRE')));
	this.chartType[2] = this.createRadioElement('charttype', false);
	this.gammaChartBox.appendChild(this.chartType[2]);
	this.gammaChartBox.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT In/Out')));
	this.gammaChartBox.appendChild(document.createElement('br'));
	this.buildChart();
	// Tables for chart display
	this.gammaChartBox.appendChild(document.createTextNode('Output gamma including any customisations:'));
	var curires = document.createElement('table');
	curires.className = 'ref-table';
	var curiresHead = document.createElement('thead');
	curiresHead.appendChild(this.addRow(['Reflected %','0','18','38','44','90','720','Clip'], 'th'));
	curires.appendChild(curiresHead);
	var curiresBody = document.createElement('tbody');
	var curvarsRow = this.addRow(['10-bit Values','-','-','-','-','-','-','-'],'td');
	this.lutOutValsChart = [];
	[].push.apply(this.lutOutValsChart,curvarsRow.getElementsByTagName('td'));
	var curiresRow = this.addRow(['LUTted %IRE','-','-','-','-','-','-','-'],'td');
	this.lutOutIREsChart = [];
	[].push.apply(this.lutOutIREsChart,curiresRow.getElementsByTagName('td'));
	curiresBody.appendChild(curiresRow);
	curiresBody.appendChild(curvarsRow);
	curires.appendChild(curiresBody);
	this.gammaChartBox.appendChild(curires);
};
LUTInfoBox.prototype.printTables = function() {
	var printLabel = document.createElement('p');
	printLabel.innerHTML = 'Output gamma including any customisations:';
	this.printBox.appendChild(printLabel);
	var printires = document.createElement('table');
	printires.className = 'ref-table';
	var printiresHead = document.createElement('thead');
	printiresHead.appendChild(this.addRow(['Reflected %','0','18','38','44','90','720','Clip'], 'th'));
	printires.appendChild(printiresHead);
	var printiresBody = document.createElement('tbody');
	var printvarsRow = this.addRow(['10-bit Values','-','-','-','-','-','-','-'],'td');
	this.printOutVals = [];
	[].push.apply(this.printOutVals,printvarsRow.getElementsByTagName('td'));
	var printiresRow = this.addRow(['%IRE','-','-','-','-','-','-','-'],'td');
	this.printOutIREs = [];
	[].push.apply(this.printOutIREs,printiresRow.getElementsByTagName('td'));
	printiresBody.appendChild(printiresRow);
	printiresBody.appendChild(printvarsRow);
	printires.appendChild(printiresBody);
	this.printBox.appendChild(printires);
	this.printBox.appendChild(document.createElement('br'));
	var printstopsNeg = document.createElement('table');
	var printstopsNegHead = document.createElement('thead');
	printstopsNegHead.appendChild(this.addRow(['Stop','-8','-7','-6','-5','-4','-3','-2','-1','0'], 'th'));
	printstopsNeg.appendChild(printstopsNegHead);
	var printstopsNegBody = document.createElement('tbody');
	var printvarsNegRow = this.addRow(['10-bit','-','-','-','-','-','-','-','-','-'],'td');
	this.printstopsNegVals = [];
	[].push.apply(this.printstopsNegVals,printvarsNegRow.getElementsByTagName('td'));
	var printiresNegRow = this.addRow(['%IRE','-','-','-','-','-','-','-','-','-'],'td');
	this.printstopsNegIREs = [];
	[].push.apply(this.printstopsNegIREs,printiresNegRow.getElementsByTagName('td'));
	printstopsNegBody.appendChild(printiresNegRow);
	printstopsNegBody.appendChild(printvarsNegRow);
	printstopsNeg.appendChild(printstopsNegBody);
	this.printBox.appendChild(printstopsNeg);
	var printstopsPos = document.createElement('table');
	var printstopsPosHead = document.createElement('thead');
	printstopsPosHead.appendChild(this.addRow(['Stop','0','1','2','3','4','5','6','7','8'], 'th'));
	printstopsPos.appendChild(printstopsPosHead);
	var printstopsPosBody = document.createElement('tbody');
	var printvarsPosRow = this.addRow(['10-bit','-','-','-','-','-','-','-','-','-'],'td');
	this.printstopsPosVals = [];
	[].push.apply(this.printstopsPosVals,printvarsPosRow.getElementsByTagName('td'));
	var printiresPosRow = this.addRow(['%IRE','-','-','-','-','-','-','-','-','-'],'td');
	this.printstopsPosIREs = [];
	[].push.apply(this.printstopsPosIREs,printiresPosRow.getElementsByTagName('td'));
	printstopsPosBody.appendChild(printiresPosRow);
	printstopsPosBody.appendChild(printvarsPosRow);
	printstopsPos.appendChild(printstopsPosBody);
	this.printBox.appendChild(printstopsPos);
	this.printBox.appendChild(document.createElement('br'));
	var lutLabel = document.createElement('p');
	lutLabel.innerHTML = 'LUT In vs LUT out:';
	this.printBox.appendChild(lutLabel);
};
LUTInfoBox.prototype.buildChart = function() {
	var point = '18';
	var cwidth = 1120;
	var cheight = 600;
	var w = cwidth * 0.98;
	var h = cheight;
	var yMin = h / 15;
	var yMax = yMin*0.5;
	var dY = (h - (1.5*yMin))/1023;
	var yA = dY * 876;
	var yB = dY * 64;
	var y0 = h - yMin - yB;
	var x0 = w / 10;
	var dX = (w - x0)/16;
	//
	this.chartBoxes = {
		refIRE: document.createElement('div'),
		stopIRE: document.createElement('div'),
		lutLUT: document.createElement('div')
	};
	// Reflected Against IRE
	var canvas1 = document.createElement('canvas');
	canvas1.id = 'can-lin-bgrnd';
	var ctx1 = canvas1.getContext('2d');
	canvas1.width = cwidth;
	canvas1.height = cheight;
	dX = (w - x0)/14;
	ctx1.fillStyle = 'black';
	ctx1.font = point + 'pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	ctx1.textBaseline = 'middle';
	ctx1.textAlign = 'right';
	ctx1.strokeStyle='black';
	ctx1.beginPath();
	ctx1.lineWidth = 2;
	ctx1.fillText('109.5%', x0 * 0.9,yMax);
	ctx1.fillText('100%', x0 * 0.9,y0 - yA);
	ctx1.fillText('0%', x0 * 0.9,h - yB - yMin);
	ctx1.fillText('-7.3%', x0 * 0.9,h - yMin);
	ctx1.moveTo(x0,y0);
	ctx1.lineTo(w,y0);
	ctx1.moveTo(x0,yMax);
	ctx1.lineTo(x0,h - yMin);
	ctx1.stroke();
	ctx1.beginPath();
	ctx1.strokeStyle='rgba(240, 176, 176, 0.5)';
	ctx1.moveTo(x0,h - yMin);
	ctx1.lineTo(w,h - yMin);
	ctx1.moveTo(x0,y0 - yA);
	ctx1.lineTo(w,y0 - yA);
	ctx1.moveTo(x0,yMax);
	ctx1.lineTo(w,yMax);
	ctx1.stroke();
	ctx1.beginPath();
	ctx1.strokeStyle='rgba(176, 176, 240, 0.5)';
	for (var i=1; i<10; i++){
		ctx1.fillText(parseInt(i*10).toString() + '%', x0 * 0.9,y0 - (yA*i/10));
		ctx1.moveTo(x0,y0 - (yA*i/10));
		ctx1.lineTo(w,y0 - (yA*i/10));
	}
	for (var i=0; i<15; i++){
		ctx1.translate(x0 + (i*dX) + (w/150) + 10,y0 + (1.75*yB) + 10);
		ctx1.rotate(1);
		ctx1.fillText(parseInt(i*100).toString() + '%', 0, 0);
		ctx1.rotate(-1);
		ctx1.translate(-x0 - (i*dX) - (w/150) - 10,-y0 - (1.75*yB) - 10);
		ctx1.moveTo(x0 + (dX*i),yMax);
		ctx1.lineTo(x0 + (dX*i),h - yMin);
	}
	ctx1.stroke();
	var recCanvas1 = document.createElement('canvas');
	recCanvas1.id = 'can-lin-rec';
	recCanvas1.width = canvas1.width;
	recCanvas1.height = canvas1.height;
	var outCanvas1 = document.createElement('canvas');
	outCanvas1.id = 'can-lin-out';
	outCanvas1.width = canvas1.width;
	outCanvas1.height = canvas1.height;
	var clipCanvas1 = document.createElement('canvas');
	clipCanvas1.id = 'can-lin-clip';
	clipCanvas1.width = canvas1.width;
	clipCanvas1.height = canvas1.height;
	this.refChart = {};
	this.refChart.rec = recCanvas1.getContext('2d');
	this.refChart.out = outCanvas1.getContext('2d');
	this.refChart.clip = clipCanvas1.getContext('2d');
	this.refChart.width = canvas1.width;
	this.refChart.w = w;
	this.refChart.x0 = x0;
	this.refChart.dX = dX;
	this.refChart.height = canvas1.height;
	this.refChart.h = h;
	this.refChart.y0 = y0;
	this.refChart.yMax = yMax;
	this.refChart.dY = yA;
	this.chartBoxes.refIRE.appendChild(canvas1);
	this.chartBoxes.refIRE.appendChild(clipCanvas1);
	this.chartBoxes.refIRE.appendChild(recCanvas1);
	this.chartBoxes.refIRE.appendChild(outCanvas1);
	// Stop Against IRE
	var canvas2 = document.createElement('canvas');
	canvas2.id = 'can-stop-bgrnd';
	var ctx2 = canvas2.getContext('2d');
	canvas2.width = cwidth;
	canvas2.height = cheight;
	dX = (w - x0)/18;
	ctx2.fillStyle = 'black';
	ctx2.font = point + 'pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	ctx2.textBaseline = 'middle';
	ctx2.textAlign = 'right';
	ctx2.strokeStyle='black';
	ctx2.beginPath();
	ctx2.lineWidth = 2;
	ctx2.fillText('109.5%', x0 * 0.9,yMax);
	ctx2.fillText('100%', x0 * 0.9,y0 - yA);
	ctx2.fillText('0%', x0 * 0.9,h - yB - yMin);
	ctx2.fillText('-7.3%', x0 * 0.9,h - yMin);
	ctx2.moveTo(x0,y0);
	ctx2.lineTo(w,y0);
	ctx2.moveTo(x0 + (dX*9),yMax);
	ctx2.lineTo(x0 + (dX*9),h - yMin);
	ctx2.stroke();
	ctx2.beginPath();
	ctx2.strokeStyle='rgba(240, 176, 176, 0.5)';
	ctx2.moveTo(x0,h - yMin);
	ctx2.lineTo(w,h - yMin);
	ctx2.moveTo(x0,y0 - yA);
	ctx2.lineTo(w,y0 - yA);
	ctx2.moveTo(x0,yMax);
	ctx2.lineTo(w,yMax);
	ctx2.stroke();
	ctx2.beginPath();
	ctx2.strokeStyle='rgba(176, 176, 240, 0.5)';
	for (var i=1; i<10; i++){
		ctx2.fillText(parseInt(i*10).toString() + '%', x0 * 0.9,y0 - (yA*i/10));
		ctx2.moveTo(x0,y0 - (yA*i/10));
		ctx2.lineTo(w,y0 - (yA*i/10));
	}
	for (var i=0; i<19; i++){
		ctx2.fillText(parseInt(i-9).toString(), x0 + (i*dX) + (w/150),y0 + (1.75*yB));
		ctx2.moveTo(x0 + (dX*i),yMax);
		ctx2.lineTo(x0 + (dX*i),h - yMin);
	}
	ctx2.stroke();
	var recCanvas2 = document.createElement('canvas');
	recCanvas2.id = 'can-stop-rec';
	recCanvas2.width = canvas2.width;
	recCanvas2.height = canvas2.height;
	var outCanvas2 = document.createElement('canvas');
	outCanvas2.id = 'can-stop-out';
	outCanvas2.width = canvas2.width;
	outCanvas2.height = canvas2.height;
	var clipCanvas2 = document.createElement('canvas');
	clipCanvas2.id = 'can-stop-clip';
	clipCanvas2.width = canvas2.width;
	clipCanvas2.height = canvas2.height;
	this.stopChart = {};
	this.stopChart.rec = recCanvas2.getContext('2d');
	this.stopChart.out = outCanvas2.getContext('2d');
	this.stopChart.clip = clipCanvas2.getContext('2d');
	this.stopChart.width = canvas2.width;
	this.stopChart.w = w;
	this.stopChart.x0 = x0;
	this.stopChart.dX = dX;
	this.stopChart.height = canvas2.height;
	this.stopChart.h = h;
	this.stopChart.y0 = y0;
	this.stopChart.yMax = yMax;
	this.stopChart.dY = yA;
	this.chartBoxes.stopIRE.appendChild(canvas2);
	this.chartBoxes.stopIRE.appendChild(clipCanvas2);
	this.chartBoxes.stopIRE.appendChild(recCanvas2);
	this.chartBoxes.stopIRE.appendChild(outCanvas2);
	// LUT In Against LUT Out
	var canvas3 = document.createElement('canvas');
	canvas3.id = 'can-lut-bgrnd';
	var ctx3 = canvas3.getContext('2d');
	canvas3.width = cwidth;
	canvas3.height = cheight;
	dX = (w - x0)*876/1023;
//	var xMin = x0 + (64*876/1023);
	var xMin = x0 + (dX*64/876);
	ctx3.fillStyle = 'black';
	ctx3.font = point + 'pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	ctx3.textBaseline = 'middle';
	ctx3.textAlign = 'right';
	ctx3.strokeStyle='black';
	ctx3.beginPath();
	ctx3.lineWidth = 2;
	ctx3.fillText('109.5%', x0 * 0.9,yMax);
	ctx3.fillText('100%', x0 * 0.9,y0 - yA);
	ctx3.fillText('0%', x0 * 0.9,h - yB - yMin);
	ctx3.fillText('-7.3%', x0 * 0.9,h - yMin);
	ctx3.fillText('-7.3%', x0+ (w/50),y0 + (1.75*yB));
	ctx3.fillText('0%', xMin + (w/50),y0 + (1.75*yB));
	ctx3.fillText('100%', xMin + dX + (w/50),y0 + (1.75*yB));
	ctx3.fillText('109.5%', w + (w/50),y0 + (1.75*yB));
	ctx3.moveTo(x0,y0);
	ctx3.lineTo(w,y0);
	ctx3.moveTo(xMin,yMax);
	ctx3.lineTo(xMin,h - yMin);
	ctx3.stroke();
	ctx3.beginPath();
	ctx3.strokeStyle='rgba(240, 176, 176, 1)';
	ctx3.moveTo(x0,yMax);
	ctx3.lineTo(x0,h - yMin);
	ctx3.moveTo(w,yMax);
	ctx3.lineTo(w,h - yMin);
	ctx3.moveTo(xMin + dX,yMax);
	ctx3.lineTo(xMin + dX,h - yMin);
	ctx3.moveTo(x0,h - yMin);
	ctx3.lineTo(w,h - yMin);
	ctx3.moveTo(x0,y0 - yA);
	ctx3.lineTo(w,y0 - yA);
	ctx3.moveTo(x0,yMax);
	ctx3.lineTo(w,yMax);
	ctx3.stroke();
	ctx3.beginPath();
	ctx3.strokeStyle='rgba(176, 176, 240, 0.5)';
	for (var i=1; i<10; i++){
		ctx3.fillText(parseInt(i*10).toString() + '%', x0 * 0.9,y0 - (yA*i/10));
		ctx3.moveTo(x0,y0 - (yA*i/10));
		ctx3.lineTo(w,y0 - (yA*i/10));
	}
	for (var i=1; i<10; i++){
		ctx3.fillText(parseInt(i*10).toString()+'%', xMin + (i*dX/10) + (w/50),y0 + (1.75*yB));
		ctx3.moveTo(xMin + (dX*i/10),yMax);
		ctx3.lineTo(xMin + (dX*i/10),h - yMin);
	}
	ctx3.stroke();
	var outCanvas3 = document.createElement('canvas');
	outCanvas3.id = 'can-lut-out';
	outCanvas3.width = canvas3.width;
	outCanvas3.height = canvas3.height;
	var rgbCanvas3 = document.createElement('canvas');
	rgbCanvas3.id = 'can-lut-rgb';
	rgbCanvas3.width = canvas3.width;
	rgbCanvas3.height = canvas3.height;
	this.lutChart = {};
	this.lutChart.out = outCanvas3.getContext('2d');
	this.lutChart.rgb = rgbCanvas3.getContext('2d');
	this.lutChart.width = canvas3.width;
	this.lutChart.w = w;
	this.lutChart.x0 = x0;
	this.lutChart.dX = dX;
	this.lutChart.height = canvas3.height;
	this.lutChart.h = h;
	this.lutChart.y0 = y0;
	this.lutChart.yMax = yMax;
	this.lutChart.dY = yA;
	this.chartBoxes.lutLUT.appendChild(canvas3);
	this.chartBoxes.lutLUT.appendChild(outCanvas3);
	this.chartBoxes.lutLUT.appendChild(rgbCanvas3);
	// Set up printing canvas
	this.printElements = {};
	var printStopBox = document.createElement('div');
	printStopBox.id = 'print-stop-box';
	var printCan2 = document.createElement('canvas');
	printCan2.id = 'print-stop-bgrnd';
	printCan2.width = canvas2.width;
	printCan2.height = canvas2.height;
	printCan2.getContext('2d').drawImage(canvas2, 0, 0);
	printStopBox.appendChild(printCan2);
	var printRec2 = document.createElement('canvas');
	printRec2.id = 'print-stop-rec';
	this.printElements.rec2 = printRec2.getContext('2d');
	printRec2.width = canvas2.width;
	printRec2.height = canvas2.height;
	printStopBox.appendChild(printRec2);
	var printOut2 = document.createElement('canvas');
	printOut2.id = 'print-stop-out';
	this.printElements.out2 = printOut2.getContext('2d');
	printOut2.width = canvas2.width;
	printOut2.height = canvas2.height;
	printStopBox.appendChild(printOut2);
	var printClip2 = document.createElement('canvas');
	printClip2.id = 'print-stop-clip';
	this.printElements.clip2 = printClip2.getContext('2d');
	printClip2.width = canvas2.width;
	printClip2.height = canvas2.height;
	printStopBox.appendChild(printClip2);	
	this.printBox.appendChild(printStopBox);	
	this.printTables();
	var printLUTBox = document.createElement('div');
	printLUTBox.id = 'print-lut-box';
	var printCan3 = document.createElement('canvas');
	printCan3.id = 'print-lut-bgrnd';
	printCan3.width = canvas3.width;
	printCan3.height = canvas3.height;
	printCan3.getContext('2d').drawImage(canvas3, 0, 0);
	printLUTBox.appendChild(printCan3);
	var printOut3 = document.createElement('canvas');
	printOut3.id = 'print-lut-out';
	this.printElements.out3 = printOut3.getContext('2d');
	printOut3.width = canvas3.width;
	printOut3.height = canvas3.height;
	printLUTBox.appendChild(printOut3);
	this.printBox.appendChild(printLUTBox);
	//
	this.chartBoxes.refIRE.className = 'canvas-tab-hide';
	this.chartBoxes.stopIRE.className = 'canvas-tab';
	this.chartBoxes.lutLUT.className = 'canvas-tab-hide';
	this.gammaChartBox.appendChild(this.chartBoxes.refIRE);
	this.gammaChartBox.appendChild(this.chartBoxes.stopIRE);
	this.gammaChartBox.appendChild(this.chartBoxes.lutLUT);
	this.gammaChartBox.appendChild(document.createElement('br'));
	// Draw The Lines
//	this.updateGamma();
};
LUTInfoBox.prototype.addText = function(infoBox,text,bold) {
	var para = document.createElement('p');
	if (bold) {
		para.className = 'bold';
	}
	para.appendChild(document.createTextNode(text));
	infoBox.appendChild(para);
};
LUTInfoBox.prototype.addRow = function(data,section) {
	var max = data.length;
	var row = document.createElement('tr');
	for (var i=0; i < max; i++) {
		var col = document.createElement(section);
		col.appendChild(document.createTextNode(data[i]));
		row.appendChild(col);
	}
	return row;
};
LUTInfoBox.prototype.createRadioElement = function(name, checked) {
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
LUTInfoBox.prototype.createFigure = function(type, filename, ratio) {
	var box = document.createElement('div');
	box.className = 'fig-' + type;
	var wrapper = document.createElement('div');
	wrapper.className = 'fig-wrapper';
	wrapper.style.paddingBottom = (100/ratio).toFixed(2).toString() + '%';
	box.appendChild(wrapper);
	var fig = document.createElement('div');
	fig.className = 'fig-img';
	fig.style.backgroundImage = "url('" + filename + "')";
	wrapper.appendChild(fig);
	return box;
};
// Event Responses
LUTInfoBox.prototype.instructionsOpt = function() {
	this.showMainscreen();
	this.instructionsBox.className = 'info-tab-ins';
	this.gammaInfoBox.className = 'info-tab-hide';
	this.gammaChartBox.className = 'info-tab-hide';
	this.gammaPrintBut.className = 'print-button-hide';
};
LUTInfoBox.prototype.gammaInfoOpt = function() {
	this.instructionsBox.className = 'info-tab-hide';
	this.gammaInfoBox.className = 'info-tab';
	this.gammaChartBox.className = 'info-tab-hide';
	this.gammaPrintBut.className = 'print-button';
};
LUTInfoBox.prototype.gammaChartOpt = function() {
	this.instructionsBox.className = 'info-tab-hide';
	this.gammaInfoBox.className = 'info-tab-hide';
	this.gammaChartBox.className = 'info-tab';
	if (this.chartType[1].checked || this.chartType[2].checked) {
		this.gammaPrintBut.className = 'print-button';
	} else {
		this.gammaPrintBut.className = 'print-button-hide';
	}
};
LUTInfoBox.prototype.gammaPrint = function() {
	var custom = this.messages.isCustomGamma();
	var title = this.inputs.name.value;
	var gamma;
	if (this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value !== '9999') {
		gamma = this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue;
	} else {
		gamma = this.inputs.outLinGamma.options[this.inputs.outLinGamma.selectedIndex].lastChild.nodeValue;
	}
	if (title === 'Custom LUT') {
		if (custom) {
			title = 'Customised ' + gamma;
		} else {
			title = gamma;
		}
	} else if (custom) {
		title += ' based on ' + gamma;
	}
	this.printTitle.innerHTML = title;
	this.printDetails.innerHTML = 'Made with LUTCalc ' + this.inputs.version;
	this.printElements.rec2.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.printElements.out2.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.printElements.clip2.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.printElements.rec2.drawImage(document.getElementById('can-stop-rec'), 0, 0);
	this.printElements.out2.drawImage(document.getElementById('can-stop-out'), 0, 0);
	this.printElements.clip2.drawImage(document.getElementById('can-stop-clip'), 0, 0);
	this.printElements.out3.clearRect(0, 0, this.lutChart.width, this.lutChart.height);
	this.printElements.out3.drawImage(document.getElementById('can-lut-out'), 0, 0);
	if (this.inputs.isApp) {
		window.lutCalcApp.printCharts();
	} else {
		window.print();
	}
};
LUTInfoBox.prototype.updatePrintTables = function() {
	for (var j=0; j<7; j++) {
		if (this.tableIREVals[j] < -0.07305936073059) {
			this.tableIREVals[j] = -0.07305936073059;
		}
		this.printOutIREs[j+1].innerHTML = Math.round(this.tableIREVals[j]*100).toString();
		this.printOutVals[j+1].innerHTML = Math.round((this.tableIREVals[j]*876)+64).toString();
		if (parseInt(this.printOutVals[j+1].innerHTML) > 1023) {
			this.printOutVals[j+1].innerHTML = '-';
			this.printOutIREs[j+1].innerHTML = '-';
		}
	}
	for (var j=0; j<9; j++) {
		if (this.stopVals[j] < -0.07305936073059) {
			this.stopVals[j] = -0.07305936073059;
		}
		this.printstopsNegIREs[j+1].innerHTML = Math.round(this.stopVals[j]*100).toString();
		this.printstopsNegVals[j+1].innerHTML = Math.round((this.stopVals[j]*876)+64).toString();
		this.printstopsPosIREs[j+1].innerHTML = Math.round(this.stopVals[j+8]*100).toString();
		this.printstopsPosVals[j+1].innerHTML = Math.round((this.stopVals[j+8]*876)+64).toString();
		if (parseInt(this.printstopsNegVals[j+1].innerHTML) > 1023) {
			this.printstopsNegVals[j+1].innerHTML = '-';
			this.printstopsNegIREs[j+1].innerHTML = '-';
		}
		if (parseInt(this.printstopsPosVals[j+1].innerHTML) > 1023) {
			this.printstopsPosVals[j+1].innerHTML = '-';
			this.printstopsPosIREs[j+1].innerHTML = '-';
		}
	}
};
LUTInfoBox.prototype.updateTables = function() {
	for (var j=0; j<7; j++) {
		if (this.tableIREVals[j] < -0.07305936073059) {
			this.tableIREVals[j] = -0.07305936073059;
		}
		this.lutOutIREs[j+1].innerHTML = Math.round(this.tableIREVals[j]*100).toString();
		this.lutOutVals[j+1].innerHTML = Math.round((this.tableIREVals[j]*876)+64).toString();
		this.lutOutIREsChart[j+1].innerHTML = Math.round(this.tableIREVals[j]*100).toString();
		this.lutOutValsChart[j+1].innerHTML = Math.round((this.tableIREVals[j]*876)+64).toString();
		if (parseInt(this.lutOutVals[j+1].innerHTML) > 1019) {
			if (j<6) {
				this.lutOutVals[j+1].innerHTML = '-';
				this.lutOutIREs[j+1].innerHTML = '-';
				this.lutOutValsChart[j+1].innerHTML = '-';
				this.lutOutIREsChart[j+1].innerHTML = '-';
			} else {
				this.lutOutVals[j+1].innerHTML = '>1019';
				this.lutOutIREs[j+1].innerHTML = '>109';
				this.lutOutValsChart[j+1].innerHTML = '>1019';
				this.lutOutIREsChart[j+1].innerHTML = '>109';
			}
		}
	}
	this.preLUTLabel.innerHTML = 'Pre LUT - ' + this.gammaInName + ':';
	for (var j=0; j<9; j++) {
		if (this.stopVals[j] < -0.07305936073059) {
			this.stopVals[j] = -0.07305936073059;
		}
		this.tableStopsNegIREs[j+1].innerHTML = Math.round(this.stopVals[j]*100).toString();
		this.tableStopsNegVals[j+1].innerHTML = Math.round((this.stopVals[j]*876)+64).toString();
		this.tableStopsPosIREs[j+1].innerHTML = Math.round(this.stopVals[j+8]*100).toString();
		this.tableStopsPosVals[j+1].innerHTML = Math.round((this.stopVals[j+8]*876)+64).toString();
		if (parseInt(this.tableStopsNegVals[j+1].innerHTML) > 1019) {
			this.tableStopsNegVals[j+1].innerHTML = '-';
			this.tableStopsNegIREs[j+1].innerHTML = '-';
		}
		if (parseInt(this.tableStopsPosVals[j+1].innerHTML) > 1019) {
			this.tableStopsPosVals[j+1].innerHTML = '-';
			this.tableStopsPosIREs[j+1].innerHTML = '-';
		}
		if (this.stopPreVals[j] < -0.07305936073059) {
			this.stopPreVals[j] = -0.07305936073059;
		}
		this.tableStopsPreNegIREs[j+1].innerHTML = Math.round(this.stopPreVals[j]*100).toString();
		this.tableStopsPreNegVals[j+1].innerHTML = Math.round((this.stopPreVals[j]*876)+64).toString();
		this.tableStopsPrePosIREs[j+1].innerHTML = Math.round(this.stopPreVals[j+8]*100).toString();
		this.tableStopsPrePosVals[j+1].innerHTML = Math.round((this.stopPreVals[j+8]*876)+64).toString();
		if (parseInt(this.tableStopsPreNegVals[j+1].innerHTML) > 1019) {
			this.tableStopsPreNegVals[j+1].innerHTML = '-';
			this.tableStopsPreNegIREs[j+1].innerHTML = '-';
		}
		if (parseInt(this.tableStopsPrePosVals[j+1].innerHTML) > 1019) {
			this.tableStopsPrePosVals[j+1].innerHTML = '-';
			this.tableStopsPrePosIREs[j+1].innerHTML = '-';
		}
	}
};
LUTInfoBox.prototype.changeChart = function() {
	if (this.chartType[0].checked) {
		this.chartBoxes.refIRE.className =	'canvas-tab';
		this.chartBoxes.stopIRE.className =	'canvas-tab-hide';
		this.chartBoxes.lutLUT.className =	'canvas-tab-hide';
		this.gammaPrintBut.className = 'print-button-hide';
	} else if (this.chartType[1].checked) {
		this.chartBoxes.refIRE.className =	'canvas-tab-hide';
		this.chartBoxes.stopIRE.className =	'canvas-tab';
		this.chartBoxes.lutLUT.className =	'canvas-tab-hide';
		this.gammaPrintBut.className = 'print-button';
	} else{
		this.chartBoxes.refIRE.className =	'canvas-tab-hide';
		this.chartBoxes.stopIRE.className =	'canvas-tab-hide';
		this.chartBoxes.lutLUT.className =	'canvas-tab';
		this.gammaPrintBut.className = 'print-button';
	}
};
LUTInfoBox.prototype.gotIOGammaNames = function(d) {
	this.gammaInName = d.inName;
	if (typeof d.inG !== 'undefined' && d.inG !== '') {
		this.gammaInName += ' - ' + d.inG;
	}
	this.gammaOutName = d.outName;
	if (typeof d.outG !== 'undefined' && d.outG !== '') {
		this.gammaOutName += ' - ' + d.outG;
	}
	if (d.outName === 'LA' ) {
		this.gammaOutName += ' - ' + this.inputs.laTitle.value;
	}
	this.updateRefChart();
	this.updateStopChart();
	this.updateLutChart();
};
LUTInfoBox.prototype.updateRefChart = function() { // Ref Against IRE
	this.refChart.rec.clearRect(0, 0, this.refChart.width, this.refChart.height);
	this.refChart.out.clearRect(0, 0, this.refChart.width, this.refChart.height);
	this.refChart.clip.clearRect(0, 0, this.refChart.width, this.refChart.height);
	this.refChart.rec.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.refChart.rec.textBaseline = 'middle';
	this.refChart.rec.textAlign = 'left';
	this.refChart.rec.beginPath();
	this.refChart.rec.strokeStyle='rgba(240, 0, 0, 0.75)';	
	this.refChart.rec.fillStyle = 'rgba(240, 0, 0, 0.75)';
	this.refChart.rec.fillText('In: ' + this.gammaInName, 200,365);
	this.refChart.rec.lineWidth = 4;
	this.refChart.rec.moveTo(this.refChart.x0,this.refChart.y0 - (this.refIn[0] * this.stopChart.dY));
	var max = this.refX.length;
	for (var i=1; i<max; i++) {
		this.refChart.rec.lineTo(this.refChart.x0 + (this.refX[i] * this.refChart.dX),this.refChart.y0 - (this.refIn[i] * this.refChart.dY));
	}
	this.refChart.rec.stroke();
	this.refChart.out.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.refChart.out.textBaseline = 'middle';
	this.refChart.out.textAlign = 'left';
	this.refChart.out.beginPath();
	this.refChart.out.strokeStyle='rgba(0, 0, 240, 0.75)';	
	this.refChart.out.fillStyle = 'rgba(0, 0, 240, 0.75)';
	this.refChart.out.fillText('Out: ' + this.gammaOutName, 200,415);
	this.refChart.out.lineWidth = 4;
	this.refChart.out.moveTo(this.refChart.x0,this.refChart.y0 - (this.refOut[0] * this.stopChart.dY));
	for (var i=1; i<max; i++) {
		this.refChart.out.lineTo(this.refChart.x0 + (this.refX[i] * this.refChart.dX),this.refChart.y0 - (this.refOut[i] * this.refChart.dY));
	}
	this.refChart.out.stroke();
	this.refChart.rec.clearRect(0, 0, this.refChart.width, this.refChart.yMax);
	this.refChart.out.clearRect(0, 0, this.refChart.width, this.refChart.yMax);
};
LUTInfoBox.prototype.updateStopChart = function() { // Stop Against IRE
	this.stopChart.rec.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.stopChart.out.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.stopChart.clip.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.stopChart.rec.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.stopChart.rec.textBaseline = 'middle';
	this.stopChart.rec.textAlign = 'left';
	this.stopChart.rec.beginPath();
	this.stopChart.rec.strokeStyle='rgba(240, 0, 0, 0.75)';	
	this.stopChart.rec.fillStyle = 'rgba(240, 0, 0, 0.75)';
	this.stopChart.rec.fillText('In: ' + this.gammaInName, 140,85);
	this.stopChart.rec.lineWidth = 4;
	this.stopChart.rec.moveTo(this.stopChart.x0,this.stopChart.y0 - (this.stopIn[0] * this.stopChart.dY));
	var max = this.stopX.length;
	for (var i=1; i<max; i++) {
		this.stopChart.rec.lineTo(this.stopChart.x0 + ((this.stopX[i] + 9) * this.stopChart.dX),this.stopChart.y0 - (this.stopIn[i] * this.stopChart.dY));
	}
	this.stopChart.rec.stroke();
	this.stopChart.out.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.stopChart.out.textBaseline = 'middle';
	this.stopChart.out.textAlign = 'left';
	this.stopChart.out.beginPath();
	this.stopChart.out.strokeStyle='rgba(0, 0, 240, 0.75)';	
	this.stopChart.out.fillStyle = 'rgba(0, 0, 240, 0.75)';
	this.stopChart.out.fillText('Out: ' + this.gammaOutName, 140,135);
	this.stopChart.out.lineWidth = 4;
	this.stopChart.out.moveTo(this.stopChart.x0,this.stopChart.y0 - (this.stopOut[0] * this.stopChart.dY));
	for (var i=1; i<max; i++) {
		this.stopChart.out.lineTo(this.stopChart.x0 + ((this.stopX[i] + 9) * this.stopChart.dX),this.stopChart.y0 - (this.stopOut[i] * this.stopChart.dY));
	}
	this.stopChart.out.stroke();
	this.stopChart.rec.clearRect(0, 0, this.stopChart.width, this.stopChart.yMax);
	this.stopChart.out.clearRect(0, 0, this.stopChart.width, this.stopChart.yMax);
	this.stopChart.clip.beginPath();
	this.stopChart.clip.strokeStyle='rgba(128, 128, 128, 0.1)';	
	this.stopChart.clip.fillStyle = 'rgba(128, 128, 128, 0.1)';
	this.stopChart.clip.lineWidth = 0;
	var wclip = this.inputs.wclip;
	this.stopChart.clip.fillRect(this.stopChart.x0 + ((wclip+9) * this.stopChart.dX), this.stopChart.yMax, (9-wclip) * this.stopChart.dX, this.stopChart.y0 - this.stopChart.yMax);
	var bclip = this.inputs.bclip;
	this.stopChart.clip.fillRect(this.stopChart.x0, this.stopChart.yMax, (9+bclip) * this.stopChart.dX, this.stopChart.y0 - this.stopChart.yMax);
	this.stopChart.clip.stroke();
	var stopZero = parseFloat(this.inputs.stopShift.value);
	if (Math.abs(stopZero) > 0.001) {
		stopZero = 9 - stopZero;
		this.stopChart.clip.beginPath();
		this.stopChart.clip.strokeStyle='rgba(240, 180, 180, 0.75)';	
		this.stopChart.clip.lineWidth = 5;
		this.stopChart.clip.moveTo(this.stopChart.x0 + (stopZero*this.stopChart.dX), this.stopChart.yMax);
		this.stopChart.clip.lineTo(this.stopChart.x0 + (stopZero*this.stopChart.dX), this.stopChart.y0);
		this.stopChart.clip.stroke();
	}
};
LUTInfoBox.prototype.updateLutChart = function() { // Gamma In Against Gamma Out
	var xMin = this.lutChart.x0 + (64*876/1023);
	var dX = this.lutChart.dX*1023/876;
	this.lutChart.out.clearRect(0, 0, this.lutChart.width, this.lutChart.height);
	this.lutChart.out.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.lutChart.out.textBaseline = 'middle';
	this.lutChart.out.textAlign = 'left';
	this.lutChart.out.beginPath();
	this.lutChart.out.strokeStyle='rgba(128, 128, 128, 0.75)';	
	this.lutChart.out.fillStyle = 'rgba(0, 0, 0, 1)';
	this.lutChart.out.fillText(this.gammaInName + ' -> ' + this.gammaOutName, 220,90);
	this.lutChart.out.lineWidth = 4;
	this.lutChart.out.moveTo(this.lutChart.x0,this.lutChart.y0 - (this.lutOut[0] * this.lutChart.dY));
	var max = this.lutIn.length;
	for (var i=1; i<max; i++) {
//		this.lutChart.out.lineTo( xMin + (((this.lutIn[i]*1023)-64)/876)*this.lutChart.dX,this.lutChart.y0 - (this.lutOut[i] * this.lutChart.dY));
		this.lutChart.out.lineTo( this.lutChart.x0 + (this.lutIn[i]*dX),this.lutChart.y0 - (this.lutOut[i] * this.lutChart.dY));
	}
	this.lutChart.out.stroke();
	this.lutChart.out.clearRect(0, 0, this.lutChart.width, this.lutChart.yMax);
	var yMin = this.lutChart.h / 15;
	this.lutChart.out.clearRect(0, this.lutChart.h - yMin, this.lutChart.width, this.lutChart.h);
};
LUTInfoBox.prototype.updateRGBChart = function(d) {
	var rIn = new Float64Array(d.rIn);
	var gIn = new Float64Array(d.gIn);
	var bIn = new Float64Array(d.bIn);
	var rOut = new Float64Array(d.rOut);
	var gOut = new Float64Array(d.gOut);
	var bOut = new Float64Array(d.bOut);
	var m = rIn.length;
	var xMin = this.lutChart.x0 + (64*876/1023);
	this.lutChart.rgb.clearRect(0, 0, this.lutChart.width, this.lutChart.height);
// Red
	this.lutChart.rgb.beginPath();
	this.lutChart.rgb.strokeStyle='rgba(240, 0, 0, 0.75)';	
	this.lutChart.rgb.fillStyle = 'rgba(0, 0, 0, 1)';
	this.lutChart.rgb.lineWidth = 4;
	this.lutChart.rgb.moveTo(this.lutChart.x0 + ((rIn[0]*this.lutChart.dX)*1023/876),this.lutChart.y0 - (rOut[0] * this.lutChart.dY));
	for (var j=1; j<m; j++) {
		this.lutChart.rgb.lineTo( this.lutChart.x0 + ((rIn[j]*this.lutChart.dX)*1023/876),this.stopChart.y0 - (rOut[j] * this.lutChart.dY));
	}
	this.lutChart.rgb.stroke();
// Green
	this.lutChart.rgb.beginPath();
	this.lutChart.rgb.strokeStyle='rgba(0, 240, 0, 0.75)';	
	this.lutChart.rgb.fillStyle = 'rgba(0, 0, 0, 1)';
	this.lutChart.rgb.lineWidth = 4;
	this.lutChart.rgb.moveTo(this.lutChart.x0 + ((gIn[j]*this.lutChart.dX)*1023/876),this.lutChart.y0 - (gOut[0] * this.lutChart.dY));
	for (var j=1; j<m; j++) {
		this.lutChart.rgb.lineTo( this.lutChart.x0 + ((gIn[j]*this.lutChart.dX)*1023/876),this.stopChart.y0 - (gOut[j] * this.lutChart.dY));
	}
	this.lutChart.rgb.stroke();
// Blue
	this.lutChart.rgb.beginPath();
	this.lutChart.rgb.strokeStyle='rgba(0, 0, 240, 0.75)';	
	this.lutChart.rgb.fillStyle = 'rgba(0, 0, 0, 1)';
	this.lutChart.rgb.lineWidth = 4;
	this.lutChart.rgb.moveTo(this.lutChart.x0 + ((bIn[j]*this.lutChart.dX)*1023/876),this.lutChart.y0 - (bOut[0] * this.lutChart.dY));
	for (var j=1; j<m; j++) {
		this.lutChart.rgb.lineTo( this.lutChart.x0 + ((bIn[j]*this.lutChart.dX)*1023/876),this.stopChart.y0 - (bOut[j] * this.lutChart.dY));
	}
	this.lutChart.rgb.stroke();
// Tidy
	this.lutChart.rgb.clearRect(0, 0, this.lutChart.width, this.lutChart.yMax);
	var yMin = this.lutChart.h / 15;
	this.lutChart.rgb.clearRect(0, this.lutChart.h - yMin, this.lutChart.width, this.lutChart.h);
};
LUTInfoBox.prototype.updateGamma = function() {
	this.messages.gaTx(this.p,10,null);
	this.messages.gaTx(this.p,11,null);
};
LUTInfoBox.prototype.gotChartVals = function(d) {
	this.refX = new Float64Array(d.refX);
	this.refIn = new Float64Array(d.refIn);
	this.refOut = new Float64Array(d.refOut);
	this.stopX = new Float64Array(d.stopX);
	this.stopIn = new Float64Array(d.stopIn);
	this.stopPreVals = new Float64Array(d.stopPreVals);
	this.stopVals = new Float64Array(d.stopVals);
	this.stopOut = new Float64Array(d.stopOut);
	this.lutIn = new Float64Array(d.lutIn);
	this.lutOut = new Float64Array(d.lutOut);
	this.tableIREVals = new Float64Array(d.table);
	this.updateRefChart();
	this.updateStopChart();
	this.updateLutChart();
	this.updateTables();
	this.updatePrintTables();
};
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
