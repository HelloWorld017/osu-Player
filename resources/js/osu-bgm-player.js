const INFO_URL = "http://bloodcat.com/osu/";

var queue = [];
var pointer = 0;

var audio;

function init(){
	audio = document.createElement("audio");

	audio.addEventListener("ended", function(){
		nextTrack();
	});

	resize();
}

function prevTrack(){
	if(!audio.paused){
		stop();
	}

	if(queue.length <= 0) return;

	if(--pointer < 0){
		pointer = 0;
	}

	audio.src = queue[pointer].music;
	audio.play();
}

function nextTrack(){
	if(!audio.paused){
		stop();
	}

	if(queue.length <= 0) return;

	if(++pointer >= queue.length){
		pointer = queue.length - 1;
		return;
	}

	audio.src = queue[pointer].music;
	audio.play();
	notifyPlay();
}

function play(){
	if(pointer >= queue.length) return;
	if(!audio.paused){
		pause();
	}else{
		audio.src = queue[pointer].music;
		audio.play();
		notifyPlay();
	}
}

function notifyPlay(){
	document.getElementById("playpause").innerHTML = "Pause";
	for(var queueId in queue){
		if(!queue.hasOwnProperty(queueId)) continue;
		if(queueId === pointer){
			queue[queueId].li.childNodes[0].style.color = "#FFFFFF";
		}else{
			queue[queueId].li.childNodes[0].color = "#FF0080";
		}
	}
}

function notifyStop(){
	$('#playpause').innerHTML = "Play";
}

function stop(){
	if(!audio.paused){
		audio.currentTime = 0;
		pause();
	}else{
		play();
	}
}

function pause(){
	audio.pause();
	notifyStop();
}

function search(){
	$.ajax({
		url: INFO_URL,
		type: "get",
		data: $("form").serialize(),
		success: function(data){
			var searchList = document.getElementById("searchlist");

			while(searchList.firstChild){
				searchList.removeChild(searchList.firstChild);
			}

			var jsonArray = JSON.parse(data);

			if(jsonArray === null || data === "[]"){
				var list = document.createElement("li");
				list.innerHTML = "Couldn't retrieve the data.<br>There are no beatmaps you've entered or the server is working abnormally.";
				searchList.appendChild(list);
				return false;
			}

			for(var dataNum in jsonArray){
				if(!jsonArray.hasOwnProperty(dataNum)) continue;

				var a = document.createElement("a");

				var id = jsonArray[dataNum]["id"].replace("'", "\\'");
				var title = jsonArray[dataNum]["title"].replace("'", "\\'");
				var artist = jsonArray[dataNum]["artist"].replace("'", "\\'");

				a.innerHTML = jsonArray[dataNum]["artist"] + " - " + jsonArray[dataNum]["title"];
				a.href = "javascript:addToPlaylist('" + id + "', '" + title + "', '" + artist + "')";

				var li = document.createElement("li");
				li.appendChild(a);

				searchList.appendChild(li);
			}
		}
	});
}

function addToPlaylist(id, title, artist){
	for(var queueId in queue){
		if(!queue.hasOwnProperty(queueId)) continue;
		if(queue[queueId].id === id){
			return;
		}
	}

	$.ajax({
		url: "load_bgm.php?id=" + id,
		success: function(data){
			var jsonData = JSON.parse(data);

			var a = document.createElement("a");
			a.innerHTML = artist + " - " + title;
			a.href = "javascript:removeFromPlaylist('" + id + "')";

			var li = document.createElement("li");
			li.appendChild(a);

			var playlist = document.getElementById("playlist");
			playlist.appendChild(li);

			queue.push({
				id: id,
				music: jsonData[0],
				image: jsonData[1],
				title: title,
				artist: artist,
				li: li
			});
		}
	});
}

function removeFromPlaylist(id){
	var playlist = document.getElementById("playlist");
	for(var queueId in queue){
		if(!queue.hasOwnProperty(queueId)) continue;
		if(queue[queueId].id === id){
			playlist.removeChild(queue[queueId].li);
			queue.splice(queueId, 1);
			break;
		}
	}
}

function resize(){
	$('#playlist, #section-right').css("height", window.innerHeight - 45 + "px");
}
