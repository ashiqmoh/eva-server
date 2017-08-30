//--- table displaying directories listing in section 'Codes' ---//
var DirCodesTable = {};

DirCodesTable.setup = function (path, json)
{
	//--- if no directories found for the given path, display message ---//
	if (json.length === 0)
	{
		DirCodesTable.message(path);
	}
	else
	{
		//--- renders buttons and table ---//
		DirCodesTable.buttons(path);
		DirCodesTable.table(path, json);
	}
};

DirCodesTable.message = function (path)
{
	//--- message indicating no directories found for the given path ---//
	var divContent = document.getElementById("content");
	
	var pMessage = document.createElement("p");
	pMessage.className = "text-muted";
	pMessage.innerHTML = "Keine " + DirCodes.levelName + " sind in diesem Ordner gefunden.";
	divContent.appendChild(pMessage);
};

DirCodesTable.buttons = function (path)
{
	//--- button containers ---//
	var divContent = document.getElementById("content");
	
	//--- default button container ---//
	var divBtnConDefault = document.createElement("div");
	divBtnConDefault.className = "btn-container dircodes-list default";	
	divContent.appendChild(divBtnConDefault);
	
	//--- appends search box to default button container ---//
	DirCodesTable.searchBox(divBtnConDefault, "default", "selected");
	
	//--- selected button container to display buttons when checkbox(es) is/are selected ---//
	var divBtnConSelected = document.createElement("div");
	divBtnConSelected.className = "btn-container dircodes-list selected";
	$(divBtnConSelected).hide();
	divContent.appendChild(divBtnConSelected);
	
	//--- appends button '+ Codes' to selected button container ---//
	DirCodesTable.btnAddCodes(divBtnConSelected, path);
	//--- appends button 'download pdf' to selected button container ---//
	DirCodesTable.btnDownloadPdf(divBtnConSelected, path);
	//--- appends search box to selected button container ---//
	DirCodesTable.searchBox(divBtnConSelected, "selected", "default");
};

DirCodesTable.btnAddCodes = function (divBtnCon, path)
{
	//--- button add codes '+ Codes' ---//
	var btnAddCodes = document.createElement("button");
	btnAddCodes.className = "btn btn-primary btn-action";
	//--- button icon + text ---//
	btnAddCodes.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> <b>Codes</b>";
	btnAddCodes.dataset.toggle = "modal";
	btnAddCodes.dataset.target = "#modal-codes";
	$(btnAddCodes).data("path", path);
	$(btnAddCodes).on("click", function (event)
	{
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		//--- array will be appended with checked table item(s) ---//
		//--- table item can be faculty, major or course ---//
		var codePaths = [];
		for (var i = 0; i < DirCodes.json.length; i++)
		{
			//--- if checkbox is checked ---//
			if ($(".dircodes-checkbox.item-" + i).is(":checked") === true)
			{
				codePaths.push(DirCodes.json[i]);
			}
		}
		$("#modal-title-codes").html("Neue Codes erzeugen");
		$("#btn-submit-codes").html("Erzeugen");
		$("#form-codes-numberOfCodes").val("");
		$("#form-codes").data("path", path);
		$("#form-codes").data("codePaths", JSON.stringify(codePaths));
	});
	divBtnCon.appendChild(btnAddCodes);
};

DirCodesTable.btnDownloadPdf = function (divBtnCon, path)
{
	//--- button download PDF ---//
	var btnDownloadPdf = document.createElement("button");
	btnDownloadPdf.id = "btn-download-pdf-codes";
	btnDownloadPdf.className = "btn btn-primary btn-action";
	btnDownloadPdf.innerHTML = "<span class=\"glyphicon glyphicon-download\"></span> <b>PDF</b>";
	$(btnDownloadPdf).data("loading-text", "<span class=\"glyphicon glyphicon-download\"></span> <b>PDF ...</b>")
	$(btnDownloadPdf).data("path", path);
	//--- onClick generates PDF PaperCode ---//
	$(btnDownloadPdf).on("click", function (event)
	{
		$(event.currentTarget).button("loading");
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		//--- array will be appended with checked table item's path ---//
		//--- table item can be faculty, major or course ---//
		var checkedPaths = [];
		for (var i = 0; i < DirCodes.json.length; i++)
		{
			if ($(".dircodes-checkbox.item-" + i).is(":checked") === true)
			{
				checkedPaths.push(DirCodes.json[i]);
			}
		}
		var codePaths = JSON.stringify(checkedPaths);
		//--- set action as 'download' ---//
		var action = "download";
		//--- AJAX request + PDF generator ---//
		Codes.get(path, codePaths, action);
	});
	divBtnCon.appendChild(btnDownloadPdf);
};

DirCodesTable.searchBox = function (divBtnCon, thisId, thatId)
{
	var searchBox = document.createElement("input");
	searchBox.type = "text";
	searchBox.id = "dircodes-list-search-box-" + thisId;
	searchBox.className = "form-control search-box";
	searchBox.placeholder = "Suche " + DirCodes.levelName;
	$(searchBox).data("thatId", thatId);
	divBtnCon.appendChild(searchBox);
	
	//--- search box on key-up listener ---//
	$(searchBox).on("keyup", function (event)
	{
		event.preventDefault();
		//--- query text ---//
		var q = $(event.currentTarget).val();
		//--- there are two search boxes ---//
		//--- one in default button container, another in selected button container ---//
		//--- on key up, text on both searh boxes will be synched ---//
		var thatId = $(event.currentTarget).data("thatId");
		$("#dircodes-list-search-box-" + thatId).val(q);
		q = q.toLowerCase();
		//--- finds matching table item(s) ---//
		for (var i = 0; i < DirCodes.names.length; i++)
		{
			if (q.length === 0)
			{
				$(".dircodes-table.row-" + i).show();
			}
			else
			{				
				if (DirCodes.names[i].toLowerCase().substring(0, q.length) === q)
				{
					$(".dircodes-table.row-" + i).show();
				}
				else
				{
					$(".dircodes-table.row-" + i).hide();
				}
			}
		}
	});
};

