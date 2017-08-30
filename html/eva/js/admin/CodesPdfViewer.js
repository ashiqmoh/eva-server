//--- PDF Viewer to view PaperCodes ---//
//--- only for Chrome and Mozilla ---//
var CodesPdfViewer = {};

CodesPdfViewer.isRendered = false;

CodesPdfViewer.setup = function ()
{
	CodesPdfViewer.container();
	CodesPdfViewer.header();
	CodesPdfViewer.body();
	CodesPdfViewer.isRendered = true;
};

CodesPdfViewer.container = function ()
{
	//--- modal container ---//
	var divMain = document.getElementById("main");
	
	var divModal = document.createElement("div");
	divModal.className = "modal fade";
	divModal.id = "pdfViewer";
	divModal.tabIndex = "-1";
	divModal.setAttribute("role", "dialog");
	divModal.setAttribute("aria-labelledby", "pdfViewer");
	divModal.setAttribute("aria-hidden", "true");
	$(divModal).modal("hide");
	divMain.appendChild(divModal);
	
	var divModalDialog = document.createElement("div");
	divModalDialog.className = "modal-dialog modal-lg";
	divModal.appendChild(divModalDialog);
	
	var divModalContent = document.createElement("div");
	divModalContent.id = "modal-content-pdf-viewer";
	divModalContent.className = "modal-content";
	divModalDialog.appendChild(divModalContent);	
};

CodesPdfViewer.header = function ()
{
	//--- modal header ---//
	var divModalContent = document.getElementById("modal-content-pdf-viewer");
	
	var divModalHeader = document.createElement("div");
	divModalHeader.className = "modal-header";
	divModalHeader.style.borderBottom = "0";
	divModalContent.appendChild(divModalHeader);
	
	//--- close button ---//
	var buttonClose = document.createElement("button");
	buttonClose.className = "close";
	buttonClose.type = "button";
	buttonClose.setAttribute("data-dismiss", "modal");
	divModalHeader.appendChild(buttonClose);
	
	//--- close icon 'x' ---//
	var spanTimes = document.createElement("span");
	spanTimes.innerHTML = "&times;";
	spanTimes.setAttribute("aria-hidden", "true");
	buttonClose.appendChild(spanTimes);
	
	var spanSrOnly = document.createElement("span");
	spanSrOnly.className = "sr-only";
	spanSrOnly.innerHTML = "Close";
	buttonClose.appendChild(spanSrOnly);
};

CodesPdfViewer.body = function ()
{
	//--- modal main body ---//
	var divModalContent = document.getElementById("modal-content-pdf-viewer");
	
	var divModalBody = document.createElement("div");
	divModalBody.className = "modal-body";
	divModalContent.appendChild(divModalBody);
	
	//--- iframe will be loaded with pdf, when user clicks 'Preview PDF' button ---//
	var iframeViewer = document.createElement("iframe");
	iframeViewer.className = "iframe-viewer";
	iframeViewer.id = "iframe-viewer";
	iframeViewer.frameborder = "0";
	iframeViewer.width = "100%";
	divModalBody.appendChild(iframeViewer);
};
