/*******************************************************************************
temporary database for the connect4 project

later will be made to interact with the database so that we can just call the
functions in this file and apply to proper queries to get the same information back

*******************************************************************************/
//the "databases"
let users = []; //all registeredUsers
let games = [];  //all games
let nextGameId = 0;

const BOARDSIZE = 42; // i.e. 0-41
const VALID_VISIBILITY = ['del', 'pri', 'fri', 'pub'];

//all parameters are strings
function User(username, password, visibility){
  this.id = username;
  this.password = password;
  this.email = "";
  this.phone = "";
  this.address = "";
  this.friends = [];
  this.sentFriendRequests = [];
  this.receivedFriendRequests = [];
  this.games = [];
  this.visibility = visibility;
  this.profilePicture = "";
  this.wins = 0;
  this.losses = 0;
}

//id is a number, and playerOne and plyaerTwo are strings
//this is a constuctor function
function Game(id, playerOne, playerTwo, creator){
  if(id === null){ //we must have an id
    console.log("error no Id");
    return;
  }
  this.id = id;
  this.name = "";
  //this.isAi = isAi;         //TODO add an AI later time allowing
  this.visibility = "pri";
  this.playerOne = playerOne;
  this.playerTwo = playerTwo;
  this.creator = creator;
  this.winner = ""; //once this != "" the game is done
  this.turns = []; //each move is added to this array in turn, as playerOne always goes first all odd moves are from player1
  this.board = [
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ];
  this.chat = []; //each element in the chat starts with either 1 or 2 to represent player 1 or player 2 (i.e. "1How is going")
  this.wasForfeited = false;
}

/*******************************************************************************
The basic set, get, and add functions to change the database and get information
from the database

maintains some basic logic of the data:
- no two id's can be the same
- user and game objects can't be null
*******************************************************************************/
//-User oriented functions- ****************************************************

//creates a new user and adds it to the database (if the id is valid)
function addNewUser(username, password, visibility){
  let newUser = new User(username, password, visibility);
  users.push(newUser);
}

//checks to see if the user exists
function doesUserExist(userId){
  let user = getUserFromId(userId);
  if(user == null){
    return false;
  }else{
    return true;
  }
}

//user getters
//gets a user object from the given id/username the object is probably just returned
//via reference
function getUserFromId(userId){
  for(let user of users){
    if(user.id === userId){
      return user;
    }
  }
  return null;
}
function getUserDeepCopyFromId(userId){
  for(let user of users){
    if(user.id === userId){
      let newUser = JSON.parse(JSON.stringify(user));
      return newUser;
    }
  }
  return null;
}

function getUsersArrayStartingWith(userId, searchWord, page, pageSize){
  let array;
  if(searchWord.length === 0){
    array = users;
  }else{
    array = users.filter(user => user.id.startsWith(searchWord));
  }
  midArray = array.filter(user => user.visibility !== 'del');

  let endArray = [];
  for(let i = ((page-1) * pageSize); i < midArray.length && i < (page * pageSize); i++){
    endArray.push(midArray[i]);
  }
  return endArray;
}

// returns the top ten highest rated users
//every win = 10 points
//every loss = 1 point
function getLeadingUsers(){
  let sortedUserArray = users.slice(0, users.length);
  sortedUserArray.sort(function(a, b){
    return (b.wins *10 + b.losses) - (a.wins *10 + a.losses) ;
  });
  if(sortedUserArray.length < 10){
    return sortedUserArray.slice(0, sortedUserArray.length);
  }else{
    return sortedUserArray.slice(0, 10);
  }

}

