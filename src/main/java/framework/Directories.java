package framework;

import java.io.File;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

//--- manages directories and sub-directories querying ---//
//--- caches them to HashMap when needed ---//
public class Directories
{
	private static final String HOME_DIR = "./Home";
	private static final String FILE_EXT = "json";

	private static ConcurrentMap<String, List<String>> path2DirList = new ConcurrentHashMap<String, List<String>>();

	public static void init()
	{
		path2DirList.clear();
		File file = new File(HOME_DIR);
		//--- creates ./Home directories is it doesn't exist ---//
		if (!file.exists()) file.mkdirs();
	}

	public static String getHomeDir()
	{
		return HOME_DIR;
	}

	public static String getFileExt()
	{
		return FILE_EXT;
	}

	public static boolean isExist(final String path)
	{
		final File file = new File(path);
		return file.exists();
	}

	public static boolean hasFrameworkAccess(final String path)
	{
		//--- returns true if user has access to the given @param path ---//
		final int pathLevel = path.split("/").length;
		//--- directories level more than 6 contains only json files. there will be no any sub directories ---//
		if (pathLevel > 6) return false;
		//--- no user has access to view directories in 'Administration' and 'Benutzer' folder ---//
		if (path.contains(Hierarchies.getSectionName()) || path.contains(UserManager.getSectionName())) return false;
		return true;
	}

	public static String get(final String path, final String username)
	{
		//--- read all sub-directories from the given @param path ---//
		//--- and cached it in the map ---//
		if (!path2DirList.containsKey(path))
		{
			final File dir = new File(path);
			if (!dir.exists()) return "404";
			final List<String> dirList = new ArrayList<String>();

			for (final File subDir : dir.listFiles())
			{
				if (subDir.isDirectory())
				{
					final String subDirPath = FilenameUtils.separatorsToUnix(subDir.getPath());
					dirList.add(subDirPath);
				}
			}
			path2DirList.put(path, dirList);
		}

		//--- get the sub-directories list from cached map ---//
		final List<String> allDirList = path2DirList.get(path);
		if (allDirList.size() == 0) return "[]";

		//--- filter according to user's accesses ---//
		final List<String> filteredDirList = new ArrayList<String>();
		for (String dirList : allDirList)
		{
			if (AccessManager.hasAccess(username, dirList))	filteredDirList.add(dirList);
		}
		//--- sort the directories listing alphabetically ---//
		Collections.sort(filteredDirList);
		//--- converts directories listing to JSON string and returns the string
		final Type listOfDirectory = new TypeToken<List<String>>(){}.getType();
		return new Gson().toJson(filteredDirList, listOfDirectory);
	}

	public static void update(final String path)
	{
		//--- remove path from cached map ---//
		//--- when get is called, it will read sub-directory form file system ---//
		//--- and cached it again ---//
		path2DirList.remove(path);
	}
}
