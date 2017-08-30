package framework;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import objects.Access;
import objects.Access.Role;
import objects.HierarchyItem;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;

//--- AccessManager -> manages what/which data a user can access ---// 
//--- manages user access by (1) filtering out section and path a user can access ---//
//--- (2) checking whether the user can access the requested section and path ---//
public class AccessManager
{
	private enum Op { STORE, REMOVE };
	private static final ConcurrentMap<String, List<Access>> username2accesses = new ConcurrentHashMap<String, List<Access>>();
	
	public static void init()
	{
		//--- clear username2accesses hash map during initialization and re-cache ---//
		username2accesses.clear();
		//--- adds info.json in ./Home/Administrator for the system admin ---//
		final String adminAccessPath = Hierarchies.getSectionDir() + "/" + Hierarchies.getInfoFileName() + "." + Directories.getFileExt();
		final File adminAccessFile = new File(adminAccessPath);
		if (!adminAccessFile.exists())
		{
			final Access[] accesses = new Access[1];
			accesses[0] = new Access("admin", Role.ADMINISTRATOR, null);
			final HierarchyItem hierarchyItem = new HierarchyItem(null, null, null, accesses);
			final String hierarchyItemAsJson = new Gson().toJson(hierarchyItem);
			FileIO.writeToFile(adminAccessPath, hierarchyItemAsJson);
		}
		//--- reads all JSON files recursively in ./Home/Administrator ---//
		//--- contents of JSON files will be processed to be cached in hash map username2accesses ---//
		final File file = new File(Hierarchies.getSectionDir());
		final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{Directories.getFileExt()}, true);
		for (File infoFile : jsonFiles) manage(infoFile, Op.STORE);
	}
	
	public static Op getOpStore()
	{
		return Op.STORE;
	}
	
	public static Op getOpRemove()
	{
		return Op.REMOVE;
	}
	
	public static List<Access> getAccess(final String username)
	{
		return username2accesses.get(username);
	}
	
	public static List<String> getAccessibleRelPaths(final String username)
	{
		//--- return List<String> of accessible relative path(s) by the given username ---//
		//--- accessible relative path(s) will be fetch from static hash map username2accesses ---//
		List<String> relPaths = new ArrayList<String>();
		//--- return an empty list is the given username has not been assigned with any relative paths yet ---//
		if (!username2accesses.containsKey(username)) return relPaths;
		List<Access> accesses = username2accesses.get(username);
		for (final Access access : accesses)
		{
			relPaths.add(access.getRelPath());
		}
		return relPaths;
	}
	
	public static boolean hasRole(final String username, final Role role)
	{
		//--- returns true if the given role has been assigned to the given username ---//
		if (!username2accesses.containsKey(username)) return false;
		final List<Access> accesses = username2accesses.get(username);
		for (final Access access : accesses)
		{
			if (access.getRole().equals(role)) return true;
		}
		return false;
	}
	
	public static boolean hasTeacherAccess(final String username)
	{
		//--- Teacher access refers to DEAN, DEAN_OF_STUDIES and LECTURER as user's role ---//
		//--- all three roles have same section accesses to Ergebnisse, Statistik ---//
		if (!username2accesses.containsKey(username)) return false;
		final List<Access> accesses = username2accesses.get(username);
		for (final Access access : accesses)
		{
			Role role = access.getRole();
			if (role.equals(Role.DEAN) || role.equals(Role.DEAN_OF_STUDIES) || role.equals(Role.LECTURER))
			{
				return true;
			}
		}
		return false;
	}
	
	public static boolean hasAccess(final String username, String path)
	{
		//--------------------------------------------------------------------------//
		//	level 	./home/:section/:semester/:faculty/:major/:course/:JSON-file	//
		//	level 	1/ 2  /   3    /    4    /   5    /   6  /   7   /     8    	//
		//--------------------------------------------------------------------------//
		
		//---  only for :section == Administration  ------------//
		//	level 	./home/:section/:faculty/:major/:course		//
		//	level	1/ 2  /   3    /   4    /   5  /   6		//
		//------------------------------------------------------//
		
		if (path.contains(".json"))
		{
			File jsonFile = new File(path);
			path = FilenameUtils.separatorsToUnix(jsonFile.getParent());
		}
		
		final int level = path.split("/").length;
		
		//--- no user has access to level 1 ---//
		if (level == 1) return false;
		
		//--- all users have access to level 2 ---//
		if (level == 2) return true;
		
		//--- if cached HashMap doesn't have username as key, return false ---//
		//--- because this user has not been assigned with any role yet ---//
		if (!username2accesses.containsKey(username)) return false;
		
		//--- :section access based on user role ---//
		//--- ./Home/Administrator OR ./Home/Benutzer OR ./Home/Codes OR ./Home/Fragebogen -> ADMIN, ORGANIZER ---//
		if (path.contains(CodeManager.getSectionName()) || path.contains(Hierarchies.getSectionName()) ||
				path.contains(QuestionnaireManager.getSectionName()) || path.contains(UserManager.getSectionName()))
		{
			if (!hasRole(username, Role.ORGANIZER) && !hasRole(username, Role.ADMINISTRATOR)) return false;
		}
		//--- ./Home/Statistik OR ./Home/Ergebnisse -> DEAN, DEAN_OF_STUDIES, LECTURER ---//
		if (path.contains(Statistics.getSectionName()) || path.contains(Results.getSectionName()))
		{
			if (!hasTeacherAccess(username)) return false;
			//--- LECTURER has only access to current semester ---//
			if (level > 3 && !path.contains(SemesterManager.getCurrentSemester()))
			{
				if (!hasRole(username, Role.DEAN) && !hasRole(username, Role.DEAN_OF_STUDIES))
				{
					return false;
				}
			}
		}
		
		//--- no path filter below :semester level for all sections except for ---//
		//--- ./Home/Administrator and ./Home/Ergebnisse  and ./Home/Statistik ---//
		if (!path.contains(Hierarchies.getSectionName()) && level < 5) return true;
		
		//--- no path filter below level 4 for ./Home/Administration because it doesn't have :semester ---//
		if (path.contains(Hierarchies.getSectionName()) && level < 4) return true;
		
		//--- no path filter for Role.ADMINISTRATOR ---//
		if (hasRole(username, Role.ADMINISTRATOR)) return true;
		
		//--- path access ---//
		//--- extract relative path from the absolute path (input parameter: path) ---//
		String requestedRelPath = "";
		//--- determine index for substring based on section name ---//
		//--- "./Home/Statistik" + "/" + "20XX-XS" + "/" ---//
		if (path.contains(Statistics.getSectionName()))
			requestedRelPath = path.substring(Statistics.getSectionDir().length() + 1 + SemesterManager.getSemesterLength() + 1);
		//--- "./Home/Ergebnisse" + "/" + "20XX-XS" + /" ---//
		else if (path.contains(Results.getSectionName()))
			requestedRelPath = path.substring(Results.getSectionDir().length() + 1 + SemesterManager.getSemesterLength() + 1);
		//--- "./Home/Codes" + "/" + "20XX-XS" + "/" ---//
		else if (path.contains(CodeManager.getSectionName()))
			requestedRelPath = path.substring(CodeManager.getSectionDir().length() + 1 + SemesterManager.getSemesterLength() + 1);
		//--- "./Home/Administrator" + "/" ---//
		else if (path.contains(Hierarchies.getSectionName()))
			requestedRelPath = path.substring(Hierarchies.getSectionDir().length() + 1);
		
		final int requestedRelPathLevel = requestedRelPath.split("/").length;
		
		//--- get relative paths user can access ---//
		final List<String> accessibleRelPaths = getAccessibleRelPaths(username);
		
		//--- for each accessible relative path, check whether the requested relative path matches ---//
		for (String accessibleRelPath : accessibleRelPaths)
		{
			final int accessibelRelPathLevel = accessibleRelPath.split("/").length;
			if (accessibelRelPathLevel < requestedRelPathLevel && requestedRelPath.contains(accessibleRelPath))
			{
				return true;
			}
			if (accessibelRelPathLevel > requestedRelPathLevel && accessibleRelPath.contains(requestedRelPath))
			{
				return true;			
			}
			if (accessibelRelPathLevel == requestedRelPathLevel && requestedRelPath.equals(accessibleRelPath))
			{
				return true;
			}
		}
		return false;
	}
	
	public static void manage(final File infoFile, final Op op)
	{
		//--- called during initialization and add, updating, deleting hierarchy item ---//
		//--- the access contents will be read from info.json ---//
		final String content = FileIO.readFromFile(infoFile.getPath());
		//--- convert from JSON string to java object, HierarchyItem ---//
		final HierarchyItem hi = new Gson().fromJson(content, HierarchyItem.class);
		for (final Access access : hi.getAccess())
		{
			//--- extract username, role, relative path from access(es) of HierarchyItem ---//
			final String username = access.getUsername();
			final Role role = access.getRole();
			final String parentPath = FilenameUtils.separatorsToUnix(infoFile.getParent());
			String relPath;
			if (parentPath.length() == Hierarchies.getSectionDir().length()) relPath = "";
			else relPath = parentPath.substring(Hierarchies.getSectionDir().length() + 1);
			
			//--- the extracted data will be stored to username2accesses hash map. see store ---//
			if (op.equals(Op.STORE)) store(username, role, relPath);
			//--- the extracted data will be removed from username2accesses hash map ---//
			else if (op.equals(Op.REMOVE)) remove(username, role, relPath);
		}
	}
	
	private static void store(final String username, final Role role, final String relPath)
	{
		//--- called when creating or updating HierarchyItem ---//
		//--- the relative path of the new HierarchyItem will be added to username2accesses hash map ---//
		//--- under key == username ---//
		if (username == null) return;
		List<Access> accesses = new ArrayList<Access>();
		if (username2accesses.containsKey(username))
		{
			accesses = username2accesses.get(username);
		}
		final Access access = new Access(username, role, relPath);
		accesses.add(access);
		username2accesses.put(username, accesses);
	}
	
	private static void remove(final String username, final Role role, final String relPath)
	{
		//--- called when updating or deleting HierarchyItem ---//
		//--- when a hierarchy item is deleted, the respective relative path will be removed from ---//
		//--- username2accesses hash map ---//
		if (username != null && username2accesses.containsKey(username))
		{
			final List<Access> accesses = username2accesses.get(username);
			for (int i = 0; i < accesses.size(); i++)
			{
				final String dbUsername = accesses.get(i).getUsername();
				final Role dbRole = accesses.get(i).getRole();
				final String dbRelPath = accesses.get(i).getRelPath();
				if (dbUsername.equals(username) && dbRole.equals(role) && dbRelPath.equals(relPath))
				{
					accesses.remove(i);
				}
			}
			//--- if accesses length is zero, the username (key) can be removed from the hash map ---//
			if (accesses.size() > 0) username2accesses.replace(username, accesses);
			else username2accesses.remove(username);
		}
	}
	
	public static void updateUsername(final String oldUsername, final String newUsername)
	{
		//--- called when updating an user ---//
		//--- the hash map username2accesses key (username) will be updated ---//
		if (username2accesses.containsKey(oldUsername))
		{
			final List<Access> accesses = username2accesses.get(oldUsername);
			username2accesses.remove(oldUsername);
			username2accesses.put(newUsername, accesses);
		}
	}
	
	public static void removeUsername(final String username)
	{
		//--- called when deleting a user ---//
		//--- remove key (username) from hash map username2accesses ---//
		if (username2accesses.containsKey(username)) username2accesses.remove(username);
	}

}
