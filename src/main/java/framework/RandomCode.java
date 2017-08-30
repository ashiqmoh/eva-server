package framework;

import java.util.Random;

//--- Generates random 8 characters long code for paper code ---//
public class RandomCode {
	
	private static final char[] SYMBOLS;
	private static final int LENGTH = 8;
	private static final Random RANDOM = new Random();
	
	static
	{
		//--- initialize char[] SYMBOLS with characters that is allowed ---//
		final StringBuilder tmp = new StringBuilder();
		for (char ch = '0'; ch <= '9'; ch++) { tmp.append(ch); }
		for (char ch= 'a'; ch <= 'z'; ch++) { tmp.append(ch); }
		SYMBOLS = tmp.toString().toCharArray();
	}
	
	public static String next()
	{
		//--- returns randomly generated code ---//
		final char[] code = new char[LENGTH];
		for (int i = 0; i < LENGTH; i++) { code[i] = SYMBOLS[RANDOM.nextInt(SYMBOLS.length)]; }
		return new String(code);
	}

}
