document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();

    const db = firebase.firestore();

    const products = db.collection('products').doc('HzTEK6EP0ekwxeSVwx1n');

    //console.log(app);
    
    /*products.get()     //get a single product
      .then(doc => {
        const data = doc.data();
        console.log(data.name);
      })*/


      products.onSnapshot(doc => { //get a single product when it changes. also does this when app loads, unfortunately
        const data = doc.data();
        newElly(data.name);
        //console.log(data);
        //document.write(data.name + `<br>`); //adds new line for every change in this item, eggs
      })
});

function newElly(theText){
  var node = document.createElement("h1");                 // Create a <li> node
  node.id = "testies";            //give it an ID
  node.innerText = theText;
  document.getElementById("theList").appendChild(node);              // Append the text to <li>
}

// Auth function
function googleLogin(){
    //Logins in user to google
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)

    .then(result => {
        const user = result.user;
        console.log(user);
        //document.write(`Hello ${user.displayName}`);
        document.getElementById("banner-login").innerText = `${user.displayName}`;
        //use the user object for something if you want
    })
    .catch(console.log);
}

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}








/*
//Map Function
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 0, lng: 0},
      zoom: 3,
      styles: [{
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]  // Turn off POI.
      },
      {
        featureType: 'transit.station',
        stylers: [{ visibility: 'off' }]  // Turn off bus, train stations etc.
      }],
      disableDoubleClickZoom: true,
      streetViewControl: false,
    });
    console.log(map);
}*/