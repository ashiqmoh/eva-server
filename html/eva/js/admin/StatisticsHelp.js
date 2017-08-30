//--- renders statistics help modal pop-up ---//
//--- contains information on how to interpret box-plot-diagram ---//
var StatisticsHelp = {};

StatisticsHelp.isRendered = false;

StatisticsHelp.setup = function ()
{
	var modalId = "statistics-help"
	Modal.container(modalId);
	Modal.header(modalId);
	Modal.body(modalId);
	
	$("#modal-title-" + modalId).html("Statistik - Hilfe");
	StatisticsHelp.boxplot(modalId);
	StatisticsHelp.isRendered = true;
};

//--- renders box-plot diagram with help texts and arrows using html5 canvas ---//
StatisticsHelp.boxplot = function (modalId)
{
	var divBody = document.getElementById("modal-body-" + modalId);
	
	var h4 = document.createElement("h4");
	h4.innerHTML = "<u>Box-Plot Diagramm</u>";
	divBody.appendChild(h4);
	
	//--- canvas setup ---//
	var canvas = document.createElement("canvas");
	canvas.width = "560";
	canvas.height = "275";
	divBody.appendChild(canvas);
	
	//--- canves context setup ---//
	var context = canvas.getContext("2d");
	context.beginPath();
	
	context.strokeStyle = "#333";
	context.lineWidth = "1";
	
	//--- scale ---//
	context.moveTo(120.5, 44.5);
	context.lineTo(400.5, 44.5);
	context.stroke();
	for (var i = 0; i < 5; i++)
	{
		context.fillStyle = "#222";
		context.font = "italic 11pt Arial";
		context.fillText(i + 1, 120.5 + (i * 70) - (0.5 * context.measureText(i).width), 30);
		context.moveTo(120.5 + (i * 70), 38.5);
		context.lineTo(120.5 + (i * 70), 44.5);
		context.stroke();
	}
	
	//--- limit left ---//
	context.moveTo(120.5, 60.5);
	context.lineTo(120.5, 150.5);
	context.stroke();
	
	//--- limit right ---//
	context.moveTo(400.5, 60.5);
	context.lineTo(400.5, 150.5);
	context.stroke();
	
	//--- label1 and label5 ---//
	context.fillStyle = "#222";
	context.font = "italic 11pt Arial";
	context.fillText("tritt voll zu", 105.5 - context.measureText("tritt voll zu").width, 110);
	context.fillText("gar nicht", 415.5, 110);
	
	//--- limit left to box ---//
	context.moveTo(120.5, 105.5);
	context.lineTo(50.5 + 2 * 70, 105.5);
	context.stroke();
	
	//--- box ---//
	context.strokeRect(50.5 + 2 * 70, 60.5, (4 - 2) * 70, 90);
	
	//--- box to limit right ---//
	context.moveTo(50.5 + 4 * 70, 105.5);
	context.lineTo(400.5, 105.5);
	context.stroke();
	
	//--- median ---//
	context.beginPath();
	context.strokeStyle = "#333";
	context.lineWidth = "5";
	context.moveTo(50.5 + 3 * 70, 60.5);
	context.lineTo(50.5 + 3 * 70, 150.5);
	context.stroke();
	
	//--- mean ---//
	context.fillStyle = "#333";
	context.moveTo(50.5 + 2.5 * 70, 105.5);
	context.arc(50.5 + 2.5 * 70, 105.5, 4.5, 0, Math.PI * 2);
	context.fill();
	
	context.beginPath();	
	context.strokeStyle = "#d43f3a";
	context.fillStyle = "#d43f3a";
	context.lineWidth = "1";
	
	//--- arrow quantile 25% ---//
	context.moveTo(50.5 + 2 * 70, 165.5);
	context.lineTo(50.5 + 2 * 70 - 3, 165.5 + 6);
	context.lineTo(50.5 + 2 * 70 + 3, 165.5 + 6);
	context.lineTo(50.5 + 2 * 70, 165.5);
	context.fill();	
	
	context.moveTo(50.5 + 2 * 70, 165.5);
	context.lineTo(50.5 + 2 * 70, 200.5);
	context.stroke();
	
	context.moveTo(50.5 + 2 * 70, 200.5);
	context.lineTo(50.5 + 2 * 70 - 10, 200.5);
	context.stroke();
	
	//--- label quantile 25% ---//
	context.font = "11pt Arial";
	context.fillText("25% Quantil", 50.5 + 2 * 70 - 20 - context.measureText("25% Quantil").width, 204.5);	
	
	//--- arrow quantile 75% ---//	
	context.moveTo(50.5 + 4 * 70, 165.5);
	context.lineTo(50.5 + 4 * 70 - 3, 165.5 + 6);
	context.lineTo(50.5 + 4 * 70 + 3, 165.5 + 6);
	context.lineTo(50.5 + 4 * 70, 165.5);
	context.fill();
	
	context.moveTo(50.5 + 4 * 70, 165.5);
	context.lineTo(50.5 + 4 * 70, 200.5);
	context.stroke();
	
	context.moveTo(50.5 + 4 * 70, 200.5);
	context.lineTo(50.5 + 4 * 70 + 10, 200.5);
	context.stroke();
	
	//--- label quantile 75% ---//
	context.fillText("75% Quantil", 50.5 + 4 * 70 + 20, 204.5);
	
	//--- arrow mean ---//
	context.moveTo(50.5 + 2.5 * 70, 165.5);
	context.lineTo(50.5 + 2.5 * 70 - 3, 165.5 + 6);
	context.lineTo(50.5 + 2.5 * 70 + 3, 165.5 + 6);
	context.lineTo(50.5 + 2.5 * 70, 165.5);
	context.fill();	
	
	context.moveTo(50.5 + 2.5 * 70, 165.5);
	context.lineTo(50.5 + 2.5 * 70, 230.5);
	context.stroke();
	
	context.moveTo(50.5 + 2.5 * 70, 230.5);
	context.lineTo(50.5 + 2.5 * 70 - 10, 230.5);
	context.stroke();
	
	//--- label quantile 25% ---//
	context.font = "11pt Arial";
	context.fillText("Mittelwert", 50.5 + 2.5 * 70 - 20 - context.measureText("Mittelwert").width, 234.5);	
	
	//--- arrow median ---//	
	context.moveTo(50.5 + 3 * 70, 165.5);
	context.lineTo(50.5 + 3 * 70 - 3, 165.5 + 6);
	context.lineTo(50.5 + 3 * 70 + 3, 165.5 + 6);
	context.lineTo(50.5 + 3 * 70, 165.5);
	context.fill();
	
	context.moveTo(50.5 + 3 * 70, 165.5);
	context.lineTo(50.5 + 3 * 70, 230.5);
	context.stroke();
	
	context.moveTo(50.5 + 3 * 70, 230.5);
	context.lineTo(50.5 + 3 * 70 + 10, 230.5);
	context.stroke();
	
	//--- label median ---//
	context.fillText("Median", 50.5 + 3 * 70 + 20, 234.5);	
};
