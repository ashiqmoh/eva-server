package routes;

import static spark.Spark.before;
import static spark.Spark.halt;
import static spark.Spark.post;
import main.SparkServer;
import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Route;
import framework.AccessManager;
import framework.Directories;
import framework.Hierarchies;
import framework.Validation;


public class RoutesAdminHierarchies
{
	public static void setup()
	{
		before(SparkServer.getBasePath() + "/eva/admin/hierarchies/*", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				//--- access validation ---//
				//--- only organizer and system administrator has access to section 'Administration' ---//
				if (!Directories.isExist(path)) halt(404);
				if (!Hierarchies.hasFrameworkAccess(path)) halt(401);
				if (!AccessManager.hasAccess(username, path)) halt(401);
			}
		});
		
		before(SparkServer.getBasePath() + "/eva/admin/hierarchies/:op", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- form validation three different operations: new, updata, delete ---//
				final String op = req.params(":op");
				if (op.equals("delete"))
				{
					final String paths = req.queryParams("paths");
					if (Validation.isEmpty(paths)) halt(400);
					if (!Validation.isArrayOfString(paths)) halt(400);
				}
				if (op.equals("update"))
				{
					final String oldFolderName = req.queryParams("oldFolderName");
					if (Validation.isEmpty(oldFolderName)) halt(400);
				}
				if (op.equals("new") || op.equals("update"))
				{
					final String path = req.queryParams("path");
					final String oldFolderName = req.queryParams("oldFolderName");
			  		final String name = req.queryParams("name");
			  		final String shortname = req.queryParams("shortname");
			  		final String semester = req.queryParams("semester");
			  		final String accessAsJson = req.queryParams("accessAsJson");
			  		final int level = path.split("/").length;
					
			  		if (Validation.isEmpty(path)) halt(400);
			  		if (Validation.isEmpty(name)) halt(400);
			  		if (Validation.isEmpty(shortname)) halt(400);
			  		if (Validation.isEmpty(accessAsJson)) halt(400);
			  		//--- level 5 here is course level, semester is required ---//
			  		if (level == 5 && Validation.isEmpty(semester)) halt(400);
			  		if (Hierarchies.isDuplicate(path, oldFolderName, name, shortname)) halt(400);
				}
			}
		});
		
      	post(SparkServer.getBasePath() + "/eva/admin/hierarchies/:op", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- :op -> list, new, update, delete ---//
				final String op = req.params(":op");
				//--- lists all hierarchy item(s) for the given path ---//
				if (op.equals("list"))
				{
					final String username = req.queryParams("user");
					final String path = req.queryParams("path");
					return Hierarchies.get(username, path);
				}
				//--- deletes hierarchy item(s) from database ---//
				else if (op.equals("delete"))
				{
					final String paths = req.queryParams("paths");
					return Hierarchies.delete(paths);
				}
				//--- adds a new hierarchy item or updates an existing one ---//
				else if (op.equals("new") || op.equals("update"))
				{
					final String path = req.queryParams("path");
			  		final String oldFolderName = req.queryParams("oldFolderName");
			  		final String name = req.queryParams("name");
			  		final String shortname = req.queryParams("shortname");
			  		final String semester = req.queryParams("semester");
			  		final String accessAsJson = req.queryParams("accessAsJson");
			  		return Hierarchies.createOrUpdate(op, path, oldFolderName, name, shortname, semester, accessAsJson);
				}
				return null;
			}
		});
	}
}
