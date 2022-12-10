var express = require('express');
var logger = require('morgan');
var path = require('path');
var session = require('express-session');
var monk = require('monk');
var cors = require('cors')

var db = monk('127.0.0.1:27017/assignment2');

var noteRouter = require('./routes/notes');

var app = express();

app.use(cors({credentials: true,
  origin: 'http://localhost:3000'
}));

app.use(session({
  secret: "random_string",
  resave: false,
  saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger());

app.use(express.static('public'));

app.use((req, res, next) => {
  req.db = db;
  next();
})



app.use('/', noteRouter);


var server = app.listen(3001, function () {
var host = server.address().address;
var port = server.address().port;
console.log("app listening at http://%s:%s", host, port);
})









// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// // view engine setup
// // app.set('views', path.join(__dirname, 'views'));
// // app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;







