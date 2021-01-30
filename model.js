/*******************************************************************************
This is the file that will maintain what each user can and can't do and the like
-the logic of the games being played (checking to see if a move was correct)
  -and checking if after that if the game is finished
-checking what one user can see and not see


It will be feed by a fake Database until a database is created
-I will be using get functions and the like to get information about certain
    objects in the database
-will pull information from databasecontroller.js


created for the Connect 4 project
student: Cyril Patrick Lynch
Id: 101169963
*******************************************************************************/
const myDB = require('./databasecontroller.js');
const BOARDSIZE = myDB.BOARDSIZE;
const VALID_VISIBILITY = myDB.VALID_VISIBILITY;

/*******************************************************************************
simple setters and getters
*******************************************************************************/
//user getters
function getUser(userId){
  if(myDB.doesUserExist(userId)){
    return myDB.getUserDeepCopyFromId(userId)
  }
  return -1;
};
function getPassword(userId){
  if(myDB.doesUserExist(userId)){
    return myDB.getPassword(userId);
  }
  return -1;
}
function getFriends(userId){
  if(myDB.doesUserExist(userId)){
    return myDB.getFriends(userId);
  }
  return -1;
}
function getReceivedFriendRequests(userId){
  if(myDB.doesUserExist(userId)){
    return myDB.getReceivedFriendRequests(userId);
  }
  return -1;
}
function getSentFriendRequests(userId){
  if(myDB.doesUserExist(userId)){
    return myDB.getSentFriendRequests(userId);
  }
  return -1;
}
function getUserVisibility(userId){
  if(myDB.doesUserExist(userId)){
    return myDB.getUserVisibility(userId);
  }
  return -1;
}


//user setters
/**************
returns
   1 all good
  -1 user doesn't exist
  -2 visbility was not valid
  -3 a value was null
**************/
function setUserVisibility(userId, visibility){
  if(!userId || !visibility){
    return -3;
  }
  if(myDB.doesUserExist(userId)){
    if(!myDB.VALID_VISIBILITY.includes(visibility)){
      return -2;
    }else{
      return myDB.setUserVisibility(userId, visibility);
    }

  }else{
    return -1;
  }
}
function setPassword(userId, newPassword){
  if(myDB.doesUserExist(userId)){
    if(newPassword.length > 2 && newPassword.length < 20){
      myDB.setPassword(userId, newPassword);
      return 0;
    }
  }
  return -1;
}
function setEmail(userId, newEmail){
  if(myDB.doesUserExist(userId)){
    myDB.setEmail(userId, newEmail);
    return 0;
  }
  return -1;
}
function setPhone(userId, newPhone){
  if(myDB.doesUserExist(userId)){
    myDB.setPhone(userId, newPhone);
    return 0;
  }
  return -1;
}
function setAddress(userId, newAddress){
  if(myDB.doesUserExist(userId)){
    myDB.setAddress(userId, newAddress);
    return 0;
  }
  return -1;
}
//game setters



/*******************************************************************************
more complecated functions (essentially fancy getters and setters)
*******************************************************************************/
/************************************
params
-userId: a unique username given as a string that is 6-20 chars long
-password: a password given as a string that is 6-19 chars long
-visibility: the profile visibility of this user:
            -'del' = deteled (visible to know one)
            -'pri' = private (normal visible to only the user)
            -'fri' = friends (normal visible to their friends too)
            -'pub' = public (complete visibility to everyone)
returns
  -1 = username already exists
  -2 = username or password not at proper length
  -3 = a VALID_VISIBILITY was not set
  1 = all good user was added
************************************/
function addNewUser(userId, password, visibility){
  if(myDB.doesUserExist(userId)){
    return -1;
  }
  if(password.length < 3 || password.length > 19 || userId.length < 3 || userId.length > 19){
    return -2;
  }
  if(!(visibility === myDB.VALID_VISIBILITY[0]) && !(visibility === myDB.VALID_VISIBILITY[1]) && !(visibility === myDB.VALID_VISIBILITY[2]) && !(visibility === myDB.VALID_VISIBILITY[3])){
    return -3;
  }
  myDB.addNewUser(userId, password, visibility);
  return 1;
}

