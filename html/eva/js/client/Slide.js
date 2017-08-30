//--- render user interface - slides ---//
//--- slides contains questions and the respective answer options ---//
var Slide = {};

//--- static variables ---//
Slide.totalSlides = null;
Slide.currentPosition = null;

Slide.setup = function () {
    "use strict";
    Slide.currentPosition = 0; // starts with position 0
    Slide.first();
    Slide.questions();
    Slide.lastSlide();
    Slide.callbacks();
};

Slide.first = function () {
    "use strict";
    var divContainer = document.getElementById("main-container");
    
    var divSlide = document.createElement("div");
    divSlide.className = "slide slide-0";
    divContainer.appendChild(divSlide);
    
    var h3 = document.createElement("h3");
    h3.innerHTML = StaticText.get("h-start-welcome");
    divSlide.appendChild(h3);
    
    var hr = document.createElement("hr");
    divSlide.appendChild(hr);
    
	var dlHorizontal = document.createElement("dl");
	dlHorizontal.className = "dl-horizontal";
	divSlide.appendChild(dlHorizontal);
    
    var tag = ["Semester", "Fakultät", "Studiengang", "Veranstaltung", "Dozent/-in"];
    if (Login.language === "en") {
        tag = ["Semester", "Faculty", "Major", "Course", "Lecturer"];
    }
    var info = [];
    var dirs = Eva.path.split("/");
    var semester = dirs[3].split("-");
    var addYear = "";
    if (semester[1] === "WS")
    {
        var nextYear = parseInt(semester[0]) + 1;
        addYear = "/" + nextYear.toString().substring(2);
    }
    info[0] = semester[1] + " " + semester[0] + addYear;
    info[1] = dirs[4].split("-")[0].trim();
    info[2] = dirs[5].split("-")[0].trim();
    info[3] = dirs[6].split("-")[0].trim();
    info[4] = Eva.lecturer;
    
    for (var i = 0; i < info.length; i++) {
        var dt = document.createElement("dt");
        dt.innerHTML = tag[i];
        dlHorizontal.appendChild(dt);
        
        var dd = document.createElement("dd");
        dd.innerHTML = info[i];
        dlHorizontal.appendChild(dd);
    }
}

Slide.questions = function () {
    "use strict";
    var divContainer = document.getElementById("main-container");
    
    var i = 0;
    //--- for each header ---//
    $.each(Eva.questionnaire.categories, function (keyC, category) {
        var header = category.headerDE;
        //--- sets english header ---//
        if (Login.language === "en") {
            header = category.headerEN;
        }
        //--- for each question ---//
        $.each(category.questions, function (keyQ, question) {
        	//--- loads question and label in german language
            var paragraph = question.paragraphDE;
            var label = question.labelDE;
            //--- sets questions and label to english language
            if (Login.language === "en") {
                paragraph = question.paragraphEN;
                label = question.labelEN;
            }
            
            //--- renders slide with header, paragraph with radio button or textarea ---//
            var divSlide = document.createElement("div");
            divSlide.className = "slide slide-" + (i + 1);
            $(divSlide).hide();
            divContainer.appendChild(divSlide);
            
            var h3 = document.createElement("h3");
            h3.innerHTML = header;
            divSlide.appendChild(h3);
            
            var hr = document.createElement("hr");
            divSlide.appendChild(hr);
            
            var p = document.createElement("p");
            p.innerHTML = paragraph;
            divSlide.appendChild(p);
            
            //--- render answers option ---//
            //--- radio buttons if MCQ ---//
            //--- textarea for free-text-question ---//
            if (question.type === "radio") {
                for (var j = 0; j < 5; j++) {
                    var lbl = j + 1;
                    if (label[j].length > 0) {
                        lbl += " (" + label[j] + ")";
                    }
                    
                    var divRadio = document.createElement("div");
                    divRadio.id = i;
                    divRadio.className = "radio radio-" + i + " " + (j + 1);
                    $(divRadio).data("value", (j + 1).toString());
                    divRadio.innerHTML = lbl;
                    divSlide.appendChild(divRadio);
                }
            } else if (question.type === "text") {
                var textarea = document.createElement("textarea");
                textarea.id = i;
                textarea.className = "free-text";
                textarea.placeholder = StaticText.get("ta-ans-ph");
                divSlide.appendChild(textarea);
            }
            //--- initialize Eva.answers array with empty string "" ---//
            Eva.answers[i] = "";
            i++;
        });
    });
    //--- i counts slides containing question + 2 for  first slide (info) and last slide (submit) ---//
    Slide.totalSlides = i + 2;
};

//--- last slide will render a slide with submit button ---//
Slide.lastSlide = function () {
    "use strict";
    var lastSlidePosition = Slide.totalSlides - 1;
    
    var divContainer = document.getElementById("main-container");
    
    var divSlide = document.createElement("div");
    divSlide.className = "slide slide-" + lastSlidePosition;
    $(divSlide).hide();
    divContainer.appendChild(divSlide);
    
    var h3 = document.createElement("h3");
    h3.innerHTML = StaticText.get("h-save-close");
    divSlide.appendChild(h3);
    
    var hr = document.createElement("hr");
    divSlide.appendChild(hr);
    
    var p = document.createElement("p");
    p.innerHTML = StaticText.get("p-save");
    divSlide.appendChild(p);
    
    var button = document.createElement("button");
    button.type = "button";
    button.id = "btn-submit-eva";
    button.className = "btn btn-success btn-block";
    button.innerHTML = StaticText.get("btn-save");
    divSlide.appendChild(button);
    
    //--- submit button onClick event listener ---//
    $(button).on("click", function (event) {
        $(event.currentTarget).prop("disabled", true);
        Eva.submit();
    });
};

//--- initialize callbacks ---//
Slide.callbacks = function () {
    "use strict";
    //--- radio buttons on click ---//
    $(".radio").on("click", function (event) {
        event.preventDefault();
        if ($(event.currentTarget).hasClass("selected")) {
            $(event.currentTarget).removeClass("selected"); // uncheck radio button
            //--- stores answer in memory ---//
            Eva.answers[parseInt($(this).attr("id"))] = "";
        } else {
            $(event.currentTarget).addClass("selected");
            $(event.currentTarget).siblings().removeClass("selected"); // check radio button
            //--- stores answer in memory ---//
            Eva.answers[parseInt($(event.currentTarget).attr("id"))] = $(event.currentTarget).data("value");
        }
        //--- stores answer in local storage ---//
        localStorage.setItem(Login.code, JSON.stringify(Eva.answers));
    });
    //--- text area on key up ---//
    $(".free-text").on("keyup", function (event) {
    	//--- stores answers in memory
        Eva.answers[parseInt($(event.currentTarget).attr("id"))] = $(event.currentTarget).val();
        //--- stores answer in local storage ---//
        localStorage.setItem(Login.code, JSON.stringify(Eva.answers));
    });
};

Slide.set = function () {
    "use strict";
    $(".slide.slide-" + Slide.currentPosition).show();
    //--- hides previous button on first slide ---//
    if (Slide.currentPosition === 0) {
    	$("#carousel-prev").hide();
    } else {
    	$("#carousel-prev").show();
    }
    //--- hides next button on last slide ---//
    if (Slide.currentPosition === Slide.totalSlides - 1) {
        $("#carousel-next").hide();
    } else {
        $("#carousel-next").show();
    }
    //--- set progress bar based on current slide position ---//
    Progressbar.nanobar.go((Slide.currentPosition + 1) * Progressbar.move);
};
