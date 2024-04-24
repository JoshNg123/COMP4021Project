const express = require("express");
const app = express();
const session = require("express-session");
const authRoutes = require("./routes/auth");

const chatSession = session({
  secret: "Natcha is cute",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 300000 },
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

io.on("connection", (socket) => {
  if (socket.request.session.user) {
    onlinePlayers[socket.request.session.user.username] = {
      username: socket.request.session.user.username,
    };
    console.log(onlinePlayers);
    io.emit("add user", JSON.stringify(socket.request.session.user));
  }

  socket.on("disconnect", () => {
    if (socket.request.session.user) {
      if (onlinePlayers[socket.request.session.user.username]) {
        delete onlinePlayers[socket.request.session.user.username];
      }
    }
    io.emit("remove user", JSON.stringify(socket.request.session.user));
  });

  socket.on("get users", () => {
    io.emit("users", JSON.stringify(onlinePlayers));
  });
});
