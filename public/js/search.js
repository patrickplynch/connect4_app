/*******************************************************************************
This is the javascript for updating the search page also used for the friends page
and for the friendRelations page

*******************************************************************************/
let isToggled = false;

/*********************************************
starts with getting the current user's information
then gets their friends or there friend requests
then displays everything on the page, and
setups event handlers
**********************************************/
function init(){
    getCurrUser();
}
let thisUser;

/*********************************************
requests an array of users from the server and then calls displaySearch when
the data is received

accepted queries are:
 name
 page-size
 page
**********************************************/
function sendSearch(){
  let str = document.getElementById('search').value;
  if(str === null){
    str = '';
  }
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let usersArr = JSON.parse(this.responseText); //this should be an array now?
        displaySearch(usersArr);
      }
   };

  xhttp.open("GET", "/users?name=" + str, true); //add a Math.random() to the query so that we do not get a cached result...
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
          setupFriendsPage();
        }else if(strArr[strArr.length -1] === 'friend-requests'){
          //this is the not friends page (it is the friends)
          getFriendRelationShips()
        }else{
          //then this is the search page
          document.getElementById('search').addEventListener('input', sendSearch);
          sendSearch();
        }
      }
   };

  xhttp.open("GET", "/thisUser", true);
  xhttp.send();
}

/*********************************************
gets the settings drop down ready and then gets friends
**********************************************/
function setupFriendsPage(){
  let toggleShowOnlyLoggedOn = document.getElementById("toggleShowOnlyLoggedOn");
  toggleShowOnlyLoggedOn.setAttribute('class', 'buttonIsNotToggled')
  toggleShowOnlyLoggedOn.addEventListener('click', function(){
    if(toggleShowOnlyLoggedOn.className === 'buttonIsNotToggled'){
      //then toggle it
      toggleShowOnlyLoggedOn.setAttribute('class', 'buttonIsToggled');
      isToggled = true;
    }else{
      toggleShowOnlyLoggedOn.setAttribute('class', 'buttonIsNotToggled');
      isToggled = false;
    }
    if(isToggled){
      getLoggedOnFriends();
    }else{
      getFriends();
    }

  });

  if(isToggled){
    getLoggedOnFriends();
  }else{
    getFriends();
  }

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
requests an array of Friends of this user from the server and then calls displaySearch when
the data is received

TODO: accepted queries are:
 name *done
 page-size
 page
**********************************************/
function getLoggedOnFriends(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let usersArr = JSON.parse(this.responseText); //this should be an array now?
        display(usersArr);
      }
   };

  xhttp.open("GET", "/users/" + thisUser.id + "/friends?loggedOn=true", true); //add a Math.random() to the query so that we do not get a cached result...
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
sets up the menu appropriately
**********************************************/
function setupMenu(){
  document.getElementById('homeButton').setAttribute('href', '/home/' + thisUser.id);
  document.getElementById('profileButton').setAttribute('href', '/profile/' + thisUser.id);
  console.log("Menu is loaded");
}


/*********************************************
Creates multiple mini profiles to when based on what the user searched for
**********************************************/
function displaySearch(usersArr){
  //checking to make sure that thisUser is initialized
  //I sometimes get undefined but it is getting really hard to replicate
  if(thisUser === undefined){
    setTimeout(function(){
      if(thisUser === undefined){
        location.reload(); //reload the page networking not working...
      }else{
        display(usersArr);
      }
    }, 1000);
  }else{
    display(usersArr)
  }
  console.log(usersArr);
  console.log(thisUser);
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

    //creating the name href link
    let innerHeader = document.createElement("h3");
    //innerHeader.innerHTML = usersArr[i].id;
    innerHeader.setAttribute("class", "centeredParagraph");

    let namelink = document.createElement('a');
    let namelinkText = document.createTextNode(usersArr[i].id);
    namelink.appendChild(namelinkText);
    namelink.title = usersArr[i].id;
    namelink.setAttribute('href', '/profile/' + usersArr[i].id);

    innerHeader.appendChild(namelink);

    //configure the button

    let innerButton = document.createElement("button");
    let innerButton2; //the second button not always needed
    innerButton.setAttribute("style", "float: right; margin-top: 20px;margin-bottom:10px; margin-right:10px; margin-left:10px;");
    innerButton.setAttribute("id", usersArr[i].id); //the button id is the id of the user
    if(thisUser.friends.includes(usersArr[i].id)){
      //they are friends
      innerButton.innerHTML = "unfriend";
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
        thisButton.innerHTML = "unfriend";
        thisButton.removeEventListener("click", addFriendOnClick); //removes the previous event listener
        thisButton.addEventListener("click", deleteFriendOnClick);

        //dealing with button2
        let thisButton2 = document.getElementById(friendId+'2');
        thisButton2.removeEventListener("click", removeReceivedFriendRequestOnClick); //removes the previous event listener
        thisButton2.parentNode.removeChild(thisButton2); //remove this button
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














//end
