//--- renders pop-up modal ---//
var Modal = {};

Modal.setup = function (modalId)
{
	Modal.container(modalId);
	Modal.header(modalId);
	Modal.body(modalId);
	Modal.footer(modalId);
	Modal.callback(modalId);
};

Modal.container = function (modalId)
{
	var divMain = document.getElementById("main");
	
	//--- modal container ---//
	var divModal = document.createElement("div");
	divModal.className = "modal fade";
	divModal.id = "modal-" + modalId;
	divModal.tabIndex = "-1";
	divModal.setAttribute("role", "dialog");
	divModal.setAttribute("aria-labelledby", "modal-" + modalId);
	divModal.setAttribute("aria-hidden", "true");
	$(divModal).modal("hide");
	divMain.appendChild(divModal);
	
	var divModalDialog = document.createElement("div");
	divModalDialog.className = "modal-dialog";
	divModal.appendChild(divModalDialog);
	
	var divModalContent = document.createElement("div");
	divModalContent.className = "modal-content";
	//--- sets modal id ---//
	divModalContent.id = "modal-content-" + modalId;
	divModalDialog.appendChild(divModalContent);
};

Modal.header = function (modalId)
{
	var divModalContent = document.getElementById("modal-content-" + modalId);
	
	//--- modal header ---//
	var divModalHeader = document.createElement("div");
	divModalHeader.className = "modal-header";
	divModalContent.appendChild(divModalHeader);
	
	//--- button close ---//
	var buttonClose = document.createElement("button");
	buttonClose.className = "close";
	buttonClose.setAttribute("data-dismiss", "modal");
	divModalHeader.appendChild(buttonClose);
	
	//--- 'x' icon ---//
	var spanTimes = document.createElement("span");
	spanTimes.innerHTML = "&times;";
	spanTimes.setAttribute("aria-hidden", "true");
	buttonClose.appendChild(spanTimes);
	
	var spanSrOnly = document.createElement("span");
	spanSrOnly.className = "sr-only";
	spanSrOnly.innerHTML = "Close";
	buttonClose.appendChild(spanSrOnly);
	
	//--- modal title ---//
	var h4ModalTitle = document.createElement("h4");
	h4ModalTitle.className = "modal-title";
	h4ModalTitle.id = "modal-title-" + modalId;
	divModalHeader.appendChild(h4ModalTitle);
};

Modal.body = function (modalId)
{
	var divModalContent = document.getElementById("modal-content-" + modalId);
	
	//--- modal body container ---//
	var divModalBody = document.createElement("div");
	divModalBody.id = "modal-body-" + modalId;
	divModalBody.className = "modal-body";
	divModalContent.appendChild(divModalBody);
	
	//--- form in the modal ---//
	var form = document.createElement("form");
	form.setAttribute("role", "form");
	//--- form id ---//
	form.id = "form-" + modalId;
	divModalBody.appendChild(form);
};

Modal.footer = function (modalId)
{
	//--- modal footer ---//
	var divModalContent = document.getElementById("modal-content-" + modalId);
	
	var divModalFooter = document.createElement("div");
	divModalFooter.className = "modal-footer";
	divModalContent.appendChild(divModalFooter);
	
	//--- button cancel ---//
	var buttonDefault = document.createElement("button");
	buttonDefault.className = "btn btn-default";
	buttonDefault.setAttribute("data-dismiss", "modal");
	buttonDefault.innerHTML = "Abbrechen";
	divModalFooter.appendChild(buttonDefault);
	
	//--- button ok ---//
	var buttonPrimary = document.createElement("button");
	buttonPrimary.className = "btn btn-primary";
	buttonPrimary.id = "btn-submit-" + modalId;
	buttonPrimary.type = "submit";
	
	buttonPrimary.setAttribute("form", "form-" + modalId);
	divModalFooter.appendChild(buttonPrimary);
};

Modal.callback = function (modalId)
{
	//--- triggered when modal opened ---//
	$("#modal-" + modalId).on("shown.bs.modal", function ()
	{
		//--- refreshes select elements' options ---//
 		$(".form-" + modalId + ".select").selectpicker("refresh");
 		//--- focuses first input field ---//
		$(".form-" + modalId + ".input").first().focus();
	});
	
	//--- triggered when modal closed ---//
	$("#modal-" + modalId).on("hide.bs.modal", function ()
	{
		//--- removes all error messages and indicators ---//
		Modal.removeError(modalId);
	});
};

