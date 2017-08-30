//--- AJAX request to list down all results for a particular course ---//
//--- + renders the list showing all results ---//
var ResultsList = {};

ResultsList.json = null;
ResultsList.searchBoxNames = null;

//--- AJAX request ---//
ResultsList.get = function (path)
{
	$.ajax
	({
		type: "POST",
		url: "./results/list",
		data:
		{
			user: USER,
			pwd: PWD,
			path: path
		},
		success: function (json)
		{
			Dashboard.reset(path);
			ResultsList.json = json;
			ResultsList.message(json);
			if (json.length > 0)
			{
				ResultsList.searchBox();
				ResultsList.set(json);
			}
		},
		error: function (xhr)
		{
			Dashboard.reset(path);
			Dashboard.displayError(xhr.status);
		}
	});
};

ResultsList.message = function (json)
{
	var divContent = document.getElementById("content");
	var pMessage = document.createElement("p");
	//--- message indicating how many results found ---//
	if (json.length > 0)
	{
		pMessage.className = "text-right text-muted";
		if (json.length === 1)
		{
			pMessage.innerHTML = "1 Evaluation";
		}
		else
		{
			pMessage.innerHTML = json.length + " Evaluationen";
		}
	}
	//--- message indicating no results found for the requested course ---//
	else
	{
		pMessage.className = "text-muted";
		pMessage.innerHTML = "No evaluation has been submitted. Please check again later.";
	}
	divContent.appendChild(pMessage);
};

//--- renders search box ---//
ResultsList.searchBox = function ()
{
	var divContent = document.getElementById("content");
	
	//--- button container default ---//
	var divBtnCon = document.createElement("div");
	divBtnCon.className = "btn-container result-list-default";
	divContent.appendChild(divBtnCon);
	
	var searchBox = document.createElement("input");
	searchBox.type = "text";
	searchBox.id = "result-list-search-box";
	searchBox.className = "form-control search-box";
	searchBox.placeholder = "Suche Ergebnisse";
	divBtnCon.appendChild(searchBox);
	
	$(searchBox).on("keyup", function (event)
	{
		event.preventDefault();
		var q = $(event.currentTarget).val().toLowerCase();
		for (var i = 0; i < ResultsList.searchBoxNames.length; i++)
		{
			if (q.length == 0)
			{
				$("#result-list-row-" + i).show();
			}
			else
			{				
				if (ResultsList.searchBoxNames[i].toLowerCase().substring(0, q.length) == q)
				{
					//--- shows matching result ---//
					$("#result-list-row-" + i).show();
				}
				else
				{
					//--- else hide ---//
					$("#result-list-row-" + i).hide();
				}
			}
		}
	});
};

//--- renders the result listing ---//
ResultsList.set = function (json)
{
	var divContent = document.getElementById("content");
	
	var divListGroup = document.createElement("div");
	divListGroup.className = "list-group";
	divContent.appendChild(divListGroup);
	
	// key = index || val = full abs path
	ResultsList.searchBoxNames = [];
	for (var i = 0; i < json.length; i++)
	{
		var dirs = json[i].split(PATH_SEP);
		var path = json[i];
		var name = dirs[dirs.length - 1].split(".")[0];
		//--- cache results to be used by search box to find matching element ---//
		ResultsList.searchBoxNames[i] = name;
		
		var a = document.createElement("a");
		a.id = "result-list-row-" + i;
		a.className = "list-group-item";
		a.href = path.replace(".", "#");
		a.innerHTML = name;
		$(a).data("path", path);
		divListGroup.appendChild(a);
		
		//--- on click -> gets the single result  and renders result viewer ---//
		$(a).on("click", function (event)
		{
			event.preventDefault();
			var path = $(event.target).data("path");
			History.push("Results.get", path);
			//--- AJAX request ---//
			Results.get(path);
		});
	}
};
