package framework;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import objects.Category;
import objects.Question;
import objects.Questionnaire;

//--- manages questionnaire through adding, removing, changing, sorting and querying ---//
//--- questionnaire divided into 2 levels - category and question ---//
public class QuestionnaireManager
{
	private static final String SECTION_NAME = "Fragebogen";
	private static final String SECTION_DIR = Directories.getHomeDir() + "/" + SECTION_NAME;
	private static final String FILENAME = "questionnaire";
	
	private static ConcurrentMap<String, Questionnaire> semester2questionnaire = new ConcurrentHashMap<String, Questionnaire>();
	
	public static void init()
	{
		//--- clear HashMap semester2questionnaire ---//
		semester2questionnaire.clear();
		final File file = new File(SECTION_DIR);
		//--- creates ./Home/Fragebogen directory if doesn't exist ---//
		if (!file.exists()) file.mkdirs();
		else
		{
			//--- gets all sub directories (:semester) in ./Home/Fragebogen directory ---//
			for (final File f : file.listFiles())
			{
				if (f.isDirectory())
				{
					//--- reads name and contents of file ./Home/Fragebogen/:semester/questionnaire.json ---//
					final String semester = f.getName();
					final String jsonFile = f.getPath() + "/" + FILENAME + "." + Directories.getFileExt();
					final String content = FileIO.readFromFile(jsonFile);
					//--- converts JSON string to Questionnaire Java object ---//
					final Questionnaire questionnaire = new Gson().fromJson(content, Questionnaire.class);
					//--- content in questionnaire.json file doesn't have semester field to avoid duplication ---//
					//--- for questionnaire object in HashMap, semester field has to be set during initialization ---//
					questionnaire.setSemester(semester);
					semester2questionnaire.put(semester, questionnaire);
				}
			}
		}
	}
	
	public static String getSectionName()
	{
		return SECTION_NAME;
	}
	
	public static String getSectionDir()
	{
		return SECTION_DIR;
	}
	
	public static Questionnaire getQuestionnaire(final String semester)
	{
		//--- called from framework.Statistics.calculate() ---//
		//--- Object questionnaire is required to determine questions' type in the calculation ---//
		//--- returns questionnaire as object Questionnaire for the @param semester ---//
		return semester2questionnaire.get(semester);
	}
	
	public static String getQuestionnaireAsJson(final String semester)
	{
		//--- only for DEAN, DEAN_OF_STUDIES and LECTURER ---//
		//--- returns questionnaire as JSON string for the given @param semester ---//
		final Questionnaire questionSet = semester2questionnaire.get(semester);
		return new Gson().toJson(questionSet);
	}
	
	public static Questionnaire getCurrentQuestionnaire()
	{
		//--- returns questionnaire from current semester as JSON string ---//
		//--- student and organizer can only view the questionnaire for current semester ---//
		final String currentSemester = SemesterManager.getCurrentSemester();
		if (currentSemester == null) return null;
		final Questionnaire questionnaire = semester2questionnaire.get(currentSemester);
		return questionnaire;
		// return new Gson().toJson(questionnaire);
	}
	
	public static void setQuestionnaireNotChangeable(final String semester)
	{
		//--- if questionnaire of the given semester is already sets isChangeable to false, it returns ---//
		//--- else sets questionnaire isChangeable to false ---//
		//--- rewrites the questionnaire.json file in the ./Home/Fragebogen/:semester ---//
		if (!semester2questionnaire.get(semester).isChangeable()) return;
		final Questionnaire questionnaire = semester2questionnaire.get(semester);
		questionnaire.setChangeable(false);
		final String path = SECTION_DIR + "/" + semester + "/" + FILENAME + "." + Directories.getFileExt();
		final Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		final String content = gson.toJson(questionnaire);
		FileIO.writeToFile(path, content);
	}
	