Modal.input = function (modalId, inputId, inputLabel, inputType)
{
	//--- renders text input ---//
	
	//--- sets input type as text if not defined ---//
	if (inputType === undefined)
	{
		inputType = "text";
	}
	
	var form = document.getElementById("form-" + modalId);
	
	var divFormGroup = document.createElement("div");
	divFormGroup.className = "form-group";
	form.appendChild(divFormGroup);
	
	//--- text label for input field ---//
	var label = document.createElement("label");
	label.setAttribute("for", "form-" + modalId + "-" + inputId);
	label.innerHTML = inputLabel;
	label.id = "form-" + modalId + "-label-" + inputId;
	divFormGroup.appendChild(label);
	
	//--- input field ---//
	var inputfield = document.createElement("input");
	inputfield.type = inputType;
	inputfield.name = inputId;
	inputfield.id = "form-" + modalId + "-" + inputId;
	inputfield.className = "form-control form-" + modalId + " input";
	divFormGroup.appendChild(inputfield);
	
	//--- error message below input field ---//
	var small = document.createElement("small");
	small.className = "help-block form-" + modalId + " " + inputId;
	//--- hidden by default ---//
	small.style.display = "none";
	divFormGroup.appendChild(small);
	
	Modal.inputCallback(modalId, inputId);
};

Modal.inputCallback = function (modalId, inputId)
{
	//--- text input on key up event listener ---//
	$("#form-" + modalId + "-" + inputId).on("keyup", function (event)
	{
		//--- event.which == 13 -> enter ---//
		if (event.which !== 13 && $(event.currentTarget).parent().hasClass("has-error has-feedback") === true)
		{
			//--- remove error message and indicator ---//
			$(event.currentTarget).parent().removeClass("has-error has-feedback");
			$(event.currentTarget).siblings("span").remove();
			$(".help-block.form-" + modalId + "." + inputId).css("display", "none");
    	}
	});
};

Modal.textarea = function(modalId, textareaId, textareaLabel)
{
	//--- renders textarea inside modal ---//
	//--- only for questionnaire form ---//
	var form = document.getElementById("form-" + modalId);
	
	var divFormGroup = document.createElement("div");
	divFormGroup.className = "form-group";
	form.appendChild(divFormGroup);
	
	//--- textarea label ---//
	var label = document.createElement("label");
	label.setAttribute("for", "form-" + modalId + "-" + textareaId);
	label.innerHTML = textareaLabel;
	label.id = "form-" + modalId + "-label-" + textareaId;
	divFormGroup.appendChild(label);
	
	//--- textarea ---//
	var textarea = document.createElement("textarea");
	textarea.id = "form-" + modalId + "-" + textareaId;
	textarea.className = "form-control form-" + modalId + " input";
	textarea.rows = "2";
	divFormGroup.appendChild(textarea);
	
	//--- error message below textarea ---//
	var small = document.createElement("small");
	small.className = "help-block form-" + modalId + " " + textareaId;
	//--- hidden by default ---//
	small.style.display = "none";
	divFormGroup.appendChild(small);
	
	Modal.inputCallback(modalId, textareaId);
};

Modal.inputLabel = function(modalId, inputId, inputLabel)
{
	//--- render input field + label for options of MCQ question (e.g. tritt voll zu, gar nicht, ...) ---//
	//--- only for modal questionnaire form ---//
	var form = document.getElementById("form-" + modalId);
	
	//--- label DE ---//
	var divFormGroup = document.createElement("div");
	divFormGroup.className = "form-group form-group-sm question-label";
	divFormGroup.style.width = "100%";
	divFormGroup.style.float = "left";
	form.appendChild(divFormGroup);
	
	//--- label and input field for german and english language will be side by side ---//
	//--- sharing 49% of the total width each ---//
	
	//--- label for input field (german) ---//
	var labelDE = document.createElement("label");
	labelDE.setAttribute("for", "form-" + modalId + "-" + inputId + "DE");
	labelDE.innerHTML = inputLabel + " (Deutsch)";
	labelDE.id = "form-" + modalId + "-label-" + inputId + "DE";
	labelDE.style.width = "49%";
	labelDE.style.float = "left";
	labelDE.style.marginRight = "1%";
	divFormGroup.appendChild(labelDE);
	
	//--- label for input field (english) ---//
	var labelEN = document.createElement("label");
	labelEN.setAttribute("for", "form-" + modalId + "-" + inputId + "DE");
	labelEN.innerHTML = inputLabel + " (Englisch)";
	labelEN.id = "form-" + modalId + "-label-" + inputId + "DE";
	labelEN.style.width = "49%";
	labelEN.style.float = "left";
	labelEN.style.marginLeft = "1%";
	divFormGroup.appendChild(labelEN);
	
	//--- input field for german language ---//
	var inputDE = document.createElement("input");
	inputDE.type = "text";
	inputDE.name = inputId + "DE";
	inputDE.id = "form-" + modalId + "-" + inputId + "DE";
	inputDE.className = "form-control input-sm form-" + modalId + " input";
	inputDE.style.width = "49%";
	inputDE.style.clear = "both";
	inputDE.style.float = "left";
	inputDE.style.marginRight = "1%";
	divFormGroup.appendChild(inputDE);
	
	//--- input field for english language ---//
	var inputEN = document.createElement("input");
	inputEN.type = "text";
	inputEN.name = inputId + "EN";
	inputEN.id = "form-" + modalId + "-" + inputId + "EN";
	inputEN.className = "form-control input-sm form-" + modalId + " input";
	inputEN.style.width = "49%";
	inputEN.style.float = "left";
	inputEN.style.marginLeft = "1%";
	divFormGroup.appendChild(inputEN);
	
	$(".modal-footer").css("clear", "both");
};

