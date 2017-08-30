package objects;

@SuppressWarnings("unused")
public class HierarchyItem
{
	private String name;
	private String shortname;
	private String semester;  
	private Access[] access;
	
	public HierarchyItem(String name, String shortname, String semester, Access[] access)
	{
		this.name = name;
		this.shortname = shortname;
		this.semester = semester;
		this.access = access;
	}
	
	public String getName()
	{
		return name;
	}
	
	public String getShortname()
	{
		return shortname;
	}
	
	public Access[] getAccess()
	{
		return access;
	}
	
	public void setAccess(Access[] access)
	{
		this.access = access;
	}	
}
