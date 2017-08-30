//--- generates PDF for evaluation statistics ---//
var PDF_TITLE = null;
var PDF_INFO = null;
var PAGE = null;

var StatisticsPdf = {};

//--- generation starts here ---//
StatisticsPdf.generate = function (path, json)
{
	if (Images.logoPdf === null)
	{
		//--- load and cache image first before generating pdf ---//
		Images.cache(StatisticsPdf.generate, path, json);
		return;
	}
	
	//--- PDF title ---//
	PDF_TITLE = "Evaluation Statistik";
	PAGE = 1; 
	
	var dirs = path.split(PATH_SEP);
	
	//--- converts e.g. '2014-WS' to 'WS 2014/15' ---//
	var semester = dirs[3].split("-");
	var addYear = "";
	if (semester[1] === "WS")
	{
		var nextYear = parseInt(semester[0]) + 1;
		addYear = "/" + nextYear.toString().substring(2);
	}
	
	//--- sets PDF info to be printed ---//
	PDF_INFO = {};
	PDF_INFO["Semester"] = semester[1] + " " + semester[0] + addYear;
	PDF_INFO["Veranstaltung"] = dirs[6].split("-")[0].trim();
	
	var courseShort = dirs[6].split("-")[1].trim();
	
	//--- setup PDF ---//
	var doc = StatisticsPdf.setupDoc();
	//--- prints footer ---//
	StatisticsPdf.footer(doc);
	//--- prints title and hfu logo ---//
	StatisticsPdf.titleAndLogo(doc);
	
	//--- start Y-position 38 ---//
	var posY = 38;
	//--- prints course info ---//
	posY = StatisticsPdf.info(doc, posY);
	
	//--- prints question and statistics ---//
	var semester = path.split("/")[3];
	var key = 0;
	$.each(Questions.json[semester], function (keyC, category)
	{
		var hasPrintedHeader = false;
		var Header = category.headerDE;
		$.each(category.questions, function (keyQ, question)
		{
			if (question.type === "text" && $(".pdf-text").is(":checked") === true)
			{
				if (hasPrintedHeader === false)
				{
					posY = StatisticsPdf.category(doc, posY, Header);
					hasPrintedHeader = true;
				}
				posY = StatisticsPdf.question(doc, posY, key, question.paragraphDE);
				posY = StatisticsPdf.freeText(doc, posY, json[key].feedbacks);
			}
			else if (question.type === "radio" && $(".pdf-radio").is(":checked") === true)
			{
				if (hasPrintedHeader === false)
				{
					posY = StatisticsPdf.category(doc, posY, Header);
					hasPrintedHeader = true;
				}
				posY = StatisticsPdf.question(doc, posY, key, question.paragraphDE);
				posY = StatisticsPdf.radio(doc, posY, json[key]);
			}
			key++;
		});
	});
	//--- prints end of page indicator ---//
	StatisticsPdf.endOfPage(doc, posY);
	//--- outputs PDF ---//
	doc.save("Evaluation_Statistik_" + courseShort + ".pdf");
};

StatisticsPdf.setupDoc = function ()
{
	//--- PDF setup ---//
	var doc = new jsPDF("p", "mm", "a4");
	//--- PDF metadata ---//
	doc.setProperties
	({
		title: PDF_TITLE + " - " + PDF_INFO["Veranstaltung"],
		subject: PDF_TITLE + " - " + PDF_INFO["Veranstaltung"],
		author: "evaserver",
		keywords: "hochschule, furtwangen, university, evaluation, statistik, ergebnis",
		creator: "evaserver"
	});
	doc.setFont("helvetica");
	doc.setFontStyle("normal");
	doc.setDrawColor(50);
	doc.setTextColor(50);
	return doc;
};

StatisticsPdf.check = function (doc, posY, height)
{
	//--- checks whether got space or should start printing on new page ---//
	if ((posY + height) > 272)
	{
		doc.addPage();
		StatisticsPdf.header(doc);
		StatisticsPdf.footer(doc);
		posY = 25;
	}
	doc.setDrawColor(50);
	doc.setTextColor(50);
	return posY;
};

StatisticsPdf.titleAndLogo = function (doc)
{
	//--- prints title and logo ---//
	var fontSize = 15;
	var fontHeight = fontSize * 0.3527;
	doc.setFontSize(fontSize);
	//--- first page title ---//
	doc.text(20, 22 + fontHeight, PDF_TITLE);
	//--- first page logo ---//
	doc.addImage(Images.logoPdf, "png", 150, 20, 40, 14.75);
};

