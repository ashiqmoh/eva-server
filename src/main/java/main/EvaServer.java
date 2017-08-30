package main;

import routes.RoutesAdminAuthentication;
import routes.RoutesAdminCodes;
import routes.RoutesAdminDirectories;
import routes.RoutesAdminHierarchies;
import routes.RoutesAdminQuestions;
import routes.RoutesAdminRecache;
import routes.RoutesAdminResults;
import routes.RoutesAdminSemesters;
import routes.RoutesAdminStatistics;
import routes.RoutesAdminUsers;
import routes.RoutesClient;
import framework.AccessManager;
import framework.CodeManager;
import framework.Directories;
import framework.Hierarchies;
import framework.QuestionnaireManager;
import framework.Results;
import framework.SemesterManager;
import framework.SendEmail;
import framework.Statistics;
import framework.UserManager;

public class EvaServer
{
   	public static void main(String[] args)
	{
   		//--- port and additional basePath can be set from arguments ---//
   		int port = -1;
   		String basePath = "";
   		for(int i=0; i<args.length; ++i)
   		{
   			if (args[i].equals("--port")) port = Integer.parseInt(args[i+1]);
   			if (args[i].equals("--base")) basePath = args[i+1];
   		}
   		//--- set spark server ---//
		SparkServer.setup(port, basePath);
		setupFrameworks();
		setupRoutes();
	}

   	private static void setupFrameworks()
   	{
   		//--- frameworks must be initialized in the given order ---//
   		//--- Directories, Hierarchies, UserManager, AccessManager, CodeManager, ---//
   		//--- SemesterManager, ResultManager, StatisticsManager ---//
   		Directories.init();
   		Hierarchies.init();
   		UserManager.init();
   		AccessManager.init();
   		CodeManager.init();
		SemesterManager.init();
		QuestionnaireManager.init();
		Results.init();
		Statistics.init();
		SendEmail.init();
   	}

	private static void setupRoutes()
	{
		//--- initialize all routes ---//
		RoutesClient.setup();
		RoutesAdminAuthentication.setup();
      	RoutesAdminCodes.setup();
      	RoutesAdminDirectories.setup();
      	RoutesAdminHierarchies.setup();
      	RoutesAdminQuestions.setup();
      	RoutesAdminRecache.setup();
      	RoutesAdminResults.setup();
      	RoutesAdminSemesters.setup();
      	RoutesAdminStatistics.setup();
      	RoutesAdminUsers.setup();
   	}
}
