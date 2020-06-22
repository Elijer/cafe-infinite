/*

1. If the "are you a business" button is pressed multiple times before the page redirects
the wrong state gets used
2. Can go through the "are you a business" without logging in. currently that's because
the button is not active. However, this shouldn't even be possible in the server --
the 
3. have to throw an error if, on login, the user isn't logged to the database.
4. 



FIREBASE CALL EXAMPLES

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