const list = document.getElementById("list");

const renderProducts = (products) => {
  list.innerHTML = "";
  products?.forEach((product) => {
    const li = `<li>${product.name} - $${product.price}</li>`;
    list.innerHTML += li;
  });
};

export default renderProducts;
