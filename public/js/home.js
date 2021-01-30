/******************************************************************************************
The JS for the home/games page

TODO:
  make the next active button blink when a game is waiting
  also make the currently displayed game board blink when it is ready (probably just the top div)
*******************************************************************************************/

let thisUser;
let canvasElementArray = []; //the canvas elements of all of the canvases
let usersOnGoingGamesArray = [];
let canvasWidth;
let canvasHeight;
let currentMouseXPos = 0;       //the position of the currentX and Y positions of the mouse for when the page is reloaded (i.e. there are no mouse events)
let currentMouseYPos = 0;
let mouseClickListeners = [];
let mouseMoveListeners = [];
let currGameIndex = 0;
let needsUpdate = true;
let isChatOpen = false;



//const svgNS = 'http://www.w3.org/2000/svg' //the svg namespace used when creating svgs

function init(){
  getCurrUser();


}


/*********************************************
request asks who this user is getting the
entire user object back
**********************************************/
function getCurrUser(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        thisUser = JSON.parse(this.responseText); //this should be an array now?
        console.log(thisUser);
        setup();
        getUsersOnGoingGames();
        updatePageOnInterval(1000); //updates the page every x milliseconds
      }
   };

  xhttp.open("GET", "/thisUser", true);
  xhttp.send();
}

/*********************************************
request for all of the ongoing games that this user
is currently playing
after this we should have all of the information ready for this page

only redraws the page if there is new information on the page
**********************************************/
function getUsersOnGoingGames(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let tempArray = JSON.parse(this.responseText);
        //add and update arrays for the usersOnGoingGamesArray
        let isNewGame;
        console.log(needsUpdate);
        for(let i = 0; i < tempArray.length; i++){
          isNewGame = true;
          for(let k = 0; k < usersOnGoingGamesArray.length && isNewGame; k++){
            if(tempArray[i].id === usersOnGoingGamesArray[k].id){
              if(!isGameObjEqual(usersOnGoingGamesArray[k], tempArray[i])){
                needsUpdate = true;
                usersOnGoingGamesArray[k] = tempArray[i];
              }
              isNewGame = false;
            }
          }
          if(isNewGame){
            usersOnGoingGamesArray.push(tempArray[i]);
          }
        }
        //check for an update on any arrays that are finished
        let isCompleted;
        for(let i = 0; i < usersOnGoingGamesArray.length; i++){
          isCompleted = true;
          for(let k = 0; k < tempArray.length && isCompleted; k++){
            if(tempArray[k].id === usersOnGoingGamesArray[i].id){
              isCompleted = false;
            }
          }
          //update screen if the objects have changed or if there is nothing currently beiong displayed
          if(isCompleted ){
            updateGameObjWithId(usersOnGoingGamesArray[i].id);
          }
        }

        console.log("games array loaded: ");
        console.log(usersOnGoingGamesArray);
        console.log(needsUpdate);
        if(needsUpdate || document.getElementById('gameArea').childElementCount === 0){
          needsUpdate = false;
          createAllGames();
        }
      }
   };
  //here are the queries we need gamesSearch(requestingUser, gameId, isCompleted, isNotCompleted, user)
  xhttp.open("GET", "/games?gameId=&isCompleted=false&isNotCompleted=true&detail=full&user=" + thisUser.id , true); //I need the user object
  xhttp.send();
}
/*********************************************
forfeits the current game
**********************************************/
function forfeitGame(gameObj){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        getUsersOnGoingGames();
      }
   };
  xhttp.open("POST", "/games/" + gameObj.id + "/forfeit", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.setRequestHeader("Content-type", 'application/x-www-form-urlencoded');
  xhttp.send();
}

