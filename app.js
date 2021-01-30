/*******************************************************************************
This is the server for COMP 2406 A, Web Fundamentals term project in the fall
term of 2020 at Carleton Univeristy

Created by: Cyril Patrick Lynch
Student number: 101169963

TODO:
  make the friend.js search.js and friendRelations.js all into one js file (they are too similar to be different files)
    done: but it is now called userDisplay, but it still doesn't include search.js yet
    fully done! **
  add userful last 5 games in profile
  fix login back button (actually it doesn't make sense just delete it!)
    done!
  make it so that logged in users cannot register (ask to log off)
  switch all routing to fit RESTful API standards
  make routes asynchronous (await?)
  better commenting
  seperate the routes from this file and put it into another one
  switch over database to an actual database using Mongo and mongoose
    Make Mongo take over the express-session data
  add nodemon? (automatice server restarting)
  comment out the functionallity unneeded (in databasecontroller and model)
  make it so that you can only log out if you are logged in (and same goes with registering)
  add a delete user button
  add page number and page size for the /users?... search (default to page 1, pagesize of 10)
  I really like the 418 "I'm a teapot" HTTP status but I should probably get rid of them!
  add functionality for the leaderboards page (maybe wait until Databases are added?)
  make the background look nice!


*******************************************************************************/
const express = require('express');
let app = express();
const port = 3000;
const path = require('path');
const session = require('express-session');
const model = require('./model.js');

let loggedIn = new Set(); //a temporary Set until DB are working as you would otherwise use session Store functionality
let gameLobbySlowQueue = []; //also temporary and would be replaced by the a database implementation of it
function LobbyObj(username, visibility){
  this.username = username;
  this.visibility = visibility;
}

//TODO require (and install) mogodb-session to add persistence to express-sessions



app.set('view engine', 'pug');                         //sets the default view engine in express to pug
app.set('views', process.cwd() + '/public/views');    //sets the default to find views in

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));  //allows to serve files that are in the public directory like that of css or js i believe that this Will not work for pug files
app.use(session({                                         //allows use to use express's sessions middleware, inside the curly brakets are the options
  cookie: {
    maxAge: 36000000000 //this should be set to an hour, potentialy reduce this and then set rolling to true (resets expriation on each request)
  },                  //I raised it, but this would normally be set to an hour
  secret: 'Lan is a Statue' //this is a poor secret, and should be better if I want to actually use this as a website
}));



/*******************************************************************************
All of the routing
*******************************************************************************/


app.get('/login', displayLoginPage);
app.get("/",displayLoginPage);

app.post("/logoff", logoff);

//The sign up page
app.get('/signUp', function(req, res){
  res.render('signUp', {});
});

//basic user gets
app.post('/users', createUser);
app.get('/users', auth, searchUsers);
app.get('/users/:user', auth, searchForUser);
app.get('/thisUser', auth, getThisUser);
app.post('/users/:user', auth, updateUser);

//handling friend requests and friends array
app.post('/users/:user/sent-friend-request', auth, authUserParameter, addFriendRequest);
app.delete('/users/:user/sent-friend-request', auth, authUserParameter, removeSentFriendRequest);
app.post('/users/:user/friends',auth, authUserParameter, acceptFriendRequest);
app.delete('/users/:user/friends',auth, authUserParameter, removeFriend)
app.delete('/users/:user/received-friend-request', auth, authUserParameter, removeReceivedFriendRequest);

//these two gets are used in the userDisplay.js file
app.get('/users/:user/friend-requests', auth, authUserParameter, getAllUserFriendRequests);
app.get('/profile/:user/friend-requests', auth, authUserParameter, renderFriendRequests);
app.get('/users/:user/friends', auth, authUserParameter, getUserFriends);
app.get('/profile/:user/friends', auth, authUserParameter, renderUserFriends );

//games oriented routing
app.get('/games', auth, getGamesWith);
app.post('/games/:game', auth, addMoveToGameBoard);
app.post('/games', auth, createNewGame);
app.post('/games/:game/chat', auth, addMessageToChat);                                                   //add a string to the chat array in a game
app.post('/games/:game/forfeit', auth, forfeitGame);
app.post('/games-lobby', auth, addUserToLobby)

