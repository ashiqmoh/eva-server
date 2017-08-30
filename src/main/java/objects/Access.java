package objects;

import com.google.gson.annotations.Expose;

public class Access {
	
	public enum Role { ADMINISTRATOR, ORGANIZER, DEAN, DEAN_OF_STUDIES, LECTURER };
	
	@Expose private String username;
	@Expose private Role role;
	@Expose private String relPath;
	
	public Access(String username, Role role, String relPath) {
		this.username = username;
		this.role = role;
		this.relPath = relPath;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}
	
	public String getRelPath() {
		return relPath;
	}
	
}