/*********************************************
request to update a particular game object given the
game object Id
**********************************************/
function updateGameObjWithId(gameId){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let gameObj = JSON.parse(this.responseText)
        for(let i = 0; i < usersOnGoingGamesArray.length; i++){
          if(usersOnGoingGamesArray[i].id === gameObj[0].id){
            if(!isGameObjEqual(usersOnGoingGamesArray[i], gameObj[0])){
              needsUpdate = true;
              usersOnGoingGamesArray[i] = gameObj[0];
            }
          }
        }
      }
   };
  //here are the queries we need gamesSearch(requestingUser, gameId, isCompleted, isNotCompleted, user)
  xhttp.open("GET", "/games?gameId=" + gameId +"&isCompleted=false&detail=full&isNotCompleted=false&user=" + thisUser.id , true); //I need the user object
  xhttp.send();
}

/*********************************************
sends an AJAX POST request to the server
to update the chat array for the game with
this gameId, by adding messageStr,

**********************************************/
function sendMessage(gameId, messageStr){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //do nothing?
      }
   };
  xhttp.open("POST", "/games/"+ gameId + "/chat", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.setRequestHeader("Content-type", 'application/x-www-form-urlencoded');
  xhttp.send("message=" + messageStr);
}


/*********************************************
updates the page every 0.5 seconds, I would probably
do this slower in real life, but when trying to play between myself
I'd rather not wait

this is called just once after thisUser object is created
**********************************************/
function updatePageOnInterval(interval){
  setInterval(getUsersOnGoingGames, interval);
}


/*********************************************
setups the pages menu, and notifications making
the links go to their appropriate places

also sets up the setting links
**********************************************/
function setup(){
  document.getElementById('homeButton').setAttribute('href', '/home/' + thisUser.id);
  document.getElementById('profileButton').setAttribute('href', '/profile/' + thisUser.id);

  document.getElementById('pageTitle').innerHTML= thisUser.id; //updating the notifications
  let titleLink = document.createElement('a');
  titleLink.setAttribute('href', '/profile/' + thisUser.id + '/friend-requests');
  titleLink.innerHTML = "(Friend Notifications)";
  document.getElementById('pageTitle').appendChild(titleLink);

  document.getElementById('addGame').setAttribute('href', '/home/' + thisUser.id + '/new-game');
  document.getElementById('addRandomGame').setAttribute('href', '/home/' + thisUser.id + '/new-random-game');

  console.log("Menu is loaded");
}




/*********************************************
calls the createNewGame function
there used to be more fuctionality to it, but it
didn't really work so I just reworked everything a bit
**********************************************/
function createAllGames(){
  console.log("created all games");

  document.getElementById('gameArea').innerHTML = "";
  if(usersOnGoingGamesArray.length !== 0){
    createNewGame(usersOnGoingGamesArray[currGameIndex]);
    createChatBox(usersOnGoingGamesArray[currGameIndex]);
  }
}


