let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let Chance = require('chance');
let stack = [];
let users =[];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/chatroom.css', function(req, res){
  res.sendFile(__dirname + '/chatroom.css');
})

app.get('/io.js', function(req,res){
  res.sendFile(__dirname + '/io.js');
});

io.on('connection', function(socket){

  //name new connection and log into console and set on html
  let chance = new Chance();
  let nickname = chance.animal()
  console.log("Naming new connection as: " + nickname);
  socket.emit('set nickname', nickname);

  //push current user identified by the socket id and the nickname and update user list client-side
  users.push({socket_id:socket.id, socket_nickname:nickname, socket_nickname_color:"#000000"});
  io.emit('update userlist', users);

  //load chat history on initial user connection
  socket.emit('load chatlog', stack);
  
  //On client disconnect, log users into console, update online user list
  socket.on('disconnect', function(){
    console.log(nickname + ' disconnected');
    for(let i=0; i<users.length; i++){
      if(users[i].socket_nickname===nickname){
        users.splice(i,1);
        break;
      }
    }
    io.emit('update userlist', users);
  });

  //On client message
  socket.on('chat message', function(msg){
    let d = new Date();
    let n = d.toLocaleTimeString();

    //Server receives any command
    if(msg.charAt(0)==='/'){
      let nt_flag = 0;

      //Use regex to allow double quotes words as a single argument (eg. "Nick Name" as 1 argument)
      let arguments = [].concat.apply([], msg.split('"').map(function(v,i){
        return i%2 ? v : v.split(' ')
      })).filter(Boolean);

      //Server receives nickname change command
      if(arguments[0] === "/nick"){
        if(arguments.length == 2){
          for(let i = 0; i<users.length; i++){
            if(users[i].socket_nickname===arguments[1]){
              nt_flag = 1;
              break;
            }
          }
          if(!nt_flag){
            for(let i = 0; i<users.length; i++){
              if(users[i].socket_nickname===nickname){
                nickname = arguments[1];
                users[i].socket_nickname=nickname;
                io.emit('update userlist', users);
                socket.emit('set nickname', nickname);
              }

              //TODO:
              // Change subsequent messages in chatlog history to reflect name change
              // --> Modify stack
            }
          }
          else{
            socket.emit('chat message', "Nickname already taken! Please choose another one.");
          }
        }
        else{
          socket.emit('chat message', "To set a custom nickname, please use the /nick \"example nick name\" fomat.");
        }
      }

      //Server receives nickname color change command
      if(arguments[0] === "/nickcolor"){
        if(arguments.length == 2){
          let hexregex = RegExp(/^[0-9A-F]{6}$/i);
          if(hexregex.test(arguments[1])){
            for(let i = 0; i<users.length; i++){
              if(users[i].socket_nickname===nickname){
                console.log("Setting "+users[i].socket_nickname+"'s nickname color to: "+arguments[1]);
                users[i].socket_nickname_color = "#"+arguments[1];
                break;
              }
            }
            socket.emit('update userlist', users);

            //TODO:
            // Change subsequent messages in chatlog history to reflect color change
            // --> Modify stack
          }
          else{
            socket.emit('chat message', "To set a custom nickname color, please use the /nickcolor RRGGBB format.")
          }
        }
        else{
          socket.emit('chat message', "To set a custom nickname color, please use the /nickcolor RRGGBB format.");
        }
      }
    }
    else{
      //craft chat message with timestamp
      let mes = "[" + n + "] " + nickname + ": " + msg;

      //If current chatlog stack > 200, remove oldest message then add the new message
      if(stack.length >200){
        stack.pop();
      }
      stack.push(mes);


      //log and emit message to console and client
      console.log(mes);
      io.emit('chat message', mes);
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});