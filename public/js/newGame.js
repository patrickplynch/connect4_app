/*********************************************
Some simple JS for changes the hrefs
**********************************************/
let thisUser;
let usersArr;

function init(){
  getTheCurrUser();
}

/*********************************************
changes the hrefs so they correspond to this user
**********************************************/
function setup(){
  document.getElementById('backButton').setAttribute('href', '/home/' + thisUser.id);
  let mySelect = document.getElementById('friendId');
  for(let i = 0; i < thisUser.friends.length; i++){
    let newOption = document.createElement('option');
    newOption.text = thisUser.friends[i];
    mySelect.add(newOption);
  }
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


/*********************************************
TODO: delete this is no longer needed
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
        usersArr = JSON.parse(this.responseText); //this should be an array now?

      }
   };

  xhttp.open("GET", "/users/" + thisUser.id + "/friends", true); //add a Math.random() to the query so that we do not get a cached result...
  xhttp.send();

}
