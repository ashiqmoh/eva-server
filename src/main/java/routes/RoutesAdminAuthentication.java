package routes;

import static spark.Spark.before;
import static spark.Spark.halt;
import static spark.Spark.post;
import main.SparkServer;
import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Route;
import framework.AuthenticationManager;
import framework.UserManager;
import framework.Validation;

public class RoutesAdminAuthentication
{
	public static void setup()
	{
      	before(SparkServer.getBasePath() + "/eva/admin/*", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				res.type("json");
				//--- !! important -> any GET method will by pass username-password authentication ---//
				if (req.requestMethod().equals("POST"))
				{
					//--- username validation: not empty ---//
					final String username = req.queryParams("user");
					if (Validation.isEmpty(username)) halt(400);
					
					//--- no password authentication for route "/forgotPassword" ---//
					if (!req.pathInfo().contains("forgotPassword"))
					{
						//--- password validation ---//
						final String password = req.queryParams("pwd");
						if (Validation.isEmpty(password)) halt(400);
						
						//--- username password authentication ---//
						if (!UserManager.isAuthorized(username, password)) halt(401);
					}
				}
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/auth", new Route()
      	{
      		@Override
      		public Object handle(Request req, Response res) {
      			//--- returns home directories, which the user has access to ---//
      			final String username = req.queryParams("user");
      			return AuthenticationManager.get(username);
      		}
      	});
      	
      	before(SparkServer.getBasePath() + "/eva/admin/changePassword", new Filter()
      	{
      		@Override
	      	public void handle(Request req, Response res) {
	      		final String username = req.queryParams("user");
	      		final String newPassword = req.queryParams("newPassword");
	      		final String newPasswordRepeat = req.queryParams("newPasswordRepeat");
	      		
	      		//--- form validation ---//
	      		if (Validation.isEmpty(username)) halt(400);
	      		if (Validation.isEmpty(newPassword)) halt(400);
	      		if (Validation.isEmpty(newPasswordRepeat)) halt(400);
	      		if (!newPassword.equals(newPasswordRepeat)) halt(400);
	      		if (newPassword.length() < 8) halt(400);
      		}
      	});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/forgotPassword", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- sends user password to the respective user's email address ---//
				final String username = req.queryParams("user");
				return UserManager.forgotPassword(username);
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/changePassword", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- changes user password ---//
				final String username = req.queryParams("user");
				final String newPassword = req.queryParams("newPassword");
				final String newPasswordRepeat = req.queryParams("newPasswordRepeat");
				return UserManager.changePassword(username, newPassword, newPasswordRepeat);
			}
		});
	}
}
