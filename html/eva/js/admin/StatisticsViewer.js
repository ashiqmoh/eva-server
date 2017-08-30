//--- renders container and canvas to view statistics containing histogram, box-plot and data ---//
var StatisticsViewer = {};

StatisticsViewer.histogramBarMax = null;

StatisticsViewer.setup = function (path, json)
{
	//--- no evaluation has been submitted -> no statistics -> show message ---//
	if (json.length === 0)
	{
		StatisticsViewer.message();
		return;
	}
	//--- renders buttons ---//
	StatisticsViewer.buttons(path, json);
	
	//--- identifies max histogram bar to make as reference ---//
	StatisticsViewer.histogramBarMax = 0;
	StatisticsViewer.barMax(json);
	var content = document.getElementById("content");
	
	var semester = path.split("/")[3];
	var i = 0;
	//--- for each category in questionnaire ---//
	$.each(Questions.json[semester], function (keyC, category)
	{
		//--- renders header ---//
		StatisticsViewer.header(content, category.headerDE);
		//--- for each question in category ---//
		$.each(category.questions, function (keyQ, question)
		{
			if (question.type === "text")
			{
				StatisticsViewer.text(content, i, question.paragraphDE, json[i].feedbacks);
			}
			else if (question.type === "radio")
			{
				StatisticsViewer.radio(content, i, question, json[i]);
			}
			i++;
		});
	});
};

StatisticsViewer.message = function ()
{
	//--- message indicating no evaluation submitted ---//
	var divContent = document.getElementById("content");
	
	var pMessage = document.createElement("p");
	pMessage.className = "text-muted";
	pMessage.innerHTML = "No evaluation has been submitted yet. Please check again later.";
	divContent.appendChild(pMessage);
};

StatisticsViewer.barMax = function (data)
{
	//--- data contains JSON array of { mean, median, counts, quantile75, quantile25 } for MCQ question ---//
	//--- { feedbacks[] } for free-text-question ---//
	$.each(data, function (key, val)
	{
		//--- for free-text-question, val.counts will be undefined
		if (val.counts !== undefined)
		{
			//--- gets the maximum counts ---//
			var max = Math.max(val.counts[0], val.counts[1], val.counts[2], val.counts[3], val.counts[4]);
			if (max > StatisticsViewer.histogramBarMax)
			{
				StatisticsViewer.histogramBarMax = max;
			}
		}
	});
};

