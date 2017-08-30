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
import framework.UserManager;
import framework.Validation;

public class RoutesAdminUsers
{	
	public static void setup()
	{
		before(SparkServer.getBasePath() + "/eva/admin/users/*", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				//--- path validation ---//
				if (!UserManager.hasFrameworkAccess(path)) halt(404);
				//--- role validation. only administrator and organizer can access ---//
				if (!AccessManager.hasAccess(username, path)) halt(401);
			}
		});
		
		before(SparkServer.getBasePath() + "/eva/admin/users/:op", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- form validation ---//
				//--- for different operations, checks whether the required parameters is sent by client ---//
				//--- :op -> new, update, delete ---//
				final String op = req.params(":op");
				if (op.equals("delete"))
				{
					final String usernamesAsJson = req.queryParams("usernames");
					if (Validation.isEmpty(usernamesAsJson)) halt(400);
					if (!Validation.isArrayOfString(usernamesAsJson)) halt(400);
				}
				if (op.equals("update"))
				{
					final String key = req.queryParams("key");
					if (Validation.isEmpty(key)) halt(400);
				}
				if (op.equals("new") || op.equals("update"))
				{
					final String key = req.queryParams("key");
					final String username = req.queryParams("username");
			  		final String firstname = req.queryParams("firstname");
			  		final String lastname = req.queryParams("lastname");
			  		final String email = req.queryParams("email");
			  		
			  		if (Validation.isEmpty(username)) halt(400);
			  		if (Validation.isEmpty(firstname)) halt(400);
			  		if (Validation.isEmpty(lastname)) halt(400);
			  		if (Validation.isEmpty(email)) halt(400);
			  		
			  		final String[] disallowedChars = {"/", "\\", "*", "?", ":", "<", ">", "|", "\""};
			  		for (final String disallowedChar : disallowedChars)
			  		{
			  			if (username.contains(disallowedChar)) halt(400);
			  		}
					if (UserManager.isDuplicate(username, key)) halt(400);
				}
			}
		});
		
      	post(SparkServer.getBasePath() + "/eva/admin/users/list", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- returns list of users from database ---//
				final String path = req.queryParams("path");
				return UserManager.getUsers(path);
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/users/new", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- adds a new user to database ---//
				final String username = req.queryParams("username");
				final String firstname = req.queryParams("firstname");
				final String lastname = req.queryParams("lastname");
				final String email = req.queryParams("email");
				return UserManager.create(username, firstname, lastname, email);
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/users/update", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- updates an existing user ---//
				final String key = req.queryParams("key");
				final String username = req.queryParams("username");
				final String firstname = req.queryParams("firstname");
				final String lastname = req.queryParams("lastname");
				final String email = req.queryParams("email");
				return UserManager.update(key, username, firstname, lastname, email);
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/users/delete", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- deletes user(s) from database ---//
				final String usernamesAsJson = req.queryParams("usernames");
				return UserManager.delete(usernamesAsJson);
			}
		});

	}
}
