//Code from https://gist.github.com/kares/956897
/**
 * $.parseParams - parse query string paramaters into an object.
 */
(function($) {
var re = /([^&=]+)=?([^&]*)/g;
var decodeRE = /\+/g;  // Regex for replacing addition symbol with a space
var decode = function (str) {return decodeURIComponent( str.replace(decodeRE, " ") );};
$.parseParams = function(query) {
    var params = {}, e;
    while ( e = re.exec(query) ) {
        var k = decode( e[1] ), v = decode( e[2] );
        if (k.substring(k.length - 2) === '[]') {
            k = k.substring(0, k.length - 2);
            (params[k] || (params[k] = [])).push(v);
        }
        else params[k] = v;
    }
    return params;
};
})(jQuery);

const BGM_URL = "load_bgm.php?id=";
const INFO_URL = "/search_bgm.php"

var queue = [];
var pointer = 0;
var playpause = null;
var currentSong = null;
var currentTitle = null;

var prefs = {
	random: false,
	repeat: false,
	autoplay: true
};

var audio;
var preloadAudio = {
	audio: null,
	id: null
};

const DIRECTION_LEFT = -1;
const DIRECTION_RIGHT = 1;

var intervalId = null;
var isScrolling = false;
var currentDirection = DIRECTION_LEFT;
var scrollPreset = {};

scrollPreset[DIRECTION_LEFT] = function(){
	return {
		target: 0,
		duration: 1000
	};
};

scrollPreset[DIRECTION_RIGHT] = function(el){
	return {
		target: el.scrollWidth - el.clientWidth,
		duration: 20000
	};
}

$(document).ready(function(){
	playpause = $('#playpause');
	currentSong = $('#song-contents');
	currentTitle = $('#title-contents');

	audio = attachListenerToAudio(document.createElement('audio'));

	var data = $.parseParams(location.href.slice(location.href.indexOf('?') + 1));
	var dataQueue = data.queue.split(',');

	dataQueue.forEach(function(v, index){
		addToPlaylist(v, index);
	});

	prefs.random = data.random;
	prefs.repeat = data.repeat;
	prefs.autoplay = data.autoplay;

	if(dataQueue.length <= 0) return;
	if(!prefs.autoplay) return;

	var playIntervalId = setInterval(function(){
		if(queue.length !== 0){
			clearInterval(playIntervalId);
			play();
		}
	});

	if(intervalId){
		clearInterval(intervalId);
	}

	intervalId = setInterval(checkFlow, 1000);
});

function makeItFlow(){
	isScrolling = true;
	currentDirection = -currentDirection;

	var scroll = scrollPreset[currentDirection](currentTitle[0]);

	currentTitle.animate({
		scrollLeft: scroll.target
	}, {
		duration: scroll.duration,
		complete: function(){
			isScrolling = false;
			makeItFlow();
		}
	});
}

function checkFlow(){
	if(currentTitle[0].clientWidth < currentTitle[0].scrollWidth && !isScrolling){
		makeItFlow();
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
	if(prefs.random) return getRandomTrack();

	var nextPointer = pointer + 1;
	if(nextPointer >= queue.length){
		return (prefs.repeat ? 0 : null);
	}

	return nextPointer;
}

function getPrevTrack(){
	if(prefs.random) return getRandomTrack();

	var prevPointer = pointer - 1;
	if(prevPointer < 0){
		return (prefs.repeat ? 0 : null);
	}

	return prevPointer;
}

function getRandomTrack(){
	if(queue.length <= 1){
		return (prefs.repeat ? pointer : null);
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
		console.log("Adjusting slider.");
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
			if(audio.currentTime > audio.duration - 15){
				if(!prefs.random && getNextTrack() && preloadAudio.id !== queue[getNextTrack()].id){
					//Preload in random is disabled currently.
					var nextTrack = queue[getNextTrack()];

					preloadAudio.id = nextTrack.id;
					preloadAudio.audio = document.createElement('audio');
					preloadAudio.audio.src = nextTrack.music;

					console.log("Started to preload audio : " + preloadAudio.id);
				}
			}
		})[0];
}

function notifyPlay(){
	playpause.children('span').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
	currentSong.text(queue[pointer].title + '-' + queue[pointer].artist);
}

function notifyStop(){
	playpause.children('span').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
}

function indexOfId(id){
	var index = -1;
	queue.forEach(function(v, k){
		if(v.id === id) index = k;
	});
	return index;
}

function addToPlaylist(id, pointer){
	(function(callback){
		$.ajax({
			url: INFO_URL + "?mod=json&q=" + id + "&c=s",
			type: "GET",
			success: function(data){
				var jsonArray = JSON.parse(data);

				if(jsonArray === null || data === "[]"){
					error("Couldn't retrieve the data.<br>There are no beatmaps you've entered or the server is working abnormally.");
					return false;
				}

				callback(jsonArray[0]);
			},

			error: function(){

			}
		});
	})(function(meta){
		$.ajax({
			url: BGM_URL + id,
			success: function(data){
				var jsonData = JSON.parse(data);

				var data = {
					id: id,
					music: 'musics/' + jsonData['audio'],
					title: meta.title,
					artist: meta.artist
				};

				queue[pointer] = data;
			},

			error: function(){

			}
		});
	});
}