	public static void addUpdateQuestionnaire(final String op, final String newSemester, final String oldSemester)
	{
		//--- called when adding new semester OR renaming existing semester ---//
		//--- question set won't be removed even if the semester is deleted ---//
		//--- semester folder in ./Home/Fragebogen will be added and renamed in SemesterManager framework ---//
		if (op.equals("add"))
		{
			//--- if currentSemester is not null, copy questionnaire from current semester to new semester ---//
			//--- if currentSemester is null, copy questionnaire from ./temp/questionnaire.json ---//
			String path;
			if (SemesterManager.getCurrentSemester() == null) path = "./temp/questionnaire.json";
			else path = SECTION_DIR + "/" + SemesterManager.getCurrentSemester() + "/" + FILENAME + "." + Directories.getFileExt();
			final String content = FileIO.readFromFile(path);
			//--- converts JSON string to Java object Questionnaire ---//
			final Questionnaire questionnaire = new Gson().fromJson(content, Questionnaire.class);
			//--- new questionnaire by default is changeable -> setChangeable(true) ---//
			questionnaire.setChangeable(true);
			//--- sets new questionnaire's semester with @param newSemester ---//
			questionnaire.setSemester(newSemester);
			//--- add new questionnaire to HashMap ---//
			semester2questionnaire.put(newSemester, questionnaire);
			
			//--- add directories ./Home/Fragebogen/[newSemester]/questionnaire.json ---//
			//--- writes new questionnaire as JSON string ---//
			final String newPath = SECTION_DIR + "/" + newSemester + "/" + FILENAME + "." + Directories.getFileExt();
			final Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			final String newContent = gson.toJson(questionnaire);
			FileIO.writeToFile(newPath, newContent);
		}
		else if (op.equals("update"))
		{
			//--- if questionnaire is updated, the semester attribute will be updated ---//
			final Questionnaire questionnaire = semester2questionnaire.get(oldSemester);
			questionnaire.setSemester(newSemester);
			semester2questionnaire.remove(oldSemester);
			semester2questionnaire.put(newSemester, questionnaire);
		}
	}
	
	public static boolean isDuplicateCategory(final String op, final String newHeaderDE, final String oldHeaderDEAsJson)
	{
		//--- checks if newHeaderDE is a duplicate or not ---//
		//--- called when new category is added or an existing category is updated ---//
		final String semester = SemesterManager.getCurrentSemester();
		final Questionnaire questionnaire = semester2questionnaire.get(semester);
		//--- extract headerDE from oldHeaderDEAsJson ---//
		String oldHeaderDE = "";
		if (op.equals("update")) oldHeaderDE = new Gson().fromJson(oldHeaderDEAsJson, String[].class)[0];
		
		for (final Category category : questionnaire.getCategories())
		{
			if (category.getHeaderDE().equals(newHeaderDE) && !newHeaderDE.equals(oldHeaderDE)) return true;
		}
		return false;
	}
	