StatisticsViewer.buttons = function (path, json)
{
	var divContent = document.getElementById("content");
	
	//--- button container ---//
	var divBtnContainer = document.createElement("div");
	divBtnContainer.className = "btn-container statistics-viewer default";
	divContent.appendChild(divBtnContainer);
	
	//--- renders button help ---//
	var btnHelp = document.createElement("button");
	btnHelp.className = "btn btn-primary btn-action";
	btnHelp.innerHTML = "<span class=\"glyphicon glyphicon-question-sign\"></span>";
	btnHelp.dataset.toggle = "modal";
	btnHelp.dataset.target = "#modal-statistics-help";
	divBtnContainer.appendChild(btnHelp);
	
	//--- renders refresh button ---//
	var buttonRefresh = document.createElement("button");
	// buttonRefresh.id = "refresh-statistics";
	buttonRefresh.className = "btn btn-primary btn-action";
	buttonRefresh.innerHTML = "<span class=\"glyphicon glyphicon-refresh\"></span>";
	$(buttonRefresh).on("click", function (event)
	{
		$(event.currentTarget).prop("disabled", true);
		Statistics.get(path);
	});
	divBtnContainer.appendChild(buttonRefresh);
	
	//--- button group for download PDF with drop-down menu ---//
	var divBtnGroup = document.createElement("div");
	divBtnGroup.className = "btn-group btn-action";
	divBtnGroup.style.float = "right";
	divBtnContainer.appendChild(divBtnGroup);
	
	//--- button download PDF ---//
	var btnDownloadPdf = document.createElement("button");
	btnDownloadPdf.type = "button";
	btnDownloadPdf.id = "btn-download-stat-pdf";
	btnDownloadPdf.className = "btn btn-primary";
	btnDownloadPdf.innerHTML = "<span class=\"glyphicon glyphicon-download\"></span> <b>PDF</b>";
	$(btnDownloadPdf).on("click", function ()
	{
		$(event.currentTarget).prop("disabled", true);
		$("#btn-download-statistics-pdf").prop("disabled", true);
		StatisticsPdf.generate(path, json);
		$(event.currentTarget).prop("disabled", false);
		$("#btn-download-statistics-pdf").prop("disabled", false);
	});
	divBtnGroup.appendChild(btnDownloadPdf);
	
	//--- drop-down menu next to download PDF button ---//
	var btnCaret = document.createElement("button");
	btnCaret.type = "button";
	btnCaret.id = "btn-download-statistics-pdf";
	btnCaret.className = "btn btn-primary dropdown-toggle";
	btnCaret.dataset.toggle = "dropdown";
	btnCaret.innerHTML = "<span class=\"caret\"><span class=\"sr-only\">Toggle Dropdown</span>";
	divBtnGroup.appendChild(btnCaret);
	
	//--- drop-down menu items' container ---//
	var ulDropdownMenu = document.createElement("ul");
	ulDropdownMenu.className = "dropdown-menu";
	ulDropdownMenu.setAttribute("role", "menu");
	$(ulDropdownMenu).css("left", "auto");
	$(ulDropdownMenu).css("right", "0%");
	$(ulDropdownMenu).on("click", function (event) { event.stopPropagation(); })
	divBtnGroup.appendChild(ulDropdownMenu);
	
	//--- drop-down menu items ---//
	var items = {};
	items["histogram"] = "Histogramm";
	items["boxplot"] = "Box-Plot";
	items["data"] = "Daten";
	items["text"] = "Freitextfragen";
	$.each(items, function (key, val)
	{
		var li = document.createElement("li");
		ulDropdownMenu.appendChild(li);
		
		var divCheckbox = document.createElement("div");
		divCheckbox.className = "checkbox";
		divCheckbox.style.marginLeft = "12px";
		li.appendChild(divCheckbox);
		
		var label = document.createElement("label");
		if (key === "text") label.innerHTML = "<input type=\"checkbox\" class=\"pdf-" + key + "\" checked> " + val;
		else label.innerHTML = "<input type=\"checkbox\" class=\"pdf-radio " + key + "\" checked> " + val;
		divCheckbox.appendChild(label);
	});
	
	//--- divider between drop-down menu item and button download in drop-down menu frame ---//
	var liDivider = document.createElement("li");
	liDivider.className = "divider";
	ulDropdownMenu.appendChild(liDivider);
	
	var liBtnDownload = document.createElement("li");
	ulDropdownMenu.appendChild(liBtnDownload);
	
	//--- button download in drop-down menu frame ---//
	var btnDownload = document.createElement("button");
	btnDownload.type = "button";
	btnDownload.className = "btn btn-primary";
	btnDownload.style.width = "136px";
	btnDownload.style.marginBottom = "5px";
	btnDownload.style.marginLeft = "12px";
	btnDownload.innerHTML = "<span class=\"glyphicon glyphicon-download\"></span> <b>PDF</b>";
	$(btnDownload).on("click", function (event)
	{
		$(event.currentTarget).parents("div.btn-group").removeClass("open");
		$("#btn-download-stat-pdf").prop("disabled", true);
		$("#btn-download-statistics-pdf").prop("disabled", true);
		StatisticsPdf.generate(path, json);
		$("#btn-download-stat-pdf").prop("disabled", false);
		$("#btn-download-statistics-pdf").prop("disabled", false);
	});
	liBtnDownload.appendChild(btnDownload);
};

StatisticsViewer.header = function (content, header)
{
	//--- renders headings ---//
	var h3 = document.createElement("h3");
	h3.style.clear = "both";
	h3.innerHTML = header;
	h3.style.padding = "20px 0"
	content.appendChild(h3);
};

StatisticsViewer.text = function (content, key, question, feedbacks)
{
	//--- renders questions and feedbacks inside box for free-text-question ---//
	var p = document.createElement("p");
	p.style.clear = "both";
	p.innerHTML = "<b>" + (key + 1) + ". " + question + "</b>";
	content.appendChild(p);
	
	for (var i = 0; i < feedbacks.length; i++)
	{
		//--- box for each feedback (panel) ---//
		var divPanel = document.createElement("div");
		divPanel.className = "panel panel-default";
		if (i === (feedbacks.length - 1))
		{
			divPanel.style.marginBottom = "40px";
		}
		content.appendChild(divPanel);
		
		//--- feedback ---//
		var divText = document.createElement("div");
		divText.className = "panel-body";
		divText.innerHTML = feedbacks[i];
		divPanel.appendChild(divText);
	}
};

