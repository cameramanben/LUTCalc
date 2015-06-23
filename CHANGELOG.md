LUTCalc Changelog
=================

v1.9 RC11
---------
* Colourspace calculation overhaul. All gamuts transforms are now calculated at startup from chromacity / whitepoint data. Luma coefficients and CATs are calculated from the choice of working gamut (currently S-Gamut3.cine), which can now be any of the available options.
* This makes it easier to add Gamuts / Colourspaces. DCI-P3, DCI-P3D60, Canon's DCI-P3+, Adobe RGB and Adobe Wide Gamut RGB have been added.
* New attempt at the C300 colourspace - still a work in progress!

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
