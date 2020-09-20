LUTCalc Changelog
=================

v3.3 Beta 1
-----------
* New Feature - Additional cameras; Sony, Panasonic, DJI, Nikon.
* New Feature - Sony Venice-tuned S-Gamut3 and S-Gamut3.cine using primaries calculated from Sony's IDTs (these shouldn't be camera-specific, the S-Gamut primaries should be set in stone, but Sony definitely offers different ones for the Venice).
* New Feature - Added Nikon N-Log gamma curve.
* New Feature - Fixed point precision setting within settings, so that LUT files can be more precise than the default six or eight decimal places. Good for scene linear output LUTs.
* New Feature - Added Sony s709 colourspace, estimated using Venice ACES primaries to reduce green on FS7 / FX9. TBD if this is the right approach. 
* Feature Change - Improved Arri LogC high ISO highlight response.
* Feature Change - Added 33x LUT option to SmallHD, confirmed SmallHD preset over HDMI and SDI using FX9 and a6500 with latest PageOS4. 
* Bugfix - Fixed Lumetri / Speedgrade cube linear and conventional gamma settings.
* Bugfix - Fixed custom input scaling bug.

v3.2 Beta 1
-----------
* New Feature - DJI DLog and DGamut (Zenmuse X5 and X7 version).
* New Feature - DJI DLog-M based upon test images taken by Mark Walter with a Mavic 2.
* New Feature - 'SDR Saturation' improves HLG compatibility on SDR displays by increasing saturation as per the BT.2390 spec. Available with all HDR options.
* Bugfix - Black Gamma was not available for 1D LUTs.
* Bugfix - Custom input scaling does not appear or be applied unless explicitly checked. Could cause unexpected results with DaVinci and Adobe cubes if not needed.

v3.1.2
------
* Bugfix - Correct output of 'LUT_1D_INPUT_RANGE' or 'LUT_3D_INPUT_RANGE' in Resolve-style cube files with input scaling.

v3.1.1
------
* Bugfix - User preview images were not loading.

v3.1
----
* New Feature - 'Display Colourspace Converter' tool to quickly convert current look to other base colourspaces (eg Rec709 version and then DCI-P3 version).
* New Feature - Sony Cinegamma 3 and Cinegamma 4 based upon analysis of test images taken with an a7s.
* New Feature - Separation on Rec2100 OOTFs and OETF/EOTFs for display referred conversions in PQ and Hybrid-log Gamma.
* New Feature - Splash screen displays progress bar.
* Feature Change - Full rewrite of the underlying high dynamic range (HDR) PQ and Hybrid-Log Gamma code.
* Feature Change - User interface improvements - online version now uses responsive design principals.
* Bugfix - Colour sliders in 'MultiTone' tool now correctly reflect the Gamut Limiter.
* Bugfix - Fixed problem with saving 1D-only LUTAnalyst lacubes and laluts.
* Bugfix - Fixed issue with Mac App not reading LUTs with upper-case file extensions.

v3.0
----
* New Feature - Choice of tricubic, tetrahedral and trilinear interpolation for analysis and use in LUTAnalyst.
* New Feature - Completely new gamut limiter algorithm and code. Legalises colours and fixes potential LUT overshoots when going from a wide Gamut such as S-Gamut3 to a narrow one such as Rec709.
* New Feature - P3 Colourspace now available with DCI, D60 and D65 white points.
* New Feature - Sony Standard Gammas STD 1-6.
* New Feature - 'Auto Title' button. Clicking it creates a LUT title containing input and output gamma and gamut details, plus basic info of customisation (currently black level and saturation).
* New Feature - 'Declip' button on the LUTAnalyst tool. Where LUTs appear to have been clamped (ie the maximum output value is exactly 1.0 and or the minimum exactly 0.0), the declip process will attempt to extrapolate the clipped values, then limit them within a sensible range without hard clipping.
* New Feature - 'DaVinci Resolve 12+ auto' preset option, to reflect that Resolve 12's default 'auto' clip range setting.
* New Feature - Custom Colour Space can now set primaries from a matrix and white point / illuminant.
* Feature Change - Complete rewrite of 3D interpolation / extrapolation code for efficiency, accuracy, clarity and maintainability.
* Feature Change - Extensive rewrite of LUTAnalyst code for improved accuracy.
* Feature Change - Reworked 1D interpolation code for speed and efficiency.
* Feature Change - New code for estimating the gamut triangle on the 'xy / uv chromacity' preview. Much more robust and efficient.
* Feature Change / Bugfix - Extensive rewrite of 'Custom Colour Space' code.
* Feature Change - Improved interpretation of Canon EOS Standard and Normal gammas.
* Bugfix - Fixed Javascript policies which stopped LUTCalc working on Internet Explorer / Edge browser.
* Bugfix - Gamut Limiter tool was blocking LUT generation.

