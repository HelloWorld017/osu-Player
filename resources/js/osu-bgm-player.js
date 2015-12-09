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
var isPaused = true;
var audio;
var preloadAudio;
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
	nopic = getFlag("nopic");

	progress = $('#music-progress').slider({
		formatter: function(value) {
			var sec = value % 60;
			return Math.floor(value / 60) + ":" + ((sec.toString().length >= 2) ? sec : '0' + sec);
		}
	});

	audio = $(document.createElement("audio"))
		.on('ended', function(){
			nextTrack();
		}).on('timeupdate', function(){
			progress.slider('setValue', Math.round(audio.currentTime));
		}).on('canplaythrough', function(){
			progress.slider('setAttribute', 'max', Math.round(audio.duration))
		})[0];

	progress.on('slide', function(){
		audio.currentTime = progress.slider('getValue');
	});
});

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
        if(end == -1)end = cookieData.length;
        flagValue = cookieData.substring(start, end);
    }
    return (flagValue === "yes");
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
	playlist.children('li').filter(function(v){
		return $(v).data('id') === queue[pointer].id;
	}).addClass('playing');

	currentTitle[0].innerHTML = queue[pointer].title;
	currentArtist[0].innerHTML = queue[pointer].artist;
	isPaused = false;
}

function notifyStop(){
	playpause.children('span').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
	isPaused = true;
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
				music: jsonData['audio'],
				image: null,
				title: title,
				artist: artist
			};

			if(jsonData.hasOwnProperty('image') && jsonData.image !== null) data.image = jsonData.image;

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
