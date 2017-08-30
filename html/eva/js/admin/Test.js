//--- for robutness test ---//
//--- only for system administrator ---//
//--- start test by typing 'Test.start()' on browser's console ---//
//--- terminate by typing 'Test.stop()' ---//
var Test = {};

//--- pre-set timer and path here ---//
Test.timer = 1000;
Test.codes = null;
Test.runner = null;
Test.path = "./Home/Codes/2014-WS/Mechanical and Medical Engineering - MME";

Test.start = function ()
{
	Test.getCodes();
	return "loading ...";
};

Test.getCodes = function ()
{
	//--- AJAX request to get codes for testing from path 'Test.path' ---// 
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "./codes/list",
		data:
		{
			user: USER,
			pwd: PWD,
			path: Test.path,
			codePaths: JSON.stringify([Test.path])
		},
		success: function (json)
		{
			Test.setCodes(json);
		}
	});
};

Test.setCodes = function (json)
{
	//--- converts JSON string to array ---//
	Test.codes = [];
	for (var i = 0; i < json.length; i++)
	{
		Test.codes = Test.codes.concat(json[i].codeList);
	}
	console.log("- test started -");
	//--- starts evaluation submission to server with time interval 'Test.timer' in millisecond ---//
	Test.runner = setInterval(function () { Test.send(); }, Test.timer);
};

Test.send = function ()
{
	//--- use code for answer submission from random array position ---//
	var codePosition = Math.floor(this.codes.length * Math.random());
	var code = this.codes[codePosition];
	
	//--- loads sample answer ---//
	var lorem50 = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
	var lorem75 = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At";
	var lorem100 = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
	
	var answers = [];
	for (var j = 0; j < 19; j++)
	{
		answers[j] = Math.ceil(5 * Math.random()).toString();
	}
	answers[19] = lorem50;
	answers[20] = lorem75;
	answers[21] = lorem100;
	
	//--- AJAX request to submit evaluation ---//
	$.ajax
	({
		type: "POST",
		dataType: "json",
		url: "/eva/client/submit",
		data:
		{
			code: code,
			result: JSON.stringify(answers)
		},
		success: function(json)
		{
			var time = new Date().toLocaleTimeString();
			//--- answers stored ---//
			if (json.isStored === true)
			{
				console.log(time + " >> code: " + code + "; ajax: success; store: true;");
			}
			//--- if storing fails ---//
			else
			{
				console.warn(time + " >> code: " + code + "; ajax: success; store: false;");
			}
		}
	});
};

Test.stop = function()
{	
	//--- stops test and clears 'Test.codes' and 'Test.runner' ---//
	clearInterval(Test.runner);
	Test.codes = null;
	Test.runner = null;
	return "- test terminated -";
};
