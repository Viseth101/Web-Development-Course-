import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import session from 'express-session';

dotenv.config();

const port = 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const promisePool = pool.promise();

app.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Create Route for Load Product Data
app.get("/", (request, response) => {
  const query = `SELECT * FROM product LIMIT 3`;
  //Execute Query
  connection.query(query, (error, result) => {
    if (!request.session.cart) {
      request.session.cart = [];
    }
    response.render('product', { products: result, cart: request.session.cart });
  });
});

//Create Route for Add Item into Cart
app.post('/add_cart', async (request, response) => {
  const product_id = request.body.product_id;
  const product_name = request.body.product_name;
  const product_price = request.body.product_price;
  let count = 0;
  for (let i = 0; i < request.session.cart.length; i++) {
    if (request.session.cart[i].product_id === product_id) {
      request.session.cart[i].quantity += 1;
      count++;
    }
  }
  if (count === 0) {
    const cart_data = {
      product_id: product_id,
      product_name: product_name,
      product_price: parseFloat(product_price),
      quantity: 1
    };
    request.session.cart.push(cart_data);
  }
  response.redirect("/");
});

//Create Route for Remove Item from Shopping Cart
app.get('/remove_item', (request, response) => {
  const product_id = request.query.id;
  for (let i = 0; i < request.session.cart.length; i++) {
    if (request.session.cart[i].product_id === product_id) {
      request.session.cart.splice(i, 1);
    }
  }
  response.redirect("/");
});

app.get('/users', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});