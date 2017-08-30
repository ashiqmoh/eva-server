//--- contains AJAX requests to get semester list from database ---//
//--- and function 'action' to add, update, remove semester ---//
var Semesters = {};

Semesters.json = null;
Semesters.currentSemester = null;
Semesters.searchBoxNames = null;
Semesters.editingSemesterName = null;

//--- gets semester listing from database ---//
Semesters.get = function (path)
{
	if (SemestersForm.isRendered === false)
	{
		SemestersForm.setup();
	}
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./semesters/list",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path
		},
		success: function (json)
		{
			//--- JSON string comes with semester listing ---//
			//--- at the end of array, info about currentSemester will be appended at server side ---//
			//--- so cache 'currentSemester' and delete it from semester listing before rendering the table ---//
			Semesters.currentSemester = json.currentSemester;
			delete json["currentSemester"];
			Semesters.json = json;
			Dashboard.reset(path);
			//--- renders semester table ---//
			SemestersTable.setup(path);
		}
	});
};

//--- action to add, update, delete semester ---//
Semesters.action = function (path, action, name, ssws, year, currentSemester)
{
	//--- freezes pop-up ---//
	if (action === "new")
	{
		Modal.loading("semesters", "Einf&#252;gen ...");
	}
	else if (action === "update")
	{
		Modal.loading("semesters", "Aktualisieren ...");
	}
	else if (action === "delete")
	{
		Modal.loading("confirmation-dialog", "Löschen ...");
	}
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./semesters/" + action,
		data:
		{
			user: USER,
			pwd: PWD,
			path: path,
			name: name,
			ssws: ssws,
			year: year,
			currentSemester: currentSemester
		},
		success: function(json)
		{
			if (action === "new" || action === "update")
			{
				//--- un-freeze pop-up modal ---//
				Modal.reset("semesters");
			}
			if (action === "delete")
			{
				Modal.reset("confirmation-dialog");
			}
			if (json.op === true)
			{
				Modal.hide("semesters");
				Modal.hide("confirmation-dialog");
				//--- AJAX request to latest semester listing and re-render semester table ---//
				Semesters.get(path, false);
			}
		},
		error: function(xhr, status, errorThrown)
		{
			if (action === "new" || action === "update")
			{
				Modal.reset("semesters");
			}
			if (action === "delete")
			{
				Modal.reset("confirmation-dialog");
			}
		}
	});
};
