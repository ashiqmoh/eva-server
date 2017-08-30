//--- renders table listing hierarchy items from server database ---//
//--- hierarchy item refers to faculty, major and course ---//
//--- hierarchy item level 3 -> faculty, level 4 -> major, level 5 -> course ---//
//--- table will be customize for different hierarchy item level ---//
var HierarchiesTable = {};

HierarchiesTable.footerInfo = {};
HierarchiesTable.dean = {};
HierarchiesTable.organizer = {};
HierarchiesTable.deanOfStudies = {};
HierarchiesTable.lecturer = {};

HierarchiesTable.setup = function (path)
{
	HierarchiesTable.buttons(path);
	//--- displays message if no hierarchy item found in the database ---//
	if (Hierarchies.totalItems === 0)
	{
		HierarchiesTable.message();
	}
	else
	{
		HierarchiesTable.table(path);
	}
	HierarchiesTable.footer(path);
};

HierarchiesTable.message = function ()
{
	//--- message indicating no hierarchy item found in database ---//
	var divContent = document.getElementById("content");
	
	var pMessage = document.createElement("p");
	pMessage.className = "text-muted";
	pMessage.innerHTML = "Keine " + Hierarchies.levelName + " ist gefunden. "
							+ "Klicken Sie auf <kbd>+ " + Hierarchies.levelName + "</kbd> neue "
							+ Hierarchies.levelName + " einzuf&#252;gen.";
	divContent.appendChild(pMessage);
};

HierarchiesTable.buttons = function (path)
{
	var divContent = document.getElementById("content");
	
	//--- button container default ---//
	var divBtnConDefault = document.createElement("div");
	divBtnConDefault.className = "btn-container hierarchies-list default";
	divContent.appendChild(divBtnConDefault);
	
	//--- button container selected ---//
	var divBtnConSelected = document.createElement("div");
	divBtnConSelected.className = "btn-container hierarchies-list selected";
	$(divBtnConSelected).hide();
	divContent.appendChild(divBtnConSelected);
	
	//--- level 3 -> faculty, only system administrator can add or update faculty hierarchy item ---//
	//--- level > 3 -> major and course, system administrator and organizer can add and update major/course hierarchy item ---//
	if (Hierarchies.level === 3 && Login.isAdmin === true)
	{
		HierarchiesTable.buttonAdd(divBtnConDefault, path);
		HierarchiesTable.buttonDelete(divBtnConSelected, path);
	}
	if (Hierarchies.level > 3)
	{
		HierarchiesTable.buttonAdd(divBtnConDefault, path);
		HierarchiesTable.buttonDelete(divBtnConSelected, path);
	}
	//--- renders search box to button containers ---//
	HierarchiesTable.searchBox(divBtnConDefault, "default", "selected");
	HierarchiesTable.searchBox(divBtnConSelected, "selected", "default");
};

HierarchiesTable.buttonAdd = function (divBtnConDefault, path)
{	
	//--- button add ---//
	var btnAdd = document.createElement("button");
	btnAdd.className = "btn btn-primary btn-action";
	btnAdd.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> <b>" + Hierarchies.levelName + "</b>";
	btnAdd.dataset.toggle = "modal";
	btnAdd.dataset.target = "#modal-hierarchies";
	$(btnAdd).data("path", path);
	divBtnConDefault.appendChild(btnAdd);
	
	//--- button add callback ---//
	$(btnAdd).on("click", function (event)
	{
		event.preventDefault();
		Hierarchies.editingItemName = null;
		$("#modal-title-hierarchies").html("Neue " + Hierarchies.levelName);
		//--- sets all input field to an empty string ---//
		$("#form-hierarchies-name").val("");
		$("#form-hierarchies-shortname").val("");
		$("#form-hierarchies-semester").val("");
		$("#form-hierarchies-dean").selectpicker("val", "");
		$("#form-hierarchies-organizer").selectpicker("val", "");
		$("#form-hierarchies-deanstudies").selectpicker("val", "");
		$("#form-hierarchies-lecturer").selectpicker("val", "");
		$("#btn-submit-hierarchies").html("Einf&#252;gen");
		$("#form-hierarchies").data("path", $(event.currentTarget).data("path"));
		$("#form-hierarchies").data("oldFolderName", "");
		$("#form-hierarchies").data("action", "new");
	});
};