	public static void addUpdateRemoveSortCategory(final String op, final String newHeaderDE,
			final String newHeaderEN, final String oldHeaderDEAsJson, final String newPosition)
	{
		//--- called when adding, updating, removing or sorting category ---//
		//--- important: for category, German header (headerDE) acts as the key ---//
		//--- gets questionnaire for current semester from the HashMap ---//
		final String semester = SemesterManager.getCurrentSemester();
		final Questionnaire questionnaire = semester2questionnaire.get(semester);
		//--- returns if the questionnaire is not changeable ---//
		if (!questionnaire.isChangeable()) return;
		if (op.equals("add"))
		{
			//--- if a new category is added, Category object will be initialized ---//
			//--- and added to Categories list in Questionnaire object ---//
			final List<Question> questions = new ArrayList<Question>();
			final Category category = new Category(newHeaderDE, newHeaderEN, questions);
			questionnaire.getCategories().add(category);
		}
		else if (op.equals("update"))
		{
			//--- executed when a category is updated ---//
			//--- extract the current German header from the @param oldHeaderDEAsJson ---//
			//--- German header acts as the key here ---//
			final String oldHeaderDE = new Gson().fromJson(oldHeaderDEAsJson, String[].class)[0];
			int i = 0;
			//--- finds the position of the updated category on Categories list in questionnaire object ---//
			for (final Category category : questionnaire.getCategories())
			{
				if (category.getHeaderDE().equals(oldHeaderDE)) break;
				i++;
			}
			//--- sets the category with new German and English header ---//
			questionnaire.getCategories().get(i).setHeaderDE(newHeaderDE);
			questionnaire.getCategories().get(i).setHeaderEN(newHeaderEN);
		}
		else if (op.equals("remove"))
		{
			//--- executed when a category is removed ---//
			//--- extracts the German header(s) [array] from @param oldHeaderDEAsJson ---//
			final String[] oldHeaderDEs = new Gson().fromJson(oldHeaderDEAsJson, String[].class);
			//--- for every exctracted German header(s) ---//
			for (final String oldHeaderDE : oldHeaderDEs)
			{
				int i = 0;
				//--- finds the position of Category object needed to be removed from Categories list ---//
				for (final Category category : questionnaire.getCategories())
				{
					if (category.getHeaderDE().equals(oldHeaderDE)) break;
					i++;
				}
				questionnaire.getCategories().remove(i);
			}
		}
		else if (op.equals("sort"))
		{
			//--- extracts the German header from @param oldHeaderDEAsJson ---//
			final String oldHeaderDE = new Gson().fromJson(oldHeaderDEAsJson, String[].class)[0];
			int i = 0;
			//--- finds the position of category in Categories list ---//
			for (final Category category : questionnaire.getCategories())
			{
				if (category.getHeaderDE().equals(oldHeaderDE)) break;
				i++;
			}
			//--- get Category reference ---//
			final Category category = questionnaire.getCategories().get(i);
			//--- removes it from Categories list first ---//
			questionnaire.getCategories().remove(i);
			//--- inserts it back into Categories list at the specified position @param newPosition ---//
			questionnaire.getCategories().add(Integer.parseInt(newPosition), category);
		}
		//--- updates contents of ./Home/Fragebogen/[current-semester]/questionnaire.json in file system ---//
		final String path = SECTION_DIR + "/" + semester + "/" + FILENAME + "." + Directories.getFileExt();
		final String content = new Gson().toJson(questionnaire);
		FileIO.writeToFile(path, content);
	}
	
	public static boolean isDuplicateQuestion(final String op, final String headerDE, 
			final String newParagraphDE, final String oldParagraphDEAsJson)
	{
		//--- checks if newParagraphDE is a duplicate or not ---//
		//--- called when new question is added or an existing question is updated ---//
		final String semester = SemesterManager.getCurrentSemester();
		final Questionnaire questionnaire = semester2questionnaire.get(semester);
		
		//--- gets the position of category in List<Category> based on the given @param headerDE ---//
		int categoryPos = 0;
		for (final Category category : questionnaire.getCategories())
		{
			if (category.getHeaderDE().equals(headerDE)) break;
			categoryPos++;
		}
		final Category category = questionnaire.getCategories().get(categoryPos);
		
		//--- extracts oldPagraphDE from JSON string oldParagraphDEAsJson ---//
		String oldParagraphDE = "";
		if (op.equals("update")) oldParagraphDE = new Gson().fromJson(oldParagraphDEAsJson, String[].class)[0];
		
		//--- for all available question, compare the new paragraphDE with the existing paragraphDE ---//
		for (final Question question : category.getQuestions())
		{
			if (question.getParagraphDE().equals(newParagraphDE) && !newParagraphDE.equals(oldParagraphDE))
			{
				return true;
			}
		}
		return false;
	}
	
