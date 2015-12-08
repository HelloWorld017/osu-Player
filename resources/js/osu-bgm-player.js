const INFO_URL = "http://bloodcat.com/osu/";
const IMG_URL = "//b.ppy.sh/thumb/{0}l.jpg"

var queue = [];
var pointer = 0;
var contents = $('#contents');
var playlist = $('#playlist');
var playpause = $('#playpause');
var isPaused = true;
var audio;
var searchTemplate =
	$(document.createElement('div'))
		.addClass('album-cell')
		.append($(document.createElement('img')).addClass('album-cover').append(
			$(document.createElement('div')).addClass('album-cover-hover').append(
				$(document.createElement('span')).addClass('fa fa-play-circle-o')
			)
		))
		.append($(document.createElement('h1')).addClass('album-title'))
		.append($(document.createElement('h2')).addClass('album-author'));

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

function notifyPlay(){
	playpause.children('span').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
	playlist.removeClass('playing');
	playlist.children('li[data-id=' + queue[pointer].id + ']').addClass('playing');
	isPaused = false;
}

function notifyStop(){
	playpause.children('span').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
	isPaused = true;
}

function search(){
	$.ajax({
		url: INFO_URL,
		type: "get",
		data: $("form").serialize(),
		success: function(data){
			contents.empty();
			var jsonArray = JSON.parse(data);

			if(jsonArray === null || data === "[]"){
				error("Couldn't retrieve the data.<br>There are no beatmaps you've entered or the server is working abnormally.");
				return false;
			}

			jsonArray.forEach(function(v){
				addToSearchlist(v.id, v.title, v.artist);
			});
		}
	});
}

function addToSearchlist(id, title, artist){
	var resultView = $.extend(true, {}, searchTemplate);
	var img = resultView.children('.album-cover');
	img.src = IMG_URL.replace("{0}", id);
	img.data('meta', {
		id: id,
		title: title,
		author: artist
	});
	img.click(function(){
		var meta = $(this).data('meta');
		addToPlaylist(meta.id, meta.title, meta.artist);
	});

	resultView.children('.album-title')[0].innerHTML = title;
	resultView.children('.album-author')[0].innerHTML = artist;

	contents.append(resultView);
}

function error(text){
	alert(text);
}

function is404(url){
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return (http.status === 404);
}

function addToPlaylistFromTemplate(data){

}

function addToPlaylist(id, title, artist){
	var alreadyAdded = false;

	queue.forEach(function(v){
		if(v.id === id) alreadyAdded = true;
	});

	if(alreadyAdded) return;

	$.ajax({
		url: "load_bgm.php?id=" + id,
		success: function(data){
			var jsonData = JSON.parse(data);

			var data = {
				id: id,
				music: jsonData['audio'],
				image: null,
				title: title,
				artist: artist
				//audio: null
			};

			if(jsonData.hasOwnProperty('image')) data.image = jsonData.image;

			if(is404(data.music)){
				error("Couldn't get music file from osz.");
				return;
			}

			if(is404(data.image)) data.image = null;

			addToPlaylistFromTemplate(data);
			queue.push(data);
		},

		error: function(){
			error("Couldn't get music file from osz.");
		}
	});
}

function removeFromPlaylist(id){
	queue.filter(function(v){
		return v.id !== id;
	});

	playlist.children('li[data-id=' + "id"']').remove();
}

function resize(){
	$('#playlist, #section-right').css("height", window.innerHeight - 45 + "px");
}
