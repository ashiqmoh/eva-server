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

public class RoutesAdminDirectories
{
	public static void setup()
	{
		before(SparkServer.getBasePath() + "/eva/admin/directories", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				res.type("json");
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				//--- access validation ---//
				if (!Directories.isExist(path)) halt(404);
				if (!Directories.hasFrameworkAccess(path)) halt(404);
				if (!AccessManager.hasAccess(username, path)) halt(401);
			}
		});
		
      	post(SparkServer.getBasePath() + "/eva/admin/directories", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- returns sub directories of the given path ---//
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				return Directories.get(path, username);
			}
		});
	}
}
