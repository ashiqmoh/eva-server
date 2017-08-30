package framework;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import objects.Codes;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

//--- CodeManager manages codes through adding, removing, changing, querying codes. ---//
//--- manages client side code validation ---//
public class CodeManager
{
	//--- CodeManager has access to the file directory ./Home/Codes ---//
	//--- adding, updating, removing, querying and validating the code(s) will be managed here ---//
	
	private static final String SECTION_NAME = "Codes";
	private static final String SECTION_DIR = Directories.getHomeDir() + "/" + SECTION_NAME;
	private static final String FILE_EXT = "json";
	private static final ConcurrentMap<String, String> code2path = new ConcurrentHashMap<String, String>();
	
	public static void init()
	{
		//--- clear hash map code2path during initialization and system re-cache ---//
		code2path.clear();
		//--- cache all codes to HashMap by reading all JSON files under directory ./Home/Codes ---//
		final File file = new File(SECTION_DIR);
		if (!file.exists()) file.mkdirs();
		else
		{
			final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{FILE_EXT}, true);
			for (final File f : jsonFiles) 
			{
				final String name = FilenameUtils.removeExtension(f.getName());
				final String path = FilenameUtils.separatorsToUnix(f.getParent());
				code2path.put(name, path);
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
	
	public static String getPath(final String code)
	{
		//--- returns path mapped to the given code from cached HashMap ---//
		return code2path.get(code);
	}
	
	public static boolean isValid(final String code)
	{
		//--- returns true if cached map contains @param code as key ---//
		boolean isValid = false;
		if (code != null) isValid = code2path.containsKey(code);
		return isValid;
	}
	
	public static void create(final String path, final String username, final int numberOfCodes)
	{
		//--- generate random codes for the given path ---//
		//--- this function runs recursively until there is no sub directories for the given path ---//
		//--- random codes will be only generated if the path level is equals to course level which is 7 ---//
		final File file = new File(path);
		boolean hasSubDir = false;
		for (final File f : file.listFiles())
		{
			final String fPath = FilenameUtils.separatorsToUnix(f.getPath());
			if (f.isDirectory() && AccessManager.hasAccess(username, fPath))
			{
				hasSubDir = true;
				//--- recursive call to this function again ---//
				create(fPath, username, numberOfCodes);
			}
		}
		//--- if @param path has no sub directories ---//
		if (!hasSubDir)
		{
			final int numLevels = path.split("/").length;
			if (numLevels == 7) // level 7 is a "course" since path: "./data/../ ../
			{
				//--- generate random codes ---//
				for (int i = 0; i < numberOfCodes; i++)
				{
					String code = null;
					boolean isDuplicate = true;
					while (isDuplicate)
					{
						//--- checks for code duplication ---//
						code = RandomCode.next();
						if (!code2path.containsKey(code)) isDuplicate = false;
					}
					final File emptyfile = new File(path + "/" + code + "." + FILE_EXT);					
					try
					{
						//--- add the random generated code to file system ---//
						//--- it is an empty file with file name == random code ---//
						emptyfile.createNewFile();
						code2path.put(code, path);
					}
					catch (IOException e) { e.printStackTrace(); }
				}
			}
		}
	}
	
	public static void getCodes(final String path, final String username, final List<Codes> list)
	{
		//--- get all the sub-directories the given @param path ---//
		//--- this method runs recursively until the path doesn't have any sub-directories ---//
		//--- if the path doesn't have sub-directories and the path level equals to course level, 7 ---//
		//--- codes will be read from the file system ---//
		final File file = new File(path);
		boolean hasSubDir = false;
		for (final File f : file.listFiles())
		{
			final String fPath = FilenameUtils.separatorsToUnix(f.getPath());
			//--- checks whether File f is a directory && @param usename has access to this directory ---//
			if (f.isDirectory() && AccessManager.hasAccess(username, fPath))
			{
				hasSubDir = true;
				getCodes(fPath, username, list);
			}
		}
		//--- level 7 is a "course" since path: "./home/:section/:semester/:faculty/:major/:course" ---//
		final String[] dirs = path.split("/");
		final String relPath = dirs[dirs.length-3] + "/" + dirs[dirs.length-2] + "/" + dirs[dirs.length-1];
		final int numLevels = dirs.length;
		if (!hasSubDir && numLevels == 7)
		{
			final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{FILE_EXT}, true);
			final List<String> namelist = new ArrayList<String>();
			for (final File f : jsonFiles) 
			{
				final String codename = FilenameUtils.removeExtension(f.getName()); 
				namelist.add(codename);
			}
			final String lecturer = Hierarchies.getLecturer(relPath);
			final Codes code = new Codes(path, lecturer, namelist);
			list.add(code);
		}
	}
	
	public static String toJson(final List<Codes> codesList)
	{
		//--- convert List<Codes> to JSON string ---//
		final Type convertType = new TypeToken<List<Codes>>(){}.getType();
		return new Gson().toJson(codesList, convertType);
	}
	
	public static boolean remove(final String code) 
	{
		//--- remove single code from file system and HashMap upon client submission ---//
		boolean isRemoved = false;
		final String path = code2path.get(code);
		final File file = new File(path + "/" + code + "." + FILE_EXT);
		if (file.exists()) isRemoved = file.delete();
		if (isRemoved) code2path.remove(code);
		return isRemoved;
	}
	
	public static void update(final File file)
	{
		//--- called from hierachies.createOrUpdate() ---//
		//--- hierarchy item onUpdate (directory rename), get .json files under the path ---//
		//--- change cached path for all codes in HashMap code2path ---//
		final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{FILE_EXT}, true);
		for (final File f : jsonFiles) 
		{
			final String name = FilenameUtils.removeExtension(f.getName());
			final String path = FilenameUtils.separatorsToUnix(f.getParent());
			code2path.replace(name, path);
		}
	}
	
	public static void delete(final File file)
	{
		//--- remove codes form cached map and system file when hierarchy item is removed ---//
		//--- called form Hierarchies.delete ---//
		final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{FILE_EXT}, true);
		for (final File f : jsonFiles) 
		{
			final String name = FilenameUtils.removeExtension(f.getName());
			code2path.remove(name);
		}
	}

}
