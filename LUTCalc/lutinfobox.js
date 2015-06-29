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
function LUTInfoBox(fieldset,inputs,message) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.message = message;
	this.p = 6;
	this.message.addUI(this.p,this);
	this.instructionsBut = document.createElement('input');
	this.gammaInfoBut = document.createElement('input');
	this.gammaChartBut = document.createElement('input');
	this.buildBox();
	fieldset.appendChild(this.box);
	if (this.inputs.isReady(this.p)) {
		lutcalcReady();
	}
}
// Construct the UI Box
LUTInfoBox.prototype.buildBox = function() {
	this.instructionsBut.setAttribute('type','button');
	this.instructionsBut.value = 'Instructions';
	this.instructionsBox = document.createElement('div');
	this.instructions();
	this.instructionsBox.style.display = 'none';
	this.gammaInfoBut.setAttribute('type','button');
	this.gammaInfoBut.value = 'Log Info';
	this.gammaInfoBox = document.createElement('div');
	this.gammaInfo();
	this.gammaInfoBox.style.display = 'none';
	this.gammaChartBut.setAttribute('type','button');
	this.gammaChartBut.value = 'Charts';
	this.gammaChartBox = document.createElement('div');
	this.gammaChart();
	this.gammaChartBox.style.display = 'block';
	this.box.appendChild(this.instructionsBut);
	this.box.appendChild(this.gammaInfoBut);
	this.box.appendChild(this.gammaChartBut);
	this.box.appendChild(this.instructionsBox);
	this.box.appendChild(this.gammaInfoBox);
	this.box.appendChild(this.gammaChartBox);
}
LUTInfoBox.prototype.instructions = function() {
	this.instructionsBox.setAttribute('class','graybox infobox');
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
	this.createInfInfo();
	this.instructionsBox.appendChild(this.insInf);
	this.createCustCts();
	this.instructionsBox.appendChild(this.custCts);
	this.createCustFlc();
	this.instructionsBox.appendChild(this.custFlc);
	this.createCustPsst();
	this.instructionsBox.appendChild(this.custPsst);
	this.createCustCdl();
	this.instructionsBox.appendChild(this.custCdl);
	this.createCustGam();
	this.instructionsBox.appendChild(this.custGam);
	this.createCustBhi();
	this.instructionsBox.appendChild(this.custBhi);
	this.createCustFls();
	this.instructionsBox.appendChild(this.custFls);
	this.createCustLut();
	this.instructionsBox.appendChild(this.custLut);
	this.setupEvents();
}
LUTInfoBox.prototype.showMainscreen = function() {
	this.hideAll();
	this.mainscreen.style.display = 'block';
}
LUTInfoBox.prototype.showCamInfo = function() {
	this.hideAll();
	this.insCam.style.display = 'block';
}
LUTInfoBox.prototype.showGamInfo = function() {
	this.hideAll();
	this.insGam.style.display = 'block';
}
LUTInfoBox.prototype.showCustscreen = function() {
	this.hideAll();
	this.insTwk.style.display = 'block';
}
LUTInfoBox.prototype.showLutInfo = function() {
	this.hideAll();
	this.insLut.style.display = 'block';
}
LUTInfoBox.prototype.showPreInfo = function() {
	this.hideAll();
	this.insPre.style.display = 'block';
}
LUTInfoBox.prototype.showGenInfo = function() {
	this.hideAll();
	this.insGen.style.display = 'block';
}
LUTInfoBox.prototype.showInfInfo = function() {
	this.hideAll();
	this.insInf.style.display = 'block';
}
LUTInfoBox.prototype.showCustGamInfo = function() {
	this.hideAll();
	this.custGam.style.display = 'block';
}
LUTInfoBox.prototype.showCustBhiInfo = function() {
	this.hideAll();
	this.custBhi.style.display = 'block';
}
LUTInfoBox.prototype.showCustCtsInfo = function() {
	this.hideAll();
	this.custCts.style.display = 'block';
}
LUTInfoBox.prototype.showCustFlcInfo = function() {
	this.hideAll();
	this.custFlc.style.display = 'block';
}
LUTInfoBox.prototype.showCustPsstInfo = function() {
	this.hideAll();
	this.custPsst.style.display = 'block';
}
LUTInfoBox.prototype.showCustCdlInfo = function() {
	this.hideAll();
	this.custCdl.style.display = 'block';
}
LUTInfoBox.prototype.showCustFlsInfo = function() {
	this.hideAll();
	this.custFls.style.display = 'block';
}
LUTInfoBox.prototype.showCustLutInfo = function() {
	this.hideAll();
	this.custLut.style.display = 'block';
}
LUTInfoBox.prototype.hideAll = function() {
	this.mainscreen.style.display = 'none';
	this.insCam.style.display = 'none';
	this.insGam.style.display = 'none';
	this.insTwk.style.display = 'none';
	this.insLut.style.display = 'none';
	this.insPre.style.display = 'none';
	this.insGen.style.display = 'none';
	this.insInf.style.display = 'none';
	this.custCts.style.display = 'none';
	this.custFlc.style.display = 'none';
	this.custPsst.style.display = 'none';
	this.custCdl.style.display = 'none';
	this.custGam.style.display = 'none';
	this.custBhi.style.display = 'none';
	this.custFls.style.display = 'none';
	this.custLut.style.display = 'none';
}
LUTInfoBox.prototype.createMainscreen = function() {
	this.mainscreen = document.createElement('div');
	this.mainscreen.setAttribute('class','imagemap');
	this.mainscreen.setAttribute('id','ins-mainscreen');
	var click = document.createElement('p');
	click.appendChild(document.createTextNode('Click an area for information:'));
	this.mainscreen.appendChild(click);
	var header = document.createElement('div');
	header.setAttribute('class','imagemapimg');	
	header.setAttribute('id','ins-main-header');	
	this.mainscreen.appendChild(header);
	var left = document.createElement('div');
	left.setAttribute('id','ins-main-left');
	this.insMainCam = document.createElement('div');
	this.insMainCam.setAttribute('class','imagemapimg');
	this.insMainCam.setAttribute('id','ins-main-cam');
	left.appendChild(this.insMainCam);
	this.insMainGam = document.createElement('div');
	this.insMainGam.setAttribute('class','imagemapimg');
	this.insMainGam.setAttribute('id','ins-main-gam');
	left.appendChild(this.insMainGam);
	this.insMainTwk = document.createElement('div');
	this.insMainTwk.setAttribute('class','imagemapimg');
	this.insMainTwk.setAttribute('id','ins-main-twk');
	left.appendChild(this.insMainTwk);
	var spacer = document.createElement('div');
	spacer.setAttribute('class','imagemapimg');
	spacer.setAttribute('id','ins-main-spacer');	
	left.appendChild(spacer);
	this.mainscreen.appendChild(left);
	var right = document.createElement('div');
	right.setAttribute('id','ins-main-right');
	this.insMainLut = document.createElement('div');
	this.insMainLut.setAttribute('class','imagemapimg');
	this.insMainLut.setAttribute('id','ins-main-lut');
	right.appendChild(this.insMainLut);
	var buttons = document.createElement('div');
	buttons.setAttribute('id','ins-main-buttons');
	this.insMainPre = document.createElement('div');
	this.insMainPre.setAttribute('class','imagemapimg');
	this.insMainPre.setAttribute('id','ins-main-pre');
	buttons.appendChild(this.insMainPre);
	this.insMainGen = document.createElement('div');
	this.insMainGen.setAttribute('class','imagemapimg');
	this.insMainGen.setAttribute('id','ins-main-gen');
	buttons.appendChild(this.insMainGen);
	right.appendChild(buttons);
	this.insMainInf = document.createElement('div');
	this.insMainInf.setAttribute('class','imagemapimg');
	this.insMainInf.setAttribute('id','ins-main-inf');
	right.appendChild(this.insMainInf);
	this.mainscreen.appendChild(right);
	var footer = document.createElement('div');
	footer.setAttribute('class','imagemapimg');	
	footer.setAttribute('id','ins-main-footer');	
	this.mainscreen.appendChild(footer);
}
LUTInfoBox.prototype.createCamInfo = function() {
	this.insCam = document.createElement('div');
	this.insCam.setAttribute('class','instructions');
	this.insCam.setAttribute('id','ins-cam');
	this.insCamBack = document.createElement('input');
	this.insCamBack.setAttribute('type','button');
	this.insCamBack.value = 'Back';
	this.insCam.appendChild(this.insCamBack);
	this.insCamInfo = document.createElement('div');
	this.insCamInfo.setAttribute('class','infotext');
	var cam1 = document.createElement('div');
	cam1.setAttribute('class','infoimage');
	cam1.setAttribute('id','ins-cam-1');
	this.insCamInfo.appendChild(cam1);
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
	this.insCam.style.display = 'none';
	this.insCam.appendChild(this.insCamInfo);
}
LUTInfoBox.prototype.createGamInfo = function() {
	this.insGam = document.createElement('div');
	this.insGam.setAttribute('class','instructions');
	this.insGam.setAttribute('id','ins-gam');
	this.insGamBack = document.createElement('input');
	this.insGamBack.setAttribute('type','button');
	this.insGamBack.value = 'Back';
	this.insGam.appendChild(this.insGamBack);
	this.insGamInfo = document.createElement('div');
	this.insGamInfo.setAttribute('class','infotext');
	var gam1 = document.createElement('div');
	gam1.setAttribute('class','infoimage');
	gam1.setAttribute('id','ins-gam-1');
	this.insGamInfo.appendChild(gam1);
	this.addInfo(this.insGamInfo,false,null,'This box is used to set the transfer function and colour space that the camera records to and the basic combination that the LUT is intended to output.');
	this.addInfo(this.insGamInfo,false,null,"The menus refer to 'Gamma' and 'Gamut' as these terms are in common use and generally understood in the context, though the accurate terms should be 'Transfer Function' and 'Colour Space'.");
	this.addInfo(this.insGamInfo,false,null,'There are four types of transfer function offered:');
	this.addInfo(this.insGamInfo,true,'Log Curves','These are designed to spread picture information evenly between stops and are how cameras are able to capture high dynamic range within limited bit depth whilst allowing extensive manipulation in post.');
	this.addInfo(this.insGamInfo,true,null,'They are not intended to be used uncorrected, appearing very flat and dull. For this reason they are also not very suitable for setting exposures to. Examples are S-Log, S-Log2 and S-Log3 on Sony cameras, C-Log on Canon cameras and LogC on Arris.');
	this.addInfo(this.insGamInfo,true,'Linear And Gamma Curves',"These are offered when 'Linear/Rec709' is selected in the gamma boxes. Pure linear is effectively the sensor response of the camera; the value is proportional to the number of photons hitting the sensor.");
	this.addInfo(this.insGamInfo,true,null,'Displays generally expect the linear signal to be adjusted with a power function, raising the linear value in relation to a power known as the gamma. sRGB is common in computing and photography, Rec709 is the standard for HDTV and Rec2020 is a slight refinement of Rec709 for UHDTV and deeper bit depths.');
	this.addInfo(this.insGamInfo,true,'Creative Curves','These are curves which are not defined by standards, though generally relate to them. An example is Rec709(800%) which is a Sony interpretation of Rec709 with a smooth knee to extend the dynamic range captured to 800% IRE at a recording level of 109%. These are the main choices for useful camera gammas.');
	this.addInfo(this.insGamInfo,true,'Hybrid Gamma Curves',"These are proposed replacements for the current Rec709/Rec2020 curves as displays become able to produces very wide dynamic ranges. Two, listed as 'ITU Proposal' and 'BBC WHP283' are very similar to Rec709 in the shadows and midtones, but transitioning to a flat log region in the highlights.");
	this.addInfo(this.insGamInfo,true,null,"'Dolby PQ' breaks with backwards compatibility and distributes picture information in a way calculated to hold the maximum possible dynamic range for a given bit depth before effects such as banding become apparent. It appears extraordinarily flat on a Rec709 or sRGB screen.");
	this.addInfo(this.insGamInfo,false,null,'There are two main types of colour space:');
	this.addInfo(this.insGamInfo,true,'Matrix','These are gamuts where a picture can be changed from one to another via a 3x3 matrix performed on linear data. There are capture ones such as the S-Gamuts, Arri Wide Gamut and Canon Cinema Gamut, photometric and intermediate ones such as XYZ and ACES and output gamuts such as Rec709 and Rec2020 (the last two have very similar transfer functions, but the Rec2020 colour space is much wider than the Rec709 one).');
	this.addInfo(this.insGamInfo,true,'LUT','These are ones where the conversion from another colour space is complex and may be irreversible, so LUTCalc stores them as LUTs internally. The advantage is that they can have more complex responses than basic matrices, changing saturation with colour and exposure or tuning the look to favour skin tones or natural greens. Examples include LC709 and LC709A, based on the look profiles produced by Sony.');
	this.addInfo(this.insGamInfo,true,null,'LC709 as a colour space gives a similar though arguably subtler colour response than the basic Rec709 matrix');
	this.insGam.style.display = 'none';
	this.insGam.appendChild(this.insGamInfo);
}
LUTInfoBox.prototype.createTwkInfo = function() {
	this.insTwk = document.createElement('div');
	this.insTwk.setAttribute('class','instructions');
	this.insTwk.setAttribute('id','ins-twk');
	this.insCustBack = document.createElement('input');
	this.insCustBack.setAttribute('type','button');
	this.insCustBack.value = 'Back';
	this.insTwk.appendChild(this.insCustBack);
	var click = document.createElement('p');
	click.appendChild(document.createTextNode('Click an area for information:'));
	this.insTwk.appendChild(click);
	this.custscreen = document.createElement('div');
	this.custscreen.setAttribute('class','imagemap');
	this.custscreen.setAttribute('id','ins-custscreen');
	var header = document.createElement('div');
	header.setAttribute('class','imagemapimg');	
	header.setAttribute('id','ins-cust-header');	
	this.custscreen.appendChild(header);
	this.insCustCts = document.createElement('div');
	this.insCustCts.setAttribute('class','imagemapimg');	
	this.insCustCts.setAttribute('id','ins-cust-cts');	
	this.custscreen.appendChild(this.insCustCts);
	this.insCustFlc = document.createElement('div');
	this.insCustFlc.setAttribute('class','imagemapimg');	
	this.insCustFlc.setAttribute('id','ins-cust-flc');	
	this.custscreen.appendChild(this.insCustFlc);
	this.insCustPsst = document.createElement('div');
	this.insCustPsst.setAttribute('class','imagemapimg');	
	this.insCustPsst.setAttribute('id','ins-cust-psst');	
	this.custscreen.appendChild(this.insCustPsst);
	this.insCustCdl = document.createElement('div');
	this.insCustCdl.setAttribute('class','imagemapimg');	
	this.insCustCdl.setAttribute('id','ins-cust-cdl');	
	this.custscreen.appendChild(this.insCustCdl);
	this.insCustGam = document.createElement('div');
	this.insCustGam.setAttribute('class','imagemapimg');	
	this.insCustGam.setAttribute('id','ins-cust-gam');	
	this.custscreen.appendChild(this.insCustGam);
	this.insCustBhi = document.createElement('div');
	this.insCustBhi.setAttribute('class','imagemapimg');	
	this.insCustBhi.setAttribute('id','ins-cust-bhi');	
	this.custscreen.appendChild(this.insCustBhi);
	this.insCustFls = document.createElement('div');
	this.insCustFls.setAttribute('class','imagemapimg');	
	this.insCustFls.setAttribute('id','ins-cust-fls');	
	this.custscreen.appendChild(this.insCustFls);
	this.insCustLut = document.createElement('div');
	this.insCustLut.setAttribute('class','imagemapimg');	
	this.insCustLut.setAttribute('id','ins-cust-lut');	
	this.custscreen.appendChild(this.insCustLut);
	var footer = document.createElement('div');
	footer.setAttribute('class','imagemapimg');	
	footer.setAttribute('id','ins-cust-footer');	
	this.custscreen.appendChild(footer);
	this.insTwk.style.display = 'none';
	this.insTwk.appendChild(this.custscreen);
}
LUTInfoBox.prototype.createLutInfo = function() {
	this.insLut = document.createElement('div');
	this.insLut.setAttribute('class','instructions');
	this.insLut.setAttribute('id','ins-lut');
	this.insLutBack = document.createElement('input');
	this.insLutBack.setAttribute('type','button');
	this.insLutBack.value = 'Back';
	this.insLut.appendChild(this.insLutBack);
	this.insLutInfo = document.createElement('div');
	this.insLutInfo.setAttribute('class','infotext');
	var lut1 = document.createElement('div');
	lut1.setAttribute('class','infoimage');
	lut1.setAttribute('id','ins-lut-1');
	this.insLutInfo.appendChild(lut1);
	this.addInfo(this.insLutInfo,false,null,'This is the box where the format of the LUT to be generated is decided.');
	this.addInfo(this.insLutInfo,false,null,"The first option is 'LUT Title / Filename'. As well as being used as the filename for saving the LUT, this appears within the file as the title. This may help keep track of LUTs in case filenames change. LUTCalc will make sure that it is appropriately formatted.");
	this.addInfo(this.insLutInfo,false,null,'LUTCalc produces 1D and 3D LUTs:');
	this.addInfo(this.insLutInfo,true,'1D','these are used for contrast control, with each colour channel changed independently.');
	this.addInfo(this.insLutInfo,true,null,'With a 1D LUT it is practical to store every possible 8-bit, 10-bit or 16-bit value. As such the adjustment can be arbitrarily complex, which may well be useful for storing an extensive grade, but with smooth curves such as those built in to LUTCalc and the use of cubic interpolation, considerably fewer control point are needed for an effective result.');
	this.addInfo(this.insLutInfo,true,'3D','3D LUTs input combinations of red, green and blue values to reference output values. This allows for sophisticated adjustment of colours across the gamut and exposure range. Where a 1024-point 1D LUT covers every possible 10-bit input value for one channel, a 3D LUT would need to be 1024x1024x1024-point to consider every possible RGB combination.');
	this.addInfo(this.insLutInfo,true,null,'This would be impractically large and complex, so 3D LUTs are generally of a much smaller dimension and use interpolation to obtain intermediate values. LUTCalc can produce the most common 3D sizes for a chosen LUT format.');
	this.addInfo(this.insLutInfo,true,null,'Sony F cameras accept 33x33x33 cubes and this size does a very good job of reproducing the kinds of effects possible in LUTCalc. 65x65x65 is much larger, but gives greater precision for post software where the size is less of an issue.');
	this.addInfo(this.insLutInfo,false,null,'After the dimension settings come the range options. Cube LUTs contain floating point values rather than integers, and generally map 0 to be black and 1 to be white. Values can actually be greater or less than these, but 0 and 1 are the reference points. What 0 and 1 actually represent depends on the video range used.');
	this.addInfo(this.insLutInfo,true,'Legal Range',"10-bit binary can store 1024 different values, in the decimal range 0-1023. In analogue video picture information was stored within a voltage range defined as a percentage 0%-100%. Values just outside were that classed 'super black' and 'super white'.");
	this.addInfo(this.insLutInfo,true,null,"In digital video, 0% IRE has been defined as 10-bit 64 in decimal, with 100% IRE at 10-bit 940. With 'legal range' set 0 in the LUT equates to 0% IRE and 1 equates to 100% IRE. On this scale, 10-bit 0 would be -0.073 and 10-bit 1023 1.095.");
	this.addInfo(this.insLutInfo,true,null,"This is a commonly expected output range in software such as DaVinci Resolve and is the output range of Sony monitor LUTs (MLUTS).");
	this.addInfo(this.insLutInfo,true,'Data Range','this treats the full range of 10-bit values as mapping to the 0-1 LUT range. Technically, the top and bottom couple of values are generally reserved, but for the sake of simplicity that can be ignored here. LUTs can output values outside of the 0-1 range, but can only consider input values within it. If a log recording goes outside of legal range (generally only above 1), then the LUT input needs to be data range to make sure that no data is lost.');
	this.addInfo(this.insLutInfo,true,null,'S-Log2 and Canon C-Log both go above legal range, and for consistency Sony recommends working with S-Log3 set to data range in software such as Resolve. Sony MLUTs are data in, legal out.');
	this.addInfo(this.insLutInfo,false,null,'LUTCalc will generally default to data in, legal out, though if both the input and output gammas are log curves then it will set data in data out, on the assumption that further LUTs or corrections will be applied.');
	this.addInfo(this.insLutInfo,false,null,'It has also been suggested that the Lumetri plugin in Adobe Premiere CC expects data in, data out in order to give the correct look. The best suggestion is to test and compare in the software to be used in post.');
	this.addInfo(this.insLutInfo,false,null,'The final set of options sets the levels and output format correctly for a particular task or camera.');
	this.addInfo(this.insLutInfo,true,'Grading LUT','This brings up a set of options for generating LUTs suitable for postproduction software. The default option is a generic .cube file, but a number of alternate formats and specific pieces of software are also available.');
	this.addInfo(this.insLutInfo,true,'Camera LUT (MLUT)','This option is for generating LUT suitable for loading into a camera for use as a monitor LUT, or MLUT.');
	this.addInfo(this.insLutInfo,false,null,'Some LUT formats allow for scaling of the inputs, to allow for inputs which needs to lie outside of 0-1.0. An example would be a linear to log LUT, where the linear range between 0 and 1.0 is only a small portion of a log curve. Scaling means that the input range in this case could be between 0 and 12.0.');
	this.addInfo(this.insLutInfo,false,null,'Where a LUT format supports scaling, LUTCalc will display minimum and maximum boxes. These default to 0 and 1.0 respectively, and generally do not need to be changed.');
	this.addInfo(this.insLutInfo,true,'Hard Clip 0-1.0','Many LUT formats allows for output values beyond 0-1. This allows limited dynamic range conversions such as linear or Rec709 to be performed non destructively, ie the overexposed data can still be pulled back into range.');
	this.addInfo(this.insLutInfo,true,null,'Some software does not handle out of range values correctly, so this option hard clips from 0-1.0. This does mean that data outside of that range is lost.');
	this.insLut.style.display = 'none';
	this.insLut.appendChild(this.insLutInfo);
}
LUTInfoBox.prototype.createPreInfo = function() {
	this.insPre = document.createElement('div');
	this.insPre.setAttribute('class','instructions');
	this.insPre.setAttribute('id','ins-gen');
	this.insPreBack = document.createElement('input');
	this.insPreBack.setAttribute('type','button');
	this.insPreBack.value = 'Back';
	this.insPre.appendChild(this.insPreBack);
	this.insPreInfo = document.createElement('div');
	this.insPreInfo.setAttribute('class','infotext');
	var pre1 = document.createElement('div');
	pre1.setAttribute('class','infoimage');
	pre1.setAttribute('id','ins-pre-1');
	this.insPreInfo.appendChild(pre1);
	this.addInfo(this.insPreInfo,false,null,"Clicking 'Preview' brings up a test image in place of the LUT options box at the top right. It is displayed legal range and incorporates any adjustments made.");
	this.addInfo(this.insPreInfo,false,null,'LUTCalc includes four test images.');
	this.addInfo(this.insPreInfo,true,'High Contrast','The initial one is high contrast, covering around eleven or twelve stops and with information over 5 1/2 stops above 18% gray.');
	this.addInfo(this.insPreInfo,true,'Low Contrast','This toggles to the second image, which is against greenscreen and stays within the dynamic range of Rec709, with about 2 1/3 stops above 18% gray.');
	this.addInfo(this.insPreInfo,true,'Rec709 Gamut','This toggles to the third image, which visualises colours across the entire Rec709 colour gamut. The layout matches the positions of the colours on a Rec709 vectorscope.');
	this.addInfo(this.insPreInfo,true,'Grayscale','This toggles to the final image, a 16-stop grayscale. The upper portion smoothly shifts from 8 stops below mid gray to 7 stops above, with the lower portion going in one-stop steps. The vertical line marks 18% gray. On the waveform, this image will match up with the Stop/IRE chart.');
	this.addInfo(this.insPreInfo,false,null,'The high and low contrast images include a set of Rec709 75% and 100% primary and secondary boxes, a 16-stop grayscale and a colour chart on the right.');
	this.addInfo(this.insPreInfo,false,null,'The high contrast image also includes colour charts four stops above and below base and the low contrast chart two stops above and below.');
	this.addInfo(this.insPreInfo,false,null,"An image recorded in a known colour space can also be loaded in place of the defaults by clicking 'Load Preview...'. The webapp version of LUTCalc accepts 8-bit formats, such as JPEG, PNG and BMP. LUTCalc For Mac can additionally read 16-bit TIFF and PNG images.");
	this.addInfo(this.insPreInfo,false,null,"'Large Image' / 'Small Image' toggles between the default small preview image and a larger version which requires scrolling to view the scopes.");
	this.addInfo(this.insPreInfo,false,null,'Above the preview window are the scope options:');
	var pre2 = document.createElement('div');
	pre2.setAttribute('class','infoimage');
	pre2.setAttribute('id','ins-pre-2');
	this.insPreInfo.appendChild(pre2);
	this.addInfo(this.insPreInfo,true,'Waveform','The horizontal axis is the same as the test image, whilst the vertical axis is luma values of all the pixels in that column. The scale lines are blocks of 10% IRE and the full range runs from -7% to +109%.');
	this.addInfo(this.insPreInfo,true,'Vectorscope','This is a polar plot of the image chroma. LUTCalc includes standard 75% and 100% Rec709 boxes (the two rows of green circles). In pure Rec709 75% colour bars should fall dead centre of the inner green circles.');
	this.addInfo(this.insPreInfo,true,null,'In addition there is a set of 75% Rec709 boxes that have been mapped to the current chosen colour space. These are the colour of their associated primary or secondary and will lie inside the green ones.');
	this.addInfo(this.insPreInfo,true,null,'These give a guide to the size and nature of the chosen colour space, and also where a test chart should lie for correcting colour casts without changing colour space.');
	this.addInfo(this.insPreInfo,true,'RGB Parade','Similar to the waveform, but the red, green and blue components are separated horizontally.');
	this.insPre.style.display = 'none';
	this.insPre.appendChild(this.insPreInfo);
}
LUTInfoBox.prototype.createGenInfo = function() {
	this.insGen = document.createElement('div');
	this.insGen.setAttribute('class','instructions');
	this.insGen.setAttribute('id','ins-gen');
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
	this.addInfo(this.insGenInfo,false,null,"LUTCalc currently generates LUTs in the 'cube' format.");
	this.insGen.style.display = 'none';
	this.insGen.appendChild(this.insGenInfo);
}
LUTInfoBox.prototype.createInfInfo = function() {
	this.insInf = document.createElement('div');
	this.insInf.setAttribute('class','instructions');
	this.insInf.setAttribute('id','ins-inf');
	this.insInfBack = document.createElement('input');
	this.insInfBack.setAttribute('type','button');
	this.insInfBack.value = 'Back';
	this.insInf.appendChild(this.insInfBack);
	this.insInfPic = document.createElement('div');
	this.insInfPic.setAttribute('class','imagemap');
	this.insInfPic.setAttribute('id','ins-inf-pic');
	this.insInf.appendChild(this.insInfPic);
	this.insInfInfo = document.createElement('div');
	this.insInfInfo.setAttribute('class','infotext');
	var inf1 = document.createElement('div');
	inf1.setAttribute('class','infoimage');
	inf1.setAttribute('id','ins-inf-1');
	this.insInfInfo.appendChild(inf1);
	this.addInfo(this.insInfInfo,false,null,'This box contains provides information about the current LUT under construction including suggested exposure values and transfer curves, plus instructions for LUTCalc.');
	this.addInfo(this.insInfInfo,false,'Instructions','Hopefully fairly obvious, after all here you are!');
	this.addInfo(this.insInfInfo,false,'Log Info','This shows tables of % IRE and 10-bit values for the main log and gamma curves, plus the current output curve.');
	this.addInfo(this.insInfInfo,false,'Charts','This provides three different ways of comparing input and output levels:');
	this.addInfo(this.insInfInfo,true,'Reflected/IRE','Reflectance levels of the scene (eg 18% gray, 90% white) against % IRE. The simplest chart, but as the x-axis is linear it is hard to read anything meaningful from it.');
	this.addInfo(this.insInfInfo,true,'Stop/IRE','Shows the output level against input stops. Clearly shows the difference between linear/gamma (keep increasing in slope), log curves (tend towards a straight line slope in the highlights and curves with knee (tend towards a horizontal line in the highlights). Also gives a good idea of dynamic range in stops.');
	this.addInfo(this.insInfInfo,true,null,'Areas beyond the range of the chosen camera are shaded. When the CineEI ISO is changed or Stop Correction is applied the level of 18% gray in the underlying recording is shown with a pink vertical line.');
	this.addInfo(this.insInfInfo,true,'LUT In/LUT Out','similar to Stop/IRE, but better shows true black (black is technically minus infinity stops, so Stop/IRE never quite shows it).');
	this.addInfo(this.insInfInfo,false,null,'The charts tab also includes a table of % IRE and 10-bit values for the current curve.');
	this.insInf.style.display = 'none';
	this.insInf.appendChild(this.insInfInfo);
}
LUTInfoBox.prototype.createCustGam = function() {
	this.custGam = document.createElement('div');
	this.custGam.setAttribute('class','instructions');
	this.custGam.setAttribute('id','cust-gam');
	this.custGamBack = document.createElement('input');
	this.custGamBack.setAttribute('type','button');
	this.custGamBack.value = 'Back';
	this.custGam.appendChild(this.custGamBack);
	this.custGamInfo = document.createElement('div');
	this.custGamInfo.setAttribute('class','infotext');
	var gam1 = document.createElement('div');
	gam1.setAttribute('class','infoimage');
	gam1.setAttribute('id','ins-cust-gam-1');
	this.custGamInfo.appendChild(gam1);
	this.addInfo(this.custGamInfo,false,null,"With 'Highlight Gamut' a second colour space or gamut can be applied above a user-selectable exposure range.");
	this.addInfo(this.custGamInfo,false,null,'The transition can be calculated linearly, over a range of reflectance percentages (eg between 18% gray and 90% white) or logarithmically, set in stops above or below 18% gray.');
	this.addInfo(this.custGamInfo,false,null,'With this effects such as muted or black and white highlights with saturated midtones can be achieved in a LUT.');
	this.custGam.style.display = 'none';
	this.custGam.appendChild(this.custGamInfo);
}
LUTInfoBox.prototype.createCustBhi = function() {
	this.custBhi = document.createElement('div');
	this.custBhi.setAttribute('class','instructions');
	this.custBhi.setAttribute('id','cust-bhi');
	this.custBhiBack = document.createElement('input');
	this.custBhiBack.setAttribute('type','button');
	this.custBhiBack.value = 'Back';
	this.custBhi.appendChild(this.custBhiBack);
	this.custBhiInfo = document.createElement('div');
	this.custBhiInfo.setAttribute('class','infotext');
	this.addInfo(this.custBhiInfo,false,null,'Black Level and Highlight Level apply an offset and scaling after all other adjustments and conversions have been applied.');
	var bhi1 = document.createElement('div');
	bhi1.setAttribute('class','infoimage');
	bhi1.setAttribute('id','ins-cust-bhi-1');
	this.custBhiInfo.appendChild(bhi1);
	this.addInfo(this.custBhiInfo,false,'Black Level','initially gives the % IRE level of 0% black in the output transfer function or gamma. This can then be fixed against highlight adjustments or reset, for example to thicken the black level by a measured amount.');
	this.addInfo(this.custBhiInfo,false,null,'Black Level and Highlight Level include ASC-CDL adjustments in their calculations, so any ASC-CDL adjustments should be made before Black Level and Highlight Level adjustments.');
	var bhi2 = document.createElement('div');
	bhi2.setAttribute('class','infoimage');
	bhi2.setAttribute('id','ins-cust-bhi-2');
	this.custBhiInfo.appendChild(bhi2);
	this.addInfo(this.custBhiInfo,false,'Highlight Level','this will give the % IRE level of a selectable reflectance percentage (initially 90% white) for the output curve. Also shown is the equivalent % IRE in the Rec709 display gamma.');
	this.addInfo(this.custBhiInfo,false,null,'The output level can then be altered and LUTCalc will scale the output curve.');
	this.addInfo(this.custBhiInfo,false,null,'As with Black Level, Highlight Level incorporates ASC-CDL adjustments, so any ASC-CDL adjustments should be made before Black Level and Highlight Level adjustments.');
	this.addInfo(this.custBhiInfo,false,null,'Black and Highlight Level adjustments work together, for example to adjust the LC709 and LC709A curves from being legal range - peaking just below 100% - to extended range (Reflected 1350% maps to 108.9%) without changing the black level.');
	this.custBhi.style.display = 'none';
	this.custBhi.appendChild(this.custBhiInfo);
}
LUTInfoBox.prototype.createCustCts = function() {
	this.custCts = document.createElement('div');
	this.custCts.setAttribute('class','instructions');
	this.custCts.setAttribute('id','cust-cts');
	this.custCtsBack = document.createElement('input');
	this.custCtsBack.setAttribute('type','button');
	this.custCtsBack.value = 'Back';
	this.custCts.appendChild(this.custCtsBack);
	this.custCtsInfo = document.createElement('div');
	this.custCtsInfo.setAttribute('class','infotext');
	var cts1 = document.createElement('div');
	cts1.setAttribute('class','infoimage');
	cts1.setAttribute('id','ins-cust-cts-1');
	this.custCtsInfo.appendChild(cts1);
	this.addInfo(this.custCtsInfo,false,null,"'Colour Temperature Shift' warms or cools the picture to fine tune white balances, or to provide intermediate temperatures unavailable in camera (eg CineEI on the Sony F cameras) through a LUT.");
	this.addInfo(this.custCtsInfo,false,null,'Adjustments can be made using a slider which approximates the values of CTO and CTB lighting gel, or for more photometrically accurate adjustment the recorded and desired colour temperatures can be entered.');
	var cts2 = document.createElement('div');
	cts2.setAttribute('class','infoimage');
	cts2.setAttribute('id','ins-cust-cts-2');
	this.custCtsInfo.appendChild(cts2);
	this.addInfo(this.custCtsInfo,false,null,'The colour adjustment is done using a Von Kries-style chromatic transform, and with the advanced option the choice of CAT matrix becomes user selectable.');
	this.custCts.style.display = 'none';
	this.custCts.appendChild(this.custCtsInfo);
}
LUTInfoBox.prototype.createCustFlc = function() {
	this.custFlc = document.createElement('div');
	this.custFlc.setAttribute('class','instructions');
	this.custFlc.setAttribute('id','cust-flc');
	this.custFlcBack = document.createElement('input');
	this.custFlcBack.setAttribute('type','button');
	this.custFlcBack.value = 'Back';
	this.custFlc.appendChild(this.custFlcBack);
	this.custFlcInfo = document.createElement('div');
	this.custFlcInfo.setAttribute('class','infotext');
	var flc1 = document.createElement('div');
	flc1.setAttribute('class','infoimage');
	flc1.setAttribute('id','ins-cust-flc-1');
	this.custFlcInfo.appendChild(flc1);
	this.addInfo(this.custFlcInfo,false,null,"'Fluori / LED Correction' applies a magenta or green cast to the image to counteract the effect of energy efficient lighting, particularly LEDs and fluorescent tubes.");
	this.addInfo(this.custFlcInfo,false,null,'The same chromatic adaptation modelling is used as in the colour temperature shift, but the shift is at right angles to the colour temperature line (Planck Locus).');
	this.addInfo(this.custFlcInfo,false,null,'The default setup uses a slider which roughly mimics plus and minus green gels.');
	var flc2 = document.createElement('div');
	flc2.setAttribute('class','infoimage');
	flc2.setAttribute('id','ins-cust-flc-2');
	this.custFlcInfo.appendChild(flc2);
	this.addInfo(this.custFlcInfo,false,null,'The advanced settings include adjustment of the nominal temperature of the light source, to tune the green or magenta hue.');
	this.addInfo(this.custFlcInfo,false,null,'The choice of CAT matrix can also be changed.');

	this.custFlc.style.display = 'none';
	this.custFlc.appendChild(this.custFlcInfo);
}
LUTInfoBox.prototype.createCustPsst = function() {
	this.custPsst = document.createElement('div');
	this.custPsst.setAttribute('class','instructions');
	this.custPsst.setAttribute('id','cust-psst');
	this.custPsstBack = document.createElement('input');
	this.custPsstBack.setAttribute('type','button');
	this.custPsstBack.value = 'Back';
	this.custPsst.appendChild(this.custPsstBack);
	this.custPsstInfo = document.createElement('div');
	this.custPsstInfo.setAttribute('class','infotext');
	var psst1 = document.createElement('div');
	psst1.setAttribute('class','infoimage');
	psst1.setAttribute('id','ins-cust-psst-1');
	this.custPsstInfo.appendChild(psst1);
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
	var psst2 = document.createElement('div');
	psst2.setAttribute('class','infoimage');
	psst2.setAttribute('id','ins-cust-psst-2');
	this.custPsstInfo.appendChild(psst2);
	this.addInfo(this.custPsstInfo,false,null,'The Refinements window shows a set of vertical sliders which can be used to make adjustments to both the seven base colours and intermediate colours. Rather like a graphic equalizer.');
	this.addInfo(this.custPsstInfo,false,null,"The initial intermediate values are interpolated from any adjustments made in the 'Base Adjustments' window.");
	this.addInfo(this.custPsstInfo,false,null,'Refinements defaults to adjusting Saturation, but this can be changed to Colour, Slope, Offset or Power.');
	this.addInfo(this.custPsstInfo,false,null,'To fix an intermediate value, click on the checkbox beneath the slider. A ticked checkbox will not be interpolated by Base Adjustment changes.');
	this.addInfo(this.custPsstInfo,false,null,'The spectrum background displays the effect of PSST adjustments in the current colour space (top and bottom before, centre after).');
	var psst3 = document.createElement('div');
	psst3.setAttribute('class','infoimage');
	psst3.setAttribute('id','ins-cust-psst-3');
	this.custPsstInfo.appendChild(psst3);
	this.addInfo(this.custPsstInfo,false,null,'The primaries and secondaries on a Rec709 vectorscope take the shape of a squashed hexagon, ie the distance from the centre (grayscale) to the edges (100% saturation) varies with colour. Equally, the luma (Y) value of a full saturation varies with colour, reflecting the sensitivity of human vision.');
	this.addInfo(this.custPsstInfo,false,null,'By default, when a PSST colour shift is applied, PSST-CDL will attempt to scale the magnitude on the vectorscope to match the difference between the values for the initial and final colours. For a full match, the Y value would also need to be scaled. However this tends to produce extreme results on real images, so is off by default.');
	this.addInfo(this.custPsstInfo,false,null,'The advanced settings in PSST-CDL allow these two scalings to be turned on or off.');
	this.custPsst.style.display = 'none';
	this.custPsst.appendChild(this.custPsstInfo);
}
LUTInfoBox.prototype.createCustCdl = function() {
	this.custCdl = document.createElement('div');
	this.custCdl.setAttribute('class','instructions');
	this.custCdl.setAttribute('id','cust-cdl');
	this.custCdlBack = document.createElement('input');
	this.custCdlBack.setAttribute('type','button');
	this.custCdlBack.value = 'Back';
	this.custCdl.appendChild(this.custCdlBack);
	this.custCdlInfo = document.createElement('div');
	this.custCdlInfo.setAttribute('class','infotext');
	var cdl1 = document.createElement('div');
	cdl1.setAttribute('class','infoimage');
	cdl1.setAttribute('id','ins-cust-cdl-1');
	this.custCdlInfo.appendChild(cdl1);
	this.addInfo(this.custCdlInfo,false,null,'The ASC-CDL is a set of transforms developed by the American Society of Cinematographers intended to provide consistent adjustments across software and cameras.');
	this.addInfo(this.custCdlInfo,false,null,'It is also a system of XML code for conveying those adjustments between systems and from frame to frame.');
	this.addInfo(this.custCdlInfo,false,null,'LUTCalc provides the controls as a simple and clear way of adjusting the picture, but does not implement the full ASC-CDL system.');
	this.addInfo(this.custCdlInfo,false,null,'The ASC-CDL is based around three basic parameters applied to each of the red, green and blue channels, plus a saturation parameter which couples all three:');
	this.addInfo(this.custCdlInfo,true,'Slope','Analogous to gain, an input value is multiplied by this. Defined as any value from 0 (a flat line) up, the default value is 1.0.');
	this.addInfo(this.custCdlInfo,true,null,'LUTCalc applies the ASC-CDL on linear data, so slope behaves like an exposure adjustment. 0.5 = one stop down, 0.25 = two stops. 2 = one stop up, 4 = two stops.');
	this.addInfo(this.custCdlInfo,true,'Offset',"The definition and implementation of 'lift' can change between pieces of software, so the ASC uses the term 'offset' and defines it as a value simply added or subtracted from an input value. In the ASC-CDL this is carried out after the slope");
	this.addInfo(this.custCdlInfo,true,'Power',"Analogous to 'gamma', once an input value has had the slope and offset applied, it is raised to the power of the power parameter. The range is any value from zero up.");
	this.addInfo(this.custCdlInfo,true,'Saturation','All other ASC-CDL controls are applied on a colour channel by colour channel basis. Saturation takes the luma value of the RGB colour and scales the components such that a value of 0 gives a Rec709 grayscale, 1.0 leaves the image unaffected and anything above 1.0 increases the colour saturation.');
	this.addInfo(this.custCdlInfo,false,null,'For simplicity, LUTCalc includes a luma channel alongside the red, green and blue and locking the individual channel adjustments together.');
	this.custCdl.style.display = 'none';
	this.custCdl.appendChild(this.custCdlInfo);
}
LUTInfoBox.prototype.createCustFls = function() {
	this.custFls = document.createElement('div');
	this.custFls.setAttribute('class','instructions');
	this.custFls.setAttribute('id','cust-fls');
	this.custFlsBack = document.createElement('input');
	this.custFlsBack.setAttribute('type','button');
	this.custFlsBack.value = 'Back';
	this.custFls.appendChild(this.custFlsBack);
	this.custFlsInfo = document.createElement('div');
	this.custFlsInfo.setAttribute('class','infotext');
	var fls1 = document.createElement('div');
	fls1.setAttribute('class','infoimage');
	fls1.setAttribute('id','ins-cust-fls-1');
	this.custFlsInfo.appendChild(fls1);
	this.addInfo(this.custFlsInfo,false,null,"'False Colour' changes luminance ranges to fixed colours as an exposure aid for wide dynamic range log recording.");
	this.addInfo(this.custFlsInfo,false,null,'The colours and ranges LUTCalc uses are based on those used by Sony. They are:');
	this.addInfo(this.custFlsInfo,true,'Purple','Black clip (actually 10 stops below 18% gray).');
	this.addInfo(this.custFlsInfo,true,'Blue','Just above black clip. Default is 6.1 stops below 18% gray, but this can be changed to taste.');
	this.addInfo(this.custFlsInfo,true,'Green','18% gray +/- 0.2 stops. Exposure datum.');
	this.addInfo(this.custFlsInfo,true,'Pink','One stop over 18% gray +/- 0.175 stops. Common reference for caucasian skin.');
	this.addInfo(this.custFlsInfo,true,'Orange','90% white +/- 0.175 stops. Off by default as not included by Sony, 90% white is a common datum in broadcast video.');
	this.addInfo(this.custFlsInfo,true,'Yellow','Just below white clip. The default is 0.26 stops below clip, but this can also be changed.');
	this.addInfo(this.custFlsInfo,true,'Red','White clip (5.95 stops above 18% gray).');
	this.addInfo(this.custFlsInfo,false,null,'False colours map to the original real world exposure levels, regardless of the chosen input and output colour spaces.');
	this.addInfo(this.custFlsInfo,false,null,'False colour LUTs should be 33x33x33 or larger.');
	this.custFls.style.display = 'none';
	this.custFls.appendChild(this.custFlsInfo);
}
LUTInfoBox.prototype.createCustLut = function() {
	this.custLut = document.createElement('div');
	this.custLut.setAttribute('class','instructions');
	this.custLut.setAttribute('id','cust-lut');
	this.custLutBack = document.createElement('input');
	this.custLutBack.setAttribute('type','button');
	this.custLutBack.value = 'Back';
	this.custLut.appendChild(this.custLutBack);
	this.custLutInfo = document.createElement('div');
	this.custLutInfo.setAttribute('class','infotext');
	var lut1 = document.createElement('div');
	lut1.setAttribute('class','infoimage');
	lut1.setAttribute('id','ins-cust-lut-1');
	this.custLutInfo.appendChild(lut1);
	this.addInfo(this.custLutInfo,false,null,'LUTAnalyst is a tool for reading LUT files and converting them for use on S-Log3/S-Gamut3.cine material.');
	this.addInfo(this.custLutInfo,false,null,'It currently understands the following formats: .cube, .3dl, .ilut, .olut, .lut (Assimilate format), .spi1D, .spi3D and .vlt.');
	this.addInfo(this.custLutInfo,false,null,'Once a file is loaded LUTCalc can create a generalised 1D LUT of the transfer function or gamut and a generally close approximation of the colour space.');
	this.addInfo(this.custLutInfo,false,null,"There are several potential uses for the 'LALUTs' produced:");
	this.addInfo(this.custLutInfo,true,'Information',"Visualise the response curves and exposure characteristics of customised or 'hand rolled' LUTs generated by grading software.");
	this.addInfo(this.custLutInfo,true,'Exposure Adjustment','Ideally software should read video file metadata to automatically apply exposure adjustment. Frequently this does not currently happen, so combining exposure adjustment and colour correction into one LUT can help whilst preventing data loss to clipped values.');
	this.addInfo(this.custLutInfo,true,'Camera Matching','If different camera models are used together, versions of a LUT tuned to each camera can be produced, hopefully simplifying the process of matching in post.');
	this.addInfo(this.custLutInfo,false,null,"By selecting 'Load Existing Analysed LA LUT' LUTAnalyst can load a precalculated LALUT file and add the gamma and gamut to the list of available options. LALUT files end in either .lalut or .labin.");
	this.addInfo(this.custLutInfo,false,null,"Selecting a functional cube LUT file under the 'Import New LUT' option starts a two-stage process.");
	var lut2 = document.createElement('div');
	lut2.setAttribute('class','infoimage');
	lut2.setAttribute('id','ins-cust-lut-2');
	this.custLutInfo.appendChild(lut2);
	this.addInfo(this.custLutInfo,false,null,"If the LUT contains a title line, then this should appear under 'LUT Title'. If not, the filename is used which can then be changed.");
	this.addInfo(this.custLutInfo,false,null,'The input gamma and gamut that the LUT is designed for should then be specified.');
	this.addInfo(this.custLutInfo,false,null,'LUTAnalyst breaks up a LUT into a 1D transfer function and a 3D colour space. The dimension of the colour space LALUT can be 33x33x33 or 65x65x65. Whilst much larger, in this instance 65x65x65 is generally the best choice.');
	this.addInfo(this.custLutInfo,false,null,'The final options are the input and output ranges of the LUT to be analysed. LUTCalc defaults to data in -> legal out as this is a common setup, but diferences between range settings can be surprisingly subtle, so testing may well be required.');
	this.addInfo(this.custLutInfo,false,null,"Pressing 'New LUT' at any time restarts the whole process, but clicking 'Analyse' should start a process which takes a few seconds. When complete, the analysed LUT should appear as an option at the end of the gamma and gamut lists, and one or two new buttons should appear in the LUTAnalyst box.");
	var lut3 = document.createElement('div');
	lut3.setAttribute('class','infoimage');
	lut3.setAttribute('id','ins-cust-lut-3');
	this.custLutInfo.appendChild(lut3);
	this.addInfo(this.custLutInfo,false,null,"'Save Cube' stores the 1D and 3D LUTAnalyst LUTs as a single file combining two cube files. 'Save Binary' stores them in a smaller, simpler binary format. LUTCalc For Mac cannot currently save the binary versions, though it can read them.");
	this.addInfo(this.custLutInfo,false,null,"'Re-Analyse' reperforms the analysis, for example if the LUT Range was incorrectly set.");
	this.custLut.style.display = 'none';
	this.custLut.appendChild(this.custLutInfo);
}
LUTInfoBox.prototype.addInfo = function(infoBox,indent,title,text) {
	var para = document.createElement('p');
	if (indent) {
		para.setAttribute('class','indentpara');
	}
	if (typeof title === 'string') {
		var titleText = document.createElement('strong');
		titleText.appendChild(document.createTextNode(title));
		para.appendChild(titleText);
		para.appendChild(document.createTextNode(' - '));
	}
	para.appendChild(document.createTextNode(text));
	infoBox.appendChild(para);
}
LUTInfoBox.prototype.gammaInfo = function() {
	this.tableRefVals = new Float64Array([0,0.18,0.38,0.44,0.9,7.2,13.5]);
	this.tableIREVals = new Float64Array(7);
	this.gammaInfoBox.setAttribute('class','graybox infobox');
	this.addText(this.gammaInfoBox,'Output gamma including any customisations:');
	var curires = document.createElement('table');
	var curiresHead = document.createElement('thead');
	curiresHead.appendChild(this.addRow(['Reflected %','0','18','38','44','90','720','1350'], 'th'));
	curires.appendChild(curiresHead);
	var curiresBody = document.createElement('tbody');
	var curvarsRow = this.addRow(['10-bit Values','-','-','-','-','-','-','-'],'td');
	this.lutOutVals = curvarsRow.getElementsByTagName('td');
	var curiresRow = this.addRow(['LUTted %IRE','-','-','-','-','-','-','-'],'td');
	this.lutOutIREs = curiresRow.getElementsByTagName('td');
	curiresBody.appendChild(curiresRow);
	curiresBody.appendChild(curvarsRow);
	curires.appendChild(curiresBody);
	this.gammaInfoBox.appendChild(curires);
	this.gammaInfoBox.appendChild(document.createElement('br'));
	var logvars = document.createElement('table');
	var logvarsHead = document.createElement('thead');
	logvarsHead.appendChild(this.addRow(['Gamma','0% Black','18% Grey (20% IRE)','90% White (100% IRE)'], 'th'));
	logvars.appendChild(logvarsHead);
	var logvarsBody = document.createElement('tbody');
	logvarsBody.appendChild(this.addRow(['S-Log3','95','420','598'],'td'));
	logvarsBody.appendChild(this.addRow(['S-Log2','90','347','582'],'td'));
	logvarsBody.appendChild(this.addRow(['S-Log','90','394','636'],'td'));
	logvarsBody.appendChild(this.addRow(['LogC (3&4)','95','400','572'],'td'));
	logvarsBody.appendChild(this.addRow(['LogC (2)','134','400','569'],'td'));
	logvarsBody.appendChild(this.addRow(['C-Log','128','351','614'],'td'));
	logvarsBody.appendChild(this.addRow(['Cineon','95','470','685'],'td'));
	logvars.appendChild(logvarsBody);
	this.addText(this.gammaInfoBox,'10-bit values for the recorded log curves:');
	this.gammaInfoBox.appendChild(logvars);
		var gamires = document.createElement('table');
	var gamiresHead = document.createElement('thead');
	gamiresHead.appendChild(this.addRow(['Reflected %','0','18','38','44','90','720','1350'], 'th'));
	gamires.appendChild(gamiresHead);
	var gamiresBody = document.createElement('tbody');
	gamiresBody.appendChild(this.addRow(['Linear %IRE','0','20','42','49','100','800','1500'],'td'));
	gamiresBody.appendChild(this.addRow(['Rec709 (standard) %IRE','0','43','65','70','100','-','-'],'td'));
	gamiresBody.appendChild(this.addRow(['Rec709(800%) %IRE','3','44','65','70','89','109','-'],'td'));
	gamiresBody.appendChild(this.addRow(['LC709 %IRE','2','40','55','58','72','97','99'],'td'));
	gamiresBody.appendChild(this.addRow(['LC709A %IRE','4','40','55','58','71','97','98'],'td'));
	gamiresBody.appendChild(this.addRow(['HG8009G40 (HG7) %IRE','3','40','58','62','82','109','-'],'td'));
	gamiresBody.appendChild(this.addRow(['HG8009G33 (HG8) %IRE','3','33','49','52','73','109','-'],'td'));
	gamiresBody.appendChild(this.addRow(['S-Log3 %IRE','3.5','41','50','52','61','88','96'],'td'));
	gamiresBody.appendChild(this.addRow(['S-Log2 %IRE','3','32','44','47','59','97','109'],'td'));
	gamiresBody.appendChild(this.addRow(['S-Log %IRE','3','38','50','53','65','104','-'],'td'));
	gamiresBody.appendChild(this.addRow(['LogC (3.x & 4.x) %IRE','4','38','47','49','58','84','92'],'td'));
	gamiresBody.appendChild(this.addRow(['LogC (2.x) %IRE','8','38','47','49','58','83','91'],'td'));
	gamiresBody.appendChild(this.addRow(['Canon C-Log %IRE','7','33','46','48','63','109','-'],'td'));
	gamiresBody.appendChild(this.addRow(['Cineon %IRE','4','46','57','59','69','100','109'],'td'));
	gamires.appendChild(gamiresBody);
	this.gammaInfoBox.appendChild(document.createElement('br'));
	this.addText(this.gammaInfoBox,'%IRE mappings from reflected values:');
	this.gammaInfoBox.appendChild(gamires);
}
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

	this.gammaChartBox.setAttribute('class','graybox infobox');
	this.chartType = [];
	this.chartType[0] = this.createRadioElement('charttype', false);
	this.gammaChartBox.appendChild(this.chartType[0]);
	this.gammaChartBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Reflected/IRE')));
	this.chartType[1] = this.createRadioElement('charttype', true);
	this.gammaChartBox.appendChild(this.chartType[1]);
	this.gammaChartBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stop/IRE')));
	this.chartType[2] = this.createRadioElement('charttype', false);
	this.gammaChartBox.appendChild(this.chartType[2]);
	this.gammaChartBox.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT In/LUT Out')));
	this.gammaChartBox.appendChild(document.createElement('br'));
	this.buildChart();
	this.gammaChartBox.appendChild(document.createTextNode('Output gamma including any customisations:'));
	var curires = document.createElement('table');
	var curiresHead = document.createElement('thead');
	curiresHead.appendChild(this.addRow(['Reflected %','0','18','38','44','90','720','1350'], 'th'));
	curires.appendChild(curiresHead);
	var curiresBody = document.createElement('tbody');
	var curvarsRow = this.addRow(['10-bit Values','-','-','-','-','-','-','-'],'td');
	this.lutOutValsChart = curvarsRow.getElementsByTagName('td');
	var curiresRow = this.addRow(['LUTted %IRE','-','-','-','-','-','-','-'],'td');
	this.lutOutIREsChart = curiresRow.getElementsByTagName('td');
	curiresBody.appendChild(curiresRow);
	curiresBody.appendChild(curvarsRow);
	curires.appendChild(curiresBody);
	this.gammaChartBox.appendChild(curires);
}
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
	// Reflected Against IRE
	var canvas1 = document.createElement('canvas');
	canvas1.id = 'chartcanvas1';
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
	recCanvas1.id = 'reccanvas1';
	recCanvas1.width = canvas1.width;
	recCanvas1.height = canvas1.height;
	var outCanvas1 = document.createElement('canvas');
	outCanvas1.id = 'outcanvas1';
	outCanvas1.width = canvas1.width;
	outCanvas1.height = canvas1.height;
	var clipCanvas1 = document.createElement('canvas');
	clipCanvas1.id = 'clipcanvas1';
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
	this.gammaChartBox.appendChild(canvas1);
	this.gammaChartBox.appendChild(clipCanvas1);
	this.gammaChartBox.appendChild(recCanvas1);
	this.gammaChartBox.appendChild(outCanvas1);
	canvas1.style.display = 'none';
	recCanvas1.style.display = 'none';
	outCanvas1.style.display = 'none';
	clipCanvas1.style.display = 'none';
	// Stop Against IRE
	var canvas2 = document.createElement('canvas');
	canvas2.id = 'chartcanvas2';
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
	recCanvas2.id = 'reccanvas2';
	recCanvas2.width = canvas2.width;
	recCanvas2.height = canvas2.height;
	var outCanvas2 = document.createElement('canvas');
	outCanvas2.id = 'outcanvas2';
	outCanvas2.width = canvas2.width;
	outCanvas2.height = canvas2.height;
	var clipCanvas2 = document.createElement('canvas');
	clipCanvas2.id = 'clipcanvas2';
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
	this.gammaChartBox.appendChild(canvas2);
	this.gammaChartBox.appendChild(clipCanvas2);
	this.gammaChartBox.appendChild(recCanvas2);
	this.gammaChartBox.appendChild(outCanvas2);
	canvas2.style.display = 'block';
	recCanvas2.style.display = 'block';
	outCanvas2.style.display = 'block';
	clipCanvas2.style.display = 'block';
	// LUT In Against LUT Out
	var canvas3 = document.createElement('canvas');
	canvas3.id = 'chartcanvas3';
	var ctx3 = canvas3.getContext('2d');
	canvas3.width = cwidth;
	canvas3.height = cheight;
	dX = (w - x0)*876/1023;
	var xMin = x0 + (64*876/1023);
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
	outCanvas3.id = 'outcanvas3';
	outCanvas3.width = canvas3.width;
	outCanvas3.height = canvas3.height;
	var rgbCanvas3 = document.createElement('canvas');
	rgbCanvas3.id = 'rgbcanvas3';
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
	this.gammaChartBox.appendChild(canvas3);
	this.gammaChartBox.appendChild(outCanvas3);
	this.gammaChartBox.appendChild(rgbCanvas3);
	canvas3.style.display = 'none';
	outCanvas3.style.display = 'none';
	rgbCanvas3.style.display = 'none';
	// Draw The Lines