function getPassword(userId){ return getUserFromId(userId).password};
function getEmail(userId){ return getUserFromId(userId).email};
function getPhone(userId){ return getUserFromId(userId).phone};
function getAddress(userId){ return getUserFromId(userId).address};
function getFriends(userId){ return getUserFromId(userId).friends};
function getReceivedFriendRequests(userId){ return getUserFromId(userId).receivedFriendRequests}; //By reference
function getSentFriendRequests(userId){ return getUserFromId(userId).sentFriendRequests}; //By reference
function getUserGames(userId){ return getUserFromId(userId).games}; //By reference
function getUserVisibility(userId){ return getUserFromId(userId).visibility};
function getWins(userId){ return getUserFromId(userId).wins};
function getLossses(userId){ return getUserFromId(userId).losses};

//user setters
function setUserFromDeepCopy(copyOfUser){
  if(!doesUserExist(copyOfUser.id)){
    return false;
  }
  let user = getUserFromId(copyOfUser.id);
  user = JSON.parse(JSON.stringify(copyOfUser)); //should work...
  return true;
}
function setPassword(userId, password){ getUserFromId(userId).password = password};
function setEmail(userId, email){ getUserFromId(userId).email = email};
function setPhone(userId, phone){ getUserFromId(userId).phone = phone};
function setAddress(userId, address){getUserFromId(userId).address = address};

function setUserVisibility(userId, visibility){
    if(VALID_VISIBILITY.includes(visibility)){
      getUserFromId(userId).visibility = visibility;
      return 1;
    }
    return -2;
  }

function setWins(userId, wins){getUserFromId(userId).wins = wins};
function addOneToWins(userId){getUserFromId(userId).wins++};
function setLossses(userId, losses){getUserFromId(userId).losses = losses};
function addOneToLosses(userId){getUserFromId(userId).losses++};


//functions similar to setters
//adds a friend to a friendArray
function addFriend(userId, friendId){
  let user = getUserFromId(userId);
  if(!isElementInArray(friendId , user.friends)){
    user.friends.push(friendId)
  }
}

function addToReceivedFriendRequests(userId, friendId){
  let user = getUserFromId(userId);
  if(isElementInArray(friendId, user.receivedFriendRequests)){
    return;
  }
  user.receivedFriendRequests.push(friendId);
  return;
}

function addToSentFriendRequests(userId, friendId){
  let user = getUserFromId(userId);
  if(isElementInArray(friendId, user.sentFriendRequests)){
    return;
  }
  user.sentFriendRequests.push(friendId);
  return;
}

//adds a single game to the games played by user
function addToUserGames(userId, gameId){
  getUserFromId(userId).games.push(gameId);
}

//deletes a received Friend request from user,
function deleteReceivedFriendRequest(userId, friendId){
  let user = getUserFromId(userId);
  if(user.receivedFriendRequests.includes(friendId)){
    user.receivedFriendRequests = user.receivedFriendRequests.filter(id => id != friendId);
  }
}

//same as deleteSentFriendRequest but just reverse the params
function deleteSentFriendRequest(userId, friendId){
  let user = getUserFromId(userId);
  if(user.sentFriendRequests.includes(friendId)){
    user.sentFriendRequests = user.sentFriendRequests.filter(id => id != friendId);
  }
}

function deleteFriend(userId, friendId){
  let user = getUserFromId(userId);
  user.friends = user.friends.filter(id => id != friendId);
}



//-Game oriented functions- ****************************************************
//add a new Game to the database
function addNewGame(playerOne, playerTwo){
  let newGame = new Game(getNewGameId(), playerOne, playerTwo);
  games.push(newGame);
  return newGame.id;
}

function doesGameExist(gameId){
  let game = getGameFromId(gameId);
  if(game == null){
    return false;
  }else{
    return true;
  }
}

//forfeits a game, if neither of the users are to get points then noConsequence
//is true this should be in the model instead of databse controller...
function forfeitGame(forfeitingUser, gameId, noConsequence){
  let gameObj= getGameFromId(gameId);
  if(noConsequence){
    //then nethier should get a win or loss out of this
    if(forfeitingUser === gameObj.playerOne){
      gameObj.winner = gameObj.playerTwo;

    }else{
      gameObj.winner = gameObj.playerOne;
    }
  }else{
    //then caculate this as a win
    let user1 = getUserFromId(gameObj.playerOne);
    let user2 = getUserFromId(gameObj.playerTwo);

    if(forfeitingUser === gameObj.playerOne){
      gameObj.winner = gameObj.playerTwo;
      user2.wins++;
      user1.losses--;

    }else{
      gameObj.winner = gameObj.playerOne;
      user1.wins++;
      user2.losses--;
    }
  }


  gameObj.wasForfeited = true;
}



