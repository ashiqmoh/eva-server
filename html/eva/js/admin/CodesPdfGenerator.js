//--- generates PDF PaperCode ---//
var CodesPdfGenerator = {};

CodesPdfGenerator.school = "Hochschule Furtwangen University";
CodesPdfGenerator.website = "192.168.2.103:4567/eva";

//--- creates PDF which contains codes with cutting marks ---//
//--- called from Codes.get ---//
CodesPdfGenerator.generate = function (action, json)
{
	var doc = new jsPDF("p", "mm", "a4");
	
	// course iteration
	// json -> [object, object, ... ] (json is an array of object, object represent a course)
	// object -> { key } { val }
	// object -> {index} { codeList[], displayName, path }
	// e.g. codeList -> [abcd1234, wxyz6789, ... ];
	$.each(json, function (key, val)
	{
		var path = val.path;
		var dirs = path.split(PATH_SEP);
		
		//--- checks if codes available for the course and ---//
		//--- dirs.length == 7 -> course level ---//
		if (val.codeList.length > 0 && dirs.length === 7)
		{
			if (key > 0 && json[key - 1].codeList.length > 0)
			{
				doc.addPage(); 
			}
			
			var totalPage = Math.ceil(val.codeList.length / 21);
			
			//--- information on header and footer ---//
			var semester = dirs[3].split("-");
			var addYear = "";
			if (semester[1] === "WS")
			{
				var nextYear = parseInt(semester[0]) + 1;
				addYear = "/" + nextYear.toString().substring(2);
			}
			var year = semester[1] + " " + semester[0].substring(2) + addYear;
			
			var faculty = dirs[4].split("-")[1].trim();
			var major = dirs[5].split("-")[1].trim();
			var lecture = dirs[6].split("-")[0].trim();
			var lectureShort = dirs[6].split("-")[1].trim();
			var lecturer = val.displayName;
			var dash = " - ";
			var header = year + dash + faculty + dash + major + dash + lectureShort + dash + lecturer;
			var codeInfo = year + dash + faculty + dash + major;
			
			//--- line splittings if sentence too long ---//
			var lines1 = doc.splitTextToSize(codeInfo, 49, {"fontSize": 11, "fontStyle": "", "fontName": "Helvetica"});
			var lines2 = doc.splitTextToSize(lecture, 49, {"fontSize": 11, "fontStyle": "", "fontName": "Helvetica"});
			var lines3 = doc.splitTextToSize(lecturer, 49, {"fontSize": 11, "fontStyle": "", "fontName": "Helvetica"});
			
			var line1 = lines1.length > 1 ? lines1[0] + ' ...' : lines1[0];
			var line2 = lines2.length > 1 ? lines2[0] + ' ...' : lines2[0];
			var line3 = lines3.length > 1 ? lines3[0] + ' ...' : lines3[0];
			
			// page iteration
			for (var page = 0; page < totalPage; page++)
			{
				if (page > 0)
				{
					doc.addPage();
				}
				
				var deltaX = 56.6;
				var deltaY = 34;
				
				//--- front page ---//
				CodesPdfGenerator.header(doc, header);
				//--- page number has to be changed ---//
				CodesPdfGenerator.footer(doc, 2 * page + 1, 2 * totalPage);
				CodesPdfGenerator.title(doc, "Evaluation Codes");
				if (page === 0) CodesPdfGenerator.hinweis(doc);
				CodesPdfGenerator.cuttingMarks(doc, deltaX, deltaY);
				CodesPdfGenerator.codes(doc, page, totalPage, deltaX, deltaY, val.codeList, line1, line2, line3);
				
				//--- back page ---//
				doc.addPage();
				CodesPdfGenerator.header(doc, header);
				//--- page number has to be changed ---//
				CodesPdfGenerator.footer(doc, 2 * page + 2, 2 * totalPage);
				CodesPdfGenerator.title(doc, "Evaluation QR-Codes");
				CodesPdfGenerator.cuttingMarks(doc, deltaX, deltaY);
				CodesPdfGenerator.qrCodes(doc, page, totalPage, deltaX, deltaY, val.codeList);
			}
		}
	});
	CodesPdfGenerator.output(doc, action);
};

CodesPdfGenerator.metadata = function (doc)
{
	//--- sets pdf metadata ---//
	doc.setProperties
	({
		title: "Evaluation Codes + QR-Codes",
		subject: "Evaluation Codes + QR-Codes",
		author: CodesPdfGenerator.website,
		keywords: "evalutation, codes",
		creator: CodesPdfGenerator.school
	});
};

CodesPdfGenerator.header = function (doc, headerText)
{
	// sets font type, size and color for header
	doc.setFont("courier");
	doc.setFontSize(9);
	doc.setFontType("normal");
	doc.setTextColor(25);
	
	// prints header
	var headerlines = doc.splitTextToSize(headerText, 170, {"fontSize": 9, "fontStyle": "", "fontName": "Courier"});
	doc.text(20, 15, headerlines);
}

CodesPdfGenerator.footer = function (doc, page, totalPage)
{
	// sets font, type, size and color for footer
	doc.setFont("courier");
	doc.setFontType("normal");
	doc.setFontSize(9);
	doc.setTextColor(25);
	
	// prints footer
	doc.text(20, 297 - 15, CodesPdfGenerator.school);
	var footerRightText = "Seite " + page + '/' + totalPage;
	var textWidth = doc.getStringUnitWidth(footerRightText) * 9 * 0.3527;
	doc.text(190 - textWidth, 297 - 15, footerRightText);
};

CodesPdfGenerator.title = function (doc, title)
{
	// sets font, type, size and color for title
	doc.setFont("helvetica");
	doc.setFontType("normal");
	doc.setFontSize(15);
	doc.setTextColor(25);
	
	// prints title
	doc.text(20, 29, title);
};

