package objects;

import com.google.gson.annotations.Expose;

public class User {
	
	@Expose private String username;
	@Expose private String firstname;
	@Expose private String lastname;
	@Expose private String email;
	//--- without @Expose annotation, password field won't be included in JSON string ---//
	private String password;
	
	public User(String username, String firstname, String lastname, String email, String password) {
		this.username = username;
		this.firstname = firstname;
		this.lastname = lastname;
		this.email = email;
		this.password = password;
	}
	
	public String getUsername() {
		return username;
	}

	public String getFirstname() {
		return firstname;
	}

	public String getLastname() {
		return lastname;
	}
	
	public String getEmail()
	{
		return email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
