//--- renders modal pop-up for questionnaire demo ---//
var QuestionnaireDemo = {};

QuestionnaireDemo.isRendered = false;
QuestionnaireDemo.slidePosition = null;
QuestionnaireDemo.totalSlides = null;
QuestionnaireDemo.move = null;
QuestionnaireDemo.nanobar = null;

QuestionnaireDemo.setup = function ()
{
	QuestionnaireDemo.container();
	QuestionnaireDemo.header();
	QuestionnaireDemo.body();
	QuestionnaireDemo.callback();
	QuestionnaireDemo.isRendered = true;
};

QuestionnaireDemo.container = function ()
{
	//--- modal container ---//
	var divMain = document.getElementById("main");
	
	var divModal = document.createElement("div");
	divModal.className = "modal fade";
	divModal.id = "modal-questionnaire-demo";
	divModal.tabIndex = "-1";
	divModal.setAttribute("role", "dialog");
	divModal.setAttribute("aria-labelledby", "modal-questionnaire-demo");
	divModal.setAttribute("aria-hidden", "true");
	$(divModal).modal("hide");
	divMain.appendChild(divModal);
	
	var divModalDialog = document.createElement("div");
	divModalDialog.className = "modal-dialog modal-lg";
	divModal.appendChild(divModalDialog);
	
	var divModalContent = document.createElement("div");
	divModalContent.id = "modal-content-questionnaire-demo";
	divModalContent.className = "modal-content";
	divModalContent.style.minHeight = "300px";
	divModalDialog.appendChild(divModalContent);
};

QuestionnaireDemo.header = function ()
{
	//--- modal header ---//
	var divModalContent = document.getElementById("modal-content-questionnaire-demo");
	
	var divModalHeader = document.createElement("div");
	divModalHeader.className = "modal-header";
	divModalHeader.style.height = "40px";
	divModalHeader.style.borderBottom = "0";
	divModalContent.appendChild(divModalHeader);
	
	//--- close button ---//
	var buttonClose = document.createElement("button");
	buttonClose.className = "close";
	buttonClose.type = "button";
	buttonClose.setAttribute("data-dismiss", "modal");
	divModalHeader.appendChild(buttonClose);
	
	//--- icon 'x' ---//
	var spanTimes = document.createElement("span");
	spanTimes.innerHTML = "&times;";
	spanTimes.setAttribute("aria-hidden", "true");
	buttonClose.appendChild(spanTimes);
	
	var spanSrOnly = document.createElement("span");
	spanSrOnly.className = "sr-only";
	spanSrOnly.innerHTML = "Close";
	buttonClose.appendChild(spanSrOnly);
};

QuestionnaireDemo.body = function ()
{
	//--- modal body ---//
	var divModalContent = document.getElementById("modal-content-questionnaire-demo");
	
	var divModalBody = document.createElement("div");
	divModalBody.id = "modal-body-questionnaire-demo";
	divModalBody.style.position = "static";
	divModalBody.style.padding = "0";
	divModalBody.className = "modal-body";
	divModalContent.appendChild(divModalBody);
};

QuestionnaireDemo.callback = function ()
{
	//--- triggered when modal is closed ---//
	$("#modal-questionnaire-demo").on("hidden.bs.modal", function ()
	{
		$("#modal-body-questionnaire-demo").html("");
	});
};

QuestionnaireDemo.initSlide = function ()
{
	//--- initialize slide ---//
	var divModalBody = document.getElementById("modal-body-questionnaire-demo");
	//--- start position -> 0 ---//
	QuestionnaireDemo.slidePosition = 0;
	//--- counter to count total slides ---//
	var i = 0;
	//--- for each category (keyCategory, category) -> (index, json object) ---//
	$.each(Questionnaire.categories, function (keyCategory, category)
	{
		var header = category.headerDE;
		//--- for each question (keyQuestion, question) -> (index, json object) ---//
		$.each(category.questions, function (keyQuestion, question)
		{
			//--- slide container ---//
			var divSlide = document.createElement("div");
			divSlide.className = "slide slide-" + i;
			divSlide.style.padding = "15px 75px";
			$(divSlide).hide();
			divModalBody.appendChild(divSlide);
			
			//--- category ---//
			var h3 = document.createElement("h3");
			h3.innerHTML = header;
			divSlide.appendChild(h3);
			
			//--- question ---//
			var p = document.createElement("p");
			p.innerHTML = question.paragraphDE;
			p.style.fontSize = "16px";
			divSlide.appendChild(p);
			
			//--- answer option ---//
			//--- for MCQ -> radio ---//
			if (question.type === "radio")
			{
				for (var j = 0; j < 5; j++)
				{
					//--- radio buttons container ---//
					var divRadio = document.createElement("div");
					divRadio.className = "radio";
					divSlide.appendChild(divRadio);
					
					//--- radio buttons on click event listener ---//
					$(divRadio).on("click", function (event)
					{
						event.preventDefault();
						var radio = $(event.currentTarget).find("input[type=radio]");
						if ($(event.currentTarget).hasClass("selected") === true)
						{
							$(event.currentTarget).removeClass("selected");
							radio.prop("checked", false);
						}
						else
						{
							$(event.currentTarget).addClass("selected");
							$(event.currentTarget).siblings().removeClass("selected");
							radio.prop("checked", true);
						}
					});
					
					//--- radio button ---//
					var label = document.createElement("label");
					divRadio.appendChild(label);
					
					//--- input radio ---//
					var input = document.createElement("input");
					input.type = "radio";
					input.name = i;
					input.value = j + 1;
					label.appendChild(input);
					
					//--- label radio ---//
					var labelHTML = j + 1;
					//--- renders only if label exists ---//
					if (question.labelDE[j].length > 0)
					{
						labelHTML += " (" + question.labelDE[j] + ")";
					}
					
					var lbl = document.createTextNode(labelHTML);
					label.appendChild(lbl);
				}
			}
			//--- for free-text-question ---//
			else if (question.type == "text")
			{
				//--- renders textarea ---//
				var textarea = document.createElement("textarea");
				textarea.style.width = "100%";
				textarea.rows = "5";
				divSlide.appendChild(textarea);
			}
			i++;
		});
	});
	//--- total slides ---//
	QuestionnaireDemo.totalSlides = i;
};

