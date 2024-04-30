const Heart = function(ctx, x, y){
    const sequences = {
        heart : { x: 0, y: 0, width: 24, height: 25, count: 1, timing: 2000, loop: false}
    }

    const sprite = Sprite(ctx, x, y);

    sprite.setSequence(sequences.heart)
    .setScale(2)
    .setShadowScale({ x: 0.75, y: 0.20 })
    .useSheet("./assets/full_heart.png");

    return {
        draw: sprite.drawObject,
        update: sprite.update, 
 
    };

}