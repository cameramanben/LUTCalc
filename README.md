LUTCalc
=======

Web App for generating 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, principally the Sony CineAlta line.

LUTCalc generates 1D and 3D .cube format LUTs suitable for use in DaVinci Resolve, Adobe Speedgrade and as user 3D LUTs in Sony's log-recording video cameras. These include the PMW-F5, PMW-F55 and PXW-FS7.

Instructions are included, just open 'index.html' in a web browser with Javascript enabled.

Supported Browsers
------------------

Safari may cause difficulties in automatically saving LUTs, and if using Internet Explorer it should be a recent version (10+).

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

Cineon [Understanding Cineon](http://www.digital-intermediate.co.uk/film/pdf/Cineon.pdf)

Rec709 - [ITU BT.709-5](http://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.709-5-200204-I!!PDF-E.pdf)

sRGB - [Wikipedia entry](http://en.wikipedia.org/wiki/SRGB)