StatisticsViewer.radio = function (content, key, question, data)
{
	//--- tabs used to change view between histogram and box-plot ---//
	//--- @see bootstrap.com/javascript/#tabs ---//
	
	//--- container for tab and tab-panel ---//
	var divTabContainer = document.createElement("div");
	divTabContainer.className = "tab-container";
	divTabContainer.style.width = "800px";
	content.appendChild(divTabContainer);
	
	//--- tab container ---//
	var ulTab = document.createElement("ul");
	ulTab.id = "statistics-tab-" + key;
	ulTab.className = "nav nav-tabs";
	ulTab.setAttribute("role", "tablist");
	divTabContainer.appendChild(ulTab);
	
	//--- tab for questions ---//
	var liQuestion = document.createElement("li");
	liQuestion.innerHTML = "<b>" + (key + 1) + ". " + question.paragraphDE + "</b>";
	liQuestion.style.width = "700px";
	liQuestion.style.padding = "10px 0"
	ulTab.appendChild(liQuestion);
	
	//--- tab for histogram and mean ---//
	var liHistogram = document.createElement("li");
	liHistogram.id = "stat-tab-" + key + "-histogram";
	liHistogram.className = "active"; 
	ulTab.appendChild(liHistogram);
	
	var aHistogram = document.createElement("a");
	aHistogram.href = "#stat-content-" + key + "-histogram";;
	aHistogram.setAttribute("role", "tab");
	aHistogram.dataset.toggle = "tab";
	aHistogram.dataset.content = "#stat-content-" + key + "-histogram";
	aHistogram.innerHTML = "<span class=\"glyphicon glyphicon-stats\"></span>";
	//--- onClick opens tab-panel (1) ---//
	$(aHistogram).on("click", function (event)
	{
		event.preventDefault();
		$(event.currentTarget).tab("show");
	})
	liHistogram.appendChild(aHistogram);
	
	//--- tab for box-plot diagram and data ---//
	var liBoxplot = document.createElement("li");
	liBoxplot.id = "stat-tab-" + key + "-boxplot";
	ulTab.appendChild(liBoxplot);
	
	var aBoxplot = document.createElement("a");
	aBoxplot.href = "#stat-content-" + key + "-boxplot";
	aBoxplot.setAttribute("role", "tab");
	aBoxplot.dataset.toggle = "tab";
	aBoxplot.dataset.content = "#stat-content-" + key + "-boxplot";
	aBoxplot.innerHTML = "<span class=\"glyphicon glyphicon-tasks\"></span>";
	//--- onClick opens tab-panel (2) ---//
	$(aBoxplot).on("click", function (event)
	{
		event.preventDefault();
		$(event.currentTarget).tab("show");
	})
	liBoxplot.appendChild(aBoxplot);
	
	//--- tab-panel container ---//
	var divTabContent = document.createElement("div");
	divTabContent.id = "stat-tab-content-" + key;
	divTabContent.className = "tab-content";
	divTabContainer.appendChild(divTabContent);
	
	//--- tab-panel for histogram and mean (1) ---//
	var divHistogram = document.createElement("div");
	divHistogram.id ="stat-content-" + key + "-histogram";
	divHistogram.className = "tab-pane fade in active";
	divHistogram.style.position = "relative";
	divHistogram.style.height = "350px";
	divTabContent.appendChild(divHistogram);
	
	//--- tab-panel for histogram and data (2) ---//
	var divBoxplot = document.createElement("div");
	divBoxplot.id = "stat-content-" + key + "-boxplot";
	divBoxplot.className = "tab-pane fade";
	divBoxplot.style.height = "350px";
	divTabContent.appendChild(divBoxplot);
	
	//--- adds canvas to tab-panel (1) ---//
	StatisticsViewer.histogram(divHistogram, key, question, data);
	StatisticsViewer.mean(divHistogram, data);
	
	//--- adds canvas to tab-panel (2) ---//
	StatisticsViewer.boxplot(divBoxplot, key, question, data);
	StatisticsViewer.dataInfo(divBoxplot, data);
};