/*********************************************
add a chat box for use in the home.js file
I'll have to change a few things around when using this for
the gamesSearch
**********************************************/
function createChatBox(thisGame){
  //create the div that contains it all

  document.getElementById('divChatBox').innerHTML = '';
  document.getElementById('divChatBox').setAttribute('class', 'chatBoxContainer');

  //create the open/close chat button
  let buttonOpenClose = document.createElement('button');
  buttonOpenClose.setAttribute('class', 'openChatButton');
  console.log(isChatOpen);
  if(isChatOpen){
    //someTesting
    // thisGame.chat.push("1This is a message");
    // thisGame.chat.push("2This is a Response");



    //if chat is open display text
    let divTextBox = document.createElement('div');
    divTextBox.setAttribute('class', 'textBoxDiv');
    divTextBox.setAttribute('id', 'divTextBox');
    divTextBox.scrollTop = divTextBox.scrollHeight;
    //add each paragraph of the chat
    for(let i = thisGame.chat.length -1; i >= 0; i--){
      let newMessage = document.createElement('p');
      newMessage.innerHTML = thisGame.chat[i].slice(1); //ignore the first element
      //check who sent this message
      if((thisGame.chat[i].charAt(0) === '1' && thisUser.id === thisGame.playerOne) || (thisGame.chat[i].charAt(0) === '2' && thisUser.id === thisGame.playerTwo)){
        //then this user sent the message
        newMessage.setAttribute('class', 'currentUserMessage');
      }else{
        //then it was the oppent you sent the message
        newMessage.setAttribute('class', 'oppenentUserMessage');
      }

      divTextBox.appendChild(newMessage);
    }

    //add the text box to type into
    let divTypableMessage = document.createElement('div');
    divTypableMessage.setAttribute('class', 'typableMessageDiv');
    divTypableMessage.setAttribute('contenteditable', 'true');

    //this is the button to end the message
    let buttonSendMessage = document.createElement('button');
    buttonSendMessage.innerHTML = 'Send';
    buttonSendMessage.setAttribute('class','sendMessageButton');
    buttonSendMessage.addEventListener('click', function(){
      //TODO add an ajax request
      let messageStr = divTypableMessage.innerHTML
      if(messageStr.length >= 1){ //basic check to make sure this is a valid request
        //add the 1 or 2 to the beginning of the message for if this is player1 or player2 respectively
        if(thisUser.id === thisGame.playerOne){
          messageStr = '1' + messageStr;
        }else{
          messageStr = '2' + messageStr;
        }

        thisGame.chat.push(messageStr);       //so we get an instantaneous update
        sendMessage(thisGame.id, messageStr);   //an ajax request that sends a post to update the chat array for thisGame
        divTypableMessage.innerHTML = '';
        createChatBox(thisGame);
      }
    });

    divTypableMessage.addEventListener("keyup", function(event){
      if(event.keyCode === 13){   //then this is the enter key
        buttonSendMessage.click();
      }
    });

    //this is the div that contains both the button to Send and the message to send
    let divButtonMessageContainer = document.createElement('div');
    divButtonMessageContainer.setAttribute('class', 'buttonMessageContainer');
    //divButtonMessageContainer.appendChild(divTextBox);
    divButtonMessageContainer.appendChild(divTypableMessage);
    divButtonMessageContainer.appendChild(buttonSendMessage);



    buttonOpenClose.innerHTML = 'Close Chat';
    buttonOpenClose.addEventListener('click', function(){
      isChatOpen = false;
      createChatBox(thisGame);
    });

    //appending everything to the main div
    document.getElementById('divChatBox').appendChild(divTextBox);
    document.getElementById('divChatBox').appendChild(divButtonMessageContainer);

  }else{
    buttonOpenClose.innerHTML = 'Open Chat';
    buttonOpenClose.addEventListener('click', function(){
      isChatOpen = true;
      createChatBox(thisGame);
    });
  }


  document.getElementById('divChatBox').appendChild(buttonOpenClose);


  //append everything to the body
  document.body.appendChild(document.getElementById('divChatBox'));


}


