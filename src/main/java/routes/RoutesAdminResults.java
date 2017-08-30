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
import framework.Results;

public class RoutesAdminResults
{
	public static void setup()
	{
		before(SparkServer.getBasePath() + "/eva/admin/results/:op", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- access validations ---//
				//--- only dean, dean of studies and lecturer can access results ---//
				final String op = req.params(":op");
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				
				//--- framework access ---//
				if (!Results.hasFrameworkAccess(op, path)) halt(404);
				//--- path exists? ---//
				if (!Directories.isExist(path)) halt(404);
				//--- section and path access ---//
				if (!AccessManager.hasAccess(username, path)) halt(401);

			}
		});
		
		get(SparkServer.getBasePath() + "/eva/admin/results/:op", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- :op -> list, get ---//
				final String op = req.params(":op");
				final String path = req.queryParams("path");
				//--- list will list down all available results for a course ---//
				if (op.equals("list")) return Results.list(path);
				//--- get will display one single result ---//
				else if (op.equals("get")) return Results.get(path);
				else return null;
			}
		});
		
		post(SparkServer.getBasePath() + "/eva/admin/results/:op", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- :op -> list, get ---//
				final String op = req.params(":op");
				final String path = req.queryParams("path");
				//--- list will list down all available results for a course ---//
				if (op.equals("list")) return Results.list(path);
				//--- get will display one single result ---//
				else if (op.equals("get")) return Results.get(path);
				else return null;
			}
		});
	}
}
