//--- renders table listing users (usename, lastname, firstname, email, edit button) ---//
var UsersTable = {};

UsersTable.setup = function (path, json)
{
	UsersTable.buttons(path);
	UsersTable.table(path, json);
};

UsersTable.buttons = function (path)
{
	var divContent = document.getElementById("content");
	
	//--- button container default ---//
	var divBtnConDefault = document.createElement("div");
	divBtnConDefault.className = "btn-container btn-container-user-default";
	divContent.appendChild(divBtnConDefault);
	
	//--- adds button '+ Benutzer' and search box to default button container ---//
	UsersTable.buttonAddUser(divBtnConDefault, path);
	UsersTable.searchBox(divBtnConDefault, "default", "selected");
	
	//--- button container selected ---//
	var divBtnConSelected = document.createElement("div");
	divBtnConSelected.className = "btn-container btn-container-user-selected";
	$(divBtnConSelected).hide();
	divContent.appendChild(divBtnConSelected);
	
	//--- adds button delete user and search box to selected button container ---//
	UsersTable.buttonDeleteUser(divBtnConSelected, path);
	UsersTable.searchBox(divBtnConSelected, "selected", "default");
};

UsersTable.buttonAddUser = function (divBtnConDefault, path)
{	
	//--- add button '+ Benutzer' ---//
	var btnAdd = document.createElement("button");
	btnAdd.className = "btn btn-primary btn-action";
	btnAdd.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> <b>Benutzer</b>";
	//--- toggle opens the modal-users ---//
	btnAdd.dataset.toggle = "modal";
	btnAdd.dataset.target = "#modal-users";
	$(btnAdd).data("path", path);
	divBtnConDefault.appendChild(btnAdd);
	
	$(btnAdd).on("click", function (event)
	{
		event.preventDefault();
		Users.editingUsername = null;
		$("#modal-title-users").html("Neue Benutzer");
		//--- resets all fields on modal ---//
		$("#form-users-username").val("");
		$("#form-users-username").prop("disabled", false);
		$("#form-users-firstname").val("");
		$("#form-users-lastname").val("");
		$("#form-users-email").val("");
		$("#form-users-sendEmail").prop("checked", true);
		$("#btn-submit-users").html("Einf&#252;gen");
		$("#form-users").data("path", $(event.currentTarget).data("path"));
		$("#form-users").data("key", "");
		$("#form-users").data("action", "new");
	});
};

UsersTable.buttonDeleteUser = function (divBtnConSelected, path)
{	
	//--- delete button ---//
	var btnDelete = document.createElement("button");
	btnDelete.className = "btn btn-danger btn-action";
	btnDelete.innerHTML = "<span class=\"glyphicon glyphicon-trash\"></span> <b>Benutzer</b>";
	//--- toggle open confirmation dialog ---//
	btnDelete.dataset.toggle = "modal";
	btnDelete.dataset.target = "#modal-confirmation-dialog";
	$(btnDelete).data("path", path);
	divBtnConSelected.appendChild(btnDelete);
	
	$(btnDelete).on("click", function (event)
	{
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		$("#modal-title-confirmation-dialog").html("Löschen?");
		$("#btn-submit-confirmation-dialog").html("Löschen");
		$("#btn-submit-confirmation-dialog").unbind("click");
		$("#btn-submit-confirmation-dialog").on("click", function ()
		{
			//--- array will be appended with checked table items' usernames ---//
			var usernamesDelete = [];
			$.each(Users.usernames, function (i, username)
			{
				if ($(".user-checkbox.checkbox-" + username).is(":checked") === true)
				{
					//--- appends ----//
					usernamesDelete.push(username);
				}
			});
			//--- AJAX request to remove user(s) ---//
			Users.remove(path, JSON.stringify(usernamesDelete));
		});
	});
};

