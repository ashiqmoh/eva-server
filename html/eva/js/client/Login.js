//--- manages code validation ---//
var Login = {};

//--- static variables ---//
//--- cache used code and language preference to memory ---//
Login.code = null;
Login.language = null;

Login.setup = function () {
    "use strict";
    Login.select();
    Login.callbacks();
    Login.code = window.location.hash.substring(1);
    if (Login.code.length > 0) {
    	Login.language = "de";
    	Login.store();
        Login.authenticate();
    } else {
        Login.load();
    }
};

Login.select = function () {
    "use strict";
    //--- native select on mobile device ---//
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $(".selectpicker").selectpicker("mobile");
    } else {
        $(".selectpicker").selectpicker();
    }
};

Login.callbacks = function () {
    "use strict";
    //--- code form on submit callback ---//
    $(".form-code").on("submit", function (event) {
        event.preventDefault();
        //--- stores user preference in memory ---//
        Login.language = $("select[name=lang]").val();
        //--- stores user code in memory ---//
        Login.code = $("input[name=code]").val().trim();
        //--- stores user code and language in local storage ---//
        Login.store();
        //--- form validation. shows error if code input is empty ---//
        if (Login.code.length === 0) {
            Login.error();
        } else {
            Login.authenticate();
        }
    });
    //--- language select callback ---//
    $("select[name=lang]").on("change", function () {
        Login.language = $("select[name=lang]").val();
        $(".form-code-heading").html(StaticText.get("h-form-code"));
        $(".btn-signin").html(StaticText.get("btn-signin"));
    });
    //--- code input key up callback ---//
    $("input[name=code]").on("keyup", function (event) {
    	//--- removes error label on key up ---//
        if (event.which !== 13 && $(".form-group").hasClass("has-error has-feedback")) {			
            $(".form-group").removeClass("has-error has-feedback");
        }
    });
    //--- x button in code input -> onClick callback ---//
    $(".glyphicon-remove").on("click", function () {
        $(".form-group").removeClass("has-error has-feedback");
        $("input[name=code]").val("");
        $("input[name=code]").focus();
    });
};

Login.load = function () {
    "use strict";
    //--- loads code and language preference if available ---//
    if (sessionStorage.getItem("user-code")) {
        $("input[name=code]").val(sessionStorage.getItem("user-code"));
    }
    if (sessionStorage.getItem("user-lang")) {
        $(".selectpicker").selectpicker("val", sessionStorage.getItem("user-lang"));
    }
};

Login.store = function () {
    "use strict";
    //--- stores code and language preference in session storage ---//
    sessionStorage.setItem("user-code", Login.code);
    sessionStorage.setItem("user-lang", Login.language);
};

Login.authenticate = function () {
    "use strict";
    // disables code input, language select, start button ---//
    $("input[name=code]").prop("disabled", true);
    $("select[name=lang]").prop("disabled", true);
    $("select[name=lang]").selectpicker("refresh");
    $(".btn-signin").prop("disabled", true);
    //--- ajax request to validate code ---//
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "./client/",
        data: {
            code: Login.code
        },
        success: function (json) {
            window.history.pushState("", document.title, window.location.pathname);
            Eva.path = json.path;
            Eva.lecturer = json.lecturer;
            Eva.questionnaire = json.questionnaire;
            //--- init Eva.answers as an empty array ---//
            Eva.answers = [];
            //--- removes login form ---//
            Login.remove();
            //--- setup slides, carousel, progress bar ---//
            Slide.setup();
            Carousel.setup();
            Progressbar.setup();
            Eva.setup();
            Slide.set();
        },
        error: function () {
        	//--- enables code input, language select, start button ---//
            $("input[name=code]").prop("disabled", false);
            $("select[name=lang]").prop("disabled", false);
            $("select[name=lang]").selectpicker("refresh");
            $(".btn-signin").prop("disabled", false);
            //--- shows error ---//
            window.history.pushState("", document.title, window.location.pathname);
            Login.error();
        }
    });
};

Login.error = function () {
    "use strict";
    //--- shows error ---//
    $(".form-group").addClass("has-error has-feedback");
    $("input[name=code]").val(Login.code);
    $("input[name=code]").focus();
};

Login.remove = function () {
    "use strict";
    //--- removes code form ---//
    $("#main-container").empty();
};
