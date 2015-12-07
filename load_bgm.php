<?php

const OSZ_URL = "http://bloodcat.com/osu/s/";

function getMultimedia($id){
	if(is_file($id . ".meta")){
		return file_get_contents($id . ".meta");
	}else{
		if(!is_file($id  . ".osz")){
			$res = fopen(OSZ_URL.$id, "r");
			file_put_contents($id.".osz", $res);
			fclose($res);
		}
		$zip = new ZipArchive();
		$zip->open($id . ".osz");
		$osu = null;
		for($i = 0; $i < $zip->numFiles; $i++){
			if(getExtension($zip->getNameIndex($i)) === "osu"){
				$osu = $zip->getFromIndex($i);
				break;
			}
		}
		if($osu === null) return "INVALID OSZ!";

		$meta = getMeta($osu);

		if($meta[0] === null) return "INVALID OSZ!";

		$extractedFileName = $id . "." . getExtension($meta[0]);
		$imageFileName = null;

		$zip->renameName($meta[0], $extractedFileName);
		$zip->extractTo("./", $extractedFileName);

		if($meta[1] !== null){
			$imageFileName = $id . "." . getExtension($meta[1]);
			$zip->renameName($meta[1], $id);
			$zip->extractTo("./", $imageFileName);
		}

		$zip->close();

		$data = [
			"audio" => $extractedFileName
		];
		
		if($imageFileName !== null) $data["image"] = $imageFileName;
		$data = json_encode($data);

		file_put_contents($id . ".meta", $data);

		return $data;
	}
}

function getMeta($osu){
	$audioFilename = null;
	$currentContext = "";
	$img = null;
	foreach(explode(getLineSeparator($osu), $osu) as $line){
		if(preg_match("/\\[\\s*?<context>\\s*\\].*/i", $line, $matches)){
			$currentContext = $matches['context'];
		}

		if(preg_match("/AudioFilename[ ]*:[ ]*.*/i", $line)){
			$audioFilename = preg_replace("/AudioFilename[ ]*:[ ]*/i", "" , $line);
		}

		if(strtolower($currentContext) === 'event' && preg_match("/0\\s*,\\s*0\\s*,\\s*[\\\"?\\\']?<img>[\\\"?\\\']/", $line, $imgMatch)){
			$img = $imgMatch["img"];
		}
	}

	return [$audioFilename, $img];
}

function getLineSeparator($str){
	$containsLF = (strpos($str, "\n") !== false);
	$containsCR = (strpos($str, "\r") !== false);

	if($containsLF && $containsCR){
		return "\r\n";
	}elseif($containsLF){
		return "\n";
	}elseif($containsCR){
		return "\r";
	}else{
		return "";
	}
}

function getExtension($fileName){
	$a = explode(".", $fileName);
	return $a[count($a) - 1];
}

if(!isset($_GET["id"])){
	die("Please input beatmap ID!");
}

if(!is_numeric($_GET["id"])){
	die("Wrong beatmap ID!");
}

echo getMultimedia($_GET["id"]);
