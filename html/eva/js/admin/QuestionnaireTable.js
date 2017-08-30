//--- renders table that display questionnaire's categories (headings) and questions ---//
//--- there are 2 level -> category level and question level ---// 
var QuestionnaireTable = {};

QuestionnaireTable.setup = function (path, json)
{
	//--- dirs.length > 4 -> question level ---//
	var dirs = path.split("/");
	if (dirs.length > 4)
	{
		//--- manipulate path (pathTemp) by adding category name (headerTemp) to the end of path ---//
		//--- to enable navigation through breadcrumb ---//
		var pathTemp = dirs[0] + "/" + dirs[1] + "/" + dirs[2] + "/";
		var headerTemp = "";
		for (var i = 3; i < dirs.length; i++)
		{
			headerTemp = headerTemp + dirs[i] + " ";
		}
		//--- before resetting dashboard ---//
		Dashboard.reset(pathTemp + headerTemp);
	}
	//--- level -> category level ---//
	else
	{
		Dashboard.reset(path);
	}
	QuestionnaireTable.buttons(path, json);
	//--- if no category/question found ---//
	if (json.length === 0)
	{
		QuestionnaireTable.message();
	}
	else
	{
		QuestionnaireTable.notice();
		QuestionnaireTable.table(path, json);
	}
};

QuestionnaireTable.buttons = function (path, json)
{
	var divContent = document.getElementById("content");
	
	//--- button container default ---//
	var divBtnConDefault = document.createElement("div");
	divBtnConDefault.className = "btn-container questionnaire-list default";
	divContent.appendChild(divBtnConDefault);
	
	//--- if questionnaire is not changeable -> don't render add button ---//
	if (Questionnaire.isChangeable === true)
	{
		QuestionnaireTable.buttonAdd(divBtnConDefault, path);
	}
	//--- button demo ---//
	QuestionnaireTable.buttonDemo(divBtnConDefault, json);
	//--- search box ---//
	QuestionnaireTable.searchBox(divBtnConDefault, "default", "selected");
	
	if (Questionnaire.isChangeable === true)
	{
		//--- button delete container ---//
		var divBtnConSelected = document.createElement("div");
		divBtnConSelected.className = "btn-container questionnaire-list selected";
		$(divBtnConSelected).hide();
		divContent.appendChild(divBtnConSelected);
		
		//--- button delete ---//
		QuestionnaireTable.buttonDelete(divBtnConSelected, path);
		//--- search box ---//
		QuestionnaireTable.searchBox(divBtnConSelected, "selected", "default");
	}
};

QuestionnaireTable.buttonDemo = function (divBtnConDefault, json)
{
	//--- renders button demo questionnaire ---//
	var btnDemo = document.createElement("button");
	btnDemo.className = "btn btn-primary btn-action";
	btnDemo.innerHTML = "<span class=\"glyphicon glyphicon-eye-open\"></span> <b>Demo</b>";
	//--- toggles open modal-questionnaire-demo ---//
	btnDemo.dataset.toggle = "modal";
	btnDemo.dataset.target = "#modal-questionnaire-demo";
	if (json.length == 0)
	{
		btnDemo.disabled = true;
	}
	divBtnConDefault.appendChild(btnDemo);
	
	//--- button demo on click listener ---//
	$(btnDemo).on("click", function (event)
	{
		event.preventDefault();
		//--- initialize content of modal-questionnaire-demo with slides, carousel and progressbar ---//
		QuestionnaireDemo.initSlide();
		QuestionnaireDemo.initCarousel();
		QuestionnaireDemo.initProgressbar();
		QuestionnaireDemo.setSlide();
	});
};

