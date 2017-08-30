var Hierarchies = {};

Hierarchies.json = null;
Hierarchies.totalItems = null;
Hierarchies.level = null;
Hierarchies.levelName = null;
Hierarchies.itemNames = null;
Hierarchies.editingItemName = null;

//--- gets hierarchy items for the given path ---//
Hierarchies.get = function (path)
{
	//--- if no users listing, fetch users listing first ---//
	//--- user listing required to display dean, organizer, dean of studies, lecturer names along with hierarchy item ---//
	if (Users.json === null)
	{
		$.ajax
		({
			type: "POST",
			dataType: "json",
			url: "./users/list",
			data:
			{
				user: USER,
				pwd: PWD,
				path: "./Home/Benutzer"
			},
			success: function (json)
			{
				Users.json = json;
				//--- if not system administrator, remove 'admin' from user listing ---//
				//--- organizers wont be able to view / update / remove user 'admin' ---//
				if (Login.isAdmin === false)
				{
					delete Users.json["admin"];
				}
				Users.usernames = Object.keys(Users.json);
				Hierarchies.continueGet(path);
			}
		});
	}
	else
	{
		Hierarchies.continueGet(path);
	}
};

//--- continuation of AJAX request to get hierarchy items ---//
Hierarchies.continueGet = function (path)
{
	if (HierarchiesForm.isRendered === false)
	{
		HierarchiesForm.setup();
	}
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./hierarchies/list",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path
		},
		success: function (json)
		{
			Hierarchies.set(json, path);
			Dashboard.reset(path);
			HierarchiesForm.reset();
			HierarchiesTable.setup(path);
		},
		error: function (xhr)
		{
			Dashboard.reset(path);
			Dashboard.displayError(xhr.status);
		}
	});
};

Hierarchies.set = function (json, path)
{
	//--- sets level name ('Fakultat', 'Studiengang' or 'Veranstaltung') ---//
	Hierarchies.json = json;
	Hierarchies.totalItems = json.length;
	Hierarchies.level = path.split(PATH_SEP).length;
	if (Hierarchies.level === 3)
	{
		Hierarchies.levelName = "Fakultät";
	}
	else if (Hierarchies.level === 4)
	{
		Hierarchies.levelName = "Studiengang";
	}
	else if (Hierarchies.level === 5)
	{
		Hierarchies.levelName = "Veranstaltung";
	}
};

//--- removes hierarchy item(s) from database ---//
Hierarchies.remove = function (path, paths)
{
	//--- freezes modal pop-up ---//
	Modal.loading("confirmation-dialog", "Löschen ...");
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./hierarchies/delete",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path,
			paths: paths
		},
		success: function (json)
		{
			//--- unfreeze modal pop-up ---//
			Modal.reset("confirmation-dialog");
			if (json.op === true)
			{
				Modal.hide("confirmation-dialog");
				Hierarchies.get(path);
			}
		},
		error: function ()
		{
			//--- unfreeze modal pop-up ---//
			Modal.reset("confirmation-dialog");
		}
	});
};

//--- adds or updates hierarchy items ---//
Hierarchies.addOrUpdate = function (path, oldFolderName, name, shortname, semester, accessAsJson, action)
{
	//--- customize freezing of modal pop-up
	if (action === "new")
	{
		Modal.loading("hierarchies", "Einf&#252;gen ...");
	}
	else if (action === "update")
	{
		Modal.loading("hierarchies", "Aktualisieren ...");
	}
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./hierarchies/" + action,
		data:
		{
			user: USER,
			pwd: PWD,
			path: path,
			oldFolderName: oldFolderName,
			name: name,
			shortname: shortname,
			semester: semester,
			accessAsJson: accessAsJson
		},
		success: function (json)
		{
			Modal.reset("hierarchies");
			if (json.op === true)
			{
				Modal.hide("hierarchies");
				Hierarchies.get(path);
			}
		},
		error: function ()
		{
			Modal.reset("hierarchies");
		}
	});
};