v2.91
-----
* New Feature - RED Gamma 1 and RED Gamma 2 using data from https://github.com/videovillage/RED-Conversion-LUTs.
* New Feature - Bolex Log and Bolex Wide Gamut.
* Bugfix - Reanalysed RED Gamma 4 against RED's 1D LUTs.
* Bugfix - BMD4.6kFilm Gamma output range.

v2.90
-----
* New Feature - BMDFilm4.6k Gamma.
* New Feature - Canon EOS Standard Gamma (plus a version scaled to within legal range).
* New Feature - Canon Normal 1,2,3 & 4.
* New Feature - BBC 0.4, 0.5 and 0.6 Gammas.
* New Feature - RGB Sampler for sampling multiple points on preview images.
* Feature Change - Reanalysed BMDFilm and BMDFilm4k Gamma.
* Bugfix - Fixed 'Print Chart' bug from the last update.
* Bugfix - Fixed issue in Mac App where white balances could not be taken from the CIE xy / uv preview image.
* Feature Removal - ALEXA-X-2 Gamut until I have reanalysed the tone map used.

v2.60
-----
* New Feature - Batch-generate sets of exposure compensation LUTs across a user-selectable EI range and step size.
* New Feature - Gamut Limiter. Aims to contain the YPbPr of the output to within the display's range (Rec709/sRGB or Rec2020) when going from a wide gamut to a narrower one, even if the luminance is above legal and extended.
* Feature Change - White and Black clipping can be set individually, and either to the LUT's output range, or always legal.
* Feature Change - Preview display and charts now reflect any legal-range clipping applied.
* Feature Change - The 'Log Info' information button is now 'Tables', and shows IRE and 10-bit values for the current output gamma, both for various common reflectances and for each of +/- 8 stops around 18% gray.
* Feature Change - 1350% reflectance has been replaced by 'Clip', to reflect the white clip level of the currently selected camera.
* Bugfix - Fixed broken ACEScc input code. ACEScc as a 'Rec Gamma' option now works as expected.

v2.54
-----
* Feature Change / Bugfix - RED Log3G10 code updated to version 2 of the spec, with bugfix to the chart input gamma code.
* New Feature - Rec2100 PQ gamma option including display linear code.

v2.53
-----
* New Feature - REDWideGamutRGB and Log3G10.

v2.52
-----
* Bugfix - Fixed Canon C-Log3 bug.

v2.51
-----
* New Feature - Canon C-Log3.

v2.5
----
* New Feature - Black Gamma.
* New Feature - Sony FS5 camera option.
* New Feature - Panasonic GH4 V-Log camera option.
* Bugfix - When using LUTAnalyst, the preview window was not automatically updating to reflect the analysed colour gamut.

v2.4
----
* New Feature - LUTAnalyst automatically sets output gamma and gamut to the analysed LUT.
* New Feature - Alexa Classic 709 (Alexa-X-2) gamma and gamut.
* New Feature - Amira Rec709 gamma.
* Feature Change - Improved LogC calculations from Arri's ACES IDTs.
* Feature Change - Improved luminance coefficient calculation from colourspace primaries.
* Feature Change - Improved flexibility in preset range settings for particular curve / format combinations.
* Bugfix - xy/uv gamut outlines were failing for LUTAnalyst colourspaces.

v2.3.8
------
* New Feature - Print out the Stop vs IRE chart, plus exposure table and IRE / 10-bit values for each stop from -8 to +8.
* New Feature - ProPhoto / ROMM RGB colourspace and gamma.
* New Feature - Experimentally-derived DJI D-Log gamma for Zenmuse X3 / Osmo.
* Feature Change - added 14-bit (16384 point) output option to 1D cube files.
* Feature Change - Linear and conventional gamma options are now listed under 'Linear / γ' rather than 'Linear / Rec709' to avoid confusion.
* Feature Change / Provisional Bugfix - changed the way that Dolby PQ is scaled due to user feedback.

