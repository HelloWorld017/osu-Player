const bodyParser = require('body-parser');
const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');

let app = express();

// view engine setup
app.set('views', './views/');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public/'));
app.use(express.static('./bower_components/'));
app.use(express.static('./musics/'));

app.use('/', require('./routes'));

app.use((req, res, next) => {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render('error', {
		error: err
	});
});


module.exports = app;
