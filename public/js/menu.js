/*********************************************
Some simple JS that changes the href for the menu
link bar so that the links can use the proper username
for the profile, and home pages (i.e. profile/username)
**********************************************/
let thisMenuUser;

function initMenu(){
  getTheCurrUser();
}

/*********************************************
changes the hrefs so they correspond to this user
**********************************************/
function setup(){
  document.getElementById('homeButton').setAttribute('href', '/home/' + thisMenuUser.id);
  document.getElementById('profileButton').setAttribute('href', '/profile/' + thisMenuUser.id);
  console.log("Menu is loaded");
}

/*********************************************
request asks who this user is
**********************************************/
function getTheCurrUser(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        thisMenuUser = JSON.parse(this.responseText);
        setup();

      }
   };

  xhttp.open("GET", "/thisUser", true);
  xhttp.send();
}