//This is actually the game page
app.get('/home/:user', auth,authUserParameter, function (req, res) {
  res.render('home', {});
});

app.get('/home/:user/new-game', auth, authUserParameter, function (req, res) {
  res.render('newGame', {});
});

app.get('/home/:user/new-random-game', auth, authUserParameter, function (req, res) {
  res.render('newRandomGame', {});
});


app.get('/search/games', auth, function(req, res){
  res.render('searchGames', {});
});

app.get('/search', auth, function(req, res){
  res.render('search', {});
});

 app.get('/leaderboards', auth, function(req, res){
   let leadingUser = model.getLeadingUsers();
   res.render('leaderboards', {leadingUsersArr: leadingUser});
 });

 app.get('/profile/:user', auth, userProfileAuth); //fullProfile
 app.get('/profile/:user/profile-edit', auth, authUserParameter, profileEdit);

 app.get('/faq', auth, function(req, res){
   res.render('faq', {});
 });

 app.use(function(req, res){
   res.status(404).render('404.pug');
 })

 /*******************************************************************************
 functions for resolving routing and the like
 TODO: put into another file later for better organization
 *******************************************************************************/

 /***************************************************
Games oriented functions
 ***************************************************/


 /***************************************************
 adds a user to the game lobby, polls the lobby every
 4000 miliseconds
 ***************************************************/
function addUserToLobby(req, res, next){
  let username = req.session.username;
  let privacy = req.body.visibility;
  if(gameLobbySlowQueue.includes(username)){
    console.log("User already in lobby" );
    res.status(406).send("you are already in game lobby");
    return;
  }
  if(!privacy || !(model.VALID_VISIBILITY.includes(privacy) )){
    console.log("Visibility not valid in addUserToLobby" );
    res.status(406).send("Visibility not valid");
    return;
  }
  let waitingUser = new LobbyObj(username, privacy);



  gameLobbySlowQueue.push(waitingUser);
  res.status(200);
  res.redirect('/home/' + username);
  return;
}


 /***************************************************
 Forfeits a game using the /games/:game/forfeit route v
via POST
if the game is within the first turn (only playerOne has played)
then no one wins the game. else the other playerOne Wins uses the function:
forfeitGame(forfeitingUser, gameId)
params
  forfeitingUser = the user that has forfeited
  gameId = the game that was forfeited

returns
   1 = all good
  -1 = user doesn't exist
  -2 = game doesn't exist
  -3 = user is not a player
 ***************************************************/
function forfeitGame(req, res, next){
  let username = req.session.username;
  let gameId = parseInt(req.params.game);          //gets the gameId from the URL

  let result = model.forfeitGame(username, gameId);
  if(result < 0){
    //an error occured
    console.log("Error in the forfeitGame(). Error Code: " + result);
    res.status(406).send("An error occured when the trying to forfeit the game, no change happened");
    return;
  }
  res.status(200).send("Game was forfeited");
  return;
}

 /***************************************************
adds a message to the given game object
message strins must start with a 1 or a 2 (for playerOne or playerTwo)
the requestingUser must be one of the players

we will be using:
function addMessageToChat(requestingUser, gameId, str)
params
  requestingUser - the user making the request
  gameId - this is the game we are adding to
  str - the message that we are trying to add to the db
returns
  -1 = user doesn't exist
  -2 = gameId doesn't exist
  -3 = the user was not a playa
  -4 = the user and str user identifier are mixed up
  -5 = string is too short
 ***************************************************/
 function addMessageToChat(req, res, next){
   let requestingUser = req.session.username;       //gets the username from the session information
   let gameId = parseInt(req.params.game);          //gets the gameId from the URL
   let message = req.body.message;                  //get the message string from the body of the POST

   if(!message){
     console.log("invalid message to add to the chat array")
   }
   if(!gameId){
     console.log("invalid game to add to add to the chat array")
   }
   let functionReturn = model.addMessageToChat(requestingUser, gameId, message);
   console.log(functionReturn);
   if(functionReturn < 0){
     console.log("Error in the addMessageToChat(). Error Code: " + functionReturn);
     res.status(406).send("An error occured when the trying to add a message to this game, no message added");
     return;
   }
   res.status(200).send("Message was added to the game!");
   return;


 }

 /***************************************************
 using the /games/:game path via a POST, add a move to a particular game

model.addMoveToGameBoard(gameId, userId, position) has the following returns and params
 params
   gameId - gets the game vie the gameId (gameId is a number not a string)
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
 ***************************************************/