v2.3.7
------
* Bugfix - typo meant that SPI3D files were generated without the mesh sizes.

v2.3.6
------
* Feature Change - Improved / more robust gamma reversal code for LUTAnalyst.
* New Feature - Provisional SmallHD preset based on SmallHD feedback - pending confirmation.

v2.3.5
------
* New Feature - Hybrid-log gamma.
* New Feature - All Sony Hypergammas (1-8) plus Cinegammas 1 and 2 are now included (HG4 is also the same as Cinegamma 1, HG2 the same as Cinegamma 2).
* New Feature - Rec709(800%) with black at 3% (the built-in LUT in Sony CineEI mode) is now included as an input gamma option. Not an ideal situation, but can be used to reverse an accidentally burnt-in LUT in CineEI mode.
* Feature Change - Hypergammas 7 & 8 plus Rec709 (800%) have been recalculated along withe the other Hypergammas for precision.
* Bugfix - fixed slight offset to x-axis in LUT in / LUT out chart.
* Bugfix - Fixed initial black clip / white clip bounds on the stop chart not displaying.

v2.3.4
------
* Feature Change - More flexible PQ selection.
* Bugfix - Fixed settings loading bug.

v2.3.3
------
* Reversion - New information confirms the original interpretation of V709. Removed the alternative and restored the .vlt preset.

v2.3.2
------
* New Feature - FCP X Color Finale / Color Grading Central LUT Utility Preset.

v2.3.1
------
* New Feature - Generic camera option where the user selects the recorded gamma and gamut.
* Bugfix - Gamma and gamut options properly hidden or revealed in OSX App.
* Bugfix - LUTAnalyst gamuts could become hidden when the format changed.

