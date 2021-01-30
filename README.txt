Created by: Cyril Patrick Lynch
Student No: 101169963

FOR MORE INFORMATION ABOUT THIS SERVER AND HOW TO OPERATE IT GO TO THE FINAL SUBMISSION REPORT!

http://localhost:9999/login
-One of the user's have: username= Pat, and password= 1234

app.js	This is the main server, contains all of the routes that a client can pull from. This server only interacts with the Client, resources in the public folder and the model.js file. It does not interact directly with the databasecontroller.js file. 

model.js	This file contains essentially all of the business logic and helps maintain data integrity and prevent poor queries and poor interactions with the databasecontroller.js file that would otherwise cause server errors

database-controller.js	This file contains a little bit of business logic but is mostly occupying the space of a database. It would be the file that would interact with the database, preventing poor queries and making sure that we don’t break basic rules (like visibility can only be set to ‘pub’, ‘pri’, ‘fri’, or ‘del’). Most of the querying work is done in this file as well as that would typically be a job for the database. 
public/views	all of the structure for the website. This folder includes all of the pug files as well as a includes folder which contains the pug files used via the include keyword 
public/css	Contains a single site wide css file. Every web page on the site uses this file
public/js	Contains all of the JavaScript files used on the client side of the website. Most of files are named according to what pug file uses them. 