StatisticsPdf.info = function (doc, posY)
{
	//--- prints course info ---//
	var fontSize = 10;
	var fontHeight = fontSize * 0.3527;
	var margin = 1;
	
	doc.setFontSize(fontSize);
	doc.setFontStyle("bold");
	
	//--- info border top ---//
	doc.line(20, posY + margin, 190, posY + margin);
	posY = posY + 2 * margin;
	
	//--- info ---//
	$.each(PDF_INFO, function (key, val)
	{
		doc.text(20, posY + fontHeight + margin, key + ": " + val);
		posY = posY + fontHeight + 2 * margin;
	});
	
	//--- info border bottom ---//
	doc.line(20, posY + 2 * margin, 190, posY + 2 * margin);
	posY = posY + 2 * margin;
	
	doc.setFontStyle("normal");
	
	return posY;
};

StatisticsPdf.header = function (doc)
{
	//--- prints PDF page header ---//
	var fontSize = 9;
	var textWidth = doc.getStringUnitWidth(PDF_INFO["Veranstaltung"]) * fontSize * 0.3527;
	
	//--- split text if too long ---//
	var courseSplit = doc.splitTextToSize(PDF_INFO["Veranstaltung"], 80,{"fontSize":fontSize,"fontStyle":"normal","fontName":"helvetica"});
	if (courseSplit.length > 1)
	{
		courseHeader = courseSplit[0] + " ...";
	}
	else
	{
		courseHeader = PDF_INFO["Veranstaltung"];
	}
	
	doc.setFontSize(fontSize);
	//--- PDF title on header left ---//
	doc.text(20, 15, PDF_TITLE);
	//--- course name on header right ---//
	doc.text(210 - 20 - textWidth, 15, courseHeader);
};

StatisticsPdf.footer = function (doc)
{
	//--- prints PDF page footer ---//
	var fontSize = 9;
	var school = "Hochschule Furtwangen University";
	var website = "eva.hs-furtwangen.de";
	var page = "Seite " + PAGE;
	var textWidth = doc.getStringUnitWidth(page) * fontSize * 0.3527;
	
	doc.setFontSize(fontSize);
	//--- prints school name on footer left ---//
	doc.text(20, 297 - 15, school);
	//--- prints page number on footer right ---//
	doc.text(210 - 20 - textWidth, 297 - 15, page);
	
	PAGE++;
};

StatisticsPdf.margins = function (doc)
{
	//--- not used ---//
	//--- prints border lines ---//
	doc.setDrawColor(255, 0, 0);
	doc.line(20, 20, 210 - 20, 20); // top border
	doc.line(20, 20, 20, 297 - 20); // left border
	doc.line(210 - 20, 20, 210 - 20, 297 - 20); // right border
	doc.line(20, 297 - 20, 210 - 20, 297 - 20); // bottom border
	doc.setDrawColor(50);
};

StatisticsPdf.category = function (doc, posY, category)
{
	//--- prints questionnaire's category (e.g. A. Didaktische Aufbereitung) ---//
	var fontSize = 13;
	var marginTop = 5;
	var fontHeight = fontSize * 0.3527;
	var marginBottom = 1;
	
	var contentHeight = marginTop + fontHeight + marginBottom;
	posY = StatisticsPdf.check(doc, posY, contentHeight);
	
	doc.setFontSize(fontSize);
	doc.text(20, posY + marginTop + fontHeight, category);
	
	return posY + marginTop + fontHeight + marginBottom;
};

StatisticsPdf.question = function (doc, posY, key, question)
{
	//--- prints question ---//
	var fontSize = 10;
	
	var marginTop = 3;
	var fontHeight = fontSize * 0.3527;
	var marginBottom = 1;
	
	var content = (key + 1) + ". " + question;
	//--- splits text if too long ---//
	var lines = doc.splitTextToSize(content, 170, { "fontSize": fontSize, "fontStyle": "normal", "fontName": "helvetica" });
	
	//--- calculates content height ---//
	var contentHeight = marginTop + (lines.length * fontHeight) + marginBottom;
	//--- checks if can be printed on same page or need to add new page and then print ---//
	posY = StatisticsPdf.check(doc, posY, contentHeight);
	
	doc.setFontSize(fontSize);
	
	//--- prints question ---//
	var posX = 20;
	var offsetX = 0;
	for (var i = 0; i < lines.length; i++)
	{
		if (i === 1)
		{
			offsetX = doc.getStringUnitWidth((key + 1) + ". ") * fontSize * 0.3527;		
		}
		doc.text(posX + offsetX, posY + marginTop + (i + 1) * fontHeight, lines[i]);
	}
	return posY + marginTop + (lines.length * fontHeight) + marginBottom;
};

