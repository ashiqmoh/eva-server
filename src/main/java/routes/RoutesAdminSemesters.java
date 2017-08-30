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
import framework.SemesterManager;
import framework.Validation;

public class RoutesAdminSemesters
{
	public static void setup()
	{
		before(SparkServer.getBasePath() + "/eva/admin/semesters/*", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- access authentication ---//
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				if (!SemesterManager.hasFrameworkAccess(path)) halt(401);
				//--- role validation. only administrator and organizer can access ---//
				if (!AccessManager.hasAccess(username, path)) halt(401);
			}
		});
		
		before(SparkServer.getBasePath() + "/eva/admin/semesters/:op", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- form validation ---//
				//--- :op -> list, new, update, delete ---//
				final String op = req.params(":op");
				if (op.equals("delete"))
				{
					final String name = req.queryParams("name");
					if (Validation.isEmpty(name)) halt(400);
					if (!Validation.isArrayOfString(name)) halt(400);
				}
				else if (op.equals("new") || op.equals("update"))
				{
					
					final String oldSemester = req.queryParams("name");
					final String ssws = req.queryParams("ssws");
					final String year = req.queryParams("year");
					final String isCurrentSemester = req.queryParams("currentSemester");
					
					if (op.equals("update") && Validation.isEmpty(oldSemester) && oldSemester.length() != 7) halt(400);
					
					if (Validation.isEmpty(ssws)) halt(400);
					if (!ssws.equals("SS") && !ssws.equals("WS")) halt(400);
					
					if (Validation.isEmpty(year)) halt(400);
					if (!Validation.isInteger(year)) halt(400);
					if (year.length() != 4) halt(400);
					
					if (Validation.isEmpty(isCurrentSemester)) halt(400);
					
					//--- boolean true or false validation ---//
					if (!isCurrentSemester.equals("true") && !isCurrentSemester.equals("false")) halt(400);
					final String newSemester = year + "-" + ssws;
					if (SemesterManager.isDuplicate(newSemester, oldSemester)) halt(400);
				}
			}
		});
		
		get(SparkServer.getBasePath() + "/eva/admin/semesters/:op", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- :op -> list, new, update, delete ---//
				final String op = req.params(":op");
				//--- return semester listing from database ---//
				if (op.equals("list"))
				{
					return SemesterManager.get();
				}
				//--- adding, updating and deleting a semester ---//
				else if (op.equals("new") || op.equals("update") || op.equals("delete"))
				{
			  		final String name = req.queryParams("name");
			  		final String ssws = req.queryParams("ssws");
			  		final String year = req.queryParams("year");
			  		final String isCurrentSemester = req.queryParams("currentSemester");
			  		return SemesterManager.addUpdateDelete(op, name, ssws, year, isCurrentSemester);
				}
				return null;
			}
		});
		
		post(SparkServer.getBasePath() + "/eva/admin/semesters/:op", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- :op -> list, new, update, delete ---//
				final String op = req.params(":op");
				//--- return semester listing from database ---//
				if (op.equals("list"))
				{
					return SemesterManager.get();
				}
				//--- adding, updating and deleting a semester ---//
				else if (op.equals("new") || op.equals("update") || op.equals("delete"))
				{
			  		final String name = req.queryParams("name");
			  		final String ssws = req.queryParams("ssws");
			  		final String year = req.queryParams("year");
			  		final String isCurrentSemester = req.queryParams("currentSemester");
			  		return SemesterManager.addUpdateDelete(op, name, ssws, year, isCurrentSemester);
				}
				return null;
			}
		});
	}
}
