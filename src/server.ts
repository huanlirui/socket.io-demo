const express = require('express');

var app = require('express')();
const ioServer = require('./socket')(app);

// View engine setup
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public')); //设置静态文件目录

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
ioServer.listen(4000, function () {
  console.log('listening on *:4000');
});
