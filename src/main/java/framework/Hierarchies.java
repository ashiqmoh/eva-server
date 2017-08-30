package framework;

import java.io.File;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import objects.Access;
import objects.Access.Role;
import objects.HierarchyItem;
import objects.User;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

//--- manages hierarchy item through adding, removing, changing and querying ---//
//--- hierarchy item refers to faculty, major, course ---//
public class Hierarchies
{
	private static final String SECTION_NAME = "Administration";
	private static final String SECTION_DIR = Directories.getHomeDir() + "/" + SECTION_NAME;
	private static final String FILE_EXT = "json";
	private static final String INFO_FILENAME = "info";

	private static ConcurrentMap<String, List<HierarchyItem>> path2hierarchyItems = new ConcurrentHashMap<String, List<HierarchyItem>>();
	private static ConcurrentMap<String, String> relativePath2lecturer = new ConcurrentHashMap<String, String>();

	public static void init()
	{
		//--- called from main/EvaServer.java and routes/RoutesAdminRecache.java ---//
		//--- clears HashMaps ---//
		path2hierarchyItems.clear();
		relativePath2lecturer.clear();
		final File file = new File(SECTION_DIR);
		//--- created ./Home/Administration folder if it doesn't exist ---//
		if (!file.exists()) file.mkdirs();
	}

	public static String getSectionName()
	{
		return SECTION_NAME;
	}

	public static String getSectionDir()
	{
		return SECTION_DIR;
	}

	public static String getInfoFileName()
	{
		return INFO_FILENAME;
	}

	public static boolean hasFrameworkAccess(final String path)
	{
		//--- called from routes/RoutesAdminHierarchies ---//
		//--- accessing this framework only with path containing string '.Home/Administration' ---//
		if (path.contains(SECTION_DIR)) return true;
		return false;
	}

	public static void list(final String path)
	{
		//--- lists all the hierarchy items under the given @param path ---//
		final ArrayList<HierarchyItem> hierarchyItems = new ArrayList<HierarchyItem>();
		final File dir = new File(path);
		//--- list all files under the given path ---//
		for (File f : dir.listFiles())
		{
			if (f.isDirectory())
			{
				//--- reads contents of info.json file under the sub directory ---//
				final File infoFile = new File(f.getPath() + "/" + INFO_FILENAME + "." + FILE_EXT);
				final String content = FileIO.readFromFile(infoFile.getPath());
				//--- converts JSON string to Java Object HierarchyItem ---//
				final HierarchyItem hi = new Gson().fromJson(content, HierarchyItem.class);
				//--- adds the HierarchyItem to ArrayList ---//
				hierarchyItems.add(hi);
			}
		}
		//--- adds path and ArrayList containing hierarchy items to the HashMap ---//
		path2hierarchyItems.put(path, hierarchyItems);
	}

	public static boolean isDuplicate(final String path, final String oldFolderName, final String name, final String shortname)
	{
		//--- called when adding or updating a hierarchy item ---//
		//--- returns true if hierarchy item with same name (directory name) exists under the given path ---//
		final String newFolderName = name + " - " + shortname;
		//--- if HashMap doesn't have @param path as key, list it first ---//
		if (!path2hierarchyItems.containsKey(path)) list(path);
		//--- for all hierarchy items under the given path ---//
		for (final HierarchyItem hi : path2hierarchyItems.get(path))
		{
			//--- compares the directory name with the new or updated hierarchy item ---//
			final String dbFolderName = hi.getName() + " - " + hi.getShortname();
			if (newFolderName.equals(dbFolderName) && !oldFolderName.equals(dbFolderName)) return true;
		}
  		return false;
	}