Modal.select = function(modalId, selectId, selectLabel, search, options, selectedOption)
{
	//--- renders select element ---//
	//--- for selecting dean, dean of studies, lecturer and organizer ---//
	var form = document.getElementById("form-" + modalId);
	
	var divFormGroup = document.createElement("div");
	divFormGroup.className = "form-group";
	form.appendChild(divFormGroup);
	
	var label = document.createElement("label");
	label.setAttribute("for", "form-" + modalId + "-" + selectId);
	label.id = "form-" + modalId + "-label-" + selectId;
	label.innerHTML = selectLabel;
	divFormGroup.appendChild(label);
	
	var select = document.createElement("select");
	select.className = "form-" + modalId + " select " + selectId;
	select.name = selectId;
	select.id = "form-" + modalId + "-" + selectId;

	select.title = selectLabel + " ausw&#228;hlen";
	select.dataset.width = "100%";
	select.dataset.size = "7";
	select.dataset.container = "body";
	select.setAttribute("data-live-search", search);
	divFormGroup.appendChild(select);
	
	//--- sets options of select element ---//
	$.each(options, function (key, val)
	{
		select.options[select.options.length] = new Option(val, key);
	});
	
	//--- css customized select element through select picker ---//
	$(select).selectpicker();
	$(select).selectpicker("val", selectedOption);
	
	//--- error message below select element ---//
	var small = document.createElement("small");
	small.className = "help-block form-" + modalId + " " + selectId;
	//--- hidden by default ---//
	small.style.display = "none";
	divFormGroup.appendChild(small);
	
	Modal.selectCallback(modalId, selectId);
};

Modal.selectCallback = function (modalId, selectId)
{
	//--- select element event listener ---//
	$("#form-" + modalId + "-" + selectId).on("change", function (event)
	{
		if ($(event.currentTarget).parent().hasClass("has-error has-feedback") === true)
		{
			//--- removes error message ---//
			$(".bootstrap-select.form-" + modalId + ".select." + selectId).children("button").css("border-color", "#ccc");
			$(event.currentTarget).parent().removeClass("has-error has-feedback");
			$(event.currentTarget).siblings("span").remove();
			$(".help-block.form-" + modalId + "." + selectId).css("display", "none");
    	}
	});
};

Modal.checkbox = function (modalId, checkboxId, labelText)
{
	//--- renders checkbox ---//
	var form = document.getElementById("form-" + modalId);
	
	var divCheckbox = document.createElement("div");
	divCheckbox.className = "checkbox";
	form.appendChild(divCheckbox);
	
	var label = document.createElement("label");
	divCheckbox.appendChild(label);
	
	var input = document.createElement("input");
	input.type = "checkbox";
	input.id = "form-" + modalId + "-" + checkboxId;
	label.appendChild(input);
	
	//--- text next to checkbox ---//
	var text = document.createTextNode(" " + labelText.trim());
	label.appendChild(text)
};

Modal.removeError = function (modalId)
{
	//--- removes error message and indicator 'X' from input fields ---//
	$(".form-" + modalId + ".input").parent().removeClass("has-error has-feedback");
	$(".bootstrap-select.form-" + modalId + ".select").children("button").css("border-color", "#ccc");
	$(".help-block.form-" + modalId).css("display","none");
	$(".form-" + modalId + ".feedback-icon").remove();
};

Modal.loading = function(modalId, loadingText)
{
	//--- when AJAX request is sent, the pop-up modal will be freezed until server response is received ---//
	//--- displays message indicating waiting for response ---//
	$("#btn-submit-" + modalId).data("loading-text", loadingText);
	$("#btn-submit-" + modalId).button("loading");
	//--- disables all input fields and select elements ---//
	$(".form-control.form-" + modalId + ".input").prop("disabled", true);
	$(".form-" + modalId + ".select").prop("disabled", true);
	//--- prevents modal from being closed ---//
	$("#modal-" + modalId).attr("data-keyboard", false);
	$("#modal-" + modalId).attr("data-backdrop", "static");
	$("#modal-" + modalId).on("hide.bs.modal", function (event) { event.preventDefault(); });
};

Modal.reset = function(modalId)
{
	//--- un-freezes pop-up modal after receiving response from server through AJAX request ---//
	//--- enables all input fields and select elements ---//
	$("#btn-submit-" + modalId).button("reset");
	$(".form-control.form-" + modalId + ".input").prop("disabled", false);
	$(".form-" + modalId + ".select").prop("disabled", false);
	//--- enables modal to be closed normally ---//
	$("#modal-" + modalId).attr("data-keyboard", true);
	$("#modal-" + modalId).attr("data-backdrop", true);
	$("#modal-" + modalId).unbind("hide.bs.modal");
};

Modal.hide = function(modalId)
{
	//--- hides modal ---//
	$("#modal-" + modalId).modal("hide");
};
