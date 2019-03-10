$(function () {
    let socket = io();
    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('set nickname', function(msg){
        $('#nickname').empty();
        $('#nickname').append("You are "+msg);
    });

    socket.on('load chatlog', function(msg){
        for(let i = 0; i<msg.length; i++){
            $('#messages').append($('<li>').text(msg[i]));
        }
    });
    
    socket.on('update userlist', function(msg){
        $('#user-list').empty();
        for(let i = 0; i<msg.length; i++){
            $('#user-list').append($('<li>').css('color',msg[i].socket_nickname_color).text(msg[i].socket_nickname));
        }
        
    })
  });