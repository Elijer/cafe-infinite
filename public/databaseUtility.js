var dbu = {};



dbu.where = (_db, collection, a, enumerator, b, callback) => new Promise((resolve) => {

    _db.collection(collection).where(a, enumerator, b)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          const d = doc.data();
          const data = {
            biz: d.stripeBusinessID,
            prod: d.product,
            price: "$" + d.price
          }
          callback(data); // run this function for each document returned from db
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

});


dbu.isThere = (_db, collection, id) => new Promise((resolve) => {
    const docRef = _db.collection(collection).doc(id); 
    docRef.get()
    .then(function(doc){
        const d = doc.data();
        resolve(d);
    })
});

dbu.addDoc = (_db, collection, id, data) => new Promise((resolve) => {
    const usersRef = _db.collection(collection).doc(id);
    usersRef.get()
      .then((docSnapshot) => {
        if (!docSnapshot.exists) {
          usersRef.set(data, {merge: true}) // create the document
          console.log("new anon user created in db for UID:  " + id);
        }
      })
    .catch(console.log);
});