CodesPdfGenerator.hinweis = function (doc)
{
	var hinweis = "Hinweis: Beidseitig ausdrucken!";
	var fontSize = 11;
	
	// sets font type, size and color for hinweis
	doc.setFont("helvetica");
	doc.setFontType("bold");
	doc.setFontSize(fontSize);
	doc.setTextColor(255, 0, 0); // red
	
	var textWidth = doc.getStringUnitWidth(hinweis) * fontSize * 0.3527;
	// prints hinweis
	doc.text(190 - textWidth, 29, hinweis);
};

CodesPdfGenerator.cuttingMarks = function (doc, deltaX, deltaY)
{
	// sets line color
	doc.setDrawColor(25);
	
	// horizontal cutting marks
	var rowLine = 36;
	for (var i = 0; i < 8; i++)
	{
		var xpos = 20;
		while (xpos < 190)
		{
			doc.line(xpos, rowLine, xpos + 2.5, rowLine);
			xpos += 5.23;
		}
		rowLine += 34;
	}
	
	// vertical cutting marks
	var columnLine = 20;
	for (var i = 0; i < 4; i++)
	{
		var ypos = 36;
		while (ypos < 274)
		{
			doc.line(columnLine, ypos, columnLine, ypos + 2.5);
			ypos += 5;
		}
		columnLine += 56.6;
	}
};

CodesPdfGenerator.codes = function (doc, page, totalPage, deltaX, deltaY, codeList, line1, line2, line3)
{
	// sets font type, size and color
	doc.setFontType("normal");
	doc.setFontSize(11);
	doc.setTextColor(25);
	
	// row interation
	var rowNeeded = 7;
	if (page === totalPage - 1)
	{
		rowNeeded = Math.ceil((codeList.length - page * 21) / 3);
	}
	for (var row = 0; row < rowNeeded; row++)
	{
		// column iteration
		var columnNeeded = 3;
		if (page === totalPage - 1)
		{
			if (row === rowNeeded - 1)
			{
				columnNeeded = codeList.length - (page * 21) - ((rowNeeded - 1) * 3);
			}
		}
		for (var column = 0; column < columnNeeded; column++)
		{
			doc.setFont("helvetica");
			doc.text(23 + column * deltaX, 45 + (row * deltaY), line1);
			doc.text(23 + column * deltaX, 45 + 5 + (row * deltaY), line2);
			doc.text(23 + column * deltaX, 45 + 10 + (row * deltaY), line3);
			doc.text(23 + column * deltaX, 45 + 15 + (row * deltaY), "Code: ");
			doc.setFont("courier");
			doc.text(23 + 13 + column * deltaX, 45 + 15 + (row * deltaY), codeList[column + (row * 3) + (page * 21)]);
			doc.text(23 + column * deltaX, 45 + 20 + (row * deltaY), CodesPdfGenerator.website);
		}
	}
};

CodesPdfGenerator.qrCodes = function (doc, page, totalPage, deltaX, deltaY, codeList)
{
	// row iteration
	var rowNeeded = 7;
	if (page === totalPage - 1)
	{
		rowNeeded = Math.ceil((codeList.length - page * 21) / 3);
	}
	for (var row = 0; row < rowNeeded; row++)
	{
		// column iteration
		var columnNeeded = 3;
		if (page === totalPage - 1)
		{
			if (row === rowNeeded - 1)
			{
				columnNeeded = codeList.length - (page * 21) - ((rowNeeded - 1) * 3);
			}
		}
		for (var column = 0; column < columnNeeded; column++)
		{
			// extract url form domain name and code
			var url = CodesPdfGenerator.website + "/#" + codeList[column + (row * 3) + (page * 21)];
			
			// generate matrix for qr-code
			var qrcode = new QRCode("qr-code");
			var oQRCode = qrcode.getCode(url);
			
			// qr-code width and height
			var width = 25;
			var height = width;
			
			// start position (coordinate) for qr-code (top left edge)
			// xPos = page left margin + column offset (which column) + box left margin
			var xPos = 20 + ((2-column) * deltaX) + ((deltaX - width) / 2);
			// yPos = page top margin + row offset (which row) + box top margin
			var yPos = 36 + (row * deltaY) + ((deltaY - height) / 2);
			
			// prints qr-code
			var nCount = oQRCode.getModuleCount();
			var nWidth = width / nCount;
			var nHeight = height / nCount;
			var nRoundedWidth = Math.round(nWidth);
			var nRoundedHeight = Math.round(nHeight);
					
			for (var nRow = 0; nRow < nCount; nRow++)
			{
				for (var nCol = 0; nCol < nCount; nCol++)
				{
					var bIsDark = oQRCode.isDark(nRow, nCol);
					var nLeft = xPos + (nCol * nWidth);
					var nTop = yPos + (nRow * nHeight);
					
					doc.setDrawColor(255);
					doc.setFillColor(255);
					doc.lineWidth = 1;
					if (bIsDark === true)
					{
						doc.setDrawColor(25);
						doc.setFillColor(25);
					}
					doc.rect(nLeft, nTop, nWidth, nHeight, 'F');		
				}
			}
			oQRCode = null;
			qrcode = null;
		}
	}
};

CodesPdfGenerator.output = function (doc, action)
{
	//--- set pdf filename here ---//
	var filename = "EvaluationCodes.pdf";
	
	//--- outputs pdf ---//
	if (action === "preview")
	{
		var viewer = document.getElementById("iframe-viewer");
		viewer.height = 0.8 * window.innerHeight;
		viewer.src = doc.output("datauristring");
	}
	if (action === "download")
	{
		doc.save(filename);
		$("#btn-download-pdf-codes").button("reset");
	}
};