QuestionnaireTable.buttonAdd = function (divBtnConDefault, path)
{	
	//--- renders button add ---//
	var btnAdd = document.createElement("button");
	btnAdd.className = "btn btn-primary btn-action";
	btnAdd.innerHTML = "<span class=\"glyphicon glyphicon-plus\"></span> <b>" + Questionnaire.levelName + "</b>";
	//--- toggles open modal-category or modal-question based on questionnaire level ---//
	btnAdd.dataset.toggle = "modal";
	btnAdd.dataset.target = "#modal-" + Questionnaire.level;
	$(btnAdd).data("path", path);
	divBtnConDefault.appendChild(btnAdd);
	
	if (Questionnaire.level === "category")
	{
		$(btnAdd).on("click", function (event)
		{
			Questionnaire.editingHeaderDE = null;
			$(".form-control.form-category.input").prop("disabled", false);
			$("#modal-title-category").html("Neue Überschrift");
			//--- reset input fields to empty string ---//
			$("#form-category-headerDE").val("");
			$("#form-category-headerEN").val("");
			$("#btn-submit-category").html("Einf&#252;gen");
			$("#form-category").data("path", $(event.currentTarget).data("path"));
			$("#form-category").data("action", "add");
			$("#form-category").data("oldHeaderDEAsJson", "");
		});
	}
	else if (Questionnaire.level === "question")
	{
		$(btnAdd).on("click", function (event)
		{
			Questionnaire.editingParagraphDE = null;
			$("#modal-title-question").html("Neue Frage");
			$("#form-question-type").selectpicker("val", "radio");
			$(".form-control.form-question.input").prop("disabled", false);
			$(".form-group.question-label").show();
			$("#form-question-paragraphDE").val("");
			$("#form-question-paragraphEN").val("");
			$("#form-question-label1DE").val("");
			$("#form-question-label2DE").val("");
			$("#form-question-label3DE").val("");
			$("#form-question-label4DE").val("");
			$("#form-question-label5DE").val("");
			$("#form-question-label1EN").val("");
			$("#form-question-label2EN").val("");
			$("#form-question-label3EN").val("");
			$("#form-question-label4EN").val("");
			$("#form-question-label5EN").val("");
			$("#btn-submit-question").html("Einf&#252;gen");
			$("#form-question").data("path", $(event.currentTarget).data("path"));
			$("#form-question").data("action", "add");
			$("#form-question").data("oldParagraphDEAsJson", "");
		});
	}
};

QuestionnaireTable.buttonDelete = function (divBtnConSelected, path)
{
	//--- renders delete button ---//
	var btnDelete = document.createElement("button");
	btnDelete.className = "btn btn-danger btn-action";
	btnDelete.innerHTML = "<span class=\"glyphicon glyphicon-trash\"></span> <b>" + Questionnaire.levelName + "</b>";
	//--- toggle open modal-confirmation-dialog ---//
	btnDelete.dataset.toggle = "modal";
	btnDelete.dataset.target = "#modal-confirmation-dialog";
	$(btnDelete).data("path", path);
	divBtnConSelected.appendChild(btnDelete);
	
	$(btnDelete).on("click", function (event)
	{
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		$("#modal-title-confirmation-dialog").html("Löschen?");
		//--- button submit (Löschen) on modal-confirmation-dialog ---//
		$("#btn-submit-confirmation-dialog").html("Löschen");
		//--- remove previous on click listener ---//
		$("#btn-submit-confirmation-dialog").unbind("click");
		//--- button submit on click listener ---//
		$("#btn-submit-confirmation-dialog").on("click", function ()
		{
			//--- category or questions to be deleted will be appended in this array ---//
			var itemsToDelete = [];
			$.each(Questionnaire.items, function (key, val)
			{
				//--- category or question that is checked will be appended to the array ---//
				if ($(".questionnaire-checkbox.item-" + key).is(":checked") === true)
				{
					itemsToDelete.push(val);
				}
			});
			//--- converts array to JSON string ---//
			var itemsToDeleteAsJson = JSON.stringify(itemsToDelete);
			if (Questionnaire.level === "category")
			{
				//--- AJAX request ---//
				Questionnaire.addUpdateRemoveSortCategory(path, "remove", null, null, itemsToDeleteAsJson, null);
			}
			else if (Questionnaire.level === "question")
			{
				//--- AJAX request ---//
				Questionnaire.addUpdateRemoveSortQuestion(path, "remove", Questionnaire.header, null, null, null, null, null, itemsToDeleteAsJson, null);
			}
		});
	});
};

