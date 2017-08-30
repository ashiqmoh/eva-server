//--- renders modal pop-up for adding and updating hierarchy items ---//
//--- hierarchy item refers faculty, major and course ---//
var HierarchiesForm = {};

HierarchiesForm.isRendered = false;

HierarchiesForm.setup = function ()
{
	var modalId = "hierarchies";
	Modal.setup(modalId);
	//--- hierarchy modal has inputs - name, shortname (all) ---//
	//--- dean and organizer (faculty) ---//
	//--- dean of studies (major) ---//
	//--- semester and lecturer (course) ---//
	Modal.input(modalId, "name", "Name", "text");
	Modal.input(modalId, "shortname", "Abkurzung", "text");
	Modal.input(modalId, "semester", "Semester", "text");
	//--- creates select html element with empty children, later children will be appended ---//
	Modal.select(modalId, "dean", "Dekan", true, [], "");
	Modal.select(modalId, "organizer", "Organizator", true, [], "");
	Modal.select(modalId, "deanstudies", "Studieandekan", true, [], "");
	Modal.select(modalId, "lecturer", "Dozent/-in", true, [], "");
	HierarchiesForm.callback();
	//--- select elements lists all users' lastname and firstname from user database ---//
	HierarchiesForm.resetSelect();
	HierarchiesForm.isRendered = true;
};

HierarchiesForm.callback = function ()
{
	$("#form-hierarchies").on("submit", function (event)
	{
		event.preventDefault();
		//--- removes error messages + 'X' icon from modal ---//
		Modal.removeError("hierarchies");
		
		//--- retrieve input data from modal ---//
		var path = $(event.currentTarget).data("path");
		var oldFolderName = $(event.currentTarget).data("oldFolderName");
		var action = $(event.currentTarget).data("action");
		
		var name = $("#form-hierarchies-name").val().trim();
		var shortname = $("#form-hierarchies-shortname").val().trim();
		var access = {}
		
		//--- form validation ---//
		var hasErrorSemester = false;
		var hasErrorAccess = true;
		
		//--- name validation ---//
		var hasErrorName = Validation.isEmpty("hierarchies", "name", name, null);
		if (hasErrorName === false)
		{
			hasErrorName = Validation.disallowedChar("hierarchies", "name", name, false, null);
		}
		
		//--- shortname validation ---//
		var hasErrorShortname = Validation.isEmpty("hierarchies", "shortname", shortname, null);
		if (hasErrorShortname === false)
		{
			hasErrorShortname = Validation.disallowedChar("hierarchies", "shortname", shortname, false, null);
		}
		
		//--- duplicate validation ---//
		var isDuplicate = true;
		if (hasErrorName === false && hasErrorShortname === false)
		{
			isDuplicate = HierarchiesForm.duplicateValidation(name, shortname, action);
		}
		
		//--- level 3 -> faculty, level 4 -> major, level 5 -> course ---//
		//--- array access[] consists of key-pair values with role-username ---//
		if (Hierarchies.level === 3)
		{
			var dean = $("#form-hierarchies-dean").val();
			var hasErrorDean = Validation.isSelectEmpty("hierarchies", "dean", dean, null);
			access["DEAN"] = dean;
			
			var organizer = $("#form-hierarchies-organizer").val();
			var hasErrorOrganizer = Validation.isSelectEmpty("hierarchies", "organizer", organizer, null);
			access["ORGANIZER"] = organizer;
			
			if (hasErrorDean === false && hasErrorOrganizer === false)
			{
				hasErrorAccess = false;
			}
		}
		if (Hierarchies.level === 4)
		{
			var deanOfStudies = $("#form-hierarchies-deanstudies").val();
			hasErrorAccess = Validation.isSelectEmpty("hierarchies", "deanstudies", deanOfStudies, null);
			access["DEAN_OF_STUDIES"] = deanOfStudies;
		}
		if (Hierarchies.level === 5)
		{
			//--- semester validation -> must be a number between 1 and 9 ---//
			var semester = $("#form-hierarchies-semester").val().trim();
			var regex = /^[1-9]{1}$/;
			hasErrorSemester = Validation.isEmpty("hierarchies", "semester", semester, null);
			if (hasErrorSemester === false)
			{
				hasErrorSemester = Validation.regex("hierarchies", "semester", semester, regex, "Bitte geben Sie ein Zahl zwischen 1 und 9 ein");
			}
			
			var lecturer = $("#form-hierarchies-lecturer").val();
			hasErrorAccess = Validation.isSelectEmpty("hierarchies", "lecturer", lecturer, null);
			access["LECTURER"] = lecturer;
		}
		if (isDuplicate === false && hasErrorSemester === false && hasErrorAccess === false)
		{
			//--- converts array to JSON string ---//
			var accessAsJson = JSON.stringify(access);
			//--- AJAX request to add or update a hierarchy item ---//
			Hierarchies.addOrUpdate(path, oldFolderName, name, shortname, semester, accessAsJson, action);
		}
		else if (hasErrorName === true)
		{
			$("#form-hierarchies-name").focus();
		}
		else if (hasErrorShortname === true)
		{
			$("#form-hierarchies-shortname").focus();
		}
		else if (hasErrorSemester === true)
		{
			$("#form-hierarchies-semester").focus()
		}
	});
};