//	this.updateGamma();
}
LUTInfoBox.prototype.addText = function(infoBox,text,bold) {
	var para = document.createElement('p');
	if (bold) {
		para.setAttribute('class','bold');
	}
	para.appendChild(document.createTextNode(text));
	infoBox.appendChild(para);
}
LUTInfoBox.prototype.addRow = function(data,section) {
	var max = data.length;
	var row = document.createElement('tr');
	for (var i=0; i < max; i++) {
		var col = document.createElement(section);
		col.appendChild(document.createTextNode(data[i]));
		row.appendChild(col);
	}
	return row;
}
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
}
// Event Listeners
LUTInfoBox.prototype.setupEvents = function() {
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
	this.insMainInf.onclick = function(here){ return function(){ here.showInfInfo(); };}(this);
	this.insInfBack.onclick = function(here){ return function(){ here.showMainscreen(); };}(this);
	this.insCustGam.onclick = function(here){ return function(){ here.showCustGamInfo(); };}(this);
	this.custGamBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustBhi.onclick = function(here){ return function(){ here.showCustBhiInfo(); };}(this);
	this.custBhiBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustCts.onclick = function(here){ return function(){ here.showCustCtsInfo(); };}(this);
	this.custCtsBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustFlc.onclick = function(here){ return function(){ here.showCustFlcInfo(); };}(this);
	this.custFlcBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustPsst.onclick = function(here){ return function(){ here.showCustPsstInfo(); };}(this);
	this.custPsstBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustCdl.onclick = function(here){ return function(){ here.showCustCdlInfo(); };}(this);
	this.custCdlBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustFls.onclick = function(here){ return function(){ here.showCustFlsInfo(); };}(this);
	this.custFlsBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
	this.insCustLut.onclick = function(here){ return function(){ here.showCustLutInfo(); };}(this);
	this.custLutBack.onclick = function(here){ return function(){ here.showCustscreen(); };}(this);
}
// Event Responses
LUTInfoBox.prototype.instructionsOpt = function() {
	this.showMainscreen();
	this.instructionsBox.style.display = 'block';
	this.gammaInfoBox.style.display = 'none';
	this.gammaChartBox.style.display = 'none';
}
LUTInfoBox.prototype.gammaInfoOpt = function() {
	this.instructionsBox.style.display = 'none';
	this.gammaInfoBox.style.display = 'block';
	this.gammaChartBox.style.display = 'none';
}
LUTInfoBox.prototype.gammaChartOpt = function() {
	this.instructionsBox.style.display = 'none';
	this.gammaInfoBox.style.display = 'none';
	this.gammaChartBox.style.display = 'block';
}
LUTInfoBox.prototype.updateTables = function() {
	for (var j=0; j<7; j++) {
		if (this.tableIREVals[j] < -0.07305936073059) {
			this.tableIREVals[j] = -0.07305936073059;
		}
		this.lutOutIREs[j+1].innerHTML = Math.round(this.tableIREVals[j]*100).toString();
		this.lutOutVals[j+1].innerHTML = Math.round((this.tableIREVals[j]*876)+64).toString();
		this.lutOutIREsChart[j+1].innerHTML = Math.round(this.tableIREVals[j]*100).toString();
		this.lutOutValsChart[j+1].innerHTML = Math.round((this.tableIREVals[j]*876)+64).toString();
		if (parseInt(this.lutOutVals[j+1].innerHTML) > 1023) {
			this.lutOutVals[j+1].innerHTML = '-';
			this.lutOutIREs[j+1].innerHTML = '-';
			this.lutOutValsChart[j+1].innerHTML = '-';
			this.lutOutIREsChart[j+1].innerHTML = '-';
		}
	}
}
LUTInfoBox.prototype.changeChart = function() {
	if (this.chartType[0].checked) {
		document.getElementById('chartcanvas1').style.display = 'block';
		document.getElementById('reccanvas1').style.display = 'block';
		document.getElementById('outcanvas1').style.display = 'block';
		document.getElementById('clipcanvas1').style.display = 'block';
		document.getElementById('chartcanvas2').style.display = 'none';
		document.getElementById('reccanvas2').style.display = 'none';
		document.getElementById('outcanvas2').style.display = 'none';
		document.getElementById('clipcanvas2').style.display = 'none';
		document.getElementById('chartcanvas3').style.display = 'none';
		document.getElementById('outcanvas3').style.display = 'none';
		document.getElementById('rgbcanvas3').style.display = 'none';
	} else if (this.chartType[1].checked) {
		document.getElementById('chartcanvas1').style.display = 'none';
		document.getElementById('reccanvas1').style.display = 'none';
		document.getElementById('outcanvas1').style.display = 'none';
		document.getElementById('clipcanvas1').style.display = 'none';
		document.getElementById('chartcanvas2').style.display = 'block';
		document.getElementById('reccanvas2').style.display = 'block';
		document.getElementById('outcanvas2').style.display = 'block';
		document.getElementById('clipcanvas2').style.display = 'block';
		document.getElementById('chartcanvas3').style.display = 'none';
		document.getElementById('outcanvas3').style.display = 'none';
		document.getElementById('rgbcanvas3').style.display = 'none';
	} else{
		document.getElementById('chartcanvas1').style.display = 'none';
		document.getElementById('reccanvas1').style.display = 'none';
		document.getElementById('outcanvas1').style.display = 'none';
		document.getElementById('clipcanvas1').style.display = 'none';
		document.getElementById('chartcanvas2').style.display = 'none';
		document.getElementById('reccanvas2').style.display = 'none';
		document.getElementById('outcanvas2').style.display = 'none';
		document.getElementById('clipcanvas2').style.display = 'none';
		document.getElementById('chartcanvas3').style.display = 'block';
		document.getElementById('outcanvas3').style.display = 'block';
		document.getElementById('rgbcanvas3').style.display = 'block';
	}
}
LUTInfoBox.prototype.gotIOGammaNames = function(d) {
	this.gammaInName = d.inName;
	if (typeof d.inG !== 'undefined') {
		this.gammaInName += ' - ' + d.inG;
	}
	this.gammaOutName = d.outName;
	if (typeof d.outG !== 'undefined') {
		this.gammaOutName += ' - ' + d.outG;
	}
	if (d.outName === 'LA' ) {
		this.gammaOutName += ' - ' + this.inputs.laTitle.value;
	}
	this.updateRefChart();
	this.updateStopChart();
	this.updateLutChart();
}
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
}
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
}
LUTInfoBox.prototype.updateLutChart = function() { // Gamma In Against Gamma Out
	var xMin = this.lutChart.x0 + (64*876/1023);
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
		this.lutChart.out.lineTo( this.lutChart.x0 + ((this.lutIn[i]*this.lutChart.dX)*1023/876),this.lutChart.y0 - (this.lutOut[i] * this.lutChart.dY));
	}
	this.lutChart.out.stroke();
	this.lutChart.out.clearRect(0, 0, this.lutChart.width, this.lutChart.yMax);
	var yMin = this.lutChart.h / 15;
	this.lutChart.out.clearRect(0, this.lutChart.h - yMin, this.lutChart.width, this.lutChart.h);
}
LUTInfoBox.prototype.updateRGBChart = function(d) {
	var rIn = new Float64Array(d.rIn);
	var gIn = new Float64Array(d.gIn);
	var bIn = new Float64Array(d.bIn);
	var rOut = new Float64Array(d.rOut);
	var gOut = new Float64Array(d.gOut);
	var bOut = new Float64Array(d.bOut);
	var m = rIn.length;
// console.log(r);
// console.log(g);
// console.log(b);
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
}
LUTInfoBox.prototype.updateGamma = function() {
	this.message.gaTx(this.p,10,null);
	this.message.gaTx(this.p,11,null);
}
LUTInfoBox.prototype.gotChartVals = function(d) {
	this.refX = new Float64Array(d.refX);
	this.refIn = new Float64Array(d.refIn);
	this.refOut = new Float64Array(d.refOut);
	this.stopX = new Float64Array(d.stopX);
	this.stopIn = new Float64Array(d.stopIn);
	this.stopOut = new Float64Array(d.stopOut);
	this.lutIn = new Float64Array(d.lutIn);
	this.lutOut = new Float64Array(d.lutOut);
	this.tableIREVals = new Float64Array(d.table);
	this.updateRefChart();
	this.updateStopChart();
	this.updateLutChart();
	this.updateTables();
}
