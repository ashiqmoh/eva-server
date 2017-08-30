var History = {};

History.setup = function ()
{
	//--- popstate is triggered when user navigate through ---//
	//--- forward and back button of the browser ---//
	$(window).bind("popstate", function(event)
	{
		var state = event.originalEvent.state;
		if (state === undefined || state === null)
		{
			Login.revoke();
			return;
		}
		var func = state.callback.split(".");
		//--- calls function func[0].func[1](state.path) ---//
		window[func[0]][func[1]](state.path);
	});
};

History.push = function (callback, path)
{
	//--- this function is called to store browser history ---//
	var href = path.replace(".","#") + "&" + callback;
	var dirs = path.split("/");
	var title = dirs[dirs.length - 1];
	//--- if previously stored address bar url same with this one, return (don't store) ---//
	//--- avoid same entry one after another ---//
	if (sessionStorage.getItem("hash-url") === href)
	{
		return;
	}
	window.history.pushState({callback: callback, path: path}, title, href);
	sessionStorage.setItem("hash-url", href);
};
