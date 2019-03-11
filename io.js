$(function () {
    let socket = io();
    let nickname = "";
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
        console.log("Attempting to set cookie");
        setCookie("nickname",msg,1);
        console.log("Testing cookie set for nickname: "+getCookie("nickname"));
    });

    socket.on('load chatlog', function(msg){
        for(let i = 0; i<msg.length; i++){
            $('#messages').append($('<li>').text(msg[i]));
        }
    });

    socket.on('fetch cookie', function(msg){
        //Check existence of client side cookie, emit nickname value back to server
        nickname = getCookie("nickname");
        if(nickname===""){
            console.log("Cookie not found, sending to server empty string.");
        }
        console.log("Cookie found, sending nickname "+nickname+" to server.");
        socket.emit('receive cookie', nickname);
    });
    
    socket.on('update userlist', function(msg){
        $('#user-list').empty();
        for(let i = 0; i<msg.length; i++){
            $('#user-list').append($('<li>').css('color',msg[i].socket_nickname_color).text(msg[i].socket_nickname));
        }
        
    });

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }
  });