function addMoveToGameBoard(req, res, next){
   let requestingUser = req.session.username;       //gets the username from the session information
   let gameId = parseInt(req.params.game);          //gets the gameId from the URL
   let tilePosition = parseInt(req.body.tilePos);   //gets the tilePos from the data sent by the POST request
                                                    //use query for a URL query in a get request
   // console.log("tilePos in addMoveToGameBoard = " + tilePosition);
   let addMoveReturn = model.addMoveToGameBoard(gameId, requestingUser, tilePosition);
   if(addMoveReturn < 0){
     if(addMoveReturn === -5){
       console.log("Game was corrupted somehow" + addMoveReturn);
     }
     console.log("Error in the addMoveToGameBoard. Error Code: " + addMoveReturn);
     res.status(406).send("An error occured when the trying to add to the game. Game was not updated");
     return;
   }else{
     res.status(200).send("game board updated");
     return;
   }
}

 /***************************************************
 using the /games path we are searching through the games
 trying to do this a different way that allows for a more generalized
 approach (rather than how I did it with the Users array)

TODO: now just impement this in the Model and dataBase controller
 ***************************************************/
 function getGamesWith(req, res, next){
   //all of the query params should still work if they are all undefined (so long as the user requesting this information is logged on)
   let requestingUser = req.session.username;   //is this user allowed to access these games?
   let gameId = parseInt(req.query.gameId);               //the game Id we are looking for (can be undefined)
   let isCompleted;
   let detail = req.query.detail;
                               //check if we are looking for a only completed games
   if(req.query.isCompleted === "true"){
     isCompleted = true;
   }else{
     isCompleted = false;
   }
   let isNotCompleted;                          // check if we are looking for only completed that are on going
   if(req.query.isNotCompleted === "true"){
     isNotCompleted = true;
   }else{
     isNotCompleted = false;
   }

   if(req.query.active){
     if(req.query.active === 'true'){
       isCompleted = false;
       isNotCompleted = true;
     }else if(req.query.active === 'false'){
       isCompleted = true;
       isNotCompleted = false;
     }else{
       console.log("bad query at getGamesWith")
     }
   }

   let user;
   if(req.query.player){
     user = req.query.player;
   }else if(req.query.user){
     req.query.user;
   }
   user ='';

                   //looks for games that include this user
   let gameArr = model.gamesSearch(requestingUser, gameId, isCompleted, isNotCompleted, user);

   if(gameArr === -1){
     console.log("error, requseting username not valid");
     res.status(404).send("User does not exist (I might remove this as it gives away too much information)");
   }
   // what is the detail of this
   if(detail !== 'full' && detail !== 'summary'){
     detail = 'summary';
   }

   if(detail === 'summary'){
     gameArr = makeSummaryOfGames(gameArr);
   }

   res.status(200)
   res.json(gameArr); //converts to JSON and sends it
   return;
 }

 /***************************************************
 using the /games via the post method create a new game
 between two friends using this function

 function addNewGame(playerOne, playerTwo, creator)
 params
 -playerOne a username of the player going first
 -playerTwo the username of the player going second

 returns
   -1 = at least one of the users do not exist
   -2 = the creator wasn't player one or player two
   the game Id (positive) if everything is already good


   also uses
    function setGameVisibility(userId, gameId, visibility)
   params
     gameId - gets the game vie the gameId
     userId - checks to see if this is the creator of the game, only the creator of the game can change visibility settings

   returns
     -1 = user doesn't exist
     -2 = game doesn't exist
     -3 = you are not the game's creator
     -4 = not a valid visibility
     1 = game's visibility' was changed
   ***************************************************/
 function createNewGame(req, res, next){
   let requestingUser = req.session.username;   //is this user allowed to access these games?
   let friendId = req.body.friendId;               //the game Id we are looking for (can be undefined)
   let visibility =req.body.visibility;
   if(!visibility){
     visibility = 'pub';
   }

   let addGameResult;
   let visbilityResult;
   //pick a random first player
   if(Math.random() > 0.5){
     addGameResult = model.addNewGame(requestingUser, friendId, requestingUser);
   }else{
     addGameResult = model.addNewGame(friendId, requestingUser, requestingUser);
   }

   if(addGameResult < 0){
     console.log("Error: user tried to create a new game, error message = " + addGameResult);
     res.status(406).send("Error: Could not create a new game");
     return;
   }else{
     //change the visibility
     visbilityResult = model.setGameVisibility(requestingUser, addGameResult, visibility);
     if(visbilityResult < 0){
       console.log("Error: user tried to set visibility of new game, error code = " + visbilityResult);
       res.status(406).send("Error: Could not set game visibility");
       return;
     }else{
       //all good
       res.status(200);
       res.redirect('/home/' + requestingUser);
       return;
     }
   }
 }


 /***************************************************
 User oriented functions
 ***************************************************/
 /***************************************************
 checks to see if the the user in the params is
 a friend towards the requesting user
 ***************************************************/
 function isFriendOrPublic(req, res, next){
   let requestingUser = req.session.username;
   let friend = req.params.user;

   if(model.getUser(requestingUser) !== -1 && model.getUser(friend) !== -1){
     let friendObj = model.getUser(friend);
     let requestingUserObj = model.getUser(requestingUser)
     if(model.isFriendsWith(requestingUserObj, friendObj)){
       return true;
     }else{
        if(friendObj.visibility === 'pub'){
         return true;
       }else{
         return false;
       }
     }
   }else{
     return false;
   }

 }


 /***************************************************
 checks to see if the user is already logged in
 if not then it tries to log the user on
 if it can't (information is not proper) then they are
 unauthorized
 ****************************************************/