HierarchiesTable.buttonDelete = function (divBtnConSelected, path)
{	
	//--- button delete ---//
	var btnDelete = document.createElement("button");
	btnDelete.className = "btn btn-danger btn-action";
	btnDelete.innerHTML = "<span class=\"glyphicon glyphicon-trash\"></span> <b>" + Hierarchies.levelName + "</b>";
	btnDelete.dataset.toggle = "modal";
	btnDelete.dataset.target = "#modal-confirmation-dialog";
	divBtnConSelected.appendChild(btnDelete);
	
	//--- button delete callback ---//
	$(btnDelete).on("click", function (event)
	{
		event.preventDefault();
		$("#modal-title-confirmation-dialog").html("Löschen?");
		$("#btn-submit-confirmation-dialog").html("Löschen");
		//--- unbind removes previously set onClick listener to 'btn-submit-confirmation-dialog' ---//
		$("#btn-submit-confirmation-dialog").unbind("click");
		$("#btn-submit-confirmation-dialog").on("click", function ()
		{
			//--- deletePaths array will be appended with path of checked hierarchy item from the table ---//
			var deletePaths = [];
			for (var i = 0; i < Hierarchies.totalItems; i++)
			{
				//--- if checkbox is checked ---//
				if ($(".hierarchies-checkbox.item-" + i).is(":checked") === true)
				{
					deletePaths.push($(".hierarchies-checkbox.item-" + i).data("path"));
				}
			}
			//--- converts array to JSON string ---//
			var paths = JSON.stringify(deletePaths);
			//--- AJAX request ---//
			Hierarchies.remove(path, paths);
		});
	});
};

HierarchiesTable.searchBox = function (divBtnCon, thisId, thatId)
{
	var searchBox = document.createElement("input");
	searchBox.type = "text";
	searchBox.id = "hierarchies-list-search-box-" + thisId;
	searchBox.className = "form-control search-box";
	searchBox.placeholder = "Suche " + Hierarchies.levelName;
	$(searchBox).data("thatId", thatId);
	divBtnCon.appendChild(searchBox);
	
	//--- search box on key-up listener ---//
	$(searchBox).on("keyup", function (event)
	{
		event.preventDefault();
		//--- query string from search box ---//
		var q = $(event.currentTarget).val();
		var thatId = $(event.currentTarget).data("thatId");
		$("#hierarchies-list-search-box-" + thatId).val(q);
		q = q.toLowerCase();
		//--- for each of hierarchy items ---//
		$.each(Hierarchies.json, function (k, v)
		{
			//--- if query string is an empty string ---//
			if (q.length === 0)
			{
				$(".hierarchies-table.row-" + k).show();
			}
			else
			{
				//--- if query string matches hierarchy item name ---//
				if (v.name.toLowerCase().substring(0, q.length) === q)
				{
					//--- show table item (row) ---//
					$(".hierarchies-table.row-" + k).show();
				}
				else
				{
					$(".hierarchies-table.row-" + k).hide();
				}
			}
		});
	});
};

HierarchiesTable.table = function (path)
{
	//--- table container ---//
	var table = document.createElement("table");
	table.className = "table table-hover";
	document.getElementById("content").appendChild(table);
	
	HierarchiesTable.tableHeader(table);
	HierarchiesTable.tableBody(table, path);
};

