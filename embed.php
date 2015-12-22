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
		<link rel="shortcut icon" href="/resources/favicon.ico"/>

		<script src="/resources/js/jquery-2.1.4.min.js"></script>
		<script src="/resources/js/embed.js"></script>

		<style>
			@font-face {
				font-family: 'NanumBarunGothic';
				src: url('/resources/fonts/NanumBarunGothic.woff') format("woff"), url('/resources/fonts/NanumBarunGothic.eot?#iefix') format("embedded-opentype");
			}

			@font-face {
				font-family: 'NanumGothic';
				src: url('/resources/fonts/NanumGothic.woff') format("woff"), url('/resources/fonts/NanumGothic.eot?#iefix') format("embedded-opentype");
			}

			@font-face {
				font-family: 'Ubuntu';
				src: url('/resources/fonts/Ubuntu.woff') format("woff"), url('/resources/fonts/Ubuntu.eot?#iefix') format("embedded-opentype");
			}

			@font-face {
				font-family: 'Noto Sans Korean';
				src: url('/resources/fonts/NotoSans.woff') format("woff"), url('/resources/fonts/NotoSans.eot?#iefix') format("embedded-opentype");
			}

			@font-face {
				font-family: 'NanumGothicCoding';
				src: url('/resources/fonts/NanumGothicCoding.woff') format("woff"), url('/resources/fonts/NanumGothicCoding.eot?#iefix') format("embedded-opentype");
			}

			a{
				color: #00C0A0;
			}

			a:hover, a:active, a:focus, a:visited{
				color: #16A085;
			}

			.contents{
				background: #222f3d;
				border: solid 3px #222f3d;
				border-radius: 5px;
				font-family: '나눔바른고딕', 'NanumBarunGothic', '나눔고딕', 'NanumGothic', 'InterparkGothic', '인터파크고딕', 'Open Sans', '함초롬돋움', '서울남산체', 'Noto Sans Korean', '본고딕', 'Apple SD Gothic Neo', 'KoPubDotum Medium', '맑은고딕', 'Malgun Gothic', arial, sans-serif;
			}

			.row{
				margin: 0;
			}

			#title-contents{
				overflow: hidden;
				white-space: nowrap;
			}

			#song-contents{
				color: #00C0A0;
				margin-left: 10px;
			}
		</style>
	</head>

	<body>
		<div class="contents">
			<div class="row">
				<div id="title-contents" class="col-xs-8">
					<span id="song-contents">
					</span>
				</div>

				<div class="col-xs-1">
					<a id="prev" href="javascript:prevTrack()">
						<span class="fa fa-chevron-left"></span>
					</a>
				</div>

				<div class="col-xs-1">
					<a id="playpause" href="javascript:play()">
						<span class="fa fa-play-circle-o"></span>
					</a>
				</div>

				<div class="col-xs-1">
					<a id="next" href="javascript:nextTrack()">
						<span class="fa fa-chevron-right"></span>
					</a>
				</div>
			</div>
		</div>
	</body>
</html>
