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
}
// Construct the UI Box
LUTInfoBox.prototype.buildBox = function() {
	this.instructionsBut.setAttribute('type','button');
	this.instructionsBut.value = 'Instructions';
	this.instructionsBox = document.createElement('div');
	this.instructions();
	this.instructionsBox.style.display = 'none';
	this.gammaInfoBut.setAttribute('type','button');
	this.gammaInfoBut.value = 'Gamma Info';
	this.gammaInfoBox = document.createElement('div');
	this.gammaInfo();
	this.gammaInfoBox.style.display = 'none';
	this.gammaChartBut.setAttribute('type','button');
	this.gammaChartBut.value = 'Gamma Chart';
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
	this.addText(this.instructionsBox,'LUTCalc ' + this.inputs.version + ' by Ben Turley (cameramanben)',true);
	this.addText(this.instructionsBox,'*** New option - LUTAnalyst ***',true);
	this.addText(this.instructionsBox,"A note about the main new feature called 'LUTAnalyst'.");
	this.addText(this.instructionsBox,'This is available as an option in the customisation box. With it you can import a LUT (currently in cube format) and LUTAnalyst will be able to analyse the transfer function (1D) and colour space conversion (3D) so that they can then be used in the same way as the built in options.');
	this.addText(this.instructionsBox,'Additionally, if you have developed a custom look and LUT then LUTAnalyst would allow you to visualise the gamma curve, produce accurate exposure compensated versions for your choice of input gamma / gamut and get IRE values for various reflectances such that the underlying log recording will be correctly exposed.');
	this.addText(this.instructionsBox,'Cubic (1D) and tricubic (3D) interpolation provides accurate conversions.');
	this.addText(this.instructionsBox,'Analysis is a two-stage process. Initially there are two options - import new LUT and Load Existing Analysed LA LUT.');
	this.addText(this.instructionsBox,'Select the import new LUT option, click on the file browser and select a cube LUT to be analysed.');
	this.addText(this.instructionsBox,'If the LUTCalc is able to read the file the LUTAnalyst box should now change to show the Analysis options.');
	this.addText(this.instructionsBox,"First is 'LUT Title'. If the cube file contains a title, this will show here. If not, it will show 'LUT Analyser'. You can change this to whatever you wish to see in the gamma and gamut options.");
	this.addText(this.instructionsBox,'Next come the input gamma and - if the LUT is 3D - input gamut options. Select the ones appropriate to the loaded LUT. For example, Sony provides a set of Look Profiles designed for S-Log3/S-Gamut3.cine and another for S-Log2/S-Gamut.');
	this.addText(this.instructionsBox,"The last, important option is to set the input and output scaling of the LUT to be analysed. LUTs which work on log INPUT gammas tend to be data in (D). This is the case with all of Sony's look profiles. For LUTs which OUTPUT LOG curves the output scaling will also tend to be data (D). For other types of output curve the scaling is generally legal levels.");
	this.addText(this.instructionsBox,"With the F5/F55 and Sony's looks as examples, 3D monitor LUTs, LC709, LC709A and Cine+709 are all data to legal (D→L), whereas the S-Log3 to S-Log2 look profile is data to data (D→D). Custom and home-made LUTs may also be legal to legal (L→L) and legal to data (L→D) is included for completeness, though somewhat unusual!");
	this.addText(this.instructionsBox,"Once the gamma, gamut and scaling have been established, click the 'Analyse' button. After a few seconds, the row of button should change to show 'Re-Analyse', 'Save LA LUT' and 'Change LUT' and your newly analysed LUT should now be available as output gamma and output gamut options in the main part of LUTCalc. They show up as 'LA - ' followed by the LUT title.");
	this.addText(this.instructionsBox,"'Re-Analyse' is useful for changing the gamma, gamut and scaling options if they have been incorrectly chosen.");
	this.addText(this.instructionsBox,"'Save LA LUT' will save a file ending .lacube which contains two conventional cube LUTs. The first is a 1D transfer function (gamma) LUT from S-Log3 to the analysed gamma, data levels to data levels. The second is a 3D pure colour space conversion LUT, S-Log3/S-Gamut3.cine to S-Log3/analysed gamut, data levels to data levels. This can be loaded back into LUTCalc with the 'Load Existing Analysed LA LUT', avoiding the analysis stage.");
	this.addText(this.instructionsBox,"'Change LUT' returns LUTAnalyst to its initial condition.");
	this.addText(this.instructionsBox,'Instructions',true);
	this.addText(this.instructionsBox,"Having opened either the Mac App or the index.html file you should see a set of four options boxes on this page, plus the 'Generate LUT' button and this information window.");
	this.addText(this.instructionsBox,'First is the camera options box. Here you select a camera model. This sets the native ISO and CineEI recording approach (Sony, Arri, Canon) so that the correct exposure shift is calculated if a different CineEI is set.');
	this.addText(this.instructionsBox,'Next is the gamma box. This allows you to set the log gamma you intend to shoot with (Recorded Gamma) and the output gamma you would like the LUT to translate to. It also contains options for recorded and output gamuts which appear when the 3D LUTs option is selected.');
	this.addText(this.instructionsBox,"The third box contains a checkbox marked 'Customisation' which we will come back to later.");
	this.addText(this.instructionsBox,"After that and moving to the right hand side is the LUT box. The 'LUT Title / Filename' is both the filename that will be used when saving the LUT and a note expected at the start of a .cube format LUT file. The latter is not generally used by grading software, but can be a handy guide to what the LUT does in case the filename gets changed.");
	this.addText(this.instructionsBox,'The next options are for the type of LUT to be produced - either 1D or 3D - and the dimension of the LUT. 1D LUTs alter the gamma only, but are small yet precise, as every input value has a defined output value. The default dimension is 1024, which is ideal for 10-bit recording such as XAVC or SR, though 4096 is included as it is also a standard dimension.');
	this.addText(this.instructionsBox,'3D LUTs are able to controllably adjust both gamma and colour; they have output values that depend on the combination of red, green and blue inputs. If every possible combination had a precisely defined value the LUT would be enormous, so 3D LUTs use a smaller set of control points and interpolate the values in between. The options are 17x17x17, 33x33x33 - either of which the camera can use as MLUTs - and 65x65x65. 33x33x33 is generally plenty for the kinds of transformations produced here. 65x65x65 is more precise, but takes considerably longer to produce and results in an enormous LUT file.');
	this.addText(this.instructionsBox,"Sony's own LC709 and LC709A Look Profiles are both 33x33x33 LUTs.");
	this.addText(this.instructionsBox,"Switching to 3D LUTs enables the gamut options. They should be fairly clear, but one of note is 'Passthrough'. This sends the colour information through the LUT unchanged, effectively making a 3D LUT behave like a 1D gamma only LUT. Other than testing it is not much use in post software when 1D LUTs are available, but is the way to make gamma only MLUTs that the camera will accept.");
	this.addText(this.instructionsBox,'The input and output ranges can now be controlled for the LUT. Legal range means the IRE values of 0%-100%, or 10-bit values 64-940 and data range means -7%-109% or 0-1023. Recordings in S-Log3 cannot exceed the legal range, but other log curves can go above 940 which would be clipped with legal range set, so for the input it is best to leave it as data range.  You may have to specify that a clip is data range in your grading software.');
	this.addText(this.instructionsBox,'For the output, the range setting only affects the scaling; output values are in floating point and can easily exceed legal or data range without clipping. Data range here is useful if you are producing an exposure shift only LUT, or going from one log curve to another. Legal range here tends to lead to a simpler workflow and works with the default setup in Resolve.');
	this.addText(this.instructionsBox,"Sony's Look Profiles and LUTs map from data levels to legal levels, which is the default setup in LUTCalc for non-log gammas.");
	this.addText(this.instructionsBox,'The last option in this box is the Camera MLUT checkbox. Sony specifies that for use in the camera, 3D MLUTs must be 17x17x17 or 33x33x33, legal range scaling on the output and clipped 0-1.0. This setting ensures that the LUT is correct for use in the camera, though the clipping is less than ideal for grading. It is easy enough to bake two versions of a LUT.');
	this.addText(this.instructionsBox,"The 0-1 clipping on the output would mean that 3D MLUTs couldn't reach into the extended range between 100% and 109% (such as HG7 and HG8 or Rec709(800%)), so after checking in the camera I actually have the clipping set as 0-1.09. This doesn't seem to cause any issues and makes the MLUT rather more useful.");
	this.addText(this.instructionsBox,"Now it only remains to press the Generate LUT button. The Mac App version of this program currently saves cube files directly to a folder on the the desktop. For the web app version depending on your browser either a file will be saved to the Downloads directory or a tab should open up in your browser displaying the contents of the LUT. If the latter, save this page - make sure that the format is NOT 'web archive' in the Save As box of the browser - and give it a meaningful name and the extension .cube .");
	this.addText(this.instructionsBox,"Using Resolve as an example and assuming that you have saved it to Resolve's LUT folder, the LUT should now show up under the 3D LUT options. For some reason with .cube files in Resolve both 1D and 3D LUTs appear under 3D LUTs.");
	this.addText(this.instructionsBox,"This is the basic operation, but there is considerably more flexibility available by clicking the 'Customisation' checkbox.");
	this.addText(this.instructionsBox,"Initially nothing will happen, but if you set the output gamma to non-log option (except 'Linear' or 'Null') two new boxes should appear. 'Black level' allows you to set the lowest output value (in IRE) that the output gamma will allow, and by default will then scale the rest of the curve so that the output value for 100% IRE input remains unchanged. This can be useful as many curves set black around 3% IRE and I like to have the option of pushing that down for thicker, crunchier blacks.");
	this.addText(this.instructionsBox,"The 'Highlight Level' allows you to set a reflected value (such as 18% gray or 90% white) and see what level that gets displayed at in your chosen gamma. you can then set a level that you would like it to display at and LUTCalc will scale the curve, keeping the black level unchanged.");
	this.addText(this.instructionsBox,'The idea of this is that it allows people who favour setting their exposures by IRE levels that can vary significantly from gamma to gamma (eg 90% IRE) to expose to the LUT but have correctly exposed underlying log material.');
	this.addText(this.instructionsBox,'Setting the LUT type to 3D will bring up a third box. Highlight gamut allows you to chose a second colour transform for the highlights, plus the start and end of the transition and how abruptly it happens. It is rather suck it and see, but allows for some fairly interesting and complex effects such as differing saturation in the highlights and shadows.');
}
LUTInfoBox.prototype.gammaInfo = function() {
	this.tableRefVals = [0,0.18,0.38,0.44,0.9,7.2,13.5];
	this.tableIREVals = [];
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
	this.gammaInName = '';
	this.gammaOutName = '';
	this.chartRefXs = [];
	this.chartRefIns = [];
	this.chartRefOuts = [];
	for (var i=0; i<65; i++) {
		this.chartRefXs[i] = 14*parseFloat(i)/64;
	}
	this.chartStopXs = [];
	this.chartStopIns = [];
	this.chartStopOuts = [];
	for (var i=0; i<65; i++) {
		this.chartStopXs[i] = (parseFloat(i)/4)-8;
	}
	this.chartLutXs = [];
	this.chartLutOuts = [];
	for (var i=0; i<65; i++) {
		this.chartLutXs[i] = parseFloat(i)/64;
	}
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
	this.refChart = {};
	this.refChart.rec = recCanvas1.getContext('2d');
	this.refChart.out = outCanvas1.getContext('2d');
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
	this.gammaChartBox.appendChild(recCanvas1);
	this.gammaChartBox.appendChild(outCanvas1);
	canvas1.style.display = 'none';
	recCanvas1.style.display = 'none';
	outCanvas1.style.display = 'none';
	// Stop Against IRE
	var canvas2 = document.createElement('canvas');
	canvas2.id = 'chartcanvas2';
	var ctx2 = canvas2.getContext('2d');
	canvas2.width = cwidth;
	canvas2.height = cheight;
	dX = (w - x0)/16;
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
	ctx2.moveTo(x0 + (dX*8),yMax);
	ctx2.lineTo(x0 + (dX*8),h - yMin);
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
	for (var i=0; i<17; i++){
		ctx2.fillText(parseInt(i-8).toString(), x0 + (i*dX) + (w/150),y0 + (1.75*yB));
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
	this.stopChart = {};
	this.stopChart.rec = recCanvas2.getContext('2d');
	this.stopChart.out = outCanvas2.getContext('2d');
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
	this.gammaChartBox.appendChild(recCanvas2);
	this.gammaChartBox.appendChild(outCanvas2);
	canvas2.style.display = 'block';
	recCanvas2.style.display = 'block';
	outCanvas2.style.display = 'block';
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
	this.lutChart = {};
	this.lutChart.out = outCanvas3.getContext('2d');
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
	canvas3.style.display = 'none';
	outCanvas3.style.display = 'none';
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
// Event Responses
LUTInfoBox.prototype.instructionsOpt = function() {
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
		document.getElementById('chartcanvas2').style.display = 'none';
		document.getElementById('reccanvas2').style.display = 'none';
		document.getElementById('outcanvas2').style.display = 'none';
		document.getElementById('chartcanvas3').style.display = 'none';
		document.getElementById('outcanvas3').style.display = 'none';
	} else if (this.chartType[1].checked) {
		document.getElementById('chartcanvas1').style.display = 'none';
		document.getElementById('reccanvas1').style.display = 'none';
		document.getElementById('outcanvas1').style.display = 'none';
		document.getElementById('chartcanvas2').style.display = 'block';
		document.getElementById('reccanvas2').style.display = 'block';
		document.getElementById('outcanvas2').style.display = 'block';
		document.getElementById('chartcanvas3').style.display = 'none';
		document.getElementById('outcanvas3').style.display = 'none';
	} else{
		document.getElementById('chartcanvas1').style.display = 'none';
		document.getElementById('reccanvas1').style.display = 'none';
		document.getElementById('outcanvas1').style.display = 'none';
		document.getElementById('chartcanvas2').style.display = 'none';
		document.getElementById('reccanvas2').style.display = 'none';
		document.getElementById('outcanvas2').style.display = 'none';
		document.getElementById('chartcanvas3').style.display = 'block';
		document.getElementById('outcanvas3').style.display = 'block';
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
	this.refChart.rec.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.refChart.rec.textBaseline = 'middle';
	this.refChart.rec.textAlign = 'left';
	this.refChart.rec.beginPath();
	this.refChart.rec.strokeStyle='rgba(240, 0, 0, 0.75)';	
	this.refChart.rec.fillStyle = 'rgba(240, 0, 0, 0.75)';
	this.refChart.rec.fillText('In: ' + this.gammaInName, 200,365);
	this.refChart.rec.lineWidth = 4;
	this.refChart.rec.moveTo(this.refChart.x0,this.refChart.y0 - (this.chartRefIns[0] * this.stopChart.dY));
	var max = this.chartRefXs.length;
	for (var i=1; i<max; i++) {
		this.refChart.rec.lineTo(this.refChart.x0 + (this.chartRefXs[i] * this.refChart.dX),this.refChart.y0 - (this.chartRefIns[i] * this.refChart.dY));
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
	this.refChart.out.moveTo(this.refChart.x0,this.refChart.y0 - (this.chartRefOuts[0] * this.stopChart.dY));
	for (var i=1; i<max; i++) {
		this.refChart.out.lineTo(this.refChart.x0 + (this.chartRefXs[i] * this.refChart.dX),this.refChart.y0 - (this.chartRefOuts[i] * this.refChart.dY));
	}
	this.refChart.out.stroke();
	this.refChart.rec.clearRect(0, 0, this.refChart.width, this.refChart.yMax);
	this.refChart.out.clearRect(0, 0, this.refChart.width, this.refChart.yMax);
}
LUTInfoBox.prototype.updateStopChart = function() { // Stop Against IRE
	this.stopChart.rec.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.stopChart.out.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.stopChart.rec.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.stopChart.rec.textBaseline = 'middle';
	this.stopChart.rec.textAlign = 'left';
	this.stopChart.rec.beginPath();
	this.stopChart.rec.strokeStyle='rgba(240, 0, 0, 0.75)';	
	this.stopChart.rec.fillStyle = 'rgba(240, 0, 0, 0.75)';
	this.stopChart.rec.fillText('In: ' + this.gammaInName, 140,85);
	this.stopChart.rec.lineWidth = 4;
	this.stopChart.rec.moveTo(this.stopChart.x0,this.stopChart.y0 - (this.chartStopIns[0] * this.stopChart.dY));
	var max = this.chartStopXs.length;
	for (var i=1; i<max; i++) {
		this.stopChart.rec.lineTo(this.stopChart.x0 + ((this.chartStopXs[i] + 8) * this.stopChart.dX),this.stopChart.y0 - (this.chartStopIns[i] * this.stopChart.dY));
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
	this.stopChart.out.moveTo(this.stopChart.x0,this.stopChart.y0 - (this.chartStopOuts[0] * this.stopChart.dY));
	for (var i=1; i<max; i++) {
		this.stopChart.out.lineTo(this.stopChart.x0 + ((this.chartStopXs[i] + 8) * this.stopChart.dX),this.stopChart.y0 - (this.chartStopOuts[i] * this.stopChart.dY));
	}
	this.stopChart.out.stroke();
	this.stopChart.rec.clearRect(0, 0, this.stopChart.width, this.stopChart.yMax);
	this.stopChart.out.clearRect(0, 0, this.stopChart.width, this.stopChart.yMax);
}
LUTInfoBox.prototype.updateLutChart = function() { // Gamma In Against Gamma Out
	var xMin = this.lutChart.x0 + (64*876/1023);
	this.lutChart.out.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.lutChart.out.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.lutChart.out.textBaseline = 'middle';
	this.lutChart.out.textAlign = 'left';
	this.lutChart.out.beginPath();
	this.lutChart.out.strokeStyle='rgba(0, 0, 240, 0.75)';	
	this.lutChart.out.fillStyle = 'rgba(0, 0, 0, 1)';
	this.lutChart.out.fillText(this.gammaInName + ' -> ' + this.gammaOutName, 220,90);
	this.lutChart.out.lineWidth = 4;
	this.lutChart.out.moveTo(this.lutChart.x0,this.lutChart.y0 - (this.chartLutOuts[0] * this.lutChart.dY));
	var max = this.chartLutXs.length;
	for (var i=1; i<max; i++) {
		this.lutChart.out.lineTo( this.lutChart.x0 + ((this.chartLutXs[i]*this.lutChart.dX)*1023/876),this.stopChart.y0 - (this.chartLutOuts[i] * this.lutChart.dY));
	}
	this.lutChart.out.stroke();
	this.lutChart.out.clearRect(0, 0, this.lutChart.width, this.lutChart.yMax);
	var yMin = this.lutChart.h / 15;
	this.lutChart.out.clearRect(0, this.lutChart.h - yMin, this.lutChart.width, this.lutChart.h);
}
LUTInfoBox.prototype.updateGamma = function() {
	this.message.gaTx(this.p,10,null);
	this.message.gaTx(this.p,11,{
		refX: this.chartRefXs,
		stopX: this.chartStopXs,
		lutX: this.chartLutXs,
		tableX: this.tableRefVals
	});
}
LUTInfoBox.prototype.gotChartVals = function(d) {
	this.chartRefIns = d.chartRefIns;
	this.chartRefOuts = d.chartRefOuts;
	this.chartStopIns = d.chartStopIns;
	this.chartStopOuts = d.chartStopOuts;
	this.chartLutOuts = d.chartLutOuts;
	this.tableIREVals = d.tableIREVals;
	this.updateRefChart();
	this.updateStopChart();
	this.updateLutChart();
	this.updateTables();
}