/*********************************************
creates a new game board and displays it
**********************************************/
function createNewGame(thisGame, index){
  //creating the outer boxes and appending the elements
  //creating the you vs someone href link
  let hrefLink = document.createElement('p');
  hrefLink.setAttribute('class', 'centeredParagraph');
  //the vslink
  let vsHref = document.createElement('a');
  vsHref.style.color = "yellow";
  let vsText = document.createTextNode(thisGame.playerTwo);
  vsHref.appendChild(vsText);
  vsHref.title = thisGame.playerTwo;
  vsHref.setAttribute('href', '/profile/' +thisGame.playerTwo); //TODO: change this so that we can view the other player's profile
  //the linkvs
  let hrefVs = document.createElement('a');
  hrefVs.style.color = "red";
  let textVs = document.createTextNode(thisGame.playerOne);
  hrefVs.appendChild(textVs);
  hrefVs.title = thisGame.playerOne;
  hrefVs.setAttribute('href', '/profile/' + thisGame.playerOne);//change this so that we can view the other player's profile
  //the vs text in the middle
  let vs = document.createTextNode(" vs ");
  //adding the text before
  let gameTypeText;
  if(thisGame.visibility === 'pub'){
    gameTypeText = document.createTextNode(" playing a public game");
  }else if(thisGame.visibility === 'pri'){
    gameTypeText = document.createTextNode(" playing a private game");
  }else if(thisGame.visibility === 'fri'){
    gameTypeText = document.createTextNode(" playing a friends only game");
  }
  //adding all together into one object
  hrefLink.appendChild(hrefVs);
  hrefLink.appendChild(vs);
  hrefLink.appendChild(vsHref);
  hrefLink.appendChild(gameTypeText);
  //add a little div to make it look a bit nicer
  let headerDiv = document.createElement('div');
  headerDiv.setAttribute('class', 'gameHeader');
  headerDiv.appendChild(hrefLink)

  //add the game to this
  let backgroundGameElement = document.createElement('div');
  backgroundGameElement.setAttribute('class', 'gameBackground');

  //I was going to use SVGcreate the SVG Dyanmically but it seems a pain to do so... (like I literally couldn't a single person
  //who did the entire thing in JS)
  // creating the canvas
  let canvas = document.createElement('canvas');




  /********************************************************
  Adding all of the buttons and text at the bottom of the game
  *********************************************************/
  //add the buttons to the game area to swith between games
  let buttonPrevGame = document.createElement('button');
  buttonPrevGame.innerHTML = "Prev";
  buttonPrevGame.setAttribute('class', 'gameButton');
  buttonPrevGame.style.cssFloat = 'left';
  buttonPrevGame.addEventListener("click", function(){
    if(usersOnGoingGamesArray.length <= 1){
      //do nothing
    }else{
      if(currGameIndex - 1 < 0){
        currGameIndex = usersOnGoingGamesArray.length -1;
      }else{
        currGameIndex--;
      }
      createAllGames();
    }

  });

  let buttonActiveGame = document.createElement('button');
  buttonActiveGame.innerHTML = "Next Active";
  buttonActiveGame.setAttribute('class', 'gameButton');
  buttonActiveGame.addEventListener("click", function(){
    console.log(usersOnGoingGamesArray.length);
    if(usersOnGoingGamesArray.length <= 1){
      //do nothing
    }else{
      let startingGameIndex = currGameIndex;
      console.log(startingGameIndex);
      for(let i = startingGameIndex + 1; i < usersOnGoingGamesArray.length; i++){
        if(isThisPlayersTurn(usersOnGoingGamesArray[i]) && usersOnGoingGamesArray[i].winner === ''){
          currGameIndex = i;
          break;
        }
      }
      console.log("startingGameIndex = " + startingGameIndex + " ,currGameIndex = " + currGameIndex);
      if(startingGameIndex === currGameIndex){

        for(let i = 0; i <= startingGameIndex; i++){
          if(isThisPlayersTurn(usersOnGoingGamesArray[i]) && usersOnGoingGamesArray[i].winner === ''){
            currGameIndex = i;
            break;
          }
        }
      }

      createAllGames();
    }
  });

  let buttonNextGame = document.createElement('button');
  buttonNextGame.innerHTML = "Next";
  buttonNextGame.setAttribute('class', 'gameButton');
  buttonNextGame.style.cssFloat = 'right';
  buttonNextGame.addEventListener("click", function(){
    if(usersOnGoingGamesArray.length <= 1){
      //do nothing
    }else{
      if(currGameIndex + 1 >= usersOnGoingGamesArray.length){
        currGameIndex = 0;
      }else{
        currGameIndex++;
      }
      createAllGames();
    }

  });
  //add some text that prints out what game you are currently over top of
  let buttonDiv = document.createElement('div');
  buttonDiv.setAttribute('class', 'centeredParagraph');
  buttonDiv.appendChild(buttonPrevGame);
  buttonDiv.appendChild(buttonActiveGame);
  buttonDiv.appendChild(buttonNextGame);


  let buttonForfeit = document.createElement('button');
  buttonForfeit.innerHTML = "Forfeit Game";
  buttonForfeit.setAttribute('class', 'forfeitButton');
  buttonForfeit.addEventListener("click", function(){
    forfeitGame(thisGame);
  });


  /********************************************************
  Appending the header canvas and buttons to the main game element
  *********************************************************/
  backgroundGameElement.appendChild(canvas);

  let entireGameElement = document.createElement('div');
  entireGameElement.setAttribute('class', 'centerContent transWhite forDeleteGame');
  entireGameElement.appendChild(headerDiv);
  entireGameElement.appendChild(backgroundGameElement);
  entireGameElement.appendChild(buttonDiv);
  entireGameElement.appendChild(buttonForfeit);

  //adds it to the body of the HTML page
  document.getElementById('gameArea').appendChild(entireGameElement);




  canvasWidth = backgroundGameElement.clientWidth-10;
  canvasHeight = backgroundGameElement.clientHeight-10;

  //start messing with the canvas- I can't put this too
  canvas.width = canvasWidth;
  canvas.style.width = "canvasWidth" + "px";
  canvas.height = canvasHeight;
  canvas.style.height= "canvasHeight" + "px";
  //canvas.style.border = "3px solid";
  let canvasPos = canvas.getBoundingClientRect();
  draw(canvas, thisGame, Math.round(currentMouseXPos - canvasPos.left), Math.round(currentMouseYPos - canvasPos.top));

  //adding the event listener so that the canvas resizes when the window resizes
  window.onresize = function(){
    //canvas.clearRect(0, 0, canvas.width, canvas.height);
    canvasWidth = backgroundGameElement.clientWidth-10;
    canvasHeight = backgroundGameElement.clientHeight-10;
    canvas.width = canvasWidth;
    canvas.style.width = "canvasWidth" + "px";
    canvas.height = canvasHeight;
    canvas.style.height= "canvasHeight" + "px";

    //scale all of the drawings now?
    draw(canvas, thisGame, 0, 0);
  }



  canvas.addEventListener('mousemove', function(e){

    currentMouseXPos = e.clientX;
    currentMouseYPos = e.clientY;

    //console.log("currentMouseXPos = " +  currentMouseXPos + " currentMouseYPos = " + currentMouseYPos);

    canvasPos = canvas.getBoundingClientRect();
    let x = Math.round(currentMouseXPos - canvasPos.left);
    let y = Math.round(currentMouseYPos - canvasPos.top);
    //console.log("x = " + x + " , y = " + y);
    draw(canvas, thisGame, x, y);
  }, false); //I also could have use canvas.onmousedown = somefunctio() { ... } should I add the , false?

  //add an event listener to the canvas for when we click
  canvas.addEventListener('click', function(e){
    if(isThisPlayersTurn(thisGame)){

      canvasPos = canvas.getBoundingClientRect();
      let x = Math.round(e.clientX - canvasPos.left);
      let y = Math.round(e.clientY - canvasPos.top);

      onClickEvent(canvas, thisGame, x, y, canvasWidth, canvasHeight);
      draw(canvas, thisGame, x, y);
    }else{
      console.log("It is not your turn!");
    }
  }, false);


  return canvas; //adds the canvas to the canvasElementArray
}



