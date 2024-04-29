const Game = (function () {
  let player1;
  let player2;
  let context;
  let cv;
  let gameArea;
  let bombs = [];
  let canMoveOpponent = true;
  let canMovePlayer = true;
  let canShootOpponent = true;
  let canShootPlayer = true;

  const start = (pairing) => {
    // Initialize the game
    cv = $("canvas").get(0);
    context = cv.getContext("2d");
    gameArea = BoundingBox(context, 200, 60, 420, 800);
    player1 = Player(context, 427, 210, gameArea);
    player2 = Player(context, 427, 410, gameArea);
    const playername = Authentication.getUser().username;
    const { opponent, player } = pairing;

    function doFrame(now) {
      player1.update(now);
      player2.update(now);

      for (let i = 0; i < bombs.length; i++) {
        bombs[i].update(now);
        const { x, y } = bombs[i].getXY();
        if (y <= gameArea.getTop() || y >= gameArea.getBottom()) {
          // Remove from array
          bombs.splice(i, 1);
          // Decrement `i` to account for the removed element
          i--;
          delete bombs[i];
        }
        if (player1.getBoundingBox().isPointInBox(x, y)) {
          bombs.splice(i, 1);
          // Decrement `i` to account for the removed element
          i--;
          delete bombs[i];
        } else if (player2.getBoundingBox().isPointInBox(x, y)) {
          bombs.splice(i, 1);
          // Decrement `i` to account for the removed element
          i--;
          delete bombs[i];
        }
      }
      context.clearRect(0, 0, cv.width, cv.height);

      player1.draw(opponent);
      player2.draw(player);

      for (let i = 0; i < bombs.length; i++) {
        bombs[i].draw();
      }

      $(document).on("keydown", function (event) {
        pressed_key = event.keyCode;
        if (playername == opponent && canMoveOpponent) {
          Socket.sendKeyInfoDown(pressed_key, "player1", opponent, player);
          canMoveOpponent = false;
          setTimeout(() => {
            canMoveOpponent = true;
          }, 50);
        }
        if (playername == player && canMovePlayer) {
          Socket.sendKeyInfoDown(pressed_key, "player2", opponent, player);
          canMovePlayer = false;
          setTimeout(() => {
            canMovePlayer = true;
          }, 50);
        }
      });

      $(document).on("keyup", function (event) {
        pressed_key = event.keyCode;
        if (playername == opponent) {
          Socket.sendKeyInfoUp(pressed_key, "player1", opponent, player);
        } else {
          Socket.sendKeyInfoUp(pressed_key, "player2", opponent, player);
        }
      });

      $(document).on("keypress", function (event) {
        if (event.keyCode == 32) {
          if (playername == opponent && canShootOpponent) {
            Socket.shoot("player1", opponent, player);
            canShootOpponent = false;
            setTimeout(() => {
              canShootOpponent = true;
            }, 2000);
          } else if (playername == player && canShootPlayer) {
            Socket.shoot("player2", opponent, player);
            canShootPlayer = false;
            setTimeout(() => {
              canShootPlayer = true;
            }, 2000);
          }
        }
      });

      requestAnimationFrame(doFrame);
    }

    requestAnimationFrame(doFrame);
  };

  const move_player = (key, pressed_player, opponent, player) => {
    pressed_key = key;
    if (pressed_player == "player1") {
      switch (pressed_key) {
        case 37:
          player1.move(1);
          break;
        case 39:
          player1.move(3);
          break;
      }
    } else {
      switch (pressed_key) {
        case 37:
          player2.move(1);
          break;
        case 39:
          player2.move(3);
          break;
      }
    }
  };

  const stop_player = (key, pressed_player, opponent, player) => {
    pressed_key = key;
    if (pressed_player == "player1") {
      switch (pressed_key) {
        case 37:
          player1.stop(1);
          break;
        case 39:
          player1.stop(3);
          break;
      }
    } else {
      switch (pressed_key) {
        case 37:
          player2.stop(1);
          break;
        case 39:
          player2.stop(3);
          break;
      }
    }
  };

  const shoot = (pressed_player, opponent, player) => {
    if (pressed_player === "player1") {
      let { x, y } = player1.getPos();
      y = y + 50;
      const bomb = Bomb(context, x, y, gameArea);
      bombs.push(bomb);
      bomb.move(1);
    } else if (pressed_player === "player2") {
      let { x, y } = player2.getPos();
      y = y - 50;
      const bomb = Bomb(context, x, y, gameArea);
      bombs.push(bomb);
      bomb.move(2);
    }
  };
  return { start, move_player, stop_player, shoot };
})();
