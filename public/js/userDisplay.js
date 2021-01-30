/*******************************************************************************
NO LONGER NEED, ALL FUNCTIONALLITY HAS BEEN PUT ONTO search.js DELETE THIS LATER


This is the javascript for updating the friends relationship page
it is very similar to the search page as it is pretty much the same thing except
we are only going through all of the friends

*******************************************************************************/
let thisUser;
let usersArr; //the array of users for this page, pending on whether or not this is the friends page or friendRelations page


/*********************************************
starts with getting the current user's information
then gets their friends or there friend requests
then displays everything on the page, and
setups event handlers
**********************************************/
function init(){
    getCurrUser();
}


/*********************************************
requests an array of Friends of this user from the server and then calls displaySearch when
the data is received

TODO: accepted queries are:
 name *done
 page-size
 page
**********************************************/
function getFriends(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let usersArr = JSON.parse(this.responseText); //this should be an array now?
        display(usersArr);
      }
   };

  xhttp.open("GET", "/users/" + thisUser.id + "/friends", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.send();

}

/*********************************************
requests an array of users who have some sort of friend relationship
with this user from the server and then calls displaySearch when
the data is received

TODO: accepted queries are:
 name *done
 page-size
 page
**********************************************/
function getFriendRelationShips(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let usersArr = JSON.parse(this.responseText); //this should be an array now?
        display(usersArr);
      }
   };

  xhttp.open("GET", "/users/" + thisUser.id + "/friend-requests", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.send();

}




/*********************************************
request asks who this user is
**********************************************/
function getCurrUser(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        thisUser = JSON.parse(this.responseText); //this should be an array now?

        let url = window.location.href; //shows use what page we are on
        let strArr = url.split('/');
        if(strArr[strArr.length -1] === 'friends'){
          //then we are on the friends page\
          getFriends()
        }else{
          //this is the not friends page (it is the friends)
          getFriendRelationShips()
        }
      }
   };

  xhttp.open("GET", "/thisUser", true);
  xhttp.send();
}

/*********************************************
sets up the menu appropriately
**********************************************/
function setupMenu(){
  document.getElementById('homeButton').setAttribute('href', '/home/' + thisUser.id);
  document.getElementById('profileButton').setAttribute('href', '/profile/' + thisUser.id);
  console.log("Menu is loaded");
}


/*********************************************
actually displays the html elements from the userArr
**********************************************/
function display(usersArr){
  setupMenu(); //setup the menu
  let parent = document.getElementById("mainDiv");
  //delete any current children of the mainDiv
  parent.innerHTML = ''; //should delete all of the children too

  //create the new mainDiv children
  for(let i = 0; i <usersArr.length; i++){
    //don't display ourself
    if(thisUser.id === usersArr[i].id){
      continue;
    }

    //create the picture, username, and button elements
    let innerPicElement = document.createElement("img");
    innerPicElement.setAttribute('src', '/images/icons8-customer-52.png');
    innerPicElement.setAttribute('class', "inlinePic");
    innerPicElement.setAttribute('alt', "Profile Photo");

    let innerHeader = document.createElement("h3");
    innerHeader.innerHTML = usersArr[i].id;
    innerHeader.setAttribute("class", "centeredParagraph");

    //configure the button

    let innerButton = document.createElement("button");
    let innerButton2; //the second button not always needed
    innerButton.setAttribute("style", "float: right; margin-top: 20px;margin-bottom:10px; margin-right:10px; margin-left:10px;");
    innerButton.setAttribute("id", usersArr[i].id); //the button id is the id of the user
    if(thisUser.friends.includes(usersArr[i].id)){
      //they are friends
      innerButton.innerHTML = "delete friend connection";
      innerButton.addEventListener("click", deleteFriendOnClick);

    }else{
      //they are not friends/not friends yet

      if(thisUser.sentFriendRequests.includes(usersArr[i].id)){
        //then you have recently sent a friends request
        innerButton.innerHTML = "undo friend request?";
        innerButton.addEventListener("click", removeSentFriendRequestOnClick);

      }else if(thisUser.receivedFriendRequests.includes(usersArr[i].id)){
        //then they have already sent a request to you
        innerButton.innerHTML = "accept friend request?";
        innerButton.addEventListener("click", addFriendOnClick);

        innerButton2 = document.createElement("button");
        innerButton2.setAttribute("style", "float: right;margin-bottom:10px; margin-right:10px; margin-left:10px; ");
        innerButton2.setAttribute("id", usersArr[i].id+'2'); //the button id is the id of the user
        innerButton2.innerHTML = "decline friend request?";
        innerButton2.addEventListener("click", removeReceivedFriendRequestOnClick);

      } else{
        //no friend relationship yet
        innerButton.innerHTML = "send friend request";
        innerButton.addEventListener("click", sendFriendRequestOnClick);

      }
    }

    let innerElement = document.createElement("div"); //new div element
    if(innerButton2 !== undefined){
      innerElement.appendChild(innerPicElement);
      innerElement.appendChild(innerButton);
      innerElement.appendChild(innerButton2);
    }else{
      innerElement.appendChild(innerPicElement);
      innerElement.appendChild(innerButton);
    }


    let childNode = document.createElement("div"); //new div element
    childNode.setAttribute("class","centerContent transWhite");
    childNode.appendChild(innerHeader);
    childNode.appendChild(innerElement);

    //add everything to the page
    parent.appendChild(childNode);

  }
}
//*****************************event listener functions*****************************
//I need this functions named so that I can remove them later when updating the page