function auth(req, res, next){
  if(!req.session.loggedin){
    if(req.body.username !== undefined && req.body.password !== undefined){
      login(req, res, next);
      return;
    }else{
      res.status(401).send("Unauthorized, please log in");
      return;
    }

  }
  next();
}

/***************************************************
checks to make sure that the user trying to access a particular
user's page is the proper user
***************************************************/
function userProfileAuth(req, res, next){
  if(req.session.username !== req.params.user){
    if(isFriendOrPublic(req,res, next)){
      friendProfile(req,res, next);
    }else{
      halfProfile(req,res, next);
    }
    return;
  }else{
    fullProfile(req, res, next);
    return;
  }
}

/***************************************************
checks to make sure that the user trying to access a particular
user's page is the proper user
***************************************************/
function authUserParameter(req, res, next){
  if(req.session.username !== req.params.user){
    console.log("username:" + req.params.user + " and loggedon user: " + req.session.username + " do not match, cannot get requested information" );
    res.status(403).send("username and loggedon user do not match, cannot get requested information");
    return;
  }else{
    next();
  }
}

function alreadyAuthed(req, res, next){
  if(req.session.loggedin){
    res.status(401).send("Unauthorized, please log out!");
    return;
  }
  next();
}

//creates a session for the user if they do not already have one
function login(req, res, next){
  //if(req.session.loggein){ //old code TODO delete in final copy
  //  res.status(200).send("You are already logged in as user: " + req.session.username);
  //  return;
  //}
  let username = req.body.username;
  let password = req.body.password;
  let actualPassword = model.getPassword(username);
  if(actualPassword == password){
    req.session.loggedin = true;
    req.session.username = username;
    loggedIn.add(username);
    let str = "/home/" + username;
    res.status(200);
    res.redirect(str);
    //shouldn't I put sending some kind of message as well? TODO
    //res.status(200).send("Logged in");
  }else if(actualPassword == -1){ //I believe a 404 is the proper message for here (prof used a 401)
    res.status(404).send("User does not exist (I might remove this as it gives away too much information)");
  }else if(actualPassword != password){
    res.status(404).send("User found, but password doesn't match (This is too much info but very helpful when testing)");
  }
}

/***************************************************
renders the appropriate log in page
***************************************************/
function displayLoginPage(req, res, next){
  res.status(200);
  if(req.session.loggedin){
    //they are already logged in include the menu
    res.render('login', {});
  }else{
    //if they are logged out then the menu bar will be broken so don't show
    res.render('loginNotAuthed', {});
  }
}