/************************************
Given the proper password for that userId we set this user's visibility to 'del'
params
-userId: username is a string
-password: password is a string

returns
  -1 = false
  1 = true
************************************/
function deleteUser(userId, password){
  if(password == myDB.getPassword(userId)){
    myDB.setUserVisibility(userId, 'del');
    return 1;
  }
  return -1;
}

/************************************
returns an array of the user's friends

returns:
  -1 = the user given doesn't exist
************************************/
function getUserFriends(userId){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  let friends = myDB.getFriends(userId);
  let array = [];
  for(let i =0; i<friends.length; i++){
    array.push(myDB.getUserDeepCopyFromId(friends[i]));
  }
  return array;
}

/************************************
returns an array of the user's with the highest
scores

************************************/
function getLeadingUsers(){
  return myDB.getLeadingUsers();
}


/************************************
creates a new game and adds is to games, then adds one to
params
-playerOne a username of the player going first
-playerTwo the username of the player going second

returns
  -1 = at least one of the users do not exist
  -2 = the creator wasn't player one or player two
  the game Id (positive) if everything is already good
************************************/
function addNewGame(playerOne, playerTwo, creator){
  if(!(myDB.doesUserExist(playerOne)) || !(myDB.doesUserExist(playerTwo)) ){
    return -1;
  }
  if(playerOne != creator &&  playerTwo != creator ){
    return -2;
  }
  let gameId = myDB.addNewGame(playerOne, playerTwo);
  myDB.setCreator(gameId, creator);
  myDB.addToUserGames(playerOne, gameId);
  myDB.addToUserGames(playerTwo, gameId);
  return gameId;
}

/************************************
deletes the game, only the creator can delete the game

params
  gameId - gets the game vie the gameId
  userId - checks to see if this is the creator of the game, only the creator of the game can delete the game

returns
  -1 = user doesn't exist
  -2 = game doesn't exist
  -3 = you are not the game's creator
  1 = game was deleted (visibility set to 'del')

************************************/
function deleteGame(userId, gameId){
  if(!(myDB.doesUserExist(userId))){
    return -1
  }
  if(!(myDB.doesGameExist(gameId))){
    return -2
  }
  if(myDB.getCreator(gameId) != userId){
    return -3;
  }
  myDB.setGameVisibility('del');
  return 1;
}

/************************************
dsets game visibility, only the creator can do this

params
  gameId - gets the game vie the gameId
  userId - checks to see if this is the creator of the game, only the creator of the game can change visibility settings

returns
  -1 = user doesn't exist
  -2 = game doesn't exist
  -3 = you are not the game's creator
  -4 = not a valid visibility
  1 = game'svisibility' was changed

************************************/
function setGameVisibility(userId, gameId, visibility){
  if(!(myDB.doesUserExist(userId))){
    return -1
  }
  if(!(myDB.doesGameExist(gameId))){
    return -2
  }
  if(myDB.getCreator(gameId) != userId){
    return -3;
  }
  if((!(visibility === myDB.VALID_VISIBILITY[0]) && !(visibility === myDB.VALID_VISIBILITY[1]) && !(visibility === myDB.VALID_VISIBILITY[2]) && !(visibility === myDB.VALID_VISIBILITY[3]))){
    return -4;
  }
  myDB.setGameVisibility(gameId, visibility);
  return 1;
}