	public static void addUpdateRemoveSortQuestion(final String op, final String headerDE, final String type,
			final String newParagraphDE, final String newParagraphEN, final String labelDEAsJson,
			final String labelENAsJson, final String oldParagraphDEAsJson, final String newPosition)
	{
		//--- called when a question is added, updated, deleted or sorted ---//
		
		//--- gets questionnaire set for the current semester ---//
		final Questionnaire questionSet = semester2questionnaire.get(SemesterManager.getCurrentSemester());
		//--- if the questionnaire set is not changeable, return ---//
		if (!questionSet.isChangeable()) return;
		
		//--- every question belongs to a specific category ---//
		//--- finds the position of this category based on the given @param headerDE ---//
		int categoryPos = 0;
		for (final Category category : questionSet.getCategories())
		{
			if (category.getHeaderDE().equals(headerDE)) break;
			categoryPos++;
		}
		//--- holds reference to the category ---//
		final Category category = questionSet.getCategories().get(categoryPos);
		
		if (op.equals("add"))
		{
			//--- if add a new question, create new Question object and add it to List<Question> ---//
			final String[] labelDE = new Gson().fromJson(labelDEAsJson, String[].class);
			final String[] labelEN = new Gson().fromJson(labelENAsJson, String[].class);
			final Question question = new Question(type, newParagraphDE, newParagraphEN, labelDE, labelEN);
			category.getQuestions().add(question);
		}
		else if (op.equals("update"))
		{
			//--- extracts the paragraphDE from JSON string oldParagraphDEAsJson ---//
			final String oldParagraphDE = new Gson().fromJson(oldParagraphDEAsJson, String[].class)[0];
			//--- finds the position of the updated question in List<Question> ---//
			int i = 0;
			for (final Question question : category.getQuestions())
			{
				if (question.getParagraphDE().equals(oldParagraphDE)) break;
				i++;
			}
			//--- creates new Question object with the given details ---//
			final String[] labelDE = new Gson().fromJson(labelDEAsJson, String[].class);
			final String[] labelEN = new Gson().fromJson(labelENAsJson, String[].class);
			final Question question = new Question(type, newParagraphDE, newParagraphEN, labelDE, labelEN);
			//--- sets the question on this position with the new Question object ---//
			category.getQuestions().set(i, question);
		}
		else if (op.equals("remove"))
		{
			//--- extracts the paragraphDE (array) from JSON string oldParagraphDEAsJson ---//
			final String[] oldParagraphDEAsArray = new Gson().fromJson(oldParagraphDEAsJson, String[].class);
			//--- for every paragraphDE, find the position ---//
			for (final String oldParagraphDE : oldParagraphDEAsArray)
			{
				int i = 0;
				for (final Question question : category.getQuestions())
				{
					if (question.getParagraphDE().equals(oldParagraphDE)) break;
					i++;
				}
				//--- and remove it from List<Question> ---//
				category.getQuestions().remove(i);
			}
		}
		else if (op.equals("sort"))
		{
			//--- extracts paragraphDE from JSON string oldParagraphDEAsJson ---//
			final String oldParagraphDE = new Gson().fromJson(oldParagraphDEAsJson, String[].class)[0];
			//--- finds the position of this paragraph in List<Question> ---//
			int i = 0;
			for (final Question question : category.getQuestions())
			{
				if (question.getParagraphDE().equals(oldParagraphDE)) break;
				i++;
			}
			//--- holds reference to this Question ---//
			final Question question = category.getQuestions().get(i);
			//--- remove the this question from List<Question> first ---//
			category.getQuestions().remove(i);
			//--- inserts it back to the List<Question> on the newPosition ---//
			category.getQuestions().add(Integer.parseInt(newPosition), question);
		}
		//--- updates the ./Home/Fragebogen/[current-semester]/questionnaire.json in file system ---//
		final String path = SECTION_DIR + "/" + SemesterManager.getCurrentSemester() + "/" + FILENAME + "." + Directories.getFileExt();
		final String content = new Gson().toJson(questionSet);
		FileIO.writeToFile(path, content);
	}
}