/*********************************************
draws the actual game.
As everything needs to be drawn together this is
all in one function

to update the picture just call draw with the
appropirate canvas and gameObj
**********************************************/
function draw(canvas, gameObj, xPos, yPos){


  //fill the background of the canvas
  let canvasBackground = canvas.getContext("2d");
  canvasBackground.fillStyle = 'black';
  canvasBackground.globalAlpha = 1;
  canvasBackground.fillRect(0, 0, canvas.width, canvas.height);

  //start creating all of the little squares with circles missing
  let sqr1 = canvas.getContext('2d');
  sqr1.fillStyle = 'blue';
  //sqr1.globalAlpha = 1;
  sqr1.fillRect(10, 10, canvasWidth - 20, canvasHeight - 20);

  //these variables a a bit obscure in name, but it is what I used when figuring this
  //out on paper
  let r;                  //radius of the circles
  let rW = canvasWidth/20; //x axis offset for the circles
  let rH = canvasHeight/20; //y axis offset for the circles
  let c = canvasWidth*0.03; //speration between circles in the x axis
  let d = canvasHeight*0.03; //speration between circles in the y axis
  if(canvasWidth < canvasHeight){
    r = canvasWidth/20;
  }else{
    r = canvasHeight/20;
  }

  for(let i = 0; i < 6; i++){
    for(let k = 0; k < 7; k++){
      let circ = canvas.getContext("2d");
      circ.beginPath();
      circ.arc(((2*c)+(k*c)+rW+(2*k*rW)), ((2*d)+(i*d)+rH+(2*i*rH)), r, 0, 2 * Math.PI);
      if(gameObj.board[(35 -i*7) + k] === 0 ){
        //this is empty
        circ.fillStyle = 'black';
      }else if(gameObj.board[(35 -i*7) + k] === 1 ){
        //this is player one
        circ.fillStyle = 'red';
      }else{
        //playerTwo
        circ.fillStyle = 'yellow';
      }
      circ.fill();
      circ.stroke();

    }
  }
  //black bottom rectangle
  let sqr2 = canvas.getContext('2d');
  sqr2.fillStyle = 'black';
  //sqr2.globalAlpha = 1;
  sqr2.fillRect(2*c, canvasHeight - (2*d + 2*rH), canvasWidth - (4*c), (2*d + 2*rH));


  //add the appropriate highlighting
  if(xPos != 0 && yPos != 0){
    //check for the right height of the yPos
    if((yPos >= 10+d && yPos <= (canvasHeight - (3*d + 2*rH + 20))) && (xPos >= 2*c) && (xPos <= canvasWidth - (2*c)) ) {
      //there has to be a more elegant way of doing this...
      let xStart = 0;
      let offSet = 5;
      let startOffSet = 0;
      let endOffSet = 0;
      //finds out which section this xPos belongs to
      for(let k = 1; k <= 7; k++){
        if( xPos < 3/2*c + k*(2*rW + c)){
          xStart = k - 1;
          break;
        }
      }
      if(xStart === 0){
        startOffSet = 10;
        endOffSet = -10;
      }
      if(xStart === 6){
        endOffSet = -10;
      }


      let highLight = canvas.getContext('2d');
      highLight.fillStyle = 'white';
      highLight.globalAlpha = 0.3;
      highLight.fillRect(((3/2*c + xStart*(2*rW + c) -offSet) + startOffSet),( 10 + d), (2*rW + c + 2*offSet + endOffSet), (canvasHeight - (3*d + 2*rH + 20)));

    }
  }

  //add the winner text
  if(gameObj.winner !== ''){
    //then display the winner
    let  str = gameObj.winner + " Won";
    let fontSize = canvas.width/(str.length/2 +2); //don't know how well this'll work...
    let winnerText = canvas.getContext('2d');
    winnerText.font = fontSize + "px Arial";
    if(gameObj.winner === gameObj.playerOne){
      winnerText.fillStyle = "red";
    }else{
      winnerText.fillStyle = "yellow";
    }
    winnerText.textAlign = "center";
    winnerText.globalAlpha = 0.8;
    winnerText.fillText(str, canvas.width/2, canvas.height/2 );
  }

}