/************************************
Given a game, a user, and a position check if everything is valid and add this move
to the gameboard (and to the moves array too)

params
  gameId - gets the game vie the gameId
  userId - checks to see if they sould be making a move now
  position - checks to see if this is valid move, and then playes it

returns
  1  = game was successfully updated
  2  = game was successfully updated and there was a winner
  -1 = game with that ID doesn't exist
  -2 = user with that ID doesn't exist
  -3 = position to place a game piece isn't valid
  -4 = game has already finished and has a winner
  -5 = game has no more moves left but somehow doesn't have a winner, this should not be possible so an error happened in the game logic
  -6 = This is not this player's turn
  -7 = this was not a valid placement of the piece onthe board
  -8 = position is not a valid int
************************************/
function addMoveToGameBoard(gameId, userId, position){
  //check for validity of request
  console.log(gameId + " " + userId + " " + position);
  if(Number.isNaN(position) || position === undefined || position === null){
    return -8;
  }

  if(!myDB.doesGameExist(gameId)){
    return -1;
  }
  if(!myDB.doesUserExist(userId)){
    return -2;
  }
  if(position >= myDB.BOARDSIZE || position < 0){
    return -3
  }
  gameObj = myDB.getGameDeepCopyFromId(gameId);
  userObj = myDB.getUserDeepCopyFromId(userId);

  if(gameObj.winner != ""){
    return -4;
  }
  if(gameObj.turns.length >= myDB.BOARDSIZE){
    //no more moves left, the game is over and thus whomever went first has won
    console.log("an error happend at addMoveToGameBoard() with gameId: " + gameId);
    return -5;
  }
  let thisPlayeris = 0;
  if(gameObj.playerOne === userObj.id){
    thisPlayeris = 1;
  }else{
    thisPlayeris = 2;
  }

  //is it their turn to go?
  if(isFirstPlayersTurn(gameObj)){
    if(thisPlayeris === 2){
      return -6;
    }
  }else{
    if(thisPlayeris === 1){
      return -6;
    }
  }


  //at this point the game and users are valid, it is this players turn, and there is space left on the
  //board to add more moves
  if(!isValidPosition(gameObj, position)){
    return -7;
  }


  //add the piece to the gameboard and to the moves array
  if(thisPlayeris === 1){
    gameObj.board[position] = 1; //player one's piece is a 1
  }else{
    gameObj.board[position] = 3; //player two's piece is a 3
  }
  myDB.addToBoard(gameObj.id, position);

  gameObj.turns.push(position);
  if(isGameFinished(gameObj) || gameObj.turns.length >= myDB.BOARDSIZE){
    //then update all of the pieces
    if(thisPlayeris === 1){
      myDB.addOneToLosses(gameObj.playerTwo);
    }else{
      myDB.addOneToLosses(gameObj.playerOne);
    }

    myDB.addOneToWins(userObj.id);
    myDB.setWinner(gameObj.id, userObj.id)

    return 2;
  }
  return 1;
}

/************************************
returns an array of games given the params

params
  requestingUser - the user making the request
  gameId - look for a matching game Id (exact match)
  isComplete - only get games that are complete if true
  isNotCompleted - only get games that are not completed if true
  user - get games that include this user as a player


returns
  -1 = if requestingUser does not exist
************************************/
function gamesSearch(requestingUser, gameId, isCompleted, isNotCompleted, user){

  if(!myDB.doesUserExist(requestingUser)){
    return -1;
  }
  return myDB.gamesSearch(requestingUser, gameId, isCompleted, isNotCompleted, user);

}
/************************************
Adds a message to the chat of a particular game
the requesting user must be a either playerOne or two
the the string must start with 1 if this is playerOne or a 2 if this
is playerTwo
string must be of length 2 or greater


params
  requestingUser - the user making the request
  gameId - this is the game we are adding to
  str - the message that we are trying to add to the db


returns
   1 = all good
  -1 = user doesn't exist
  -2 = gameId doesn't exist
  -3 = the user was not a playa
  -4 = the user and str user identifier are mixed up
  -5 = string is too short
************************************/
function addMessageToChat(requestingUser, gameId, str){
  if(!myDB.doesUserExist(requestingUser)){
    return -1;
  }
  if(!myDB.doesGameExist(gameId)){
    return -2;
  }
  let gameObj = myDB.getGameDeepCopyFromId(gameId);
  if(!(gameObj.playerOne === requestingUser || gameObj.playerTwo === requestingUser)){
    return -3;
  }
  let isPlayerOne;
  if(gameObj.playerOne === requestingUser){
    isPlayerOne = true;
  }else{
    isPlayerOne = false;
  }

  if(isPlayerOne && !(str.charAt(0) === '1')){
    return -4;
  }else if(!isPlayerOne && !(str.charAt(0) === '2')){
    return -4;
  }
  if(str.length <= 1){
    return -5;
  }

  myDB.addMessageToChat(gameId, str);
  return 1;
}

