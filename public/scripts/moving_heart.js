const Moving_Heart = function (ctx, x, y){
    const sequences = {
        moving_heart: {x: 0, y: 16, width: 16, height: 16, count: 8, timing: 100, loop: true }
    }; 

    const sprite = Sprite(ctx, x, y); 

    sprite
        .setSequence(sequences.moving_heart)
        .setScale(2)
        .setShadowScale({ x: 0.75, y: 0.2 })
        .useSheet("./assets/object_sprites.png");
      


    let birthTime = performance.now();

    const getAge = function(now) {
        return now - birthTime;
    };

    const randomize = function(area) {
        birthTime = performance.now();

        const yBoundary = { min: 250, max: 370 };
        const xBoundary = { min: 60, max: 900 };

        const y = Math.floor(Math.random() * (yBoundary.max - yBoundary.min + 1)) + yBoundary.min;
        const x = Math.floor(Math.random() * (xBoundary.max - xBoundary.min + 1)) + xBoundary.min;


        //const {x, y} = area.randomPoint();
        sprite.setXY(x, y);
    };

    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.drawObject,
        update: sprite.update
    };

}