StatisticsViewer.histogram = function (divHistogram, key, question, data)
{
	//--- renders canvas with histogram ---//
	
	//--- canvas element and sizing ---//
	var canvas = document.createElement("canvas");
	canvas.id = "canvas-histogram-" + key;
	canvas.width = "475";
	canvas.height = "270";
	canvas.style.float = "left";
	// canvas.style.border = "1px solid black";
	divHistogram.appendChild(canvas);
	
	//--- canvas context and settings ---//
	var context = canvas.getContext("2d");
	context.beginPath();
	context.strokeStyle = "#333";
	context.fillStyle = "#333";
	
	//--- histogram drawing starts here ---//
	//--- y-axis ---//
	context.moveTo(45.5, 25);
	context.lineTo(45.5, 225.5);
	context.stroke();
	
	//--- arrow y-axis ---//
	context.moveTo(45.5, 25.5);
	context.lineTo(43.5, 29.5);
	context.lineTo(47.5, 29.5);
	context.lineTo(45.5, 25.5);
	context.fill();
	
	//--- x-axis ---//
	context.moveTo(45.5, 225.5);
	context.lineTo(440.5, 225.5);
	context.stroke();
	
	//--- arrow x-axis ---//
	context.moveTo(440.5, 225.5);
	context.lineTo(436.5, 222.5);
	context.lineTo(436.5, 228.5);
	context.lineTo(440.5, 225.5);
	context.fill();
	
	var ypos = 225;
	var gap = 20;
	var xpos = 45 + gap;
	var width = 50;
	
	context.fillStyle = "#222";
	context.font = "italic 11pt Arial";
	
	//--- y-label ---//
	context.save();
	context.translate(30.5, 100.5);
	context.rotate(-0.5 * Math.PI);
	context.alignText = "center";
	context.fillText("n = " + data.n, 0, 0);
	context.restore();
	
	//--- x-label ---//
	context.fillText(question.labelDE[0], 90 - 0.5 * context.measureText(question.labelDE[0]).width, 250);
	context.fillText(question.labelDE[4], 370 - 0.5 * context.measureText(question.labelDE[4]).width, 250);
	
	for (var i = 0; i < data.counts.length; i++)
	{
		//--- counts on top of bar ---//
		context.fillStyle = "#333";
		context.font = "bold 11pt Arial";
		context.fillText(data.counts[i], xpos + 20, ypos - 10 - (data.counts[i] / StatisticsViewer.histogramBarMax * 150));
		
		//--- bar ---//
		//--- grd -> gradient effect for histogram bar ---//
		var grd = context.createLinearGradient(xpos, ypos, xpos, ypos - (data.counts[i] / StatisticsViewer.histogramBarMax * 150));
		grd.addColorStop(0, "#a9a9a9");
		grd.addColorStop(1, "#c7c7c7");
		context.fillStyle = grd;
		context.fillRect(xpos, ypos, width, - (data.counts[i] / StatisticsViewer.histogramBarMax * 150));
		xpos = xpos + width + gap;
	}
};

StatisticsViewer.mean = function (divHistogram, data)
{
	//--- renders canvas showing mean with green, yellow or red color ---//
	
	//--- mean ---//
	var cName = "";
	//--- change coloring here ---//
	if (data.mean <= 2.5)
	{
		//--- green ---//
		cName = "mean mean-success";
	}
	else if (data.mean > 2.5 && data.mean <= 4)
	{
		//--- yellow ---//
		cName = "mean mean-warning";
	}
	else if (data.mean > 4)
	{
		//--- red ---//
		cName = "mean mean-danger";
	}
	
	//--- mean value ---//
	var divMean = document.createElement("div");
	divMean.className = cName;
	divMean.innerHTML = data.mean.replace(".", ",");
	divHistogram.appendChild(divMean);
};

