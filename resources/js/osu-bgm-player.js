//const INFO_URL = "http://bloodcat.com/osu/";
const INFO_URL = "/search_bgm.php"
const IMG_URL = "//b.ppy.sh/thumb/{0}l.jpg"

var queue = [];
var pointer = 0;
var contents = null;
var playlist = null;
var playpause = null;
var currentTitle = null;
var currentArtist = null;
var progress = null;
var toggleRepeatElement = null;
var toggleRandomElement = null;
var audio;
var preloadAudio = {
	audio: null,
	id: null
};
var random = false;
var repeat = false;
var nopic = true;

var searchTemplate =
	$(document.createElement('div'))
		.addClass('album-cell')
		.append($(document.createElement('div')).addClass('album-cover').append(
			$(document.createElement('div')).addClass('album-cover-hover').append(
				$(document.createElement('span')).addClass('fa fa-play-circle-o play-hover')
			)
		))
		.append($(document.createElement('h1')).addClass('album-title'))
		.append($(document.createElement('h2')).addClass('album-author'));

var playlistTemplate =
	$(document.createElement('li'))
		.attr('type', 'button').addClass('list-group-item')
		.append($(document.createElement('span')).addClass('fa fa-music bgm-music'))
		.append($(document.createElement('p')).addClass('playlist-text'));


$(document).ready(function(){
	contents = $('#contents');
	playlist = $('#playlist');
	playpause = $('#playpause');
	currentTitle = $('#current-title');
	currentArtist = $('#current-artist');
	toggleRepeatElement = $('#toggle-repeat');
	toggleRandomElement = $('#toggle-random');
	repeat = getFlag('repeat');
	random = getFlag('random');
	nopic = getFlag('nopic');

	progress = $('#music-progress').slider({
		formatter: function(value) {
			if(!audio) return getTimeStamp(value);
			return getTimeStamp(value) + " - " + getTimeStamp(Math.round(audio.duration));
		}
	});

	audio = attachListenerToAudio(document.createElement('audio'));

	progress.on('slide', function(){
		audio.currentTime = progress.slider('getValue');
	});
});

function getTimeStamp(time){
	var sec = time % 60;
	return Math.floor(time / 60) + ":" + ((sec.toString().length >= 2) ? sec : '0' + sec);
}

