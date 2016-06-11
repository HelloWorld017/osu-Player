var undergroundTabs = null;
var groundTabs = null;
var section = null;
var undergroundSection = null;
var centerProgress = null;
var progressSlider = null;
var exportList = null;
var importDiag = null;

var isDesktop = null;

$(document).ready(function(){
	undergroundSection = $('.bottom-bg .tab-content');
	section = $('section');
	centerProgress = $('.center-progress');
	progressSlider = $('.slider');
	exportList = $('#export-list');
	importDiag = $('#import-dialog');

	undergroundTabs = undergroundSection.children('div');
	groundTabs = section.children('#contents, #playlist-aside');

	isDesktop = !(window.innerWidth >= 768);

	resize();
});

$(window).on('resize', resize);

function resize(){
	if(window.innerWidth <= 768){
		if(isDesktop){
			if(document.body.scrollTop > 0) toggleUnderground();
			section.append(undergroundTabs);
			groundTabs.addClass('tab-pane fade');
			section.addClass('tab-content');
			bgPict.append(progress);
			bgPict.append(progressSlider);
			isDesktop = false;
		}
	} else if(!isDesktop){
		undergroundSection.append(undergroundTabs);
		groundTabs.removeClass('tab-pane fade');
		section.removeClass('tab-content');
		centerProgress.prepend(progressSlider);
		centerProgress.prepend(progress);
		isDesktop = true;
	}
}

function openImportDiag(){
	if(storageAvailable('localStorage')){
		var playlist = JSON.parse(window.localStorage.getItem('playlist'));
		exportList.empty();
		playlist.forEach(function(k){
			exportList.append($(document.createElement('li')).addClass('list-group-item').attr('data-id', k).text(k).on('click', function(){
				importWithoutFile(k);
			}));
		});
		importDiag.modal();
	}else{
		alert('Storage is not available!');
	}
}