/***************************************************
using the /users path we have:
name=the username we are searching
page=what page we are on
pageSize = how many user objects per page

search(userId, searchWord, page, pageSize)
***************************************************/
function searchUsers(req, res, next){
  let requestingUser = req.session.username;
  let name = req.query.name;
  // console.log("query name = " + name);
  let userArr = model.search(requestingUser, name, 1, 10);

  if(userArr === -1){
    console.log("error, requseting username not valid");
    res.status(404).send("User does not exist (I might remove this as it gives away too much information)");
  }
  //userArr = JSON.stringify(userArr);
  res.status(200)
  res.json(sterilize(userArr)); //converts to JSON and sends it
  return;
}

/***************************************************
returns the currently logged in user object
***************************************************/
function getThisUser(req, res, next){
  let username;
  if(req.query.username){
    username = req.query.username;
  }else{
    username = req.session.username;
  }
  let currUser = model.getUser(username);

  if(currUser === -1){
    console.log("error that user is not valid, in getThisUser");
    return;
  }
  // console.log(currUser);
  currUser = sterilize(currUser)
  // console.log(currUser);
  res.status(200)
  res.json(currUser);
  return;
}

  /***************************************************
  responds with the html for a particular person's username
  currently it only returns the signed in user's profile page
  TODO:
    add the following visibility restrictions for the path users/profile/username
  visibility:
    del:
      no one can access this
    pri:
      only the user who owns this profile can access this
    fri:
      the user friends can access this too
    pub:
      all users who are logged in can access this

    TODO:
      turn the route handlers into asynchronous functions (using await?)
    responds:
      with the currUser's profile page

  ***************************************************/
 function fullProfile(req, res, next){
   let username = req.session.username;
   user = model.getUser(username);
   if(user === -1){
     res.status(404).send("User does not exist (I might remove this as it gives away too much information)")
   }
   res.render('profile', {userObj: user});
   return; //this shouldn't be necesary
 }

 /***************************************************
 gets smaller verion of a user's profile page
 ***************************************************/
function halfProfile(req, res, next){
  let username = req.session.username;
  user = model.getUser(req.params.user);
  if(user === -1){
    res.status(404).send("User does not exist (I might remove this as it gives away too much information)")
  }
  res.render('halfProfile', {userObj: user});
  return;
}

/***************************************************
gets smaller verion of a user's profile page but bigger than
the halfProfile (this on includes contact information)
***************************************************/
function friendProfile(req, res, next){
  let username = req.session.username;
  user = model.getUser(req.params.user);
  if(user === -1){
    res.status(404).send("User does not exist (I might remove this as it gives away too much information)")
  }
  res.render('friendProfile', {userObj: user});
  return;
}


 function profileEdit(req, res, next){
   let username = req.session.username;
   user = model.getUser(username);
   if(user === -1){
     res.status(404).send("User does not exist (I might remove this as it gives away too much information)")
   }
   res.render('profileEdit', {userObj: sterilize(user)});
   return; //this shouldn't be necesary
 }


 /***************************************************
 Logs off the currently logged on user
 ***************************************************/
function logoff(req, res, next){
  // console.log(!req.session.loggedin);
  if(!req.session.loggedin){
    res.status(200).send("You are already logged off");
  }else{
    loggedIn.delete(req.session.username);
    req.session.loggedin = false;

    res.status(200);
    res.redirect('/login');
  }
}


/***************************************************
check if user is already logged on, then they are trying to update their
  inforamtion authenticate and then go to updateUser
check if username is valid
check if passwords match
create new user
***************************************************/
function createUser(req, res, next){
    if(req.session.loggedin){
      next();
      return;
    }
    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;
    let rpassword = req.body.rpassword;
    if(password != rpassword){
      res.status(418).send("Passwords don't match, (this should be checked first though on the client side so that this never reaches the client)");
      return;
    }
    let response = model.addNewUser(username, password, req.body.visibility);
    /*
    -1 = username already exists
    -2 = username or password not at proper length
    -3 = a VALID_VISIBILITY was not set
    1 = all good user was added
    */
    if(response === -1){
      res.status(418).send("UserName already taken, (this should be checked first though on the client side so that this never reaches the client)");
      res.redirect('/login');
      return;
    }else if(response === -2){
      res.status(418).send("username or password not a valid length (3-19), (this should be checked first though on the client side so that this never reaches the client)");
      res.redirect('/login');
      return;
    }else if(response === -3){
      res.status(418).send("visibility is not valid, (i.e. error in the code)");
      res.redirect('/login');
      return;
    }else{
      //all good!
      res.status(200);
      res.redirect('/login');
    }
}

