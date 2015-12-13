//const INFO_URL = "http://bloodcat.com/osu/";
const INFO_URL = "/search_bgm.php"
const BGM_URL = "load_bgm.php?id=";
const LYRIC_URL = "/load_lyric.php?id="
const IMG_URL = "//b.ppy.sh/thumb/{0}l.jpg"

var queue = [];
var pointer = 0;
var contents = null;
var fixedContents = null;
var lyricContents = null;
var playlist = null;
var playpause = null;
var currentTitle = null;
var currentArtist = null;
var progress = null;
var toggleRepeatElement = null;
var toggleRandomElement = null;
var toggleUndergroundElement = null;

var undergroundTop = null;
var lyric;
var previousLyricID = null;
var scrollAnimating = false;
var scrollTarget;
var audio;
var preloadAudio = {
	audio: null,
	id: null
};

var random = false;
var repeat = false;
var nopic = false;
var noani = false;
var nolrc = false;

var freeScroll = false;

var scrollTick = 500;

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

var errorTemplate =
	$(document.createElement('div'))
		.addClass('alert alert-danger hidden-top')
		.append($(document.createElement('a')).addClass('close').attr('href', '#').attr('data-dismiss', 'alert').attr('aria-label', 'close').append(
			$(document.createElement('span')).addClass('fa fa-close')
		))
		.append($(document.createElement('strong')).addClass('error-masthead'))
		.append($(document.createElement('span')).addClass('error-desc'));

$(document).ready(function(){
	contents = $('#contents');
	fixedContents = $('#fixed-contents');
	lyricContents = $('#lyric-contents');
	playlist = $('#playlist');
	playpause = $('#playpause');
	currentTitle = $('#current-title');
	currentArtist = $('#current-artist');
	toggleRepeatElement = $('#toggle-repeat');
	toggleRandomElement = $('#toggle-random');
	toggleUndergroundElement = $('#toggle-underground span');
	repeat = getFlag('repeat');
	random = getFlag('random');
	nopic = getFlag('nopic');
	noani = getFlag('noani');
	nolrc = getFlag('nolrc');

	undergroundTop = $('.bottom-bg').offset().top;

	if(noani) scrollTick = 0;
	if(!noani) toggleUndergroundElement.addClass('fa-rotate-to');
	if(!(document.body.scrollTop > 0)) toggleUndergroundElement.addClass('fa-rotate-180');

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

	lyricContents.scroll(function(){
		if(!scrollAnimating) freeScroll = true;

		if(scrollAnimating && scrollTarget === lyricContents.scrollTop()){
			scrollAnimating = false;
		}
	});
});

function Lyric(id, timing, lyric){
	this.id = id;
	this.timing = timing;
	this.lyric = lyric;
}

Lyric.prototype = {
	getTiming: function(){
		return this.timing;
	},
	getLyric: function(){
		return this.lyric;
	},
	getID: function(){
		return this.id;
	}
};

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

function toggleUnderground(){
	if(document.body.scrollTop === 0){
		$('html,body').animate({
			scrollTop: undergroundTop
		}, scrollTick);

		toggleUndergroundElement.removeClass('fa-rotate-180')
		return;
	}

	$('html,body').animate({
		scrollTop: 0
	}, scrollTick);

	toggleUndergroundElement.addClass('fa-rotate-180');
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

function loadLyric(){
	lyric = [];
	lyricContents.empty();

	var loading = document.createElement('h1');
	loading.innerHTML = "Loading lyric of this song...";

	lyricContents.append(loading);

	$.ajax({
		url: LYRIC_URL + queue[pointer].id,
		success: function(l){
			var json = JSON.parse(l);
			var keys = Object.keys(json);

			if(!json || keys.length === 0){
				loading.innerHTML = "There are no lyrics of this song.";
				return;
			}

			var sortedLyric = [];

			keys.sort(function(a, b){
				a = parseFloat(a);
				b = parseFloat(b);

				if(a > b) return 1;
				if(a < b) return -1;
				return 0;
			});

			keys.forEach(function(v){
				var id = sortedLyric.length;
				sortedLyric[id] = new Lyric(id, parseFloat(v), json[v]);
			});

			lyric = sortedLyric;

			lyricContents.empty();

			lyric.forEach(function(lyricObject){
				var lyricTemplate = $(document.createElement('p'));
				lyricTemplate[0].innerHTML = lyricObject.getLyric()
					.replace(/\u003C/g, '&lt;')
					.replace(/\u003E/g, '&gt;')
					.replace(/\r\n/g, '<br>')
					.replace(/\n/g, '<br>')
					.replace(/\r/g, '<br>');
				lyricTemplate.data('id', lyricObject.getID());
				lyricContents.append(lyricTemplate);
			});
		},
		error: function(){
			loading.innerHTML = "Couldn't get lyric from the server.";
		}
	});
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
			if(!nolrc){
				var children = lyricContents.children('p');

				var previousKey = undefined;

				lyric.forEach(function(lyricObject){
					if(audio.currentTime > lyricObject.getTiming()){
						previousKey = lyricObject.getID();
					}
				});

				if(previousKey === undefined){
					if(lyric.length > 0) previousKey = 0;
				}

				if(previousKey !== undefined && previousLyricID !== previousKey){
					previousLyricID = previousKey;
					children.removeClass('lyric-active');
					var showingLyric = children.filter(function(){
						return ($(this).data('id') === previousKey);
	 				});
					showingLyric.addClass('lyric-active');
					var offsetTop = showingLyric.offset().top - lyricContents.offset().top + lyricContents.scrollTop();

					if(!freeScroll){
						scrollAnimating = true;
						scrollTarget = offsetTop;
						lyricContents.animate({
							scrollTop: offsetTop
						}, 100);
					}
				}
			}

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
			freeScroll = false;
		})[0];
}

function notifyPlay(){
	playpause.children('span').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
	playlist.removeClass('playing');
	playlist.children('li').filter(function(){
		return $(this).data('id') === queue[pointer].id;
	}).addClass('playing');

	loadLyric();

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
	var errorView = errorTemplate.clone();

	errorView.children('.error-masthead')[0].innerHTML = 'Error!';
	errorView.children('.error-desc')[0].innerHTML = text;

	fixedContents.append(errorView);
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
		url: BGM_URL + id,
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

	playlist.children('li').filter(function(){
		return $(this).data('id') === id;
	}).remove();
}
