//--- renders pop-up modal to add and modify category in questionnaire ---//
var QuestionnaireFormCategory = {};

QuestionnaireFormCategory.isRendered = false;

QuestionnaireFormCategory.setup = function ()
{
	var modalId = "category";
	Modal.setup(modalId);
	//--- input field for heading (Deutsch) ---//
	Modal.input(modalId, "headerDE", "Überschrift (Deutsch)", "text");
	//--- input field for heading (English) ---//
	Modal.input(modalId, "headerEN", "Überschrift (Englisch)", "text");
	QuestionnaireFormCategory.callback();
	QuestionnaireFormCategory.isRendered = true;
};

QuestionnaireFormCategory.callback = function ()
{
	//--- form on submit listener ---//
	$("#form-category").on("submit", function (event)
	{
		event.preventDefault();
		//--- removes error from modal ---//
		Modal.removeError("category");
		
		//--- gets information from modal ---//
		var path = $(event.currentTarget).data("path");
		var action = $(event.currentTarget).data("action");
		var oldHeaderDEAsJson = $(event.currentTarget).data("oldHeaderDEAsJson");
		
		//--- input field values ---//
		var newHeaderDE = $("#form-category-headerDE").val().trim();
		var newHeaderEN = $("#form-category-headerEN").val().trim();
		
		//--- input field validation ---//
		var hasErrorHeaderDE = Validation.isEmpty("category", "headerDE", newHeaderDE, null);
		var hasErrorHeaderEN = Validation.isEmpty("category", "headerEN", newHeaderEN, null);
		
		//--- duplicate validation ---//
		if (hasErrorHeaderDE === false && hasErrorHeaderEN === false)
		{
			hasErrorHeaderDE = QuestionnaireFormCategory.isDuplicate(action, newHeaderDE);
		}
		
		if (hasErrorHeaderDE === false && hasErrorHeaderEN === false)
		{
			//--- AJAX request ---//
			Questionnaire.addUpdateRemoveSortCategory(path, action, newHeaderDE, newHeaderEN, oldHeaderDEAsJson, null);
		}
		else if (hasErrorHeaderDE === true)
		{
			$("#form-category-headerDE").focus();
		}
		else if (hasErrorHeaderEN === true)
		{
			$("#form-category-headerEN").focus();
		}
	});
};

QuestionnaireFormCategory.isDuplicate = function (action, headerDE)
{
	//--- checks headerDE duplication ---//
	//--- headerDE -> heading (Deutsch) , act as key ---//
	if ($.inArray(headerDE, Questionnaire.items) !== -1 && (action === "add" || (action === "update" && headerDE !== Questionnaire.editingHeaderDE)))
	{
		//--- shows error and 'X' indicator ---//
		$(".help-block.form-category.headerDE").html("Überschrift existiert. Bitte geben Sie andere Überschrift ein");
		$("#form-category-headerDE").parent().addClass("has-error has-feedback");
		$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-category feedback-icon headerDE"}).insertAfter("#form-category-headerDE");
		$(".help-block.form-category.headerDE").css("display", "block");
		
		//--- shows error and 'X' indicator ---//
		$(".help-block.form-category.headerEN").html("Überschrift existiert. Bitte geben Sie andere Überschrift ein");
		$("#form-category-headerEN").parent().addClass("has-error has-feedback");
		$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-category feedback-icon headerEN"}).insertAfter("#form-category-headerEN");
		$(".help-block.form-category.headerEN").css("display", "block");
		
		return true;
	}
	return false;
};