StatisticsViewer.boxplot = function (divBoxplot, key, question,  data)
{
	//--- renders canvas containing box-plot diagram ---//
	
	//--- canvas element and sizing ---//
	var canvas = document.createElement("canvas");
	canvas.id = "canvas-boxplot-" + key;
	canvas.width = "600";
	canvas.height = "175";
	// canvas.style.border = "1px solid black";
	divBoxplot.appendChild(canvas);
	
	//--- canvas context ---//
	var context = canvas.getContext("2d");
	context.beginPath();
	
	//--- context settings ---//
	context.strokeStyle = "#333";
	context.lineWidth = "1";
	
	//--- box-plot drawing starts here ---//
	//--- scale on top of box-plot ---//
	context.moveTo(120.5, 44.5);
	context.lineTo(400.5, 44.5);
	context.stroke();
	for (var i = 0; i < 5; i++)
	{
		context.fillStyle = "#222";
		context.font = "italic 11pt Arial";
		context.fillText(i + 1, 120.5 + (i * 70) - (0.5 * context.measureText(i).width), 30);
		context.moveTo(120.5 + (i * 70), 38.5);
		context.lineTo(120.5 + (i * 70), 44.5);
		context.stroke();
	}
	
	//--- vertical line for limit left ---//
	context.moveTo(120.5, 60.5);
	context.lineTo(120.5, 150.5);
	context.stroke();
	
	//--- vertical line for limit right ---//
	context.moveTo(400.5, 60.5);
	context.lineTo(400.5, 150.5);
	context.stroke();
	
	//--- label1 and label5 ---//
	context.fillStyle = "#222";
	context.font = "italic 11pt Arial";
	context.fillText(question.labelDE[0], 105.5 - context.measureText(question.labelDE[0]).width, 110);
	context.fillText(question.labelDE[4], 415.5, 110);
	
	//--- middle line from limit left to box ---//
	context.moveTo(120.5, 105.5);
	context.lineTo(50.5 + data.quantile025 * 70, 105.5);
	context.stroke();
	
	//--- box ---//
	context.strokeRect(50.5 + data.quantile025 * 70, 60.5, (data.quantile075 - data.quantile025) * 70, 90);
	
	//--- middle line from box to limit right ---//
	context.moveTo(50.5 + data.quantile075 * 70, 105.5);
	context.lineTo(400.5, 105.5);
	context.stroke();
	
	//--- median line ---//
	context.beginPath();
	context.strokeStyle = "#333";
	context.lineWidth = "5";
	context.moveTo(50.5 + data.median * 70, 60.5);
	context.lineTo(50.5 + data.median * 70, 150.5);
	context.stroke();
	
	//--- mean dot ---//
	context.fillStyle = "#333";
	context.moveTo(50.5 + data.mean * 70, 105.5);
	context.arc(50.5 + data.mean * 70, 105.5, 4.5, 0, Math.PI * 2);
	context.fill();
};

StatisticsViewer.dataInfo = function (divBoxplot, data)
{
	//--- renders data information found next to box-plot diagram ---//
	
	//--- data container ---//
	var dl = document.createElement("dl");
	dl.className = "dl-horizontal pull-left";
	divBoxplot.appendChild(dl);
	
	//--- data ---//
	$.each(data, function (key, val)
	{
		var dt = document.createElement("dt");
		var dd = document.createElement("dd");
		if (key === "n")
		{
			dt.innerHTML = "N";
		}
		else if (key === "mean")
		{
			dt.innerHTML = "Mittelwert";
		}
		else if (key === "standardDeviation")
		{
			dt.innerHTML = "Standardabweichung";
		}
		else if (key === "median")
		{
			dt.innerHTML = "Median";
		}			
		else if (key === "quantile025")
		{
			dt.innerHTML = "25% Quantil";
		}
		else if (key === "quantile075")
		{
			dt.innerHTML = "75% Quantil";
		}
		dd.innerHTML = val;
		if (key !== "counts")
		{
			dl.appendChild(dt); dl.appendChild(dd);
		}
	});
	
	var dl2 = document.createElement("dl");
	dl2.className = "dl-horizontal pull-left";
	divBoxplot.appendChild(dl2);
	
	$.each(data.counts, function (key, val)
	{
		var dt = document.createElement("dt");
		var dd = document.createElement("dd");
		dt.innerHTML = "#" + (key + 1);
		dd.innerHTML = val;
		dl2.appendChild(dt);
		dl2.appendChild(dd);
	});
};
