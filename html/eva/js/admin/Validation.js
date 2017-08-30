//--- manages form validation from modal pop-up ---//
var Validation = {};

Validation.showError = function (modalId, inputId, errorMessage)
{
	//--- shows error message + 'X' indicator at the text input field ---//
	$(".help-block.form-" + modalId + "." + inputId).html(errorMessage);
	$("#form-" + modalId + "-" + inputId).parent().addClass("has-error has-feedback");
	$("<span/>", {"class": "glyphicon glyphicon-remove form-control-feedback form-" + modalId + " feedback-icon " + inputId}).insertAfter("#form-" + modalId + "-" + inputId);
	$(".help-block.form-" + modalId + "." + inputId).css("display", "block");
};

//--- empty input field validation ---//
Validation.isEmpty = function (modalId, inputId, value, message)
{
	//--- if message is given (not null), the given message will be used to display error message ---//
	if (message === null)
	{
		message = "Bitte einfüllen"; // change message here
	}
	if (value === "" || value.length === 0 || value === null)
	{
		//--- validation fails ---//
		Validation.showError(modalId, inputId, message);
		return true;
	}
	return false;
};

//--- not equal validation ---//
Validation.isNotEqual = function (modalId, inputId, value, comparedValue, message)
{
	if (message === null)
	{
		message = "Input doesn't match"; // change message here 
	}
	if (value !== comparedValue)
	{
		//--- validation fails ---//
		Validation.showError(modalId, inputId, message);
		return true;
	}
	return false;
};

//--- character length evaluation ---//
//--- minLength or maxLength can be null ---//
Validation.length = function (modalId, inputId, value, minLength, maxLength, message)
{
	var valueLength = value.length;
	if (maxLength === null)
	{
		if (message === null)
		{
			message = "Too short. Minimum length is " + minLength; // change message here
		}
		if (valueLength < minLength)
		{
			Validation.showError(modalId, inputId, message);
			return true;
		}
	}
	else if (minLength === null)
	{
		if (message === null)
		{
			message = "Too long. Maximum length is " + maxLength; // change message here
		}
		if (valueLength > maxLength)
		{
			Validation.showError(modalId, inputId, message);
			return true;
		}
	}
	else
	{
		if (message === null)
		{
			message = "Length should be in between " + minLength + " and " + maxLength; // change message here
		}
		if (valueLength > maxLength || valueLength < minLength)
		{
			Validation.showError(modalId, inputId, message);
			return true;
		}
	}
	return false;
};

//--- regex validation ---//
Validation.regex = function (modalId, inputId, value, regex, message)
{
	if (message === null)
	{
		message = "Input doesn't match"; // change message here ---//
	}
	if (regex.test(value) === false)
	{
		Validation.showError(modalId, inputId, message);
		return true;
	}
	return false;
};

//--- disallowedChar validation mostly for string that be made directory or file name ---//
Validation.disallowedChar = function (modalId, inputId, value, isDashAllowed, message)
{
	var disallowedChar = [];
	if (isDashAllowed === true)
	{
		disallowedChar = ["/", "\\", "*", "?", ":", "<", ">", "|", "\""];
		if (message === null)
		{
			message = "Sonderzeichnen / \\ * ? : < > | \" ist nicht erlaubt";
		}
	}
	//--- for hierarchy item '-' is not allowed because it is used as separator between name and shortname ---//
	else if (isDashAllowed === false)
	{
		disallowedChar = ["/", "\\", "*", "?", ":", "<", ">", "|", "\"", "-"];
		if (message === null)
		{
			message = "Sonderzeichnen / \\ * ? : < > | \" - ist nicht erlaubt";
		}
	}
	for (var i = 0; i < disallowedChar.length; i++)
	{
		if (value.indexOf(disallowedChar[i]) > -1)
		{
			Validation.showError(modalId, inputId, message);
			return true;
		}
	}
	return false;
};

//--- select picker empty validation ---//
Validation.isSelectEmpty = function (modalId, selectId, value, message)
{
	if (message === null)
	{
		message = "Bitte auswählen"; // change message here
	}
	if (value === null)
	{
		//--- displays error (css customization not same as text input field) ---//
		$("#form-" + modalId + "-" + selectId).parent().addClass("has-error has-feedback");
		$(".bootstrap-select.form-" + modalId + ".select." + selectId).children("button").css("border-color", "#a94442");
		$(".help-block.form-" + modalId + "." + selectId).html(message);
		$(".help-block.form-" + modalId + "." + selectId).css("display", "block");
		return true;
	}
	return false;
};
