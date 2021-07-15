class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leaderBoardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");

  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }

  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels = new Group();
    this.addSprites(fuels, 4, fuelImage, 0.02);

    powerCoins = new Group();
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);
  }

    addSprites(spriteGroup, numberOfSprites, spriteImage, scale){
      for(var i = 0; i<numberOfSprites; i ++){
        var x, y;

        x = random(width/2 +150, width/2 - 150);
        y = random(-height*4.5, height-400);
        var sprite = createSprite(x, y);
        sprite.addImage("sprite", spriteImage);
        sprite.scale = scale;
        spriteGroup.add(sprite);
  
  }
  }
 
  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetImage");
    this.resetTitle.position(width/2 +200, 40);

    this.resetButton.class("Reset Button");
    this.resetButton.position(width/2 + 230, 100);

    this.leaderBoardTitle.html("Leaderboard");
    this.leaderBoardTitle.class("Reset Text");
    this.leaderBoardTitle.position(width/3 -60, 40);

    this.leader1.class("Leaders Text");
    this.leader1.position(width/3 -50, 80);

    this.leader2.class("Leaders Text");
    this.leader2.position(width/3 -50, 130);

  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();

    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showFuelBar();
      this.showLeaderBoard();
      this.showLife();

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index===player.index){
          stroke(10);
          fill("blue");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);

          camera.position.y = cars[index - 1].position.y;
        }
      
      }
      if(this.playerMoving){
        player.positionY += 5;
        player.update();
      }

      this.handlePlayerControls();

      const finishLine = height*6 - 100;
      if(player.positionY > finishLine){
        gameState = 2;
        player.rank += 1;
        player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }

      drawSprites();
    }
  }

  handleFuel(index) {
    cars[index - 1].overlap(fuels, function(collector, collected){
      player.fuel = 185;
      collected.remove();
    })
  
    if(player.fuel > 0 && this.playerMoving){
      player.fuel -= 0.3;
    }

    if(player.fuel <= 0){
      gameState = 2;
      this.gameOver();
    }
  }
    handlePowerCoins(index) {
      cars[index - 1].overlap(powerCoins, function(collector, collected){
        player.score += 21;
        player.update();
        collected.remove();
      })
  
    }

    handleResetButton(){
      this.resetButton.mousePressed(()=>{
        database.ref("/").set({
          playerCount: 0,
          gameState: 0,
          players: {}
        })

        window.location.reload();

      })
    }

    showFuelBar(){
      push();
      image(fuelImage, width/2 - 130, height - player.positionY -350, 20, 20);
      fill("pink");
      rect(width/2 - 100, height - player.positionY - 350, 185, 20);
      fill("purple");
      rect(width/2 - 100, height - player.positionY - 350, player.fuel, 20);
      noStroke();
      pop();
    }

    showLife(){
      push();
      image(lifeImage, width / 2 - 130, height - player.positionY - 400, 20, 20);
      fill("red");
      rect(width/ 2 -100, height - player.positionY - 400, 185, 20);
      fill("yellow");
      rect(width/2 -100, height - player.positionY - 400, player.life, 20);
      pop();
    }

    showLeaderBoard(){
      var leader1, leader2;
      var players = Object.values(allPlayers);
      if(
        (players[0].rank===0 && players [1].rank===0)|| players[0].rank===1){
          leader1 =
           players[0].rank+
           "&emsp;"+
           players[0].name+
           "&emsp;"+
           players[0].score;
  
           leader2 =
           players[0].rank+
           "&emsp;"+
           players[0].name+
           "&emsp;"+
           players[0].score;
        }
        this.leader1.html(leader1);
        this.leader2.html(leader2);
    }

      handlePlayerControls(){
      // handling keyboard events
      if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
        player.update();
      }

      if (keyIsDown(LEFT_ARROW)&&player.positionX > width/3 - 50) {
        player.positionX -= 5;
        player.update();
      }

      if (keyIsDown(RIGHT_ARROW)&& player.positionX < width/2 +300) {
        player.positionX += 5;
        player.update();
      }
    }

    showRank(){
      swal({
      title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
      text: "You Reached the Finish Line Successfully",
      imageUrl: "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
      })
    }

    gameOver(){
    swal({
    title: `gameOver`,
    text: "Opps You Lost the Race!",
    imageUrl: "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
    imageSize: "100x100",
    confirmButtonText: "Thanks for Playing!"
    })
}

}
