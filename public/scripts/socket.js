const Socket = (function () {
  // This stores the current Socket.IO socket
  let socket = null;

  // This function gets the socket from the module
  const getSocket = function () {
    return socket;
  };

  // This function connects the server and initializes the socket
  const connect = function () {
    socket = io();

    // Wait for the socket to connect successfully
    socket.on("connect", () => {
      // Get the online user list
      socket.emit("get users");
    });

    // Set up the users event
    socket.on("users", (onlineUsers) => {
      onlineUsers = JSON.parse(onlineUsers);

      // Show the online users
      OnlinePlayersArea.update(onlineUsers);
    });

    // // Set up the add user event
    // socket.on("add user", (user) => {
    //   user = JSON.parse(user);

    //   // Add the online user
    //   OnlinePlayersArea.addUser(user);
    // });

    // Set up the remove user event
    socket.on("remove user", (user) => {
      user = JSON.parse(user);
      // Remove the online user
      OnlinePlayersArea.removeUser(user);
    });

    socket.on("match", (pairing) => {
      pairing = JSON.parse(pairing);
      AcceptChallengeModal.createModal(pairing);
    });

    socket.on("challenge accepted", (pairing) => {
      pairing = JSON.parse(pairing);
      AcceptChallengeModal.hide();
      WaitingForOpponentModal.hide();
      CountDown.start(pairing);
    });

    socket.on("challenge rejected", (pairing) => {
      pairing = JSON.parse(pairing);
      AcceptChallengeModal.hide();
      WaitingForOpponentModal.hide();
      CountDown.reject(pairing);
      PlayerPanel.show();
    });

    socket.on("pressed_key down", (key_info) => {
      const { pressed_key, pressed_player, opponent, player } =
        JSON.parse(key_info);
      console.log("pressed_key down", key_info);
      Game.move_player(pressed_key, pressed_player, opponent, player);
    });

    socket.on("pressed_key up", (key_info) => {
      const { pressed_key, pressed_player, opponent, player } =
        JSON.parse(key_info);
      Game.stop_player(pressed_key, pressed_player, opponent, player);
    });

    socket.on("shooting", (shoot_info) => {
      const { pressed_player, opponent, player } = JSON.parse(shoot_info);
      Game.shoot(pressed_player, opponent, player);
    });
  };

  const sendChallenge = function (player, opponent) {
    socket.emit("challenge", JSON.stringify({ player, opponent }));
  };

  const acceptChallenge = function (pairing) {
    socket.emit("accept challenge", JSON.stringify(pairing));
  };

  const rejectChallenge = function (pairing) {
    socket.emit("reject challenge", JSON.stringify(pairing));
  };

  // This function disconnects the socket from the server
  const disconnect = function () {
    socket.disconnect();
    socket = null;
  };

  //This function send keydown information to the server
  const sendKeyInfoDown = function (
    pressed_key,
    pressed_player,
    opponent,
    player
  ) {
    socket.emit(
      "keypress info down",
      JSON.stringify({ pressed_key, pressed_player, opponent, player })
    );
  };

  //This function send keyup information to the server
  const sendKeyInfoUp = function (
    pressed_key,
    pressed_player,
    opponent,
    player
  ) {
    socket.emit(
      "keypress info up",
      JSON.stringify({ pressed_key, pressed_player, opponent, player })
    );
  };

  //This function sends information to server that a player shoots
  const shoot = function (pressed_player, opponent, player) {
    socket.emit(
      "shoot info",
      JSON.stringify({ pressed_player, opponent, player })
    );
  };

  return {
    getSocket,
    connect,
    disconnect,
    sendChallenge,
    acceptChallenge,
    rejectChallenge,
    sendKeyInfoDown,
    sendKeyInfoUp,
    shoot,
  };
})();