/*********************************************
the function that adds the tile to the game Board array
and then sends it to the server
**********************************************/
function onClickEvent(canvas, gameObj, xPos, yPos,canvasWidth, canvasHeight){
  //these are the same from the draw function... not the best practice...
  let r;                  //radius of the circles
  let rW = canvasWidth/20; //x axis offset for the circles
  let rH = canvasHeight/20; //y axis offset for the circles
  let c = canvasWidth*0.03; //speration between circles in the x axis
  let d = canvasHeight*0.03; //speration between circles in the y axis
  if(canvasWidth < canvasHeight){
    r = canvasWidth/20;
  }else{
    r = canvasHeight/20;
  }




  if(xPos != 0 && yPos != 0){
    //check for the right height of the yPos
    if((yPos >= 10+d && yPos <= (canvasHeight - (3*d + 2*rH + 20))) && (xPos >= 2*c) && (xPos <= canvasWidth - (2*c)) ) {
      //there has to be a more elegant way of doing this...
      let xStart = 0;
      let offSet = 1;
      let startOffSet = 0;
      let endOffSet = 0;
      //finds out which section this xPos belongs to
      for(let k = 1; k <= 7; k++){
        if( xPos < 3/2*c + k*(2*rW + c)){
          xStart = k - 1;
          break;
        }
      }
      //xStart == the section that we want to add the piece
      console.log(xStart);
      //now calculate where that piece can go in this column
      let tilePos;
      for(let i = 0; i<6; i++){
        if(gameObj.board[i*7 + xStart] === 0){
          tilePos = i*7 + xStart;
          break;
        }
      }

      //add the tile to this game
      if(gameObj.playerOne === thisUser.id){
        //this is playerOne
        gameObj.board[tilePos] = 1;
      }else{
        gameObj.board[tilePos] = 3;
      }
      gameObj.turns.push(tilePos);


      //make a request to add the tile and then update the games
      console.log("tilePos = " + tilePos);
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            getUsersOnGoingGames();  //redraw everything
          }
       };
      xhttp.open("POST", "/games/"+ gameObj.id, true); //add a Math.random() to the query so that we do not get a cached result...
      xhttp.setRequestHeader("Content-type", 'application/x-www-form-urlencoded');
      xhttp.send("tilePos=" + tilePos + "&playerId=" + thisUser.id + "&gameId=" + gameObj.id); //I don't need to send the gameId here


    }
  }

}

