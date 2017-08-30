package main;
import static spark.Spark.*;

import java.util.*;
import java.net.*;

public class SparkServer
{
	private static String basePath = "";

	@SuppressWarnings("deprecation")
	public static void setup(int port, final String basepath)
	{
		basePath = basepath;
		if (port == -1) port = 4567;
		String localIP = "none";
		try
		{
			localIP = findLocalIP();
			System.out.println("Running on: "+localIP+":"+port+"/eva with basepath: "+basepath);
		}
		catch (Exception ex) { System.out.println(ex.getMessage()); }

		//--- spark ---//
		setPort(port); // Spark will run on port 4567
		externalStaticFileLocation("./html"); // Static files
	}
	private static String findLocalIP() throws SocketException
	{
		// System.out.println("== Finding Local IP ...");
		String ip = "none";
		Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
		while (interfaces.hasMoreElements())
		{
		    NetworkInterface current = interfaces.nextElement();
		    // System.out.println("iface-"+current);
		    if (!current.isUp() || current.isLoopback() || current.isVirtual()) continue;
		    Enumeration<InetAddress> addresses = current.getInetAddresses();
		    while (addresses.hasMoreElements())
			{
		        InetAddress current_addr = addresses.nextElement();
		        if (current_addr.isLoopbackAddress()) continue;
				if (current_addr instanceof Inet4Address)
				{
  					// System.out.println("IPv4: "+current_addr.getHostAddress());
					ip = current_addr.getHostAddress();
				}
				else if (current_addr instanceof Inet6Address)
				{
  					// System.out.println("IPv6: "+current_addr.getHostAddress());
				}
		    }
		}
		return ip;
	}
	public static String getBasePath()
	{
		return basePath;
	}
}
