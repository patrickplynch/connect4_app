/*********************************************
Some simple JS for changes the hrefs
**********************************************/
let thisUser;

function init(){
  getTheCurrUser();
}

/*********************************************
changes the hrefs so they correspond to this user
**********************************************/
function setup(){
  document.getElementById('backButton').setAttribute('href', '/home/' + thisUser.id);

}

/*********************************************
request asks who this user is
**********************************************/
function getTheCurrUser(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        thisUser = JSON.parse(this.responseText);
        setup();

      }
   };

  xhttp.open("GET", "/thisUser", true);
  xhttp.send();
}