	public static String get(final String username, final String path)
	{
		//--- get all hierarchy items for the given @param path from HashMap ---//
		//--- if HashMap doesn't have @param path as key, it will ---//
		//--- lists all sub-directories for the given @param path ---//
		//--- read info.json in the sub-directories ---//
		//--- convert them to HierarchyItem object ---//
		//--- add them to ArrayList ---//
		//--- lastly put ArrayList of hierarchy items into to HashMap ---//
		if (!path2hierarchyItems.containsKey(path)) list(path);
		//--- get all hierarchy items for the given path from cached HashMap ---//
		final List<HierarchyItem> allHierarchyItems = path2hierarchyItems.get(path);
		if (allHierarchyItems.size() == 0) return "[]";

		//--- filter according to user's accesses ---//
		final List<HierarchyItem> filteredHierarchyItems = new ArrayList<HierarchyItem>();
		for (HierarchyItem hierarchyItem : allHierarchyItems)
		{
			String itemPath = path + "/" + hierarchyItem.getName() + " - " + hierarchyItem.getShortname();
			if (AccessManager.hasAccess(username, itemPath)) filteredHierarchyItems.add(hierarchyItem);
		}

		final Type listOfHierarchyItem = new TypeToken<List<HierarchyItem>>(){}.getType();
		return new Gson().toJson(filteredHierarchyItems, listOfHierarchyItem);
	}

	public static String getLecturer(final String relativePath)
	{
		//--- called from framework/CodeManager.java > getCodes ---//
		//--- lecturer name required to display it on the PaperCode ---//
		//--- returns lecturer name for the given relative path ---//
		//--- relative path starts with :faculty/:major/:course ---//
		//--- the HashMap contains only one set of lecturers name for the current semester ---//
		if (!relativePath2lecturer.containsKey(relativePath))
		{
			//--- reads info.json file to extract the lecturer name ---//
			final String absPath = SECTION_DIR + "/" + relativePath;
			final String infoFilePath = absPath + "/" + INFO_FILENAME + "." + FILE_EXT;
			final File infoFile = new File(infoFilePath);
			if (!infoFile.exists()) return "Error";
			final String content = FileIO.readFromFile(infoFilePath);
			final Gson gson = new Gson();
			final HierarchyItem hi = gson.fromJson(content, HierarchyItem.class);
			final Access[] accesses = hi.getAccess();
			//--- for all accesses, checks which access has Role == LECTURER ---//
			for (final Access access : accesses)
			{
				if (access.getRole() == Role.LECTURER)
				{
					//--- gets the first and last name using the username ---//
					final String username = access.getUsername();
					final User user = UserManager.getUser(username);
					final String lecturer = user.getLastname() + ", " + user.getFirstname();
					//--- adds to HashMap ---//
					relativePath2lecturer.put(relativePath, lecturer);
				}
			}
		}
		return relativePath2lecturer.get(relativePath);
	}

