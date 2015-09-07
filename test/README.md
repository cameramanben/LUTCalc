LUTCalc
=======

A Web App for generating 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, principally the Sony CineAlta line.

LUTCalc generates 1D and 3D .cube format LUTs suitable for use in DaVinci Resolve, Adobe Speedgrade and as user 3D LUTs in Sony's log-recording video cameras. These include the PMW-F5, PMW-F55 and PXW-FS7.

How To Start
------------
Mac OSX Safari: For Mac OSX users, the sister [LUTCalc For Mac](https://github.com/cameramanben/LUTCalc-For-Mac) project provides a native app version using a sandbox-friendly Objective-C Webkit wrapper around the LUTCalc Javascript.
Chrome (Windows, Mac or Linux): LUTCalc currently needs to be run as an app extension. Either click Window->Extensions in the menu bar or type chrome://extensions in the address bar. Check 'developer mode' in the top right, then click 'Load unpacked extension' and find the main LUTCalc directory and click select. LUTCalc should then show up on the list of installed extensions. You can now uncheck developer mode and start LUTCalc either by clicking 'Launch' or from the Chrome App Launcher.
Firefox: I have been developing using Firefox, so opening index.html in the main directory should work.
Internet Explorer: currently looking in to making this work.

Gamma / Gamut Information
-------------------------

The sources of information used are white papers and standards documents, analysis and comparison of test images and LUT calculations using known reference LUTs.

Sony S-Log3 - [Technical Summary for S-Gamut3.Cine/S-Log3 and S-Gamut3/S-Log3](http://community.sony.com/sony/attachments/sony/large-sensor-camera-F5-F55/12359/2/TechnicalSummary_for_S-Gamut3Cine_S-Gamut3_S-Log3_V1_00.pdf)

Sony S-Gamut3 / S-Gamut3.cine - [Sony Excel spreadsheet of various gamut matrices](http://community.sony.com/sony/attachments/sony/large-sensor-camera-F5-F55/12359/3/S-Gamut3_S-Gamut3Cine_Matrix.xlsx)

Sony S-Log2 - [Sony technical paper on S-Log2](https://pro.sony.com/bbsccms/assets/files/micro/dmpc/training/S-Log2_Technical_PaperV1_0.pdf)

Sony S-Log - [S-Log: A new LUT for digital production mastering and interchange applications](https://pro.sony.com/bbsccms/assets/files/mkt/cinema/solutions/slog_manual.pdf)

Sony Look Profile LUTs - [Sony Community Website](http://community.sony.com/t5/F5-F55/Release-version-3DLUT-s-for-S-Gamut3-Cine-S-Log3/td-p/287847)

Arri LogC / Wide Gamut - [ALEXA Log C Curve - Usage in VFX](http://www.arri.com/?eID=registration&file_uid=8026)

Canon C-Log - [Canon-Log Cine Optoelectronic Transfer Function](http://learn.usa.canon.com/app/pdfs/white_papers/White_Paper_Clog_optoelectronic.pdf)

Canon LUTs and Gamut Information - [Canon C500 Support Site](http://www.canon-europe.com/Support/Consumer_Products/products/digital_cinema/digital_cinema_camera/EOS_C500.aspx?type=download)

Canon C300 Input Device Transform (IDT) - [Canon C300 Support Site](http://www.usa.canon.com/cusa/professional/products/professional_cameras/cinema_eos_cameras/eos_c300#DriversAndSoftware) - under 'Software'. You have to specify 'Mountain Lion' on a Mac or 'Windows XP' on a PC for it to be displayed. C500 and C100 have the same IDTs for CP Lock, though the C500 also offers 'Cinema Gamut' (see above link).

Panasonic Varicam V-Log and V-Gamut - [V-Log/V-Gamut Reference Manual](http://pro-av.panasonic.net/en/varicam/common/pdf/VARICAM_V-Log_V-Gamut.pdf)

Cineon - [Understanding Cineon](http://www.digital-intermediate.co.uk/film/pdf/Cineon.pdf)

Rec709 - [ITU BT.709-5](http://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.709-5-200204-I!!PDF-E.pdf)

sRGB - [Wikipedia entry](http://en.wikipedia.org/wiki/SRGB)

Dolby PQ and alternative prospective transfer functions for HDR displays - [Non-linear Opto-Electrical Transfer Functions for High Dynamic Range Television](http://www.bbc.co.uk/rd/publications/whitepaper283)

Chromatic adaptation and Von Kries transform for colour temperature adjustments - [Wikipedia article](http://en.wikipedia.org/wiki/Chromatic_adaptation)


LUTCalc File List
=================

Main Files
----------
* index.html (window.html) - HTML5 base of LUTCalc. Launch to start.
* lutcalc.js - main Javascript file. Initialises all the UI and calculation objects and sets up the event handlers.

UI Files
--------
* lutcamerabox.js - builds the UI object where camera and ISO are chosen.
* lutgammabox.js - builds the UI object for transfer curve (gamma) and  colour space (gamut) selection.
* luttweaksbox.js - builds the UI object for customising the transfer (gamma) curves and colour spaces / gamuts.
* lutanalyst.js - extension to luttweaksbox which reads and then analyses LUTs into transfer function and colour space components so that they can be adapted for use with other input colour spaces and further tweaked as with the built-in options.
* lutlutbox.js - builds the UI object containing options concerning the LUT format.
* lutgeneratebox.js - builds the 'Generate' button that triggers the LUT generation, plus the generation logic itself.
* lutpreview.js - builds the UI object which previews LUTs on test images.
* lutinfobox.js - builds the UI object which shows instructions, plots of the input and output gammas against stop and IRE and data values for correct exposure with the chosen output gamma.

LUT I/O
-------
* lutformats.js - controller object for the parsers and builders of various LUT formats.
* lut-cube.js - .cube format parsing and building (Adobe format and DaVinci format).
* lut-davinci.js - DaVinci Resolve 1D .ilut input LUT and .olut output LUT parsing and building.
* lut-vlt.js - Panasonic .vlt MLUT format parsing and building.
* lut-3dl.js - .3dl format parsing and building (Assimilate, Autodesk and Kodak formats).
* lut-lut.js - Assimilate 1D .lut parsing and building.
* lut-spi1d.js - Sony Pictures International 1D .spi1d format parsing and building.
* lut-spi3d.js - Sony Pictures International 3D .spi3d format parsing and building.
* lut-la.js - cube-based .lacube and .labin LUTAnalyst parsing and building.

Adjustment Files
----------------
* twk-wb.js - white balance (colour temperature / fluori green / magenta) adjustment.
* twk-asccdl.js - adjustment based on the ASC-CDL operations.
* twk-psstcdl.js - colour-specific adjustment based on the ASC-CDL controls.
* twk-hg.js - adjustment to allow for a second choice of gamut in the highlights.
* twk-blkhi.js - adjustment of the black level and a user-selectable scene reflectance response level.
* twk-fc.js - false colour overlay option.
* twk-la.js - LUTAnalyst UI controls.
* twk-blank.js - empty example object which demonstrates the layout.

Web Workers
-----------
* lutmessage.js - handles creation and message passing for multiple web worker calculation threads.
* gamma.js - handles all the calculations relating to transfer functions (gammas).
* colourspace.js - handles all the functions relating to colour spaces (gamuts).

Binary LUT Files
----------------
* LC709.labin - little-endian Float64Array buffer of colour space (S-Log3 to S-Log3, S-Gamut3.cine to LC709) data based on Sony's look profile.
* LC709A.labin - colour space data based on Sony's look profile.
* V709.labin - experimental colour space data based on Panasonic's reference V-log to V709 LUT.
* cpoutdaylight.labin - Canon CP lock to S-Gamut3.cine data developed by testing against Canon's reference daylight IDT.
* cpouttungsten.labin - Canon CP lock to S-Gamut3.cine data developed by testing against Canon's reference tungsten IDT.

Helper Javascript
-----------------
* splash.js - displays a splash screen and sets the version.
* tests.js - performs Javascript capabilities tests to see whether and how LUTCalc will run in a given environment.
* lut.js - LUT handling object. Will calculate interpolated values from LUTs using cubic and tricubic interpolation. Also includes code for breaking a 3D LUT into gamma and gamut component LUTs and changing the input gamma / gamut (as used by the LUTAnalyst tool).
* ring.js - ring spline object. Like a 1D LUT which connects back on itself. Used in the PSST-CDL calculations.
* lutfile.js - file handling object.
* lutinputs.js - simple object into which the other objects can place their form input objects, to allow interaction without globals.
* brent.js - Brent's method of root finding for LUTAnalyst.
* tests.js - object containing feature / environment detection tests.
* window.html - web app version of index.html.
* background.js - web app required code.
* manifest.webapp - web app manifest.
* manifest.json - alternative web app manifest format.

Style Sheets
------------
* reset.css - DOM reset stylesheet.
* fonts.css - font options stylesheet.
* ui.css - style sheet controlling specific UI elements.
* style.css - base stylesheet controlling the look of the app. All dimensions (greater than 1 pixel) are em values.
* info.css - stylesheet controlling the information / instructions window.

Other Files
-----------
* background.js - Chrome packaged app requirement
* LUTCalc.icns - icon file containing a logo in a format suitable for Mac OSX Apps in XCode.
* logo(x).png - various sizes of png containing the LUTCalc logo for the Chrome app.
* LDR / HDR Preview LSB / MSB .png - test images for use in the preview window. Low dynamic range / contrast (LDR) and high dynamic range (HDR) from 16-bit originals broken into 8-bit most significant and least significant byte images (MSB and LSB) for Javascript.
* Gray LSB/ MSB .png - 16-stop grayscale test image.
* CW LSB / MSB .png - Representation image of the Rec709 Colour Gamut for use in the preview window.
* README.md - this file.
* CHANGELOG.md - changelog.
* LICENSE - GPL2 License document.

External Code Used
------------------
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Cross-browser Javascript file saving.
* [Blob.js](https://github.com/eligrey/Blob.js) - Cross-browser Javascript Blob implementation.
* The function 'createRadioElement' is used to dynamically create radio buttons. This came from a tip by Prestaul on [stackoverflow](http://stackoverflow.com/questions/118693/how-do-you-dynamically-create-a-radio-button-in-javascript-that-works-in-all-bro)

All other code is by me, Ben Turley.
