/*

Big To-DO
1. Learn how to do database migration stuff with firestore so I have the tools to back my shit up
2. Address firestore db rules
3. Do Unit testing and epxlore possibly using 'Jest' (there's a fireship video on it)
4. Add in a business name too cause it just looks depressing right now

Question
1. Can i create a state machine that communiates directly with vue to make the state visual?
  The idea is that all dom commands go to the state, and then the state doles them out to
  The dom, through Vue or through a framework of my choosing/creation.



0. Business stripe
1. If the "are you a business" button is pressed multiple times before the page redirects
the wrong state gets used. Avoid this, but if this error DOES happen, should return user back
to a page where they can try again
2. Can go through the "are you a business" without logging in. currently that's because
the button is not active. However, this shouldn't even be possible in the server --
the 
3. have to throw an error if, on login, the user isn't logged to the database.
4. 


######### Temp
function checkForUser(user){
  console.log(user);
  /*
  if (user){
    console.log("Okay, we found a user ID saved in the browser.");

    const db = firebase.firestore(); //will this fuck up the locahost thing?
    const docRef = db.collection('businesses').doc(user.uid);
    docRef.get().then(function(doc) {
      if (doc.data()) {
        console.log("And there seems to be data for for this account in the db. Okay! We'll let you stay logged in.");
        loginFormat(user.uid)
      } else {
        console.log("Hmm weird. Your account has no data in the database. Sorry, we're gonna log you out.");
        logOut();
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

  } else {
    console.log("No uid in browser");
  }
  userCheckComplete = true;
}

############ FIREBASE AUTH

function googleLogin(){
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
  .then(result => {
      document.getElementById("business-login").style.display = 'inline';
      const user = result.user;
      document.getElementById("banner-login").innerText = `${user.displayName}`;

      const db = firebase.firestore();
      const usersRef = db.collection('businesses').doc(user.uid);

      usersRef.get()
        .then((docSnapshot) => {
          if (!docSnapshot.exists) {
            let data = {
              name: user.displayName,
              email: user.email,
              profilePic: user.photoURL,
              createdAt: new Date()
            };
            usersRef.set(data, {merge: true}) // create the document
            console.log("new user created with the following data " + data);
          }
      })
      .catch(console.log);
  })
  .catch(console.log);
}



########## FIREBASE CALL EXAMPLES

####### (1) Check to see if a document exists with .get() and then looking at the snapshot
        (2) Then if it does, create and set data within that document.
      const db = firebase.firestore();
      const usersRef = db.collection('businesses').doc(user.uid);

      usersRef.get()
        .then((docSnapshot) => {
          if (!docSnapshot.exists) {
            let data = {
              name: user.displayName,
              email: user.email,
              profilePic: user.photoURL,
              createdAt: new Date()
            };
            usersRef.set(data) // create the document
            console.log("new user created with the following data " + data);
          }
      })
      .catch(console.log);



*/