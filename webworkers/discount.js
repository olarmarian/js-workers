import renderProducts from "./util.js";
const discount = document.getElementById("discount");

if (window.Worker) {
  const discountWorker = new Worker("./discount-worker.js");
  discount.addEventListener("change", (e) => {
    const products = JSON.parse(localStorage.getItem("products"));
    discountWorker.postMessage([products, e.target.value]);
  });

  discountWorker.onmessage = (e) => {
    renderProducts(e.data);
    localStorage.setItem("products", JSON.stringify(e.data));
  };
} else {
  console.log("Browser does not support web workers");
}
