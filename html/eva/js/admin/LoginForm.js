//--- renders login form ---//
var LoginForm = {};

LoginForm.setup = function ()
{
	//--- setups login form ---//
	LoginForm.header();
	LoginForm.alert();
	LoginForm.body();
	LoginForm.callbacks();
};

LoginForm.header = function ()
{
	//--- header ---//
	var divHeader = document.getElementById("header");
	divHeader.className = "header navbar navbar-inverse navbar-fixed-top";
	divHeader.setAttribute("role", "navigation");
	
	//--- header container ---//
	var divContainerFluid = document.createElement("div");
	divContainerFluid.className = "container-fluid";
	divHeader.appendChild(divContainerFluid);
	
	var divNavbarHeader = document.createElement("div");
	divNavbarHeader.className = "navbar-header";
	divContainerFluid.appendChild(divNavbarHeader);
	
	//--- optional button (3 bars) for small screen devices ---//
	var btnNavbarToggle = document.createElement("button");
	btnNavbarToggle.type = "button";
	btnNavbarToggle.className = "navbar-toggle";
	btnNavbarToggle.dataset.toggle = "collapse";
	btnNavbarToggle.dataset.target = ".navbar-collapse";
	divNavbarHeader.appendChild(btnNavbarToggle);
	
	var spanSrOnly = document.createElement("span");
	spanSrOnly.className = "sr-only";
	spanSrOnly.innerHTML = "Toggle navigation";
	btnNavbarToggle.appendChild(spanSrOnly);
	
	for (var i = 0; i < 3; i++)
	{
		var spanIconBar = document.createElement("span");
		spanIconBar.className = "icon-bar";
		btnNavbarToggle.appendChild(spanIconBar);
	}
	
	//--- hfu logo + app name ---//
	var aNavbarBrand = document.createElement("a");
	aNavbarBrand.className = "navbar-brand";
	aNavbarBrand.href = "/eva/admin";
	divNavbarHeader.appendChild(aNavbarBrand);
	
	//--- logo hover effect (color changes) ---//
	$(aNavbarBrand).hover(
		function (event)
		{
			$(event.currentTarget).find("img").attr("src", "../img/hfu_logo_white.png");
		},
		function (event)
		{
			if ($(event.currentTarget).is(":focus") === false)
			{
				$(event.currentTarget).find("img").attr("src", "../img/hfu_logo_gray.png"); 
			}
		}
	);
	
	//--- logo hover effect (color changes) ---//
	$(aNavbarBrand).focus(function (event) { $(event.currentTarget).find("img").attr("src", "../img/hfu_logo_white.png"); });
	$(aNavbarBrand).blur(function (event) { $(event.currentTarget).find("img").attr("src", "../img/hfu_logo_gray.png"); });
	
	//--- hfu logo src ---//
	var imgLogo = document.createElement("img");
	imgLogo.src = "../img/hfu_logo_gray.png";
	imgLogo.width = 30;
	imgLogo.height = 30;
	aNavbarBrand.appendChild(imgLogo);
	
	//--- app name 'Evaluation' ---//
	var brandName = document.createTextNode(" Evaluation");
	aNavbarBrand.appendChild(brandName);
};

LoginForm.alert = function ()
{
	//--- div main ---//
	var divMain = document.getElementById("main");
	
	//--- div container ---//
	var divContainer = document.createElement("div");
	divContainer.className = "container";
	divMain.appendChild(divContainer);
	
	//--- alert container ---//
	var divAlert = document.createElement("div");
	divAlert.id = "alert-login-form-error";
	divAlert.className = "alert alert-danger fade-in";
	divAlert.setAttribute("role", "alert");
	divContainer.appendChild(divAlert);
	
	//--- alert close button ---//
	var buttonClose = document.createElement("button");
	buttonClose.className = "close";
	buttonClose.setAttribute("data-hide", "alert");
	buttonClose.type = "button";
	divAlert.appendChild(buttonClose);
	
	//--- alert close button icon 'x' ---//
	var spanTimes = document.createElement("span");
	spanTimes.setAttribute("aria-hidden", "true");
	spanTimes.innerHTML = "&times;";
	buttonClose.appendChild(spanTimes);
	
	//--- alert close button label ---//
	var spanClose = document.createElement("span");
	spanClose.className = "sr-only";
	spanClose.innerHTML = "Close";
	buttonClose.appendChild(spanClose);
	
	//--- alert header ---//
	var h4AlertHeader = document.createElement("h4");
	h4AlertHeader.innerHTML = "Anmeldung Fehlgeschlagen";
	divAlert.appendChild(h4AlertHeader);
	
	//--- alert message ---//
	var pAlertMsg = document.createElement("p");
	pAlertMsg.innerHTML = "Bitte &#252;berprufen Sie Ihrer Benutzername und Passwort";
	divAlert.appendChild(pAlertMsg);
};

