//--- manages evaluation answers ---//
//--- saving, retrieving to and from from localStorage ---//
//--- submit answers to server via ajax ---//
var Eva = {};

Eva.path = null;
Eva.lecturer = null;
Eva.questionnaire = null;
Eva.answers = null;

Eva.setup = function () {
    "use strict";
    Eva.header();
    Eva.loadAnswers();
};

Eva.header = function () {
    "use strict";
    //--- prevent onclick callback on brand logo, which will take to home ---//
    $(".navbar-brand").on("click", function (event) {
        event.preventDefault();
    });
};

Eva.loadAnswers = function () {
    "use strict";
    //--- loads answers from local storage if available ---//
    if (localStorage.getItem(Login.code)) {
        Eva.answers = JSON.parse(localStorage.getItem(Login.code));
        for (var i = 0; i < Eva.answers.length; i++) {
            var element = $("#" + i);
            if (element.is("textarea")) {
            	//--- fills the textarea with the answer ---//
                element.val(Eva.answers[i]);
            } else {
            	//--- selects the respective radio button ---///
                if (Eva.answers[i].length > 0) {
                    $(".radio.radio-" + i + "." + Eva.answers[i]).addClass("selected");
                }
            }
        }
    }
};

Eva.submit = function () {
    "use strict";
    //--- ajax request to submit evaluation answers to server ---//
    $.ajax ({
        type: "POST",
        dataType: "json",
        url: "./client/submit",
        data: {
            code: Login.code,
            result: JSON.stringify(Eva.answers)
        },
        success: function (json) {
        	//--- enables submit button ---//
            $("#btn-submit-eva").prop("disabled", false);
            //--- shows exit message ---//
            if (json.isStored === true) {
                Eva.exit();
            } else {
            	//--- shows error if answer is not stored ---//
                Eva.error();
            }
        },
        error: function () {
        	//--- shows error if ajax request fails ---//
            $("#btn-submit-eva").prop("disabled", false);
            Eva.error();
        }
    });
};

Eva.error = function () {
    "use strict";
    //--- shows error message ---//
    var lastSlidePosition = Slide.totalSlides - 1;
    var pError = document.createElement("p");
    pError.className = "text-danger";
    pError.innerHTML = StaticText.get("p-error");
    pError.style.marginTop = "20px";
    $(".slide.slide-" + lastSlidePosition).append(pError);
};

Eva.exit = function () {
    "use strict";
    //--- set progress bar to 100 (full) ---//
    Progressbar.nanobar.go(100);
    
    //--- removes all the child nodes (slides) of main-container ---//
    $("#main-container").empty();
    
    //--- shows thanks and exit message ---//
    var divMainContainer = document.getElementById("main-container");
    
    var divSlide = document.createElement("div");
    divSlide.className = "slide";
    divMainContainer.appendChild(divSlide);
    
    var h3 = document.createElement("h3");
    h3.innerHTML = StaticText.get("h-success");
    divSlide.appendChild(h3);
    
    var hr = document.createElement("hr");
    divSlide.appendChild(hr);
    
    var p = document.createElement("p");
    p.innerHTML = StaticText.get("p-success");
    divSlide.appendChild(p);
    
    //--- enables the brand logo onClick callback again ---//
    $(".navbar-brand").unbind("click");
    
    //--- clears local storage, session storage, static variables ---//
    localStorage.removeItem(Login.code);
    sessionStorage.clear();
    Login.code = null;
    Login.language = null;
    Eva.questionnaire = null;
    Eva.answers = null;
    Slide.totalSlides = null;
    Slide.currentSlide = null;
    Progressbar.nanobar = null;
    Progressbar.move = null;
};
