package routes;

import static spark.Spark.before;
import static spark.Spark.halt;
import static spark.Spark.post;
import main.SparkServer;
import objects.ClientEva;
import objects.Questionnaire;
import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Route;
import framework.CodeManager;
import framework.Hierarchies;
import framework.QuestionnaireManager;
import framework.Results;


import com.google.gson.Gson;

public class RoutesClient
{
	public static void setup()
	{
		//--- code validation ---//
      	before(SparkServer.getBasePath() + "/eva/client/*", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				res.type("application/json");
				if (!CodeManager.isValid(req.queryParams("code"))) halt(401);
			}
		});
      	
      	//--- returns questionnaire and starts evaluation ---//
      	post(SparkServer.getBasePath() + "/eva/client/", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				final String code = req.queryParams("code");
				final String path = CodeManager.getPath(code);
				final String[] dirs = path.split("/");
				final String relativePath = dirs[dirs.length-3] + "/" + dirs[dirs.length-2] + "/" + dirs[dirs.length-1];
				final Questionnaire questionnaire = QuestionnaireManager.getCurrentQuestionnaire();
				final String lecturer = Hierarchies.getLecturer(relativePath);
				final ClientEva clientEva = new ClientEva(path, lecturer, questionnaire);
				return new Gson().toJson(clientEva);
			}
		});
      	
      	//--- stores evaluation in the database ---//
      	post(SparkServer.getBasePath() + "/eva/client/submit", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				final String code = req.queryParams("code");
				final String result = req.queryParams("result");
				return Results.store(code, result);
			}
		});

	}
}
