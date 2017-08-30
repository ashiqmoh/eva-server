//--- confirmation dialog pop-ups before deleting anything from database ---//
var ConfirmationDialog = {};

ConfirmationDialog.isRendered = false;

ConfirmationDialog.setup = function ()
{
	var modalId = "confirmation-dialog";
	Modal.container(modalId);
	Modal.header(modalId);
	ConfirmationDialog.footer(modalId);
	ConfirmationDialog.isRendered = true;
};

ConfirmationDialog.footer = function (modalId)
{
	//--- modal consists of footer ---//
	//--- footer has 'Delete' and 'Cancel' buttons ---//
	var divModalContent = document.getElementById("modal-content-" + modalId);
	
	var divModalFooter = document.createElement("div");
	divModalFooter.className = "modal-footer";
	divModalFooter.style.borderTop = "0";
	divModalContent.appendChild(divModalFooter);
	
	//--- button cancel ---//
	var buttonDefault = document.createElement("button");
	buttonDefault.className = "btn btn-default";
	buttonDefault.setAttribute("data-dismiss", "modal");
	buttonDefault.innerHTML = "Abbrechen";
	divModalFooter.appendChild(buttonDefault);
	
	//--- button delete ---//
	var buttonDelete = document.createElement("button");
	buttonDelete.className = "btn btn-danger";
	buttonDelete.id = "btn-submit-" + modalId;
	buttonDelete.type = "submit";
	divModalFooter.appendChild(buttonDelete);
};
