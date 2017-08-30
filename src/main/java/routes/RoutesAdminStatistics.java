package routes;

import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.halt;
import static spark.Spark.post;
import main.SparkServer;
import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Route;
import framework.AccessManager;
import framework.Directories;
import framework.Statistics;

public class RoutesAdminStatistics
{
	public static void setup()
	{
		before(SparkServer.getBasePath() + "/eva/admin/statistics", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- access validations ---//
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				
				if (!Directories.isExist(path)) halt(404);
				//--- framework validation ---//
				if (!Statistics.hasFrameworkAccess(path)) halt(401);
				//--- role (dean, dean of studies, lecturer) and path (faculty, major, course) validation ---//
				if (!AccessManager.hasAccess(username, path)) halt(401);
			}
		});
		
		get(SparkServer.getBasePath() + "/eva/admin/statistics", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- returns statistics data for the given path ---//
				final String path = req.queryParams("path");
				return Statistics.get(path);
			}
		});
		
		post(SparkServer.getBasePath() + "/eva/admin/statistics", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- returns statistics data for the given path ---//
				final String path = req.queryParams("path");
				return Statistics.get(path);
			}
		});
	}
}
