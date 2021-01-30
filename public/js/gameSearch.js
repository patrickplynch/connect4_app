/******************************************************************************************
The JS for the gameSearch.pug page

*******************************************************************************************/
//good old global variables.. they say they are the best of practice right?...
let thisUser;
let gamesArr = [];
let hrefQueryStr = '';
let isGameFinished = false;
let isGameOngoing = false;
let searchStr = '';
let currGameIndex = 0;
let canvasWidth = 0;
let canvasHeight = 0;
let currentTurn = 0;
let isChatOpen = false;



function init(){
  //getting the user object updated and ready for the menus
  getTheCurrUser();
  document.getElementById('searchBar').addEventListener('input', sendSearch);

  //getting the query from the top if it is neccesary
  let url = window.location.href;
  let urlArr = url.split("/games");
  if(urlArr.length <= 1){
    console.log("no query in href");
  }else{
    hrefQueryStr = urlArr[1].slice(1);
    console.log("query is " + hrefQueryStr);
  }

}

/*********************************************
changes the hrefs so they correspond to this user
**********************************************/
function setup(){
  document.getElementById('homeButton').setAttribute('href', '/home/' + thisUser.id);
  document.getElementById('profileButton').setAttribute('href', '/profile/' + thisUser.id);

  //setting up the buttons in the setting menu
  document.getElementById('toggleIsGameFinished').setAttribute('class', 'buttonIsNotToggled');
  document.getElementById('toggleIsGameFinished').addEventListener('click', function(){
    if(document.getElementById('toggleIsGameFinished').className === 'buttonIsNotToggled'){
      //then toggle it
      document.getElementById('toggleIsGameFinished').setAttribute('class', 'buttonIsToggled');
      isGameFinished = true;
    }else{
      document.getElementById('toggleIsGameFinished').setAttribute('class', 'buttonIsNotToggled');
      isGameFinished = false;
    }
    sendSearch();

  });

  document.getElementById('toggleIsGameOngoing').setAttribute('class', 'buttonIsNotToggled');
  document.getElementById('toggleIsGameOngoing').addEventListener('click', function(){
    if(document.getElementById('toggleIsGameOngoing').className === 'buttonIsNotToggled'){
      //then toggle it
      document.getElementById('toggleIsGameOngoing').setAttribute('class', 'buttonIsToggled');
      isGameOngoing = true;
    }else{
      document.getElementById('toggleIsGameOngoing').setAttribute('class', 'buttonIsNotToggled');
      isGameOngoing = false;
    }
    sendSearch();
  });

  console.log("Menu is loaded");
}

/*********************************************
request asks who this user is
**********************************************/
function getTheCurrUser(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        thisUser = JSON.parse(this.responseText);
        console.log(thisUser);
        setup();
        sendSearch();
      }
   };

  xhttp.open("GET", "/thisUser", true);
  xhttp.send();
}


/*********************************************
requests an array of games from the server and then calls displayGames
when it loads

accepted queries are:
 name
 page-size
 page
**********************************************/
function sendSearch(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        gamesArr= JSON.parse(this.responseText); //this should be an array now?
        //update the currentTurn so that we start at the end of the games
        if(gamesArr.length !== 0){
          currentTurn = gamesArr[0].turns.length - 1;
        }
        displayCurrGame();
        console.log(gamesArr);
      }
   };
   console.log(getQuery());
   xhttp.open("GET", getQuery(), true); //I need the user object
   xhttp.send();

}


/*********************************************
setup the GET query on the games array
returns a string
**********************************************/
function getQuery(){
  //setup the the query
  let str = document.getElementById('searchBar').value;
  if (!str){
    searchStr = '';
  }else{
    searchStr = str;
  }

  let query = '';
  if(searchStr === '' && hrefQueryStr !== ''){
    //get information from the hrefQueryStr
    query = "/games?" + hrefQueryStr;
  }else{
    if(Number.isInteger(parseInt(searchStr))){
      //then we have a gameId search
      query = '/games?gameId=' + parseInt(searchStr) + "&detail=full&isCompleted=" + isGameFinished + "&isNotCompleted=" +
          isGameOngoing + "&user=";
    }else{
      //then we have a username search
      query = "/games?gameId=&isCompleted=" + isGameFinished + "&detail=full&isNotCompleted=" +
          isGameOngoing + "&user=" + searchStr;
    }
  }

  return query;

}

/*********************************************
manages the rendering of current games
**********************************************/
function displayCurrGame(){
  document.getElementById('gameArea').innerHTML = "";
  if(gamesArr.length !== 0){
    createGame(gamesArr[currGameIndex]);
    createChatBox(gamesArr[currGameIndex]);
  }
}



