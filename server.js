const express = require("express");
const app = express();
const session = require("express-session");
const authRoutes = require("./routes/auth");

const chatSession = session({
  secret: "Natcha is cute",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 30000000 },
});

app.use(chatSession);

app.use(express.static("public"));

app.use(express.json());

app.use("/", authRoutes);

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
  console.log("The chat server has started...");
});

io.use((socket, next) => {
  chatSession(socket.request, {}, next);
});

const onlinePlayers = {};
const sockets = {};

io.on("connection", (socket) => {
  if (socket.request.session.user) {
    onlinePlayers[socket.request.session.user.username] = {
      username: socket.request.session.user.username,
    };

    sockets[socket.request.session.user.username] = {
      username: socket.request.session.user.username,
      socketId: socket.id,
      socket: socket,
    };
    io.emit("add user", JSON.stringify(socket.request.session.user));
  }

  socket.on("disconnect", () => {
    if (socket.request.session.user) {
      if (onlinePlayers[socket.request.session.user.username]) {
        delete onlinePlayers[socket.request.session.user.username];
        delete sockets[socket.request.session.user.username];
      }
    }
    io.emit("remove user", JSON.stringify(socket.request.session.user));
  });

  socket.on("get users", () => {
    io.emit("users", JSON.stringify(onlinePlayers));
  });

  socket.on("challenge", (pairing) => {
    pairing = JSON.parse(pairing);
    sockets[pairing.opponent].socket.emit("match", JSON.stringify(pairing));
  });

  socket.on("accept challenge", (pairing) => {
    pairing = JSON.parse(pairing);
    sockets[pairing.player].socket.emit(
      "challenge accepted",
      JSON.stringify(pairing)
    );
    sockets[pairing.opponent].socket.emit(
      "challenge accepted",
      JSON.stringify(pairing)
    );
  });

  socket.on("reject challenge", (pairing) => {
    pairing = JSON.parse(pairing);
    sockets[pairing.player].socket.emit(
      "challenge rejected",
      JSON.stringify(pairing)
    );
    sockets[pairing.opponent].socket.emit(
      "challenge rejected",
      JSON.stringify(pairing)
    );
  });

  socket.on("keypress info down", (info) => {
    const { pressed_key, pressed_player, opponent, player } = JSON.parse(info);
    sockets[player].socket.emit(
      "pressed_key down",
      JSON.stringify({ pressed_key, pressed_player, opponent, player })
    );
    sockets[opponent].socket.emit(
      "pressed_key down",
      JSON.stringify({ pressed_key, pressed_player, opponent, player })
    );
  });

  socket.on("keypress info up", (info) => {
    const { pressed_key, pressed_player, opponent, player } = JSON.parse(info);
    sockets[player].socket.emit(
      "pressed_key up",
      JSON.stringify({ pressed_key, pressed_player, opponent, player })
    );
    sockets[opponent].socket.emit(
      "pressed_key up",
      JSON.stringify({ pressed_key, pressed_player, opponent, player })
    );
  });

  socket.on("shoot info", (info) => {
    const { pressed_player, opponent, player } = JSON.parse(info);
    //console.log(info)
    sockets[player].socket.emit(
      "shooting",
      JSON.stringify({ pressed_player, opponent, player })
    );
    sockets[opponent].socket.emit(
      "shooting",
      JSON.stringify({ pressed_player, opponent, player })
    );
  });
});
