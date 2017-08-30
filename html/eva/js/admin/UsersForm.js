//--- renders pop-up modal to add and update user ---//
var UsersForm = {};

UsersForm.isRendered = false;

UsersForm.setup = function ()
{
	var modalId = "users";
	
	Modal.setup(modalId);
	//--- modal consists of 4 input fields - firstname, lastname, username, email ---//
	Modal.input(modalId, "firstname", "Vorname", "text");
	Modal.input(modalId, "lastname", "Nachname", "text");
	Modal.input(modalId, "username", "Benutzername", "text");
	Modal.input(modalId, "email", "Email", "text");
	UsersForm.callback();
	UsersForm.isRendered = true;
};

UsersForm.callback = function ()
{
	//--- form onSubmit event listener ---//
	$("#form-users").on("submit", function (event)
	{
		event.preventDefault();
		//--- gets data from modal ---//
		var path = $(event.currentTarget).data("path");
		var key = $(event.currentTarget).data("key");
		var action = $(event.currentTarget).data("action");
		//--- AJAX request ---//
		Users.addOrModify(path, key, action);
	});
	
	//--- firstname input field key-up listener ---//
	$("#form-users-firstname").on("keyup", function ()
	{
		if ($("#form-users").data("action") === "new")
		{
			//--- auto filling username and email inputs ---//
			UsersForm.autoFillUsernameEmail();
		}
	});
	
	//--- lastname input field key-up listener ---//
	$("#form-users-lastname").on("keyup", function ()
	{
		if ($("#form-users").data("action") === "new")
		{
			//--- auto-filling username and email inputs ---//
			UsersForm.autoFillUsernameEmail();
		}
	});
};

UsersForm.autoFillUsernameEmail = function ()
{
	//--- converts german special chars to normal chars ---//
	var firstname = $("#form-users-firstname").val().trim().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("Ä", "ae").replace("Ö", "oe").replace("Ü", "ue").replace("ß", "ss").replace(" ", "-").toLowerCase();
	var lastname = $("#form-users-lastname").val().trim().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("Ä", "ae").replace("Ö", "oe").replace("Ü", "ue").replace("ß", "ss").replace(" ", "-").toLowerCase();
	if (firstname.length == 0 && lastname.length == 0)
	{
		//--- username for admin won't be changed ---//
		if ($("#form-users").data("key") !== "admin")
		{
			$("#form-users-username").val("");
		}
		$("#form-users-email").val("");
	}
	else
	{
		//--- username for admin won't be changed ---//
		if ($("#form-users").data("key") !== "admin")
		{
			$("#form-users-username").val(firstname + "." + lastname);
		}
		$("#form-users-email").val(firstname + "." + lastname + "@hs-furtwangen.de");
	}
};