QuestionnaireTable.searchBox = function (divBtnCon, thisId, thatId)
{
	//--- renders search box ---//
	var searchBox = document.createElement("input");
	searchBox.type = "text";
	searchBox.id = "questionnaire-list-search-box-" + thisId;
	searchBox.className = "form-control search-box";
	searchBox.placeholder = "Suche " + Questionnaire.levelName;
	$(searchBox).data("thatId", thatId);
	divBtnCon.appendChild(searchBox);
	
	$(searchBox).on("keyup", function (event)
	{
		event.preventDefault();
		//--- query string from search box ---//
		var q = $(event.currentTarget).val();
		var thatId = $(event.currentTarget).data("thatId");
		$("#questionnaire-list-search-box-" + thatId).val(q);
		q = q.toLowerCase();
		for (var i = 0; i < Questionnaire.items.length; i++)
		{
			if (q.length === 0)
			{
				$(".questionnaire-table.row-" + i).show();
			}
			else
			{
				//--- shows matching elements (table row) with query string ---//
				if (Questionnaire.items[i].toLowerCase().indexOf(q) > -1)
				{
					$(".questionnaire-table.row-" + i).show();
				}
				//--- else hide ---//
				else
				{
					$(".questionnaire-table.row-" + i).hide();
				}
			}
		}
	});
};

QuestionnaireTable.message = function ()
{
	//--- displays message if no category or question found ---//
	var divContent = document.getElementById("content");
	
	var pMessage = document.createElement("p");
	pMessage.className = "text-muted";
	pMessage.innerHTML = "Klicken Sie auf <kbd>+ " + Questionnaire.levelName + "</kbd> neue "
							+ Questionnaire.levelName + " einzuf&#252;gen.";
	divContent.appendChild(pMessage);
};

QuestionnaireTable.notice = function ()
{
	//--- displays notice telling whether questionnaire is changeable or not ---//
	var notice = "Fragebogen für Semester ";
	var noticeClass = "text-muted";
	var name = Questionnaire.semester.split("-");
	
	//--- converts e.g. '2014-WS' to 'WS 2014/15' and '2014-SS' to 'SS 2014' ---//
	var addYear = "";
	if (name[1] === "WS")
	{
		var nextYear = parseInt(name[0]) + 1;
		addYear = "/" + nextYear.toString().substring(2);
	}
	var displaySemester = name[1] + " " + name[0] + addYear;
	
	notice = notice + displaySemester;
	
	if (Questionnaire.isChangeable === false)
	{
		notice = notice + " ist nicht veränderbar"
		noticeClass = "text-danger";
	}
	else
	{
		notice = notice + "<br/>Nach der Abgabe der ersten Evaluation ist der Fragebogen nicht mehr änderbar";
	}
	
	var divContent = document.getElementById("content");
	
	var pNotice = document.createElement("p");
	pNotice.className = noticeClass;
	pNotice.innerHTML = notice;
	divContent.appendChild(pNotice);
};

QuestionnaireTable.table = function (path, json)
{
	//--- table ---//
	var divContent = document.getElementById("content");
	
	var table = document.createElement("table");
	table.className = "table table-hover";
	divContent.appendChild(table);
	
	QuestionnaireTable.tableHeader(table);
	QuestionnaireTable.tableBody(table, path, json);
};

QuestionnaireTable.tableHeader = function (table)
{
	var thead = document.createElement("thead");
	table.appendChild(thead);
	
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	
	if (Questionnaire.isChangeable === true)
	{
		//--- checkbox column ---//
		var th1 = document.createElement("th");
		th1.style.width = "40px";
		tr.appendChild(th1);
		
		var checkbox = document.createElement("input");
		checkbox.className = "questionnaire-checkbox-header";
		checkbox.type = "checkbox";
		th1.appendChild(checkbox);
		
		$(checkbox).on("change", function (event)
		{
			if ($(event.currentTarget).is(":checked") === true)
			{
				$(".questionnaire-checkbox").prop("checked", true);
				$(".questionnaire-checkbox").parents("tr").addClass("warning");
				$(".btn-container.questionnaire-list.default").hide();
				$(".btn-container.questionnaire-list.selected").show();
			}
			else
			{
				$(".questionnaire-checkbox").prop("checked", false);
				$(".questionnaire-checkbox").parents("tr").removeClass("warning");
				$(".btn-container.questionnaire-list.selected").hide();
				$(".btn-container.questionnaire-list.default").show();
			}
		});
	}
	
	//--- category OR question column depending on level ---//
	var th2 = document.createElement("th");
	th2.innerHTML = Questionnaire.levelName;
	tr.appendChild(th2);
	
	//--- if changeable -> column for arrow up button used for sorting ---//
	//--- if not changeable -> column for preview button ---//
	var th3 = document.createElement("th");
	th3.innerHTML = "";
	th3.style.width = "40px";
	tr.appendChild(th3);
	
	if (Questionnaire.isChangeable === true)
	{
		//--- column for button arrow down used for sorting ---//
		var th4 = document.createElement("th");
		th4.innerHTML = "";
		th4.style.width = "40px";
		tr.appendChild(th4);
		
		//--- column for button edit (pencil) ---//
		var th5 = document.createElement("th");
		th5.innerHTML = "";
		th5.style.width = "40px";
		tr.appendChild(th5);
	}
};

