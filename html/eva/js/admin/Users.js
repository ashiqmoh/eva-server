//--- contains AJAX requests to get users listing from database ---//
//--- + adding, updating and removing user ---//
var Users = {};

Users.json = null;
Users.usernames = null;
Users.editingUsername = null;

//--- get users list from database ---//
Users.get = function (path)
{
	if (UsersForm.isRendered === false)
	{
		UsersForm.setup();
	}
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./users/list",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path
		},
		success: function (json)
		{
			Users.json = json;
			//--- deletes admin from user listing if logged-in user is not system administrator ---//
			if (Login.isAdmin === false)
			{
				delete Users.json["admin"];
			}
			Users.usernames = Object.keys(Users.json);
			
			Dashboard.reset(path);
			//--- renders user table ---//
			UsersTable.setup(path, json);
			if (HierarchiesForm.isRendered === true)
			{
				//--- reset select options in hierarchy form to choose organizer, dean, dean of studies and lecturer ---//
				HierarchiesForm.resetSelect();
			}
		},
		error: function (xhr)
		{
			Dashboard.reset(path);
			Dashboard.displayError(xhr.status);
		}
	});
};

//--- called from usersList.deleteButton() ---//
Users.remove = function (path, usernamesAsJson)
{
	Modal.loading("confirmation-dialog", "Löschen ...");
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./users/delete",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path,
			usernames: usernamesAsJson
		},
		success: function (json)
		{
			Modal.reset("confirmation-dialog");
			if (json.op === true)
			{
				Modal.hide("confirmation-dialog");
				Users.get(path, false);
			}
		},
		error: function ()
		{
			Modal.reset("confirmation-dialog");
		}
	});
};

//--- AJAX request to add and modify an existing user ---//
//--- @param: key = username; action = {new, update} ---//
Users.addOrModify = function (path, key, action)
{
	//--- get data from modal ---//
	var username = $("#form-users-username").val().trim();
	var firstname = $("#form-users-firstname").val().trim();
	var lastname = $("#form-users-lastname").val().trim();
	var email = $("#form-users-email").val().trim();
	
	//--- validations ---//
	var hasErrorUsername = Validation.isEmpty("users", "username", username, null);
	if (hasErrorUsername === false)
	{
		hasErrorUsername = Validation.disallowedChar("users", "username", username, true, null);
	}
	if (hasErrorUsername === false)
	{
		hasErrorUsername = Users.checkDuplication(action, username);
	}
	var hasErrorFirstname = Validation.isEmpty("users", "firstname", firstname, null);
	var hasErrorLastname = Validation.isEmpty("users", "lastname", lastname, null);
	var hasErrorEmail = Validation.isEmpty("users", "email", email, null);
	if (hasErrorEmail === false)
	{
		var regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
		var msg = "Die eingegebene E-mail ist ungültig";
		hasErrorEmail = Validation.regex("users", "email", email, regex, msg);
	}
	
	if (hasErrorUsername === false && hasErrorFirstname === false && hasErrorLastname === false && hasErrorEmail === false)
	{
		if (action === "new")
		{
			Modal.loading("users", "Einfügen...");
		}
		else if (action === "update")
		{
			Modal.loading("users", "Aktualisieren");
		}
		$.ajax
		({
			type: "POST",
			dataType: "json",
			url: "./users/" + action,
			data:
			{
				user: USER,
				pwd: PWD,
				path: path,
				key: key,
				username: username,
				firstname: firstname,
				lastname: lastname,
				email: email
			},
			success: function (json)
			{
				Modal.reset("users");
				if (action === "update" && key === USER)
				{
					USER = username;
				}
				if (json.op === true)
				{
					Modal.hide("users");
					Users.get(path, false);
				}
			},
			error: function ()
			{
				Modal.reset("users");
			}
		});
	}
	else
	{
		if (hasErrorFirstname === true)
		{
			$("#form-users-firstname").focus();
		}
		else if (hasErrorLastname === true)
		{
			$("#form-users-lastname").focus();
		}
		else if (hasErrorUsername === true)
		{
			$("#form-users-username").focus();
		}
		else if (hasErrorEmail === true)
		{
			$("#form-users-email").focus();
		}
	}
};

Users.checkDuplication = function (action, username)
{
	//--- checks username duplication ---//
	if ($.inArray(username, Users.usernames) !== -1 && (action === "new" || (action === "update" && username !== Users.editingUsername)))
	{
		$(".help-block.form-users.username").html("Benutzername existiert. Bitte geben Sie andere Benutzername ein");
		$("#form-users-username").parent().addClass("has-error has-feedback");
		$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-users feedback-icon username"}).insertAfter("#form-users-username");
		$(".help-block.form-users.username").css("display", "block");
		return true;
	}
	return false;
};
