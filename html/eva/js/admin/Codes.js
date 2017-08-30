//--- manages ajax requests to get codes from database and generate new codes ---//
var Codes = {};

//--- gets codes from database ---//
//--- path is current path. codePaths is paths, for which the codes should be fetch ---//
//--- action whether to list it on web page, view as PDF or download as PDF ---//
Codes.get = function (path, codePaths, action)
{
	if (CodesForm.isRendered === false)
	{
		CodesForm.setup();
	}
	if (codePaths === undefined)
	{
		codePaths = JSON.stringify([path]);
	}
	if (action === undefined)
	{
		action = "list";
	}	
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./codes/list",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path,
			codePaths: codePaths
		},
		success: function (json)
		{			
			if (action === "preview" || action === "download")
			{
				CodesPdfGenerator.generate(action, json);
			}
			if (action === "list")
			{
				Dashboard.reset(path);
				CodesTable.setup(path, json);
			}
		},
		error: function (xhr)
		{
			Dashboard.reset(path);
			Dashboard.displayError(xhr.status);
		}
	});
};

//--- generate new codes ---//
//--- path: current path; codePaths: paths, to which codes should be generated ---//
Codes.generate = function (path, codePaths, numberOfCodes)
{
	//--- Modal.loading freezes modal box (page) until response is received ---//
	Modal.loading("codes", "Erzeugen ...");
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./codes/new",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path,
			codePaths: codePaths,
			numberOfCodes: numberOfCodes
		},
		success: function (json)
		{
			//--- Modal.reset unfreezes modal pop-up (page) ---//
			Modal.reset("codes");
			if (json.op === true)
			{
				//--- closes modal pop-up ---//
				Modal.hide("codes");
				var dirs = path.split(PATH_SEP);
				if (dirs.length > 6)
				{
					Codes.get(path, codePaths, "list");
				}
			}
		},
		error: function ()
		{
			Modal.reset("codes");
		}
	});
};
