const Heart = function (ctx, x, y, gameArea) {
  const sequences = {
    heart: {
      x: 0,
      y: 0,
      width: 299,
      height: 295,
      count: 1,
      timing: 200,
      loop: true,
    },
  };

  const sprite = Sprite(ctx, x, y);

  sprite
    .setSequence(sequences.heart)
    .setScale(0.1)
    .setShadowScale({ x: 0.75, y: 0.2 })
    .useSheet("./assets/full_heart.png");

  let direction = 0;

  let speed = 150;

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
