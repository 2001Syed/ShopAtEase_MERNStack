const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path"); //Using this path we can get access into backend directory in our express application
const cors = require("cors");

app.use(express.json()); // With the help of this JSON ehatever request we get from response that will automatically parsed to JSON.
app.use(cors()); // Using this our react JS projrct will connect to express app on 4000 port  and can access the data

//Database Connection with mongodb
mongoose.connect(
  "mongodb+srv://greatstackdev:007007007@cluster0.wnmjanl.mongodb.net/e-commerce"
); // Now mongodb is connected to express server.
//The URL Can be presented in DOTEnv and then we can work with it. In the last of the URL we have to add the database name to it.

//API Creation

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

//Image Storage Engine

const storage = multer.diskStorage({   
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
        //we cannot use any other variable instead of cb. The cb function is used to signal success (by passing null as the first argument) and provide the generated filename as the second argument. Without this callback, Multer may not know how to proceed with saving the file or handling any potential issues.

    //Multer receives the constructed filename through the cb function and uses it to save the uploaded file to the specified location within the diskStorage configuration.

    //EXpected Output of this return be "fieldname_timestamp.original_extension" and the example is "profile_photo_1667546400000.jpg", Timestamp is used to make the file name unique from all.
  },
});

const upload = multer({storage :storage}) // Here we created an upload with storage filename configuration

//Creating upload endpoint for images
app.use("/images", express.static('upload/images')); //This helps in accessing the images using url.

app.post("/upload", upload.single('product'),(req,res) => {
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

//Schema For creating products

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required : true,
  },
  name : {
    type:  String,
    required : true,
  },
  image : {
    type : String,
    required: true,
  },
  category : {
    type : String,
    required: true,
  },
  new_price : {
    type : Number,
    required : true,
  },
  old_price : {
    type : Number,
    required: true,
  },
  date: {
    type : Date,
    default : Date.now(),
  },
  available: {
    type: Boolean,
    default: true,
  },
})


//An API for adding the product to database.
app.post('/addproduct', async (req, res) => {
  let products = await Product.find({}); //An empty object mean we are trying to get all the elements from the product
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1); //Slice is used to extract a portion from an array.
    let last_product = last_product_array[0]; // we get the last product.
    id = last_product.id + 1;
  }else {
    id = 1;
  }
  const product = new Product({  //Here we created an object of Product and add  the data from req to it
    id: id, 
    name : req.body.name , 
    image : req.body.image,
    category : req.body.category,
    new_price : req.body.new_price,
    old_price : req.body.old_price,
  })
  console.log(product);
  await product.save(); // Using this mwthod the product is automatically saved in database
  console.log("saved!");
  res.json({ //To generate the response on the front end.
    success : true,
    name: req.body.name,
  })
})


//An API for deleting and removing a product to database.

app.post('/removeproduct',async (req, res) => {
  await Product.findOneAndDelete({id : req.body.id}) //Here the API function takes the Id from the user and delete that data in the database using inbuild function findOneAndDelete function.
  console.log("removed");
  res.json({
    success : true,
    name : req.body.name,
  })
})

//Creating an API for getting all the products from it. 

app.get('/allproducts', async (req, res) => {
  let Products = await Product.find({}); //Here all the product from database is stored in the storage.
  console.log("All Products Fetched");
  res.send(Products);
})

//Scehema for user model--
const Users = mongoose.model("Users", {
  name : {
    type : String,
  },
  email : {
    type : String,
    unique: true,
  },
  password : {
    type : String,
  },
  cartData : {
    type : Object,
  },
  date : {
    type : Date,
    default : Date.now
  },
})

//Creating end point for registering the User..
app.post('/signup', async(req, res) =>{
  let check = await Users.findOne({email: req.body.email});
  if (check) {
    return res.status(400).json({success : false, errors : "Existing user found with same email ID"})
  }

  let cart  = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0; // Using this it will create an empty object, Where we will get the keys from 1 to 300.
  }

  const user = new Users({
    name : req.body.name,
    email : req.body.email,
    password : req.body.password,
    cartData : cart,
  })  // Now the user will be created, Now we have to save the user into Database.

  await user.save(); //Saves in the database,

  //JWT Authentication

  const data = {
    user : {
      id : user.id
    }
  }

  //After getting the data we create the token...
  const token = jwt.sign(data, "secret_ecom");  // Its the common function provided by JWT libraries to simplify creating the JWT token. It takes the data you want to include in the JWT (The payload) and the secret key used for signing. The second argument is salt and it is a cryptographic function. The token will be generated and we then use response
  res.json({success : true, token});
})


//Creating an end point for user log in..

app.post("/login", async (req, res)=>{
  let user = await Users.findOne({email : req.body.email})
  if (user) {
    const passcompare = req.body.password === user.password;
    if(passcompare){
      const data = {
        user:{
          id:user.id
        }
      }
      const token = jwt.sign(data, 'secret_ecom');
      res.json({success : true, token})
    }else{
      res.json({success : false, errors : "Wronge Password.."})
    }
  }else{
    res.json({success : false, errors : "Wrong Email Address"})
  }
})

//Creating the endpoint for newCollections Data..
app.get('/newcollections', async (req, res) => {
  let products = await Product.find({}); // All the products will be saved in products array.
  let newcollection = products.slice(1).slice(-8);// Using this we will be getting recently added 8 products.
  console.log("NewCollection Fetched");
  res.send(newcollection);
})

//Creating the endPoint for popular in women category.
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({category : "women"});
  let popular_in_women = products.slice(0,4);
  console.log("Popular in women Fetched");
  res.send(popular_in_women); 
})

//Creating middleWare to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({errors : "Please Authenticate using valid token."})
  }
  else{
    try {
      const data = jwt.verify(token, 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({errors : "please authenticate using a valid token."})
    }
  }
}

//Creating the Endpoint for adding the products in the cartData.
app.post("/addtocart", fetchUser, async(req, res) => {
  //console.log(req.body, req.user); 
  //Here we got the user id and using this user ID we are gonna update the data in mongoDB.
  console.log("Add ", req.body.itemId);

  let userData = await Users.findOne({_id : req.user.id})
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({_id : req.user.id}, {cartData : userData.cartData});
  res.send("Added")
})
//In the above endpoint the middleware is being attached.

//Creating an endPoint for removing the data from the cartData.
app.post('/removefromcart', fetchUser, async(req, res) =>{
  console.log("Remove ", req.body.itemId);
  let userData = await Users.findOne({_id : req.user.id})
  if (userData.cartData[req.body.itemId] > 0)
  userData.cartData[req.body.itemId] -= 1;
  await Users.findOneAndUpdate({_id : req.user.id}, {cartData : userData.cartData});
  res.send("Removed")
})


//Creating an Endpoint to get cartData
app.post('/getcart', fetchUser, async(req, res) => {
  console.log("getcart");
  let userData = await Users.findOne({_id : req.user.id});
  res.json(userData.cartData);
})


//App Listening to the port
app.listen(port, (err) => {
  if (!err) {
    console.log(`Server is running at http://localhost:${port}`);
  } else {
    console.log("Error: "+err);
  }
});
