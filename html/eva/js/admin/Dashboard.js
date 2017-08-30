//--- the main user interface ---//
//--- this includes header, sidebar, title, breadcrumb and content ---//
var PATH_SEP;
var HOME_PATH;
var HOME_DIRS;
var HOME_NAME;

//--- section names are static ---//
var CODES_SECTION = "Codes";
var HIERARCHIES_SECTION = "Administration";
var QUESTIONNAIRE_SECTION = "Fragebogen";
var RESULTS_SECTION = "Ergebnisse";
var STAT_SECTION = "Statistik";
var USERS_SECTION = "Benutzer";

var Dashboard = {};

Dashboard.setup = function (json)
{
	Dashboard.home(json);
	Dashboard.header();
	Dashboard.container();
	Dashboard.sidebar(json);
	Dashboard.content();
	Dashboard.title(HOME_NAME);
	Dashboard.breadcrumb(HOME_DIRS);
};

Dashboard.home = function (json)
{
	//--- sets path separator as UNIX style separator ---//
	PATH_SEP = "/";
	//--- sets home path, directory and name ---//
	HOME_PATH = "./Home";
	HOME_DIRS = HOME_PATH.split(PATH_SEP);
	HOME_NAME = HOME_DIRS[HOME_DIRS.length - 1];
};

Dashboard.header = function ()
{
	//--- dashboard header ---//
	//--- consists of app logo, app name, user name, logout icon ---//
	LoginForm.header();
	
	//--- hfu logo onClick ---//
	$(".navbar-brand").on("click", function (event)
	{
		event.preventDefault();
		History.push("Directories.get", HOME_PATH);
		Directories.get(HOME_PATH);
	});
	
	var divHeaderContainer = document.getElementById("header").children[0];
	
	var divNavbarCollapse = document.createElement("div");
	divNavbarCollapse.className = "navbar-collapse collapse";
	divHeaderContainer.appendChild(divNavbarCollapse);
	
	//--- right-top user menu container ---//
	var ulNavbarRight = document.createElement("ul");
	ulNavbarRight.className = "nav navbar-nav navbar-right";
	divNavbarCollapse.appendChild(ulNavbarRight);
	
	//--- right-top user menu name ---//
	var liConfig = document.createElement("li");
	ulNavbarRight.appendChild(liConfig);
	
	var aConfig = document.createElement("a");
	aConfig.style.fontSize = "16px";
	aConfig.innerHTML = "<b>" + Login.displayName + "</b>";
	aConfig.href = "#/Home/" + Login.displayName;
	$(aConfig).on("click", function (event)
	{
		event.preventDefault();
		var path = "./Home/" + Login.displayName;
		History.push("Settings.setup", path);
		Settings.setup(path);
	});
	liConfig.appendChild(aConfig);
	
	//--- right-top user menu logout ---//
	var liLogout = document.createElement("li");
	ulNavbarRight.appendChild(liLogout);
	
	var aLogout = document.createElement("a");
	aLogout.style.padding = "12.5px 15px";
	aLogout.innerHTML = "<span class=\"glyphicon glyphicon-log-out\"></span>";
	aLogout.href = "#/logout";
	liLogout.appendChild(aLogout);
	
	//--- logout button onClick listener ---//
	$(aLogout).on("click", function (event)
	{
		event.preventDefault();
		//--- register history for browser navigation ---//
		history.pushState({callback: "Login.revoke", path: null}, "Evaluation", "/eva/admin/");
		Login.revoke();
	});
};

Dashboard.container = function (json)
{
	//--- main container ---//
	var divMain = document.getElementById("main");
	divMain.className = "main";
	
	//--- fluid container ---//
	var divContainerFluid = document.createElement("div");
	divContainerFluid.className = "container-fluid";
	divMain.appendChild(divContainerFluid);
};