v2.3
----
* New Feature - Gammas and Gamuts available sorted by manufacturer, type (log, display, HDR Display, etc) or as the previous flat list.
* New Feature - Additional MLUT format presets: Zacuto Gratical, Divergent Scopebox, AJA LUT-box.
* New Feature - 'Display gamma correction' preset for say mapping scene linear to Rec709 or γ2.4 to PQ.
* New Feature - GoPro Protune Gamma and Gamut (from ACES devel matrix and Cineform blog).
* New Feature - DRAGONColor, DRAGONColor2, REDColor, REDColor2, REDColor3, REDColor4 gamuts (from ACES devel matrices).
* New Feature - REDGamma3 and REDGamma4 (from LUTs on manufacturer's website).
* New Feature - Further Dolby PQ options listed by display nits for a 90% reference white.
* New Feature - Good Broyden's used to estimate gamut primary triangles for LUTAnalyst-read LUTs.
* Bugfix - Binary file saving now works in the OSX App.
* Bugfix - Fixed different binary saving bug in Chrome App.
* Bugfix - Re-analysed the Panasonic V-709 LUTs for both gamma and gamut. Lack of availability of a Varicam 35 has lead to uncertainty over the correct ranges to choose. Pending confirmation both interpretations of the gamma are given, though the .vlt preset assumes the new assumption of range.
* Bugfix - Fix incomplete input scaling bugfix from v2.2, which meant that scaling was only applied if both lower and upper bounds were changed.

v2.2.2
------
* New Feature - Additional pure gamma curves, plus Rec709 and sRGB now show their effective pure gamma value with the actual exponent in brackets.
* Bugfix - LUTAnalyst has an undocumented feature of reversing analysed gammas to provide a 'Recorded Gamma' option. This was disabled and is now functioning again.

v2.2
----
* New Feature - Multitone. This combines two adjustments. You can set colour saturation on a stop-by-stop basis (eg for lower saturation in the highlights), and then set one or more colour 'washes' - a tint to zero saturation - at arbitrary stop levels. With Multitone you can create washes, duotones, tritones etc, or create alternatives to LC709A.
* New Feature - Custom Colour Spaces. Select 'Custom' in the recorded or output gamut boxes and a new panel appears where you can define one or more custom colour spaces, either using xy white point and primaries, or by entering matrix values and selecting the intended internal or working colour space.
* Bugfix - LUTCalc For Mac now works on OSX 10.8 Mountain Lion.
* Bugfix - Modal popup dialogs. Ensures that none of the other controls can be changed when a modal dialog box is up (eg 'Load Preview' details).
* Bugfix - cube files which did not use input scaling would still include the scaling command, potentially breaking compatibility with some software.

v2.1
----
* New Feature - Knee adjustment. Add or adjust a knee with any output gamma. clip levels, range and smoothness (from hard conventional video knee to smoothly curved 'cinegamma') are all adjustable.
* Bugfix - changing the output gamma was not correctly setting the output range for the chosen format preset.
* Bugfix - file format and details settings were not correctly stored or loaded with 'Save Settings' and 'Load Settings'.
* Bugfix - Values in Resolve 'ilut' and 'olut' format LUTs were separated with spaces rather than commas.
* Feature Change - Simplified the LUT output calculation process for easier maintainance and development.
* Feature Change - Colour charts on preview defaults now circles, allowing variation in the YPbPr values which will eventually allow larger dots on the Vectorscope.

v2.0
----
* Updated instructions to reflect added features and changes to the interface.
* Added 'Lock Value' options to black level and highlight level adjustments.
* Black / highlight bug when loading settings fixed by 'Lock Value' options.
* Reintroduced nominal colour temperature select box for fluorescent adjustments.
* Removed fileSaver.js and Blob.js from Chrome App version - now all original code.

v1.9 RC18
---------
* Current settings can now be saved and loaded later. At present black level / highlight level settings do not reload.
* CIE chromacity chart preview now overlays the output gamut triangle and white point where possible (currently all matrix-based colourspaces). It adapts to whitepoint and saturation shifts, though does not take into account PSST-CDL, with its scope for extreme nonlinearity.
* White balance picker handles more extreme colour choices.

v1.9 RC17
---------
* Further improvement of White Balance code.
* Additional preview default showing the CIE 1931 xy and CIE 1960 uv chromacity diagrams with Planck locus. Gives a guide to the saturation limits / clipping of the current output colourspace.
* White Balance now includes a 'click on preview' option. Once activated, clicking a spot on the preview window will attempt to calculate the CCT and Duv at that point and apply them to the White Balance adjustments.
* Improvements to the Correlated Colour Temperature (CCT) calculation code.
* Preview images are now chosen from a selection list, rather than toggling from one to the next.

v1.9 RC16
---------
* Overhaul of the white balance adjustments code and Planck Locus calculation.
* Planck locus data calculated from Planck equation and CIE 1931 data at 5nm intervals from 360-830.
* Colour temperature and Fluori adjustments combined into one 'White Balance' adjustement tool.
* Colour temperature shifts calculated from mired values rather than mappings from lighting gel data, then converted to working colour space's white point.
* Fluori adjustment fixes to ensure that it is a Duv shift at the lamp's nominal CCT.
* LUT file options and generate button now remain visible when the preview window is on.
* The cursor becomes a crosshair over the preview window, with 10-bit code values for the output image at that point displayed above.

v1.9 RC15
---------
* Added ACEScg colour space (AP1) with ACEScc and ACESproxy gammas.
* Beta - added Nikon .NCP LUT format with initial Nikon styles support.
* LUT formats can now specify acceptable input gammas (eg Nikon styles for NCP).
* Refined and improved CAT calculations for colour temperature and fluori magenta/green shifts.
* Default CAT is now CIECAT02 throughout.
* Fixed Canon IDT out - daylight and tungsten calculated options are now the right way around.

v1.9 RC14
---------
* Tweaked Preview 'data range' option so that black remains black (it shows 10-bit 64 to 10-bit 1023). Changed the options to '100%' and '109%'.

v1.9 RC13
---------
* Fixed Highlight Gamut bug which could cause freezing / crashing

v1.9 RC12
---------
* Added legal / data toggle to the Preview so that it can be used to display the whole data range.
* Preview code adjustment to avoid reloading / glitches.
* Fixed MLUT clipping bug.

v1.9 RC11
---------
* Colourspace calculation overhaul. All gamuts transforms are now calculated at startup from chromacity / whitepoint data. Luma coefficients and CATs are calculated from the choice of working gamut (currently S-Gamut3.cine), which can now be any of the available options.
* This makes it easier to add Gamuts / Colourspaces. DCI-P3, DCI-P3D60, Canon's DCI-P3+, Adobe RGB and Adobe Wide Gamut RGB have been added.
* New attempt at the C300 colourspace - still a work in progress!
* More accurate colour temperature shifts.
* Simplified fluorescent / LED green / magenta control.
* Fixed a bug where the output range was not adjusting correctly for non-log gammas.

v1.9 RC10
--------
* LUTCalc For Mac can now read in 16-bit TIFFs and PNGs for use in the preview window.
* Added a 16-stop grayscale to the preview defaults.
* Updated instructions.

v1.9 RC9
--------
* Added support for more LUT formats: .3dl (Flame / Assimilate flavour, Lustre flavour and Kodak flavour), .lut (assimilate flavour), .spi1d and .spi3d.
* LUTAnalyst support for nonlinear input values (shaper LUTs) and scaled input values (common with narrow dynamic range inputs such as linear or Rec709).
* Scaled inputs can be used with LUT generation (where the format allows it).
* LUTAnalyst will attempt to provide a reversed transfer function to the 'Recorded Gamma' options.
* Bugfixes

v1.9 RC8
--------
* Bugfix

v1.9 RC7
--------
* Simplified output range choices with usage and application selections. The user can choose to build a LUT intended for post grading, or one for use in a camera or on set (MLUT), and then choose the particular grading application or camera and LUTCalc will offer appropriate settings and save to the correct file format.
* Generalised LUT reading / writing code. LUTAnalyst can now understand .cubes, DaVinci .iluts and .oluts and Panasonic .vlts. LUTCalc can construct LUT files in these formats, and it is now straightforward to add more.
* Bugfix to PSST-CDL interpolation code - adjustments should now appear more logical.

v1.9 RC6
--------
* Added an approximation of the forthcoming Canon Log 2 curve in the C300 mkII. This is derived from data in a chart shown in Canon's 'Introducing the Canon EOS C300 Mark II' video, hence is only an approximation. It appears to be very similar to Arri's LogC, with slightly lower-contrast shadows.
* Scrollbars now more smoothly adapt to display size, appearing only when the browser window cannot fit all information.
* The default previews now include a Rec709 colourwheel. This displays the range of colours available with the Rec709 gamut in an arrangement akin to a completely full vectorscope. The default previews cycle: High Contrast -> Low Contrast -> Rec709 Gamut -> back to High Contrast.

v1.9 RC5
--------
* Added sensor black and white clip and 18% gray (when exposure compensation is applied) to Stop/IRE chart.
* Various bug fixes to PSST-CDL controls.
* Refined PSST-CDL parameters.
* Added PSST-CDL instructions.
* Fixed bug where Linear / Rec709 input gamma options were not generating LUTs.

v1.9 RC4
--------
* Preview speedups.
* Bug Fixes.

v1.9 RC3
--------
* Tidied and made consistent the code for customisation tweaks. Each tweak is now an individual object file, following a consistent basic structure both at the UI stage and in the calculation code.
* Added splash screen to immediately hide the Javascript warning and then hide the splash when the UI has loaded.
* Added initial code for 'PSST-CDL' customisation; (P)rimary (S)econdary (S)kin (T)one colour decision list. Quickly allows complex adjustment to individual sectors of the vectorscope using controls familiar from the ASC-CDL.
* Fixed False Colour display bug when yellow (near white clip) and red (white clip) are turned off.
* Added option to False Colour to set the white clip level in stops above 18% gray.
* Improved the coefficients used for S-Gamut3.cine luminance.
* Initial tidying of UI control code to change from object.style.display approach over to object.className. Visuals are then completely controlled by style sheets, allowing fundamental reskinning for different platforms / applications.
* Speedup in preview from increased use of transferrable objects.
* Allow 1D LUTs to include the ASC-CDL customisation (minus the saturation control).

v1.9 RC2
--------
* Fixed bug which turned off customisations.

v1.9 RC1
-------------
* Fixed 'Highlight Level' maps to box bug.
* Allow black level and highlight level adjustment with log curves.
* Fixed Canon CP IDT not available in LUTAnalyst bug.

v1.9 Beta 9
-----------
* Simplified False Colour calculation. Now works with every output gamma / gamut / tweak option.

v1.9 Beta 8
-----------
* Added False Colour.
* Black Level and Highlight Level now take into account ASC-CDL.

v1.9 Beta 4
-----------
* Added ASC CDL controls tweak.
* Added Waveform.
* Added RGB Parade.
* Preview, Waveform, Vectorscope and Parade can now all be displayed at the same time.

v1.9 Beta 3
-----------
* Added green correction tool.
* Added Vectorscope option to previews. Includes Rec709 75% and 100% boxes, plus a set of Rec709 75% boxes mapped to the current colour space.
* Adjusted test image primary boxes to be Rec709 75% and 100% colours.

v1.9 Beta 2
-----------
* Fixed missing FileSaver.js and Blob.js files.
* Added Google Chrome packaged app code.

v1.9 Beta 1
-----------
* Added real-time(ish) preview, currently with built-in low and high-contrast test images.
* Test images include 75% saturation primaries and secondaries in Rec709 and Rec2020, 16-stop grayscale and colour charts at correct exposure and +/- 2 stops (low contrast image) and  +/- 4 stops (high contrast image).
* Test images are 16-bit and stored as most significant bits (MSB) and least significant bits (LSB) 8-bit PNGs.
* Added colour temperature adjustment to tweaks. Available to 3D LUTs. Can be set as either CTO / CTB values or as recorded and desired colour temperature (advanced settings). Also under advanced various chromatic adaptation models are available for the adjustment.
* Added Rec2020 colour space.
* Fixed matrix bug from previous beta.
* Bumped version number to 1.9 as new features and changes are substantial enough for final release to be v2.0.

v1.5 Beta 3
-----------
* Fixed a LUTAnalyst input gamut bug. Recalculated V709.

v1.5 Beta 2
-----------
* Built-in colour-spaces based on LUTs now have their data stored in binary versions of LUTAnalyst files. Previously they were human-readable javascript variable declarations.
* The format now is Int32Array blobs stored in files ending 'labin'. LUTCalc uses Float64s internally (Javascript treats standard floats as 64-bit). Scaling 32-bit integers maintains much more precision than Float32s considering that the actual range is not generally more than 0-1 (the format allows -2 - +2).
* The format is little endian, first value the length of the transfer function (gamma) array, second value the length of the colour space array, then gamma and colour space data.
* This is a much more compact way to store the data, so 65x65x65 colour spaces are a little over twice the size of the previous 33x33x33 ones. Consequently LC709 and LC709A now produce SL3/SG3.cine to LC709(A) 3D LUTs numerically identical to the Sony look profiles.
* LC709 and LC709A colour spaces have been recalculated, Cine709 has been dropped (the transfer function is still available, and it is easy to import it with LUTAnalyst if needed).
* Tweaked the Brent method root finding code to be more robust.

v1.5 Beta
---------
* Major rewrite of the transfer function (gamma), colour space (gamut), LUT and LUTAnalyst code bases.
* Web workers are now used extensively for multithreading speed.
* Strided 1D typed arrays are gradually replacing multidimensional arrays for basic speed and for efficiency in passing to web workers.
* Linear interpolation code has been tidied up. Cubic is generally used, but with multithreading linear should be fast enough to allow real-time previews in a future version.
* Fixed a LUTAnalyst bug which could cause the wrong input gamut option to be used giving faulty results.
* Added a basic implementation of the Dolby PQ transfer function for high dynamic range displays. As it stands, rather than a nits scale, it is set to place 18% gray at the same 10-bit value as for Rec709.
* Added two alternative HDR transfer function proposals based on extending Rec709/Rec2020 with log highlights region. Both have 400% and 800% options.
* Added Panalog.
* Other small bugfixes.

v1.3
----
* New Canon CP Lock output gamuts. Should be more reliable across the gamut for dropping in with Canon CP lock material.

v1.22
-----
* Added Panasonic Varicam V-Log and V-Gamut.

v1.21
-----
* Log gamma and LUTAnalyst range checking bugfixes.

v1.2
----
* Added charts for % Reflectance against LUT % IRE and LUT % IRE in against LUT % IRE out.
* Fixed missing term in Arri LogC input equation.

v1.1
----
* Canon CP Gamut In replaced by Canon CP IDT (Daylight) and Canon CP IDT (Tungsten). Beta testing. These use matrix coefficients from the ACES IDTs published by Canon for the C300, C500 and C100.Tungsten for 3200 or warmer, Daylight for 4300 and up.
* Canon CP Gamut Out replaced by LUTs derived from the IDTs using Newton-Raphson to invert. Alpha testing.
* CP Gamut In -> CP Gamut Out does not currently produce expected results. Possibly due to the reduced gamut of CP Rec709.
* Removed code duplication in the tricubic calculations, and bade out-of-bounds handling more sensible. This has slowed the tricubic somewhat. I will look to optimise.
* Fixed MLUT bugs which meant that the appropriate clipping was not happening, and that changing to a log output gamma with MLUT checked would lead to the wrong output scaling.
* Provisional fix for an out-of-bounds (NaN) bug in LUTAnalyst with gammas of less dynamic range than S-Log3, ie Canon C-Log.

v1.0
----
* Introduced 'LUTAnalyst' - a tool to convert 1D and 3D LUTs (currently cubes) to 1D S-Log3 to new transfer gamma LUTs plus 3D S-Gamut3.cine to new colour space gamut LUTs. LUTCalc can then use these to use the new gamma and / or gamut as you can with any of the built in options.
* Totally recoded the handling of LUTs as data sources in LUTCalc.
* Substantially improved LC709 and LC709A colour transforms - added in Cine+Rec709.
* Added initial cubic interpolation for 1D and tricubic interpolation for 3D code.

v0.9991
-------
* Released code on Github under GPLv2.
* UI CSS tweaks and removal of Sentenza Desktop code for the time being as no binary release. Web App only again for now!

v0.999
------
* Total rewrite of the code base to be modular and object oriented. Simplifies altering and adding features.
* Shifted UI to match between the Mac app and web app versions and hopefully make options as clear as possible.
* Added LUT-based Canon CP Lock Gamut in and out derived from analysing numerous side-by-side test images. Far from perfect and consider experimental, but seems to give a good match going from Sony to Canon and a really good match going from Canon to Sony. Definitely shows the advantage of the 10-bit, 14-stop Sony cameras! The main caveats are that limitations on the free Excel solver make the saturated blue and cyan trickier to optimize and I do not have a C300 to check against, just the (numerous) test images I took to build the gamut.
* Added Arri LogC gamma options along with Arri Wide Gamut. Arri's approach to log does odd things from ISO 1600 and up, feathering the highlight to avoid clipping. I have tried to factor in the shoulder point by comparing Arri LUT Generator LUTs with the stock equation. As such, this option is somewhere between experimental and more useful for comparing charts than producing LUTs :-).

v0.991
------
* Fixed bug with customising Canon WideDR.
* Cleaned up layout.

v0.99
-----
* First version of Mac App.
* Total overhaul of colour transforms and recalculation of all estimated gammas.
* Colour transforms are now done either by conventional matrices, using colour LUTs or combinations of both.
* Calculated LC709 and LC709A colour LUTs from the Sony looks. This required an improved mapping of the gamma curves.
* Tweaks to the S-Log2 gamma calculation should mean better high ISO CineEI shifts. It has now been finessed using the Sony S-Log2 to Rec709 ilut in Resolve.
* Canon C-Log is now directly from an equation published by Canon.
* Added a table of IRE and 10-bit values for the current output gamma to the 'Gamma Info' tab. This includes any customisations so will give a good guide to appropriate recording levels.

v0.981
------
* Housekeeping Release.
* Added fileSaver.js and Blob.js by Eli Grey (eligrey.com) to allow saving directly to .cube files rather than the new tab Kludge. Not only a lot easier and neater, by just saving to file the LUT process is MUCH quicker.
* To go with the file saving, the 'LUT Title' option has now become 'LUT Title / Filename', and will now be used as the filename for the .cube.
* When a log gamma is selected for output, the range defaults to 'data'. Other curves (and with MLUT selected) default to 'legal' range. This is more appropriate for further processing of log curves.
* 3D Gamuts default to 'Passthrough' (gamma only), pending colour overhaul.
* LUT values are fixed length at 10 decimal places (that ought to do for now ;-) ).

