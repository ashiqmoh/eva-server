//--- renders forgot password form ---//
var ForgotPasswordForm = {};

ForgotPasswordForm.setup = function ()
{
	ForgotPasswordForm.header();
	ForgotPasswordForm.alert();
	ForgotPasswordForm.body();
	ForgotPasswordForm.callbacks();
	$("#form-forgot-password-username").focus();
};

ForgotPasswordForm.header = function ()
{
	//--- header top ---//
	var divHeader = document.getElementById("header");
	divHeader.className = "header navbar navbar-inverse navbar-fixed-top";
	divHeader.setAttribute("role", "navigation");
	
	//--- header container fluid ---//
	var divContainerFluid = document.createElement("div");
	divContainerFluid.className = "container-fluid";
	divHeader.appendChild(divContainerFluid);
	
	var divNavbarHeader = document.createElement("div");
	divNavbarHeader.className = "navbar-header";
	divContainerFluid.appendChild(divNavbarHeader);
	
	//--- toggle button for small screen size device ---//
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
	
	//--- hfu logo hover effect ---//
	$(aNavbarBrand).hover(
		function (event) { $(event.currentTarget).find("img").attr("src", "../img/hfu_logo_white.png"); },
		function (event) { $(event.currentTarget).find("img").attr("src", "../img/hfu_logo_gray.png"); }
	);
	
	var imgLogo = document.createElement("img");
	imgLogo.src = "../img/hfu_logo_gray.png";
	imgLogo.width = 30;
	imgLogo.height = 30;
	aNavbarBrand.appendChild(imgLogo);
	
	var brandName = document.createTextNode(" Evaluation");
	aNavbarBrand.appendChild(brandName);
};

ForgotPasswordForm.alert = function ()
{
	//--- div main ---//
	var divMain = document.getElementById("main");
	
	//--- div container ---//
	var divContainer = document.createElement("div");
	divContainer.className = "container";
	divMain.appendChild(divContainer);
	
	//--- alert container ---//
	var divAlert = document.createElement("div");
	divAlert.id = "alert-forgot-password-error";
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
	h4AlertHeader.innerHTML = "Benutzername Fehler";
	divAlert.appendChild(h4AlertHeader);
	
	//--- alert message ---//
	var pAlertMsg = document.createElement("p");
	pAlertMsg.innerHTML = "Bitte &#252;berprufen Sie Ihrer Benutzername";
	divAlert.appendChild(pAlertMsg);
};

ForgotPasswordForm.body = function ()
{
	var divMain = document.getElementById("main");
	
	//--- div container fluid ---//
	var divContainerFluid = document.createElement("div");
	divContainerFluid.className = "container-fluid";
	divMain.appendChild(divContainerFluid);
	
	//--- form forgot password ---//
	var form = document.createElement("form");
	form.id = "form-forgot-password";
	form.className = "form-signin";
	form.setAttribute("role", "form");
	divContainerFluid.appendChild(form);
	
	//--- form header 'Passwort vergessen' ---//
	var formHeader = document.createElement("h2");
	formHeader.className = "form-header";
	formHeader.innerHTML = "Passwort vergessen";
	form.appendChild(formHeader);
	
	//--- message ---//
	var pMessage = document.createElement("p");
	pMessage.innerHTML = "Geben Sie die Benutzername an. Die Password wird an ihrer HFU Email gesendet.";
	form.appendChild(pMessage);
	
	//--- input field 'Benutzename' ---//
	var inputUsername = document.createElement("input");
	inputUsername.className = "form-control";
	inputUsername.id = "form-forgot-password-username";
	inputUsername.placeholder = "Benutzername";
	inputUsername.autofocus = true;
	form.appendChild(inputUsername);
	
	//--- button 'Weiter' ---//
	var buttonContinue = document.createElement("button");
	buttonContinue.className = "btn btn-lg btn-primary btn-block";
	buttonContinue.style.marginTop = "10px";
	buttonContinue.type = "submit";
	buttonContinue.innerHTML = "Weiter";
	form.appendChild(buttonContinue);
};

ForgotPasswordForm.callbacks = function ()
{
	//--- submits forgot-password-form to server with parameter username ---//
	$("#form-forgot-password").on("submit", function (event)
	{
		event.preventDefault();
		//--- disable username field while ajaxing ---//
		$("#form-forgot-password-username").prop("disabled", true);
		$.ajax
		({
			type: "POST",
			dataType: "json",
			url: "./forgotPassword",
			data:
			{
				user: $("#form-forgot-password-username").val(),
			},
			success: function (json)
			{
				$("#form-forgot-password-username").prop("disabled", false);
				if (json.success === true)
				{
					//--- executed on successful password recovery ---//
					ForgotPasswordForm.remove();
					ForgotPasswordForm.successMessage();
					LoginForm.setup();
					//--- shows success message alert ---//
					$("#alert-forgot-password-success").slideDown(500);
				}
				else
				{
					//--- executed if username not found in the database ---//
					$("#alert-forgot-password-error").slideDown(500);
					$("#form-forgot-password-username").focus();
				}
			},
			error: function (xhr)
			{
				$("#form-forgot-password-username").prop("disabled", false);
				if (xhr.status === 400)
				{
					//--- executed if username field empty ---//
					$("#alert-forgot-password-error").slideDown(500);
					if ($("#form-forgot-password-username").is(":focus") === false)
					{
						$("#form-forgot-password-username").focus();
					}
				}
			}
		});
	});
	
	//--- hides error message with slide-up animation on: ---//
	//--- click alert close button 'x' ---//
	$("[data-hide]").on("click", function (event)
	{
		event.preventDefault();
		$(event.currentTarget).closest("." + $(event.currentTarget).attr("data-hide")).slideUp(400);
		$("#form-forgot-password-username").focus();
	});
	
	//--- keyup input fields 'Benutzername'---//
	$("#form-forgot-password > input").on("keyup", function(event)
	{
		if (event.which !== 13)
		{
			$("#alert-forgot-password-error").slideUp(400);
		}
	});
};

ForgotPasswordForm.remove = function ()
{	
	//--- removes forgot password form ui ---//
	$("#header").empty();
	$("#main").empty();
};

ForgotPasswordForm.successMessage = function ()
{
	//--- success alert message shown if email is sent ---//
	
	//--- div main ---//
	var divMain = document.getElementById("main");
	
	//--- div container ---//
	var divContainer = document.createElement("div");
	divContainer.className = "container";
	divMain.appendChild(divContainer);
	
	//--- alert container ---//
	var divAlert = document.createElement("div");
	divAlert.id = "alert-forgot-password-success";
	divAlert.className = "alert alert-success fade-in";
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
	
	//--- success message ---//
	var pAlertMsg = document.createElement("p");
	pAlertMsg.innerHTML = "Email sent. You will receive it shortly.";
	divAlert.appendChild(pAlertMsg);
};
