//--- renders table listing out semesters ---//
var SemestersTable = {};

SemestersTable.setup = function (path)
{
	SemestersTable.buttons(path);
	if (Object.keys(Semesters.json).length === 0)
	{
		//--- if no semester found, display message ---//
		SemestersTable.message();
	}
	else
	{
		SemestersTable.table(path);
	}
};

SemestersTable.buttons = function (path)
{
	var divContent = document.getElementById("content");
	
	//--- button container default ---//
	var divBtnConDefault = document.createElement("div");
	divBtnConDefault.className = "btn-container semesters-list default";
	divContent.appendChild(divBtnConDefault);
	
	SemestersTable.buttonAdd(divBtnConDefault, path);
	SemestersTable.searchBox(divBtnConDefault, "default", "selected");
	
	//--- button delete container ---//
	var divBtnConSelected = document.createElement("div");
	divBtnConSelected.className = "btn-container semesters-list selected";
	$(divBtnConSelected).hide();
	divContent.appendChild(divBtnConSelected);
	
	SemestersTable.buttonDelete(divBtnConSelected, path);
	SemestersTable.searchBox(divBtnConSelected, "selected", "default");
};

SemestersTable.buttonAdd = function (divBtnConDefault, path)
{	
	//--- button add semester ---//
	var btnAddSemester = document.createElement("button");
	btnAddSemester.className = "btn btn-primary btn-action";
	btnAddSemester.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> <b>Semester</b>";
	btnAddSemester.dataset.toggle = "modal";
	btnAddSemester.dataset.target = "#modal-semesters";
	$(btnAddSemester).data("path", path);
	divBtnConDefault.appendChild(btnAddSemester);
	
	$(btnAddSemester).on("click", function (event)
	{
		Semesters.editingSemesterName = "";
		$("#modal-title-semesters").html("Neue Semester");
		$("#form-semesters-ssws").selectpicker("val", "SS");
		$("#form-semesters-year").val("");
		$("#form-semesters-currentSemester").prop("checked", true);
		$("#form-semesters-currentSemester").prop("disabled", false);
		$("#btn-submit-semesters").html("Einf&#252;gen");
		$("#form-semesters").data("path", $(event.currentTarget).data("path"));
		$("#form-semesters").data("action", "new");
		$("#form-semesters").data("name", "");
	});
};

SemestersTable.buttonDelete = function (divBtnConSelected, path)
{	
	//--- button delete ---//
	var btnDelete = document.createElement("button");
	btnDelete.className = "btn btn-danger btn-action";
	btnDelete.innerHTML = "<span class=\"glyphicon glyphicon-trash\"></span> <b>Semester</b>";
	btnDelete.dataset.toggle = "modal";
	btnDelete.dataset.target = "#modal-confirmation-dialog";
	$(btnDelete).data("path", path);
	divBtnConSelected.appendChild(btnDelete);
	
	//--- button delete callback ---//
	$(btnDelete).on("click", function (event)
	{
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		$("#modal-title-confirmation-dialog").html("Löschen?");
		$("#btn-submit-confirmation-dialog").html("Löschen");
		$("#btn-submit-confirmation-dialog").unbind("click");
		$("#btn-submit-confirmation-dialog").on("click", function ()
		{
			var deleteNames = [];
			$.each(Semesters.json, function(key, val)
			{
				if ($(".semesters-checkbox.item-" + key).is(":checked") === true)
				{
					deleteNames.push(key);
				}
			});
			var deleteNamesAsJson = JSON.stringify(deleteNames);
			Semesters.action(path, "delete", deleteNamesAsJson, "", "", false);
		});
	});
};

SemestersTable.searchBox = function (divBtnCon, thisId, thatId)
{
	//--- renders search box ---//
	var searchBox = document.createElement("input");
	searchBox.type = "text";
	searchBox.id = "semester-list-search-box-" + thisId;
	searchBox.className = "form-control search-box";
	searchBox.placeholder = "Suche Semester";
	$(searchBox).data("thatId", thatId);
	divBtnCon.appendChild(searchBox);
	
	$(searchBox).on("keyup", function (event)
	{
		event.preventDefault();
		//--- query string from search box ---//
		var q = $(event.currentTarget).val();
		var thatId = $(event.currentTarget).data("thatId");
		$("#semester-list-search-box-" + thatId).val(q);
		q = q.toLowerCase();
		for (var i = 0; i < Semesters.searchBoxNames.length; i++)
		{
			if (q.length === 0)
			{
				$(".semester-table.row-" + i).show();
			}
			else
			{
				if (Semesters.searchBoxNames[i].toLowerCase().substring(0, q.length) === q)
				{
					//--- shows matching table element with query string ---//
					$(".semester-table.row-" + i).show();
				}
				else
				{
					$(".semester-table.row-" + i).hide();
				}
			}
		}
	});
};

SemestersTable.message = function ()
{
	var divContent = document.getElementById("content");
	
	//--- message indicating no semester found in the database ---//
	var pMessage = document.createElement("p");
	pMessage.className = "text-muted";
	pMessage.innerHTML = "Keine Semester sind in diesem Ordner gefunden. Klicken Sie auf <kbd>+ Semester</kbd> neue Semester einzuf&#252;gen."
	divContent.appendChild(pMessage);
};

