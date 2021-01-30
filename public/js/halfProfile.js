let thisUser;
let gamesArr = [];
let actualUser;

function init(){
  getActualUser()

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
  let href = window.location.href;
  let hrefArr = href.split('/');
  let username = hrefArr[hrefArr.length-1];

  xhttp.open("GET", "/thisUser?username=" + username, true); //I need the user object
  xhttp.send();
}

/*********************************************
request asks who this logged in user actually is
**********************************************/
function getActualUser(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        actualUser = JSON.parse(this.responseText); //this should be an array now?
        getCurrUser();
      }
   };

  xhttp.open("GET", "/thisUser", true); //I need the user object
  xhttp.send();
}




function setup(){
  document.getElementById('homeButton').setAttribute('href', '/home/' + actualUser.id);
  document.getElementById('profileButton').setAttribute('href', '/profile/' + actualUser.id);
  

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

  let headerText = document.createTextNode("The last " + completedGames.length + " completed games:\n")
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

   xhttp.open("GET", '/games?gameId=&isCompleted=false&isNotCompleted=false&detail=full&user=' + thisUser.id, true); //I need the user object
   xhttp.send();

}