QuestionnaireTable.tableBody = function (table, path, json)
{
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	
	// json -> { isChangeable, [categories] }
	// json.categories -> [key]{ headerDE, headerEN, [questions] }
	// json.categories.question -> [key]{ type, paragraphDE, paragraphEN, label1DE, label1EN, label5DE, label5EN }
	Questionnaire.items = [];
	$.each(json, function (key, val)
	{
		if (Questionnaire.level === "category")
		{
			//--- headerDE acts as key ---//
			Questionnaire.items[key] = val.headerDE;
		}
		else
		{
			//--- paragraphDE acts as key ---//
			Questionnaire.items[key] = val.paragraphDE;
		}
		
		var tr = document.createElement("tr");
		tr.className = "questionnaire-table row-" + key;
		tbody.appendChild(tr);
		
		if (Questionnaire.isChangeable === true)
		{
			QuestionnaireTable.tableItemCheckbox(tr, key);
		}
		QuestionnaireTable.tableItemName(tr, path, val);
		if (Questionnaire.isChangeable === true)
		{
			//--- if first item, hide arrow up ---//
			if (key === 0)
			{
				QuestionnaireTable.tableItemArrowUp(tr, path, key, true);
			}
			else
			{
				QuestionnaireTable.tableItemArrowUp(tr, path, key, false);
			}
			//--- if last item, hide arrow down ---//
			if (key === json.length - 1)
			{
				QuestionnaireTable.tableItemArrowDown(tr, path, key, true);
			}
			else
			{
				QuestionnaireTable.tableItemArrowDown(tr, path, key, false);
			}
		}
		QuestionnaireTable.tableItemEditButton(tr, path, val);
	});
};

QuestionnaireTable.tableItemCheckbox = function (tr, key)
{
	//--- renders checkbox ---//
	var td1 = document.createElement("td");
	tr.appendChild(td1);
	
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.className = "questionnaire-checkbox item-" + key;
	td1.appendChild(checkbox);
	
	$(checkbox).on("change", function (event)
	{
		if ($(event.currentTarget).is(":checked") === true)
		{
			$(event.currentTarget).parents("tr").addClass("warning");
			$(".btn-container.questionnaire-list.default").hide();
			$(".btn-container.questionnaire-list.selected").show();
			
			var isAllChecked = true;
			for (var i = 0; i < Questionnaire.items.length; i++)
			{
				if ($(".questionnaire-checkbox.item-" + i).is(":checked") === false)
				{
					isAllChecked = false;
					break;
				}
			}
			if (isAllChecked === true)
			{
				$(".questionnaire-checkbox-header").prop("checked", true);
			}
		}
		else
		{
			$(event.currentTarget).parents("tr").removeClass("warning");
			$(".questionnaire-checkbox-header").prop("checked", false);
			var noneChecked = true;
			for (var i = 0; i < Questionnaire.items.length; i++)
			{
				if ($(".questionnaire-checkbox.item-" + i).is(":checked") === true)
				{
					noneChecked = false;
					break;
				}
			}
			if (noneChecked === true)
			{
				$(".btn-container.questionnaire-list.default").show();
				$(".btn-container.questionnaire-list.selected").hide();
			}
		}
	});
};

