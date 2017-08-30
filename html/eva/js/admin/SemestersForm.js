//--- renders pop-up modal to add and update semester ---//
var SemestersForm = {};

SemestersForm.isRendered = false;

SemestersForm.setup = function ()
{
	var modalId = "semesters";
	var options = {};
	options["SS"] = "SS";
	options["WS"] = "WS";
	
	//--- modal consists of select to select SS or WS, ---//
	//--- text input field to enter year and checkbox to indicate whether it is current semester or not ---//
	Modal.setup(modalId);
	Modal.select(modalId, "ssws", "SS / WS", false, options, "SS");
	Modal.input(modalId, "year", "Jahr", "text");
	Modal.checkbox(modalId, "currentSemester", "Aktuelles Semester");
	SemestersForm.callback();
	SemestersForm.isRendered = true;
};

SemestersForm.callback = function ()
{
	$("#form-semesters").on("submit", function (event)
	{
		event.preventDefault();
		Modal.removeError("semesters");
		
		//--- get information and data from modal ---//
		var path = $(event.currentTarget).data("path");
		var action = $(event.currentTarget).data("action");
		var name = $(event.currentTarget).data("name");
		var ssws = $("#form-semesters-ssws").val();
		var year = $("#form-semesters-year").val().trim();
		var currentSemester = $("#form-semesters-currentSemester").is(":checked");
		
		//--- form validation ---//
		var hasError = Validation.isEmpty("semesters", "year", year, null);
		if (hasError === false)
		{
			hasError = Validation.length("semesters", "year", year, 4, 4, "Jahr muss vier-stellig sein");
		}
		if (hasError === false)
		{
			hasError = Validation.regex("semesters", "year", year, /^[2][0-9]{3}$/, "Das eingegebene Jahr ist ungültig");
		}
		if (hasError === false)
		{
			hasError = SemestersForm.checkDuplicate(action, ssws, year);
		}
		if (hasError === false)
		{
			//--- AJAX request ---//
			Semesters.action(path, action, name, ssws, year, currentSemester);
		}
		else
		{
			$("#form-semesters-year").focus();
		}
	});
};

SemestersForm.checkDuplicate = function (action, ssws, year)
{
	//--- checks semester duplication ---//
	var name = year + "-" + ssws;
	if ($.inArray(name, Object.keys(Semesters.json)) !== -1 && (action === "new" || (action === "update" && name !== Semesters.editingSemesterName)))
	{
		//--- shows error message ---//
		$(".help-block.form-semesters.year").html("Semester existiert. Bitte geben Sie neue Semester ein");
		$("#form-semesters-year").parent().addClass("has-error has-feedback");
		$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-semesters feedback-icon year"}).insertAfter("#form-semesters-year");
		$(".help-block.form-semesters.year").css("display", "block");
		return true;
	}
	return false;
};
