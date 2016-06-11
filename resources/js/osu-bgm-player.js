//const INFO_URL = "http://bloodcat.com/osu/";
const INFO_URL = "/search_bgm.php";
const BGM_URL = "load_bgm.php?id=";
const LYRIC_URL = "/load_lyric.php?id=";
const IMG_URL = "//b.ppy.sh/thumb/{0}l.jpg";

const MUSIC_BASE = "https://bgm.khinenw.tk/";
const EMBED_URL = "//bgm.khinenw.tk/embed.php?";
const EMBED_TEMPLATE = '<iframe src="{%src}" width="310" height="26" style="border: none"></iframe>';

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
var dialog = null;
var bgPict = null;
var dropzoneModal = null;
var dropzone = null;
var upload = null;

var toggles = {
	repeat: null,
	random: null,
	underground: null
};

var settings = {
	nopic: null,
	noani: null,
	nolrc: null,
	nopld: null
};

var prefs = {
	random: false,
	repeat: false,
	nopic: false,
	noani: false,
	nolrc: false,
	nopld: false
};

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
			$(document.createElement('span')).addClass('fa fa-times')
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
	dialog = $('#playlist-dialog');
	bgPict = $('#bg-pict');
	dropzoneModal = $('#dropzone-dialog');
	dropzone = $('.dropzone');
	upload = $('#upload');

	toggles.repeat = $('#toggle-repeat');
	toggles.random = $('#toggle-random');
	toggles.underground = $('#toggle-underground span');

	settings.nopic = $('#nopic');
	settings.noani = $('#noani');
	settings.nolrc = $('#nolrc');
	settings.nopld = $('#nopld');

	prefs.repeat = getFlag('repeat');
	prefs.random = getFlag('random');
	prefs.nopic = getFlag('nopic');
	prefs.noani = getFlag('noani');
	prefs.nolrc = getFlag('nolrc');
	prefs.nopld = getFlag('nopld');

	$.each(toggles, function(k, v){
		toggleFlag(k, true);
	});

	$.each(settings, function(k, v){
		toggleSetting(k, true);
		v.on('change', function(){
			toggleSetting(k, false, true);
		});
	});

	undergroundTop = $('footer');

	if(prefs.noani) scrollTick = 0;
	if(!prefs.noani) toggles.underground.addClass('fa-rotate-to');
	if(!(document.body.scrollTop > 0)) toggles.underground.addClass('fa-rotate-180');

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
		if(prefs.nolrc) return;

		if(!scrollAnimating) freeScroll = true;

		if(scrollAnimating && (scrollTarget === lyricContents.scrollTop() || lyricContents.scrollTop() >= lyricContents[0].scrollHeight - lyricContents.height())){
			scrollAnimating = false;
		}
	});

	dropzone.on('dragover', function(e){
		dropzone.addClass('over');
		e.preventDefault();
	}).on('dragleave', function(e){
		dropzone.removeClass('over');
		e.preventDefault();
	}).on('drop', function(e){
		dropzone.removeClass('over');
		importWithFile((e.originalEvent.target.files || e.originalEvent.dataTransfer.files)[0]);
		e.preventDefault();
		return false;
	});

	upload.on('change', function(){
		importWithFile(upload[0].files[0]);
	});
});

if(storageAvailable('localStorage')){
	if(!window.localStorage.getItem('playlist')){
		window.localStorage.setItem('playlist', '[]');
	}
}

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

Number.prototype.zfill = function(repeat){
	var num = this.toString();
	if(num.length >= repeat) return num;

	var zeros = '';
	for(var i = 0; i < repeat - num.length; i++){
		zeros = zeros + '0';
	}

	return zeros + num;
};

Date.prototype.format = function(format){
	var that = this;

	return format.replace(/(yyyy|yy|MM|dd|hh|HH|mm|ss|a)/g, function(type){
		switch(type){
			case 'yyyy': return that.getFullYear();
			case 'yy': return (that.getFullYear() % 100).zfill(2);
			case 'MM': return (that.getMonth() + 1).zfill(2);
			case 'dd': return (that.getDate()).zfill(2);
			case 'hh': return (that.getHours() % 12).zfill(2);
			case 'HH': return (that.getHours()).zfill(2);
			case 'mm': return (that.getMinutes()).zfill(2);
			case 'ss': return (that.getSeconds()).zfill(2);
			case 'aa': return (that.getHours() >= 12 ? 'PM':'AM');
				return type;
		}
	});
};

