//--- renders previous and next buttons ---//
var Carousel = {};

Carousel.setup = function () {
    "use strict";
    //--- renders and appends previous button to web page ---//
    var divContainer = document.getElementById("main-container");
    
    var btnPrev = document.createElement("button");
    btnPrev.type = "button";
    btnPrev.id = "carousel-prev";
    btnPrev.className = "btn btn-default";
    divContainer.appendChild(btnPrev);
    $(btnPrev).hide();
    
    var spanChevronLeft = document.createElement("span");
    spanChevronLeft.className = "glyphicon glyphicon-chevron-left";
    btnPrev.appendChild(spanChevronLeft);
    
    //--- previous button onClick callback ---//
    $(btnPrev).on("click", function (event) {
    	event.preventDefault();
        $(".slide.slide-" + Slide.currentPosition).hide();
        Slide.currentPosition = Slide.currentPosition - 1;
        Slide.set();
    });
    
    //--- renders and append next button to web page ---//
    var btnNext = document.createElement("button");
    btnNext.type = "button";
    btnNext.id = "carousel-next";
    btnNext.className = "btn btn-default";
    divContainer.appendChild(btnNext);
    
    var spanChevronRight = document.createElement("span");
    spanChevronRight.className = "glyphicon glyphicon-chevron-right";
    btnNext.appendChild(spanChevronRight);
    
    //--- next button onClick callback ---//
    $(btnNext).on("click", function (event) {
    	event.preventDefault();
        $(".slide.slide-" + Slide.currentPosition).hide();
        Slide.currentPosition = Slide.currentPosition + 1;
        Slide.set();
    });
};
