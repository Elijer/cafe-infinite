document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();

    const db = firebase.firestore();

    //const products = db.collection('products').doc('HzTEK6EP0ekwxeSVwx1n');

    //console.log(app);
    
    /*products.get()                //get a single product
      .then(doc => {
        const data = doc.data();
        console.log(data.name);
      })*/

      /*products.onSnapshot(doc => { //get a single product whenever db changes. also does this when app loads, unfortunately. It probably does this because it's still loading though, soooo if I just move it maybe it will act differently
        const data = doc.data();
        newElement(data.name);
        //document.write(data.name + `<br>`);
      })*/



      const productsRef = db.collection('products');
      const query = productsRef.where('price', '<', 10); // where is a db qeury. here it's saying, get all products with a price that is less than 10
      console.log({query});
      query.get()
        .then(products => {
          products.forEach(doc => {
            data = doc.data()
            newElement(data.name + " at $" + data.price);
          })
        })


});

function newElement(theText){
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