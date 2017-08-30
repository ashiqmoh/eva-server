package objects;

import java.util.List;

@SuppressWarnings("unused")
public class Codes
{
	private String path;
	private String displayName; // TODO: replace with a username or userobject?
	private List<String> codeList;
	
	public Codes(String path, String name, List<String> codeList)
	{
		this.path = path;
		this.displayName = name;
		this.codeList = codeList;
	}	
}
