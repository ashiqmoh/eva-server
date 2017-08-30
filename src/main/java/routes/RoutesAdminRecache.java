package routes;

import static spark.Spark.before;
import static spark.Spark.halt;
import static spark.Spark.post;
import main.SparkServer;
import objects.Access.Role;
import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Route;
import framework.*;

public class RoutesAdminRecache
{
	public static void setup()
	{
      	before(SparkServer.getBasePath() + "/eva/admin/recache", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- access validation ---//
				//--- only system administrator can recache ---//
				final String username = req.queryParams("user");
				if (!AccessManager.hasRole(username, Role.ADMINISTRATOR)) halt(401);
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/recache", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- function init() in all classes includes clearing cache and ---//
				//--- re-caching data from file system ---//
				//--- re-caching must follow the following order Directories, Hierarchies, UserManager, ... as shown below---//
				Directories.init();
				Hierarchies.init();
				UserManager.init();
				AccessManager.init();
				CodeManager.init();
				SemesterManager.init();
				QuestionnaireManager.init();
				Results.init();
				Statistics.init();
				
				return "{\"op\":true}";
			}
		});
	}
}
