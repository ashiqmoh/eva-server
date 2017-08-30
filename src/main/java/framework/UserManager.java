package framework;

import java.io.File;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import objects.User;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

//--- manages user database through adding, removing, changing and querying ---//
//--- contains function for username-password validation while logging in, changing password by user ---//
//--- and request password if user has forgotten their password ---//
public class UserManager
{
	private static final String SECTION_NAME = "Benutzer";
	private static final String SECTION_DIR = Directories.getHomeDir() + "/" + SECTION_NAME;

	private static ConcurrentMap<String, User> username2user = new ConcurrentHashMap<String, User>();

	public static void init()
	{
		//--- clear cache ---//
		username2user.clear();

		//--- make directory ./Home/Benutzer if doesn't exist ---//
		final File file = new File(SECTION_DIR);
		if (!file.exists()) file.mkdirs();

		//--- creates admin.json file if doesn't exist ---//
		final String adminJsonPath = SECTION_DIR + "/" + "admin." + Directories.getFileExt();
		final File adminJsonFile = new File(adminJsonPath);
		if (!adminJsonFile.exists())
		{
			User user = new User("admin", "Eva", "Admin", "eva.admin@example.com", "admin");
			String userAsJson = new Gson().toJson(user);
			FileIO.writeToFile(adminJsonPath, userAsJson);
		}

		//--- reads all [username].json files and cache them to HashMap ---//
		final Collection<File> jsonFiles = FileUtils.listFiles(file, new String[]{Directories.getFileExt()}, false);
		for (final File f : jsonFiles)
		{
			final String username = FilenameUtils.removeExtension(f.getName());
			final String content = FileIO.readFromFile(f.getPath());
			final User user = new Gson().fromJson(content, User.class);
			username2user.put(username, user);
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

	public static boolean isAuthorized(final String username, final String password)
	{
		//--- username password authentication ---//
		boolean isAuthorized = true;
		String databasePassword = null;
		User user = null;
		if (username2user.containsKey(username)) user = username2user.get(username);
		if (user != null) databasePassword = user.getPassword();
		if (!(password != null && password.equals(databasePassword))) isAuthorized = false;
		return isAuthorized;
	}

	public static boolean hasFrameworkAccess(final String path)
	{
		//--- can accsess this framework only if the path contains './Home/Benutzer' string ---//
		if (path.equals(SECTION_DIR)) return true;
		return false;
	}

	public static User getUser(final String username)
	{
		//--- returns User object for the given @param username ---//
		return username2user.get(username);
	}

	public static boolean isDuplicate(final String newUsername, final String oldUsername)
	{
		//--- checks username duplication ---//
		final Set<String> usernames = username2user.keySet();
		if (usernames.contains(newUsername) && !newUsername.equals(oldUsername)) return true;
		return false;
	}

	public static String getUsers(final String path)
	{
		//--- returns all usernames2users sorted as JSON string ---//
		final Map<String, User> sortedUsers = new TreeMap<String, User>(username2user);
		//--- excludes password field in the JSON string ---//
		final Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		return gson.toJson(sortedUsers);
	}

	public static String create(final String username, final String firstname, final String lastname, final String email)
	{
		//--- called from routes/RoutesAdminUsers.java to create new user ---//
		boolean isCreated = false;
		//--- assigns new user with a random 8-chars long password ---//
		final String password = RandomCode.next();
		final User user = new User(username, firstname, lastname, email, password);
		//--- converts to JSON string and writes to file system ---//
		final String content = new Gson().toJson(user, User.class);
		final String path = SECTION_DIR + "/" + username + "." + Directories.getFileExt();
		isCreated = FileIO.writeToFile(path, content);
		if (isCreated)
		{
			//--- caches HashMap ---//
			username2user.put(username, user);
			//--- sends automated email containing login information ---//
			SendEmail send = new SendEmail(user, SendEmail.getOpAdd());
			send.start();
		}
		return "{\"op\":" + isCreated + "}";
	}

	public static String update(final String oldUsername, final String newUsername, final String firstname,
			final String lastname, final String email)
	{
		//--- called from routes/RoutesAdminUsers.java when a user is updated ---//
		boolean isUpdated = false;
		//--- fetch the user password from cached HashMap ---//
		final String password = username2user.get(oldUsername).getPassword();
		//--- creates new User object with new details from parameters ---//
		final User user = new User(newUsername, firstname, lastname, email, password);
		final Gson gson = new Gson();
		//--- converts User object JSON string ---//
		final String userAsJson = gson.toJson(user, User.class);
		final String oldPath = SECTION_DIR + "/" + oldUsername + "." + Directories.getFileExt();
		final String newPath = SECTION_DIR + "/" + newUsername + "." + Directories.getFileExt();
		final File oldFile = new File(oldPath);
		final File newFile = new File(newPath);
		//--- renames [username].json file to new username ---//
		oldFile.renameTo(newFile);
		isUpdated = FileIO.writeToFile(newPath, userAsJson);
		if (isUpdated)
		{
			//--- updates info.json under section ./Home/Administration and the respective HashMap ---//
			final List<String> relPaths = AccessManager.getAccessibleRelPaths(oldUsername);
			if (relPaths.size() > 0)
			{
				for (String relPath : relPaths)
				{
					Hierarchies.updateUser(relPath, oldUsername, newUsername);
				}
			}
			//--- updates accesses from old username to new username ---//
			AccessManager.updateUsername(oldUsername, newUsername);
			//--- updates HashMap ---//
			username2user.remove(oldUsername);
			username2user.put(newUsername, user);
			//--- sends automated email telling user account has been updated ---//
			SendEmail send = new SendEmail(user, SendEmail.getOpUpdate());
			send.start();
		}
		return "{\"op\":" + isUpdated + "}";
	}

	public static String changePassword(final String username, final String newPassword, final String newPasswordRepeat)
	{
		//--- called when user change password ---//
		boolean isPasswordChanged = false;
		if (!newPassword.equals(newPasswordRepeat)) return "{\"op\":false}";
		//--- get the user by username and sets the new password ---//
		final User user = username2user.get(username);
		user.setPassword(newPassword);
		//--- updates JSON file in file system ---//
		final Gson gson = new Gson();
		final String content = gson.toJson(user, User.class);
		final String path = SECTION_DIR + "/" + username + "." + Directories.getFileExt();
		isPasswordChanged = FileIO.writeToFile(path, content);
		if (isPasswordChanged)
		{
			//--- updates HashMap ---//
			username2user.replace(username, user);
			//--- sends automated email confirming password changed ---//
			SendEmail send = new SendEmail(user, SendEmail.getOpPwdChange());
			send.start();
		}
		return "{\"op\":" + isPasswordChanged + "}";
	}

	public static String delete(final String usernamesAsJson)
	{
		//--- deletes user(s) from database ---//
		final Gson gson = new Gson();
		//--- extract usernames (array) from usernamesAsJson ---//
		final String[] usernames = gson.fromJson(usernamesAsJson, String[].class);
		for (final String username : usernames)
		{
			boolean isDeleted = false;
			final String path = SECTION_DIR + "/" + username + "." + Directories.getFileExt();
			final File file = new File(path);
			//--- deletes [username].json file ---//
			isDeleted = file.delete();
			if (isDeleted)
			{
				//--- removes accesses associated with the deleted username(s) ---//
				//--- accesses are the path the deleted user has access to ---//
				final List<String> relPaths = AccessManager.getAccessibleRelPaths(username);
				if (relPaths.size() > 0)
				{
					for (final String relPath : relPaths)
					{
						Hierarchies.updateUser(relPath, username, null);
					}
				}
				AccessManager.removeUsername(username);
				//--- removes username(s) from cached HashMap ---//
				username2user.remove(username);
			}
		}
		return "{\"op\":" + true + "}";
	}

	public static String forgotPassword(final String username)
	{
		//--- sends user password to the respective email address ---//
		boolean success = false;
		//--- checks whether the HashMap contains @param username as key ---//
		if (username2user.containsKey(username))
		{
			final User user = username2user.get(username);
			//--- sends automated email containing login information ---//
			SendEmail send = new SendEmail(user, SendEmail.getOpForgotPassword());
			send.start();
			success = true;
		}
		return "{\"success\":" + success + "}";
	}
}