QuestionnaireDemo.initCarousel = function ()
{
	//--- renders next and previous buttons ---//
	var divModalBody = document.getElementById("modal-body-questionnaire-demo");
	
	//--- previous button ---//
	var btnPrev = document.createElement("button");
	btnPrev.type = "button";
	btnPrev.id = "carousel-prev";
	btnPrev.className = "btn btn-default";
	//--- icon ---//
	btnPrev.innerHTML = "<span class=\"glyphicon glyphicon-chevron-left\"></span>";
	//--- css positioning ---//
	btnPrev.style.position = "absolute";
	btnPrev.style.top = "50%";
	btnPrev.style.left = "1.5%";
	divModalBody.appendChild(btnPrev);
	
	//--- previous button on click event listener ---//
	$(btnPrev).on("click", function (event)
	{
		event.preventDefault();
		//--- hides current slide ---//
		$(".slide.slide-" + QuestionnaireDemo.slidePosition).hide();
		QuestionnaireDemo.slidePosition--;
		QuestionnaireDemo.setSlide();
	});
	
	//--- button next ---//
	var btnNext = document.createElement("button");
	btnNext.type = "button";
	btnNext.id = "carousel-next";
	btnNext.className = "btn btn-default";
	//--- icon ---//
	btnNext.innerHTML = "<span class=\"glyphicon glyphicon-chevron-right\"></span>";
	//--- css positioning ---//
	btnNext.style.position = "absolute";
	btnNext.style.top = "50%";
	btnNext.style.right = "1.5%";
	divModalBody.appendChild(btnNext);
	
	//--- button next on click listener ---//
	$(btnNext).on("click", function (event)
	{
		event.preventDefault();
		//--- hides current slide ---//
		$(".slide.slide-" + QuestionnaireDemo.slidePosition).hide();
		QuestionnaireDemo.slidePosition++;
		QuestionnaireDemo.setSlide();
	});
	
};

QuestionnaireDemo.initProgressbar = function ()
{
	//--- initialize progress bar ---//
	var divModalBody = document.getElementById("modal-body-questionnaire-demo");
	
	QuestionnaireDemo.nanobar = new Nanobar
	({
		bg: "#83B81A", //--- progress bar color ---//
		target: divModalBody //--- location of progress bar on HTML page ---//
	});
	//--- progress bar increment / decrement per slide ---//
	//--- use 99.99% to avoid progress bar disappearance on the last slide ---//
	QuestionnaireDemo.move = 99.99 / QuestionnaireDemo.totalSlides;
};

QuestionnaireDemo.setSlide = function ()
{
	//--- shows slide with position = slidePosition ---//
	$(".slide.slide-" + QuestionnaireDemo.slidePosition).show();
	//--- if first slide, hide previous button ---//
	if (QuestionnaireDemo.slidePosition === 0)
	{
		$("#carousel-prev").css("visibility", "hidden");
	}
	else
	{
		$("#carousel-prev").css("visibility", "visible");
	}
	//--- if last slide, hide next button ---//
	if (QuestionnaireDemo.slidePosition === QuestionnaireDemo.totalSlides - 1)
	{
		$("#carousel-next").css("visibility", "hidden");
	}
	else
	{
		$("#carousel-next").css("visibility", "visible");
	}
	//--- sets progressbar progress according to slide position ---//
	QuestionnaireDemo.nanobar.go((QuestionnaireDemo.slidePosition + 1) * QuestionnaireDemo.move);
};