HierarchiesForm.duplicateValidation = function(name, shortname, action)
{
	//--- hierarchy item duplicate validation ---//
	var pathname = name + " - " + shortname;
	if ($.inArray(pathname, Hierarchies.itemNames) !== -1 && (action === "new" || (action === "update" && pathname !== Hierarchies.editingItemName)))
	{
		$(".help-block.form-hierarchies.name").html("Name existiert. Bitte geben Sie neue Name ein"); // sets error message
		$("#form-hierarchies-name").parent().addClass("has-error has-feedback"); // additional css
		$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-hierarchies feedback-icon name"}).insertAfter("#form-hierarchies-name"); // X icon at the end of input field
		$(".help-block.form-hierarchies.name").css("display", "block"); // displays error message
		
		$(".help-block.form-hierarchies.shortname").html("Abkurzung existiert. Bitte geben Sie neue Abkurzung ein");
		$("#form-hierarchies-shortname").parent().addClass("has-error has-feedback");
		$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-hierarchies feedback-icon shortname"}).insertAfter("#form-hierarchies-shortname");
		$(".help-block.form-hierarchies.shortname").css("display", "block");
		
		return true;
	}
	return false;
};

HierarchiesForm.resetSelect = function ()
{
	//--- loads all users' name to select elements ---//
	
	//--- get select elements ---//
	var selectDean = document.getElementById("form-hierarchies-dean");
	var selectOrganizer = document.getElementById("form-hierarchies-organizer");
	var selectDeanStudies = document.getElementById("form-hierarchies-deanstudies");
	var selectLecturer = document.getElementById("form-hierarchies-lecturer");
	
	//--- empty select elements ---//
	selectDean.innerHTML = "";
	selectOrganizer.innerHTML = "";
	selectDeanStudies.innerHTML = "";
	selectLecturer.innerHTML = "";
	
	//--- load select elements ---//
	$.each(Users.json, function (key, val)
	{
		//--- skips admin from user list ---//
		//--- admin cannot be an organizer, dean, dean of studies or lecturer ---//
		if (key === "admin")
		{
			return true; // continue
		}
		selectDean.options[selectDean.options.length] = new Option(val.lastname + ", " + val.firstname, key);
		selectOrganizer.options[selectOrganizer.options.length] = new Option(val.lastname + ", " + val.firstname, key);
		selectDeanStudies.options[selectDeanStudies.options.length] = new Option(val.lastname + ", " + val.firstname, key);
		selectLecturer.options[selectLecturer.options.length] = new Option(val.lastname + ", " + val.firstname, key);
	});
};

HierarchiesForm.reset = function()
{
	//--- resets hierarchy form with appropriate fields ---//
	//--- level 3 -> faculty ---//
	//--- required input fields for faculty -> name, shortname, dean, organizer ---//
	//--- name and shortname never hidden ---//
	if (Hierarchies.level === 3)
	{
		$('#form-hierarchies-dean').parent().show()
		$('#form-hierarchies-organizer').parent().show();
		
		$("#form-hierarchies-semester").parent().hide();
		$('#form-hierarchies-deanstudies').parent().hide();
		$('#form-hierarchies-lecturer').parent().hide();
	}
	//--- level 4 -> major ---//
	//--- required input fields for major -> name, shortname, dean of studies ---//
	if (Hierarchies.level === 4)
	{
		$('#form-hierarchies-deanstudies').parent().show();
		
		$("#form-hierarchies-semester").parent().hide();
		$('#form-hierarchies-dean').parent().hide()
		$('#form-hierarchies-organizer').parent().hide();
		$('#form-hierarchies-lecturer').parent().hide();
	}
	//--- level 5 -> course ---//
	//--- required input field for course -> name, shortname, semester, lecturer ---//
	if (Hierarchies.level === 5)
	{
		$("#form-hierarchies-semester").parent().show();
		$('#form-hierarchies-lecturer').parent().show();
		
		$('#form-hierarchies-dean').parent().hide()
		$('#form-hierarchies-organizer').parent().hide();
		$('#form-hierarchies-deanstudies').parent().hide();
	}
};