QuestionnaireTable.tableItemName = function (tr, path, val)
{
	var td2 = document.createElement("td");
	tr.appendChild(td2);
	
	if (Questionnaire.level === "question")
	{
		td2.innerHTML = val.paragraphDE;
	}
	else
	{
		var itemPath = path + "/" + val.headerDE;
		var linktd2 = document.createElement("a");
		linktd2.innerHTML = val.headerDE;
		linktd2.href = path.replace(".","#").toLowerCase() + "/" + val.headerDE;
		$(linktd2).data("path", itemPath);
		$(linktd2).data("headerDE", val.headerDE);
		$(linktd2).data("questions", val.questions);
		td2.appendChild(linktd2);
		
		$(linktd2).on("click", function (event)
		{
			event.preventDefault();
			var path = $(event.currentTarget).data("path");
			var headerDE = $(event.currentTarget).data("headerDE");
			var questions = $(event.currentTarget).data("questions");
			$("#form-question").data("headerDE", headerDE);
			Questionnaire.level = "question";
			Questionnaire.levelName = "Frage";
			Questionnaire.header = headerDE;
			History.push("Questionnaire.get", path);
			QuestionnaireTable.setup(path, questions);
		});
	}
};

QuestionnaireTable.tableItemArrowUp = function (tr, path, key, hide)
{
	var td = document.createElement("td");
	tr.appendChild(td);
	
	var button = document.createElement("button");
	button.type = "button";
	button.className = "btn btn-link";
	button.style.padding = "0 12px";
	button.innerHTML = "<span class=\"glyphicon glyphicon-chevron-up\"></span>";
	if (hide === true)
	{
		$(button).hide();
	}
	$(button).data("item-key", key);
	td.appendChild(button);
	
	$(button).on("click", function (event)
	{
		event.preventDefault();
		var key = $(event.currentTarget).data("item-key");
		//--- get items position and new position and create AJAX request ---//
		var item = Questionnaire.items[key];
		var newPosition = key - 1;
		var itemAsJson = JSON.stringify([item]);
		if (Questionnaire.level === "category")
		{
			//--- AJAX request ---//
			Questionnaire.addUpdateRemoveSortCategory(path, "sort", null, null, itemAsJson, newPosition);
		}
		else if (Questionnaire.level === "question")
		{
			//--- AJAX request ---//
			Questionnaire.addUpdateRemoveSortQuestion(path, "sort", Questionnaire.header, null, null, null, null, null, itemAsJson, newPosition);
		}
	});
};

QuestionnaireTable.tableItemArrowDown = function (tr, path, key, hide)
{
	//--- renders arrow down ---//
	var td = document.createElement("td");
	tr.appendChild(td);
	
	var button = document.createElement("button");
	button.type = "button";
	button.className = "btn btn-link";
	button.style.padding = "0 12px";
	button.innerHTML = "<span class=\"glyphicon glyphicon-chevron-down\"></span>";
	if (hide === true)
	{
		$(button).hide();
	}
	$(button).data("item-key", key);
	td.appendChild(button);
	
	$(button).on("click", function (event)
	{
		event.preventDefault();
		var key = $(event.currentTarget).data("item-key");
		//--- gets item's current position and new position and creates AJAX request for sorting ---//
		var item = Questionnaire.items[key];
		var newPosition = key + 1;
		//--- converts array to JSON string ---//
		var itemAsJson = JSON.stringify([item]);
		if (Questionnaire.level === "category")
		{
			//--- AJAX request ---//
			Questionnaire.addUpdateRemoveSortCategory(path, "sort", null, null, itemAsJson, newPosition);
		}
		else if (Questionnaire.level === "question")
		{
			//--- AJAX request ---//
			Questionnaire.addUpdateRemoveSortQuestion(path, "sort", Questionnaire.header, null, null, null, null, null, itemAsJson, newPosition);
		}
	});
};