/*********************************************
returns true if it is this player's turn to go
for the given game
**********************************************/
function isThisPlayersTurn(gameObj){
  //who's turn is it?
  let isPlayerOnesTurn;
  if((gameObj.turns.length % 2) === 0){
    //then it is playerOne's turn
    isPlayerOnesTurn = true;
  }else{
    isPlayerOnesTurn = false;
  }

  //is this thisUser, player1 or player2?
  let isPlayerOne;
  if(gameObj.playerOne === thisUser.id){
    //then this is playerONe
    isPlayerOne = true;
  }else{
    isPlayerOne = false;
  }

  if(isPlayerOnesTurn === isPlayerOne){
    return true;
  }else{
    return false;
  }

}
/*******************************************************************************
These functions were all pulled from the model, so that the client and the
model both use the same way to check for wins...

*******************************************************************************/

/*********************************************
return true if a player won from a horizontal plane
**********************************************/
function checkHorizontals(gameObj){
    let player1 = 0;
    let player2 = 0;
    for(let i = 0; i < myDB.BOARDSIZE; i++){
      if((i % 7 )=== 0){
        //new row
        player1 = 0;
        player2 = 0;
      }
      if(gameObj.board[i] === 1){
        //consequtive 1's
        player1++;
        player2 = 0;
      }else if(gameObj.board[i] === 3){
        //consequetive 3's (i.e. player 2)
        player2++;
        player1 = 0;
      }else{
        //then there was a 0 any run is gone
        player1 = 0;
        player2 = 0;
      }
      if(player1 > 3){
        return true;
      }
      if(player2 > 3){
        return true;
      }

    }
}

/*********************************************
return true if a player won in a Veritcal plane
**********************************************/
function checkVerticals(gameObj){
  let player1 = 0;
  let player2 = 0;
  for(let i = 0; i < 7; i++){ //the columns
    for(let k = 0; k < 6; k++ ){ //the rows
      if(gameObj.board[i+(k*7)] === 1){
        //consequtive 1's
        player1++;
        player2 = 0;
      }else if(gameObj.board[i+(k*7)] === 3){
        //consequetive 3's (i.e. player 2)
        player2++;
        player1 = 0;
      }else{
        //then there was a 0 any run is gone
        player1 = 0;
        player2 = 0;
      }
      if(player1 > 3){
        return true;
      }
      if(player2 > 3){
        return true;
      }
    }
  }
}

