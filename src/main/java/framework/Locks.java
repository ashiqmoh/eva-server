package framework;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

//--- class to manage concurrency while reading and writing to/from file system ---//
public class Locks extends Thread
{
	private String path;
	
	// TODO:
	// * add a timestamp to each lock object in the ConcurrentHashMap
	// * add a thread which checks the timestamp of all lock objects
	// * expire all locks older than 5 minutes -> avoid that old unused locks fill up memory
	private static Object masterLock = new Object();
	private static ConcurrentMap<String, String> lockMap = new ConcurrentHashMap<String, String>();
	
	// constructor
	public Locks(String path)
	{
		this.path = path;
	}
	
	public static Object get(String path)
	{
		if (!lockMap.containsKey(path))
		{
			//--- synchronized access using masterLock in order to put new path in HashMap ---//
			synchronized(masterLock)
			{
				//--- check again ---//
				if (!lockMap.containsKey(path))
				{
					lockMap.put(path, path);
					//--- starts background thread to remove currently added path from lockMap after 5 min ---//
					final Locks lock = new Locks(path);
					lock.start();
				}
			}
		}
		return lockMap.get(path);
	}
	
	@Override
	public void run()
	{
		//--- background thread started ---//
		//--- sleep for 5 minutes ---//
		try { Thread.sleep(5*60*1000); }
		catch (InterruptedException e) { e.printStackTrace(); }
		//--- remove the path from lockMap ---//
		lockMap.remove(this.path);
	}
}
