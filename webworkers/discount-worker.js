onmessage = (e) => {
  const [products, value] = e.data;
  const percentage = Number(value);
  console.log(products, 'aa');
  const data = applyDiscount(products, percentage);
  postMessage(data);
};

const applyDiscount = (products, value) => {
  return products?.map((product) => {
    return {
      ...product,
      price: product.price - (product.price * value) / 100,
    };
  });
};