SemestersTable.table = function (path)
{
	var table = document.createElement("table");
	table.className = "table table-hover";
	document.getElementById("content").appendChild(table);
	
	SemestersTable.tableHeader(table);
	SemestersTable.tableBody(table, path);
};

SemestersTable.tableHeader = function (table)
{
	var thead = document.createElement("thead");
	table.appendChild(thead);
	
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	
	//--- header column for checkbox ---//
	var th1 = document.createElement("th");
	th1.style.width = "40px";
	tr.appendChild(th1);
	
	var checkbox = document.createElement("input");
	checkbox.className = "semesters-checkbox-header";
	checkbox.type = "checkbox";
	th1.appendChild(checkbox);
	
	$(checkbox).on("change", function (event)
	{
		//--- header checkbox on check ---//
		if ($(event.currentTarget).is(":checked") === true)
		{
			//--- checks all checkboxes ---//
			$(".semesters-checkbox").prop("checked", true);
			$(".semesters-checkbox").parents("tr").addClass("warning");
			//--- except current semester. current semester cannot be deleted ---//
			$(".semesters-checkbox.item-" + Semesters.currentSemester).prop("checked", false);
			$(".semesters-checkbox.item-" + Semesters.currentSemester).parents("tr").removeClass("warning");
			$(".btn-container.semesters-list.default").hide();
			$(".btn-container.semesters-list.selected").show();
		}
		else
		{
			//--- on unCheck, unchecks all checkboxes ---//
			$(".semesters-checkbox").prop("checked", false);
			$(".semesters-checkbox").parents("tr").removeClass("warning");
			$(".btn-container.semesters-list.selected").hide();
			$(".btn-container.semesters-list.default").show();
		}
	});
	
	//--- header column for semester name ---//
	var th2 = document.createElement("th");
	th2.innerHTML = "Semester";
	tr.appendChild(th2);
	
	//---- header column for currentSemester indicator 'star' ---//
	var th3 = document.createElement("th");
	th3.innerHTML = "";
	th3.style.width = "40px";
	tr.appendChild(th3);
	
	//--- header column to edit semester 'pencil' ---//
	var th4 = document.createElement("th");
	th4.innerHTML = "";
	th4.style.width = "40px";
	tr.appendChild(th4);
};

SemestersTable.tableBody = function (table, path)
{
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	
	// key = name
	// val = path
	Semesters.searchBoxNames = [];
	var i = 0;
	$.each(Semesters.json, function (key, itemPath)
	{
		//--- converts e.g. '2014-WS' to 'WS 2014/14' ---//
		var name = key.split("-");
		var addYear = "";
		if (name[1] === "WS")
		{
			var nextYear = parseInt(name[0]) + 1;
			addYear = "/" + nextYear.toString().substring(2);
		}
		var displayName = name[1] + " " + name[0] + addYear;
		Semesters.searchBoxNames[i] = displayName;
		
		//--- table row ---//
		var tr = document.createElement("tr");
		tr.className = "semester-table row-" + i;
		tbody.appendChild(tr);
		
		SemestersTable.tableItemCheckbox(tr, key);
		SemestersTable.tableItemName(tr, displayName, key, itemPath);
		SemestersTable.tableItemCurrentSemesterIndicator(tr, key, path)
		SemestersTable.tableItemEditButton(tr, key, path);
		
		i++;
	});
};

SemestersTable.tableItemCheckbox = function (tr, key)
{
	//--- renders checkbox ---//
	var td1 = document.createElement("td");
	tr.appendChild(td1);
	
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.className = "semesters-checkbox item-" + key;
	checkbox.disabled = false;
	if (key === Semesters.currentSemester)
	{
		checkbox.disabled = true;
	}
	td1.appendChild(checkbox);
	
	$(checkbox).on("change", function (event)
	{
		if ($(event.currentTarget).is(":checked") === true)
		{
			$(event.currentTarget).parents("tr").addClass("warning");
			$(".btn-container.semesters-list.default").hide();
			$(".btn-container.semesters-list.selected").show();
			
			//--- if all checkboxes checked, checks header checkbox ---//
			var isAllChecked = true;
			$.each(Semesters.json, function(key, val)
			{
				if ($(".semesters-checkbox.item-" + key).is(":checked") === false)
				{
					isAllChecked = false;
					return false;
				}
			});
			if (isAllChecked === true)
			{
				$(".semesters-checkbox-header").prop("checked", true);
			}
		}
		else
		{
			$(event.currentTarget).parents("tr").removeClass("warning");
			$(".semesters-checkbox-header").prop("checked", false);
			//--- if all checkboxes unchecked, hide selected button container and show default button container ---//
			var isNoneChecked = true;
			$.each(Semesters.json, function(key, val)
			{
				if ($(".semesters-checkbox.item-" + key).is(":checked") === true)
				{
					isNoneChecked = false;
					return false;
				}
			});
			if (isNoneChecked === true)
			{
				$(".btn-container.semesters-list.default").show();
				$(".btn-container.semesters-list.selected").hide();
			}
		}
	});
};

