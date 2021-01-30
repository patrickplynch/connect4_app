/*********************************************
Some simple JS that changes the action for the form to match
the routing so that we have a  POST users/username
**********************************************/

function init(){
    let form = document.getElementById("form");
    let username = document.getElementsByName("username");
    console.log(username);
    username[0].addEventListener('input', function(){
      let strURL = "/users/" + this.value;
      form.setAttribute("action", strURL);
      console.log(strURL);
    });


    

}
