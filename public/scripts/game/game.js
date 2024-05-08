const Game = (function () {
  // Note: This is always in the view of the person who sends the game request
  let player1;
  let player2;

  let context;
  let cv;

  let gameArea;

  // Create an array of objects to store the bombs and who shot the bombs
  let bombs = [];

  let canMoveOpponent = true;
  let canMovePlayer = true;

  let canShootOpponent = true;
  let canShootPlayer = true;

  let heartarr1 = [];
  let heartarr2 = [];

  const totalGameTime = 180;

  let gameStartTime = 0;

  // Maximum age of the heart power-up in milliseconds
  let heartMaxAge = 10000;
  let movingHeartX = 300;
  let movingHeartY = 300;
  let heartExist = true;

  // Freeze Power up variables
  let freezeMaxAge = 12000;
  let freezeExist = true;
  let freezeX = 350;
  let freezeY = 250;
  let opponentfreeze = false;
  let playerfreeze = false;

  // Shoot variables
  let shootFasterMaxAge = 6000;
  let shootFasterX = 550;
  let shootFasterY = 350;
  let shootFasterExist = true;
  let playerShootFaster = false;
  let opponentShootFaster = false;
  let playerShootIntervalID;
  let opponentShootIntervalID;

  const start = (pairing) => {
    // Initialize the game
    cv = $("canvas").get(0);
    context = cv.getContext("2d");

    // Initialize the game area
    gameArea = BoundingBox(context, 200, 60, 420, 800);

    // Initialize the player objects
    // Player 1 is always the opponent and at the top
    // Player 2 is always the player and at the bottom
    player1 = Player(context, 427, 210, gameArea);
    player2 = Player(context, 427, 410, gameArea);

    // Initialize the moving heart object
    let moving_heart = Moving_Heart(
      context,
      movingHeartX,
      movingHeartY,
      gameArea
    );

    // Initialize the freeze object
    let freeze = Freeze(context, freezeX, freezeY, gameArea);

    // Initialize the shoot faster object
    let shootFaster = ShootFaster(
      context,
      shootFasterX,
      shootFasterY,
      gameArea
    );

    const playername = Authentication.getUser().username;

    const { opponent, player } = pairing;

    // Initialize the heart array for opponent
    for (let i = 0; i < player1.get_life(); i++) {
      let index = i * 20;
      heartarr1[i] = Heart(context, 20 + index, 20, gameArea);
    }

    // Initializze the heart array for player
    for (let i = 0; i < player2.get_life(); i++) {
      let index = i * 20;
      heartarr2[i] = Heart(context, 20 + index, 450, gameArea);
    }

    function doFrame(now) {
      //Do all the object updates here
      player1.update(now);
      player2.update(now);
      moving_heart.update(now);
      freeze.update(now);
      shootFaster.update(now);

      for (let i = 0; i < heartarr1.length; i++) {
        heartarr1[i].update(now);
      }

      for (let i = 0; i < heartarr2.length; i++) {
        heartarr2[i].update(now);
      }
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
          player1.decrease_life();
        } else if (player2.getBoundingBox().isPointInBox(x, y)) {
          bombs.splice(i, 1);
          // Decrement `i` to account for the removed element
          i--;
          delete bombs[i];
          player2.decrease_life();
        }

        if (moving_heart.getBoundingBox().isPointInBox(x, y)) {
          if (bombs[i].player == "player1" && player1.get_life() < 5) {
            player1.increase_life();
          } else if (bombs[i].player == "player2" && player2.get_life() < 5) {
            player2.increase_life();
          }
          bombs.splice(i, 1);
          i--;
          delete bombs[i];
          heartExist = false;
          context.clearRect(movingHeartX, movingHeartY, 16, 16);
        }

        if (freeze.getBoundingBox().isPointInBox(x, y)) {
          if (bombs[i].player == "player1") {
            playerfreeze = true;
            setTimeout(() => {
              playerfreeze = false;
            }, 5000);
          } else if (bombs[i].player == "player2") {
            opponentfreeze = true;
            setTimeout(() => {
              opponentfreeze = false;
            }, 5000);
          }
          bombs.splice(i, 1);
          i--;
          delete bombs[i];
          freezeExist = false;
          context.clearRect(freezeX, freezeY, 16, 16);
        }

        if (shootFaster.getBoundingBox().isPointInBox(x, y)) {
          if (bombs[i].player == "player1") {
            canShootOpponent = true;
            opponentShootFaster = true;
            clearTimeout(opponentShootIntervalID);
            setTimeout(() => {
              opponentShootFaster = false;
            }, 9000);
          } else if (bombs[i].player == "player2") {
            canShootPlayer = true;
            playerShootFaster = true;
            clearTimeout(playerShootIntervalID);
            setTimeout(() => {
              playerShootFaster = false;
            }, 9000);
          }
          bombs.splice(i, 1);
          i--;
          delete bombs[i];
          shootFasterExist = false;
          context.clearRect(shootFasterX, shootFasterY, 16, 16);
        }
      }

      if (moving_heart.getAge(now) > heartMaxAge) {
        movingHeartLocation = moving_heart.randomize(gameArea);
        movingHeartX = movingHeartLocation[0];
        movingHeartY = movingHeartLocation[1];
        heartExist = true;
      }

      if (freeze.getAge(now) > freezeMaxAge) {
        freezeLocation = freeze.randomize(gameArea);
        freezeX = freezeLocation[0];
        freezeY = freezeLocation[1];
        freezeExist = true;
      }

      if (shootFaster.getAge(now) > shootFasterMaxAge) {
        shootFasterLocation = shootFaster.randomize(gameArea);
        shootFasterX = shootFasterLocation[0];
        shootFasterY = shootFasterLocation[1];
        shootFasterExist = true;
      }

      context.clearRect(0, 0, cv.width, cv.height);

      if (gameStartTime == 0) gameStartTime = now;

      /* Update the time remaining */
      const gameTimeSoFar = now - gameStartTime;
      const timeRemaining = Math.ceil(
        (totalGameTime * 1000 - gameTimeSoFar) / 1000
      );

      context.fillStyle = "white";
      context.font = "20px 'Comic Sans MS'";
      context.fillText("Battle Ends In", 680, 40);
      context.fillStyle = "white";
      context.font = "30px 'Comic Sans MS'";
      context.fillText(timeRemaining, 720, 70);

      if (
        timeRemaining <= 0 ||
        player1.get_life() == 0 ||
        player2.get_life() == 0
      ) {
        // Reset values
        context.clearRect(0, 0, cv.width, cv.height);
        $(document).off("keydown");
        $(document).off("keypress");
        $(document).off("keyup");
        GameOver.showGameOver(opponent, player, player1, player2);

        bombs = [];

        gameStartTime = 0;

        canMoveOpponent = true;
        canMovePlayer = true;

        canShootOpponent = true;
        canShootPlayer = true;

        heartarr1 = [];
        heartarr2 = [];

        // Maximum age of the heart power-up in milliseconds
        movingHeartX = 300;
        movingHeartY = 300;
        heartExist = true;

        // Freeze Power up variables
        freezeExist = true;
        freezeX = 350;
        freezeY = 250;
        opponentfreeze = false;
        playerfreeze = false;

        // Shoot variables
        shootFasterX = 550;
        shootFasterY = 350;
        shootFasterExist = true;
        playerShootFaster = false;
        opponentShootFaster = false;
        return;
      }

      //Do all the drawings here
      player1.draw(opponent);
      player2.draw(player);

      if (heartExist) {
        moving_heart.draw();
      }

      if (freezeExist) {
        freeze.draw();
      }

      if (shootFasterExist) {
        shootFaster.draw();
      }

      for (let i = 0; i < player1.get_life(); i++) {
        heartarr1[i].draw();
      }

      for (let i = 0; i < player2.get_life(); i++) {
        heartarr2[i].draw();
      }

      for (let i = 0; i < bombs.length; i++) {
        bombs[i].draw();
      }

      requestAnimationFrame(doFrame);
    }

    //all the event listeners here
    $(document).on("keydown", function (event) {
      pressed_key = event.keyCode;
      if (
        playername == opponent &&
        canMoveOpponent &&
        !opponentfreeze &&
        (pressed_key == 37 || pressed_key == 39)
      ) {
        // console.log("Opponent is moving");
        Socket.sendKeyInfoDown(pressed_key, "player1", opponent, player);
        canMoveOpponent = false;
        setTimeout(() => {
          canMoveOpponent = true;
        }, 150);
      }
      if (
        playername == player &&
        canMovePlayer &&
        !playerfreeze &&
        (pressed_key == 37 || pressed_key == 39)
      ) {
        // console.log("Player is moving");
        Socket.sendKeyInfoDown(pressed_key, "player2", opponent, player);
        canMovePlayer = false;
        setTimeout(() => {
          canMovePlayer = true;
        }, 150);
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
        if (
          playername == opponent &&
          canShootOpponent &&
          !opponentShootFaster
        ) {
          // console.log("Opponent is shooting");
          Socket.shoot("player1", opponent, player);
          canShootOpponent = false;
          opponentShootIntervalID = setTimeout(() => {
            canShootOpponent = true;
          }, 2000);
        } else if (
          playername == player &&
          canShootPlayer &&
          !playerShootFaster
        ) {
          // console.log("Player is shooting");
          Socket.shoot("player2", opponent, player);
          canShootPlayer = false;
          playerShootIntervalID = setTimeout(() => {
            canShootPlayer = true;
          }, 2000);
        }
      }
      if (event.keyCode == 67 || event.keyCode == 99) {
        if (playername == opponent && canShootOpponent && opponentShootFaster) {
          Socket.shoot("player1", oppon1ent, player);
          canShootOpponent = false;
          opponentShootIntervalID = setTimeout(() => {
            canShootOpponent = true;
          }, 300);
        } else if (
          playername == player &&
          canShootPlayer &&
          playerShootFaster
        ) {
          Socket.shoot("player2", opponent, player);
          canShootPlayer = false;
          playerShootIntervalID = setTimeout(() => {
            canShootPlayer = true;
          }, 300);
        }
      }
    });

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
      const bomb = Bomb(context, x, y, pressed_player);
      bombs.push(bomb);
      bomb.move(1);
    } else if (pressed_player === "player2") {
      let { x, y } = player2.getPos();
      y = y - 50;
      const bomb = Bomb(context, x, y, pressed_player);
      bombs.push(bomb);
      bomb.move(2);
    }
  };

  return { start, move_player, stop_player, shoot };
})();
