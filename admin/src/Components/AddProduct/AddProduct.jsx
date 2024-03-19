import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
const AddProduct = () => {
  const [image, setImage] = useState(false);

  const imageHandler = (e) => {
    setImage(e.target.files[0]); // Here we change the state input tag onChange with the new image
  };

  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: "",
  });

  const changeHandler = (e) => {
    setProductDetails({
      ...productDetails,
      [e.target.name]: e.target.value,
    });
  }; //Updating the state values of the productDetails Object.

  const Add_Product = async () => {
    console.log(productDetails);
    let responseData;
    let product = productDetails;

    let formData = new FormData(); //This creates an empty form data
    formData.append("product", image); //Appends takes argument as (fieldname, value)

    await fetch("http://localhost:4000/upload", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((resp) => resp.json()) //Here we get the promise. resp.json passes the parse data to next then.
      .then(
        (data) => {
          responseData = data;
        } //Then the data is saved in responseData.
      );

    if (responseData.success) {
      //If the condition is true then the image has been stored in multer storage.
      product.image = responseData.image_url; //The image url will be added to product database.
      console.log(product); //Till here we have received the product details Now we have to send the details to the addProduct endPoint so , that it will be added to the database.
      await fetch("http://localhost:4000/addproduct", {
        method: "POST",
        headers: {
          Accept: "application/json", //This indicates the types of response data the client can accept
          "Content-Type": "application/json", //This specifies the format of the data being sent in the request body.
        },
        body: JSON.stringify(product), //The product is in JSON format so we have to change it to the string.
      })
        .then((resp) => resp.json()) //The data is parsed
        .then((data) =>
          data.success ? alert("Product is added") : alert("Failed")
        );
    }
  };

  //Above the changeHandler method is used for updating the state of productDetails and Add_product method is used to add the image URL to the database and returive it whenever it is needed.

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input
          onChange={changeHandler}
          value={productDetails.name}
          type="text"
          name="name"
          placeholder="Type Here"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            onChange={changeHandler}
            value={productDetails.old_price}
            type="text"
            name="old_price"
            placeholder="Type Here"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            onChange={changeHandler}
            value={productDetails.new_price}
            type="text"
            name="new_price"
            placeholder="Type Here"
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector">
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kids</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className="addproduct-thumbnail-img"
            alt=""
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
        />
      </div>
      <button
        onClick={() => {
          Add_Product();
        }}
        className="addproduct-btn">
        ADD
      </button>
    </div>
  );
};

//URL.createObjectURL(image) refers to thtat URL is a buildin Javascript object that provides the functionality related to URL's and .createObjectURL(image) creates a temporary blob url for the image. WE can use this to diaplay the image within HTML Tags to load that image in URL's

export default AddProduct;
