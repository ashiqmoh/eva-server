package objects;

import java.util.List;

import com.google.gson.annotations.Expose;

@SuppressWarnings("unused")
public class Questionnaire
{
	private String semester;
	@Expose private boolean isChangeable;
	@Expose private List<Category> categories;
	
	public Questionnaire(final String semester, boolean isChangeable, List<Category> categories)
	{
		this.semester = semester;
		this.isChangeable = isChangeable;
		this.categories = categories;
	}
	
	public boolean isChangeable()
	{
		return isChangeable;
	}
	
	public void setChangeable(boolean isChangeable) {
		this.isChangeable = isChangeable;
	}

	public void setSemester(String semester)
	{
		this.semester = semester;
	}
	
	public List<Category> getCategories()
	{
		return categories;
	}
	
}
