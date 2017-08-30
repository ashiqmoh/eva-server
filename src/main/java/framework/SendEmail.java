package framework;

import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import objects.User;

//--- sends automated email through Gmail server ---//
public class SendEmail extends Thread
{
	private User user;
	private Op op;
	
	public SendEmail(final User user, final Op op)
	{
		this.user = user;
		this.op = op;
	}
	
	private enum Op { add, update, pwdChange, forgotPassword }
	
	private static Properties properties;
	private static Session session;
	private static MimeMessage msg;
	
	public static void init()
	{
		//--- sets gmail server properties ---//
		properties = System.getProperties();
		properties.put("mail.smtp.port", "587");
		properties.put("mail.smtp.auth", "true");
		properties.put("mail.smtp.starttls.enable", "true");
		session = Session.getDefaultInstance(properties, null);
	}
	
	//--- enum declared private, can only be accessed through these functions ---//
	public static Op getOpAdd() { return Op.add; }
	public static Op getOpUpdate() { return Op.update; }
	public static Op getOpPwdChange() { return Op.pwdChange; }
	public static Op getOpForgotPassword() { return Op.forgotPassword; }
	
	//--- this class extends Thread ---//
	@Override
	public void run()
	{
		try
		{
			//--- creates new email session ---//
			msg = new MimeMessage(session);
			//--- adds recipient email addess ---//
			msg.addRecipient(Message.RecipientType.TO, new InternetAddress(user.getEmail()));
			
			//--- email contents ---//
			final StringBuilder sb = new StringBuilder();
			//--- greetings ---//
			sb.append("Hello ");
			sb.append(user.getFirstname());
			sb.append(" ");
			sb.append(user.getLastname());
			sb.append(",<br/><br/>");
			
			if (op.equals(Op.add))
			{
				//--- email header ---//
				msg.setSubject("Welcome to lecture evaluation!");
				
				sb.append("You have been added to the lecture evaluation.");
				sb.append(" Your account information:<br/><br/>");
				
				sb.append("Firstname: ");
				sb.append(user.getFirstname());
				
				sb.append("<br/>Lastname: ");
				sb.append(user.getLastname());
				
				sb.append("<br/>Username: ");
				sb.append(user.getUsername());
				
				sb.append("<br/>Password: ");
				sb.append(user.getPassword());
				
				sb.append("<br/>Email: ");
				sb.append(user.getEmail());
			}
			else if (op.equals(Op.update))
			{
				//--- email header ---//
				msg.setSubject("Account updated");
				
				sb.append("Your account has been updated.<br/><br/>");
				
				sb.append("Firstname: ");
				sb.append(user.getFirstname());
				
				sb.append("<br/>Lastname: ");
				sb.append(user.getLastname());
				
				sb.append("<br/>Username: ");
				sb.append(user.getUsername());
				
				sb.append("<br/>Email: ");
				sb.append(user.getEmail());
			}
			else if (op.equals(Op.pwdChange))
			{
				//--- email header ---//
				msg.setSubject("Password changed");
				sb.append("Your account password has been changed recently. If you didn't change it, please contact system administrator.");
			}
			else if (op.equals(Op.forgotPassword))
			{
				//--- email header ---//
				msg.setSubject("Forgot password");
				sb.append("You have forgotten your password to access Evaluation. This is your password: <b>");
				sb.append(user.getPassword());
				sb.append("</b>.");
			}
			
			sb.append("<br/><br/>Thank you.<br/><br/>Evaluation - Hochschule Furtwangen University");
			msg.setContent(sb.toString(), "text/html");
			
			//--- sends email ---//
			Transport transport = session.getTransport("smtp");
			transport.connect("smtp.gmail.com", "eva.furtwangen@gmail.com", "xRxr258aeKt");
			transport.sendMessage(msg, msg.getAllRecipients());
			transport.close();
		}
		catch (AddressException e)
		{
			e.printStackTrace();
		}
		catch (MessagingException e)
		{
			e.printStackTrace();
		}
	}

}
