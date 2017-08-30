package objects;

import com.google.gson.annotations.Expose;

public class Question
{
	@Expose private String type;
	//--- paragraphDE refers to question. used to avoid confusion with class name ---//
	@Expose private String paragraphDE;
	@Expose private String paragraphEN;
	@Expose private String[] labelDE;
	@Expose private String[] labelEN;	
	
	public Question(final String type, final String paragraphDE, final String paragraphEN, 
			final String[] labelDE, final String[] labelEN)
	{
		this.type = type;
		this.paragraphDE = paragraphDE;
		this.paragraphEN = paragraphEN;
		this.labelDE = labelDE;
		this.labelEN = labelEN;
	}
	
	public String getType()
	{
		return type;
	}
	
	public String getParagraphDE()
	{
		return paragraphDE;
	}
}
