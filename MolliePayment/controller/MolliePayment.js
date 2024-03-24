const createMollieClient = require("@mollie/api-client");
const mollieClient = createMollieClient({
  apiKey: "test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM",
});
const helper = require("../helper/helper");

//https://docs.mollie.com/
// https://docs.mollie.com/reference/v2/payments-api/cancel-paymenthttps://docs.mollie.com/reference/v2/payments-api/cancel-payment
module.exports = {
  payment: async (req, res, next) => {
    try {
      let amounts = parseFloat(req.body.amount).toFixed(2);
      const paymentData = {
        amount: amounts,
        currency: "EUR",
        description: "Payment By Mollie Payment",
        redirectBaseUrl: "http://localhost:3000/api/paymentSuccess", // Base redirect URL
      };
      // Create a payment in Mollie API
      let molliePayment = await mollieClient.payments.create({
        amount: {
          currency: paymentData.currency,
          value: paymentData.amount,
        },
        description: paymentData.description,
        redirectUrl: paymentData.redirectBaseUrl, // No payment ID appended yet
      });

      // Get the payment ID from the Mollie payment object
      const paymentId = molliePayment.id;
      let objToSave = {
        userId: req.user.id,
        paymentId: molliePayment.id,
      };
      await Models.transfer.create(objToSave);
      // Construct the final redirect URL with the payment ID
      const redirectUrl = `${
        paymentData.redirectBaseUrl
      }?paymentId=${encodeURIComponent(paymentId)}`;

      // Update the payment object with the final redirect URL
      await molliePayment.payment.update(paymentId, redirectUrl);
      return res.send(
        `Payment redirect link`,
        molliePayment && molliePayment.links.checkout.href
      );
      return helper.success(
        res,
        `Payment redirect link`,
        molliePayment && molliePayment.links.checkout.href
      );
    } catch (error) {
      return res.error(res, error);
    }
  },
  paymentSuccess: async (req, res) => {
    try {
      let paymentId = req.query.paymentId;
      let payment = mollieClient.payments.get(paymentId);
      if (payment.status == "paid") {
        res.send("Payment done successfully");
      } else if (payment.status == "failed") {
        res.send("Payment failed");
      }
    } catch (error) {
      throw error;
    }
  },
  getPaymentDeatil: async (req, res) => {
    try {
      let paymentId = req.body.paymentId;
      let payment = mollieClient.payments.get(paymentId);
      res.send(payment);
    } catch (error) {
      throw error;
    }
  },
  cancelPayment: async (req, res) => {
    try {
      let paymentId = req.body.paymentId;
      const canceledPayment = await mollieClient.payments.cancel(paymentId);
      res.send(canceledPayment);
    } catch (error) {
      throw error;
    }
  },
  allListPayment: async (req, res) => {
    try {
      const payments = mollieClient.payments.iterate();
      res.send(payments);
    } catch (error) {
      throw error;
    }
  },
  createPaymentRefund: async (req, res) => {
    try {
      // let paymentId='tr_WDqYK6vllg'
      let paymentId = await Models.transfer.findOne({
        where: { userId: req.user.id },
      });
      const refund = await mollieClient.paymentRefunds.create({
        paymentId: req.body.paymentId,
        amount: {
          value: req.body.amount,
          currency: "EUR",
        },
      });
      let refundId = refund.id;
      await Models.transfer.update(
        { refundId: refundId },
        { paymentId: req.body.paymentId }
      );
      await helper.success("Payment Refund link", refund);
    } catch (error) {
      throw error;
    }
  },
  getRefundPaymentDetail: async (req, res) => {
    try {
      let id = req.body.refundId;
      const refund = await mollieClient.paymentRefunds.get(id, {
        paymentId: req.body.paymentId,
      });
      await helper.success("Payment Refund detail get", refund);
    } catch (error) {
      throw error;
    }
  },
  cancelRefundPayment: async (req, res) => {
    try {
      //https://docs.mollie.com/reference/v2/refunds-api/cancel-payment-refund
      let id = req.body.refundId;
      let cancelRefundPayment = await mollieClient.paymentRefunds.cancel(id, {
        paymentId: req.body.paymentId,
      });
      await helper.success("Payment Refund cancel", cancelRefundPayment);
    } catch (error) {
      throw error;
    }
  },
  listPaymentRefunds: async (req, res) => {
    try {
      // https://docs.mollie.com/reference/v2/refunds-api/list-payment-refunds
      const refunds = mollieClient.paymentRefunds.iterate({
        paymentId: req.body.paymentId,
      });
      await helper.success("Payment Refund list", refunds);
    } catch (error) {
      throw error;
    }
  },
};
