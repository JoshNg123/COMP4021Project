const Bomb = function (ctx, x, y, gameArea) {
  const sequences = {
    bomb: {
      x: 64,
      y: 112,
      width: 16,
      height: 16,
      count: 9,
      timing: 200,
      loop: true,
    },
    moveUp: {
      x: 64,
      y: 112,
      width: 16,
      height: 16,
      count: 9,
      timing: 50,
      loop: true,
    },
    moveDown: {
      x: 64,
      y: 112,
      width: 16,
      height: 16,
      count: 9,
      timing: 50,
      loop: true,
    },
  };

  const sprite = Sprite(ctx, x, y);

  sprite
    .setSequence(sequences.bomb)
    .setScale(2)
    .setShadowScale({ x: 0.75, y: 0.2 })
    .useSheet("./assets/object_sprites.png");

  let direction = 0;

  let speed = 1000;

  const move = function (dir) {
    if (dir >= 1 && dir <= 4 && dir != direction) {
      switch (dir) {
        case 1:
          sprite.setSequence(sequences.moveUp);
          break;
        case 2:
          sprite.setSequence(sequences.moveDown);
          break;
      }
      direction = dir;
    }
  };

  const update = function (time) {
    /* Update the player if the player is moving */
    if (direction != 0) {
      let { x, y } = sprite.getXY();

      /* Move the player */
      switch (direction) {
        case 1:
          y += speed / 60;
          break;
        case 2:
          y -= speed / 60;
          break;
      }
      sprite.setXY(x, y);
    }

    /* Update the sprite object */
    sprite.update(time);
  };

  return {
    getXY: sprite.getXY,
    setXY: sprite.setXY,
    getBoundingBox: sprite.getBoundingBox,
    draw: sprite.drawObject,
    update: update,
    move: move,
  };
};