function importWithFile(file){
	var reader = new FileReader();
	reader.onloadend = function(){
		importPlaylist(reader.result);
		dropzoneModal.modal('hide');
	};

	reader.readAsText(file);
}

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

function toggleValue(flag){
	prefs[flag] = !prefs[flag];
	setFlag(flag, prefs[flag]);
	return prefs[flag];
}

function toggleFlag(flag, init){
	var flagValue = prefs[flag];
	if(!init) flagValue = toggleValue(flag);

	if(flagValue){
		toggles[flag].addClass('active');
		return;
	}

	toggles[flag].removeClass('active');
}

function toggleSetting(flag, init, output){
	var flagValue = prefs[flag];
	if(!init) flagValue = toggleValue(flag);

	if(output) return;

	if(flagValue){
		settings[flag].bootstrapToggle('on');
		return;
	}

	settings[flag].bootstrapToggle('off');
}

function toggleUnderground(){
	if(document.body.scrollTop === 0){
		$('html,body').animate({
			scrollTop: undergroundTop.offset().top
		}, scrollTick);

		toggles.underground.removeClass('fa-rotate-180')
		return;
	}

	$('html,body').animate({
		scrollTop: 0
	}, scrollTick);

	toggles.underground.addClass('fa-rotate-180');
}

function prevTrack(){
	if(!prefs.nopld && !audio.paused) stop();

	if(queue.length <= 0) return;

	var prevPointer = getPrevTrack();

	if(prevPointer === null){
		if(prefs.nopld) stop();
		return;
	}
	loadTrack(prevPointer);
}

function nextTrack(){
	if(!prefs.nopld && !audio.paused) stop();

	if(queue.length <= 0) return;

	var nextPointer = getNextTrack();

	if(nextPointer === null){
		if(prefs.nopld) stop();
		return;
	}
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

	if(prefs.nopld || preloadAudio.id !== queue[pointer].id){
		audio.src = queue[pointer].music;
	}else{
		audio = attachListenerToAudio(preloadAudio.audio);
		preloadAudio = {};
		console.log("Getting audio from preloaded audio.");
		console.log("Adjusting slider.");
		progress.slider('setAttribute', 'max', Math.round(audio.duration));
		freeScroll = false;
	}
	if(!prefs.nopld) play();
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
			if(!prefs.nolrc){
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
				if(!prefs.random && getNextTrack() && preloadAudio.id !== queue[getNextTrack()].id){
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
			progress.slider('setAttribute', 'max', Math.round(audio.duration));
			freeScroll = false;
		})[0];
}

function notifyPlay(){
	playpause.children('span').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
	playlist.children().removeClass('playing');
	getElementByMusicId(queue[pointer].id).addClass('playing');

	loadLyric();

	currentTitle[0].innerHTML = queue[pointer].title;
	currentArtist[0].innerHTML = queue[pointer].artist;

	bgPict.css({
		'background-image': ((queue[pointer].image) ? 'url("' + queue[pointer].image + '")' : "")
	});
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

	var src = "//placehold.it/160x120";
	if(!prefs.nopic) src = IMG_URL.replace("{0}", id);

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
	errorView.animate({
		'top': 0
	}, 2000);
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
	});
}

function addToPlaylistPlaceholder(id){
	var listView = playlistTemplate.clone();

	listView.children('.playlist-text')[0].innerHTML =
		'<span class="list-title">Adding your selected music. Plz wait for a sec!</span>';
	listView.data('id', id);

	listView.on('click', function(){
		$('#playlist-dialog-title')[0].innerHTML = (queue[indexOfId($(this).data('id'))] || {}).title;
		dialog.html($(dialog).html());
		$('#playlist-dialog-content div').data('id', $(this).data('id'));
		dialog.modal();
	});

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
	playlist.append(listView); //Fixes #2
}

function addToPlaylist(id, title, artist){
	if(queueCheck(id)) return;

	var view = addToPlaylistPlaceholder(id);

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
						afterQueueCheck(id);
					});
				}else{
					addToPlaylistFromTemplate(view, data);
					queue.push(data);
					afterQueueCheck(id);
				}
			});
		},

		error: function(){
			view.remove();
			error("Couldn't get music file from osz.");
		}
	});
}

function queueCheck(id){
	var alreadyAdded = 0;

	queue.forEach(function(v){
		if(v.id === id) alreadyAdded++;
	});

	return alreadyAdded;
}

function afterQueueCheck(id){
	var res = queueCheck(id) > 1;
	if(res){
		removeFromPlaylist(id);
	}
}