HierarchiesTable.tableHeader = function (table)
{
	var thead = document.createElement("thead");
	table.appendChild(thead);
	
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	
	//--- checkbox column ---//
	var th1 = document.createElement("th");
	th1.style.width = "40px";
	tr.appendChild(th1);
	
	//--- checkbox in table header ---//
	var checkbox = document.createElement("input");
	checkbox.className = "hierarchies-checkbox-header";
	checkbox.type = "checkbox";
	th1.appendChild(checkbox);
	
	//--- checkbox in table header check/uncheck listener ---//
	$(checkbox).on("change", function (event)
	{
		if ($(event.currentTarget).is(":checked") === true)
		{
			//--- checks all hierarchy items checkbox ---//
			$(".hierarchies-checkbox").prop("checked", true);
			$(".hierarchies-checkbox").parents("tr").addClass("warning");
			//--- hides default button container ---//
			$(".btn-container.hierarchies-list.default").hide();
			//--- shows selected button container ---//
			$(".btn-container.hierarchies-list.selected").show();
		}
		else
		{
			//--- unchecks all hierarchy item checkbox ---//
			$(".hierarchies-checkbox").prop("checked", false);
			$(".hierarchies-checkbox").parents("tr").removeClass("warning");
			$(".btn-container.hierarchies-list.selected").hide();
			$(".btn-container.hierarchies-list.default").show();
		}
	});
	
	//--- name column ---//
	var th2 = document.createElement("th");
	th2.innerHTML = Hierarchies.levelName;
	tr.appendChild(th2);
	
	//--- level 3 -> faculty ---//
	//--- required table column -> name, dean, organizer ---//
	if (Hierarchies.level === 3)
	{
		var th3 = document.createElement("th");
		th3.innerHTML = "Dekan";
		tr.appendChild(th3);
		
		var th4 = document.createElement("th");
		th4.innerHTML = "Organizator";
		tr.appendChild(th4);
	}
	//--- level 4 -> major ---//
	//--- required table column -> name, dean of studies ---//
	else if (Hierarchies.level === 4)
	{
		var th3 = document.createElement("th");
		th3.innerHTML = "Studiendekan";
		tr.appendChild(th3);
	}
	//--- level 5 -> course ---//
	//--- required table column -> name, semester, lecturer ---//
	else
	{
		var th3 = document.createElement("th");
		th3.innerHTML = "Fachsemester";
		tr.appendChild(th3);
		
		var th4 = document.createElement("th");
		th4.innerHTML = "Dozent/-in";
		tr.appendChild(th4);
	}
	//--- column for edit 'pencil' button ---//
	var th5 = document.createElement("th");
	th5.innerHTML = "";
	th5.style.width = "40px";
	tr.appendChild(th5);
};

HierarchiesTable.tableBody = function (table, path)
{
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	
	//--- key = index, ---//
	//--- val = name, shortname, semester, access = {username, role} ---//
	//--- table item counter ---//
	var i = 0;
	//--- caches hierarchy item names. used for search box to return matching hierarchy item ---//
	Hierarchies.itemNames = [];
	$.each(Hierarchies.json, function (key, val)
	{
		var itemName = val.name + " - " + val.shortname;
		var itemPath = path + PATH_SEP + itemName;
		
		//--- appends hierarchy item name to array ---//
		Hierarchies.itemNames[i] = itemName;
		
		//--- cache hierarchy item info to be displayed at the footer ---//
		HierarchiesTable.footerInfo[itemPath] = val;
		
		var tr = document.createElement("tr");
		tr.className = "hierarchies-table row-" + key;
		tbody.appendChild(tr);
		
		HierarchiesTable.tableItemCheckbox(tr, i, val, itemPath);
		HierarchiesTable.tableItemName(tr, val, itemPath);
		HierarchiesTable.tableItemSemester(tr, val)
		HierarchiesTable.tableItemUsers(tr, val);
		HierarchiesTable.tableItemEditButton(tr, val, path);
		
		i++;
	});
};