/************************************
Add a user with a certain id to befriend each other
can only happen after one sends a friend request

params
  userId - the user making the request
  friendId - the id of the user that we are making a request to

returns
   1 = successful
  -1 = one of the users does not exist
  -2 = if you are already friends with the user
  -3 = no friend requests received, that is the prerequsite for making a friend connection
************************************/
function addFriend(userId, friendId){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  if(!myDB.doesUserExist(friendId)){
    return -1;
  }
  userObj = myDB.getUserDeepCopyFromId(userId);
  friendObj = myDB.getUserDeepCopyFromId(friendId);
  if(isFriendsWith(userObj,friendId)){
    return -2;
  }else if(isFriendsWith(friendObj,userId)){
    console.log("**************Should not have beem able to get here, user : " + friendId +
     " is friends with " + userId + " without the opposite from being true");
    return -2;
  }
  //
  if(!userObj.receivedFriendRequests.includes(friendObj.id)){
    console.log("**************Should not have beem able to get here, user : " + friendId +
     " has not received a friends request from user : " + userId + " and yet is asking to become friends");
    return -3;
  }

  myDB.addFriend(userId, friendId);
  myDB.addFriend(friendId, userId);
  //also remove the friend request
  myDB.deleteSentFriendRequest(friendId, userId);
  myDB.deleteReceivedFriendRequest(userId, friendId);

  return 1;
}

/************************************
removes the friend connection between two users

params
  userId - the user making the request
  friendId - the id of the user that we want to remove from the users friends array

returns
   1 = successful
  -1 = one of the users does not exist
************************************/
function deleteFriend(userId, friendId){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  if(!myDB.doesUserExist(friendId)){
    return -1;
  }
  userObj = myDB.getUserDeepCopyFromId(userId);
  friendObj = myDB.getUserDeepCopyFromId(friendId);
  myDB.deleteFriend(userId, friendId);
  myDB.deleteFriend(friendId, userId);
  return 1;
}

/************************************
Add a friends request to a user that you are not already friends with
The userId is the Id of the user who sent the request
Both users accounts are updated

params
  userId - the user making the request
  friendId - the id of the user that we are making a request to

returns
   1 = successful
  -1 = one of the users does not exist
  -2 = if you are already friends with the user
  -3 = some sort of friend request has already been made

************************************/
function addFriendRequest(userId, friendId){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  if(!myDB.doesUserExist(friendId)){
    return -1;
  }
  userObj = myDB.getUserDeepCopyFromId(userId);
  friendObj = myDB.getUserDeepCopyFromId(friendId);

  if(isFriendsWith(userObj,friendId)){
    return -2;
  }else if(isFriendsWith(friendObj,userId)){
    console.log("**************Should not have beem able to get here, user : " + friendId +
     " is friends with " + userId + " without the opposite from being true");
    return -2;
  }
  //make sure that they have not already sent friend requests
  if(hasSomeFriendRequest(userObj, friendObj)){
    return -3;
  }

  myDB.addToSentFriendRequests(userId, friendId);
  myDB.addToReceivedFriendRequests(friendId, userId);
  return 1;
}

/************************************
remove a friends request to a user
The userId is the Id of the user who sent the request
Both users accounts are updated.

params
  userId - the user making the request
  friendId - the id of the user that we are making a request to

returns
   1 = successful
  -1 = one of the users does not exist
************************************/
function removeFriendRequest(userId, friendId){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  if(!myDB.doesUserExist(friendId)){
    return -1;
  }
  myDB.deleteSentFriendRequest(userId, friendId);
  myDB.deleteReceivedFriendRequest(friendId, userId);
  return 1;
  }


/************************************
params
  userObj - the user Obj making the request
  friendId - the id that we want to chech against

returns
  false if they are not friends and true otherwise
************************************/
function isFriendsWith(userObj, friendId){
  for(let i = 0; i < userObj.friends.length; i++){
    if(userObj.friends[i] === friendId){
      return true;
    }
  }
  return false;
}

/************************************
searches through the users an returns an array of visible users
params
  userId - the user who is requesting this information
  searchWord - search for the user starting with this word
  page - starting at page 1, the place of where we are in the array
  pageSize - the number of users on a page

returns
  arr[0] = -1 => username is not valid
  an array of userIds
************************************/
function search(userId, searchWord, page, pageSize){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  return myDB.getUsersArrayStartingWith(userId, searchWord, page, pageSize);
}


