const express = require("express");
var createError = require("http-errors");
const app = express();
const paypal = require("paypal-rest-sdk");
const stripe = require("stripe")("YOUR_SECRET_KEY");
var dbConnection = require("./config/dbconnection");
// Configure PayPal SDK with your credentials
paypal.configure({
  mode: "sandbox", // Replace with 'live' for production
  client_id:
    "ASSbjbng5mkZAlGW9ScXHS2pnMulSkFdQSDyGVAXcOk7Sca37cxDDDeRtLhWzUoBV9xKo-TEFAl1H9QC",
  client_secret:
    "ELml9hxckGDdS0hID5QYF5JIjNmOZ0pMR3IsAqFZkhcfymRh0-Sl6l9ISrdnJ_Qc6-q5ugjI7UGjPkXD",
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var port = process.env.PORT || 3000;
dbConnection();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
require("./socket/socket")(io);

app.get("/pay", (req, res) => {
  // Create the payment JSON with the formatted price
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: req.protocol + "://" + req.get("host") + "/success",
      cancel_url: req.protocol + "://" + req.get("host") + "/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Product Name",
              sku: "001",
              price: parseFloat(100).toFixed(2), // Set the formatted price here
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: parseFloat(100).toFixed(2), // Set the formatted price here
        },
        description: "Description of the product",
      },
    ],
  };

  // Create a PayPal payment
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  // Parse the price from the query parameter and format it
  let price = parseFloat(req.query.price).toFixed(2);

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: price, // Use the formatted price here
        },
      },
    ],
  };

  // Execute the payment
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));

        // Store payment details in your database here
        const paymentDetails = {
          payerId: payerId,
          paymentId: paymentId,
          amount: price,
          // Add any other details you want to store
        };

        // Assuming you have a function to save paymentDetails to your database
        savePaymentToDatabase(paymentDetails);

        res.send("Success");
      }
    }
  );
});

function savePaymentToDatabase(paymentDetails) {
  // Implement code here to save paymentDetails to your database
  // You can use a database library like Mongoose or Sequelize for this
  // Example using Mongoose:
  const Payment = require("./models/payment"); // Import your Payment model
  const payment = new Payment(paymentDetails);
  payment.save((err, savedPayment) => {
    if (err) {
      console.error("Error saving payment:", err);
    } else {
      console.log("Payment saved successfully:", savedPayment);
    }
  });
}

app.get("/cancel", (req, res) => res.send("Cancelled"));

//Getting apple token from fornt end then do payment with strip

app.post("/process-payment", async (req, res) => {
  const { applePayToken, amount } = req.body;

  try {
    // Create a charge using the Stripe API
    const charge = await stripe.charges.create({
      amount: amount, // The amount in cents
      currency: "usd", // Replace with your desired currency
      source: applePayToken, // The Apple Pay token
      description: "Payment for your order",
    });

    // If the charge is successful, you can handle the success response
    console.log(charge);
    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    // Handle any errors that occur during the payment process
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
