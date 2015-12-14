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
		<script src="/resources/js/osu-bgm-player.js"></script>
	</head>

	<body class="fonted">
		<nav class="navbar navbar-inverse bg-main" role="navigation">
            <div class="container">
                <div class="navbar-header">
                    <a class="navbar-brand" href="#"><span style="font-weight: bold">osu!</span>Player</a>
                </div>

                <div class="navbar-header navbar-right">
					<form role="form" class="form-inline" onsubmit="search(); return false;">
						<div class="form-group">
							<input name="q" type="text" class="form-control" placeholder="Search musics!">
							<input name="mod" type="hidden" value="json">
							<input name="m" type="hidden" value="s">
							<input name="s" type="hidden" value="title">
						</div>

						<button type="button" class="bt bg-transparent nav-toggle" data-toggle="collapse" data-target="#right-navbar">
	                        <span class="fa fa-search bright-font"></span>
	                    </button>
					</form>
                </div>
            </div>
        </nav>

		<section>
			<div id="fixed-contents">

			</div>

			<div id="contents">

			</div>

			<aside>
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
			</ul>

			<div class="tab-content">
				<div id="tab-lyrics" class="tab-pane fade">
					<div class="container">
						<h2>Lyrics</h2>
						<p id="lyric-contents">

						</p>
					</div>
				</div>

				<div id="tab-settings" class="tab-pane fade">
					<div class="container">
						<h1>Settings</h1>
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
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
