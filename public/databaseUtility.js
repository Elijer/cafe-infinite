
const makeQuery = (_db) => new Promise((resolve) => {
    _db.collection("businesses").where("status", "==", "doingBusiness")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          const d = doc.data();
          const data = {
            biz: d.stripeBusinessID,
            prod: d.product,
            price: "$" + d.price
          }
          addRoo(data); // Create a row for each document returned from db
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
});



function addRoo(d) {
    const row = document.createElement('tr');
    row.className = 'product-row';
  
    row.innerHTML =
    `
        <td class = "td-first"> ${d.biz} </td>
        <td> ${d.prod} </td>
        <td class = "td-money"> ${d.price} </td>
        <td class = "product-detail-last" onclick = "buyProduct('${d.biz}')" > buy </td>
    `;
  
    document.getElementById('product-table').appendChild(row);
  
}