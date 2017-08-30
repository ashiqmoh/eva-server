//--- initialize progress bar ---//
var Progressbar = {};

//--- static variables ---//
//--- progress bar object ---//
Progressbar.nanobar = null;
//--- progress bar position ---//
Progressbar.move = null;

Progressbar.setup = function () {
    "use strict";
    Progressbar.nanobar = new Nanobar({
        bg: "#83B81A", // sets progress bar color
        target: document.getElementById("main") // sets progress bar location on web page
    });
    //--- progress bar increment/decrement ---//
    Progressbar.move = 100 / (Slide.totalSlides + 1);
};