QuestionnaireTable.tableItemEditButton = function (tr, path, val)
{
	//--- renders edit button (pencil) if questionnaire is changeable ---//
	//--- else renders preview button (eye) to view ---//
	var td = document.createElement("td");
	tr.appendChild(td);
	
	var buttonEdit = document.createElement("button");
	buttonEdit.type = "button";
	buttonEdit.className = "btn btn-link";
	buttonEdit.style.padding = "0 12px";
	if (Questionnaire.isChangeable === false)
	{
		buttonEdit.innerHTML = "<span class=\"glyphicon glyphicon-eye-close\"></span>";
	}
	else
	{
		buttonEdit.innerHTML = "<span class=\"glyphicon glyphicon-pencil\"></span>";
	}
	buttonEdit.setAttribute("data-toggle", "modal");
	buttonEdit.setAttribute("data-target", "#modal-" + Questionnaire.level);
	$(buttonEdit).data("item-path", path);
	td.appendChild(buttonEdit);
	
	if (Questionnaire.level === "category")
	{
		$(buttonEdit).data("item-headerDE", val.headerDE);
		$(buttonEdit).data("item-headerEN", val.headerEN);
		$(buttonEdit).on("click", function (event)
		{
			event.preventDefault();
			//--- sets input fields on the modal with clicked table item data ---//
			Questionnaire.editingHeaderDE = $(event.currentTarget).data("item-headerDE");
			$("#modal-title-category").html($(event.currentTarget).data("item-headerDE"));
			$("#form-category-headerDE").val($(event.currentTarget).data("item-headerDE"));
			$("#form-category-headerEN").val($(event.currentTarget).data("item-headerEN"));
			$("#btn-submit-category").html("Aktualisieren");
			$("#form-category").data("path", $(event.currentTarget).data("item-path"));
			$("#form-category").data("action", "update");
			var oldHeaderDEAsJson = JSON.stringify([$(event.currentTarget).data("item-headerDE")]);
			$("#form-category").data("oldHeaderDEAsJson", oldHeaderDEAsJson);
			if (Questionnaire.isChangeable === false)
			{
				$("#btn-submit-category").hide();
				$(".form-control.form-category.input").prop("disabled", true);
			}
			else
			{
				$("#btn-submit-category").show();
				$(".form-control.form-category.input").prop("disabled", false);
			}
		});
	}
	else if (Questionnaire.level === "question")
	{
		$(buttonEdit).data("item-type", val.type);
		$(buttonEdit).data("item-paragraphDE", val.paragraphDE);
		$(buttonEdit).data("item-paragraphEN", val.paragraphEN);
		$(buttonEdit).data("item-labelDE", val.labelDE);
		$(buttonEdit).data("item-labelEN", val.labelEN);
		$(buttonEdit).on("click", function (event)
		{
			event.preventDefault();
			//--- sets input fields on the modal with clicked table item data ---//
			Questionnaire.editingParagraphDE = $(event.currentTarget).data("item-paragraphDE");
			var type = $(event.currentTarget).data("item-type");
			if (type === "radio")
			{
				$(".form-group.question-label").show();
				$.each($(event.currentTarget).data("item-labelDE"), function (i, val)
				{
					$("#form-question-label" + (i + 1) + "DE").val(val);
				});
				$.each($(event.currentTarget).data("item-labelEN"), function (i, val)
				{
					$("#form-question-label" + (i + 1) + "EN").val(val);
				});
			}
			else if (type === "text")
			{
				$(".form-group.question-label").hide();
				for (var i = 1; i < 6; i++)
				{
					$("#form-question-label" + i + "DE").val("");
					$("#form-question-label" + i + "EN").val("");
				}
			}
			$("#form-question-type").selectpicker("val", type);
			$("#form-question-paragraphDE").val($(event.currentTarget).data("item-paragraphDE"));
			$("#form-question-paragraphEN").val($(event.currentTarget).data("item-paragraphEN"));
			$("#btn-submit-question").html("Aktualisieren");
			$("#form-question").data("path", $(event.currentTarget).data("item-path"));
			$("#form-question").data("action", "update");
			var oldParagraphsDEAsJson = JSON.stringify([$(event.currentTarget).data("item-paragraphDE")]);
			$("#form-question").data("oldParagraphsDEAsJson", oldParagraphsDEAsJson);
			if (Questionnaire.isChangeable === false)
			{
				$("#modal-title-question").html("Frage");
				$("#btn-submit-question").hide();
				$(".form-control.form-question.input").prop("disabled", true);
				$(".form-question.select").prop("disabled", true);
				$(".form-question.select").selectpicker("refresh");
			}
			else
			{
				$("#modal-title-question").html("Frage aktualisieren");
				$("#btn-submit-question").show();
				$(".form-control.form-question.input").prop("disabled", false);
				$(".form-question.select").prop("disabled", false);
				$(".form-question.select").selectpicker("refresh");
			}
		});
	}
};

QuestionnaireTable.error = function ()
{
	//--- error message indicating no semester found in the database ---//
	var divContent = document.getElementById("content");
	
	var pMessage = document.createElement("p");
	pMessage.className = "text-muted";
	pMessage.innerHTML = "No semester found in database. Please add semester in section 'Codes'.";
	divContent.appendChild(pMessage);
};
