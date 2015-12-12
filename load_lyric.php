<?php
	if(!isset($_GET["id"])){
		die("Please input beatmap ID!");
	}

	if(!is_numeric($_GET["id"])){
		die("Wrong beatmap ID!");
	}

	$id = $_GET["id"];
	$audio = json_decode(file_get_contents("musics/" . $id . ".meta"), true)["audio"];

	if(is_file("musics/" . $audio . ".jlrc")){
		echo file_get_contents("musics/" . $audio . ".jlrc");
		return;
	}

	exec('java -jar lyric-lib.jar ' . escapeshellcmd($audio));

	echo file_get_contents("musics/" . $audio . ".jlrc");
?>
