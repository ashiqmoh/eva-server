//--- contains AJAX request to get and modify questionnaire ---//
//--- can only be accessed by system administrator or organizer ---//
//--- questionnaire consists of categories (headings) ---//
//--- each category consists of questions ---//
//--- questions can be either Multiple-Choice-Question or Free-Text-Question ---//
var Questionnaire = {};

Questionnaire.semester = null;
Questionnaire.isChangeable = null;
Questionnaire.categories = null;
Questionnaire.level = null;
Questionnaire.levelName = null;
Questionnaire.header = null;
Questionnaire.items = null;
Questionnaire.editingHeaderDE = null;
Questionnaire.editingParagraphDE = null;

//--- AJAX request to get questionnaire set from server ---//
Questionnaire.get = function (path)
{
	if (QuestionnaireFormCategory.isRendered === false)
	{
		QuestionnaireFormCategory.setup();
	}
	if (QuestionnaireFormQuestion.isRendered === false)
	{
		QuestionnaireFormQuestion.setup();
	}
	if (QuestionnaireDemo.isRendered === false)
	{
		QuestionnaireDemo.setup();
	}
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./questionnaire/get",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path
		},
		success: function (json)
		{
			//--- shows error message if no semester found in database ---//
			if (json.error === "add semester first")
			{
				Dashboard.reset(path);
				QuestionnaireTable.error();
				return;
			}
			//--- cache questionnaire informations { isChangeable (boolean), semester (string), categories (JSON-Object) } ---//
			Questionnaire.isChangeable = json.isChangeable;
			Questionnaire.semester = json.semester;
			Questionnaire.categories = json.categories;
			
			//--- determine whether category or question ---//
			var dirs = path.split("/");
			//--- dirs.length > 3 -> question ---//
			if (dirs.length > 3)
			{
				//--- extracts category of questions ---//
				var headerDE = dirs[3];
				for (var i = 4; i < dirs.length; i++)
				{
					headerDE = headerDE + "/" + dirs[i];
				}
				var questions = "";
				$.each(json.categories, function(key, val)
				{
					if (val.headerDE === headerDE)
					{
						questions = val.questions;
					}
				});
				//--- sets level ---//
				$("#form-question").data("headerDE", headerDE);
				Questionnaire.level = "question";
				Questionnaire.levelName = "Frage";
				Questionnaire.header = headerDE;
				//--- renders table ---//
				QuestionnaireTable.setup(path, questions);
			}
			//--- else -> category ---//
			else
			{
				//--- sets level ---//
				Questionnaire.level = "category";
				Questionnaire.levelName = "Überschrift";
				Questionnaire.header = null;
				//--- renders table ---//
				QuestionnaireTable.setup(path, json.categories);
			}
		},
		error: function (xhr)
		{
			Dashboard.reset(path);
			Dashboard.displayError(xhr.status);
		}
	});
};

//--- AJAX request to modify category ---//
Questionnaire.addUpdateRemoveSortCategory = function (path, action, newHeaderDE, newHeaderEN, oldHeaderDEAsJson, newPosition)
{
	//--- Modal.loading freezes modal pop-up with respective loading message ---//
	if (action === "add")
	{
		Modal.loading("category", "Einfügen ...");
	}
	else if (action === "update")
	{
		Modal.loading("category", "Aktualisieren ...");
	}
	else if (action === "remove")
	{
		Modal.loading("confirmation-dialog", "Löschen ...");
	}
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./questionnaire/category/" + action,
		data:
		{
			user: USER,
			pwd: PWD,
			path: path,
			newHeaderDE: newHeaderDE,
			newHeaderEN: newHeaderEN,
			oldHeaderDEAsJson: oldHeaderDEAsJson,
			newPosition: newPosition
		},
		success: function (json)
		{
			//--- if action === remove, close confirmation dialog box ---//
			if (action === "remove")
			{
				Modal.reset("confirmation-dialog");
				Modal.hide("confirmation-dialog");
			}
			else
			{
				Modal.reset("category");
				Modal.hide("category");
			}
			Questionnaire.get(path, false);
		},
		error: function ()
		{
			if (action === "remove")
			{
				Modal.reset("confirmation-dialog");
			}
			else
			{
				Modal.reset("category");
			}
		}
	});
};

//--- AJAX request to modify question ---//
Questionnaire.addUpdateRemoveSortQuestion = function (path, action, headerDE, type, newParagraphDE, newParagraphEN, labelDEAsJson, labelENAsJson, oldParagraphsDEAsJson, newPosition)
{
	//--- Modal.loading freezes modal pop-up with respective loading message ---//
	if (action === "add")
	{
		Modal.loading("question", "Einfügen ...");
	}
	else if (action === "update")
	{
		Modal.loading("question", "Aktualisieren ...");
	}
	else if (action === "remove")
	{
		Modal.loading("confirmation-dialog", "Löschen ...");
	}
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./questionnaire/question/" + action,
		data:
		{
			user: USER,
			pwd: PWD,
			path: path,
			headerDE: headerDE,
			type: type,
			newParagraphDE: newParagraphDE,
			newParagraphEN: newParagraphEN,
			labelDEAsJson: labelDEAsJson,
			labelENAsJson: labelENAsJson,
			oldParagraphsDEAsJson: oldParagraphsDEAsJson,
			newPosition: newPosition
		},
		success: function (json)
		{
			if (action === "remove")
			{
				Modal.reset("confirmation-dialog");
				Modal.hide("confirmation-dialog");
			}
			else
			{
				Modal.reset("question");
				Modal.hide("question");
			}
			Questionnaire.get(path, false);
		},
		error: function ()
		{
			if (action === "remove")
			{
				Modal.reset("confirmation-dialog");
			}
			else
			{
				Modal.reset("question");
			}
		}
	});
};
