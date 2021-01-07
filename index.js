const express = require('express')();
const http = require('http').Server(express);

const mongoose = require('mongoose');

const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const uri = "mongodb+srv://matth:matth@cluster0-024cv.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connection ok");//s'affiche si on est connecté à la DB
});

//body-parser: 
const bodyParser = require('body-parser');
express.use(bodyParser.json());
express.use(bodyParser.urlencoded({extended: false}));


express.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

const channel_1 = mongoose.model ("channel_1", {
  message: String
});

io.on('connection', function(socket){
    console.log('a user connected');
    channel_1.find({}, 'message', function(err, messages){//récupère ds DB
      if (err) return console.error(err);
      messages.map(message => {//casser l'objet
        console.log(message.message);//n'afficher que le message, pas l'ID ou les titres
        io.emit("chat message", message.message);//envoie aux clients via socket
      });
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
      console.log('message: ' + msg);

      io.emit('chat message', msg);

      var message = new channel_1({message: msg});
      message.save(function(err, msg) {
        if(err) return console.error(err);
        console.log("sent successfully");
      })
    });
});
 
http.listen(port, function(){
  console.log('listening on *:' + port);
});