//Getters:
//returns a refernce to a game object...
function getGameFromId(gameId){
  for(let game of games){
    if(game.id === gameId){
      return game;
    }
  }
  return null;
}
//returns a reference to a new game object (changing this one doesn't change the original)
function getGameDeepCopyFromId(gameId){
  for(let game of games){
    if(game.id === gameId){
      let newGame = JSON.parse(JSON.stringify(game));
      return newGame;
    }
  }
  return null;
}

//pushes a single string onto the chat array in a particular game
function addMessageToChat(gameId, str){
  if(!doesGameExist(gameId)){
    return -1;
  }
  let game = getGameFromId(gameId);
  game.chat.push(str);
}


//returns games that are searched with these conditions
function gamesSearch(requestingUser, gameId, isCompleted, isNotCompleted, user){
  let userObj = getUserFromId(requestingUser);
  let gamesArr = [];
  //create an array of games that the requesting user is allowed to see:
  //pub add, fri add if they are in your friends list, pri add if it is one of your games played
  for(let game of games){
    if(game.visibility === 'pub'){
      let newGame = JSON.parse(JSON.stringify(game));
      gamesArr.push(newGame);
    }else if(game.visibility === 'fri' && (requestingUser.friends.includes(game.playerOne) || requestingUser.friends.includes(game.playerTwo))){
      let newGame = JSON.parse(JSON.stringify(game));
      gamesArr.push(newGame);
    }else if(game.visibility !== 'del' && (requestingUser === game.playerOne || requestingUser === game.playerTwo)){
      let newGame = JSON.parse(JSON.stringify(game));
      gamesArr.push(newGame);
    }else{
      //do
    }
  }

  //widdle down the array, if gameId is valid then only leave games with those ids in the array

  if(gameId && doesGameExist(gameId)){
    gamesArr = gamesArr.filter(game => game.id === gameId);
  }
  if(isCompleted){
    gamesArr = gamesArr.filter(game => game.winner !== "");
  }
  if(isNotCompleted){
    gamesArr = gamesArr.filter(game => game.winner === "");
  }
  if(user && doesUserExist(user)){
    gamesArr = gamesArr.filter(game => (game.playerOne === user || game.playerTwo === user));
  }else if(user){
    gamesArr = gamesArr.filter(game => (game.playerOne.startsWith(user) || game.playerTwo.startsWith(user)));
  }

  return gamesArr;

}

function getname(gameId){ return getGameFromId(gameId).name};
function getGameVisibility(gameId){ return getGameFromId(gameId).visibility};
function getPlayerOne(gameId){ return getGameFromId(gameId).playerOne};
function getPlayerTwo(gameId){ return getGameFromId(gameId).playerTwo};
function getCreator(gameId){ return getGameFromId(gameId).creator};
function getWinner(gameId){ return getGameFromId(gameId).winner};
function getTurns(gameId){ return getGameFromId(gameId).turns}; //reference
function getBoard(gameId){ return getGameFromId(gameId).board}; //reference

//setters
//sets the particular game properties to this one
//TODO: This doesn't work... (probably ends up just losing track of object and removing it)
function setGameFromDeepCopy(copyOfGame){
  if(!doesGameExist(copyOfGame.id)){
    return false;
  }
  let game = getGameFromId(copyOfGame.id);
  let newGame= JSON.parse(JSON.stringify(copyOfGame));
  return true;
}

