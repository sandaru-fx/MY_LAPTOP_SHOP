
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://sandaruchamod62_db_user:07avSaQ7650T0lXP@cluster0.rmtuidm.mongodb.net/laptopstore?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('>>> Standard MongoDB Node Synchronized'))
  .catch(err => console.error('>>> DB Connection Error:', err));

// --- Schemas ---
const LaptopSchema = new mongoose.Schema({
  brand: String,
  model: { type: String, required: true },
  price: { type: Number, required: true, min: 1 },
  cpu: String,
  gpu: String,
  ram: String,
  storage: String,
  images: [String],
  description: String,
  stock: { type: Number, default: 0 },
  category: String,
  isFeatured: { type: Boolean, default: false }
});

const OrderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  total: Number,
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' },
  shippingAddress: String,
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now }
});

const Laptop = mongoose.model('Laptop', LaptopSchema);
const Order = mongoose.model('Order', OrderSchema);

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'Operational' }));

app.get('/api/laptops', async (req, res) => {
  const laptops = await Laptop.find();
  res.json(laptops);
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`>>> Command Center Online on Port ${PORT}`));
