package framework;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;

//--- manages evaluation results through storing, removing, changing and querying ---//
public class Results
{
	private static final String SECTION_NAME = "Ergebnisse";
	private static final String SECTION_DIR = Directories.getHomeDir() + "/" + SECTION_NAME;
	private static final String FILE_EXT = "json";

	private static ConcurrentMap<String, String> parentPath2pathsAsJson = new ConcurrentHashMap<String, String>();
	private static ConcurrentMap<String, String> path2result = new ConcurrentHashMap<String, String>();

	public static void init()
	{
		parentPath2pathsAsJson.clear();
		path2result.clear();
		final File file = new File(SECTION_DIR);
		if (!file.exists()) file.mkdirs();
		else
		{
			//--- gets all .json files under path ./Home/Ergebnisse ---//
			final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{FILE_EXT}, true);
			for (final File f: jsonFiles)
			{
				//--- for each .json file, read the contents ---//
				//--- and cache it to HashMap ---//
				try
				{
					final String filePath = FilenameUtils.separatorsToUnix(f.getPath());
					final String content = FileIO.readFromFile(f.getPath());
					path2result.put(filePath, content);
				}
				catch (Exception e) { e.printStackTrace(); }
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

	public static boolean hasFrameworkAccess(final String op, final String path)
	{
		final int pathLevel = path.split("/").length;
		//--- can access this framework only with path containing string './Home/Ergebnisse' ---//
		if (!path.contains(SECTION_DIR)) return false;
		//--- without proper operation string, no access ---//
		if (!op.equals("list") && !op.equals("get")) return false;
		//--- listing the result only at level 7 -> level course ---//
		if (op.equals("list") && pathLevel != 7) return false;
		//--- getting the result (viewing) only at level 8 -> json files ---//
		if (op.equals("get") && pathLevel != 8) return false;
		return true;
	}

	/**
	 * <p>Get paths of JSON files under the given parent path.
	 * The array of paths will be returned as JSON string</p>
	 * <p>If the parent path is not cached, it will be listed and cached.</p>
	 * <p>This function will be called from routes.RoutesAdminResults.setup()</p>
	 * @param parentPath
	 * @return array of paths as JSON string
	 */
	public static String list(final String parentPath)
	{
		if (!parentPath2pathsAsJson.containsKey(parentPath))
		{
			final File parentDir = new File(parentPath);
			final Collection<File> jsonFiles = FileUtils.listFiles(parentDir, new String[]{FILE_EXT}, false);
			final List<String> paths = new ArrayList<String>();
			for (final File jsonFile: jsonFiles)
			{
				final String jsonFilePath = FilenameUtils.separatorsToUnix(jsonFile.getPath());
				paths.add(jsonFilePath);
			}
			final String pathsAsJson = new Gson().toJson(paths);
			parentPath2pathsAsJson.put(parentPath, pathsAsJson);
		}
		return parentPath2pathsAsJson.get(parentPath);
	}

	public static String get(final String path)
	{
		final int pathLevel = path.split("/").length;
		if (pathLevel != 8 || !path.contains(".json")) return "404";
		if (!path2result.containsKey(path))
		{
			final File jsonFile = new File(path);
			if (!jsonFile.exists()) return "404";
			final String result = FileIO.readFromFile(path);
			path2result.put(path, result);
		}
		return path2result.get(path);
	}

	/**
	 * <p>Stores the result for the given code in database.
	 * The path to store the result will be derived from code's path.</p>
	 *
	 * <p>If storing is successful, the result will be cached in HashMap path2result,
	 * the cached parent path will be removed from HashMap parentPath2paths, and
	 * the code will be removed from database.</p>
	 *
	 * <p>This function is called from routes.RoutesClient.setup()</p>
	 *
	 * @param code
	 * @param result
	 * @return JSON String whether storing is successful or not
	 */
	public static String store(final String code, final String result)
	{
		final String parentPath = CodeManager.getPath(code).replace(CodeManager.getSectionName(), SECTION_NAME);;
		final File parentDir = new File(parentPath);
		if (!parentDir.exists()) return "{\"store\":\"false\"}";
		final String resultFilePath = parentPath + "/" + code + "." + FILE_EXT;
		final boolean isStored = FileIO.writeToFile(resultFilePath, result);
		if (isStored)
		{
    		path2result.put(resultFilePath, result);
    		parentPath2pathsAsJson.remove(parentPath);
    		Statistics.removeOne(parentPath.replace(SECTION_NAME, Statistics.getSectionName()));
    		CodeManager.remove(code);
		}
		//--- set questionnaire not changeable ---//
		final String semester = parentPath.split("/")[3];
		QuestionnaireManager.setQuestionnaireNotChangeable(semester);
		return "{\"isStored\":" + isStored + "}";
	}
}
