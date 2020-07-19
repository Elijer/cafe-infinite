var dbu = {};



// ##### GETS MULTIPLE DOCUMENTS MATCHING CERTAIN PARAMETERS #########################
dbu.where = (_db, collection, a, enumerator, b, callback) => new Promise((resolve) => {

    _db.collection(collection).where(a, enumerator, b)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          const d = doc.data();
          const data = {
            bizID: d.stripeBusinessID,
            bizName: d.businessName,
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



// ##### GETS A DOCUMENT AND RETURNS ITS DATA #########################
dbu.isThere = (_db, collection, id) => new Promise((resolve) => {
    const docRef = _db.collection(collection).doc(id); 
    docRef.get()
    .then(function(doc){
        const d = doc.data();
        resolve(d);
    }).catch(function(error){
        console.log("Error with isThere dbu function ", error);
    });
});



// ##### ADDS A DOCUMENT #########################
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