/*********************************************
creates a new game board an displays it
although similar to home.js's version it is
different
**********************************************/
function createGame(thisGame){
  console.log("did I get here");
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
  buttonPrevGame.innerHTML = "Prev Game";
  buttonPrevGame.setAttribute('class', 'gameSearchButton');
  buttonPrevGame.style.cssFloat = 'left';
  buttonPrevGame.addEventListener("click", function(){
    if(gamesArr.length <= 1){
      //do nothing
    }else{
      if(currGameIndex - 1 < 0){
        currGameIndex = gamesArr.length -1;
      }else{
        currGameIndex--;
      }
      displayCurrGame();
    }

  });

  let buttonNextGame = document.createElement('button');
  buttonNextGame.innerHTML = "Next Game";
  buttonNextGame.setAttribute('class', 'gameSearchButton');
  buttonNextGame.style.cssFloat = 'right';
  buttonNextGame.addEventListener("click", function(){
    if(gamesArr.length <= 1){
      //do nothing
    }else{
      if(currGameIndex + 1 >= gamesArr.length){
        currGameIndex = 0;
      }else{
        currGameIndex++;
      }
      displayCurrGame();
    }

  });

  //add some text that prints out what game you are currently over top of
  let buttonDiv = document.createElement('div');
  buttonDiv.setAttribute('class', 'centeredParagraph');
  buttonDiv.appendChild(buttonPrevGame);

  if(thisGame.winner === ''){
    //then the game is ongoing

    let buttonStepBackwards = document.createElement('button');
    buttonStepBackwards.innerHTML = "Game is not yet finished";
    buttonStepBackwards.setAttribute('class', 'gameSearchButton');
    buttonDiv.appendChild(buttonStepBackwards);

  }else{
    //The game is isFinished
    let buttonStepForwards = document.createElement('button');
    buttonStepForwards.innerHTML = "Step Ahead";
    buttonStepForwards.setAttribute('class', 'gameSearchButton');
    buttonStepForwards.addEventListener('click', function(){
      if(currentTurn + 1>= thisGame.turns.length){
        // then you can't go anymore forwards
      }else{
        currentTurn++;
        displayCurrGame();
      }
    });

    let buttonStepBackwards = document.createElement('button');
    buttonStepBackwards.innerHTML = "Step Back";
    buttonStepBackwards.setAttribute('class', 'gameSearchButton');
    buttonStepBackwards.addEventListener('click', function(){
      if(currentTurn - 1 < 0){
        // then you can't go anymore backwards
      }else{
        currentTurn--;
        displayCurrGame();
      }
    });

    buttonDiv.appendChild(buttonStepBackwards);
    buttonDiv.appendChild(buttonStepForwards);

  }



  buttonDiv.appendChild(buttonNextGame);





  /********************************************************
  Appending the header canvas and buttons to the main game element
  *********************************************************/
  backgroundGameElement.appendChild(canvas);

  let entireGameElement = document.createElement('div');
  entireGameElement.setAttribute('class', 'centerContent transWhite forDeleteGame');
  entireGameElement.appendChild(headerDiv);
  entireGameElement.appendChild(backgroundGameElement);
  entireGameElement.appendChild(buttonDiv);

  //adds it to the body of the HTML page
  document.getElementById('gameArea').appendChild(entireGameElement);



  /********************************************************
  setting up the canvas's height and width
  *********************************************************/
  canvasWidth = backgroundGameElement.clientWidth-10;
  canvasHeight = backgroundGameElement.clientHeight-10;

  //start messing with the canvas- I can't put this too
  canvas.width = canvasWidth;
  canvas.style.width = "canvasWidth" + "px";
  canvas.height = canvasHeight;
  canvas.style.height= "canvasHeight" + "px";
  //canvas.style.border = "3px solid";
  draw(canvas, thisGame);

  /********************************************************
  resizes the canvas appropritely when the window is resized
  *********************************************************/
  window.onresize = function(){
    //canvas.clearRect(0, 0, canvas.width, canvas.height);
    canvasWidth = backgroundGameElement.clientWidth-10;
    canvasHeight = backgroundGameElement.clientHeight-10;
    canvas.width = canvasWidth;
    canvas.style.width = "canvasWidth" + "px";
    canvas.height = canvasHeight;
    canvas.style.height= "canvasHeight" + "px";

    //scale all of the drawings now?
    draw(canvas, thisGame);
  }
}




/*********************************************
draws the actual game.
As everything needs to be drawn together this is
all in one function

to update the picture just call draw with the
appropirate canvas and gameObj

param:
  currentTurn is whatever turn we are currently on (the 0th, the 1st)
**********************************************/
function draw(canvas, gameObj){
  let currTurnsArray = gameObj.turns.slice(0, currentTurn + 1);

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
      if(gameObj.board[(35 -i*7) + k] === 0 || !currTurnsArray.includes((35 -i*7) + k)){
        //this is empty
        circ.fillStyle = 'black';
      }else if(gameObj.board[(35 -i*7) + k] === 1){
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



}

/*********************************************
add a chat box for use in the gameSearch.js file
It has been dumbed down for use in gameSearch.js
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
      if(thisGame.chat[i].charAt(0) === '1'){
        //then this user sent the message
        newMessage.setAttribute('class', 'currentUserMessage');
      }else{
        //then it was the oppent you sent the message
        newMessage.setAttribute('class', 'oppenentUserMessage');
      }

      divTextBox.appendChild(newMessage);
    }



    //this is the div that contains both the button to Send and the message to send
    let divButtonMessageContainer = document.createElement('div');
    divButtonMessageContainer.setAttribute('class', 'buttonMessageContainer');


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









//end
