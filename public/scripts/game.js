const Game = (function () {
  let player1; 
  let player2; 
  const start = (pairing) => {
    // Initialize the game
    //Game.initialize();
    const cv = $("canvas").get(0);
    const context = cv.getContext("2d");
    const gameArea = BoundingBox(context, 200, 60, 420, 800);
    player1 = Player(context, 427, 210, gameArea);
    player2 = Player(context, 427, 410, gameArea);
    const playername = Authentication.getUser().username; 
    const {opponent, player} = pairing; 

    function doFrame(now) {
       player1.update(now);
       player2.update(now); 
       context.clearRect(0, 0, cv.width, cv.height);

       player1.draw(opponent);
       player2.draw(player); 


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

  const move_player  = (key, player) =>{
    pressed_key = key
    if (player == "player1"){
      switch(pressed_key){
        case 37: 
            player1.move(1);
            break; 
        case 39: 
            player1.move(3);
            break; 
        case 32:
            player1.speedUp(); 
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
            player2.speedUp(); 
            break; 
      }
    }
    requestAnimationFrame(doFrame);

  }

  const stop_player  = (key, player) =>{
    pressed_key = key
    if (player == "player1"){
      switch(pressed_key){
        case 37: 
            player1.stop(1);
            break; 
        case 39: 
            player1.stop(3);
            break; 
        case 32:
            player1.slowDown(); 
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
        case 32:
            player2.slowDown(); 
            break; 
      }
    }
    requestAnimationFrame(doFrame);

  }
  return { start, move_player, stop_player};
})();