	public static String createOrUpdate(final String op, final String path, final String oldFolderName,
			final String name, final String shortname, final String semester, final String accessAsJson)
	{
		//--- called from routes/RoutesAdminHiearchies ---//
		//--- called when adding or updating a hierarchy item ---//
		//--- path = ./Home/:section/:faculty/:major ---//
		boolean success = false;

		boolean storeLecturer = false;
		String lecturer = null;

		//--- extracts parent relative path ---//
		//--- if path = ./Home/:section/:faculty/:major/:course -> parentRelPath = :faculty/:major/ ---//
		//--- if path = ./Home/:section/:faculty/:major -> parentRelPath = :faculty/ ---//
		final int adminDirLength = SECTION_DIR.length() + 1;
		String parentRelPath = "";
		if (path.length() > adminDirLength) parentRelPath = path.substring(adminDirLength) + "/";

		final String newFolderName = name + " - " + shortname;

		final String oldRelPath = parentRelPath + oldFolderName;
		final String newRelPath = parentRelPath + newFolderName;

		final String oldAdminPath = SECTION_DIR + "/" + oldRelPath;
		final String newAdminPath = SECTION_DIR + "/" + newRelPath;

		final String oldInfoFilePath = oldAdminPath + "/" + INFO_FILENAME + "." + FILE_EXT;
		final String newInfoFilePath = newAdminPath + "/" + INFO_FILENAME + "." + FILE_EXT;

		final File oldAdminDir = new File(oldAdminPath);
		final File newAdminDir = new File(newAdminPath);

		final File oldInfoFile = new File(oldInfoFilePath);
		final File newInfoFile = new File(newInfoFilePath);

		//--- converts accsesAsJson to HashMap <role, username> ---//
		final Gson gson = new Gson();
		final Type classType = new TypeToken<HashMap<String, String>>(){}.getType();
		final HashMap<String, String> role2username = gson.fromJson(accessAsJson, classType);

		//--- if update, remove access right for the hierarchy item first ---//
		if (op.equals("update")) AccessManager.manage(oldInfoFile, AccessManager.getOpRemove());

		final Access[] accesses = new Access[role2username.size()];
		int i = 0;
		for (final String key : role2username.keySet())
		{
			final String username = role2username.get(key);
			final User user = UserManager.getUser(username);
			final Role role = Role.valueOf(key);
			//--- creates new Access object and append it to accesses array
			accesses[i] = new Access(username, role, null);
			//--- if Role == lecturer, has to store the name in hashMap relPath2lecturer ---//
			if (role == Role.LECTURER)
			{
				storeLecturer = true;
				lecturer = user.getLastname() + ", " + user.getFirstname();
			}
			i++;
		}

		//--- creates HierarchyItem object from parameters ---//
		final HierarchyItem hi = new HierarchyItem(name, shortname, semester, accesses);
		//--- converts HierarchyItem to JSON string ---//
		final String content = new Gson().toJson(hi);

		//--- creates or updates new HierarchyItem directory under path './Home/Codes', '.Home/Ergebnisse' and './Home/Statistik ---//
		final String[] sectionPaths = {CodeManager.getSectionDir(), Results.getSectionDir(), Statistics.getSectionDir()};
		for (final String sectionPath : sectionPaths)
		{
			final File extDir = new File(sectionPath);
			for (final File f : extDir.listFiles())
			{
				if (f.isDirectory())
				{
					//--- gets the absolute path ---//
					final String oldAbsPath = FilenameUtils.separatorsToUnix(f.getPath()) + "/" + oldRelPath;
					final String newAbsPath = FilenameUtils.separatorsToUnix(f.getPath()) + "/" + newRelPath;
					final File oldDir = new File(oldAbsPath);
					final File newDir = new File(newAbsPath);
					if (op.equals("update"))
					{
						//--- rename the folder ---//
						oldDir.renameTo(newDir);
						if (sectionPath == Statistics.getSectionDir())
						{
							//--- updates the path name in HashMap ---//
							Statistics.update(newAbsPath, oldAbsPath);
						}
						if (sectionPath == CodeManager.getSectionDir())
						{
							//--- updates the path name in HashMap ---//
							CodeManager.update(newDir);
						}
					}
					else if (op.equals("new"))
					{
						//--- creates a new folder ---//
						newDir.mkdirs();
					}
					//--- updates cached direcoty listing in HashMap ---//
					Directories.update(FilenameUtils.separatorsToUnix(newDir.getParent()));
					Directories.update(FilenameUtils.separatorsToUnix(newDir.getParentFile().getParent()));
				}
			}
		}
		//--- stores lecturer name in HashMap relativePath2lecturer ---//
		if (storeLecturer)
		{
			//--- will be executed only if a course is added or modified ---//
			//--- skips for major and faculty ---//
			if (op.equals("update")) relativePath2lecturer.remove(oldRelPath); // update
			relativePath2lecturer.put(newRelPath, lecturer);
		}
		if (op.equals("update"))
		{
			//--- rename hierarchy item folder name under section './Home/Administration' ---//
			oldAdminDir.renameTo(newAdminDir);
		}
		else if (op.equals("new"))
		{
			//--- creates hierarchy item folder under section './Home/Administration ---//
			newAdminDir.mkdirs();
		}
		//--- updates HashMap ---//
		path2hierarchyItems.remove(path);
		//--- writes new hierarchy item as JSON to file system ---//
		success = FileIO.writeToFile(newInfoFile.getPath(), content);
		//--- adds access right to the added or updated hierarchy item, @see AccessManager framework ---//
		AccessManager.manage(newInfoFile, AccessManager.getOpStore());
		return "{\"op\":" + success + "}";
	}

