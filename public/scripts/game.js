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
  let heartarr1 = []; 
  let heartarr2 = []; 
  const totalGameTime = 180; 
  let gameStartTime = 0; 

  const start = (pairing) => {
    // Initialize the game
    cv = $("canvas").get(0);
    context = cv.getContext("2d");
    gameArea = BoundingBox(context, 200, 60, 420, 800);
    player1 = Player(context, 427, 210, gameArea);
    player2 = Player(context, 427, 410, gameArea);
    const playername = Authentication.getUser().username;
    const { opponent, player } = pairing;
    //use this heart
    for (let i =0; i < player1.get_life(); i++){
      let index = i*20; 
      heartarr1[i] = Heart(context, 20 + index, 20, gameArea); 
    }
    for (let i = 0; i < player2.get_life(); i++){
      let index = i*20; 
      heartarr2[i] = Heart(context, 20 + index, 450, gameArea); 
    }



    function doFrame(now) {


      player1.update(now);
      player2.update(now);

      for (let i =0; i < heartarr1.length; i++){
        heartarr1[i].update(now)
      } 

      for (let i =0; i < heartarr2.length; i++){
        heartarr2[i].update(now)
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
      }
      context.clearRect(0, 0, cv.width, cv.height);

      if (gameStartTime == 0) gameStartTime = now;
      /* Update the time remaining */
      const gameTimeSoFar = now - gameStartTime;
      const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);

      context.fillStyle = "white";
      context.font = "20px 'Comic Sans MS'";
      context.fillText("Battle Ends In", 680, 40);
      context.fillStyle = "white";
      context.font = "30px 'Comic Sans MS'";
      context.fillText(timeRemaining, 720, 70);

      if (timeRemaining <= 0 || player1.get_life() == 0 || player2.get_life() == 0){
        $("#gameover-overlay").show(); 
        context.clearRect(0, 0, cv.width, cv.height);
        return; 
      }

      player1.draw(opponent);
      player2.draw(player);

      for (let i =0; i < player1.get_life(); i++){
        heartarr1[i].draw(); 

      }

      for (let i =0; i < player2.get_life(); i++){
        heartarr2[i].draw(); 

      }
      //heart2.draw(player2.get_life()); 
      // heart1.draw(player1.get_life()); 
      // heart1.draw(player1.get_life()); 

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
