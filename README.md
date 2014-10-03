LUTCalc
=======

Web App for generating 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, principally the Sony CineAlta line.

LUTCalc generates 1D and 3D .cube format LUTs suitable for use in DaVinci Resolve, Adobe Speedgrade and as user 3D LUTs in Sony's log-recording video cameras. These include the PMW-F5, PMW-F55 and PXW-FS7.

Instructions are included, just open 'index.html' in a web browser with Javascript enabled.

Supported Browsers
------------------

Safari may cause difficulties in automatically saving LUTs - it does not support file saving via Javascript. LUTs should open up in a new tab where they can be saved with 'Save As'.

If using Internet Explorer it should be a recent version (10+).

Firefox, Chrome and recent IE should all work fine.

Gamma / Gamut Information
-------------------------

The sources of information used are white papers and standards documents, analysis and comparison of test images and LUT calculations using known reference LUTs.

Sony S-Log3 - [Technical Summary for S-Gamut3.Cine/S-Log3 and S-Gamut3/S-Log3](http://community.sony.com/sony/attachments/sony/large-sensor-camera-F5-F55/12359/2/TechnicalSummary_for_S-Gamut3Cine_S-Gamut3_S-Log3_V1_00.pdf)

Sony S-Gamut3 / S-Gamut3.cine - [Sony Excel spreadsheet of various gamut matrices](http://community.sony.com/sony/attachments/sony/large-sensor-camera-F5-F55/12359/3/S-Gamut3_S-Gamut3Cine_Matrix.xlsx)

Sony S-Log - [S-Log: A new LUT for digital production mastering and interchange applications](https://pro.sony.com/bbsccms/assets/files/mkt/cinema/solutions/slog_manual.pdf)

Sony Look Profile LUTs - [Sony Community Website](http://community.sony.com/t5/F5-F55/Release-version-3DLUT-s-for-S-Gamut3-Cine-S-Log3/td-p/287847)

Arri LogC / Wide Gamut - [ALEXA Log C Curve - Usage in VFX](http://www.arri.com/?eID=registration&file_uid=8026)

Canon C-Log - [Canon-Log Cine Optoelectronic Transfer Function](http://learn.usa.canon.com/app/pdfs/white_papers/White_Paper_Clog_optoelectronic.pdf)

Canon LUTs and Gamut Information - [Canon C500 Support Site](http://www.canon-europe.com/Support/Consumer_Products/products/digital_cinema/digital_cinema_camera/EOS_C500.aspx?type=download)

Cineon - [Understanding Cineon](http://www.digital-intermediate.co.uk/film/pdf/Cineon.pdf)

Rec709 - [ITU BT.709-5](http://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.709-5-200204-I!!PDF-E.pdf)

sRGB - [Wikipedia entry](http://en.wikipedia.org/wiki/SRGB)

LUTCalc File List
=================

Main Files
----------
* index.html - HTML5 base of LUTCalc. Launch to start.
* lutcalc.js - main Javascript file. Initialises all the UI and calculation objects and sets up the event handlers.

UI Files
--------
* lutcamerabox.js - builds the UI object where camera and ISO are chosen.
* lutgammabox.js - builds the UI object for transfer curve (gamma) and  colour space (gamut) selection.
* luttweaksbox.js - builds the UI object for customising the transfer (gamma) curves and colour spaces / gamuts.
* lutlutbox.js - builds the UI object containing options concerning the LUT format.
* lutgeneratebox.js - builds the 'Generate' button that triggers the LUT generation, plus the generation logic itself.
* lutinfobox.js - builds the UI object which shows instructions, the changelog, plots of the input and output gammas against stop and IRE and data values for correct exposure with the chosen output gamma.

Calculation Files
-----------------
* lutgamma.js - contains all the data and equations for calculating the transfer curves, plus input and output functions to various ranges / scales.
* lutgamut.js - contains the data for matrix-based colour spaces, plus the calculations for those, LUT-based spaces and compound combinations of the two.
* lutgamut.lc709.js - a pure colour space transform LUT from S-Gamut3.cine to the LC709 look profile colour. Effectively a LUT of a LUT.
* lutgamut.lc709a.js - a pure colour space transform LUT from S-Gamut3.cine to the LC709a look profile colour. Effectively a LUT of a LUT.
* lutgamut.cpgamut.js - pure colour space transform LUTs from S-Gamut3.cine to the colour space of CP Lock on the Canon C300 and from the C300 to S-Gamut3.cine. Derived from test shot data with side-by-side cameras.

Helper Javascript
-----------------
* lutfile.js - file handling object.
* lutinputs.js - simple object into which the other objects can place their form input objects, to allow interaction without globals.

Other Files
-----------
* style.css - stylesheet controlling the look of the app. All dimensions (greater than 1 pixel) are em values.
* LUTCalc.icns - icon file containing a logo in a format suitable for Mac OSX Apps in XCode.
* README.md - this file.
* LICENSE - GPL2 License document.

External Code Used
------------------
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Cross-browser Javascript file saving.
* [Blob.js](https://github.com/eligrey/Blob.js) - Cross-browser Javascript Blob implementation.
* The function 'createRadioElement' is used to dynamically create radio buttons. This came from a tip by Prestaul on [stackoverflow](http://stackoverflow.com/questions/118693/how-do-you-dynamically-create-a-radio-button-in-javascript-that-works-in-all-bro)

All other code is by me, Ben Turley.