/************************************
returns an array of users that this user has sent a friend request to or that this
user has received a friend request from
params
  userId


returns
  -1 = user given doesn't exist

************************************/
function getAllFriendRequests(userId){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  let sentFriendRequests = myDB.getSentFriendRequests(userId);
  let receivedFriendRequests = myDB.getReceivedFriendRequests(userId);
  let usersArr = [];
  for(let i = 0; i < sentFriendRequests.length; i++){
    usersArr.push(myDB.getUserDeepCopyFromId(sentFriendRequests[i]));
  }
  for(let i = 0; i < receivedFriendRequests.length; i++){
    usersArr.push(myDB.getUserDeepCopyFromId(receivedFriendRequests[i]));
  }
  return usersArr;
}

/************************************
get the requested users infortion if they are allowed
params
  userId - the user who is requesting this information
  userIdOfRequested - the information that we are requesting
returns
  -1 = at least one of the users do not exist
  -2 = you are not allowed to access that
************************************/
function requestUserInfo(userId, userIdOfRequested){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  if(!myDB.doesUserExist(userIdOfRequested)){
    return -1;
  }
  if(myDB.getUserVisibility(userIdOfRequested) === "pub"){
    return getUser(userIdOfRequested);
  }
  let userObj = myDB.getUserDeepCopyFromId(userId);
  if(myDB.getUserVisibility(userIdOfRequested) ==="fri"){
    if(isFriendsWith(userObj, userIdOfRequested)){
      return getUser(userIdOfRequested);
    }
  }
  return -2;
}




/************************************
get the requested game (if this user is allowed)
params
  userId - the user who is requesting this information
  gameId - the game that the user is interested in
returns
  -1 = user doesn't exist
  -2 = game doesn't exist
************************************/
function requestGame(userId, gameId){
  if(!myDB.doesUserExist(userId)){
    return -1;
  }
  if(!myDB.doesGameExist(gameId)){
    return -2;
  }
  let gameObj = myDB.getGameDeepCopyFromId(gameId);
  let userObj = myDB.getUserDeepCopyFromId(userId);
  if(myDB.getGameVisibility="pub"){
    return gameObj;
  }else if(myDB.getGameVisibility="fri"){
    if(isFriendsWith(userObj, gameObj.playerOne)){
      return gameObj;
    }
    if(isFriendsWith(userObj, gameObj.playerTwo)){
      return gameObj;
    }
  }else if(myDB.getGameVisibility="pri"){
    if(userId === gameObj.playerOne){
      return gameObj;
    }
    if(userId === gameObj.playerTwo){
      return gameObj;
    }
  }
}

/************************************
forfeits a Game
if the game is within the first turn (only playerOne has played)
then no one wins the game. else the other playerOne Wins
params
  forfeitingUser = the user that has forfeited
  gameId = the game that was forfeited

returns
   1 = all good
  -1 = user doesn't exist
  -2 = game doesn't exist
  -3 = user is not a player

************************************/
function forfeitGame(forfeitingUser, gameId){
  if(!myDB.doesUserExist(forfeitingUser)){
    return -1;
  }
  if(!myDB.doesGameExist(gameId)){
    return -2;
  }
  let gameObj = myDB.getGameDeepCopyFromId(gameId);
  if(gameObj.playerOne !== forfeitingUser && gameObj.playerTwo !== forfeitingUser){
    return -3;
  }
  if(gameObj.turns.length <=1){
    //then not one losses properly
    myDB.forfeitGame(forfeitingUser, gameId, false);
    return 1;
  }else{
    //then the game has been going on too long for someone not to win
    myDB.forfeitGame(forfeitingUser, gameId, true);
    return 1;
  }
}

/*******************************************************************************
helper functions
*******************************************************************************/

//returns true if there is some sort of friend request between these two users already
function hasSomeFriendRequest(userObj, friendObj){
  if(userObj.sentFriendRequests.includes(friendObj.id)){
    return true;
  }
  if(friendObj.sentFriendRequests.includes(userObj.id)){
    return true;
  }
  if(userObj.receivedFriendRequests.includes(friendObj.id)){
    console.log("there is an error in hasSomeFriendRequest helper function, no sent friend request but there exists a received friend request 1")
    return true;
  }
  if(friendObj.receivedFriendRequests.includes(userObj.id)){
    console.log("there is an error in hasSomeFriendRequest helper function, no sent friend request but there exists a received friend request 2")
    return true;
  }
  return false;

}

