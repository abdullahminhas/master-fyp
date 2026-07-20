const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());
app.use(cors());

const client = new MongoClient("mongodb://localhost:27017");

client
  .connect()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const db = client.db("cravie");
const orders = db.collection("orders");

app.get("/", async (req, res) => {
  try {
    const allOrders = await orders.find().toArray();

    res.status(200).json({
      data: allOrders,
    });
  } catch (error) {
    console.log("Error fetching orders:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

app.post("/new/order", async (req, res) => {
  try {
    const userData = req.body;

    console.log("Received data:", userData);

    const result = await orders.insertOne(userData);

    res.status(201).json({
      success: true,
      message: "Order saved successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.log("Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save order",
    });
  }
});

app.listen(3002, () => {
  console.log("Server started on http://localhost:3002");
});