Dashboard.sidebar = function (json)
{
	//--- dashboard side bar ---//
	var divMainContainer = document.getElementById("main").children[0];
	
	//--- sidebar container ---//
	var divRow = document.createElement("div");
	divRow.className = "row";
	divMainContainer.appendChild(divRow);
	
	var divSidebar = document.createElement("div");
	divSidebar.className = "col-sm-3 col-md-2 sidebar";
	divRow.appendChild(divSidebar);
	
	var ulNavigation = document.createElement("ul");
	ulNavigation.className = "nav nav-sidebar";
	divSidebar.appendChild(ulNavigation);
	
	//--- sidebar > navigation home ---//
	var liHome = document.createElement("li");
	liHome.className = "active";
	
	var aHome = document.createElement("a");
	aHome.className = "sidebar-item-home";
	aHome.href = "#/home";
	aHome.innerHTML = HOME_NAME;
	//--- home link path ---//
	$(aHome).data("path", HOME_PATH);
	//--- home link onClick listner ---//
	$(aHome).on("click", function (event)
	{
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		//--- highlights selected sidebar item ---//
		$(event.currentTarget).parent().addClass("active");
		//--- un-highlights other sidebar items ---//
		$(event.currentTarget).parent().siblings().removeClass("active");
		History.push("Directories.get", path);
		Directories.get(path);
	});
	liHome.appendChild(aHome);
	ulNavigation.appendChild(liHome); 
	
	//--- sidebar > navigation others based on database Directories ---//
	$.each(json, function(key, val)
	{
		//--- extracts section and last level's name from path ---//
		var dirs = val.split(PATH_SEP);
		var name = dirs[dirs.length-1]
		var section = dirs[2];
		
		var li = document.createElement("li");
		ulNavigation.appendChild(li);
		
		var a = document.createElement("a");
		a.className = "sidebar-item-" + name;
		a.href = val.replace(".","#").toLowerCase();
		a.innerHTML = name;
		$(a).data("path", val);
		$(a).data("section", section);
		
		//--- sidebar navigation item on click listener ---//
		$(a).on("click", function (event)
		{
			event.preventDefault();
			var section = $(event.currentTarget).data("section");
			var path = $(event.currentTarget).data("path");
			
			//--- highlights selected sidebar item ---//
			$(event.currentTarget).parent().addClass("active");
			//--- un-highlights other sidebar items ---//
			$(event.currentTarget).parent().siblings().removeClass("active");
			
			//--- AJAX call for different sections ---//
			if (section === HIERARCHIES_SECTION)
			{
				History.push("Hierarchies.get", path);
				Hierarchies.get(path);
			}
			else if (section === CODES_SECTION)
			{
				History.push("Semesters.get", path);
				Semesters.get(path);
			}
			else if (section === USERS_SECTION)
			{
				History.push("Users.get", path);
				Users.get(path);
			}
			else if (section === QUESTIONNAIRE_SECTION)
			{
				History.push("Questionnaire.get", path);
				Questionnaire.get(path);
			}
			else
			{
				History.push("Directories.get", path);
				Directories.get(path);
			}
		});
		li.appendChild(a);
		
	});
	
};

Dashboard.content = function ()
{
	var divMainContainer = document.getElementById("main").children[0];
	
	//--- content container ---//
	//--- content includes title, button container, breadcrumb and list/table ---//
	var divContent = document.createElement("div");
	divContent.className = "col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 content";
	divContent.id = "content";
	divMainContainer.appendChild(divContent);
};

Dashboard.title = function (currentDir)
{
	//--- called from Dashboard.setup() OR Dashboard.reset() ---//
	//--- content title displays current dir name ---//
	var h3ContentTitle = document.createElement("h3");
	h3ContentTitle.className = "content-title";
	h3ContentTitle.id = "content-title";
	h3ContentTitle.innerHTML = currentDir;
	document.getElementById("content").appendChild(h3ContentTitle);
};