//friend request oriented functions

/***************************************************
using the /users/:user/FriendRequest add a new friend request

the function addFriendRequest(userId, friendId)
returns
   1 = successful
  -1 = one of the users does not exist
  -2 = if you are already friends with the user
  -3 = some sort of friend request has already been made
***************************************************/
function addFriendRequest(req, res, next){
  let username = req.session.username;
  let friendId = req.body.friendId;
  let result = model.addFriendRequest(username, friendId)
  if(result === 1){
    res.status(200).send("friend request sent");
    return;
  }else if(result === -1){
    console.log("result = -1 in the addFriendRequest func");
    res.status(404).send("one of the users involved do not exist" );
    return;
  }else if(result === -2){
    console.log("result = -2 in the addFriendRequest func");
    res.status(406).send("already friends with the user" );
    return;
  }else{
    //no friend request was sent...
    res.status(406).send("some sort of friend request has already been mades");
    return;
  }
}

/***************************************************
using the /users/:user via GET to retrieve
information on a single user


***************************************************/
function searchForUser(req, res, next){
  let requestingUser = req.session.username;
  let name = req.param.user;
  let userArr = model.search(requestingUser, name, 1, 10);

  if(userArr === -1){
    console.log("error, requseting username not valid");
    res.status(404).send("User does not exist (I might remove this as it gives away too much information)");
  }
  let userObj;
  for(let i = 0; i< userArr.length; i++){
    if(userArr[i].id === name){
      userObj = userArr[i];
      break;
    }
  }
  if(!userObj){
    console.log("error, requesting username not valid");
    res.status(404).send("Cannot get that information on that User");
  }

  //userArr = JSON.stringify(userArr);
  res.status(200)
  res.json(sterilize(userObj)); //converts to JSON and sends it
  return;
}
/***************************************************
using the /users/:user/FriendRequest remove a friend request


***************************************************/
function removeSentFriendRequest(req, res, next){
  let username = req.session.username;
  let friendId = req.body.friendId;
  //let result = model.removeFriendRequest(username, friendId); this shouldn't do anything TODO delete
  helperRemoveFriendRequest(res, username, friendId);
  return; //shouldn't need this but just in case!
}

/***************************************************
using the /users/:user/FriendRequest via a delete request
to remove a friend request


***************************************************/
function removeReceivedFriendRequest(req, res, next){
  let username = req.session.username;
  let friendId = req.body.friendId;
  helperRemoveFriendRequest(res,friendId, username);
  return; //shouldn't need this but just in case!
}


/***************************************************
using the /users/:user/FriendRequest remove a friend
via the delete method:

function deleteFriend(userId, friendId)
returns
   1 = successful
  -1 = one of the users does not exist
***************************************************/
function removeFriend(req, res, next){
  let username = req.session.username;
  let friendId = req.body.friendId;
  let result = model.deleteFriend(username, friendId);
  if(result === 1){
    //all good! friend removed
    res.status(200).send("friend connection has been deleted");
    return;
  }else{
    //error, one of the users do not exist!
    console.log("result = -1 in the removeFriend func");
    res.status(404).send("one of the users involved do not exist" );
  }
  return; //shouldn't need this but just in case!
}

/***************************************************
using the /users/:user/friend-relationships via the GET
method


***************************************************/
function  getAllUserFriendRequests(req, res, next){
  username = req.session.username;
  let result = model.getAllFriendRequests(username);
  if(result === -1){
    //error one of the users does not exist
    console.log("result = -1 in the getAlluserFriendResquests func");
    res.status(404).send("one of the users involved do not exist" );
    return;
  }else{
    //all good
    res.status(200)
    res.json(sterilize(result));
    return;
  }

}

