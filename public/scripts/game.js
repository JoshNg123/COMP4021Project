const Game = (function () {
  let player1; 
  let player2; 
  let context; 
  let cv; 
  let gameArea; 
  let bombs = [];  
  const start = (pairing) => {
    // Initialize the game
    //Game.initialize();
    cv = $("canvas").get(0);
    context = cv.getContext("2d");
    gameArea = BoundingBox(context, 200, 60, 420, 800);
    player1 = Player(context, 427, 210, gameArea);
    player2 = Player(context, 427, 410, gameArea);
    const playername = Authentication.getUser().username; 
    const {opponent, player} = pairing; 

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
        if(player1.getBoundingBox().isPointInBox(x,y) || player2.getBoundingBox().isPointInBox(x,y)){
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


      $(document).on("keydown", function(event) {
        pressed_key = event.keyCode
        if (playername == opponent){
          Socket.sendKeyInfoDown(pressed_key, "player1", opponent, player); 
        }
        else {
          Socket.sendKeyInfoDown(pressed_key, "player2", opponent, player); 
        }
      });

      $(document).on("keyup", function(event) {
        pressed_key = event.keyCode
        if (playername == opponent){
          Socket.sendKeyInfoUp(pressed_key, "player1", opponent, player); 
        }
        else {
          Socket.sendKeyInfoUp(pressed_key, "player2", opponent, player); 
        }
      });

      requestAnimationFrame(doFrame);
    }

    requestAnimationFrame(doFrame);
  };

  const move_player  = (key, pressed_player, opponent, player) =>{
    pressed_key = key
    if (pressed_player == "player1"){
      switch(pressed_key){
        case 37: 
            player1.move(1);
            break; 
        case 39: 
            player1.move(3);
            break; 
        case 32:
            Socket.shoot(pressed_player, opponent, player); 
            break; 
      }
    }
    else{
      switch(pressed_key){
        case 37: 
            player2.move(1);
            break; 
        case 39: 
            player2.move(3);
            break; 
        case 32:
          Socket.shoot(pressed_player, opponent, player); 
          break; 
      }
    }
    //requestAnimationFrame(doFrame);
  }

  const stop_player  = (key, pressed_player, opponent, player) =>{
    pressed_key = key
    if (pressed_player == "player1"){
      switch(pressed_key){
        case 37: 
            player1.stop(1);
            break; 
        case 39: 
            player1.stop(3);
            break; 
      }
    }
    else{
      switch(pressed_key){
        case 37: 
            player2.stop(1);
            break; 
        case 39: 
            player2.stop(3);
            break;  
      }
    }
    //requestAnimationFrame(doFrame);

  }

  let bombTimerId1 = null;
  let bombTimerId2 = null;


  const shoot = (pressed_player, opponent, player) =>{
    if (pressed_player === "player1" && !bombTimerId1) {
      let { x, y } = player1.getPos();
      y = y + 50
      const bomb = Bomb(context, x, y, gameArea);
      bombs.push(bomb);
      bomb.move(1);
      
      bombTimerId1 = setTimeout(() => {
        bombTimerId1 = null;
      }, 2000); // Set the desired time frame (2 seconds in this example)
    }
    else if (pressed_player === "player2" && !bombTimerId2){
        let {x, y} = player2.getPos(); 
        y = y - 50; 
        const bomb = Bomb(context, x, y, gameArea); 
        bombs.push(bomb)
        bomb.move(2); 

        bombTimerId2 = setTimeout(() => {
          bombTimerId2 = null;
        }, 2000); // Set the desired time frame (2 seconds in this example)
    }
  }

  return { start, move_player, stop_player, shoot};
  
})();