Dashboard.breadcrumb = function (dirs)
{
	//--- called from Dashboard.setup() OR Dashboard.reset() ---//
	//--- breadcrumb link ---//
	//--- starting with home directory ---//
	var dataPath = dirs[0] + PATH_SEP + dirs[1];
	
	//--- breadcrumb container ---//
	var olBreadcrumb = document.createElement("ol");
	olBreadcrumb.className = "breadcrumb";
	document.getElementById("content").appendChild(olBreadcrumb);
	
	//--- home directory link with a home icon ---//
	var liHome = document.createElement("li");
	olBreadcrumb.appendChild(liHome);
	
	var aHome = document.createElement("a");
	aHome.href = "#/home";
	aHome.innerHTML = "<span class='glyphicon glyphicon-home'>";
	$(aHome).data("path", HOME_PATH);
	$(aHome).on("click", function (event)
	{		
		event.preventDefault();
		var path = $(event.currentTarget).data("path");
		History.push("Directories.get", path);
		Directories.get(path);
	});
	liHome.appendChild(aHome);
	
	//--- rest of the directories after home level---//
	//--- e.g. './Home/Codes/2014-WS/MME' -> 'Codes/2014-WS/MME' ---//
	//--- splitted to 'Codes' , '2014-WS' , 'MME' first and then added to breadcrumb. ---//
	//--- for each level, the on click event will be different leading to different AJAX call ---//
	for (var i = 2; i < dirs.length; i++)
	{
		dataPath += PATH_SEP + dirs[i];
		
		var liBreadcrumb = document.createElement("li");
		if (i === dirs.length - 1)
		{
			liBreadcrumb.className = "active";
			liBreadcrumb.innerHTML = dirs[i];
			//--- remove '.json' extension from string ---//
			if (dirs[2] === RESULTS_SECTION)
			{
				liBreadcrumb.innerHTML = dirs[i].split(".")[0];
			}
			//--- converts e.g. '2014-WS' to 'WS 2014/15' and '2014-SS' to 'SS 2014' ---//
			if (i === 3 && (dirs[2] === CODES_SECTION || dirs[2] === RESULTS_SECTION || dirs[2] === STAT_SECTION))
			{
				var name = dirs[i].split("-");
				var addYear = "";
				if (name[1] === "WS")
				{
					var nextYear = parseInt(name[0]) + 1;
					addYear = "/" + nextYear.toString().substring(2);
				}
				liBreadcrumb.innerHTML = name[1] + " " + name[0] + addYear;
			}
		}
		else
		{
			var aBreadcrumb = document.createElement("a");
			aBreadcrumb.href = dataPath.replace(".","#").toLowerCase();
			aBreadcrumb.innerHTML = dirs[i];
			//--- converts e.g. '2014-WS' to 'WS 2014/15' and '2014-SS' to 'SS 2014' ---//
			if (i === 3 && (dirs[2] === CODES_SECTION || dirs[2] === RESULTS_SECTION || dirs[2] === STAT_SECTION))
			{
				var name = dirs[i].split("-");
				var addYear = "";
				if (name[1] === "WS")
				{
					var nextYear = parseInt(name[0]) + 1;
					addYear = "/" + nextYear.toString().substring(2);
				}
				aBreadcrumb.innerHTML = name[1] + " " + name[0] + addYear;
			}
			$(aBreadcrumb).data("path", dataPath);
			$(aBreadcrumb).data("section", dirs[2]);
			$(aBreadcrumb).data("dirLevel", i);
			//--- breadcrumb on click listener ---//
			$(aBreadcrumb).on("click", function (event)
			{
				event.preventDefault();
				var section = $(event.currentTarget).data("section");
				var dirLevel = $(event.currentTarget).data("dirLevel");
				var path = $(event.currentTarget).data("path");
				//--- AJAX call based on which section (optionnally path level) ---//
				//--- + push browser state to enable browser back forth button navigation ---//
				if (section === HIERARCHIES_SECTION)
				{
					History.push("Hierarchies.get", path);
					Hierarchies.get(path);
				}
				else if (section === CODES_SECTION && dirLevel === 2)
				{
					History.push("Semesters.get", path);
					Semesters.get(path);
				}
				else if (section === CODES_SECTION && dirLevel > 2)
				{
					History.push("DirCodes.get", path);
					DirCodes.get(path);
				}
				else if (section === RESULTS_SECTION && dirLevel === 6)
				{
					History.push("ResultsList.get", path);
					ResultsList.get(path);
				}
				else if (section === QUESTIONNAIRE_SECTION)
				{
					History.push("Questionnaire.get", path);
					Questionnaire.get(path);
				}
				else
				{
					History.push("Directories.get", path);
					Directories.get(path);
				}
			});
			liBreadcrumb.appendChild(aBreadcrumb);
		}
		olBreadcrumb.appendChild(liBreadcrumb);
	}
};

