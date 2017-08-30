package framework;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

//--- FileIO has function to read and write to/from file system ---//
//--- linked with LockManager for concurrency ---//
public class FileIO
{
	public static boolean writeToFile(final String path, final String content)
	{
		boolean success = true;
		final Path f = Paths.get(path);
		final Charset charset = Charset.forName("UTF-8");
		Writer writer = null;

		//--- synchronized block to write file to a given path, for concurrency and ---//
		//--- avoid multiple threads accessing, reading and writing a same file at the same time ---//
		synchronized(Locks.get(path))
		{
			try
			{
				writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(path), "utf-8"));
				writer.write(content, 0, content.length());
			}
			catch (IOException x)
			{
				success = false;
				System.err.format("IOException: %s%n", x);
			}
			finally
			{
			 try { writer.close(); }
			 catch (Exception e) { }
		  }
		}
		return success;
	}
	public static String readFromFile(final String path)
	{
		String result = null;
		final Path f = Paths.get(path);
		final Charset charset = Charset.forName("UTF-8");
		//--- synchronized block to read file from a given path, for concurrency and ---//
		//--- avoid multiple threads accessing, reading and writing a same file at the same time ---//
		synchronized(Locks.get(path))
		{
			try
			{
				byte[] encoded = Files.readAllBytes(f);
	  		result =  new String(encoded, charset);
			}
			catch (IOException x)
			{
				result = "{\"error\": \"reading file\"}";
				System.err.format("IOException: %s%n", x);
			}
		}
		return result;
	}
}