StatisticsPdf.freeText = function (doc, posY, feedbacks)
{
	//--- prints answers for free-text-question ---//
	//--- settings ---//
	var fontSize = 10;
	var margin = 1;
	var fontHeight = fontSize * 0.3527;
	var lineWidth = 0.1;
	var padding = 2;
	var left = 20;
	var right = 210 - 20;
	
	for (var i = 0; i < feedbacks.length; i++)
	{
		var lines = doc.splitTextToSize(feedbacks[i], 210 - 2 * (20 + padding), { "fontSize": fontSize, "fontStyle": "normal", "fontName": "helvetica" });
		
		var contentHeight = (2 * (margin + lineWidth + padding)) + (lines.length * (fontHeight + margin));
		posY = StatisticsPdf.check(doc, posY, contentHeight);
		
		doc.setDrawColor(200);
		doc.setFontSize(fontSize);
		
		// feedback box border top
		var top = posY + margin;
		posY = posY + margin;
		
		// feedback text (answers)
		posY = posY + lineWidth + padding;
		for (var j = 0; j < lines.length; j++)
		{
			doc.text(20 + padding, posY + fontHeight, lines[j]);
			posY = posY + fontHeight + margin;
		}
		
		//--- box ---//
		posY = posY + padding;
		doc.roundedRect(left, top, right - left, posY - top, 1, 1);
		
		posY = posY + lineWidth + margin;
	}
	return posY + 4;
};

StatisticsPdf.radio = function (doc, posY, data)
{
	//--- renders histogram, box-plot, data for MCQ questions ---//
	var contentHeight = 28.75;
	var marginTop = 3;
	var marginLeft = doc.getStringUnitWidth("99. ") * 10 * 0.3527 + 0.5;
	
	var posX = 20 + marginLeft;
	posY = posY + marginTop;
	posY = StatisticsPdf.check(doc, posY, contentHeight);
	
	var fontSize = 9;
	doc.setFontSize(fontSize);
	
	if ($(".pdf-radio.histogram").is(":checked") === true)
	{
		posX = StatisticsPdf.histogram(doc, posX, posY, fontSize, data)
	}
	if ($(".pdf-radio.boxplot").is(":checked") === true)
	{
		posX = StatisticsPdf.boxplot(doc, posX, posY, contentHeight, fontSize, data);
	}
	if ($(".pdf-radio.data").is(":checked") === true)
	{
		StatisticsPdf.data(doc, posX, posY, fontSize, data);
	}
	return posY + contentHeight;
};

StatisticsPdf.histogram = function (doc, posX, posY, fontSize, data)
{
	//--- prints histogram ---//
	var histogramHeight = 25;
	var barMaxHeight = 20;
	var barWidth = 6;
	var gap = 2;
	var histogramWidth = 5 * barWidth + 7 * gap;
	
	//--- y-axis ---//
	doc.line(posX, posY, posX, posY + histogramHeight);
	doc.line(posX, posY, posX - 1, posY + 1);
	doc.line(posX, posY, posX + 1, posY + 1);
	
	//--- x-axis ---//
	doc.line(posX, posY + histogramHeight, posX + histogramWidth, posY + histogramHeight);
	doc.line(posX + histogramWidth, posY + histogramHeight, posX + histogramWidth - 1, posY + histogramHeight - 1);
	doc.line(posX + histogramWidth, posY + histogramHeight, posX + histogramWidth - 1, posY + histogramHeight + 1);
	
	posY = posY + histogramHeight;
	posX = posX + gap;
	for (var i = 0; i < data.counts.length; i++)
	{
		//--- counts on top of bar ---//
		var txt = data.counts[i].toString();
		doc.text(posX + 0.5 * (barWidth - doc.getStringUnitWidth(txt) * fontSize * 0.3527) - 0.15, posY - 2 - (data.counts[i] / StatisticsViewer.histogramBarMax * barMaxHeight), txt);
		
		//--- bar ---//
		doc.rect(posX, posY, barWidth, - (data.counts[i] / StatisticsViewer.histogramBarMax * barMaxHeight), "F");
		posX = posX + barWidth + gap;
	}
	return posX + 17;
};