UsersTable.searchBox = function (divBtnCon, thisId, thatId)
{
	//--- renders check box ---//
	var searchBox = document.createElement("input");
	searchBox.type = "text";
	searchBox.id = "user-list-search-box-" + thisId;
	searchBox.className = "form-control search-box";
	searchBox.placeholder = "Suche Benutzer";
	$(searchBox).data("thatId", thatId);
	divBtnCon.appendChild(searchBox);
	
	$(searchBox).on("keyup", function (event)
	{
		event.preventDefault();
		//--- query string from check box ---//
		var q = $(event.currentTarget).val();
		var thatId = $(event.currentTarget).data("thatId");
		$("#user-list-search-box-" + thatId).val(q);
		q = q.toLowerCase();
		// Users.json -> k = username, v = user object
		$.each(Users.json, function (k, v)
		{
			if (q.length === 0)
			{
				$(".user-table.row-" + k).show();
			}
			else
			{
				//--- shows matching table item ---//
				if (v.lastname.toLowerCase().indexOf(q) > -1)
				{
					$(".user-table.row-" + k).show();
				}
				else if (v.firstname.toLowerCase().indexOf(q) > -1)
				{
					$(".user-table.row-" + k).show();
				}
				else if (v.username.toLowerCase().indexOf(q) > -1)
				{
					$(".user-table.row-" + k).show();
				}
				//--- hides if not matching ---//
				else
				{
					$(".user-table.row-" + k).hide();
				}
			}
		});
	});
};

UsersTable.table = function (path, json)
{
	var divContent = document.getElementById("content");
	
	//--- table container ---//
	var table = document.createElement("table");
	table.className = "table table-hover";
	divContent.appendChild(table);
	
	UsersTable.tableHeader(table);
	UsersTable.tableBody(table, path, json);
};

UsersTable.tableHeader = function (table)
{
	//--- table header ---//
	var thead = document.createElement("thead");
	table.appendChild(thead);
	
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	
	//--- column for checkbox ---//
	var th1 = document.createElement("th");
	th1.style.width = "40px";
	tr.appendChild(th1);
	
	var checkbox = document.createElement("input");
	checkbox.className = "user-checkbox-header";
	checkbox.type = "checkbox";
	th1.appendChild(checkbox);
	
	//--- checkbox onChange -> check/uncheck all checkboxes and show/hide delete button ---//
	$(checkbox).on("change", function (event)
	{
		if ($(event.currentTarget).is(":checked") === true)
		{
			$(".user-checkbox").prop("checked", true);
			$(".user-checkbox").parents("tr").addClass("warning");
			$(".user-checkbox.checkbox-" + USER).prop("checked", false);
			$(".user-checkbox.checkbox-" + USER).parents("tr").removeClass("warning");
			$(".btn-container-user-default").hide();
			$(".btn-container-user-selected").show();
		}
		else
		{
			$(".user-checkbox").prop("checked", false);
			$(".user-checkbox").parents("tr").removeClass("warning");
			$(".btn-container-user-selected").hide();
			$(".btn-container-user-default").show();
		}
	});
	
	//--- column for username ---//
	var th2 = document.createElement("th");
	th2.innerHTML = "Benutzername";
	tr.appendChild(th2);
	
	//--- column for lastname, firstname ---//
	var th3 = document.createElement("th");
	th3.innerHTML = "Name";
	tr.appendChild(th3);
	
	//--- column for email ---//
	var th4 = document.createElement("th");
	th4.innerHTML = "Email";
	tr.appendChild(th4);
	
	//--- column for edit button 'pencil' ---//
	var th5 = document.createElement("th");
	th5.style.width = "40px";
	tr.appendChild(th5);
};

UsersTable.tableBody = function (table, path, json)
{
	//--- table body ---//
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);

	//--- json -> (username, user object) ---//
	//--- user object -> { username, firstname, lastname, email } ---//
	$.each(json, function (key, val)
	{
		var tr = document.createElement("tr");
		tr.className = "user-table row-" + key.replace(".", " ");
		tbody.appendChild(tr);
		
		UsersTable.tableItemCheckbox(tr, key);
		
		var td2 = document.createElement("td");
		td2.innerHTML = key;
		tr.appendChild(td2);
		
		var td3 = document.createElement("td");
		td3.innerHTML = val.lastname + ", " + val.firstname;
		tr.appendChild(td3);
		
		var td4 = document.createElement("td");
		td4.innerHTML = val.email;
		tr.appendChild(td4);
		
		UsersTable.tableItemEditButton(tr, path, key, val);
	});
};