/***************************************************
simply render the pug file and send it


***************************************************/
function renderFriendRequests(req, res, next){
  res.status(200).render('friendRelations', {});

}



/***************************************************
using the /users/:user/FriendRequest via put
 accept or decline a received friend request

 this is the function from the model.js that we'll use to add the friend
 function addFriend(userId, friendId)
   returns
      1 = successful
     -1 = one of the users does not exist
     -2 = if you are already friends with the user
     -3 = no friend requests received, that is the prerequsite for making a friend connection


***************************************************/
function acceptFriendRequest(req, res, next){
  let username = req.session.username;
  let isAccepted = req.body.answer;              //true if the friend request was accepted fasle otherwise
  let friendId = req.body.friendId;             //the friend Id that we are accepting or declining
  // console.log(isAccepted);

  if(isAccepted === "true"){
    //add to friends

    let result = model.addFriend(username, friendId);
    if(result === 1){
      //all good
      res.status(200).send("friend added and friend request has been deleted");
      return;

    }else if(result === -1){
      //error one of the users does not exist
      console.log("result = -1 in the acceptOrDeclineFriendRequest func");
      res.status(404).send("one of the users involved do not exist" );

    }else if(result === -2){
      //you are already friends with the user then delet the request
      helperRemoveFriendRequest(res, username, friendId);
      return; //shouldn't need this but just in case!

    }else{
      //no friend request was sent...
      res.status(406).send("can't create a friend connection if this user did not receive a friend request");
      return;
    }
  }else{
    //remove friend request

    helperRemoveFriendRequest(res,friendId,  username );
    return; //shouldn't need this but just in case!
  }
}

/***************************************************
renders the user friends page
***************************************************/
function renderUserFriends(req, res, next){
    res.render('friends', {}); //I think I was going to make this more completecated
    //but instead I just decided to do everything in JS following the example of the serch pug file
}

/***************************************************
gets the users Friends objects
***************************************************/
function getUserFriends(req, res, next){
  // console.log(req.params.user);
  let userFriends = model.getUserFriends(req.params.user);
  if(userFriends === -1){
    //error this is not a valid users
    console.log("result = -1 in the getUserFriends func");
    res.status(404).send("the requesting user does not exist (again maybe too much information)" );
    return;
  }
  //add only users who are logged on
  if(req.query.loggedOn === 'true'){
    let loggedInFriends = [];
    for(let i = 0; i < userFriends.length; i++){
      if(loggedIn.has(userFriends[i].id)){
        loggedInFriends.push(userFriends[i]);
      }
    }
    res.status(200)
    res.json(sterilize(loggedInFriends));
    return;
  }
  // console.log(userFriends);
  res.status(200)
  res.json(sterilize(userFriends));
  return;
}

/***************************************************
check if passwords match
Update the user information via the message body/
***************************************************/
function updateUser(req, res, next){
  let username = req.session.username;
  if(username !== req.params.user){
    console.log("username:" + req.params.user + " and loggedon user:" + username + " do not match, cannot get requested information" );
    res.status(403).send("username and loggedon user do not match, cannot get requested information");
    return;
  }
  if(req.body.password === req.body.rpassword){
    if(model.setPassword(username, req.body.password)< 0){
      console.log("password could not be set");
    }
  }
  if(model.setEmail(username, req.body.email) < 0){
    console.log("email could not be set");
  }
  if(model.setPhone(username, req.body.phone) < 0){
    console.log("phone could not be set");
  }
  if(model.setAddress(username, req.body.address) < 0){
    console.log("email could not be set");
  }
  let returnVisibility = model.setUserVisibility(username, req.body.visibility);
  if(returnVisibility < 0){
    console.log("user visibility could not be set, error code " + returnVisibility);
  }
  //all good!
  let str = "/profile/" + username;
  res.status(200);
  res.redirect(str);
}


/*******************************************************************************
Helper Functions
*******************************************************************************/
/***************************************************
used to delete friend requests and handle some errors
***************************************************/
function helperRemoveFriendRequest(res, username, friendId){
  let result = model.removeFriendRequest(username, friendId)
  if(result === 1){
    res.status(200).send("friend request deleted");
    return;
  }else{
    console.log("result = -1 in the removeFriendsRequest func");
    res.status(404).send("one of the users involved do not exist" );
    return;
  }
}

