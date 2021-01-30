let thisUser;
let gamesArr = [];

function init(){
  //using the Pat in the url to get user name quickly
  let url = window.location.href;
  url += "/friends";
  document.getElementById("friendsHREF").setAttribute('href', url);

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
        setup();
        sendSearch();
      }
   };

  xhttp.open("GET", "/thisUser", true); //I need the user object
  xhttp.send();
}


function setup(){
  document.getElementById('homeButton').setAttribute('href', '/home/' + thisUser.id);
  document.getElementById('profileButton').setAttribute('href', '/profile/' + thisUser.id);
  document.getElementById('profileEdit').setAttribute('href', '/profile/' + thisUser.id + '/profile-edit');
  document.getElementById("friendRequestsHREF").setAttribute('href', '/profile/' + thisUser.id + '/friend-requests');
  document.getElementById("friendRequestsHREF").innerHTML = "(" + (thisUser.receivedFriendRequests.length + thisUser.sentFriendRequests.length) + ')' ;

  //setting up privacy settings to look better
  let allTextInParagraph = document.createElement('p')
  let privacyLine1;
  if(thisUser.visibility === 'pub'){
    privacyLine1 = document.createTextNode("Privacy Settings: Public (visible to all)")
  }else if(thisUser.visibility === 'pri'){
    privacyLine1 = document.createTextNode("Privacy Settings: Private (visible to no one)")
  }else if(thisUser.visibility === 'fri'){
    privacyLine1 = document.createTextNode("Privacy Settings: Friends Only (visible to only your friends)")
  }
  let privacyLine2 = document.createTextNode("Profile Name: " + thisUser.id);

  allTextInParagraph.appendChild(privacyLine1);
  allTextInParagraph.appendChild(document.createElement("br"));
  allTextInParagraph.appendChild(privacyLine2);
  document.getElementById("privacySettings").appendChild(allTextInParagraph);


  document.getElementById('pageTitle').innerHTML= thisUser.id; //updating the notifications
  let titleLink = document.createElement('a');
  titleLink.setAttribute('href', '/profile/' + thisUser.id + '/friend-requests');
  titleLink.innerHTML = "(notifications)";
  document.getElementById('pageTitle').appendChild(titleLink);



  console.log("Menu is loaded");
}



/*********************************************
updaet the last 5 game section of the profile

let vsHref = document.createElement('a');
vsHref.style.color = "yellow";
let vsText = document.createTextNode(thisGame.playerTwo);
vsHref.appendChild(vsText);
vsHref.title = thisGame.playerTwo;
vsHref.setAttribute('href', '/profile/' +thisGame.playerTwo);
**********************************************/
function updateLastFiveGames(){
  let parent = document.getElementById('previousFiveGames');
  let allText = document.createElement('p');
  let breakElement = document.createElement('br');


  let completedGames = []
  for(let k = 0; k < gamesArr.length; k++){
    if((gamesArr[k].playerOne === thisUser.id || gamesArr[k].playerTwo === thisUser.id) && gamesArr[k].winner !== ''){
      completedGames.push(gamesArr[k]);
    }
  }
  //now sort this array
  completedGames.sort(function(a, b){
    return a.id - b.id;
  });
  let preHeaderText = document.createTextNode("Game History:");
  let breakElement2 = document.createElement('br');
  let breakElement3 = document.createElement('br');
  allText.appendChild(preHeaderText);
  allText.appendChild(breakElement2 );
  allText.appendChild(breakElement3 );



  let headerText = document.createTextNode("The last " + completedGames.length + " completed games:")
  allText.appendChild(headerText);
  allText.appendChild(breakElement);



  for(let i = 0; i < completedGames.length && i < 5; i++){
    let newBreakElement = document.createElement('br');
    let vsText = document.createTextNode(" vs ");




    //setting up PlayerOne
    let playerOne = document.createElement('a');
    let playerOneText = document.createTextNode(completedGames[i].playerOne);
    playerOne.appendChild(playerOneText);
    playerOne.title = completedGames[i].playerOne;
    playerOne.setAttribute('href', '/profile/' +completedGames[i].playerOne);

    //setting up PlayerTwo
    let playerTwo = document.createElement('a');
    let playerTwoText = document.createTextNode(completedGames[i].playerTwo);
    playerTwo.appendChild(playerTwoText);
    playerTwo.title = completedGames[i].playerTwo;
    playerTwo.setAttribute('href', '/profile/' +completedGames[i].playerTwo);

    //setting up The post text with a link to the game in question
    let gameLink = document.createElement('a');
    let gameLinkText = document.createTextNode("check out the game");
    gameLink.appendChild(gameLinkText);
    gameLink.title = "check out the game";
    gameLink.setAttribute('href', '/search/games?' +'gameId=' + completedGames[i].id + '&detail=full&isCompleted=true&isNotCompleted=false&user=');

    let resultsText;
    if(thisUser.id === completedGames[i].winner){
      resultsText = document.createTextNode(" - You won this game (number " + completedGames[i].id + ") after " + completedGames[i].turns.length + " turns ")
    }else{
      resultsText = document.createTextNode(" - You lost this game (number " + completedGames[i].id + ") after " + completedGames[i].turns.length + " turns ")
    }

    allText.appendChild(playerOne);
    allText.appendChild(vsText);
    allText.appendChild(playerTwo);
    allText.appendChild(resultsText);
    allText.appendChild(gameLink);
    allText.appendChild(newBreakElement);

  }

//setting up text that points to all of this user's games
let allGames = document.createElement('a');
let allGamesText = document.createTextNode("Browse Through All of Your Games?");
allGames.appendChild(allGamesText);
allGames.title = "Browse Through All of Your Games?";
allGames.setAttribute('href', '/search/games?' +'gameId=&isCompleted=false&detail=full&isNotCompleted=false&user=' + thisUser.id);

let breakElement4 = document.createElement('br');
allText.appendChild(breakElement4);
allText.appendChild(allGames);




parent.appendChild(allText);
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
        console.log(gamesArr);
        updateLastFiveGames();
      }
   };

   xhttp.open("GET", '/games?gameId=&isCompleted=false&detail=full&isNotCompleted=false&user=' + thisUser.id, true); //I need the user object
   xhttp.send();

}





//end
