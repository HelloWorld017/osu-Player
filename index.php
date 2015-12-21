<!DOCTYPE html>
<html>
	<head>
		<title>Welcome to osu!Player</title>
		<meta charset="utf-8"/>
		<meta name="description" content="osu!Player">
		<meta name="author" content="Khinenw">
		<meta name="viewport" content="width=device-width, user-scalable=no">

		<link rel="stylesheet" type="text/css" href="/resources/css/bootstrap.min.css">
		<link rel="stylesheet" type="text/css" href="/resources/css/bootstrap-slider.min.css">
		<link rel="stylesheet" type="text/css" href="/resources/css/bootstrap-toggle.min.css">
		<link rel="stylesheet" type="text/css" href="/resources/css/font-awesome.min.css">
		<link rel="stylesheet" type="text/css" href="/resources/css/osu-bgm-player.css">
		<link rel="shortcut icon" href="/resources/favicon.ico"/>

		<script src="/resources/js/jquery-2.1.4.min.js"></script>
		<script src="/resources/js/bootstrap.min.js"></script>
		<script src="/resources/js/bootstrap-slider.min.js"></script>
		<script src="/resources/js/bootstrap-toggle.min.js"></script>
		<script src="/resources/js/download.js"></script>
		<script src="/resources/js/osu-bgm-player.js"></script>
		<script src="/resources/js/osu-bgm-player-ui.js"></script>
	</head>

	<body class="fonted">
		<div id="playlist-dialog" class="modal fade" role="dialog">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal">
							<span class="fa fa-times"></span>
						</button>

						<h4 id="playlist-dialog-title">

						</h4>
					</div>

					<div class="modal-body">
						<div id="playlist-dialog-content">
							<div class="list-group">
								<button class="list-group-item list-group-item-success" onclick="playlistUp($(this).parent().data('id'));">
									<span class="fa fa-chevron-up"></span>
									Up
								</button>

								<button class="list-group-item list-group-item-success" onclick="playlistDown($(this).parent().data('id'));">
									<span class="fa fa-chevron-down"></span>
									Down
								</button>

								<button class="list-group-item list-group-item-info" onclick="downloadBeatmap($(this).parent().data('id'));">
									<span class="fa fa-download"></span>
									Download Beatmap
								</button>

								<button class="list-group-item list-group-item-info" onclick="downloadMusic($(this).parent().data('id'));">
									<span class="fa fa-arrow-down"></span>
									Download Music
								</button>

								<button class="list-group-item list-group-item-info" onclick="downloadImage($(this).parent().data('id'));">
									<span class="fa fa-picture-o"></span>
									Download Image
								</button>

								<button class="list-group-item list-group-item-danger" onclick="removeFromPlaylist($(this).parent().data('id'));" data-target="#playlist-dialog" data-dismiss="modal">
									<span class="fa fa-trash"></span>
									Remove
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div id="dropzone-dialog" class="modal fade" role="dialog">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal">
							<span class="fa fa-times"></span>
						</button>

						<h4>
							Import your playlist
						</h4>
					</div>

					<div class="modal-body">
						<label for="upload">Click here :</label>
						<input id="upload" type="file" name="file" style="display: inline">

						<form id="upload-form" class="dropzone">
							<div id="dropzone">
								<div id="info-dropzone">
									or drag n drop to here!
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

		<nav class="navbar navbar-inverse bg-main" role="navigation">
            <div class="container">
                <div class="navbar-header">
                    <a class="navbar-brand" href="#"><span style="font-weight: bold">osu!</span>Player</a>
                </div>

                <div class="navbar-header navbar-right">
					<form role="search" class="navbar-form" onsubmit="search(); return false;">
						<div class="input-group">
							<input name="q" type="text" class="form-control" placeholder="Search musics!">
							<input name="mod" type="hidden" value="json">
							<input name="m" type="hidden" value="s">
							<input name="s" type="hidden" value="title">

							<span class="input-group-btn">
								<button type="button" class="btn bg-transparent nav-toggle">
		                        	<span class="fa fa-search bright-font"></span>
		                    	</button>
							</span>
						</div>
					</form>
                </div>
            </div>
        </nav>

		<section>
			<ul id="ground-nav" class="nav nav-tabs">
				<li><a data-toggle="tab" href="#tab-picture"><span class="fa fa-picture-o"></span></a></li>
				<li><a data-toggle="tab" href="#contents"><span class="fa fa-search"></span></a></li>
				<li><a data-toggle="tab" href="#playlist-aside"><span class="fa fa-list-ol"></span></a></li>
				<li><a data-toggle="tab" href="#tab-lyrics"><span class="fa fa-list"></span></a></li>
				<li><a data-toggle="tab" href="#tab-settings"><span class="fa fa-cog"></span></a></li>
				<li><a data-toggle="tab" href="#tab-about"><span class="fa fa-info"></span></a></li>
			</ul>

			<div id="fixed-contents">

			</div>

			<div id="contents">

			</div>

			<aside id="playlist-aside">
				<ul id="playlist" class="list-group">
					<h1>Playlist</h1>
				</ul>
			</aside>
		</section>

		<footer class="bg-main">
			<ul class="controller music-controller">
				<li>
					<a href="javascript:prevTrack()"><span class="fa fa-chevron-left"></span></a>
				</li>
				<li>
					<a id="playpause" href="javascript:play()"><span class="fa fa-play-circle-o"></span></a>
				</li>
				<li>
					<a href="javascript:nextTrack()"><span class="fa fa-chevron-right"></span></a>
				</li>
			</ul>

			<div class="center-progress">
				<input id="music-progress" type="text" data-slider-id="m-progress" data-slider-min="0" data-slider-max="0" data-slider-step="1" data-slider-value="0" data-slider-handle="square"/>
				<br>
				<h1 id="current-title">osu!Player</h1>
				<h2 id="current-artist">Add musics by searching!</h2>
			</div>

			<ul class="controller playlist-controller">
				<li id="toggle-underground" class="toggle">
					<a href="javascript:toggleUnderground()"><span class="fa fa-chevron-up"></span></a>
				</li>

				<li id="toggle-random" class="toggle">
					<a href="javascript:toggleFlag('random')"><span class="fa fa-random"></span></a>
				</li>

				<li id="toggle-repeat" class="toggle">
					<a href="javascript:toggleFlag('repeat')"><span class="fa fa-repeat"></span></a>
				</li>
			</ul>
		</footer>

		<div class="bottom-bg">
			<ul class="nav nav-tabs">
				<li><a data-toggle="tab" href="#tab-lyrics"><span class="fa fa-list"></span></a></li>
				<li><a data-toggle="tab" href="#tab-settings"><span class="fa fa-cog"></span></a></li>
				<li><a data-toggle="tab" href="#tab-picture"><span class="fa fa-picture-o"></span></a></li>
				<li><a data-toggle="tab" href="#tab-about"><span class="fa fa-info"></span></a></li>
			</ul>

			<div class="tab-content">
				<div id="tab-lyrics" class="tab-pane fade">
					<div class="container">
						<h2>Lyrics</h2>
						<p id="lyric-contents">

						</p>
					</div>
				</div>

				<div id="tab-picture" class="tab-pane fade">
					<div id="bg-pict">

					</div>
				</div>

				<div id="tab-settings" class="tab-pane fade">
					<div class="container">
						<h2>Settings</h2>
						<div class="setting-item">
							<h3>No preview images</h3>
							<input id="nopic" type="checkbox" checked data-toggle="toggle">
						</div>
						<div class="setting-item">
							<h3>No syncing lyrics</h3>
							<input id="nolrc" type="checkbox" checked data-toggle="toggle">
						</div>
						<div class="setting-item">
							<h3>No up/down toggle animations (Experimental)</h3>
							<input id="noani" type="checkbox" checked data-toggle="toggle">
						</div>
						<div class="setting-item">
							<h3>Export / Import your playlist</h3>
							<div class="form-inline">
								<button type="button" class="btn btn-default" data-toggle="modal" data-target="#dropzone-dialog">
									<span class="fa fa-upload"></span>
									Import
								</button>

								<button type="button" class="btn btn-info" onclick="exportPlaylist()">
									<span class="fa fa-download"></span>
									Export
								</button>
							</div>
						</div>
						<div class="setting-item">
							<h3>Embed your playlist!<h3>
							<div class="checkbox">
								<label>
									<input type="checkbox" id="repeat-embed">
									Repeat
								</label>
							</div>

							<div class="checkbox">
								<label>
									<input type="checkbox" id="random-embed">
									Random
								</label>
							</div>

							<div class="checkbox">
								<label>
									<input type="checkbox" id="autoplay-embed">
									Autoplay
								</label>
							</div>

							<div class="input-group col-lg-4">
								<input type="text" id="embed-target" class="form-control" disabled>
								<span class="input-group-btn">
									<button class="btn btn-info" onclick="$('#embed-target').val(getEmbedString())">
										<span class="fa fa-share-alt"></span>
									</button>
								</span>
							</div>
						</div>
					</div>
				</div>

				<div id="tab-about" class="tab-pane fade">
					<div class="container">
						<h2>About osu!Player</h2>
						<p>Developed by Khinenw. Available at <a href="https://github.com/HelloWorld017/osu-Player">GitHub</a></p>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
