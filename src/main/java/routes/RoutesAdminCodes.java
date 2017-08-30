package routes;

import static spark.Spark.before;
import static spark.Spark.halt;
import static spark.Spark.post;

import java.util.ArrayList;
import java.util.List;

import main.SparkServer;

import com.google.gson.Gson;

import objects.Codes;
import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Route;
import framework.AccessManager;
import framework.CodeManager;
import framework.Directories;
import framework.Validation;

public class RoutesAdminCodes
{
	public static void setup()
	{
		//--- routes to handle requests to do with codes ---//
		before(SparkServer.getBasePath() + "/eva/admin/codes/*", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				//--- access validation ---//
				//--- only organizer and system administrator has access to section 'Codes' ---//
				if (!Directories.isExist(path)) halt(404);
				if (!AccessManager.hasAccess(username, path)) halt(401);
			}
		});
		
		post(SparkServer.getBasePath() + "/eva/admin/codes/list", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- returns codes list for the given path ---//
				final String username = req.queryParams("user");
				final String codePaths = req.queryParams("codePaths");
				final List<Codes> list = new ArrayList<Codes>();
				final Gson gson = new Gson();
				final String[] paths = gson.fromJson(codePaths, String[].class);
				for (final String path : paths) CodeManager.getCodes(path, username, list);
				return CodeManager.toJson(list);
			}
		});
		
		before(SparkServer.getBasePath() + "/eva/admin/codes/new", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- number of codes validation ---//
				//--- if not a integer or integer less than 1 -> halt(400) ---//
				final String numberOfCodes = req.queryParams("numberOfCodes");
				if (Validation.isEmpty(numberOfCodes)) halt(400);
				if (!Validation.isInteger(numberOfCodes)) halt(400);
				if (Integer.parseInt(numberOfCodes) < 1) halt(400);
				
				//--- code paths validation ---//
				//--- throws exception if codePaths is not String[] ---//
				final String codePaths = req.queryParams("codePaths");
				if (Validation.isEmpty(codePaths)) halt(400);
				if (!Validation.isArrayOfString(codePaths)) halt(400);
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/codes/new", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- adds new code to database ---//
				final String username = req.queryParams("user");
				final String codePaths = req.queryParams("codePaths");
				final int numberOfCodes = Integer.parseInt(req.queryParams("numberOfCodes"));
				final Gson gson = new Gson();
				final String[] paths = gson.fromJson(codePaths, String[].class);
				for (final String path : paths) CodeManager.create(path, username, numberOfCodes);
				return "{\"op\":true}";
			}
		});
	}
}
