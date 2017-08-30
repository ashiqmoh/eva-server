package framework;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

import objects.Access;
import objects.Access.Role;
import objects.User;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.Expose;
import com.google.gson.reflect.TypeToken;

//--- AuthenticationManager is used when an user logs in to get accessible directories, ---//
//--- the accessInfo (role and accessible paths) and the required JavaScript files ---//
public class AuthenticationManager
{
	//--- @Expose annotation is used for the special Gson conversion, see Line 49 ---//
	//--- variable without annotation will be excluded when converting from Java object to JSON string ---//
	@Expose private List<String> dirList;
	@Expose private User user;
	@Expose private List<Access> accessInfo;
	@Expose private List<String> javascripts;
	
	//--- constructor ---//
	private AuthenticationManager(final List<String> dirList, final User user, final List<Access> accessInfo, final List<String> javascripts)
	{
		this.dirList = dirList;
		this.user = user;
		this.accessInfo = accessInfo;
		this.javascripts = javascripts;
	}
	
	//--- called from RoutesAdminAuthentication ---//
	public static String get(final String username)
	{
		//--- called from RoutesAdminAuthentication ---//
		//--- returns JSON string with the accessible directories list, access info and the required JavaScript files ---//
		final String dirListAsJson = Directories.get(Directories.getHomeDir(), username);
		final Type listOfDir = new TypeToken<List<String>>(){}.getType();
		final List<String> dirList = new Gson().fromJson(dirListAsJson, listOfDir);
		
		final User user = UserManager.getUser(username);
		final List<Access> accessInfo = AccessManager.getAccess(username);
		final List<String> javascripts = getJS(username);
		
		AuthenticationManager authManager = new AuthenticationManager(dirList, user, accessInfo, javascripts);
		final Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		return gson.toJson(authManager);
	}
	
	//--- called from method get() (above) ---//
	public static List<String> getJS(String username)
	{
		//--- the required JavaScript files will be added based on the Role of the user ---//
		List<String> js = new ArrayList<String>();
		
		//--- these files required by all users regardless of their role ---//
		js.add("../js/libs/bootstrap-select.min.js");
		js.add("../js/libs/jsPDF.min.js");
		
		js.add("../js/admin/Dashboard.js");
		js.add("../js/admin/Directories.js");
		js.add("../js/admin/DirectoriesTable.js");
		js.add("../js/admin/History.js");
		js.add("../js/admin/LoginForm.js");
		js.add("../js/admin/Modal.js");
		js.add("../js/admin/Settings.js");
		js.add("../js/admin/SettingsForm.js");
		js.add("../js/admin/Validation.js");
		
		//--- only for system administrator ---//
		if (AccessManager.hasRole(username, Role.ADMINISTRATOR))
		{
			js.add("../js/admin/Test.js");
		}
		
		//--- only for system administrator and organizer ---//
		if (AccessManager.hasRole(username, Role.ADMINISTRATOR) || AccessManager.hasRole(username, Role.ORGANIZER))
		{
			js.add("../js/libs/nanobar.min.js");
			js.add("../js/libs/qrcode.min.js");
			
			js.add("../js/admin/Codes.js");
			js.add("../js/admin/CodesForm.js");
			js.add("../js/admin/CodesPdfGenerator.js");
			js.add("../js/admin/CodesPdfViewer.js");
			js.add("../js/admin/CodesTable.js");
			js.add("../js/admin/ConfirmationDialog.js");
			js.add("../js/admin/DirCodes.js");
			js.add("../js/admin/DirCodesTable.js");
			js.add("../js/admin/Hierarchies.js");
			js.add("../js/admin/HierarchiesForm.js");
			js.add("../js/admin/HierarchiesTable.js");
			js.add("../js/admin/Questionnaire.js");
			js.add("../js/admin/QuestionnaireDemo.js");
			js.add("../js/admin/QuestionnaireFormCategory.js");
			js.add("../js/admin/QuestionnaireFormQuestion.js");
			js.add("../js/admin/QuestionnaireTable.js");
			js.add("../js/admin/Semesters.js");
			js.add("../js/admin/SemestersForm.js");
			js.add("../js/admin/SemestersTable.js");
			js.add("../js/admin/Users.js");
			js.add("../js/admin/UsersForm.js");
			js.add("../js/admin/UsersTable.js");
		}
		
		//--- only for the dean, dean of studies and lecturer ---//
		if (AccessManager.hasTeacherAccess(username))
		{
			js.add("../js/admin/Images.js");
			js.add("../js/admin/Questions.js");
			js.add("../js/admin/Results.js");
			js.add("../js/admin/ResultsList.js");
			js.add("../js/admin/ResultsPdf.js");
			js.add("../js/admin/ResultsViewer.js");
			js.add("../js/admin/Statistics.js");
			js.add("../js/admin/StatisticsHelp.js");
			js.add("../js/admin/StatisticsPdf.js");
			js.add("../js/admin/StatisticsViewer.js");
		}
		
		return js;
	}
}