HierarchiesTable.tableItemCheckbox = function (tr, i, val, itemPath)
{
	var td1 = document.createElement("td");
	tr.appendChild(td1);
	
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.className = "hierarchies-checkbox item-" + i;
	$(checkbox).data("path", itemPath);
	td1.appendChild(checkbox);
	
	$(checkbox).on("change", function (event)
	{
		if ($(event.currentTarget).is(":checked") === true)
		{
			$(event.currentTarget).parents("tr").addClass("warning");
			$(".btn-container.hierarchies-list.default").hide();
			$(".btn-container.hierarchies-list.selected").show();
			
			//--- if all hierarchy items checkboxes checked -> check checkbox in the table header ---//
			var isAllChecked = true;
			for (var i = 0; i < Hierarchies.totalItems; i++)
			{
				if ($(".hierarchies-checkbox.item-" + i).is(":checked") === false)
				{
					isAllChecked = false;
					break;
				}
			}
			if (isAllChecked === true)
			{
				$(".hierarchies-checkbox-header").prop("checked", true);
			}
		}
		else
		{
			$(event.currentTarget).parents("tr").removeClass("warning");
			$(".hierarchies-checkbox-header").prop("checked", false);
			//--- if all checkboxes are unchecked, hide selected button container and show default button container ---/
			var noneChecked = true;
			for (var i = 0; i < Hierarchies.totalItems; i++)
			{
				if ($(".hierarchies-checkbox.item-" + i).is(":checked") === true)
				{
					noneChecked = false;
					break;
				}
			}
			if (noneChecked === true)
			{
				$(".btn-container.hierarchies-list.default").show();
				$(".btn-container.hierarchies-list.selected").hide();
			}
		}
	});
};

HierarchiesTable.tableItemName = function (tr, val, itemPath)
{
	var td2 = document.createElement("td");
	tr.appendChild(td2);
	
	//--- level 5 -> course. table item name without link ---//
	if (Hierarchies.level === 5)
	{
		td2.innerHTML = val.name + " - " + val.shortname;
	}
	//--- level -> faculty/major. table item name with clickable link ---//
	else
	{
		var linktd2 = document.createElement("a");
		linktd2.innerHTML = val.name + " - " + val.shortname;
		linktd2.href = itemPath.replace(".","#").toLowerCase();
		$(linktd2).data("path", itemPath);
		td2.appendChild(linktd2);
		
		$(linktd2).on("click", function (event)
		{
			event.preventDefault();
			var path = $(event.currentTarget).data("path");
			History.push("Hierarchies.get", path);
			//--- AJAX request ---//
			Hierarchies.get(path);
		});
	}
};

HierarchiesTable.tableItemSemester = function(tr, val)
{
	if (Hierarchies.level == 5)
	{
		var td3 = document.createElement("td");
		td3.innerHTML = val.semester;
		tr.appendChild(td3);
	}
};

