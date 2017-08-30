//--- renders pop-up modal to add / modify questions in questionnaire ---//
var QuestionnaireFormQuestion = {};

QuestionnaireFormQuestion.isRendered = false;

QuestionnaireFormQuestion.setup = function ()
{
	var modalId = "question";
	
	//--- question type options -> MCQ, Freitextquestion ---//
	var options = {};
	options["radio"] = "MCQ";
	options["text"] = "Freitextfragen";
	
	Modal.setup(modalId);
	//--- select (question type) ---//
	Modal.select(modalId, "type", "Art *", false, options, "radio");
	//--- textarea for paragraph (deutsch) ---//
	Modal.textarea(modalId, "paragraphDE", "Frage (Deutsch) *");
	//--- textarea for paragraph (english) ---//
	Modal.textarea(modalId, "paragraphEN", "Frage (Englisch) *");
	//--- labels for MCQ question ---//
	Modal.inputLabel(modalId, "label1", "Label 1");
	Modal.inputLabel(modalId, "label2", "Label 2");
	Modal.inputLabel(modalId, "label3", "Label 3");
	Modal.inputLabel(modalId, "label4", "Label 4");
	Modal.inputLabel(modalId, "label5", "Label 5");
	QuestionnaireFormQuestion.callback();
	QuestionnaireFormQuestion.isRendered = true;
};

QuestionnaireFormQuestion.callback = function ()
{
	//--- select (question type) on change listener ---// 
	$("#form-question-type").on("change", function (event)
	{
		var type = $(event.currentTarget).val();
		//--- if MCQ (contains radio buttons) ---//
		if (type === "radio")
		{
			//--- shows label input fields (e.g. for 'tritt voll zu', 'gar nicht', usw.) ---//
			$(".form-group.question-label").show();
		}
		//--- if free-text-question ---//
		else if (type === "text")
		{
			//--- hides label input fields ---//
			$(".form-group.question-label").hide();		
		}
	});
	
	//--- question form on submit listener ---//
	$("#form-question").on("submit", function (event)
	{
		event.preventDefault();
		//--- removes error messages and indicators ---//
		Modal.removeError("question");
		
		//--- gets information from modal ---//
		var path = $(event.currentTarget).data("path");
		var action = $(event.currentTarget).data("action");
		var headerDE = $(event.currentTarget).data("headerDE");
		var oldParagraphsDEAsJson = $(event.currentTarget).data("oldParagraphsDEAsJson");
		
		//--- gets input from select and input fields ---//
		var type = $("#form-question-type").val();
		var newParagraphDE = $("#form-question-paragraphDE").val().trim();
		var newParagraphEN = $("#form-question-paragraphEN").val().trim();
		
		var labelDEAsJson = null;
		var labelENAsJson = null;
		
		//--- if radio (question type == MCQ), gets input from label input fields ---//
		if (type === "radio")
		{
			var label1DE = $("#form-question-label1DE").val().trim();
			var label2DE = $("#form-question-label2DE").val().trim();
			var label3DE = $("#form-question-label3DE").val().trim();
			var label4DE = $("#form-question-label4DE").val().trim();
			var label5DE = $("#form-question-label5DE").val().trim();
			var labelDE = [label1DE, label2DE, label3DE, label4DE, label5DE];
			var labelDEAsJson = JSON.stringify(labelDE);
			
			var label1EN = $("#form-question-label1EN").val().trim();
			var label2EN = $("#form-question-label2EN").val().trim();
			var label3EN = $("#form-question-label3EN").val().trim();
			var label4EN = $("#form-question-label4EN").val().trim();
			var label5EN = $("#form-question-label5EN").val().trim();
			var labelEN = [label1EN, label2EN, label3EN, label4EN, label5EN];
			var labelENAsJson = JSON.stringify(labelEN);
		}
		
		//--- form validation ---//
		var hasErrorDE = Validation.isEmpty("question", "paragraphDE", newParagraphDE, null);
		var hasErrorEN = Validation.isEmpty("question", "paragraphEN", newParagraphEN, null);
		
		//--- duplicate validation ---//
		if (hasErrorDE === false && hasErrorEN === false)
		{
			//--- paragraph (Deutsch) acts as key ---//
			hasErrorDE = QuestionnaireFormQuestion.isDuplicate(action, newParagraphDE);
		}
		
		if (hasErrorDE === false && hasErrorEN === false)
		{
			//--- AJAX request ---//
			Questionnaire.addUpdateRemoveSortQuestion(path, action, headerDE, type, newParagraphDE, newParagraphEN, labelDEAsJson, labelENAsJson, oldParagraphsDEAsJson, null);
		}
		else if (hasErrorDE === true)
		{
			$("#form-question-paragraphDE").focus();
		}
		else if (hasErrorEN === true)
		{
			$("#form-question-paragraphEN").focus();
		}
	});
};

QuestionnaireFormQuestion.isDuplicate = function (action, paragraphDE)
{
	//--- checks paragraphDE (question in german) duplication ---//
	if ($.inArray(paragraphDE, Questionnaire.items) !== -1 && (action === "add" || (action === "update" && paragraphDE !== Questionnaire.editingParagraphDE)))
	{
		//--- displays error message ---//
		$(".help-block.form-question.paragraphDE").html("Frage existiert. Bitte geben Sie andere Frage ein");
		$("#form-question-paragraphDE").parent().addClass("has-error has-feedback");
		$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-question feedback-icon paragraphDE"}).insertAfter("#form-question-paragraphDE");
		$(".help-block.form-question.paragraphDE").css("display", "block");
		
		$(".help-block.form-question.paragraphEN").html("Frage existiert. Bitte geben Sie andere Frage ein");
		$("#form-question-paragraphEN").parent().addClass("has-error has-feedback");
		$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-question feedback-icon paragraphEN"}).insertAfter("#form-question-paragraphEN");
		$(".help-block.form-question.paragraphEN").css("display", "block");
		
		return true;
	}
	return false;
};
