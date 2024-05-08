const Moving_Heart = function (ctx, x, y) {
  const sequences = {
    moving_heart: {
      x: 0,
      y: 16,
      width: 16,
      height: 16,
      count: 8,
      timing: 100,
      loop: true,
    },
  };

  const sprite = Sprite(ctx, x, y);

  sprite
    .setSequence(sequences.moving_heart)
    .setScale(2)
    .setShadowScale({ x: 0.75, y: 0.2 })
    .useSheet("./assets/object_sprites.png");

  let birthTime = performance.now();

  let seed = 1;

  const getAge = function (now) {
    return now - birthTime;
  };

  const random = () => {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const randomize = function (area) {
    birthTime = performance.now();

    // Create our own random generator

    const yBoundary = { min: 250, max: 370 };
    const xBoundary = { min: 60, max: 800 };

    const y =
      Math.floor(random() * (yBoundary.max - yBoundary.min + 1)) +
      yBoundary.min;
    const x =
      Math.floor(random() * (xBoundary.max - xBoundary.min + 1)) +
      xBoundary.min;

    sprite.setXY(x, y);
    return [x, y];
  };

  return {
    getXY: sprite.getXY,
    setXY: sprite.setXY,
    getAge: getAge,
    getBoundingBox: sprite.getBoundingBox,
    randomize: randomize,
    draw: sprite.drawObject,
    update: sprite.update,
  };
};

const Freeze = function (ctx, x, y) {
  const sequences = {
    freeze: {
      x: 128,
      y: 160,
      width: 16,
      height: 16,
      count: 1,
      timing: 100,
      loop: true,
    },
  };

  const sprite = Sprite(ctx, x, y);

  sprite
    .setSequence(sequences.freeze)
    .setScale(2)
    .setShadowScale({ x: 0.75, y: 0.2 })
    .useSheet("./assets/object_sprites.png");

  let birthTime = performance.now();

  let seed = 50;

  const getAge = function (now) {
    return now - birthTime;
  };

  const random = () => {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const randomize = function (area) {
    birthTime = performance.now();

    // Create our own random generator

    const yBoundary = { min: 250, max: 370 };
    const xBoundary = { min: 60, max: 800 };

    const y =
      Math.floor(random() * (yBoundary.max - yBoundary.min + 1)) +
      yBoundary.min;
    const x =
      Math.floor(random() * (xBoundary.max - xBoundary.min + 1)) +
      xBoundary.min;

    sprite.setXY(x, y);
    return [x, y];
  };

  return {
    getXY: sprite.getXY,
    setXY: sprite.setXY,
    getAge: getAge,
    getBoundingBox: sprite.getBoundingBox,
    randomize: randomize,
    draw: sprite.drawObject,
    update: sprite.update,
  };
};

const ShootFaster = function (ctx, x, y) {
  const sequences = {
    shoot_faster: {
      x: 112,
      y: 64,
      width: 16,
      height: 16,
      count: 1,
      timing: 100,
      loop: true,
    },
  };

  const sprite = Sprite(ctx, x, y);

  sprite
    .setSequence(sequences.shoot_faster)
    .setScale(2)
    .setShadowScale({ x: 0.75, y: 0.2 })
    .useSheet("./assets/object_sprites.png");

  let birthTime = performance.now();

  let seed = 100;

  const getAge = function (now) {
    return now - birthTime;
  };

  const random = () => {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const randomize = function () {
    birthTime = performance.now();

    // Create our own random generator

    const yBoundary = { min: 250, max: 370 };
    const xBoundary = { min: 60, max: 800 };

    const y =
      Math.floor(random() * (yBoundary.max - yBoundary.min + 1)) +
      yBoundary.min;
    const x =
      Math.floor(random() * (xBoundary.max - xBoundary.min + 1)) +
      xBoundary.min;

    sprite.setXY(x, y);
    return [x, y];
  };

  return {
    getXY: sprite.getXY,
    setXY: sprite.setXY,
    getAge: getAge,
    getBoundingBox: sprite.getBoundingBox,
    randomize: randomize,
    draw: sprite.drawObject,
    update: sprite.update,
  };
};
