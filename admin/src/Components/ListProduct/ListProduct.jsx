import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../../assets/cross_icon.png"
const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/allProducts")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
      });
  };

  useEffect(()=>{
    fetchInfo()
  }, [])  //Only Rendered once.

  const remove_product = async(id) => {
    await fetch('http://localhost:4000/removeproduct',{
      method: 'POST',
      headers: {
        Accept : 'application/json',
        "Content-Type" : "application/json"
      },
      body: JSON.stringify({id: id})
    })
    await fetchInfo(); //After removing we are calling fetchInfo Again
  }


  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Product</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr className="listproduct-allproducts-hr" />
          {allProducts.map((product, index) => {
            return <><div key={index} className="listproduct-format-main listproduct-format">
              <img src={product.image} alt="" className="listproduct-product-icon" />
              <p>{product.name}</p>
              <p><span>&#8377;</span>{product.old_price}</p>
              <p><span>&#8377;</span>{product.new_price}</p>
              <p>{product.category}</p>
              <img onClick= {() => {remove_product(product.id)}} src={cross_icon} alt="" className="listproduct-remove-icon" />
            </div>
            <hr className="listproduct-hr-after-eachitem"/>
            </>
          }) }
      </div>
    </div>
  );
};

export default ListProduct;
