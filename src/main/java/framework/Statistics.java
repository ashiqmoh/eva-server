package framework;

import java.io.File;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import objects.Category;
import objects.Question;
import objects.Questionnaire;
import objects.StatisticsItem;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;

//--- manages statistics through adding, removing, changing and querying stat ---//
//--- statistics will be calculated here by reading result data from file system ---//
public class Statistics
{
	private static final String SECTION_NAME = "Statistik";
	private static final String SECTION_DIR = Directories.getHomeDir() + "/" + SECTION_NAME;
	private static final String FILE_NAME = "statistics";
	private static final String FILE_EXT = "json";
	
	private static ConcurrentMap<String, StatisticsItem[]> path2statisticsItems = new ConcurrentHashMap<String, StatisticsItem[]>();
	
	public static void init()
	{
		//--- clear cache ---//
		path2statisticsItems.clear();
		final File file = new File(SECTION_DIR);
		//--- creates './Home/Statistik' directory if it doesn't exist ---//
		if (!file.exists()) file.mkdirs();
		
		//--- lists all JSON files under path './Home/Statistik' ---//
		final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{FILE_EXT}, true);
		for (final File f : jsonFiles) 
		{
			final String path = FilenameUtils.separatorsToUnix(f.getParent());
			//--- reads contents of JSON file ---//
			final String statisticsAsJson = FileIO.readFromFile(f.getPath());
			//--- converts to StaticticsItem object ---//
			final StatisticsItem[] statisticsItems = new Gson().fromJson(statisticsAsJson, StatisticsItem[].class);
			//--- cache it to HashMap ---//
			path2statisticsItems.put(path, statisticsItems);
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
	
	public static boolean hasFrameworkAccess(final String path)
	{
		//--- can access this framework if path contains string './Home/Statistik' ---//
		//--- can path level == 7 (course level) ---//
		final int pathLevel = path.split("/").length;
		if (pathLevel == 7 && path.contains(SECTION_DIR)) return true;
		return false;
	}
	
	public static String get(final String path)
	{
		//--- returns statistics data (n, mean, median, ...) for the given @param path ---//
		//--- if statistics data is not cached in the HashMap, calculate it first ---//
		if (!path2statisticsItems.containsKey(path)) calculate(path);
		//--- returns statistics data as JSON string ---//
		return new Gson().toJson(path2statisticsItems.get(path));
	}
	
	public static void calculate(final String path)
	{
		//--- calculates mean, median, standard deviation, quantile 75% and quantile 25% ---//
		final String[] dirs = path.split("/");
		
		//--- change './Home/Statistik/:faculty/:major/:course' to './Home/Ergebnisse/:faculty/:major/:course' ---//
		final String resultsPath = path.replace(SECTION_NAME, Results.getSectionName());
		final File resultsDir = new File(resultsPath);
		//--- lists all JSON files under './Home/Ergebnisse' ---//
		final Collection<File> jsonFiles = FileUtils.listFiles(resultsDir, new String[]{FILE_EXT}, false);
		
		//--- if no JSON files is found return an empty array ---//
		if (jsonFiles.size() == 0)
		{
			final StatisticsItem[] statisticsItems = {};
			final String statisticsItemsAsJson = new Gson().toJson(statisticsItems);
			final boolean isWritten = FileIO.writeToFile(path + "/" + FILE_NAME + "." + FILE_EXT, statisticsItemsAsJson);
			if (isWritten) path2statisticsItems.put(path, statisticsItems);
			return;
		}
		
		//--- loads the respective questionnaire sets based on the semester ---//
		final String semester = dirs[3];
		final Questionnaire questionnaire = QuestionnaireManager.getQuestionnaire(semester);
		
		//--- gets all questions from all categories ---//
		List<Question> questions = new ArrayList<Question>();
		for (Category category : questionnaire.getCategories())
		{
			for (Question question : category.getQuestions())
			{
				questions.add(question);
			}
		}
		
		final StatisticsItem[] statisticsItems = new StatisticsItem[questions.size()];
		
		final Map<Integer, List<String>> tempAnswers = new HashMap<Integer, List<String>>();
		
		//--- rearrange answers ---//
		for (final File jsonFile : jsonFiles)
		{
			final String filename = FilenameUtils.removeExtension(jsonFile.getName());
			final String content = FileIO.readFromFile(jsonFile.getPath());
			final String[] answers = new Gson().fromJson(content, String[].class);
			for (int i = 0; i < answers.length; i++)
			{
				if (answers[i].trim().length() > 0)
				{
					if (questions.get(i).getType().equals("text"))
					{
						answers[i] = answers[i] + " - " + filename;
					}
					if (tempAnswers.containsKey(i))
					{
						List<String> list = tempAnswers.get(i);
						list.add(answers[i]);
						tempAnswers.replace(i, list);
					}
					else
					{
						List<String> list = new ArrayList<String>();
						list.add(answers[i]);
						tempAnswers.put(i, list);
					}
				}
			}
		}
		
		//--- calculates mean, median, standard deviation, quantile 25% and 75% ---//
		for (final int key : tempAnswers.keySet())
		{
			final List<String> answerList = tempAnswers.get(key);
			final int n = answerList.size();
			//--- no mean, median, ... calculation for free text question ---//
			if (questions.get(key).getType().equals("text"))
			{
				final String[] feedbacks = answerList.toArray(new String[n]);
				statisticsItems[key] = new StatisticsItem(n, null, null, null, null, null, null, feedbacks);
			}
			else
			{
				List<Integer> values = new ArrayList<Integer>();
				Integer[] counts = {0, 0, 0, 0, 0};
				int sum = 0;
				int quadratSum = 0;
				for (int i = 0; i < n; i++)
				{
					final int value = Integer.parseInt(answerList.get(i));
					if (value == 1) counts[0]++;
					else if (value == 2) counts[1]++;
					else if (value == 3) counts[2]++;
					else if (value == 4) counts[3]++;
					else if (value == 5) counts[4]++;
					sum = sum + value;
					quadratSum = quadratSum + (value * value);
					values.add(value);
				}
				final double mean = (double) sum / (double) n;
				final double standardDeviation = (1 / ((double) n -1)) * ((double) quadratSum - ((double) n * mean * mean));
				Collections.sort(values);
				int median;
				if (n % 2 == 0)
				{
					int pos = (int) (0.5 * n);
					median = (values.get(pos) + values.get(pos-1)) / 2;
				}
				else
				{
					median = values.get((int) Math.floor(0.5 * n));
				}
				final int quantile025 = values.get((int) Math.floor(0.25 * n));
				final int quantile075 = values.get((int) Math.floor(0.75 * n));
				final DecimalFormat f = new DecimalFormat("0.00");
				statisticsItems[key] = new StatisticsItem(n, counts, f.format(mean), f.format(standardDeviation), median, quantile025, quantile075, null);
			}
		}
		//--- writes to file system ---//
		final String statisticsItemsAsJson = new Gson().toJson(statisticsItems);
		final boolean isWritten = FileIO.writeToFile(path + "/" + FILE_NAME + "." + FILE_EXT, statisticsItemsAsJson);
		//--- cache it to HashMap ---//
		if (isWritten) path2statisticsItems.put(path, statisticsItems);
	}
	
	public static void update(final String newPath, final String oldPath)
	{
		//--- called when an existing semester, faculty, major and course is updated ---//
		//--- remove old path from hash map recursively ---//
		//--- add new path to hash map recursively ---//
		remove(oldPath);
		final File file = new File(newPath);
		final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{FILE_EXT}, true);
		for (final File f : jsonFiles) 
		{
			final String path = FilenameUtils.separatorsToUnix(f.getParent());
			final String statisticsItemsAsJson = FileIO.readFromFile(f.getPath());
			final StatisticsItem[] statisticsItems = new Gson().fromJson(statisticsItemsAsJson, StatisticsItem[].class);
			path2statisticsItems.put(path, statisticsItems);
		}
	}
	
	public static void remove(final String path)
	{
		//--- called when an existing faculty, major, course is deleted ---//
		//--- remove all paths containing deleted faculty, major and course ---//
		//--- also called form update(), see above ---//
		for (final String key : path2statisticsItems.keySet())
		{
			if (key.contains(path)) path2statisticsItems.remove(key);
		}
	}
	
	public static void removeOne(final String path)
	{
		//--- called when a new result is submitted ---//
		path2statisticsItems.remove(path);
	}
}
