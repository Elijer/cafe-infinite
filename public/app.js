document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();

    const db = firebase.firestore();

    const someUser = db.collection('users').doc('RyjhQwEZhXFq51WNhCCr');

    //console.log(app);
    
    /*someUser.get()
      .then(doc => {
        const data = doc.data();
        console.log(data.jose);
      })*/

      someUser.onSnapshot(doc => {

        const data = doc.data();
        console.log(data);
      })
});

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