DirCodesTable.table = function (path)
{
	//--- directory listing table ---//
	var table = document.createElement("table");
	table.className = "table table-hover";
	document.getElementById("content").appendChild(table);
	
	DirCodesTable.tableHeader(table);
	DirCodesTable.tableBody(table, path);
};

DirCodesTable.tableHeader = function (table)
{
	var thead = document.createElement("thead");
	table.appendChild(thead);
	
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	
	var th1 = document.createElement("th");
	th1.style.width = "40px";
	tr.appendChild(th1);
	
	//--- checkbox in table header ---//
	var checkbox = document.createElement("input");
	checkbox.className = "dircodes-checkbox-header";
	checkbox.type = "checkbox";
	th1.appendChild(checkbox);
	
	//--- checkbox check/uncheck ---//
	$(checkbox).on("change", function (event)
	{
		if ($(event.currentTarget).is(":checked"))
		{
			//--- checks all table items' checkboxes ---//
			$(".dircodes-checkbox").prop("checked", true);
			$(".dircodes-checkbox").parents("tr").addClass("warning");
			$(".btn-container.dircodes-list.default").hide();
			$(".btn-container.dircodes-list.selected").show();
		}
		else
		{
			//--- unchecks all table items' checkbox ---//
			$(".dircodes-checkbox").prop("checked", false);
			$(".dircodes-checkbox").parents("tr").removeClass("warning");
			$(".btn-container.dircodes-list.default").show();
			$(".btn-container.dircodes-list.selected").hide();
		}
	});
	
	var th2 = document.createElement("th");
	th2.innerHTML = DirCodes.levelName;
	tr.appendChild(th2);
};

DirCodesTable.tableBody = function (table, path)
{
	//--- table body ---//
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	
	// key = index
	// val = path
	DirCodes.names = [];
	$.each(DirCodes.json, function (key, val)
	{
		var dirs = val.split(PATH_SEP);
		var name = dirs[dirs.length - 1];
		//--- DirCodes.name is an array holding all table item names ---//
		//--- when user search with search box, matching item will be returned ---//
		//--- based on this array element and the respective index ---//
		DirCodes.names[key] = name;
		
		var tr = document.createElement("tr");
		tr.className = "dircodes-table row-" + key;
		tbody.appendChild(tr);
		
		DirCodesTable.tableItemCheckbox(tr, key);
		DirCodesTable.tableItemName(tr, val, name);
	});
};

DirCodesTable.tableItemCheckbox = function (tr, index)
{
	var td1 = document.createElement("td");
	tr.appendChild(td1);
	
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.className = "dircodes-checkbox item-" + index;
	td1.appendChild(checkbox);
	
	//--- table item checkbox check / uncheck listener ---//
	$(checkbox).on("change", function (event)
	{
		if ($(event.currentTarget).is(":checked"))
		{
			$(event.currentTarget).parents("tr").addClass("warning");
			$(".btn-container.dircodes-list.default").hide();
			$(".btn-container.dircodes-list.selected").show();
			
			//--- if all checkboxes is checked, checkbox in header will be checked and vice versa ---//
			var isAllChecked = true;
			for (var i = 0; i < DirCodes.json.length; i++)
			{
				if ($(".dircodes-checkbox.item-" + i).is(":checked") === false)
				{
					isAllChecked = false;
					break;
				}
			}
			if (isAllChecked === true)
			{
				$(".dircodes-checkbox-header").prop("checked", true);
			}
		}
		else
		{
			$(event.currentTarget).parents("tr").removeClass("warning");
			$(".dircodes-checkbox-header").prop("checked", false);
			
			//--- if all checkboxes are unchecked, displays default button container and hide selected button container ---//
			var noneChecked = true;
			for (var i = 0; i < DirCodes.json.length; i++)
			{				
				if ($(".dircodes-checkbox.item-" + i).is(":checked") === true)
				{
					noneChecked = false;
					break;
				}
			}
			if (noneChecked === true)
			{
				$(".btn-container.dircodes-list.default").show();
				$(".btn-container.dircodes-list.selected").hide();
			}
		}
	});
};

DirCodesTable.tableItemName = function (tr, itemPath, name)
{
	var td = document.createElement("td");
	tr.appendChild(td);

	var link = document.createElement("a");
	link.innerHTML = name
	link.href = itemPath.replace(".","#").toLowerCase();
	$(link).data("path", itemPath);
	td.appendChild(link);
	
	//--- table item on click listener ---//
	$(link).on("click", function (event)
	{
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		var codePaths = JSON.stringify([path]);
		//--- push browser state to enable browser back forth navigation ---//
		//--- level 7 is course level. displays code listing, not directory listing ---//
		if (path.split(PATH_SEP).length === 7)
		{
			History.push("Codes.get", path);
			Codes.get(path, codePaths, "list");
		}
		else
		{
			History.push("DirCodes.get", path);
			DirCodes.get(path);
		}
	});
};
