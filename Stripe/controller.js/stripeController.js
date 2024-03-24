STRIPE_SK_KEY =
  "sk_test_51OU2OqBABpxXnhXrMgWJJuxuGy0d1XMRN8KF5PucVOByGoteJqkppYwkiKQprAPexH5ZyEojJEltFyFARPofYdmF00Cqo6Bg3o1";
STRIPE_PK_KEY =
  "pk_test_51OU2OqBABpxXnhXrNn5BpW9bANqIAd0Z8vaCFliwhQAMzRzcZh6zNcTSFhjxQLIgILzXFrso0C5FqvY1lobI3dxE00ulCfAwAq1";
const helper = require("../helper/helper");

const stripe = require("stripe")(envfile.STRIPE_SK_KEY);
const stripeReturnUrl = `https://202.164.42.227:9898/user/stripe_connect`;
module.exports = {
  connectUser: async (req, res) => {
    try {
      const customer = await stripe.customers.create({
        description: "Your application name",
        email: req.body.email,
      });
      let customerId = customer.id;
      //Store this customerId in user table
    } catch (error) {
      throw error;
    }
  },
  stripePaymentIntents: async (req, res) => {
    try {
      let userDetail = await Models.user.findOne({
        where: { id: req.user.id },
        raw: true,
      });
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: userDetail.customerId },
        { apiVersion: "2023-10-16" }
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount * 100,
        currency: "USD",
        customer: userDetail.customerId,
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });
      let result = {
        paymentIntent: paymentIntent,
        ephemeralKey: ephemeralKey.secret,
        customer: userDetail.customerId,
        publishableKey: envfile.STRIPE_PK_KEY,
      };
      return helper.success(res, "Payment Intent detail", result);
    } catch (error) {
      throw error;
    }
  },
  stripeWebhook: async (req, res) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        req.body.data.object.id
      );
      var orderUpdatestatus = await Models.transaction.update(
        {
          payment_status:
            paymentIntent.status === "succeeded"
              ? "succeeded"
              : paymentIntent.status,
        },
        {
          where: {
            transaction_id: req.body.data.object.id,
          },
        }
      );
      let detail = {
        data: req.body.data,
        orderUpdatestatus: orderUpdatestatus,
      };
      return helper.success(res, "StripeWebHook response");
    } catch (error) {
      throw error;
    }
  },
  addStripeAccount: async (req, res) => {
    try {
      const finduser = req.user;
      const accountLink = await helper.create_stripe_connect_url(
        stripe,
        finduser,
        stripeReturnUrl + `?state=${finduser.id}`
      );
      return helper.success(
        res,
        "Account Added Successfully",
        accountLink && accountLink.url
      );
    } catch (error) {
      console.log(error);
    }
  },
  stripe_connect: async (req, res) => {
    try {
      let hasAccountId;
      let state = req.query.state;
      const userData = await Models.user.findOne({ where: { id: state } });
      const responseData = await stripe.accounts.retrieve(
        userData.stripeAccountId
      );
      if (responseData?.charges_enabled == false) {
        hasAccountId = 0;
      } else {
        hasAccountId = 1;
      }
      const updateUser = await Models.user.update(
        {
          stripeAccountId: responseData?.id,
          hasAccountId: hasAccountId,
        },
        {
          where: {
            id: state,
          },
        }
      );
      let msg = "ACCOUNT CONNECTED SUCCESSFULLY";
      return helper.success(res, msg, { status: 0 });
    } catch (err) {
      throw err;
    }
  },
  addAccount: async (req, res) => {
    try {
      const account = await stripe.accounts.create({
        country: "US",
        type: "express",
        email: req.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
      });
      const accountLink = await stripe.accountLinks.create({
        account: account?.id,
        refresh_url: "https://example.com/reauth",
        return_url: "https://example.com/return",
        type: "account_onboarding",
      });
      if (accountLink && accountLink.url) {
        await Models.user.update(
          {
            stripeAccountId: account?.id,
            hasAccountId: 1,
          },
          {
            where: {
              id: req.user.id,
            },
          }
        );
      }
      return helper.success(
        res,
        "Account Added Successfully",
        accountLink && accountLink.url
      );
    } catch (error) {
      throw error;
    }
  },
  tranferMoney: async (req, res) => {
    try {
      let statusUpdate = await Models.transaction.update(
        { shipped_product_status: req.body.shipped_product_status },
        {
          where: {
            id: req.body.id,
          },
        }
      );
      let transfer;
      if (req.body && req.body.shipped_product_status == 2 && statusUpdate) {
        let findTransactionDetail = await Models.transaction.findOne({
          where: {
            id: req.body.id,
          },
          raw: true,
        });
        transfer = await stripe.transfers.create({
          amount: findTransactionDetail?.amount * 100,
          currency: "usd",
          destination: req.user.stripeAccountId,
        });
        if (transfer && transfer.id) {
          await Models.transaction.update(
            { fundTransferId: transfer.id },
            {
              where: {
                id: req.body.id,
              },
            }
          );
        }
        console.log("transfer====>", transfer);
      }
      let result = await Models.transaction.findOne({
        where: { id: req.body.id },
      });
      return helper.success(
        res,
        "Shipping status update successfully",
        result,
        transfer
      );
    } catch (error) {
      throw error;
    }
  },
  create_stripe_connect_url_add_account: async function (
    stripe,
    getUser,
    stripeReturnUrl
  ) {
    try {
      let account;
      let accountLink;
      let hasAccountId = "0";
      if (getUser?.stripeAccountId == "" || getUser?.stripeAccountId == null) {
        account = await stripe.accounts.create({
          country: "US",
          type: "express",
          // id: getUser?.id,
          email: getUser?.email,
          capabilities: {
            card_payments: {
              requested: true,
            },
            transfers: {
              requested: true,
            },
          },
          business_type: "individual",
          business_profile: {
            url: stripeReturnUrl,
          },
        });
        accountLink = await stripe.accountLinks.create({
          account: account?.id,
          refresh_url: stripeReturnUrl,
          return_url: stripeReturnUrl,
          type: "account_onboarding",
        });

        hasAccountId = "0";
      } else {
        account = await stripe.accounts.retrieve(getUser?.stripeAccountId);
        if (account?.charges_enabled == false) {
          accountLink = await stripe.accountLinks.create({
            account: account?.id,
            refresh_url: stripeReturnUrl,
            return_url: stripeReturnUrl,
            type: "account_onboarding",
          });

          hasAccountId = "0";
        } else {
          hasAccountId = "1";
        }
      }
      await Models.user.update(
        {
          stripeAccountId: account?.id,
          hasAccountId: hasAccountId,
        },
        {
          where: {
            id: getUser.id,
          },
        }
      );
      return accountLink;
    } catch (err) {
      throw err;
    }
  },
};
