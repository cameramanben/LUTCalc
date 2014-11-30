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
function LUTInfoBox(fieldset,inputs,gammas) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.gammas = gammas;
	this.instructionsBut = document.createElement('input');
	this.changelogBut = document.createElement('input');
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
	this.changelogBut.setAttribute('type','button');
	this.changelogBut.value = 'Changelog';
	this.changelogBox = document.createElement('div');
	this.changelog();
	this.changelogBox.style.display = 'none';
	this.gammaInfoBut.setAttribute('type','button');
	this.gammaInfoBut.value = 'Gamma Info';
	this.gammaInfoBox = document.createElement('div');
	this.gammaInfo();
	this.gammaInfoBox.style.display = 'none';
	this.gammaChartBut.setAttribute('type','button');
	this.gammaChartBut.value = 'Gamma Chart';
	this.gammaChartBox = document.createElement('div');
	this.gammaChart();
	this.updateGamma();
	this.gammaChartBox.style.display = 'block';
	this.box.appendChild(this.instructionsBut);
	this.box.appendChild(this.changelogBut);
	this.box.appendChild(this.gammaInfoBut);
	this.box.appendChild(this.gammaChartBut);
	this.box.appendChild(this.instructionsBox);
	this.box.appendChild(this.changelogBox);
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
LUTInfoBox.prototype.changelog = function() {
	this.changelogBox.setAttribute('class','graybox infobox');
	this.addText(this.changelogBox,'Credits / References',true);
	this.addText(this.changelogBox,"A full list of standards and white papers used is given in the README.md file.");
	this.addText(this.changelogBox,'v1.2',true);
	this.addText(this.changelogBox,'Added charts for % Reflectance against LUT % IRE and LUT % IRE in against LUT % IRE out.');
	this.addText(this.changelogBox,'Fixed missing term in Arri LogC input equation.');
	this.addText(this.changelogBox,'v1.1',true);
	this.addText(this.changelogBox,'Canon CP Gamut In replaced by Canon CP IDT (Daylight) and Canon CP IDT (Tungsten). Beta testing. These use matrix coefficients from the ACES IDTs published by Canon for the C300, C500 and C100.Tungsten for 3200 or warmer, Daylight for 4300 and up.');
	this.addText(this.changelogBox,'Canon CP Gamut Out replaced by LUTs derived from the IDTs using Newton-Raphson to invert. Alpha testing.');
	this.addText(this.changelogBox,'CP Gamut In -> CP Gamut Out does not currently produce expected results. Possibly due to the reduced gamut of CP Rec709.');
	this.addText(this.changelogBox,'Removed code duplication in the tricubic calculations, and bade out-of-bounds handling more sensible. This has slowed the tricubic somewhat. I will look to optimise.');
	this.addText(this.changelogBox,'Fixed MLUT bugs which meant that the appropriate clipping was not happening, and that changing to a log output gamma with MLUT checked would lead to the wrong output scaling.');
	this.addText(this.changelogBox,'Provisional fix for an out-of-bounds (NaN) bug in LUTAnalyst with gammas of less dynamic range than S-Log3, ie Canon C-Log.');
	this.addText(this.changelogBox,'v1.0',true);
	this.addText(this.changelogBox,"Introduced 'LUTAnalyst' - a tool to convert 1D and 3D LUTs (currently cubes) to 1D S-Log3 to new transfer gamma LUTs plus 3D S-Gamut3.cine to new colour space gamut LUTs. LUTCalc can then use these to use the new gamma and / or gamut as you can with any of the built in options.");
	this.addText(this.changelogBox,'Totally recoded the handling of LUTs as data sources in LUTCalc.');
	this.addText(this.changelogBox,'Substantially improved LC709 and LC709A colour transforms - added in Cine+Rec709.');
	this.addText(this.changelogBox,'Added initial cubic interpolation for 1D and tricubic interpolation for 3D code.');
	this.addText(this.changelogBox,'v0.9991',true);
	this.addText(this.changelogBox,'Released code on Github under GPLv2.');
	this.addText(this.changelogBox,'UI CSS tweaks and removal of Sentenza Desktop code for the time being as no binary release. Web App only again for now!');
	this.addText(this.changelogBox,'v0.999',true);
	this.addText(this.changelogBox,'Total rewrite of the code base to be modular and object oriented. Simplifies altering and adding features.');
	this.addText(this.changelogBox,'Shifted UI to match between the Mac app and web app versions and hopefully make options as clear as possible.');
	this.addText(this.changelogBox,'Added LUT-based Canon CP Lock Gamut in and out derived from analysing numerous side-by-side test images. Far from perfect and consider experimental, but seems to give a good match going from Sony to Canon and a really good match going from Canon to Sony. Definitely shows the advantage of the 10-bit, 14-stop Sony cameras! The main caveats are that limitations on the free Excel solver make the saturated blue and cyan trickier to optimize and I do not have a C300 to check against, just the (numerous) test images I took to build the gamut.');
	this.addText(this.changelogBox,"Added Arri LogC gamma options along with Arri Wide Gamut. Arri's approach to log does odd things from ISO 1600 and up, feathering the highlight to avoid clipping. I have tried to factor in the shoulder point by comparing Arri LUT Generator LUTs with the stock equation. As such, this option is somewhere between experimental and more useful for comparing charts than producing LUTs :-).");
	this.addText(this.changelogBox,'v0.991',true);
	this.addText(this.changelogBox,'Fixed bug with customising Canon WideDR.');
	this.addText(this.changelogBox,'Cleaned up layout.');
	this.addText(this.changelogBox,'v0.99',true);
	this.addText(this.changelogBox,'First version of Mac App.');
	this.addText(this.changelogBox,'Total overhaul of colour transforms and recalculation of all estimated gammas.');
	this.addText(this.changelogBox,'Colour transforms are now done either by conventional matrices, using colour LUTs or combinations of both.');
	this.addText(this.changelogBox,'Calculated LC709 and LC709A colour LUTs from the Sony looks. This required an improved mapping of the gamma curves.');
	this.addText(this.changelogBox,'Tweaks to the S-Log2 gamma calculation should mean better high ISO CineEI shifts. It has now been finessed using the Sony S-Log2 to Rec709 ilut in Resolve.');
	this.addText(this.changelogBox,'Canon C-Log is now directly from an equation published by Canon.');
	this.addText(this.changelogBox,"Added a table of IRE and 10-bit values for the current output gamma to the 'Gamma Info' tab. This includes any customisations so will give a good guide to appropriate recording levels.");
	this.addText(this.changelogBox,'v0.981',true);
	this.addText(this.changelogBox,'Housekeeping Release.');
	this.addText(this.changelogBox,'Added fileSaver.js and Blob.js by Eli Grey (eligrey.com) to allow saving directly to .cube files rather than the new tab Kludge. Not only a lot easier and neater, by just saving to file the LUT process is MUCH quicker.');
	this.addText(this.changelogBox,"To go with the file saving, the 'LUT Title' option has now become 'LUT Title / Filename', and will now be used as the filename for the .cube.");
	this.addText(this.changelogBox,"When a log gamma is selected for output, the range defaults to 'data'. Other curves (and with MLUT selected) default to 'legal' range. This is more appropriate for further processing of log curves.");
	this.addText(this.changelogBox,"3D Gamuts default to 'Passthrough' (gamma only), pending colour overhaul.");
	this.addText(this.changelogBox,'LUT values are fixed length at 10 decimal places (that ought to do for now ;-) ).');
	this.addText(this.changelogBox,'v0.98',true);
	this.addText(this.changelogBox,"Added 'Rec709 Like' as options for both recorded and output gamma. This really means 'Gamma Corrected Linear', but to avoid confusion over the two meanings of gamma and to keep consistency with the 'Rec709 (No Knee) option of previous versions it's 'Rec709 Like' for now :-).");
	this.addText(this.changelogBox,"Rec709 Like brings up an additional option box for selecting the gamma correction. The choices are currently 'Rec709', 'sRGB' and 'Linear'. The first two use the gammas specified in their respective standards and 'Linear' means a gamma of 1 (this doubles up on the output option of 'Linear', but allows for linear input and again maintains consistency with previous versions).");
	this.addText(this.changelogBox,'v0.97',true);
	this.addText(this.changelogBox,"Added 'Gamma Chart' button that displays the input and output gammas plotted data range value against stop (IE 9+, Safari 5.1+, Chrome, Firefox, Opera).");
	this.addText(this.changelogBox,'Added S-Log as a gamma option (along with PMW-F3 and F35 as camera options).');
	this.addText(this.changelogBox,'v0.96',true);
	this.addText(this.changelogBox,'Added highlight scaling as an option for remapping preferred IRE values without affecting black. Also improved black scaling code to work with it.');
	this.addText(this.changelogBox,'Started code cleanup.');
	this.addText(this.changelogBox,"'Passthrough' is now a functional option for gamuts. It means that the colour gamut is unprocessed, ie a 3D LUT behaves like a 1D gamma only LUT. Use it for making an MLUT version of a 1D LUT.");
	this.addText(this.changelogBox,"Added reflected value mapping IREs for various gammas to the 'Gamma Info' tab.");
	this.addText(this.changelogBox,'v0.95',true);
	this.addText(this.changelogBox,'Differently calculated, more precise LC709 / LC709A curves.');
	this.addText(this.changelogBox,'v0.94',true);
	this.addText(this.changelogBox,'Further range bugfix to LC709 / LC709A.');
	this.addText(this.changelogBox,'Added separate input range and output range options. Sony Look Profiles are data input / legal output.');
	this.addText(this.changelogBox,'v0.93',true);
	this.addText(this.changelogBox,'Fixed errors in LC709 and LC709A from treating the Look Profiles as data (extended) range rather than legal range. Black level was set too low and white too high.');
	this.addText(this.changelogBox,'Added options for creating either legal level (64-940, 0%-100% IRE) LUTs or data level (0-1023, -7%-109% IRE). Previously the LUTs were generated to work with a data levels workflow only.');
	this.addText(this.changelogBox,'Added a check to the MLUT option to ensure the correct (legal) range.');
	this.addText(this.changelogBox,'v0.92',true);
	this.addText(this.changelogBox,"Gets named 'LUTCalc'");
	this.addText(this.changelogBox,'Improved 709 matrix from profiling F55 in Custom Mode, rather than Sony published matrix.');
	this.addText(this.changelogBox,'Added Canon Cinema Gamut from Canon published matrix.');
	this.addText(this.changelogBox,'Added Canon WideDR Gamma out.');
	this.addText(this.changelogBox,'Added info page about the log gammas.');
	this.addText(this.changelogBox,'v0.91',true);
	this.addText(this.changelogBox,'Improved Canon CP Lock matrix.');
	this.addText(this.changelogBox,'v0.9',true);
	this.addText(this.changelogBox,"Added 'Black Level' adjustment to customisation options for non-log output gammas.");
	this.addText(this.changelogBox,'v0.8',true);
	this.addText(this.changelogBox,"Added 'Camera MLUT' option to keep things in range for use in the camera (tested on v4.1).");
	this.addText(this.changelogBox,'v0.7',true);
	this.addText(this.changelogBox,"Added 'Canon CP Lock Gamut' as an input/output Gamut option. Combine with the C-Log Gamma option for quick matching of C300 material with F5/55.");
	this.addText(this.changelogBox,"The gamma is accurate and from the official Canon LUT, but the gamut conversion is estimated from test shots");
	this.addText(this.changelogBox,"Consider it experimental and test!");
	this.addText(this.changelogBox,"I don't have a C300 available for further testing, so feedback would be great.");
	this.addText(this.changelogBox,"Added 'Customisation' box, with 'Highlight Gamut' option.");
	this.addText(this.changelogBox,'Highlight gamut is only available with 3D LUTs, and allows a transition to a second gamut/matrix in the highlights. This should allow more complex colour handling, as with the Type A Sony Look.');
	this.addText(this.changelogBox,"Added 'B&W (Rec709 Luma)' as an output Gamut option.");
	this.addText(this.changelogBox,"Fixed an IRE scaling bug on the 'Linear' output Gamma option.");
	this.addText(this.changelogBox,'Fixed a silly bug with some input Gamut options which meant that S-Log2 and C-Log material were being treated as S-Gamut3.cine regardless of input Gamut choice.');
	this.addText(this.changelogBox,'v0.6',true);
	this.addText(this.changelogBox,'First release as Javascript web app.');
	this.addText(this.changelogBox,'Initial inclusion of colour space matrices to 3D LUTs.');
	this.addText(this.changelogBox,'v0.5',true);
	this.addText(this.changelogBox,'Fixed incorrect LUT_3D_SIZE in 65x65x65 version.');
	this.addText(this.changelogBox,'v0.4',true);
	this.addText(this.changelogBox,'Added Cineon.');
	this.addText(this.changelogBox,'Fixed stupid error on S-Log2 input for 1D LUTs.');
	this.addText(this.changelogBox,'v0.3',true);
	this.addText(this.changelogBox,'Separate 33x33x33 and 65x65x65 versions. Added 1024-point 1D version.');
	this.addText(this.changelogBox,"Cleaned up 'Calc' sheet for clarity and to allow 1D LUTs.");
	this.addText(this.changelogBox,'Corrected curves against stop chart for clarity.');
	this.addText(this.changelogBox,"Added 'Exposure Only' option that just shifts the input curve.");
	this.addText(this.changelogBox,'v0.2',true);
	this.addText(this.changelogBox,'65x65x65 LUTs.');
	this.addText(this.changelogBox,'v0.1',true);
	this.addText(this.changelogBox,'First Release.');
}
LUTInfoBox.prototype.gammaInfo = function() {
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
	this.updateChart();
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
	this.changelogBox.style.display = 'none';
	this.gammaInfoBox.style.display = 'none';
	this.gammaChartBox.style.display = 'none';
}
LUTInfoBox.prototype.changelogOpt = function() {
	this.instructionsBox.style.display = 'none';
	this.changelogBox.style.display = 'block';
	this.gammaInfoBox.style.display = 'none';
	this.gammaChartBox.style.display = 'none';
}
LUTInfoBox.prototype.gammaInfoOpt = function() {
	this.instructionsBox.style.display = 'none';
	this.changelogBox.style.display = 'none';
	this.gammaInfoBox.style.display = 'block';
	this.gammaChartBox.style.display = 'none';
}
LUTInfoBox.prototype.gammaChartOpt = function() {
	this.instructionsBox.style.display = 'none';
	this.changelogBox.style.display = 'none';
	this.gammaInfoBox.style.display = 'none';
	this.gammaChartBox.style.display = 'block';
}
LUTInfoBox.prototype.updateGamma = function() {
	this.lutOutIREs[1].innerHTML = Math.round(this.gammas.ireOut(0)).toString();
	this.lutOutIREs[2].innerHTML = Math.round(this.gammas.ireOut(18 / 90)).toString();
	this.lutOutIREs[3].innerHTML = Math.round(this.gammas.ireOut(38 / 90)).toString();
	this.lutOutIREs[4].innerHTML = Math.round(this.gammas.ireOut(44 / 90)).toString();
	this.lutOutIREs[5].innerHTML = Math.round(this.gammas.ireOut(90 / 90)).toString();
	this.lutOutIREs[6].innerHTML = Math.round(this.gammas.ireOut(720 / 90)).toString();
	this.lutOutIREs[7].innerHTML = Math.round(this.gammas.ireOut(1350 / 90)).toString();
	this.lutOutVals[1].innerHTML = this.gammas.tenBitOut(0).toString();
	this.lutOutVals[2].innerHTML = this.gammas.tenBitOut(18 / 90).toString();
	this.lutOutVals[3].innerHTML = this.gammas.tenBitOut(38 / 90).toString();
	this.lutOutVals[4].innerHTML = this.gammas.tenBitOut(44 / 90).toString();
	this.lutOutVals[5].innerHTML = this.gammas.tenBitOut(90 / 90).toString();
	this.lutOutVals[6].innerHTML = this.gammas.tenBitOut(720 / 90).toString();
	this.lutOutVals[7].innerHTML = this.gammas.tenBitOut(1350 / 90).toString();
	this.lutOutIREsChart[1].innerHTML = Math.round(this.gammas.ireOut(0)).toString();
	this.lutOutIREsChart[2].innerHTML = Math.round(this.gammas.ireOut(18 / 90)).toString();
	this.lutOutIREsChart[3].innerHTML = Math.round(this.gammas.ireOut(38 / 90)).toString();
	this.lutOutIREsChart[4].innerHTML = Math.round(this.gammas.ireOut(44 / 90)).toString();
	this.lutOutIREsChart[5].innerHTML = Math.round(this.gammas.ireOut(90 / 90)).toString();
	this.lutOutIREsChart[6].innerHTML = Math.round(this.gammas.ireOut(720 / 90)).toString();
	this.lutOutIREsChart[7].innerHTML = Math.round(this.gammas.ireOut(1350 / 90)).toString();
	this.lutOutValsChart[1].innerHTML = this.gammas.tenBitOut(0).toString();
	this.lutOutValsChart[2].innerHTML = this.gammas.tenBitOut(18 / 90).toString();
	this.lutOutValsChart[3].innerHTML = this.gammas.tenBitOut(38 / 90).toString();
	this.lutOutValsChart[4].innerHTML = this.gammas.tenBitOut(44 / 90).toString();
	this.lutOutValsChart[5].innerHTML = this.gammas.tenBitOut(90 / 90).toString();
	this.lutOutValsChart[6].innerHTML = this.gammas.tenBitOut(720 / 90).toString();
	this.lutOutValsChart[7].innerHTML = this.gammas.tenBitOut(1350 / 90).toString();
	for (var i=1; i<8; i++) {
		if (parseInt(this.lutOutVals[i].innerHTML) > 1023) {
			this.lutOutVals[i].innerHTML = '-';
			this.lutOutIREs[i].innerHTML = '-';
			this.lutOutValsChart[i].innerHTML = '-';
			this.lutOutIREsChart[i].innerHTML = '-';
		}
	}
	this.updateChart();
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
LUTInfoBox.prototype.updateChart = function() {
	var gammaInName = this.gammas.gammas[this.gammas.curIn].name;
	if (this.gammas.gammas[this.gammas.curIn].cat === 1) {
		gammaInName += ' - ' + this.gammas.gammas[this.gammas.curIn].gamma;
	}
	var gammaOutName = this.gammas.gammas[this.gammas.curOut].name;
	if (this.gammas.gammas[this.gammas.curOut].cat === 1) {
		gammaOutName += ' - ' + this.gammas.gammas[this.gammas.curOut].gamma;
	}
	// Ref Against IRE
	this.refChart.rec.clearRect(0, 0, this.refChart.width, this.refChart.height);
	this.refChart.out.clearRect(0, 0, this.refChart.width, this.refChart.height);
	this.refChart.rec.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.refChart.rec.textBaseline = 'middle';
	this.refChart.rec.textAlign = 'left';
	this.refChart.rec.beginPath();
	this.refChart.rec.strokeStyle='rgba(240, 0, 0, 0.75)';	
	this.refChart.rec.fillStyle = 'rgba(240, 0, 0, 0.75)';
	this.refChart.rec.fillText('In: ' + gammaInName, 200,365);
	this.refChart.rec.lineWidth = 4;
	this.refChart.rec.moveTo(this.refChart.x0,this.refChart.y0 - (this.gammas.inRefLegal(0) * this.stopChart.dY));
	for (var i=1; i<65; i++) {
		this.refChart.rec.lineTo(this.refChart.x0 + (14*(parseFloat(i)/64) * this.refChart.dX),this.refChart.y0 - (this.gammas.inRefLegal(14*parseFloat(i)/64) * this.refChart.dY));
	}
	this.refChart.rec.stroke();
	this.refChart.out.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.refChart.out.textBaseline = 'middle';
	this.refChart.out.textAlign = 'left';
	this.refChart.out.beginPath();
	this.refChart.out.strokeStyle='rgba(0, 0, 240, 0.75)';	
	this.refChart.out.fillStyle = 'rgba(0, 0, 240, 0.75)';
	this.refChart.out.fillText('Out: ' + gammaOutName, 200,415);
	this.refChart.out.lineWidth = 4;
	this.refChart.out.moveTo(this.refChart.x0,this.refChart.y0 - (this.gammas.outRefLegal(0) * this.stopChart.dY));
	for (var i=1; i<65; i++) {
		this.refChart.out.lineTo(this.refChart.x0 + (14*(parseFloat(i)/64) * this.refChart.dX),this.refChart.y0 - (this.gammas.outRefLegal(14*parseFloat(i)/64) * this.refChart.dY));
	}
	this.refChart.out.stroke();
	this.refChart.rec.clearRect(0, 0, this.refChart.width, this.refChart.yMax);
	this.refChart.out.clearRect(0, 0, this.refChart.width, this.refChart.yMax);
	// Stop Against IRE
	this.stopChart.rec.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.stopChart.out.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.stopChart.rec.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.stopChart.rec.textBaseline = 'middle';
	this.stopChart.rec.textAlign = 'left';
	this.stopChart.rec.beginPath();
	this.stopChart.rec.strokeStyle='rgba(240, 0, 0, 0.75)';	
	this.stopChart.rec.fillStyle = 'rgba(240, 0, 0, 0.75)';
	this.stopChart.rec.fillText('In: ' + gammaInName, 140,85);
	this.stopChart.rec.lineWidth = 4;
	this.stopChart.rec.moveTo(this.stopChart.x0,this.stopChart.y0 - (this.gammas.inStopLegal(-8) * this.stopChart.dY));
	for (var i=1; i<65; i++) {
		this.stopChart.rec.lineTo(this.stopChart.x0 + ((parseFloat(i)/4) * this.stopChart.dX),this.stopChart.y0 - (this.gammas.inStopLegal((parseFloat(i)/4)-8) * this.stopChart.dY));
	}
	this.stopChart.rec.stroke();
	this.stopChart.out.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.stopChart.out.textBaseline = 'middle';
	this.stopChart.out.textAlign = 'left';
	this.stopChart.out.beginPath();
	this.stopChart.out.strokeStyle='rgba(0, 0, 240, 0.75)';	
	this.stopChart.out.fillStyle = 'rgba(0, 0, 240, 0.75)';
	this.stopChart.out.fillText('Out: ' + gammaOutName, 140,135);
	this.stopChart.out.lineWidth = 4;
	this.stopChart.out.moveTo(this.stopChart.x0,this.stopChart.y0 - (this.gammas.outStopLegal(-8) * this.stopChart.dY));
	for (var i=1; i<65; i++) {
		this.stopChart.out.lineTo(this.stopChart.x0 + ((parseFloat(i)/4) * this.stopChart.dX),this.stopChart.y0 - (this.gammas.outStopLegal((parseFloat(i)/4)-8) * this.stopChart.dY));
	}
	this.stopChart.out.stroke();
	this.stopChart.rec.clearRect(0, 0, this.stopChart.width, this.stopChart.yMax);
	this.stopChart.out.clearRect(0, 0, this.stopChart.width, this.stopChart.yMax);
	// Gamma In Against Gamma Out
	var xMin = this.lutChart.x0 + (64*876/1023);
	this.lutChart.out.clearRect(0, 0, this.stopChart.width, this.stopChart.height);
	this.lutChart.out.font = '28pt "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
	this.lutChart.out.textBaseline = 'middle';
	this.lutChart.out.textAlign = 'left';
	this.lutChart.out.beginPath();
	this.lutChart.out.strokeStyle='rgba(0, 0, 240, 0.75)';	
	this.lutChart.out.fillStyle = 'rgba(0, 0, 0, 1)';
	this.lutChart.out.fillText(gammaInName + ' -> ' + gammaOutName, 220,90);
	this.lutChart.out.lineWidth = 4;
	this.lutChart.out.moveTo(this.lutChart.x0,this.lutChart.y0 - (this.gammas.legalOut(this.gammas.dataIn(0) * this.gammas.eiMult) * this.lutChart.dY));
	for (var i=1; i<65; i++) {
		this.lutChart.out.lineTo( this.lutChart.x0 + ((i*this.lutChart.dX/64)*1023/876),this.stopChart.y0 - (this.gammas.legalOut(this.gammas.dataIn(i/64) * this.gammas.eiMult) * this.lutChart.dY));
	}
	this.lutChart.out.stroke();
	this.lutChart.out.clearRect(0, 0, this.lutChart.width, this.lutChart.yMax);
	var yMin = this.lutChart.h / 15;
	this.lutChart.out.clearRect(0, this.lutChart.h - yMin, this.lutChart.width, this.lutChart.h);
}
