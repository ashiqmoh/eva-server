package objects;

import java.util.List;

import com.google.gson.annotations.Expose;

public class Category
{
	@Expose private String headerDE; //--- acts as key ---//
	@Expose private String headerEN;
	@Expose private List<Question> questions;
	
	public Category(final String headerDE, final String headerEN, final List<Question> questions)
	{
		this.headerDE = headerDE;
		this.headerEN = headerEN;
		this.questions = questions;
	}
	
	public String getHeaderDE()
	{
		return headerDE;
	}
	
	public void setHeaderDE(String headerDE)
	{
		this.headerDE = headerDE;
	}
	
	public void setHeaderEN(String headerEN)
	{
		this.headerEN = headerEN;
	}
	
	public List<Question> getQuestions()
	{
		return questions;
	}
	
}
