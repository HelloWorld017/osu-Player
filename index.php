<?php
	header('Access-Control-Allow-Origin: http://bloodcat.com');
?>

<!DOCTYPE html>
<html>
	<head>
		<title>Welcome to osu!Player</title>
		<meta charset="utf-8"/>
		<meta name="description" content="osu!Player">
		<meta name="author" content="Khinenw">
		<meta name="viewport" content="width=device-width, user-scalable=no">

		<link rel="stylesheet" type="text/css" href="/resources/css/bootstrap.min.css">
		<link rel="stylesheet" type="text/css" href="/resources/css/font-awesome.min.css">
		<link rel="stylesheet" type="text/css" href="/resources/css/osu-bgm-player.css">
		<link rel="shortcut icon" href="/resources/favicon.ico"/>

		<script src="/resources/js/jquery-2.1.4.min.js"></script>
		<script src="/resources/js/osu-bgm-player.js"></script>

	</head>

	<body class="fonted">
		<nav class="navbar navbar-inverse bg-main" role="navigation">
            <div class="container">
                <div class="navbar-header">
                    <a class="navbar-brand" href="#"><span style="font-weight: bold">osu!</span>Player</a>

                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#top-navbar">
                        <span class="fa fa-bars bright-font"></span>
                    </button>

                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#right-navbar">
                        <span class="fa fa-map-signs bright-font"></span>
                    </button>
                </div>

                <div class="navbar-header navbar-right">
					<form role="form" class="form-inline">
						<div class="form-group">
							<input type="text" class="form-control" placeholder="Search musics!">
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
			<div id="contents">

			</div>

			<aside>
				<ul id="playlist" class="list-group">
					<h1>Playlist</h1>
					<li type="button" class="list-group-item"><span class="fa fa-music bgm-music"></span>List</li>
				</ul>
			</aside>

			<footer class="bg-main">
				<ul>
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
			</footer>
		</section>
	</body>
</html>
