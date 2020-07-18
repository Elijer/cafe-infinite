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