SemestersTable.tableItemName = function (tr, semesterName, key, itemPath)
{
	//--- renders semester name with clickable link ---//
	var td = document.createElement("td");
	tr.appendChild(td);

	var link = document.createElement("a");
	link.innerHTML = semesterName;
	link.href = itemPath.replace(".","#").toLowerCase();
	$(link).data("path", itemPath);
	td.appendChild(link);
	
	$(link).on("click", function (event)
	{
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		History.push("DirCodes.get", path);
		DirCodes.get(path);
	});
};

SemestersTable.tableItemCurrentSemesterIndicator = function (tr, key, path)
{
	//--- renders current semester indicator 'star' ---//
	var td = document.createElement("td");
	tr.appendChild(td);
	
	var star = document.createElement("button");
	star.type = "button";
	star.className = "btn btn-link";
	star.style.padding = "0 12px";
	star.dataset.toggle = "tooltip";
	star.dataset.placement = "left";
	if (key === Semesters.currentSemester)
	{
		star.innerHTML = "<span class=\"glyphicon glyphicon-star\"></span>";
		star.title = "Aktuelles Semester";
	}
	else
	{
		star.innerHTML = "<span class=\"glyphicon glyphicon-star-empty\"></span>";
		star.title = "Make this current semester";
	}
	//--- tooltip showing message when hovered on the stars ---//
	$(star).tooltip();
	$(star).data("item-path", path);
	$(star).data("item-name", key);
	td.appendChild(star);
	
	$(star).on("click", function (event)
	{
		event.preventDefault();
		var path = $(event.currentTarget).data("item-path");
		var name = $(event.currentTarget).data("item-name");
		var ssws = name.split("-")[1];
		var year = name.split("-")[0];
		//--- AJAX request updating clicked semester of star to current semester ---//
		Semesters.action(path, "update", name, ssws, year, true);
	});
};

SemestersTable.tableItemEditButton = function (tr, key, path)
{
	//--- renders edit button 'pencil' ---//
	var name = key.split("-");
	var addYear = "";
	var nextYear = parseInt(name[0], 10) + 1;
	if (name[1] == "WS") addYear = " / " + nextYear; 
	
	var title = name[1] + " " + name[0] + addYear;
	var ssws = name[1];
	var year = name[0];
	
	var isCurrentSemester = false;
	if (key === Semesters.currentSemester)
	{
		isCurrentSemester = true;
	}
	
	var td = document.createElement("td");
	tr.appendChild(td);
	
	var buttonEdit = document.createElement("button");
	buttonEdit.type = "button";
	buttonEdit.className = "btn btn-link";
	buttonEdit.style.padding = "0 12px";
	buttonEdit.innerHTML = "<span class=\"glyphicon glyphicon-pencil\"></span>";
	//--- toggles modal-semesters onClick ---//
	buttonEdit.setAttribute("data-toggle", "modal");
	buttonEdit.setAttribute("data-target", "#modal-semesters");
	$(buttonEdit).data("item-title", title);
	$(buttonEdit).data("item-ssws", ssws);
	$(buttonEdit).data("item-year", year);
	$(buttonEdit).data("item-path", path);
	$(buttonEdit).data("item-name", key);
	$(buttonEdit).data("item-isCurrentSemester", isCurrentSemester);
	$(buttonEdit).on("click", function (event)
	{
		event.preventDefault();
		
		//--- toggle selected row(s) back to default ---//
		$(".semesters-checkbox-header").prop("checked", false);
		$(".semesters-checkbox").prop("checked", false);
		$(".semesters-checkbox").parents("tr").removeClass("warning");
		$(".btn-container.semesters-list.selected").hide();
		$(".btn-container.semesters-list.default").show();
		
		//--- set data and information of the edited semester ---//
		Semesters.editingSemesterName = $(event.currentTarget).data("item-year") + "-" + $(this).data("item-ssws");
		$("#modal-title-semesters").html($(event.currentTarget).data("item-title"));
		$("#form-semesters-ssws").selectpicker("val", $(event.currentTarget).data("item-ssws"));
		$("#form-semesters-year").val($(event.currentTarget).data("item-year"));
		$("#form-semesters-currentSemester").prop("checked", $(event.currentTarget).data("item-isCurrentSemester"));
		$("#form-semesters-currentSemester").prop("disabled", false);
		//--- disable checkbox 'Aktuelles Semester' if the editing semester is current semester to avoid user uncheck it ---//
		if ($(event.currentTarget).data("item-isCurrentSemester") === true)
		{
			$("#form-semesters-currentSemester").prop("disabled", true);
		}
		$("#btn-submit-semesters").html("Aktualisieren");
		$("#form-semesters").data("path", $(event.currentTarget).data("item-path"));
		$("#form-semesters").data("action", "update");
		$("#form-semesters").data("name", $(event.currentTarget).data("item-name"));
	});
	td.appendChild(buttonEdit);
};
