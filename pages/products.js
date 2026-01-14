import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await api.get("/products");
      setProducts(res.data.data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Products</h1>
      {products.map((p) => (
        <div key={p.id}>
          <h2>{p.name}</h2>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}
