import products from "./data.js";
import renderProducts from "./util.js";
let currentProducts = products;
localStorage.setItem('products', JSON.stringify(currentProducts))

const onIncrease = () => {
  if (window.Worker) {
    const worker = new Worker("./worker.js");

    const value = Number(document.getElementById("value").value) || 1;
    const products = JSON.parse(localStorage.getItem('products'))
    worker.postMessage([products, value]);

    worker.onmessage = (e) => {
      currentProducts = e.data;
      localStorage.setItem('products', JSON.stringify(currentProducts))
      renderProducts(currentProducts);
      worker.terminate();
    };
  } else {
    console.log("Browser does not support workers");
  }
};

const increaseBtn = document.getElementById("increase");
increaseBtn.addEventListener("click", onIncrease);

renderProducts(currentProducts);
