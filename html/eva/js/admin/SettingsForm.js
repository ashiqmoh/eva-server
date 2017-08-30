//--- renders pop-up modal to change password ---//
//--- for all user ---//
var SettingsForm = {};

SettingsForm.isRendered = false;

SettingsForm.setup = function ()
{
	var modalId = "settings";	
	
	Modal.setup(modalId);
	//--- modal consists of three text input fields ---//
	Modal.input(modalId, "currentPassword", "Aktuelles Passwort *", "password");
	Modal.input(modalId, "newPassword", "Neue Passwort *", "password");
	Modal.input(modalId, "newPasswordRepeat", "Neue Passwort wiederholen *", "password");
	SettingsForm.callback();
	SettingsForm.isRendered = true;
};

SettingsForm.callback = function ()
{
	//--- form on submit event listenr ---//
	$("#form-settings").on("submit", function (event)
	{
		event.preventDefault();
		
		//--- gets all data and fields input from modal ---//
		var path = $(event.currentTarget).data("path");
		
		var currentPassword = $("#form-settings-currentPassword").val().trim();
		var newPassword = $("#form-settings-newPassword").val().trim();
		var newPasswordRepeat = $("#form-settings-newPasswordRepeat").val().trim();
		
		//--- form validation ---//
		var hasErrorCurrentPwd = Validation.isEmpty("settings", "currentPassword", currentPassword, null);
		var hasErrorNewPwd = Validation.isEmpty("settings", "newPassword", newPassword, null);
		var hasErrorNewPwdRepeat = Validation.isEmpty("settings", "newPasswordRepeat", newPasswordRepeat, null);
		
		if (hasErrorCurrentPwd === false)
		{
			hasErrorCurrentPwd = Validation.isNotEqual("settings", "currentPassword", currentPassword, PWD, null);
		}
		if (hasErrorNewPwd === false)
		{
			hasErrorNewPwd= Validation.length("settings", "newPassword", newPassword, 8, null, null);
		}
		if (hasErrorNewPwd === false && hasErrorNewPwdRepeat === false)
		{
			hasErrorNewPwdRepeat = Validation.isNotEqual("settings", "newPasswordRepeat", newPasswordRepeat, newPassword, null);
		}
		if (hasErrorCurrentPwd === false && hasErrorNewPwd === false && hasErrorNewPwdRepeat === false)
		{
			//--- freezes the pop-up modal for AJAX ---//
			Modal.loading("settings", "Ändern ...");
			//--- AJAX request to change password ---//
			$.ajax
			({
				type: "POST",
				dataType: "json",
				url: "./changePassword",
				data:
				{
					user: USER,
					pwd: PWD,
					newPassword: newPassword,
					newPasswordRepeat: newPasswordRepeat
				},
				success: function (json)
				{
					//--- unfreezes modal ---//
					Modal.reset("settings");
					if (json.op === true)
					{
						Modal.hide("settings");
						//--- if success, change the cached 'PWD' to newPassword in memory, sessionStorage and localStorage ---//
						PWD = newPassword;
						sessionStorage.setItem("pwd", PWD);
						if (localStorage.getItem("logged-in") === "true")
						{
							localStorage.setItem("pwd", PWD);
						}
					}
				},
				error: function ()
				{
					Modal.reset("settings");
				}
			});
		}
		else
		{
			//--- if form validation fails ---//
			if (hasErrorCurrentPwd === true)
			{
				$("#form-setttings-currentPassword").focus();
			}
			else if (hasErrorNewPwd === true)
			{
				$("#form-settings-newPassword").focus();
			}
			else if (hasErrorNewPwdRepeat === true)
			{
				$("#form-settings-newPasswordRepeat").focus();
			}
		}
	});
};
