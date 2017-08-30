//--- displays codes as table listing ---//
var CodesTable = {};

CodesTable.whichBrowser = null;

CodesTable.setup = function (path, json)
{
	CodesTable.message(path, json);
	CodesTable.body(json);
	CodesTable.buttons(path, json);
};

CodesTable.message = function (path, json)
{
	var divContent = document.getElementById("content");
	
	var pMessage = document.createElement("p");
	pMessage.className = "text-muted";
	if (json[0].codeList.length > 0)
	{
		//--- message indicating available codes ---//
		pMessage.innerHTML = json[0].codeList.length + " Codes sind verf&#252;gbar f&#252;r dieser Veranstaltung. Für mehr Codes, klicken Sie auf <kbd>+ Codes</kbd> .";
	}
	else
	{
		//--- message indicating no codes found for the requested course ---//
		pMessage.innerHTML = "Keine Codes sind f&#252;r dieser Veranstaltung gefunden. Klicken Sie auf <kbd>+ Codes</kbd> Codes einzuf&#252;gen.";
	}
	divContent.appendChild(pMessage);
};

CodesTable.body = function (json)
{
	//--- table body ---//
	var divContent = document.getElementById("content");
	
	var ulListGroup = document.createElement("ul");
	ulListGroup.className = "list-group";
	divContent.appendChild(ulListGroup);
	
	//--- for each code, creates a table row listing the code ---//
	$.each(json[0].codeList, function (key, val)
	{
		var liListGroupItem = document.createElement("li");
		liListGroupItem.className = "list-group-item";
		liListGroupItem.innerHTML = val;
		ulListGroup.appendChild(liListGroupItem);
	});
};

CodesTable.buttons = function (path, json)
{
	var divContent = document.getElementById("content");
	
	var divBtnCon = document.createElement("div");
	divBtnCon.className = "btn-container btn-container-default";
	divContent.appendChild(divBtnCon);
	
	var dirs = path.split(PATH_SEP);
	
	CodesTable.btnAddCodes(path, divBtnCon);
	
	//--- determine client browser ---//
	if (CodesTable.whichBrowser === null)
	{
		var ua = navigator.userAgent;
	    var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i);
	    CodesTable.whichBrowser = M[1];
	    if(M[1] === 'Chrome' && ua.match(/\bOPR\/(\d+)/) != null)
	    {
	    	CodesTable.whichBrowser = "Opera";
	    }
	}
	
	if (json[0].codeList.length > 0)
	{
		//--- renders download pdf button ---//
		CodesTable.btnDownloadPdf(path, divBtnCon);
		
		//--- only chrome and firefox have built-in pdf viewer ---//
		//--- renders CodesPdfViewer only for Google Chrome and Mozilla Firefox ---//
		if (CodesTable.whichBrowser === "Chrome" || CodesTable.whichBrowser === "Firefox")
		{
			if (CodesPdfViewer.isRendered === false)
			{
				CodesPdfViewer.setup();
			}
			//--- renders Preview Pdf button ---//
			CodesTable.btnPreviewPdf(path, divBtnCon);
		}
	}
};

CodesTable.btnAddCodes = function (path, divBtnCon)
{
	//--- button to add codes ---//
	var btnAddCodes = document.createElement("button");
	btnAddCodes.className = "btn btn-primary btn-action";
	btnAddCodes.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> <b>Codes</b>";
	btnAddCodes.dataset.toggle = "modal";
	btnAddCodes.dataset.target = "#modal-codes";
	$(btnAddCodes).data("path", path);
	$(btnAddCodes).on("click", function (event)
	{
		var path = $(event.currentTarget).data("path");
		$("#modal-title-codes").html("Neue Codes erzeugen");
		$("#btn-submit-codes").html("Erzeugen");
		$("#form-codes-numberOfCodes").val("");
		$("#form-codes").data("path", path);
		$("#form-codes").data("codePaths", JSON.stringify([path]));
	});
	divBtnCon.appendChild(btnAddCodes);
};

CodesTable.btnDownloadPdf = function (path, divBtnCon)
{
	//--- button to download PaperCode as PDF ---//
	var btnDownloadPdf = document.createElement("button");
	btnDownloadPdf.id = "btn-download-pdf-codes";
	btnDownloadPdf.className = "btn btn-primary btn-action";
	btnDownloadPdf.innerHTML = "<span class=\"glyphicon glyphicon-download\"></span> <b>PDF</b>";
	$(btnDownloadPdf).data("loading-text", "<span class=\"glyphicon glyphicon-download\"></span> <b>PDF ...</b>");
	$(btnDownloadPdf).data("path", path);
	$(btnDownloadPdf).data("codePaths", JSON.stringify([path]));
	$(btnDownloadPdf).on("click", function (event)
	{
		$(event.currentTarget).button("loading");
		var path = $(event.currentTarget).data("path");
		var codePaths = $(event.currentTarget).data("codePaths");
		//--- set action as download -> PDF downloaded onClick ---//
		var action = "download";
		//--- ajax call ---//
		Codes.get(path, codePaths, action);
	});
	divBtnCon.appendChild(btnDownloadPdf);
};

CodesTable.btnPreviewPdf = function (path, divBtnCon)
{
	//--- button to preview PaperCode as PDF ---//
	var btnPreviewPdf = document.createElement("button");
	btnPreviewPdf.className = "btn btn-primary btn-action";
	btnPreviewPdf.innerHTML = "<span class=\"glyphicon glyphicon-eye-open\"></span> <b>PDF</b>";
	btnPreviewPdf.dataset.toggle = "modal";
	btnPreviewPdf.dataset.target = "#pdfViewer";
	$(btnPreviewPdf).data("path", path);
	$(btnPreviewPdf).data("codePaths", JSON.stringify([path]))
	$(btnPreviewPdf).on("click", function (event)
	{
		var path = $(event.currentTarget).data("path");
		var codePaths = $(event.currentTarget).data("codePaths");
		//--- set action as preview, pop-up modal containing PDF will be launched ---//
		var action = "preview";
		//--- ajax call ---//
		Codes.get(path, codePaths, action);
	});
	divBtnCon.appendChild(btnPreviewPdf);
};