HierarchiesTable.tableItemUsers = function(tr, val)
{
	//--- sets static variables dean, organizer, deanOfStudies, lecturer to null ---//
	//--- these static variable is used to display name at the table ---//
	//--- and set data on the modal when a hierarchy item is updated @see HierarchyTable.tableItemEditButtons() below ---//
	HierarchiesTable.dean.username = null;
	HierarchiesTable.organizer.username = null;
	HierarchiesTable.deanOfStudies.username = null;
	HierarchiesTable.lecturer.username = null;
	
	//--- for each access ---//
	//--- key = index ---//
	//--- val = user object { username, firstname, lastname, email } ---//
	$.each(val.access, function (key, val)
	{
		//--- gets the username (key) ---//
		var username = val.username;
		//--- gets user object from users database with username as the key ---//
		var user = Users.json[username];
		//--- if username not found in users database, continue with next ---//
		if (user === undefined)
		{
			return true; // continue
		}
		//--- if DEAN, cache user info to dean static variable ---//
		if (val.role === "DEAN")
		{
			HierarchiesTable.dean.username = user.username;
			HierarchiesTable.dean.firstname = user.firstname;
			HierarchiesTable.dean.lastname = user.lastname;
		}
		//--- if ORGANIZER, cache user info to organizer static variable ---//
		else if (val.role === "ORGANIZER")
		{
			HierarchiesTable.organizer.username = user.username;
			HierarchiesTable.organizer.firstname = user.firstname;
			HierarchiesTable.organizer.lastname = user.lastname;
		}
		//--- if DEAN_OF_STUDIES, cache user info to deanOfStudies static variable ---//
		else if (val.role === "DEAN_OF_STUDIES")
		{
			HierarchiesTable.deanOfStudies.username = user.username;
			HierarchiesTable.deanOfStudies.firstname = user.firstname;
			HierarchiesTable.deanOfStudies.lastname = user.lastname;
		}
		//--- if LECTURER, cache user info to lecturer static variable ---//
		else if (val.role === "LECTURER")
		{
			HierarchiesTable.lecturer.username = user.username;
			HierarchiesTable.lecturer.firstname = user.firstname;
			HierarchiesTable.lecturer.lastname = user.lastname;
		}
	});
	
	if (Hierarchies.level === 3)
	{
		var td3 = document.createElement("td");
		//--- if username not found in users database ---//
		if ($.inArray(HierarchiesTable.dean.username, Users.usernames) === -1)
		{
			//--- show warning message ---//
			td3.style.color = "#df0101";
			td3.innerHTML = "Dekan ausw&#228;hlen";
		}
		else
		{
			//--- else display user's name ---//
			td3.style.color = "#333";
			td3.innerHTML = HierarchiesTable.dean.lastname + ", " + HierarchiesTable.dean.firstname;
		}
		tr.appendChild(td3);
		
		//--- if username not found in users database ---//
		var td4 = document.createElement("td");
		if ($.inArray(HierarchiesTable.organizer.username, Users.usernames) === -1)
		{
			//--- shows warning message ---//
			td4.style.color = "#df0101";
			td4.innerHTML = "Organizator ausw&#228;hlen";
		}
		else
		{
			//--- else displays user's name ---//
			td4.style.color = "#333";
			td4.innerHTML = HierarchiesTable.organizer.lastname + ", " + HierarchiesTable.organizer.firstname;
		}
		tr.appendChild(td4);
	}
	
	else if (Hierarchies.level === 4)
	{
		var td3 = document.createElement("td");
		if ($.inArray(HierarchiesTable.deanOfStudies.username, Users.usernames) === -1)
		{
			td3.style.color = "#df0101";
			td3.innerHTML = "Studiendekan ausw&#228;hlen";
		}
		else
		{
			td3.style.color = "#333";
			td3.innerHTML = HierarchiesTable.deanOfStudies.lastname + ", " + HierarchiesTable.deanOfStudies.firstname;
		}
		tr.appendChild(td3);
	}
	
	else
	{
		var td4 = document.createElement("td");
		if ($.inArray(HierarchiesTable.lecturer.username, Users.usernames) === -1)
		{
			td4.style.color = "#df0101";
			td4.innerHTML = "Dozent/-in ausw&#228;hlen";
		}
		else
		{
			td4.style.color = "#333";
			td4.innerHTML = HierarchiesTable.lecturer.lastname + ", " + HierarchiesTable.lecturer.firstname;
		}
		tr.appendChild(td4);
	}
};

