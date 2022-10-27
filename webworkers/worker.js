onmessage = function (e) {
  const [products, increaseValue] = e.data;
  const increasedProducts = products.map((product) =>
    getIncreased(product, increaseValue)
  );
  postMessage(increasedProducts);
};

const getIncreased = (product, value) => {
  return {
    ...product,
    price: product.price + value,
  };
};
