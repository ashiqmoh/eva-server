//--- manages login and user authentication process ---//
var USER;
var PWD;
var LOGGED_IN;

var Login = {};

Login.displayName = null;
Login.userEmail = null;
Login.accessInfo = null;
Login.isAdmin = null;
Login.isOrganizer = null;
Login.isTeacher = null;

Login.setup = function ()
{
	//--- try auto login by retrieving username password from storages ---//
	//--- retrieves USER and PWD from session storage if available ---//
	if (sessionStorage.getItem("authenticated") === "true")
	{
		USER = sessionStorage.getItem("user");
		PWD = sessionStorage.getItem("pwd");
		Login.authenticate();
	}
	//--- retrieves USER and PWD from local storage if available ---//
	else if (localStorage.getItem("authenticated") === "true")
	{
		USER = localStorage.getItem("user");
		PWD = localStorage.getItem("pwd");
		Login.authenticate();
	}
	//--- else renders login form ---//
	else
	{
		//--- get LoginForm.js from server ---//
		$.getScript("../js/admin/LoginForm.js", function ()
		{
			//--- after getting JS file, render login form ---//
			LoginForm.setup();
			Login.load();
			$("#form-signin-user").focus();
		});
	}
};

Login.load = function ()
{
	//--- loads username, password and checkbox values from local storage to input fields ---//
	if (localStorage.getItem("user") !== null)
	{
		$("input[name=user]").val(localStorage.getItem("user"));
	}
	if (localStorage.getItem("pwd") !== null)
	{
		$("input[name=pwd]").val(localStorage.getItem("pwd"));
	}
	if (localStorage.getItem("logged-in") === "true")
	{
		$('.logged-in').prop("checked", true);
	}
};

Login.store = function ()
{
	//--- stores username, password, stay logged-in preference to local storage ---//
	localStorage.setItem("user", USER);
	localStorage.setItem("pwd", PWD);
	localStorage.setItem("logged-in", "true");
};

Login.clear = function ()
{
	//--- clears local storage ---//
	localStorage.removeItem("user");
	localStorage.removeItem("pwd");
	localStorage.removeItem("logged-in");
	localStorage.removeItem("authenticated");
};

Login.authenticate = function ()
{
	//--- AJAX request for username password authentication ---//
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./auth",
		data:
		{
			user: USER,
			pwd: PWD
		},
		success: function (json)
		{
			//--- auth === true -> user authenticated (session storage) ---//
			sessionStorage.setItem("authenticated", "true");
			//--- if 'Angemeldet bleiben' checked -> auth === true (local storage) ---//
			if (localStorage.getItem("logged-in") === "true")
			{
				localStorage.setItem("authenticated", "true");
			}
			//--- reset static variables ---//
			Login.displayName = "";
			Login.userEmail = "";
			Login.accessInfo = [];
			Login.isAdmin = false;
			Login.isOrganizer = false;
			Login.isTeacher = false;
			
			if (json.user !== undefined)
			{
				//--- sets logged-in user's display name and email ---//
				Login.displayName = json.user.firstname + " " + json.user.lastname;
				Login.userEmail = json.user.email;
			}
			if (json.accessInfo !== undefined)
			{
				Login.accessInfo = json.accessInfo;
				$.each(json.accessInfo, function(key, val)
				{
					//--- if logged-in user is system administrator ---//
					if (val.role === "ADMINISTRATOR")
					{
						Login.isAdmin = true;
					}
					//--- if logged-in user is organizer ---//
					if (val.role === "ORGANIZER")
					{
						Login.isOrganizer = true;
					}
					if (val.role === "DEAN" || val.role === "DEAN_OF_STUDIES" || val.role === "LECTURER")
					{
						Login.isTeacher = true;
					}
				});
			}
			//--- loads JS files from server ---//
			for (var i = 0; i < json.javascripts.length; i++)
			{
				//--- if last JS files ---//
				if (i === json.javascripts.length - 1)
				{
					//--- execute following function after finish retrieving last JS file ---//
					$.getScript(json.javascripts[i], function ()
					{
						//--- initialize browser state storing-retrieving --//
						History.setup();
						LoginForm.remove();
						Dashboard.setup(json.dirList);
						//--- renders confirmatio dialog if role == 'ADMIN' || 'ORGANIZER' ---//
						if ((Login.isAdmin === true || Login.isOrganizer === true) && ConfirmationDialog.isRendered === false)
						{
							ConfirmationDialog.setup();
						}
						try
						{
							//--- tries to render same page, when user refreshes the browser ---//
							var urls = window.location.hash.split("&");
							var func = urls[1].split(".");
							var path = urls[0].replace("#",".");
							window[func[0]][func[1]](path);
						}
						catch (error)
						{
							//--- else render dashboard with home page ---//
							History.push("Directories.get", HOME_PATH);
							DirectoriesTable.setup(HOME_PATH, json.dirList);
						}
					});
				}
				else
				{
					//--- get JS file ---//
					$.getScript(json.javascripts[i]);
				}
			}
		},
		error: function (xhr)
		{
			//--- if username password authentication fails ---//
			//--- un-freeze all inputs ---//
			$("input[name=user]").prop("disabled", false);
			$("input[name=pwd]").prop("disabled", false);
			$(".logged-in").prop("disabled", false);
			$(".btn-signin").prop("disabled", false);
			
			if (xhr.status === 401 || xhr.status === 400)
			{
				//--- set auth == false in session storage ---//
				sessionStorage.setItem("authenticated", "false");
				if (localStorage.getItem("logged-in") === "true")
				{
					//--- set auth == false in local storage ---//
					localStorage.setItem("authenticated", "false");
					Login.load();
				}
				//--- shows error message (slide-down alert) ---//
				$("#alert-login-form-error").slideDown(500);
				//--- focus username input field ---//
				if ($("#form-signin-user").is(":focus") === false && $("#form-signin-pwd").is(":focus") === false)
				{
					$("#form-signin-user").focus();
				}
			}
		}
	});
};

Login.revoke = function ()
{
	//--- called when user logs-out ---//
	Dashboard.clearGlobalVar();
	sessionStorage.clear();
	if (localStorage.getItem("logged-in") === "true")
	{
		localStorage.setItem("authenticated", "false");
	}
	Dashboard.remove();
	LoginForm.setup();
	Login.load();
	$("#form-signin-user").focus();
};
