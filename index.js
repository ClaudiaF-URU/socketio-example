let app = require("express")();
let http = require("http").Server(app);
let io = require("socket.io")(http);

io.sockets.on("connection", socket => {
  console.log("connected");
  socket.on("disconnect", function() {
    console.log('bye')
    let index = users[socket.room].findIndex(el => el === socket.nickname);
    users[socket.room].splice(index, 1);

    io.sockets.in(socket.room).emit("in-chat", {
      nickname: socket.nickname,
      event: "left",
      room: socket.room,
      users: users[socket.room]
    });
  });

  socket.on("open-chat", chatInfo => {
    console.log(chatInfo)
    socket.nickname = chatInfo.nickname;
    socket.room = chatInfo.room;
    socket.join(chatInfo.room);

    if (users.hasOwnProperty(chatInfo.room)) {
      users[chatInfo.room].push(chatInfo.nickname);
    } else {
      users[chatInfo.room] = [];
      users[chatInfo.room].push(chatInfo.nickname);
    }

    io.sockets.in(socket.room).emit("in-chat", {
      nickname: chatInfo.nickname,
      event: "joined",
      room: chatInfo.room,
      users: users[chatInfo.room]
    });
  });

  socket.on("send-msg", message => {
    io.sockets.in(socket.room).emit("message", {
      text: message.text,
      from: socket.nickname,
      created: new Date()
    });
  });
});

var users = {};

var port = process.env.PORT || 3001;

http.listen(port, function() {
  console.log("listening in http://localhost:" + port);
});