LoginForm.body = function ()
{
	//--- div main ---//
	var divMain = document.getElementById("main");
	divMain.className = "main";
	
	//--- div container ---//
	var divContainerFluid = document.createElement("div");
	divContainerFluid.className = "container-fluid";
	divMain.appendChild(divContainerFluid);
	
	//--- form signin ---//
	var formSignin = document.createElement("form");
	formSignin.id = "form-signin";
	formSignin.className = "form-signin";
	formSignin.setAttribute("role", "form");
	divContainerFluid.appendChild(formSignin);
	
	//--- form header 'Bitte Anmelden' ---//
	var formHeader = document.createElement("h2");
	formHeader.className = "form-signin-heading";
	formHeader.innerHTML = "Bitte Anmelden";
	formSignin.appendChild(formHeader);
	
	//--- input field 'Benutzename' ---//
	var inputUser = document.createElement("input");
	inputUser.type = "text";
	inputUser.id = "form-signin-user";
	inputUser.className = "form-control";
	inputUser.name = "user";
	inputUser.placeholder = "Benutzername";
	inputUser.autofocus = true;
	formSignin.appendChild(inputUser);
	
	//--- input field 'Passwort' ---//
	var inputPwd = document.createElement("input");
	inputPwd.type = "password";
	inputPwd.id = "form-signin-pwd";
	inputPwd.className = "form-control";
	inputPwd.name = "pwd";
	inputPwd.placeholder = "Passwort";
	formSignin.appendChild(inputPwd);
	
	//--- container 'Angemeldet bleiben' ---//
	var divCheckbox = document.createElement("div");
	divCheckbox.className = "checkbox";
	formSignin.appendChild(divCheckbox);
	
	//--- label 'Angemeldet bleiben' ---//
	var labelLoggedIn = document.createElement("label");
	divCheckbox.appendChild(labelLoggedIn);
	
	var checkboxLoggedIn = document.createElement("input");
	checkboxLoggedIn.type = "checkbox";
	checkboxLoggedIn.className = "logged-in";
	labelLoggedIn.appendChild(checkboxLoggedIn);
	
	var textLoggedIn = document.createTextNode(" Angemeldet bleiben");
	labelLoggedIn.appendChild(textLoggedIn);
	
	//--- link Passwort vergessen ---//
	var aForgotPassword = document.createElement("a");
	aForgotPassword.id = "forgot-password";
	aForgotPassword.style.cursor = "pointer";
	aForgotPassword.innerHTML = "Passwort vergessen?";
	formSignin.appendChild(aForgotPassword);
	
	//--- button 'Anmelden' ---//
	var buttonSignin = document.createElement("button");
	buttonSignin.className = "btn btn-lg btn-primary btn-block btn-signin";
	buttonSignin.style.marginTop = "10px";
	buttonSignin.type = "submit";
	buttonSignin.innerHTML = "Anmelden";
	formSignin.appendChild(buttonSignin);
};

LoginForm.callbacks = function ()
{
	//--- sign-in form on submit ---//
	$("#form-signin").on("submit", function (event)
	{
		event.preventDefault();
		$("input[name=user]").prop("disabled", true);
		$("input[name=pwd]").prop("disabled", true);
		$(".logged-in").prop("disabled", true);
		$(".btn-signin").prop("disabled", true);
		USER = $("input[name=user]").val();
		PWD = $("input[name=pwd]").val();
		sessionStorage.setItem("user", USER);
		sessionStorage.setItem("pwd", PWD);
		if ($(".logged-in").is(":checked") === true)
		{
			Login.store();
		}
		else
		{
			Login.clear();
		}
		Login.authenticate();
	});
	
	//--- hides error message with slide-up animation on: ---//
	//--- click alert close button 'x' ---//
	$("[data-hide]").on("click", function (event)
	{
		event.preventDefault();
		$(event.currentTarget).closest("." + $(event.currentTarget).attr("data-hide")).slideUp(400);
		$("#form-signin-user").focus();
	});
	
	//--- keyup input fields 'Benutzername' and 'Passwort' ---//
	$("#form-signin > input").on("keyup", function(event)
	{
		if (event.which !== 13)
		{
			$(".alert").slideUp(400);
		}
	});
	
	//--- click listener for the link 'Passwort vergessen' ---//
	$("#forgot-password").on("click", function (event)
	{
		event.preventDefault();
		LoginForm.remove();
		$.getScript("../js/admin/ForgotPasswordForm.js", function ()
		{
			ForgotPasswordForm.setup();
		});
	});
};

LoginForm.remove = function ()
{	
	//--- remove sign-in container on successful authentication ---//
	$("#header").empty();
	$("#main").empty();
};