function isFirstPlayersTurn(gameObj){
  let count = 0;
  for(let i = 0; i < myDB.BOARDSIZE; i++){
    count += gameObj.board[i];
  }
  if(count%2 === 0){
    return true;
  }
  return false;
}

//return true if a player won from a horizontal plane
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

//return true if a player won in a Veritcal plane
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

//return tur if a player won in a diagonal plane
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

//return true if game has just been won (4 consequestive tiles in a row of the same )
function isGameFinished(gameObj){
  if(gameObj.turns.length < 7){
    return false    //it is imposible to win a game when there has only been a total of 7 turns
  }
  if(checkHorizontals(gameObj) || checkVerticals(gameObj) || checkDiagonals(gameObj)){
    return true
  }
  return false;
}

function isValidPosition(gameObj, position){
  if(position >= myDB.BOARDSIZE || position < 0){
    return false;
  }

  let i = position;
  while(i < myDB.BOARDSIZE){
    if(gameObj.board[i] !== 0){
      return false;
    }
    i = i +7;
  }

  i = position -7;
  while(i >= 0){
    if(gameObj.board[i] === 0){
      return false;
    }
    i = i -7;
  }
  return true;
}


/*******************************************************************************
exports
*******************************************************************************/
module.exports = {
  BOARDSIZE, VALID_VISIBILITY,
  addMoveToGameBoard, forfeitGame,
  addNewGame, deleteGame, requestGame, gamesSearch, setGameVisibility, addMessageToChat,

  addNewUser, deleteUser, addFriendRequest, removeFriendRequest, getUserFriends, isFriendsWith,
  getAllFriendRequests, getLeadingUsers,
  setPassword, setEmail, setPhone, setAddress, setUserVisibility,
  requestUserInfo, addFriend, deleteFriend, getUser, getPassword, getFriends,
  setUserVisibility,
  search

}


/*******************************************************************************
testing
*******************************************************************************/
let testOption = 2;

