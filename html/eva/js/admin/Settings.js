//--- 
var Settings = {};

Settings.setup = function (path)
{
	Dashboard.reset(path);
	if (SettingsForm.isRendered === false)
	{
		SettingsForm.setup();
	}
	//--- displays error if path is wrong ---//
	var dirs = path.split("/");
	var name = dirs[dirs.length - 1];
	if (dirs.length > 3)
	{
		Dashboard.displayError(404);
		return;
	}
	//--- displays error if display name from @param path does not match logged-in user's display name ---//
	if (dirs.length < 3 || name !== Login.displayName)
	{
		Dashboard.displayError(401);
		return;
	}
	//--- renders buttons ---//
	Settings.buttons(path);
	//--- renders access info ---//
	Settings.accessInfo();
};

Settings.buttons = function (path)
{
	var divContent = document.getElementById("content");
	
	var divBtnCon = document.createElement("div");
	divBtnCon.className = "btn-container";
	divContent.appendChild(divBtnCon);
	
	//--- button 'Password Andern' ---//
	var btn = document.createElement("button");
	btn.className = "btn btn-primary btn-action";
	btn.innerHTML = "<b>Passwort ändern</b>";
	//--- toggles open the 'SettingsForm' ---//
	btn.dataset.toggle = "modal";
	btn.dataset.target = "#modal-settings";
	$(btn).data("path", path);
	$(btn).on("click", function (event)
	{
		var path = $(event.currentTarget).data("path");
		$("#modal-title-settings").html("Passwort ändern");
		//--- resets all input fields value to empty string ---//
		$("#form-settings-currentPassword").val("");
		$("#form-settings-newPassword").val("");
		$("#form-settings-newPasswordRepeat").val("");
		$("#btn-submit-settings").html("Ändern");
		$("#form-settings").data("path", path);
	});
	divBtnCon.appendChild(btn);
	
	//--- if logged-in user === system administrator -> add button 'Re-Cache' ---//
	if (Login.isAdmin === true)
	{
		var btnRecache = document.createElement("button");
		btnRecache.className = "btn btn-danger btn-action";
		btnRecache.innerHTML = "<span class=\"glyphicon glyphicon-refresh\"></span> <b>Re-Cache</b>";
		btnRecache.dataset.toggle = "modal";
		btnRecache.dataset.target = "#modal-confirmation-dialog";
		divBtnCon.appendChild(btnRecache);
		
		$(btnRecache).on("click", function (event)
		{
			event.preventDefault();
			$("#modal-title-confirmation-dialog").html("Re-Cache?");
			$("#btn-submit-confirmation-dialog").html("Re-Cache");
			$("#btn-submit-confirmation-dialog").unbind("click");
			$("#btn-submit-confirmation-dialog").on("click", function ()
			{
				Settings.recache();
			});
		});
	}
};

Settings.accessInfo = function ()
{
	var content = document.getElementById("content");
	
	//--- header 'Access Info' ---//
	var h4 = document.createElement("h4");
	h4.innerHTML = "Access Info";
	content.appendChild(h4);
	
	var hr = document.createElement("hr");
	content.appendChild(hr);
	
	var dlHorizontal = document.createElement("dl");
	dlHorizontal.className = "dl-horizontal";
	content.appendChild(dlHorizontal);
	
	if (Login.accessInfo.length === 0)
	{
		var divContent = document.getElementById("content");
		
		//--- message indicating the logged-in has not been assigned with any role yet ---//
		var pMessage = document.createElement("p");
		pMessage.className = "text-muted";
		pMessage.innerHTML = "You haven't been assigned with any accesses yet. Please contact your orgnizer."
		divContent.appendChild(pMessage);
	}
	else
	{
		//--- lists down all roles with corresponding path access of the logged-in user ---//
		$.each(Login.accessInfo, function (key, val)
		{
			var role = "";
			if (val.role === "DEAN")
			{
				role = "Dekan";
			}
			else if (val.role === "DEAN_OF_STUDIES")
			{
				role = "Studiendekan";
			}
			else if (val.role === "LECTURER")
			{
				role = "Dozent/-in";
			}
			else if (val.role === "ORGANIZER")
			{
				role = "Organizator";
			}
			else if (val.role === "ADMINISTRATOR")
			{
				role = "Administrator";
			}
			
			var relPath = val.relPath.split("/").join(" / ");
			
			var dt = document.createElement("dt");
			dt.innerHTML = role;
			dlHorizontal.appendChild(dt);
			
			var dd = document.createElement("dd");
			dd.innerHTML = relPath;
			dlHorizontal.appendChild(dd);
		});
	}
};

Settings.recache = function ()
{
	//--- AJAX request to recache all HashMap on server side ---//
	//--- only for system administrator ---//
	Modal.loading("confirmation-dialog", "Re-Cache ...");
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./recache",
		data:
		{
			user: USER,
			pwd: PWD
		},
		success: function (json)
		{
			Modal.reset("confirmation-dialog");
			if (json.op === true)
			{
				Modal.hide("confirmation-dialog");
			}
		},
		error: function ()
		{
			Modal.reset("confirmation-dialog");
		}
	});
};
