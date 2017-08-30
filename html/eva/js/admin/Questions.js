//--- consists of get method to retrieve questionnaire set from server ---//
//--- can be used only by DEAN, DEAN OF STUDIES and LECTURER ---//
//--- retrieve questionnaire based on the requested semester in order to view statistics or results ---//
var Questions = {};

Questions.json = null;

Questions.get = function (callback, path, semester)
{
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./questions",
		data:
		{
			user: USER,
			pwd: PWD,
			semester: semester
		},
		success: function (json)
		{
			if (Questions.json === null)
			{
				Questions.json = {};
			}
			Questions.json[semester] = json.categories;
			callback(path);
		}
	});
};
