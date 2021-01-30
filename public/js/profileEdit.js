let thisUser;


function init(){
    getCurrUser();

}


/*********************************************
request asks who this user is
**********************************************/
function getCurrUser(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        thisUser = JSON.parse(this.responseText); //this should be an array now?
        finishInit();
      }
   };

  xhttp.open("GET", "/thisUser",true);
  xhttp.send();
}

/*********************************************
finish the init after the thisUser loads
**********************************************/
function finishInit(){
  let form = document.getElementById("form");
  let strURL = "/users/" + thisUser.id;
  form.setAttribute("action", strURL);
  document.getElementById("menuLink").setAttribute('href', '/profile/' + thisUser.id);
  setupMenu();
}
//sets up the menu bar
function setupMenu(){
  document.getElementById('homeButton').setAttribute('href', '/home/' + thisUser.id);
  document.getElementById('profileButton').setAttribute('href', '/profile/' + thisUser.id);
  console.log("Menu is loaded");
}