/*********************************************
adds an event listener for clicking the button for
send friend requests
**********************************************/
function sendFriendRequestOnClick(){
  addFriendRequest(thisUser.id, this.id);
}


/*********************************************
adds an event listener for clicking the button for
undoing sent friends requests
**********************************************/
function removeSentFriendRequestOnClick(){
  removeFriendRequest(thisUser.id, this.id);
}

/*********************************************
adds an event listener for clicking the button for
confirming a friend request (accepting)
**********************************************/
function addFriendOnClick(){
  addFriend(thisUser.id, this.id);
}

/*********************************************
adds an event listener for clicking the button for
deleting a friend connection
**********************************************/
function deleteFriendOnClick(){
  deleteFriend(thisUser.id, this.id);
}

/*********************************************
adds an event listener for clicking the button for
declining a friend request
**********************************************/
function removeReceivedFriendRequestOnClick(){
  removeReceivedFriendRequest(thisUser.id, this.id);
}

//*****************************XMLHttpRequest functions*****************************

/*********************************************
send a POST to allow users to make a friends request
**********************************************/
function addFriendRequest(userId, friendId){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let thisButton = document.getElementById(friendId);
        thisButton.removeEventListener("click", sendFriendRequestOnClick); //removes the previous event listener
        thisButton.innerHTML = "undo friend request?";
        thisButton.addEventListener("click", removeSentFriendRequestOnClick);
      }
   };
  xhttp.open("POST", "/users/"+ userId + "/sent-friend-request", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.setRequestHeader("Content-type", 'application/x-www-form-urlencoded');
  xhttp.send("friendId=" + friendId);

}

function removeFriendRequest(userId, friendId){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let thisButton = document.getElementById(friendId);
        thisButton.removeEventListener("click", removeSentFriendRequestOnClick); //removes the previous event listener
        thisButton.innerHTML = "send friend request";
        thisButton.addEventListener("click", sendFriendRequestOnClick);
      }
   };
  xhttp.open("DELETE", "/users/"+ userId + "/sent-friend-request", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.setRequestHeader("Content-type", 'application/x-www-form-urlencoded'); //we need the content header to be set so that we can use req.body...
  xhttp.send("friendId=" + friendId);

}

function addFriend(userId, friendId){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let thisButton = document.getElementById(friendId);
        thisButton.innerHTML = "delete friend connection";
        thisButton.removeEventListener("click", addFriendOnClick); //removes the previous event listener
        thisButton.addEventListener("click", deleteFriendOnClick);
      }
   };
  xhttp.open("POST", "/users/"+ userId + "/friends", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.setRequestHeader("Content-type", 'application/x-www-form-urlencoded');
  xhttp.send("friendId=" + friendId + "&answer=true");
}

function deleteFriend(userId, friendId){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let thisButton = document.getElementById(friendId);
        thisButton.removeEventListener("click", deleteFriendOnClick); //removes the previous event listener
        thisButton.innerHTML = "send friend request";
        thisButton.addEventListener("click", sendFriendRequestOnClick);
      }
   };
  xhttp.open("DELETE", "/users/"+ userId + "/friends", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.setRequestHeader("Content-type", 'application/x-www-form-urlencoded');
  xhttp.send("friendId=" + friendId);
}


function removeReceivedFriendRequest(userId, friendId){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //dealing with the secondary button
        console.log(friendId);
        let thisButton2 = document.getElementById(friendId);
        thisButton2.removeEventListener("click", removeReceivedFriendRequestOnClick); //removes the previous event listener
        thisButton2.parentNode.removeChild(thisButton2); //remove this button

        //now dealing with the main button
        let thisButton = document.getElementById(friendId.substring(0, friendId.length - 1));
        thisButton.removeEventListener("click", addFriendOnClick); //removes the previous event listener
        thisButton.innerHTML = "send friend request";
        thisButton.addEventListener("click", sendFriendRequestOnClick);
      }
   };
   xhttp.open("DELETE", "/users/"+ userId + "/received-friend-request", true); //add a Math.random() to the query so that we do not get a cached result...
   xhttp.setRequestHeader("Content-type", 'application/x-www-form-urlencoded');
   xhttp.send("friendId=" + friendId.substring(0, friendId.length - 1) + "&answer=false");
}
