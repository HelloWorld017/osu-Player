const JSZip = require('jszip');
const alsong = require('alsong');
const fs = require('fs');
const path = require('path');
const request = require('request');
const rp = require('request-promise');

const OSZ_URL = "http://bloodcat.com/osu/s/";

let router = require('express').Router();

let getMeta = (content) => {
	let currentContext = undefined;
	let image = undefined;
	let audio = undefined;
	content.split(/\r?\n/).forEach((v) => {
		let match = v.match(/\[\s*(.+)\s*\].*/i);
		if(match !== null){
			currentContext = match[1].toLowerCase();
		}

		let aMatch = v.match(/AudioFilename[ ]*:[ ]*(.*)/i);
		if(aMatch !== null){
			audio = aMatch[1];
		}

		if(currentContext === 'events'){
			let match = v.match(/0\s*,\s*0\s*,\s*["?'](.+)["?']/);
			if(match !== null) image = match[1];
		}

	});

	return {
		image: image,
		audio: audio
	};
};

router.get('/', (req, res, next) => {
	res.render('index');
});

router.get('/embed/', (req, res, next) => {
	res.render('embed');
});

router.get('/embed.php', (req, res, next) => {
	//Fallback
	res.render('embed');
});

router.get('/search/', (req, res, next) => {
	if(typeof req.query.q !== 'string') return next(new Error("Invalid Data!"));
	rp({
		uri: 'https://bloodcat.com/osu/',
		qs: {
			mod: 'json',
			m: 's',
			s: 'title',
			q: req.query.q.slice(0, 100)
		}
	}, (err, resp, body) => {
		if(err) return next(err);
		res.status(200).json(body);
	});
});

router.get('/lyric/:id', (req, res, next) => {
	if(typeof req.params.id !== 'string') return next(new Error("Invalid Data!"));
	if(req.params.id.match(/^[0-9]+$/) === null) return next(new Error("Invalid Data!"));
	if(req.params.id.length > 30) return next(new Error("Invalid Data!"));

	fs.access(`musics/${req.params.id}.meta`, fs.F_OK, (err) => {
		if(err) return next(new Error("No Beatmap found!"));

		fs.access(`musics/${req.params.id}.jlrc`, fs.F_OK, (err) => {
			if(!err) return res.sendFile(`./musics/${req.params.id}.jlrc`, {root: path.join(__dirname, '..')});
			fs.readFile(`musics/${req.params.id}.meta`, 'utf8', (err, val) => {
				if(err) return next(err);
				alsong("./musics/" + JSON.parse(val).audio).then((lyric) => {
					var nLyric = {};
					Object.keys(lyric.lyric).forEach((v) => {
						nLyric[parseInt(v) / 1000] = lyric.lyric[v].filter((v) => v !== '').join('\n');
					});
					fs.writeFile(`musics/${req.params.id}.jlrc`, JSON.stringify(nLyric), () => {
						res.status(200).json(nLyric);
					});
				});
			});
		});
	});
});

router.get('/load/:id', (req, res, next) => {
	if(typeof req.params.id !== 'string') return next(new Error("Invalid Data!"));
	if(req.params.id.match(/^[0-9]+$/) === null) return next(new Error("Invalid Data!"));
	if(req.params.id.length > 30) return next(new Error("Invalid Data!"));

	fs.access(`musics/${req.params.id}.meta`, fs.F_OK, (err) => {
		if(!err){
			res.status(200).type('json').sendFile(`./musics/${req.params.id}.meta`, {root: path.join(__dirname, '..')});
			return;
		}else{
			fs.access(`musics/${req.params.id}.osz`, fs.F_OK, (err) => {
				let unarchive = () => {
					let zip = new JSZip();
					fs.readFile(`musics/${req.params.id}.osz`, (err, data) => {
						if(err) return next(err);
						zip.loadAsync(data).then(() => {
							let ent;

							zip.forEach((path, entry) => {
								if(entry.name.split('.').pop() === 'osu'){
									ent = entry;
									//meta = getMeta(entry.data.toString('utf8'));
								}
							});

							if(ent === undefined) return next(new Error("INVALID OSZ!"));
							ent.async('string').then((v) => {
								meta = getMeta(v);

								if(meta === undefined) return next(new Error("INVALID OSZ!"));
								if(meta.audio === undefined) return next(new Error("INVALID OSZ!"));
								zip.file(meta.audio).nodeStream().pipe(fs.createWriteStream(`musics/${req.params.id}.${meta.audio.split('.').pop()}`)).on('finish', () => {
									let fin = () => {
										Object.keys(meta).forEach((k) => {
											meta[k] = req.params.id + '.' + meta[k].split('.').pop();
										});

										fs.writeFile(`musics/${req.params.id}.meta`, JSON.stringify(meta), () => {
											res.json(meta);
										});
									};
									if(meta.image) zip.file(meta.audio).nodeStream().pipe(fs.createWriteStream(`musics/${req.params.id}.${meta.audio.split('.').pop()}`)).on('finish', fin).on('error', (e) => {
										next(e);
									});
									else fin();
								}).on('error', (e) => {
									next(e);
								});
							});
						});
					})
				};

				if(err){
					request(OSZ_URL + req.params.id).pipe(fs.createWriteStream(`musics/${req.params.id}.osz`)).on('end', unarchive).on('err', () => {
						next(new Error('Error while download!'));
					});
				}else unarchive();
			});
		}
	});
});

module.exports = router;
