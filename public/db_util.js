function testIfThisFileIsLoaded(){
    console.log("why yes it appears so!");
}
/*
function doesDocExist(init, _collection, _doc, ifDoc, ifNotDoc){
    if (init == true) const db = firebase.firestore();
    const docRef = db.collection(_collection).doc(doc);
    docRef.get().then(function(doc) {

}

const db = firebase.firestore();
const docRef = db.collection('businesses').doc(user.uid);
docRef.get().then(function(doc) {
  if (doc.data()) {
    console.log("And persistent user exists in DB. Okay! We'll let you stay logged in.");
    loginFormat(user.uid);
    populateMarket();
    document.getElementById("are-you-biz").innerText = 'Go to biz dash.';
  } else {
    console.log("Hmm weird. Your account has no data in the database. Sorry, we're gonna log you out.");
    logOut();
  }
}).catch(function(error) {
    console.log("Error getting document:", error);
});
*/