	public static String delete(final String pathsAsJson)
	{
		//--- called from routes/RoutesAdminHierarchy ---//
		//--- called when deleting a hierarchy item ---//
		boolean success = true;
		//--- extracts paths (Array) to be deleted form JSON String pathsAsJson ---//
		final String[] pathsAsArray = new Gson().fromJson(pathsAsJson, String[].class);
		try
		{
			for (final String path : pathsAsArray)
			{
				//--- extracts relative path :faculty/:major/:course from ---//
				//--- absolute path './Home/Adminstration/:faculty/:major/:course ---//
				final String relativePath = path.substring(SECTION_DIR.length() + 1);
				final File adminDir = new File(path);

				//--- gets all the info.json files under the path ---//
				final Collection<File> jsonFiles = FileUtils.listFiles(adminDir, new String[]{Directories.getFileExt()}, true);
				//--- remove the access @see AccessManager ---//
				for (final File infoFile : jsonFiles) AccessManager.manage(infoFile, AccessManager.getOpRemove());

				//--- removes the hierarchy item folder in section './Home/Codes' , './Home/Ergebnisse' ---//
				//--- and './Home/Statistik'. And also updates the respective HashMaps ---//
				final String[] sectionPaths = {CodeManager.getSectionDir(), Results.getSectionDir(), Statistics.getSectionDir()};
				for (final String sectionPath : sectionPaths)
				{
					final File extDir = new File(sectionPath);
					//--- lists all semester directories under the section path ---//
					for (File f : extDir.listFiles())
					{
						//--- skips if it is not a directory ---//
						if (!f.isDirectory()) continue;
						//--- gets the absolute path ---//
						final String deletePath = FilenameUtils.separatorsToUnix(f.getPath()) + "/" + relativePath;
						final File deleteDir = new File(deletePath);
						//--- if sectionPath == ./Home/Codes, removes codes from memory (HashMap) ---//
						if (sectionPath.equals(CodeManager.getSectionDir()))
						{
							CodeManager.delete(deleteDir);
						}
						//--- if sectionPath == ./Home/Statistik, removes statistics from memory (HashMap) ---//
						if (sectionPath.equals(Statistics.getSectionDir()))
						{
							Statistics.remove(deletePath);
						}
						//--- removes directories recursively ---//
						FileUtils.deleteDirectory(deleteDir);
						//--- removes directory listing from memory (HashMap) ---//
						Directories.update(FilenameUtils.separatorsToUnix(deleteDir.getParent()));
						Directories.update(FilenameUtils.separatorsToUnix(deleteDir.getParentFile().getParent()));
					}
				}
				//--- remove directory under Administration section ---//
				FileUtils.deleteDirectory(adminDir);
				//--- updates the HashMaps by removing the path ---//
				relativePath2lecturer.remove(relativePath);
				path2hierarchyItems.remove(FilenameUtils.separatorsToUnix(adminDir.getParent()));
			}
		}
		catch (Exception e)
		{
			success = false;
			e.printStackTrace();
		}
		return "{\"op\":" + success + "}";
	}

	public static void updateUser(final String relPath, final String oldUsername, final String newUsername)
	{
		//--- when an user is updated ---//
		//--- info.json which he/she has access to, will be rewrite ---//
		//--- and the corresponding cached item in the map will be removed ---//
		//--- so that the next time the get method is called, it will be read from info.json and re-cached ---//
		//--- gets the info.json files ---//
		final String path = SECTION_DIR + "/" + relPath;
		final String parentPath = FilenameUtils.separatorsToUnix(new File(path).getParent());
		final String infoFile = path + "/" + INFO_FILENAME + "." + FILE_EXT;
		//--- reads the contents of info.json file ---//
		final String hierarchyItemAsJson = FileIO.readFromFile(infoFile);
		//--- converts JSON string to Java objetc HierarchyItem ---//
		final HierarchyItem hi = new Gson().fromJson(hierarchyItemAsJson, HierarchyItem.class);
		//--- gets Accesses ---//
		final Access[] accesses = hi.getAccess();
		for (int i = 0; i < accesses.length; i++)
		{
			//--- updates the access with new username ---//
			if (accesses[i].getUsername().equals(oldUsername))
			{
				accesses[i].setUsername(newUsername);
			}
		}
		hi.setAccess(accesses);
		final String content = new Gson().toJson(hi);
		final boolean success = FileIO.writeToFile(infoFile, content);
		if (success)
		{
			//--- updates the HashMap by removing the path ---//
			//--- so it will be read and listed again fresh ---//
			if (path2hierarchyItems.containsKey(path)) path2hierarchyItems.remove(path);
			if (path2hierarchyItems.containsKey(parentPath)) path2hierarchyItems.remove(parentPath);
			if (relativePath2lecturer.containsKey(relPath)) relativePath2lecturer.remove(relPath);
		}
	}
}
