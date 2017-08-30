//--- Gets directories listing for the given path ---//
var Directories = {};

Directories.get = function (path)
{
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
			Dashboard.reset(path);
			DirectoriesTable.setup(path, json);
		},
		error: function (xhr)
		{
			Dashboard.reset(path);
			//--- displays error message ---//
			Dashboard.displayError(xhr.status);
		}
	});
};
