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
    const allOrders = await orders.find().sort({ createdAt: -1 }).toArray();
    res.status(200).json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

app.post("/new/order", async (req, res) => {
  try {
    const userData = req.body;

    // Generate a random 6-digit order number
    const orderNumber = Math.floor(100000 + Math.random() * 900000);

    const order = {
      ...userData,
      orderNumber,
      createdAt: new Date(),
    };

    const result = await orders.insertOne(order);

    res.status(201).json({
      success: true,
      message: "Order saved successfully",
      id: result.insertedId,
      orderNumber,
    });
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save order",
    });
  }
});

app.put("/cancel/order/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const result = await orders.updateOne(
      { orderNumber: Number(orderNumber) },
      {
        $set: {
          orderStatus: "cancelled",
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated to cancelled",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
});

app.listen(3002, () => {
  console.log("Server started on http://localhost:3002");
});
