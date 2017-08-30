//--- renders pop-up modal for code form ---//
var CodesForm = {};

CodesForm.isRendered = false;

CodesForm.setup = function ()
{
	//--- modal consist of only one field, 'Anzahl von Codes' ---//
	var modalId = "codes";
	Modal.setup(modalId);
	Modal.input(modalId, "numberOfCodes", "Anzahl von Codes", "text");
	CodesForm.callback();
	CodesForm.isRendered = true;
};

CodesForm.callback = function ()
{
	$("#form-codes").on("submit", function (event)
	{
		event.preventDefault();
		Modal.removeError("codes");
		
		//--- gathers parameters ---//
		var path = $(event.currentTarget).data("path");
		var codePaths = $(event.currentTarget).data("codePaths");
		var numberOfCodes = $("#form-codes-numberOfCodes").val().trim();
		
		//--- form valiation ---//
		var regex = /^[1-9][0-9]*$/;
		var msg = "Geben Sie ein ganze Zahl gr&#246;&#223;er als 0 ein";
		
		var error = Validation.isEmpty("codes", "numberOfCodes", numberOfCodes, null);
		if (error === false)
		{
			error = Validation.regex("codes", "numberOfCodes", numberOfCodes, regex, msg);
		}
		if (error === false)
		{
			//--- continue with ajax request @see Codes.js ---//
			Codes.generate(path, codePaths, numberOfCodes);
		}
		else
		{
			$("#form-codes-numberOfCodes").focus();
		}
	});
};