function setFlag(flagName, flagValue){
    var cookieValue = "no";
    if(flagValue) cookieValue = "yes";
    document.cookie = flagName + "=" + cookieValue + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

function getFlag(flagName) {
    flagName += "=";
    var cookieData = document.cookie;
    var start = cookieData.indexOf(flagName);
    var flagValue = '';
    if(start != -1){
        start += flagName.length;
        var end = cookieData.indexOf(';', start);
        if(end == -1) end = cookieData.length;
        flagValue = cookieData.substring(start, end);
    }
    return (flagValue === "yes");
}

function toggleRandom(){
	random = !random;
	setFlag('random', random);
	if(random){
		toggleRandomElement.addClass('active');
	}else{
		toggleRandomElement.removeClass('active');
	}
}

function toggleRepeat(){
	repeat = !repeat;
	setFlag('repeat', repeat);
	if(repeat){
		toggleRepeatElement.addClass('active');
	}else{
		toggleRepeatElement.removeClass('active');
	}
}

function prevTrack(){
	if(!audio.paused) stop();

	if(queue.length <= 0) return;

	var prevPointer = getPrevTrack();

	if(prevPointer === null) return;
	loadTrack(prevPointer);
}

function nextTrack(){
	if(!audio.paused) stop();

	if(queue.length <= 0) return;

	var nextPointer = getNextTrack();

	if(nextPointer === null) return;
	loadTrack(nextPointer);
}

function getNextTrack(){
	if(random)return getRandomTrack();

	var nextPointer = pointer + 1;
	if(nextPointer >= queue.length){
		return (repeat ? 0 : null);
	}

	return nextPointer;
}

function getPrevTrack(){
	if(random) return getRandomTrack();

	var prevPointer = pointer - 1;
	if(prevPointer < 0){
		return (repeat ? 0 : null);
	}

	return prevPointer;
}

function getRandomTrack(){
	if(queue.length <= 1){
		return (repeat ? pointer : null);
	}

	while(true){
		var newPointer = Math.floor(Math.random() * queue.length);
		if(newPointer !== pointer){
			return newPointer;
		}
	}
}

function loadTrack(newPointer){
	pointer = newPointer;

	if(preloadAudio.id !== queue[pointer].id){
		audio.src = queue[pointer].music;
	}else{
		audio = attachListenerToAudio(preloadAudio.audio);
		preloadAudio = {};
		console.log("Getting audio from preloaded audio.");
	}
	play();
}

function play(){
	if(pointer >= queue.length) return;

	if(!audio.src){
		loadTrack(pointer);
		return;
	}

	if(!audio.paused){
		pause();
		return;
	}

	audio.play();
	notifyPlay();
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

function attachListenerToAudio(audioElement){
	console.log("Attaching event listener to audio.");
	return $(audioElement)
		.on('ended', function(){
			nextTrack();
		}).on('timeupdate', function(){
			progress.slider('setValue', Math.round(audio.currentTime));
			if(audio.currentTime > audio.duration - 15){
				if(!random && getNextTrack() && preloadAudio.id !== queue[getNextTrack()].id){
					//Preload in random is disabled currently.
					var nextTrack = queue[getNextTrack()];

					preloadAudio.id = nextTrack.id;
					preloadAudio.audio = document.createElement('audio');
					preloadAudio.audio.src = nextTrack.music;

					console.log("Started to preload audio : " + preloadAudio.id);
				}
			}
		}).on('canplay', function(){
			console.log("Adjusting Slider.");
			progress.slider('setAttribute', 'max', Math.round(audio.duration))
		})[0];
}

function notifyPlay(){
	playpause.children('span').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
	playlist.removeClass('playing');
	playlist.children('li').filter(function(v){
		return $(v).data('id') === queue[pointer].id;
	}).addClass('playing');

	currentTitle[0].innerHTML = queue[pointer].title;
	currentArtist[0].innerHTML = queue[pointer].artist;
}

function notifyStop(){
	playpause.children('span').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
}

function search(){
	$.ajax({
		url: INFO_URL,
		type: "GET",
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
	var resultView = searchTemplate.clone();

	var src = "http://placehold.it/160x120";
	if(!nopic) src = IMG_URL.replace("{0}", id);

	resultView.children('.album-cover').data('meta', {
		id: id,
		title: title,
		artist: artist
	}).on('click', function(){
		var meta = $(this).data('meta');
		addToPlaylist(meta.id, meta.title, meta.artist);
	}).css('background', 'url("' + src + '")');

	resultView.children('.album-title')[0].innerHTML = title;
	resultView.children('.album-author')[0].innerHTML = artist;

	contents.append(resultView);
}

function error(text){
	alert(text);
}

function is404(url, callback){
	$.ajax({
		url: url,
		type: "GET",
		success: function(){
			callback(false);
		},

		error: function(){
			callback(true);
		}
	})
}

function addToPlaylistPlaceholder(id){
	var listView = playlistTemplate.clone();

	listView.children('.playlist-text')[0].innerHTML =
		'<span class="list-title">Adding your selected music. Plz wait for a sec!</span>';
	listView.data('id', id);

	playlist.append(listView);

	return listView;
}

function addToPlaylistFromTemplate(listView, data){
	listView.children('.playlist-text')[0].innerHTML =
		'<span class="list-title">' +
		 	data.title +
		'</span>' +
		'<br>' +
		'<span class="list-author">' +
			data.artist +
		'</span>';
}

function addToPlaylist(id, title, artist){
	var alreadyAdded = false;

	queue.forEach(function(v){
		if(v.id === id) alreadyAdded = true;
	});

	if(alreadyAdded) return;

	var view = addToPlaylistPlaceholder();

	$.ajax({
		url: "load_bgm.php?id=" + id,
		success: function(data){
			var jsonData = JSON.parse(data);

			var data = {
				id: id,
				music: 'musics/' + jsonData['audio'],
				image: null,
				title: title,
				artist: artist
			};

			if(jsonData.hasOwnProperty('image') && jsonData.image !== null) data.image = 'musics/' + jsonData.image;

			is404(data.music, function(musicErr){
				if(musicErr){
					view.remove();
					error("Couldn't get music file from osz.");
					return;
				}

				if(data.image !== null){
					is404(data.image, function(imageErr){
						if(imageErr){
							data.image = null;
						}

						addToPlaylistFromTemplate(view, data);
						queue.push(data);
					});
				}else{
					addToPlaylistFromTemplate(view, data);
					queue.push(data);
				}
			});
		},

		error: function(){
			view.remove();
			error("Couldn't get music file from osz.");
		}
	});
}

function removeFromPlaylist(id){
	queue.filter(function(v){
		return v.id !== id;
	});

	playlist.children('li').filter(function(v){
		return $(v).data('id') === id;
	}).remove();
}
