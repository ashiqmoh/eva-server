//--- Displays directories listing in a table ---//
var DirectoriesTable = {};

DirectoriesTable.setup = function (path, json)
{
	if (json.length > 0)
	{
		DirectoriesTable.table(json);
	}
	else
	{
		//--- message indicates no directory listing for the given path ---//
		DirectoriesTable.message(path);
	}
};

DirectoriesTable.table = function (json)
{
	var divContent = document.getElementById("content");
	
	var divListGroup = document.createElement("div");
	divListGroup.className = "list-group";
	divContent.appendChild(divListGroup);
	
	//--- for each directory create a link ---//
	$.each(json, function (key, val)
	{
		var dirs = val.split(PATH_SEP);
		
		var a = document.createElement("a");
		a.className = "list-group-item";
		//--- converts path './Home/xxx/xxx/.. ' to '#/Home/xxx/xxx/.. '
		a.href = val.replace(".","#").toLowerCase();
		a.innerHTML = dirs[dirs.length - 1];
		//--- converts e.g. '2014-WS' to  'WS 2014/15' and '2014-SS' to ' SS 2014' ---//
		if (dirs.length === 4 && (dirs[2] === RESULTS_SECTION || dirs[2] === STAT_SECTION))
		{
			var name = dirs[dirs.length-1].split("-");
			var addYear = "";
			if (name[1] === "WS")
			{
				var nextYear = parseInt(name[0]) + 1;
				addYear = "/" + nextYear.toString().substring(2);
			}
			a.innerHTML = name[1] + " " + name[0] + addYear;
		}
		
		//--- required information for every link will be saved with attribute 'data' ---//
		$(a).data("path", val);
		$(a).data("section", dirs[2]);
		$(a).data("dirLevel", dirs.length);
		divListGroup.appendChild(a);
		
		//--- table item link on click listener ---//
		$(a).on("click", function (event)
		{
			event.preventDefault();
			var section = $(event.currentTarget).data("section");
			var dirLevel = $(event.currentTarget).data("dirLevel");
			var path = $(event.currentTarget).data("path");
			
			//--- AJAX call/request based on section ---//
			//--- History.push -> save browser state to enable browser back forth buttons navigation ---//
			if (section === HIERARCHIES_SECTION)
			{
				History.push("Hierarchies.get", path);
				Hierarchies.get(path);
			}
			else if (section === CODES_SECTION && dirLevel === 3)
			{
				History.push("Semesters.get", path);
				Semesters.get(path);
			}
			else if (section === QUESTIONNAIRE_SECTION)
			{
				History.push("Questionnaire.get", path);
				Questionnaire.get(path);
			}
			else if (section === RESULTS_SECTION && dirLevel === 7)
			{
				History.push("ResultsList.get", path);
				ResultsList.get(path);
			}
			else if (section === STAT_SECTION && dirLevel === 7)
			{
				History.push("Statistics.get", path);
				Statistics.get(path);
			}
			else if (section === USERS_SECTION)
			{
				History.push("Users.get", path);
				Users.get(path);
			}
			else
			{
				History.push("Directories.get", path);
				Directories.get(path);
			}
		});
	});
};

DirectoriesTable.message = function (path)
{
	var msg = "";
	var level = path.split(PATH_SEP).length;
	
	//--- message indication if a logged-in user has not been assigned with any role yet ---//
	//--- without role, user does not have access to any section ---//
	//--- main page + navigation bar will be empty ---//
	//--- level < 3 -> section ---//
	if (level < 3)
	{
		msg = "You haven't been assigned with any accesses yet. Please contact your organizer.";
	}
	else
	{
		var hierarchyItem = "";
		if (level === 3)
		{
			hierarchyItem = "Semester";
		}
		else if (level === 4)
		{
			hierarchyItem = "Fakultäten";
		}
		else if (level === 5)
		{
			hierarchyItem = "Studiengänge";
		}
		else if (level === 6)
		{
			hierarchyItem = "Lehrveranstaltungen";
		}
		msg = "Keine " + hierarchyItem + " sind in diesem Ordner gefunden.";
	}
	
	var divContent = document.getElementById("content");
	
	var pMessage = document.createElement("p");
	pMessage.className = "text-muted";
	pMessage.innerHTML = msg;
	divContent.appendChild(pMessage);
};