StatisticsPdf.boxplot = function (doc, posX, posY, contentHeight, fontSize, data)
{
	//--- prints box plot diagram ---//
	var fontHeight = fontSize * 0.3527;
	var margin = 1;
	
//	var marginLeft = 3;
//	posX = posX + marginLeft;
//	
//	//--- label left ---//
//	var label1 = doc.splitTextToSize(val.label1, 11, {"fontSize":fontSize,"fontStyle":"normal","fontName":"helvetica"});
//	doc.text(label1, posX, middle + 0.5 * fontSize * 0.3527);
//	
//	//--- label right ---//
//	var label1 = doc.splitTextToSize(val.label1, 16, {"fontSize":fontSize,"fontStyle":"normal","fontName":"helvetica"});
	
	var boxplotWidth = 40;
	var boxplotHeight = 12;
	var interval = 40 / 4;
	
	//--- scale ---//
	for (var i = 0; i < 5; i++)
	{
		var txt = (i+1).toString();
		doc.text(posX + (i * interval) - (0.5 * doc.getStringUnitWidth(txt) * fontHeight), posY + fontHeight, txt);
		doc.line(posX + i * interval, posY + fontHeight + margin, posX + i * interval, posY + fontHeight + margin + 1.5);
	}
	posY = posY + fontHeight + margin + 1.5;
	doc.line(posX, posY, posX + boxplotWidth, posY);
	
	posY = posY + 3;
	//--- limit left ---//
	doc.line(posX, posY, posX, posY + boxplotHeight);
	
	//--- limit right ---//
	doc.line(posX + boxplotWidth, posY, posX + boxplotWidth, posY + boxplotHeight);
	
	//--- limit left to box ---//
	doc.line(posX, posY + 0.5 * boxplotHeight, posX + (data.quantile025 - 1) * interval, posY + 0.5 * boxplotHeight);
	
	//--- box ---//
	doc.rect(posX + (data.quantile025 - 1) * interval, posY, (data.quantile075 - data.quantile025) * interval, boxplotHeight);
	
	//--- box to limit right ---//
	doc.line(posX + (data.quantile075 - 1) * interval, posY + 0.5 * boxplotHeight, posX + boxplotWidth, posY + 0.5 * boxplotHeight);
	
	//--- median line ---//
	doc.setLineWidth(0.75);
	doc.line(posX + (data.median - 1) * interval, posY, posX + (data.median - 1) * interval, posY + boxplotHeight);
	doc.setLineWidth(0.1);
	
	//--- mean point ---//
	doc.circle(posX + (data.mean - 1) * interval, posY + 0.5 * boxplotHeight, 1, 'F');
	
	return posX + boxplotWidth + 17;
};

StatisticsPdf.data = function (doc, posX, posY, fontSize, data)
{
	//--- prints data ---//
	var fontHeight = fontSize * 0.3527;
	var marginBottom = 1;
	posY = posY + fontHeight;
	
	$.each(data, function (key, val)
	{
		var txt = "";
		if (key === "n")
		{
			txt = "N = ";
		}
		else if (key === "mean")
		{
			txt = "Mittelwert = ";
		}
		else if (key === "standardDeviation")
		{
			txt = "Standardabweichung = ";
		}
		else if (key === "median")
		{
			txt = "Median = ";
		}
		else if (key === "quantile025")
		{
			txt = "25% Quantil = ";
		}
		else if (key === "quantile075")
		{
			txt = "75% Quantil = ";
		}
		
		if (key !== "counts")
		{
			doc.text(posX, posY, txt + val);
			posY = posY + fontHeight + marginBottom;
		}
	});
};

StatisticsPdf.endOfPage = function (doc, posY)
{
	//--- prints text indicating end of page ---//
	var fontSize = 9;
	var fontHeight = fontSize * 0.3527;
	var margin = 3;
	var contentHeight = margin + fontHeight;
	var txt = "- Seitenende -";
	doc.setFontSize(fontSize);
	
	if (posY === StatisticsPdf.check(doc, posY, contentHeight))
	{
		doc.text(105 - 0.5 * doc.getStringUnitWidth(txt) * fontHeight, posY + margin + fontHeight, txt);
	}
	else
	{
		doc.text(105 - 0.5 * doc.getStringUnitWidth(txt), 297 - 15, txt);
	}
};


