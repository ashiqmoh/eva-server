package framework;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.filefilter.DirectoryFileFilter;

import com.google.gson.Gson;

//--- manages semester through adding, removing, changing and querying semesters ---//
public class SemesterManager
{
	private static final int SEMESTER_LENGTH = 7; // "20XX-SS" or "20XX-WS" .length()
	private static final String CUR_SEM_FILE = "currentSemester";
	private static final String CUR_SEM_PATH = CodeManager.getSectionDir() + "/" + CUR_SEM_FILE + ".txt";
	
	private static String currentSemester = null;
	private static ConcurrentMap<String, String> name2path = new ConcurrentHashMap<String, String>();
	
	public static void init()
	{
		//--- clear cache ---//
		currentSemester = null;
		name2path.clear();
		//--- lists all semester directories under ./Home/Codes ---//
		final File file = new File(CodeManager.getSectionDir());
		for (final File f : file.listFiles())
		{
			if (f.isDirectory())
			{
				//--- get directory name and folder, and cache it to HashMap ---//
				final String name = f.getName();
				final String path = FilenameUtils.separatorsToUnix(f.getPath());
				name2path.put(name, path);
			}
		}
		//--- reads currentSemester.txt, cache currentSemester to memory ---//
		final File cSemesterFile = new File(CUR_SEM_PATH);
		if (cSemesterFile.exists()) currentSemester = FileIO.readFromFile(CUR_SEM_PATH);
	}
	
	public static int getSemesterLength()
	{
		return SEMESTER_LENGTH;
	}
	
	public static String getCurrentSemester()
	{
		return currentSemester;
	}
	
	public static boolean hasFrameworkAccess(final String path)
	{
		if (path.equals(CodeManager.getSectionDir())) return true;
		return false;
	}
	
	public static boolean isDuplicate(final String newSemester, final String oldSemester)
	{
		//--- returns true if the new semester already exists in the database ---//
		final Set<String> semesters = name2path.keySet();
		if (semesters.contains(newSemester) && !newSemester.equals(oldSemester)) return true;
		return false;
	}
	
	public static String get()
	{
		//--- returns semesters listing sorted ---//
		final Map<String, String> sortedName2path = new TreeMap<String, String>(name2path);
		//--- appends the currentSemester to HashMap at the last position, to be used as indicator at client side ---//
		sortedName2path.put("currentSemester", currentSemester);
		return new Gson().toJson(sortedName2path);
	}
	
	public static String addUpdateDelete(final String op, final String name, final String ssws, final String year, final String isCurrentSemester)
	{
		//--- called from routes/RoutesAdminSemesters ---//
		//--- adding, updating and removing a semester will involves directories in the section ---//
		//--- './Home/Codes' , './Home/Fragebogen', '.Home/Statistik' , './Home/Ergebnisse' ---//
		boolean success = true;
		final String oldDirName = name;
		final String newDirName = year + "-" + ssws;
		final String[] paths = {CodeManager.getSectionDir(), QuestionnaireManager.getSectionDir(), Results.getSectionDir(), Statistics.getSectionDir()};
		for (final String path : paths)
		{
			final String oldSemesterPath = path + "/" + oldDirName;
			final String newSemesterPath = path + "/" + newDirName;
			final File oldSemesterDir = new File(oldSemesterPath);
			final File newSemesterDir = new File(newSemesterPath);
			try
			{
				if (op.equals("new"))
				{
					newSemesterDir.mkdirs();
					if (!path.equals(QuestionnaireManager.getSectionDir()))
					{
						final File adminDir = new File(Hierarchies.getSectionDir());
						//--- copies all faculties, majors, courses sub folders into new semester directories ---//
						FileUtils.copyDirectory(adminDir, newSemesterDir, DirectoryFileFilter.DIRECTORY);
					}
					if (path.equals(CodeManager.getSectionDir()))
					{
						//--- updates HashMap ---//
						name2path.put(newDirName, newSemesterPath);
					}
				}
				else if (op.equals("update"))
				{
					oldSemesterDir.renameTo(newSemesterDir);
					//--- updates HashMap ---//
					if (path.equals(CodeManager.getSectionDir()))
					{
						name2path.remove(oldDirName);
						name2path.put(newDirName, newSemesterPath);
					}
				}
				else if (op.equals("delete"))
				{
					//--- only delete semester folders under ./Home/Codes ---//
					//--- cannot delete semester folders under ./Home/Ergebnisse , ./Home/Fragebogen and ./Home/Statistik ---//
					if (path.equals(CodeManager.getSectionDir()))
					{
						final String[] deleteNames = new Gson().fromJson(name, String[].class);
						for (final String deleteName : deleteNames)
						{
							File deleteDir = new File(path + "/" + deleteName);
							FileUtils.deleteDirectory(deleteDir);
							name2path.remove(deleteName);
						}
					}
				}
			}
			catch (IOException e)
			{
				success = false;
				e.printStackTrace();
				return "{\"op\":" + success + "}";
			}
		}
		if (op.equals("new"))
		{
			//--- add new questionnaire ---//
			QuestionnaireManager.addUpdateQuestionnaire("add", newDirName, null);
		}
		if (op.equals("update"))
		{
			//--- update existing questionnaire ---//
			QuestionnaireManager.addUpdateQuestionnaire("update", newDirName, oldDirName);
			
			//--- update statistics hash map ---//
			final String newPath = Statistics.getSectionDir() + "/" + newDirName;
			final String oldPath = Statistics.getSectionDir() + "/" + oldDirName;
			Statistics.update(newPath, oldPath);
		}
		//--- sets current semester and (re-)writes currentSemester.json ---//
		if (currentSemester == null || isCurrentSemester.equals("true"))
		{
			currentSemester = newDirName;
			FileIO.writeToFile(CUR_SEM_PATH, newDirName);
		}
		//--- updates cached directory listing in HashMap ---//
		Directories.update(CodeManager.getSectionDir());
		Directories.update(Results.getSectionDir());
		Directories.update(Statistics.getSectionDir());
		return "{\"op\":" + success + "}";
	}
}
