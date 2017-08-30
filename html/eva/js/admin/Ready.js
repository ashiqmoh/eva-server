//--- administrator side JavaScripting starts here :) ---//
$(document).ready(function()
{
	localStorage.setItem("user", "admin");
	localStorage.setItem("pwd", "admin");
	localStorage.setItem("logged-in", "true");
	Login.setup();
});
