package objects;

@SuppressWarnings("unused")
public class ClientEva {
	
	private String path;
	private String lecturer;
	private Questionnaire questionnaire;
	
	public ClientEva(String path, String lecturer, Questionnaire questionnaire) {
		this.path = path;
		this.lecturer = lecturer;
		this.questionnaire = questionnaire;
	}
}
