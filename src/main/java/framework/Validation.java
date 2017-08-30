package framework;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

//--- commonly used HTML form validation ---//
public class Validation
{
	//--- mostly called from routes/*.java through before filter ---//
	
	//--- validation to check whether string is empty or not ---//
	public static boolean isEmpty(String value)
	{
		if (value == null || value.equals("") || value.length() == 0) return true;
		return false;
	}
	
	//--- checks whether the string can be converted to an integer ---//
	public static boolean isInteger(String intAsString)
	{
		try { Integer.parseInt(intAsString); return true; }
		catch (NumberFormatException e) { return false; }
	}
	
	//--- checks whether JSON string can be converted to an array of string ---//
	public static boolean isArrayOfString(String arrayAsJson)
	{
		try { new Gson().fromJson(arrayAsJson, String[].class); return true; }
		catch (JsonSyntaxException e) { return false; }
	}
}