Dashboard.reset = function (path)
{
	var dirs = path.split(PATH_SEP);
	var section = dirs[2];
	var currentDir = dirs[dirs.length-1];
	
	//--- removes '.json' from string ---//
	if (section === RESULTS_SECTION && dirs.length === 8)
	{
		currentDir = currentDir.split(".")[0];
	}
	//--- converts e.g. '2014-WS' to 'WS 2014/15' and '2014-SS' to 'SS 2014' ---//
	if (dirs.length === 4 && (section === CODES_SECTION || section === RESULTS_SECTION || section === STAT_SECTION))
	{
		var name = currentDir.split("-");
		var addYear = "";
		if (name[1] === "WS")
		{
			var nextYear = parseInt(name[0]) + 1;
			addYear = "/" + nextYear.toString().substring(2);
		}
		currentDir = name[1] + " " + name[0] + addYear;
	}
	
	//--- remove all child nodes inside div .content ---//
	$(".content").empty();
	
	//--- reset sidebar, title, dashboard ---//
	Dashboard.setSidebar(section);
	Dashboard.title(currentDir);
	Dashboard.breadcrumb(dirs);
};

Dashboard.setSidebar = function (section)
{
	//--- highlights selected sidebar navigation item ---//
	if (section === undefined) { section = "home"; }
	$(".sidebar-item-" + section).parent().addClass("active");
	$(".sidebar-item-" + section).parent().siblings().removeClass("active");
};

Dashboard.displayError = function(status)
{
	//--- displays error message from server ---//
	var msg = null;
	if (status === 401)
	{
		msg = "401 - Zugriff verweigert";
	}
	else if (status === 404)
	{
		msg = "404 - Nicht gefunden";
	}
	else if (status === 500)
	{
		msg = "500 - Oops... Server Fehler";
	}
	else
	{
		msg = status + " Fehler";
	}
	
	var divContent = document.getElementById("content");
	
	var pMessage = document.createElement("p");
	pMessage.className = "text-danger";
	pMessage.innerHTML = msg;
	divContent.appendChild(pMessage);
};

Dashboard.remove = function()
{
	//--- remove dashboard ---//
	$("#header").empty();
	$("#main").empty();
};

Dashboard.clearGlobalVar = function()
{
	//--- clear cache (all static variables) ---//
	USER = null;
	PWD = null;
	EMAIL = null;
	LOGGED_IN = null;	
	
	if (Login.isAdmin === true || Login.isOrganizer === true)
	{
		CodesForm.isRendered = false;
		CodesPdfViewer.isRendered = false;
		CodesTable.whichBrowser = null;
		ConfirmationDialog.isRendered = false;
		DirCodes.json = null;
		DirCodes.names = null;
		DirCodes.levelName = null;
		Hierarchies.json = null;
		Hierarchies.totalItems = null;
		Hierarchies.level = null;
		Hierarchies.levelName = null;
		Hierarchies.itemNames = null;
		Hierarchies.editingItemName = null;
		HierarchiesForm.isRendered = false;
		HierarchiesTable.footerInfo = {};
		HierarchiesTable.dean = {};
		HierarchiesTable.organizer = {};
		HierarchiesTable.deanOfStudies = {};
		HierarchiesTable.lecturer = {};
		Questionnaire.semester = null;
		Questionnaire.isChangeable = null;
		Questionnaire.categories = null;
		Questionnaire.level = null;
		Questionnaire.levelName = null;
		Questionnaire.header = null;
		Questionnaire.items = null;
		Questionnaire.editingHeaderDE = null;
		Questionnaire.editingParagraphDE = null;
		QuestionnaireDemo.isRendered = false;
		QuestionnaireDemo.slidePosition = null;
		QuestionnaireDemo.totalSlides = null;
		QuestionnaireDemo.move = null;
		QuestionnaireDemo.nanobar = null;
		QuestionnaireFormCategory.isRendered = false;
		QuestionnaireFormQuestion.isRendered = false;
		Semesters.json = null;
		Semesters.currentSemester = null;
		Semesters.searchBoxNames = null;
		Semesters.editingSemesterName = null;
		SemestersForm.isRendered = false;
		Users.json = null;
		Users.usernames = null;
		Users.editingUsername = null;
		UsersForm.isRendered = false;
	}
	//--- isTeacher -> role == dean, dean of studies or lecturer ---//
	if (Login.isTeacher === true)
	{
		Images.logoPdf = null;
		Questions.json = null;
		ResultsList.json = null;
		ResultsList.searchBoxNames = null;
		ResultsViewer.collapseIn = ["", "", "", "", ""];
		StatisticsHelp.isRendered = false;
		StatisticsViewer.histogramBarMax = null;
	}
	SettingsForm.isRendered = false;
	Login.hashUrl = null;
	Login.displayName = null;
	Login.accessInfo = null;
	Login.isAdmin = null;
	Login.isOrganizer = null;
	Login.isTeacher = null;
};
