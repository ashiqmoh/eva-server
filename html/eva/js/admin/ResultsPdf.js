//--- generates PDF for result in section 'Ergebnisse' ---//
//--- PDF generation here uses some of methods (functions) from StatisticsPdf ---//
var ResultsPdf = {};

ResultsPdf.generate = function (path, answers)
{
	if (Images.logoPdf === null)
	{
		//--- load and cache image first before generating pdf ---//
		Images.cache(ResultsPdf.generate, path, answers);
		return;
	}
	
	PDF_TITLE = "Evaluation Ergebnis";
	PAGE = 1;
	var dirs = path.split(PATH_SEP);
	var semester = dirs[3].split("-");
	
	//--- converts e.g. '2014-WS' to 'WS 2014/15' ---//
	var addYear = "";
	if (semester[1] === "WS")
	{
		var nextYear = parseInt(semester[0]) + 1;
		addYear = "/" + nextYear.toString().substring(2);
	}
	
	//--- pdf info to be printed on pdf ---//
	PDF_INFO = {};
	PDF_INFO["Semester"] = semester[1] + " " + semester[0] + addYear;
	PDF_INFO["Veranstaltung"] = dirs[6].split("-")[0].trim();
	PDF_INFO["Referenz"] = dirs[7].split(".")[0].trim();
	var courseShort = dirs[6].split("-")[1].trim();
	
	//--- ResultsPdf uses functions from StatisticsPdf, which are same ---//
	var doc = StatisticsPdf.setupDoc();
	StatisticsPdf.footer(doc);
	StatisticsPdf.titleAndLogo(doc);
	
	//--- posY -> Y-position on PDF ---//
	var posY = 38;
	posY = StatisticsPdf.info(doc, posY);
	
	//--- question counter ---//
	var i = 0;
	//--- dirs[3] -> semester, loads questionnaire set for the respective semester ---//
	$.each(Questions.json[dirs[3]], function (keyCategory, category)
	{
		//--- prints heading/header ---//
		posY = StatisticsPdf.category(doc, posY, category.headerDE);
		$.each(category.questions, function (keyQuestion, question)
		{
			if (question.type === "text")
			{
				//--- shares the same methods from StatisticsPdf to print question + free-text answer @see StatisticsPdf ---//
				posY = StatisticsPdf.question(doc, posY, i, question.paragraphDE);
				posY = StatisticsPdf.freeText(doc, posY, [answers[i]]);
			}
			else if (question.type === "radio")
			{
				posY = ResultsPdf.radio(doc, posY, i, question, answers[i]);
			}
			i++;
		});
	});
	StatisticsPdf.endOfPage(doc, posY);
	//--- outputs PDF ---//
	doc.save("Evaluation_Ergebnis_" + courseShort + "_" + PDF_INFO["Referenz"] + ".pdf");
};

ResultsPdf.radio = function (doc, posY, key, question, answer)
{
	var fontSize = 10;
	var fontHeight = fontSize * 0.3527;
	var margin = 2.5;
	var offsetX = doc.getStringUnitWidth((key + 1) + ". ") * fontHeight;
	var posX = 20;
	var lines = doc.splitTextToSize(question.paragraphDE, 85 - offsetX, { "fontSize": fontSize, "fontStyle": "normal", "fontName": "helvetica" });
	
	var contentHeight = lines.length * fontHeight + margin;
	posY = posY + margin;
	posY = StatisticsPdf.check(doc, posY, contentHeight);
	
	doc.setFontSize(fontSize);
	
	//--- question ---//
	doc.text(posX, posY + fontHeight, (key + 1) + ".");
	doc.text(posX + offsetX, posY + fontHeight, lines);
	
	//--- label1 ---//
	doc.text(posX + 85 + 25 - doc.getStringUnitWidth(question.labelDE[0]) * fontHeight, posY + fontHeight, question.labelDE[0]);
	
	//--- label5 ---//
	doc.text(posX + 85 + 60, posY + fontHeight, question.labelDE[4]);
	
	var r = 1.25;
	var gap = 5
	for (var i = 0; i < 5; i++)
	{
		//--- circle ---//
		doc.circle(137.5 + (i * gap) + 0.5 * r, posY + 0.5 * (fontHeight + r), r);
		if (parseInt(answer) === i + 1)
		{
			doc.circle(137.5 + (i * gap) + 0.5 * r, posY + 0.5 * (fontHeight + r), r - 0.5, "F");
		}
	}
	
	posY = posY + lines.length * fontHeight + 2 * margin;
	
	return posY;
};
