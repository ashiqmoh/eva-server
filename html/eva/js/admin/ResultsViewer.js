//--- generates Result Viewer to view single result under section 'Ergebnisse' ---//
var ResultsViewer = {};

ResultsViewer.collapseIn = ["", "", "", "", ""];

ResultsViewer.setup = function (path, answers)
{
	ResultsViewer.buttons(path, answers);
	ResultsViewer.message(path);
	ResultsViewer.container(path, answers);
};

ResultsViewer.buttons = function (path, answers)
{
	var index = $.inArray(path, ResultsList.json);
	
	var divContent = document.getElementById("content");
	
	//--- buttons container ---//
	var divBtnCon = document.createElement("div");
	divBtnCon.className = "btn-container";
	divContent.appendChild(divBtnCon);
	
	//--- next and previous button to navigate through results list ---//
	//--- next button ---//
	var btnNext = document.createElement("button");
	btnNext.className = "btn btn-primary btn-action";
	btnNext.innerHTML = "<span class=\"glyphicon glyphicon-chevron-right\"></span>";
	if (index === ResultsList.json.length - 1)
	{
		btnNext.disabled = true;
	}
	divBtnCon.appendChild(btnNext);
	
	$(btnNext).on("click", function (event)
	{
		event.preventDefault();
		var path = ResultsList.json[index + 1];
		History.push("Results.get", path);
		//--- AJAX request -> loads next result from the list ---//
		Results.getAnswers(path);
	});
	
	//--- prev button ---//
	var btnPrev = document.createElement("button");
	btnPrev.className = "btn btn-primary btn-action";
	btnPrev.innerHTML = "<span class=\"glyphicon glyphicon-chevron-left\"></span>";
	if (index === 0)
	{
		btnPrev.disabled = true;
	}
	divBtnCon.appendChild(btnPrev);
	
	$(btnPrev).on("click", function (event)
	{
		event.preventDefault();
		var path = ResultsList.json[index - 1];
		History.push("Results.get", path);
		//--- AJAX request -> loads previous result from the list ---//
		Results.getAnswers(path);
	});
	
	//--- download pdf button ---//
	var btnPdf = document.createElement("button");
	btnPdf.className = "btn btn-primary";
	btnPdf.innerHTML = "<span class=\"glyphicon glyphicon-download\"></span> <b>PDF</b>";
	$(btnPdf).on("click", function (event)
	{
		$(event.currentTarget).prop("disabled", true);
		//--- generate PDF ---//
		ResultsPdf.generate(path, answers);
		$(event.currentTarget).prop("disabled", false);
	});
	divBtnCon.appendChild(btnPdf);
};

ResultsViewer.message = function(path)
{
	var index = $.inArray(path, ResultsList.json);
	
	var divContent = document.getElementById("content");
	
	//--- message indicating position of the viewed result ---//
	var pMessage = document.createElement("p");
	pMessage.className = "text-right text-muted";
	pMessage.innerHTML = (index + 1) + " von " + ResultsList.json.length;
	divContent.appendChild(pMessage);
};

ResultsViewer.container = function (path, answers)
{
	//--- result viewer container ---//
	var divContent = document.getElementById("content");
	
	var divPanelGroup = document.createElement("div");
	divPanelGroup.className = "panel-group";	
	divContent.appendChild(divPanelGroup);
	
	var dirs = path.split("/");
	var semester = dirs[3];
	var i = 0;
	$.each(Questions.json[semester], function (keyCategory, category)
	{
		//--- headings ---//
		var divPanelBody = ResultsViewer.header(divPanelGroup, category.headerDE, keyCategory);
		$.each(category.questions, function (keyQuestion, question)
		{
			//--- questions ---//
			ResultsViewer.body(divPanelBody, i, question, answers[i]);
			i++;
		});
	});
	
	//--- collapse callbacks @see getbootstrap.com/javascript/#collapse ---//
	$(divPanelGroup).collapse();
	//--- triggered when collapse is shown ---//
	$(divPanelGroup).on("shown.bs.collapse", function ()
	{
		//--- gets id of which collapse is opened ---//
		var panel = $(".panel-collapse.collapse.in");
		if (panel.length > 0)
		{
			var i = panel.attr("id").split("-")[1];
			panel.addClass("panel-shown");
			//--- saves the state to the array collapseIn ---//
			ResultsViewer.collapseIn[i] = " in";
		}
	});
	//--- triggered when collapse is hidden ---//
	$(divPanelGroup).on("hide.bs.collapse", function ()
	{
		//--- gets id of which collapse is hidden ---//
		var panel = $(".panel-shown");
		if (panel.length > 0)
		{
			var i = panel.attr("id").split("-")[1];
			panel.removeClass("panel-shown");
			//--- saves the state to array collapseIn ---//
			ResultsViewer.collapseIn[i] = "";
		}
	});
};