v0.98
-----
* Added 'Rec709 Like' as options for both recorded and output gamma. This really means 'Gamma Corrected Linear', but to avoid confusion over the two meanings of gamma and to keep consistency with the 'Rec709 (No Knee) option of previous versions it's 'Rec709 Like' for now :-).
* Rec709 Like brings up an additional option box for selecting the gamma correction. The choices are currently 'Rec709', 'sRGB' and 'Linear'. The first two use the gammas specified in their respective standards and 'Linear' means a gamma of 1 (this doubles up on the output option of 'Linear', but allows for linear input and again maintains consistency with previous versions).

v0.97
-----
* Added 'Gamma Chart' button that displays the input and output gammas plotted data range value against stop (IE 9+, Safari 5.1+, Chrome, Firefox, Opera).
* Added S-Log as a gamma option (along with PMW-F3 and F35 as camera options).

v0.96
-----
* Added highlight scaling as an option for remapping preferred IRE values without affecting black. Also improved black scaling code to work with it.
* Started code cleanup.
* 'Passthrough' is now a functional option for gamuts. It means that the colour gamut is unprocessed, ie a 3D LUT behaves like a 1D gamma only LUT. Use it for making an MLUT version of a 1D LUT.
* Added reflected value mapping IREs for various gammas to the 'Gamma Info' tab.