UsersTable.tableItemCheckbox = function (tr, key)
{
	var td = document.createElement("td");
	tr.appendChild(td);
	
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	//--- disable checkbox if logged-in user == table item user to avoid self deletion ---//
	
	if (key === USER)
	{
		checkbox.disabled = true;
	}
	checkbox.className = "user-checkbox checkbox-" + key.replace(".", " ");
	td.appendChild(checkbox);
	
	$(checkbox).on("change", function (event)
	{
		if ($(event.currentTarget).is(":checked") === true)
		{
			$(event.currentTarget).parents("tr").addClass("warning");
			$(".btn-container-user-default").hide();
			$(".btn-container-user-selected").show();
			
			//--- if all checkboxes checked -> check checkbox in header ---//
			var isAllChecked = true;
			$.each(Users.usernames, function (i, username)
			{
				if (username !== USER && $(".user-checkbox.checkbox-" + username).is(":checked") === false)
				{
					isAllChecked = false;
				}
			});
			if (isAllChecked === true)
			{
				$(".user-checkbox-header").prop("checked", true);
			}
		}
		else
		{
			$(event.currentTarget).parents("tr").removeClass("warning");
			$(".user-checkbox-header").prop("checked", false);
			
			//--- if all checkboxes unchecked, hide selected button container and show default button container ---//
			var noneChecked = true;
			$.each(Users.usernames, function (i, username)
			{
				if ($(".user-checkbox.checkbox-" + username).is(":checked") === true)
				{
					noneChecked = false;
				}
			});
			if (noneChecked === true)
			{
				$(".btn-container-user-default").show();
				$(".btn-container-user-selected").hide();
			}
		}
	});
};

UsersTable.tableItemEditButton = function (tr, path, key, val)
{
	//--- renders edit button 'pencil' ---//
	var td = document.createElement("td");
	tr.appendChild(td);
	
	var buttonEdit = document.createElement("button");
	buttonEdit.type = "button";
	buttonEdit.className = "btn btn-link";
	buttonEdit.style.padding = "0 12px";
	buttonEdit.innerHTML = "<span class=\"glyphicon glyphicon-pencil\"></span>";
	//--- toggle opens modal-user ---//
	buttonEdit.setAttribute("data-toggle", "modal");
	buttonEdit.setAttribute("data-target", "#modal-users");
	//--- sets data required for AJAX request ---//
	$(buttonEdit).data("path", path);
	$(buttonEdit).data("key", key);
	$(buttonEdit).data("username", val.username);
	$(buttonEdit).data("firstname", val.firstname);
	$(buttonEdit).data("lastname", val.lastname);
	$(buttonEdit).data("email", val.email);
	$(buttonEdit).on("click", function (event)
	{
		event.preventDefault();
		
		Users.editingUsername = $(event.currentTarget).data("username");
		$("#modal-title-users").html(val.lastname + ", " + val.firstname);
		$("#form-users-username").val($(event.currentTarget).data("username"));
		//--- if admin, disable username field to avoid changes ---//
		if ($(event.currentTarget).data("username") === "admin")
		{
			$("#form-users-username").prop("disabled", true);
		}
		else
		{
			$("#form-users-username").prop("disabled", false);
		}
		//--- sets input fields with respective user data ---//
		$("#form-users-firstname").val($(event.currentTarget).data("firstname"));
		$("#form-users-lastname").val($(event.currentTarget).data("lastname"));
		$("#form-users-email").val($(event.currentTarget).data("email"));
		$("#form-users-sendEmail").prop("checked", false);
		$("#btn-submit-users").html("Aktualisieren");
		$("#form-users").data("path", $(event.currentTarget).data("path"));
		$("#form-users").data("key", $(event.currentTarget).data("key"));
		$("#form-users").data("action", "update");
	});
	td.appendChild(buttonEdit);
};
