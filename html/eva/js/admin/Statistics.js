//--- contains AJAX request to get statistics data for a course ---//
var Statistics = {};

Statistics.get = function (path)
{
	//--- renders StatisticsHelp pop-up modal ---//
	if (StatisticsHelp.isRendered === false)
	{
		StatisticsHelp.setup();
	}
	//--- extracts semester from @param path ---//
	var semester = path.split("/")[3];
	//--- if no question sets have been loaded ---//
	if (Questions.json === null)
	{
		//--- get questionnaire first, then continue with getStat() ---//
		Questions.get(Statistics.getStat, path, semester);
	}
	//--- if questionnaire for extracted semester not yet loaded ---//
	else if (Questions.json[semester] === undefined)
	{
		//--- get question set first, then continue with getStat() ---//
		Questions.get(Statistics.getStat, path, semester);
	}
	else
	{
		Statistics.getStat(path);
	}
};

//--- gets statistics for the given path ---//
Statistics.getStat = function (path)
{
	//--- AJAX request ---//
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./statistics",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path
		},
		success: function (json)
		{
			Dashboard.reset(path);
			//--- renders StatisticsViewer (canvas) ---//
			StatisticsViewer.setup(path, json);
		},
		error: function (xhr)
		{
			Dashboard.reset(path);
			Dashboard.displayError(xhr.status);
		}
	});
};
