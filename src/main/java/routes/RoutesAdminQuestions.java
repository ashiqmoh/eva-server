package routes;

import static spark.Spark.before;
import static spark.Spark.halt;
import static spark.Spark.post;
import main.SparkServer;
import objects.Questionnaire;
import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Route;
import framework.AccessManager;
import framework.QuestionnaireManager;
import framework.Validation;
import com.google.gson.Gson;


public class RoutesAdminQuestions
{
	public static void setup()
	{
		//--- routes with questions     -> dean, dean of studies, lecturer and student ---//
		//--- routes with questionnaire -> administrator, organizer                    ---//
      	post(SparkServer.getBasePath() + "/eva/admin/questions", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				final String semester = req.queryParams("semester");
				return QuestionnaireManager.getQuestionnaireAsJson(semester);
			}
		});
      	
      	before(SparkServer.getBasePath() + "/eva/admin/questionnaire/*", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- access validation ---//
				//--- only organizer and system administrator has access to section 'Fragebogen' ---//
				final String username = req.queryParams("user");
				final String path = req.queryParams("path");
				if (!AccessManager.hasAccess(username, path)) halt(401);
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/questionnaire/get", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- returns questionnaire set for current semester ---//
				final Questionnaire questionnaire = QuestionnaireManager.getCurrentQuestionnaire();
				if (questionnaire == null) return "{\"error\":\"add semester first\"}";
				return new Gson().toJson(questionnaire);
			}
		});
      	
      	before(SparkServer.getBasePath() + "/eva/admin/questionnaire/category/:op", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- form validation to change categories in questionnaire ---//
				//--- :op -> add, update, remove, sort ---//
				//--- validated based on operation ---//
				final String op = req.params(":op");
				if (op.equals("update") || op.equals("remove") || op.equals("sort"))
				{
					final String oldHeaderDEAsJson = req.queryParams("oldHeaderDEAsJson");
					if (Validation.isEmpty(oldHeaderDEAsJson)) halt(400);
					if (!Validation.isArrayOfString(oldHeaderDEAsJson)) halt(400);
				}
				if (op.equals("add") || op.equals("update"))
				{
					final String newHeaderDE = req.queryParams("newHeaderDE");
					final String newHeaderEN = req.queryParams("newHeaderEN");
			  		final String oldHeaderDEAsJson = req.queryParams("oldHeaderDEAsJson");
			  		
			  		if (Validation.isEmpty(newHeaderDE)) halt(400);
			  		if (Validation.isEmpty(newHeaderEN)) halt(400);
			  		if (QuestionnaireManager.isDuplicateCategory(op, newHeaderDE, oldHeaderDEAsJson)) halt(400);
				}
				if (op.equals("sort"))
				{
					final String newPosition = req.queryParams("newPosition");
					if (Validation.isEmpty(newPosition)) halt(400);
					if (!Validation.isInteger(newPosition)) halt(400);
				}
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/questionnaire/category/:op", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- route to change categories in questionnaire ---//
				//--- :op -> add, update, remove, sort ---//
				final String op = req.params(":op");
				final String newHeaderDE = req.queryParams("newHeaderDE");
				final String newHeaderEN = req.queryParams("newHeaderEN");
				final String oldHeaderDEAsJson = req.queryParams("oldHeaderDEAsJson");
				final String newPosition = req.queryParams("newPosition");
				QuestionnaireManager.addUpdateRemoveSortCategory(op, newHeaderDE, newHeaderEN, oldHeaderDEAsJson, newPosition);
				return "{\"op\":\"success\"}";
			}
		});
      	
      	before(SparkServer.getBasePath() + "/eva/admin/questionnaire/question/:op", new Filter() {
			@Override
			public void handle(Request req, Response res) throws Exception {
				//--- form validation to change question in questionnaire ---//
				//--- :op -> add, update, remove, sort ---//
				//--- validated based on operation ---//
				final String op = req.params(":op");
				if (op.equals("update") || op.equals("remove") || op.equals("sort"))
				{
					final String oldParagraphDEAsJson = req.queryParams("oldParagraphsDEAsJson");
					if (Validation.isEmpty(oldParagraphDEAsJson)) halt(400);
					if (!Validation.isArrayOfString(oldParagraphDEAsJson)) halt(400);
				}
				if (op.equals("add") || op.equals("update") || op.equals("sort"))
				{
					final String headerDE = req.queryParams("headerDE");
					if (Validation.isEmpty(headerDE)) halt(400);
				}
				if (op.equals("add") || op.equals("update"))
				{
					final String headerDE = req.queryParams("headerDE");
					final String type = req.queryParams("type");
					final String newParagraphDE = req.queryParams("newParagraphDE");
					final String newParagraphEN = req.queryParams("newParagraphEN");
			  		final String oldParagraphDEAsJson = req.queryParams("oldParagraphsDEAsJson");
			  		
			  		if (Validation.isEmpty(type)) halt(400);
			  		if (!type.equals("radio") && !type.equals("text")) halt(400);
			  		if (Validation.isEmpty(newParagraphDE)) halt(400);
			  		if (Validation.isEmpty(newParagraphEN)) halt(400);
			  		
			  		if (QuestionnaireManager.isDuplicateQuestion(op, headerDE, newParagraphDE, oldParagraphDEAsJson)) halt(400);
				}
				if (op.equals("sort"))
				{
					final String newPosition = req.queryParams("newPosition");
					if (Validation.isEmpty(newPosition)) halt(400);
					if (!Validation.isInteger(newPosition)) halt(400);
				}
			}
		});
      	
      	post(SparkServer.getBasePath() + "/eva/admin/questionnaire/question/:op", new Route() {
			@Override
			public Object handle(Request req, Response res) {
				//--- route to change questions in questionnaire ---//
				//--- :op -> add, update, remove, sort ---//
				final String op = req.params(":op");
				final String headerDE = req.queryParams("headerDE");
				final String type = req.queryParams("type");
				final String newParagraphDE = req.queryParams("newParagraphDE");
				final String newParagraphEN = req.queryParams("newParagraphEN");
				final String labelDEAsJson = req.queryParams("labelDEAsJson");
				final String labelENAsJson = req.queryParams("labelENAsJson");
				final String oldParagraphsDEAsJson = req.queryParams("oldParagraphsDEAsJson");
				final String newPosition = req.queryParams("newPosition");
				QuestionnaireManager.addUpdateRemoveSortQuestion(op, headerDE, type, newParagraphDE, newParagraphEN, labelDEAsJson, labelENAsJson, oldParagraphsDEAsJson, newPosition);
				return "{\"op\":\"success\"}";
			}
		});
	}
}
