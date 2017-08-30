//--- contains AJAX request to view a single result through path as the parameter ---//
//--- to view result, questionnaire has to loaded first ---//
//--- and the result list containing this single result also is required ---//
var Results = {};

Results.get = function (path)
{
	var dirs = path.split("/");
	//--- extracts which semester from the path ---//
	var semester = dirs[3];
	//--- get question first ---//
	if (Questions.json === null)
	{
		Questions.get(Results.getList, path, semester);
	}
	//--- if question for the extracted semestes not available -> get question ---//
	else if (Questions.json[semester] === undefined)
	{
		Questions.get(Results.getList, path, semester);
	}
	else
	{
		Results.getList(path);
	}
};

//--- get result list ---//
Results.getList = function (path)
{
	//--- if result list is empty -> get list ---//
	if (ResultsList.json === null)
	{
		var parentPath = path.split("/");
		parentPath.pop();
		$.ajax
		({
			type: "POST",
			url: "./results/list",
			data:
			{
				user: USER,
				pwd: PWD,
				path: parentPath.join("/")
			},
			success: function (json)
			{
				ResultsList.json = json;
				Results.getAnswers(path);
			},
			error: function (xhr)
			{
				//--- display error message ---//
				Dashboard.reset(path);
				Dashboard.displayError(xhr.status);
			}
		});
	}
	//--- else continue with AJAX to get single result (answers) ---//
	else
	{
		Results.getAnswers(path);
	}
};
	
Results.getAnswers = function (path)
{
	//--- AJAX request to get single result ---//
	$.ajax
	({
		type: "POST",
		url: "./results/get",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path
		},
		success: function (json)
		{
			Dashboard.reset(path);
			//--- renders view ---//
			ResultsViewer.setup(path, json);
		},
		error: function (xhr)
		{
			Dashboard.reset(path);
			Dashboard.displayError(xhr.status);
		}
	});
};