/*********************************************
return tur if a player won in a diagonal plane
**********************************************/
function checkDiagonals(gameObj){
  let player1 = 0;
  let player2 = 0;
  let diagonalStart = [14, 7, 0, 1, 2, 3]; //the bottom of each proper diagonal
  let diagonalSize = [4, 5, 6, 6, 5, 4];  //how many elements are in each diagonal
  for(let i = 0; i < 6; i++){
    for(let k = 0; k < diagonalSize[i]; k++){   //use diagonalStart[i] + k*8
      if(gameObj.board[diagonalStart[i] + k*8] === 1){
        //consequtive 1's
        player1++;
        player2 = 0;
      }else if(gameObj.board[diagonalStart[i] + k*8] === 3){
        //consequetive 3's (i.e. player 2)
        player2++;
        player1 = 0;
      }else{
        //then there was a 0 any run is gone
        player1 = 0;
        player2 = 0;
      }

      if(player1 > 3){
        return true;
      }
      if(player2 > 3){
        return true;
      }
    }
  }


  player1 = 0;
  player2 = 0;
  let diagonalStartLeftUp = [3, 4, 5, 6, 13, 20]; //the begging of each proper diagonal (from the bottom rising)
  for(let i = 0; i < 6; i++){
    for(let k = 0; k < diagonalSize[i]; k++){   //use diagonalStartLeftUp[i] + k*6
      if(gameObj.board[diagonalStartLeftUp[i] + k*6] === 1){
        //consequtive 1's
        player1++;
        player2 = 0;
      }else if(gameObj.board[diagonalStartLeftUp[i] + k*6] === 3){
        //consequetive 3's (i.e. player 2)
        player2++;
        player1 = 0;
      }else{
        //then there was a 0 any run is gone
        player1 = 0;
        player2 = 0;
      }

      if(player1 > 3){
        return true;
      }
      if(player2 > 3){
        return true;
      }
    }
  }

}

/*********************************************
return true if game has just been won (4 consequestive tiles in a row of the same )
*********************************************/
function isGameFinished(gameObj){
  if(gameObj.turns.length < 7){
    return false    //it is imposible to win a game when there has only been a total of 7 turns
  }
  if(checkHorizontals(gameObj) || checkVerticals(gameObj) || checkDiagonals(gameObj)){
    return true
  }
  return false;
}

/*********************************************
compares to check if two arrays are equilvalent (for the game board and turns array)
order matters
*********************************************/
function isArrayEqual(arrA, arrB){
  if (arrA.length !== arrB.length) {
    return false;
  }
  if(arrA === arrB){
    return true;
  }
  for( let i = 0; i < arrA.length; i++){
    if(arrA[i] !== arrB[i]){
      return false;
    }
  }
return true;
}

/*********************************************
compares two game objects together for equality (as defined by me!)
*********************************************/
function isGameObjEqual(gameObjA, gameObjB){
  if(gameObjA === gameObjB){
    return true;
  }
  if(!isArrayEqual(gameObjA.board, gameObjB.board)){
    return false;
  }

  if(!isArrayEqual(gameObjA.turns, gameObjB.turns)){

    return false;
  }

  if(!isArrayEqual(gameObjA.chat, gameObjB.chat)){

    return false;
  }

  if(gameObjA.id != gameObjB.id){
    return false;
  }
  if(gameObjA.visibility != gameObjB.visibility){
    return false;
  }
  if(gameObjA.playerOne != gameObjB.playerOne){
    return false;
  }
  if(gameObjA.playerTwo != gameObjB.playerTwo){
    return false;
  }
  if(gameObjA.creator != gameObjB.creator){
    return false;
  }
  if(gameObjA.winner != gameObjB.winner){
    return false;
  }
  console.log("isgameobj equal returned true");

  return true;
}

//end