if(testOption === 0){
  myDB.addNewGame('patrick', 'doug');
  myDB.addNewGame('patty', 'carl');

  myDB.addNewUser('Patrick', '1234', 'pri');
  console.log(myDB.getPassword('Patrick'));


  //so this is a new value;
  myDB.logOutAllGames();
  myDB.logOutAllUsers();
}else if(testOption === 1){
  console.log(myDB.VALID_VISIBILITY);
  console.log(addNewUser("Pat", 'Pat', 'pub'));
  addNewUser("paddy", 'paddy', 'pub');
  console.log(addNewGame("Pat", 'paddy', 'Pat'));
  myDB.logOutAllGames();
  myDB.logOutAllUsers();

  console.log(addMoveToGameBoard(0, 'Pat', 0));
  myDB.logOutAllGames();

  console.log(addMoveToGameBoard(0, 'paddy', 0));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'paddy', 1));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'Pat', 30));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'Pat', 7));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'Pat', 14));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'paddy', 8));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'Pat', 14));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'paddy', 2));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'Pat', 21));
  myDB.logOutAllGames();
  console.log(addMoveToGameBoard(0, 'Pat', 21));
  myDB.logOutAllGames();

  console.log(addNewGame("Pat", 'paddy', 'Pat'));
  console.log(addMoveToGameBoard(1, 'Pat', 0));
  console.log(addMoveToGameBoard(1, 'paddy', 6));
  console.log(addMoveToGameBoard(1, 'Pat', 1));
  console.log(addMoveToGameBoard(1, 'paddy', 13));
  console.log(addMoveToGameBoard(1, 'Pat', 2));
  console.log(addMoveToGameBoard(1, 'paddy', 20));
  console.log(addMoveToGameBoard(1, 'Pat', 3));
  console.log(addMoveToGameBoard(1, 'paddy', 27));
  myDB.logOutAllGames();

  console.log(addNewGame("Pat", 'paddy', 'Pat'));
  console.log(addMoveToGameBoard(2, 'Pat', 0));
  console.log(addMoveToGameBoard(2, 'paddy', 1));
  console.log(addMoveToGameBoard(2, 'Pat', 8));
  console.log(addMoveToGameBoard(2, 'paddy', 2));
  console.log(addMoveToGameBoard(2, 'Pat', 9));
  console.log(addMoveToGameBoard(2, 'paddy', 3));
  console.log(addMoveToGameBoard(2, 'Pat', 16));
  console.log(addMoveToGameBoard(2, 'paddy', 10));
  console.log(addMoveToGameBoard(2, 'Pat', 17));
  console.log(addMoveToGameBoard(2, 'paddy', 7));
  console.log(addMoveToGameBoard(2, 'Pat', 24));
  console.log(addMoveToGameBoard(2, 'paddy', 4));
  myDB.logOutAllGames();



}else if( testOption === 2){
  addNewUser("Pat", "1234", 'pub');
  addNewUser("Doug", "1234", 'pub');
  addNewUser("Ralph", "1234", 'pub');
  addNewUser("Tom", "1234", 'pub');
  addNewUser("Ben", "1234", 'pub');
  addNewUser("Jessica", "1234", 'pub');
  addNewUser("Jen", "1234", 'pub');
  addNewUser("Avi", "1234", 'pub');
  addNewUser("April", "1234", 'pub');
  addNewUser("Nicole", "1234", 'pub');
  addNewUser("paddy", "1234", 'pub');
  addNewUser("Dawn", "1234", 'pri');
  addNewUser("Josh", "1234", 'pri');
  addNewUser("Jacob", "1234", 'pri');
  addNewUser("Jeff", "1234", 'fri');
  addNewUser("Jose", "1234", 'fri');





  addFriendRequest("Pat", "Nicole");
  addFriend("Nicole", "Pat");
  addFriendRequest("Pat", "paddy");
  addFriend("paddy", "Pat");
  addFriendRequest("Pat", "Tom");
  addFriend("Tom", "Pat");
  addFriendRequest("Pat", "Jessica");
  addFriend("Jessica", "Pat");
  addFriendRequest("Pat", "Doug");
  addFriend("Doug", "Pat");
  addFriendRequest("April", "Pat");
  addFriendRequest("Pat", "Ben");

  myDB.logOutAllUsers();

  console.log(addNewGame("Pat", 'paddy', 'Pat'));
  console.log(addMoveToGameBoard(0, 'Pat', 0));
  console.log(addMoveToGameBoard(0, 'paddy', 0));
  console.log(addMoveToGameBoard(0, 'paddy', 1));
  console.log(addMoveToGameBoard(0, 'Pat', 30));
  console.log(addMoveToGameBoard(0, 'Pat', 7));
  console.log(addMoveToGameBoard(0, 'Pat', 14));
  console.log(addMoveToGameBoard(0, 'paddy', 8));
  console.log(addMoveToGameBoard(0, 'Pat', 14));
  console.log(addMoveToGameBoard(0, 'paddy', 2));
  console.log(addMoveToGameBoard(0, 'Pat', 21));
  console.log(addMoveToGameBoard(0, 'Pat', 21));



  console.log(addNewGame("Pat", 'paddy', 'Pat'));
  console.log(addMoveToGameBoard(1, 'Pat', 0));
  console.log(addMoveToGameBoard(1, 'paddy', 6));
  console.log(addMoveToGameBoard(1, 'Pat', 1));
  console.log(addMoveToGameBoard(1, 'paddy', 13));
  console.log(addMoveToGameBoard(1, 'Pat', 2));
  console.log(addMoveToGameBoard(1, 'paddy', 20));
  console.log(addMoveToGameBoard(1, 'Pat', 3));
  console.log(addMoveToGameBoard(1, 'paddy', 27));

  console.log(addNewGame("Pat", 'paddy', 'Pat'));
  console.log(addMoveToGameBoard(2, 'Pat', 0));
  console.log(addMoveToGameBoard(2, 'paddy', 1));
  console.log(addMoveToGameBoard(2, 'Pat', 8));
  console.log(addMoveToGameBoard(2, 'paddy', 2));
  console.log(addMoveToGameBoard(2, 'Pat', 9));
  console.log(addMoveToGameBoard(2, 'paddy', 3));
  console.log(addMoveToGameBoard(2, 'Pat', 16));
  myDB.logOutAllGames();


}












//end