ResultsViewer.header = function (divPanelGroup, header, headerCount)
{
	//--- collapse setup @see getbootstrap.com/javascript/#collapse ---//
	var divPanel = document.createElement("div");
	divPanel.className = "panel panel-default";
	divPanelGroup.appendChild(divPanel);
	
	var divPanelHeading = document.createElement("div");
	divPanelHeading.className = "panel-heading";
	divPanel.appendChild(divPanelHeading);
	
	var h4PanelTitle = document.createElement("h4");
	h4PanelTitle.className = "panel-title";
	divPanelHeading.appendChild(h4PanelTitle);
	
	var aCollapse = document.createElement("a");
	aCollapse.href = "#collapse-" + headerCount;
	aCollapse.dataset.toggle = "collapse";
	//--- header ---//
	aCollapse.innerHTML = header;
	h4PanelTitle.appendChild(aCollapse);
	
	var divPanelCollapse = document.createElement("div");
	divPanelCollapse.id = "collapse-" + headerCount;
	//--- collapseIn state will determine whether the panel should be opened or closed ---//
	divPanelCollapse.className = "panel-collapse collapse" + ResultsViewer.collapseIn[headerCount];
	divPanel.appendChild(divPanelCollapse);
	
	var divPanelBody = document.createElement("div");
	divPanelBody.id = "panel-body-results-viewer";
	divPanelBody.className = "panel-body";
	divPanelCollapse.appendChild(divPanelBody);
	
	return divPanelBody;
};

ResultsViewer.body = function (divPanelBody, key, question, answer)
{
	//--- renders question ---//
	var pQuestion = document.createElement("p");
	pQuestion.style.marginTop = "20px";
	pQuestion.innerHTML = "<b>" + (key + 1) + ". "+ question.paragraphDE + "</b>";
	divPanelBody.appendChild(pQuestion);
	
	if (question.type === "radio")
	{
		ResultsViewer.radio(divPanelBody, question, answer);
	}
	else if (question.type === "text")
	{
		ResultsViewer.textarea(divPanelBody, answer);
	}
};

ResultsViewer.radio = function (divPanelBody, question, answer)
{
	//--- renders radio buttons ---//
	var divRadioContainer = document.createElement("div");
	divRadioContainer.style.marginBottom = "15px";
	divPanelBody.appendChild(divRadioContainer);
	
	//--- renders 5 radio buttons for 5 answer options ---//
	for (var i = 1; i < 6; i++)
	{
		var divRadio = document.createElement("div");
		divRadio.className = "radio radio-disabled";
		divRadioContainer.appendChild(divRadio);
		
		var label = document.createElement("label"); 
		label.style.cursor = "default";
		divRadio.appendChild(label);
		
		//--- radio input ---//
		var input = document.createElement("input");
		input.type = "radio";
		input.disabled = true;
		input.style.cursor = "default";
		//--- checks radio button if answer is matching ---//
		if (parseInt(answer) === i)
		{
			input.checked = "true";
		}
		label.appendChild(input);
		
		//--- radio button label ---//
		var labelText = " " + i;
		if (question.labelDE[i-1].length > 0)
		{
			labelText = labelText + " (" + question.labelDE[i-1] + ")";
		}
		
		var textNode = document.createTextNode(labelText);
		label.appendChild(textNode);
	}
	
};

ResultsViewer.textarea = function(divPanelBody, answer)
{
	//--- render textarea box with answer ---//
	var divPanel = document.createElement("div");
	divPanel.className = "panel panel-default";
	divPanelBody.appendChild(divPanel);
	
	var divText = document.createElement("div");
	divText.className = "panel-body";
	divText.innerHTML = answer;
	divPanel.appendChild(divText);
};