HierarchiesTable.tableItemEditButton = function (tr, val, path)
{	
	var td = document.createElement("td");
	tr.appendChild(td);
	
	var buttonEdit = document.createElement("button");
	buttonEdit.type = "button";
	buttonEdit.className = "btn btn-link";
	buttonEdit.style.padding = "0 12px";
	buttonEdit.innerHTML = "<span class=\"glyphicon glyphicon-pencil\"></span>";
	buttonEdit.setAttribute("data-toggle", "modal");
	buttonEdit.setAttribute("data-target", "#modal-hierarchies");
	$(buttonEdit).data("item-path", path);
	$(buttonEdit).data("item-oldFolderName", val.name + " - " + val.shortname);
	$(buttonEdit).data("item-name", val.name);
	$(buttonEdit).data("item-shortname", val.shortname);
	$(buttonEdit).data("item-semester", val.semester);
	$(buttonEdit).data("item-dean", HierarchiesTable.dean.username);
	$(buttonEdit).data("item-organizer", HierarchiesTable.organizer.username);
	$(buttonEdit).data("item-deanstudies", HierarchiesTable.deanOfStudies.username);
	$(buttonEdit).data("item-lecturer", HierarchiesTable.lecturer.username);
	$(buttonEdit).on("click", function (event)
	{
		event.preventDefault();
		Hierarchies.editingItemName = $(event.currentTarget).data("item-oldFolderName");
		$("#modal-title-hierarchies").html($(event.currentTarget).data("item-name"));
		$("#form-hierarchies-name").val($(event.currentTarget).data("item-name"));
		$("#form-hierarchies-shortname").val($(event.currentTarget).data("item-shortname"));
		$("#form-hierarchies-semester").val($(event.currentTarget).data("item-semester"));
		$("#form-hierarchies-dean").selectpicker("val", $(event.currentTarget).data("item-dean"));
		$("#form-hierarchies-organizer").selectpicker("val", $(event.currentTarget).data("item-organizer"));
		$("#form-hierarchies-deanstudies").selectpicker("val", $(event.currentTarget).data("item-deanstudies"));
		$("#form-hierarchies-lecturer").selectpicker("val", $(event.currentTarget).data("item-lecturer"));
		//--- only system administrator can change organizer of a faculty ---//
		if (Login.isAdmin === true)
		{
			$("#form-hierarchies-organizer").prop("disabled", false);
		}
		else
		{
			$("#form-hierarchies-organizer").prop("disabled", true);
		}
		$("#form-hierarchies-organizer").selectpicker("refresh");
		$("#btn-submit-hierarchies").html("Aktualisieren");
		$("#form-hierarchies").data("path", $(event.currentTarget).data("item-path"));
		$("#form-hierarchies").data("oldFolderName", $(event.currentTarget).data("item-oldFolderName"));
		$("#form-hierarchies").data("action", "update");
	});
	td.appendChild(buttonEdit);
};

HierarchiesTable.footer = function (path)
{
	//--- footer bar displaying hierarchy item information ---//
	var info = HierarchiesTable.footerInfo[path];
	if (info === undefined)
	{
		return;
	}	
	if (Hierarchies.level > 3)
	{
		var dlHorizontal = document.createElement("dl");
		dlHorizontal.className = "dl-horizontal alert alert-info";
		dlHorizontal.style.display = "block";
		dlHorizontal.style.color = "#333";
		dlHorizontal.style.marginTop = "20px";
		dlHorizontal.style.paddingTop = "4px";
		dlHorizontal.style.paddingBottom = "4px";
		document.getElementById("content").appendChild(dlHorizontal);
		
		var dt1 = document.createElement("dt");
		if (Hierarchies.level === 4)
		{
			dt1.innerHTML = "Fakult&#228;t";
		}
		else
		{
			dt1.innerHTML = "Studiengang";
		}
		dlHorizontal.appendChild(dt1);
		
		var dd1 = document.createElement("dd");
		dd1.innerHTML = info.name + " (" + info.shortname + ")";
		dlHorizontal.appendChild(dd1);
		
		$.each(info.access, function (key, val)
		{
			var user = Users.json[val.username];
			
			var dtUser = document.createElement("dt");
			
			if (val.role === "DEAN")
			{
				dtUser.innerHTML = "Dekan";
			}
			else if (val.role === "ORGANIZER")
			{
				dtUser.innerHTML = "Organizator";
			}
			else if (val.role === "DEAN_OF_STUDIES")
			{
				dtUser.innerHTML = "Studiendekan";
			}
			else if (val.role === "LECTURER")
			{
				dtUser.innerHTML = "Dozent/-in";
			}
			
			dlHorizontal.appendChild(dtUser);
			
			var ddUser = document.createElement("dd");
			if (user === undefined)
			{
				ddUser.innerHTML = "";
			}
			else
			{
				ddUser.innerHTML = user.lastname + ", " + user.firstname;
			}
			dlHorizontal.appendChild(ddUser);
		});
		
		var dt3 = document.createElement("dt");
		if (Hierarchies.level === 4)
		{
			dt3.innerHTML = "Studieng&#228;nge";
		}
		else
		{
			dt3.innerHTML = "Veranstaltungen";
		}
		dlHorizontal.appendChild(dt3);
		
		var dd3 = document.createElement("dd");
		dd3.innerHTML = Hierarchies.totalItems;
		dlHorizontal.appendChild(dd3)
	}
};
