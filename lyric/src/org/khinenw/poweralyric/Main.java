package org.khinenw.poweralyric;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;

import org.json.simple.JSONObject;

public class Main{

	@SuppressWarnings("unchecked")
	public static void main(String[] args){
		JSONObject obj = new JSONObject();
		try{
			obj.putAll(
				LyricLib.parseLyric(
					LyricLib.getLyric(
						LyricLib.getHash(
							new File("musics/" + args[0])
						)
					)
				)
			);
			File f = new File("musics/" + args[0] + ".jlrc");
			BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(f), "UTF-8"));
			bw.write(obj.toString());
			bw.close();
		}catch(Exception e){
			e.printStackTrace();
		}
	}

}