/***************************************************
objects that only contain part of the user object
more suitable for other users to have (i.e. no
password on the such)
***************************************************/
function SterileUser(username,  friends, sentFriendRequests, receivedFriendRequests, games, visibility, profilePicture, wins, losses){
  this.id = username;
  this.friends = JSON.parse(JSON.stringify(friends)); //don't know if I need the JSON's //TODO come by and check
  this.sentFriendRequests = JSON.parse(JSON.stringify(sentFriendRequests));
  this.receivedFriendRequests = JSON.parse(JSON.stringify(receivedFriendRequests));
  this.games = JSON.parse(JSON.stringify(games));
  this.visibility = visibility;
  this.profilePicture = profilePicture;
  this.wins = wins;
  this.losses = losses;



}


/***************************************************
returns an array of user abjects that have stripped of
some of their sensitive data
***************************************************/
function sterilize(userArr){
  if(Array.isArray(userArr)){
    let sterilizedArr = [];
    for(let i = 0; i < userArr.length; i++){
      let newUser = new SterileUser(userArr[i].id, userArr[i].friends, userArr[i].sentFriendRequests, userArr[i].receivedFriendRequests,
         userArr[i].games, userArr[i].visibility, userArr[i].profilePicture, userArr[i].wins, userArr[i].losses);
      // console.log("the New user element");
      // console.log(newUser);
      sterilizedArr.push(newUser);

    }
    // console.log(Array.isArray(userArr));
    // console.log(sterilizedArr);
    return sterilizedArr;
  }else{
    //it isn't an Array
    let newUser = new SterileUser(userArr.id, userArr.friends, userArr.sentFriendRequests, userArr.receivedFriendRequests,
      userArr.games, userArr.visibility, userArr.profilePicture, userArr.wins, userArr.losses);
    return newUser;
  }

}
/***************************************************
make a summarize game object
***************************************************/
function SummarizedGame(gameObj){
  this.id = gameObj.id;
  this.winner = gameObj.winner;
  this.playerOne = gameObj.playerOne;
  this.playerTwo = gameObj.playerTwo;
  this.wasForfeited = gameObj.wasForfeited;
  if(gameObj.winner === '' ){
    this.isFinished === false;
  }else{
    this.isFinished === true;
  }
  this.numOfTurns = gameObj.turns.length;
}


/***************************************************
returns an array of game objects that have had their
 game objects summarized
***************************************************/
function makeSummaryOfGames(gameObjs){
  let summarizeGameObjs = [];
  for(let i = 0; i < gameObjs.length; i++){
    let tempGameObj = new SummarizedGame(gameObjs[i]);
    summarizeGamveObjs.push(tempGameObj);
  }
  return summarizeGameObjs;
}

/***************************************************
creates a game between two people if they are waiting
in a queue
***************************************************/
function beginGameLobby(){
  setInterval(function(){
    for(let i = 0; i < gameLobbySlowQueue.length; i++){
      for(let k = 0; k < gameLobbySlowQueue.length; k++){
        if(i === k ){
          continue;
        }
        if(gameLobbySlowQueue[i].visibility === gameLobbySlowQueue[k].visibility){
          let result =  model.addNewGame(gameLobbySlowQueue[i].username, gameLobbySlowQueue[k].username, gameLobbySlowQueue[k].username);
          if(result < 0){
            console.log("Warning: error in the setInterval, error code: " + result);
          }
          gameLobbySlowQueue.splice(i, 1); //remove one object
          if(i < k){
            gameLobbySlowQueue.splice(k-1, 1);
          }else{
            gameLobbySlowQueue.splice(k, 1);
          }
          break;
        }

      }
    }

  }, 4000);
}

beginGameLobby();


app.listen(port, () =>{
  console.log('my app is listening at http://locahost: ' + port);
});




//app.use(express.static(path.join(__dirname, 'public')));

/*
var myLogger = function(req, res, next){
  console.log('LOGGED');
  next();
}



app.use(myLogger);
*/
