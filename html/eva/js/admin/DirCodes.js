//--- Gets directories listing for the given path ---//
//--- only for section 'Codes' ---//
var DirCodes = {};

DirCodes.json = null;
DirCodes.names = null;
DirCodes.levelName = null;

DirCodes.get = function (path)
{
	if (CodesForm.isRendered === false)
	{
		//--- renders CodesForm ---//
		CodesForm.setup();
	}
	//--- level 4 -> Faculty, level 5 -> Major, level 6 -> Course ---//
	if (path.split(PATH_SEP).length === 4)
	{
		DirCodes.levelName = "Fakultät";
	}
	else if (path.split(PATH_SEP).length === 5)
	{
		DirCodes.levelName = "Studiengang";
	}
	else if (path.split(PATH_SEP).length === 6)
	{
		DirCodes.levelName = "Lehrveranstaltung";
	}
	//--- AJAX request to get directories listing ---//
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./directories",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path
		},
		success: function (json)
		{
			DirCodes.json = json;
			Dashboard.reset(path);
			DirCodesTable.setup(path, json);
		}
	});
};