function getElementByMusicId(id){
	return playlist.children('li').filter(function(){
		return $(this).data('id') === id;
	});
}

function indexOfId(id){
	var index = -1;
	queue.forEach(function(v, k){
		if(v.id === id) index = k;
	});
	return index;
}

function playlistUp(id){
	var index = indexOfId(id);
	if(index <= 0) return;

	var pointerID = queue[pointer].id;

	var temp = queue[index - 1];
	queue[index - 1] = queue[index];
	queue[index] = temp;

	pointer = indexOfId(pointerID);

	var element = getElementByMusicId(id);
	element.prev().before(element);
}

function playlistDown(id){
	var index = indexOfId(id);
	if(index >= queue.length - 1) return;

	var pointerID = queue[pointer].id;

	var temp = queue[index + 1];
	queue[index + 1] = queue[index];
	queue[index] = temp;

	pointer = indexOfId(pointerID);

	var element = getElementByMusicId(id);
	element.next().after(element);
}

function downloadFromURL(url, name){
	var x = new XMLHttpRequest();
	x.open("GET", url, true);
	x.responseType = 'blob';
	x.onload = function(){
		download(x.response, name);
	};
	x.send();
}

function downloadFromMeta(id, type){
	var data = queue[indexOfId(id)];
	var split = data[type].split('.');
	downloadFromURL(data[type], data.artist + ' - ' + data.title + "." + split[split.length - 1]);
}

function downloadMusic(id){
	downloadFromMeta(id, "music");
}

function downloadImage(id){
	downloadFromMeta(id, "image");
}

function downloadBeatmap(id){
	$(document.createElement('form'))
		.attr('action', "https://bloodcat.com/osu/s/" + id)
		.attr('method', 'post')
		.attr('target', '_blank')
		.submit();
}

function removeFromPlaylist(id){
	if(pointer === indexOfId(id) && !audio.paused) stop();

	queue = queue.filter(function(v){
		return v.id !== id;
	});

	getElementByMusicId(id).remove();
}

function exportPlaylist(){
	download(
		JSON.stringify(queue),
		(new Date()).format('playlist-yyyy-MM-dd HHmm.osp')
	);
}

function importPlaylist(data){
	queue = [];

	$.each(JSON.parse(data), function(k, v){
		is404(v.music, function(tested){
			if(tested){
				addToPlaylist(v.id, v.title, v.artist);
				return;
			}

			var view = addToPlaylistPlaceholder(v.id);
			addToPlaylistFromTemplate(view, v);
			queue.push(v);
		});
	});
}

function importWithoutFile(key){
	importPlaylist(window.localStorage.getItem(key));
}

function exportWithoutFile(){
	if(!storageAvailable('localStorage')){
		alert('Storage is not available!');
		return;
	}

	var date = (new Date()).format('playlist-yyyy-MM-dd HHmm');
	var playlists = JSON.parse(window.localStorage.getItem('playlist'));
	playlists.push(date);
	window.localStorage.setItem('playlist', JSON.stringify(playlists));
	window.localStorage.setItem(date, JSON.stringify(queue));
}

function exportToM3U8(){
	async.forEachOf(queue, function(v, k, cb){
		var testAudio = document.createElement('audio');
		testAudio.src = v.music;
		$(testAudio).on('canplaythrough', function(e){
			queue[k].duration = e.currentTarget.duration;
			testAudio.src = "";
			testAudio.load();
			cb();
		});
	}, function(){
		var m3u8 = '#EXTM3U\n';

		queue.forEach(function(v){
			m3u8 += '#EXTINF:' + Math.round(v.duration) + ', ' + v.artist + '-' + v.title + '\n';
			m3u8 += MUSIC_BASE + v.music + '\n\n';
		});

		download(
			m3u8,
			(new Date()).format('playlist-yyyy-MM-dd HHmm.m3u8')
		);
	});
}

function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

function playThis(id){
	var idPointer = indexOfId(id);
	loadTrack(idPointer === -1 ? pointer : idPointer);
}

function getEmbedString(){
	var data = {};

	data.queue = $.map(queue, function(v){
		return v.id;
	}).join(',');

	data.repeat = $('#repeat-embed').is(':checked');
	data.random = $('#random-embed').is(':checked');
	data.autoplay = $('#autoplay-embed').is(':checked');

	return EMBED_TEMPLATE.replace("{%src}", EMBED_URL + $.param(data)).replace("&", "&amp;");
}