v0.95
-----
* Differently calculated, more precise LC709 / LC709A curves.

v0.94
-----
* Further range bugfix to LC709 / LC709A.
* Added separate input range and output range options. Sony Look Profiles are data input / legal output.

v0.93
-----
* Fixed errors in LC709 and LC709A from treating the Look Profiles as data (extended) range rather than legal range. Black level was set too low and white too high.
* Added options for creating either legal level (64-940, 0%-100% IRE) LUTs or data level (0-1023, -7%-109% IRE). Previously the LUTs were generated to work with a data levels workflow only.
* Added a check to the MLUT option to ensure the correct (legal) range.

v0.92
-----
* Gets named 'LUTCalc'
* Improved 709 matrix from profiling F55 in Custom Mode, rather than Sony published matrix.
* Added Canon Cinema Gamut from Canon published matrix.
* Added Canon WideDR Gamma out.
* Added info page about the log gammas.

v0.91
-----
* Improved Canon CP Lock matrix.

v0.9
----
* Added 'Black Level' adjustment to customisation options for non-log output gammas.

v0.8
----
* Added 'Camera MLUT' option to keep things in range for use in the camera (tested on v4.1).

v0.7
----
* Added 'Canon CP Lock Gamut' as an input/output Gamut option. Combine with the C-Log Gamma option for quick matching of C300 material with F5/55.
* The gamma is accurate and from the official Canon LUT, but the gamut conversion is estimated from test shots
* Consider it experimental and test!
* I don't have a C300 available for further testing, so feedback would be great.
* Added 'Customisation' box, with 'Highlight Gamut' option.
* Highlight gamut is only available with 3D LUTs, and allows a transition to a second gamut/matrix in the highlights. This should allow more complex colour handling, as with the Type A Sony Look.
* Added 'B&W (Rec709 Luma)' as an output Gamut option.
* Fixed an IRE scaling bug on the 'Linear' output Gamma option.
* Fixed a silly bug with some input Gamut options which meant that S-Log2 and C-Log material were being treated as S-Gamut3.cine regardless of input Gamut choice.

v0.6
----
* First release as Javascript web app.
* Initial inclusion of colour space matrices to 3D LUTs.

v0.5
----
* Fixed incorrect LUT 3D SIZE in 65x65x65 version.

v0.4
----
* Added Cineon.
* Fixed stupid error on S-Log2 input for 1D LUTs.

v0.3
----
* Separate 33x33x33 and 65x65x65 versions. Added 1024-point 1D version.
* Cleaned up 'Calc' sheet for clarity and to allow 1D LUTs.
* Corrected curves against stop chart for clarity.
* Added 'Exposure Only' option that just shifts the input curve.

v0.2
----
* 65x65x65 LUTs.

v0.1
----
* First Release.