function setCreator(gameId, creator){getGameFromId(gameId).creator = creator };
function setGameName(gameId, newName){ getGameFromId(gameId).name = newName};
function setGameVisibility(gameId, visibility){
  if(!(visibility === VALID_VISIBILITY[0]) && !(visibility === VALID_VISIBILITY[1]) && !(visibility === VALID_VISIBILITY[2]) && !(visibility === VALID_VISIBILITY[3])){
    getGameFromId(gameId).visibility= visibility;
    return 1;
  }
  return -1;
 }
function setWinner(gameId, userId){ getGameFromId(gameId).winner = userId};

//functions similar to setters (deletes/updates/addes)
//add a move to the moves array for a game:
function addToBoard(gameId, position){
  game = getGameFromId(gameId);
  if(game.turns.length % 2 === 0 ){
    //then even and this is player1
    game.board[position] = 1;
  }else{
    game.board[position] = 3;
  }

  if(game.turns.length < BOARDSIZE){
    game.turns.push(position)
  }else{
    console.log("too many moves are being pushed onto the moves array for game: " + gameId);
  }
}

//changes the game board via the index, value should be either 0, 1, or 2
function changeBoard(gameId, index, value){
  game = getGameFromId(gameId);
  game.board[index]=value;
}

/*******************************************************************************
Helper functions
*******************************************************************************/

//gets a new game Id that hasn't yet been used
function getNewGameId(){
  let gameId = nextGameId;
  nextGameId++;
  return gameId;
}

function isElementInArray(element, array){
  for(let i = 0; i < array.length; i++){
    if(element === array[i]){
      return true;
    }
  }
  return false;
}

/*******************************************************************************
functions for testing
*******************************************************************************/

function logOutAllUsers(){
  for(let user of users){
    console.log(user);
  }
}

function logOutAllGames(){
  for(let game of games){
    console.log("\nid: " + game.id + "\n" +
          "name: " + game.name + "\n" +
          "visibility: " + game.visibility + "\n" +
          "playeOne: " + game.playerOne + "\n" +
          "playeTwo: " + game.playerTwo + "\n" +
          "creator: " + game.creator + "\n" +
          "winner: " + game.winner);
    let str = "turns: [";
    for(let i = 0; i < game.turns.length; i++){
      str += (game.turns[i] + " ")
    }
    str += "]";
    console.log(str);
    console.log("board: ");
      for(let i = 1; i < 7; i++){
        console.log(game.board[(BOARDSIZE - i*7)] + " " + game.board[BOARDSIZE - (i*7) +1]+ " " + game.board[BOARDSIZE - (i*7) +2] +
      " " + game.board[BOARDSIZE - (i*7) +3] + " " + game.board[BOARDSIZE - (i*7) +4] + " " + game.board[BOARDSIZE - (i*7) +5] + " " +
      game.board[BOARDSIZE - (i*7) +6]);
    }
  }
}






/*******************************************************************************
The exports:
*******************************************************************************/
module.exports = {BOARDSIZE, VALID_VISIBILITY,

  addNewGame,doesGameExist, getGameDeepCopyFromId, setGameFromDeepCopy, forfeitGame,
  getname, getGameVisibility, getPlayerOne, getPlayerTwo, getCreator, getWinner, getTurns, getBoard,  getUsersArrayStartingWith,
  setGameName, setGameVisibility, setWinner, addToBoard, changeBoard, setCreator, gamesSearch, addMessageToChat,

  addNewUser, doesUserExist, getUserDeepCopyFromId, setUserFromDeepCopy, addToReceivedFriendRequests, addToSentFriendRequests, getLeadingUsers,
  getPassword, getEmail, getPhone, getAddress, getFriends, getReceivedFriendRequests, getSentFriendRequests, getUserGames, getUserVisibility, getWins, getLossses,
  setPassword, setEmail, setPhone, setAddress, setUserVisibility, setWins, setLossses, addOneToWins, addOneToLosses,
  addFriend, addToUserGames, deleteReceivedFriendRequest, deleteSentFriendRequest, deleteFriend,

  logOutAllUsers, logOutAllGames
};










//end
