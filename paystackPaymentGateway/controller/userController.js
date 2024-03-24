const { Validator } = require("node-input-validator");
const helper = require("../helper/helpers");
const sequelize = require("sequelize");
let PayStack = require("paystack-node");
const sk = process.env.paystack_sk;
const https = require("https");
const axios = require("axios").default;

const db = require("../models");
const user = db.users;
const cards = db.user_cards;
const withdraw = db.withdraw_request;
const transaction = db.transactions;
const wallet = db.wallet;
withdraw.belongsTo(user, { foreignKey: "provider_id" });

module.exports = {
  getUrl: async (req, res) => {
    try {
      const { amount, email } = req.body;
      const params = JSON.stringify({
        email: email,
        amount: amount * 100,
      });

      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: "/transaction/initialize",
        method: "POST",
        headers: {
          Authorization: `Bearer ${sk}`,
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      };
      const reqq = https
        .request(options, (ress) => {
          let data = "";
          ress.on("data", (chunk) => {
            data += chunk;
          });

          ress.on("end", () => {
            return res.json(JSON.parse(data));
          });
        })
        .on("error", (error) => {
          console.error("get an error :", error);
        });
      reqq.write(params);
      reqq.end();
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },
  verifyUrl: async (req, res) => {
    try {
      const ref = req.query.ref;

      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: `/transaction/verify/${ref}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${sk}`,
        },
      };

      const result = await axios.get(
        `https://api.paystack.co/transaction/verify/${ref}`,
        {
          headers: {
            Authorization: `Bearer ${sk}`,
          },
        }
      );

      console.log("check result", result.data);

      res.json(result.data);
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },
  listTransaction: async (req, res) => {
    try {
      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: "/transaction",
        method: "GET",
        headers: {
          Authorization: `Bearer ${sk}`,
        },
      };

      const result = await axios.get(`https://api.paystack.co/transaction`, {
        headers: {
          Authorization: `Bearer ${sk}`,
        },
      });
      console.log(result.data, "listTransactionlistTransaction");
      res.json(result.data);
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },
  detailTransaction: async (req, res) => {
    try {
      let t_id = req.params.id;
      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: `/transaction/${t_id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${sk}`,
        },
      };

      const result = await axios.get(
        `https://api.paystack.co/transaction/${t_id}`,
        {
          headers: {
            Authorization: `Bearer ${sk}`,
          },
        }
      );
      res.json(result.data);
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },
  withdrawRequest: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        request_amount: "required",
      });
      let errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }
      let chk_wallet_balance = await wallet.findOne({
        where: { provider_id: req.user.id },
      });
      if (chk_wallet_balance) {
        if (chk_wallet_balance.amount >= req.body.request_amount) {
          await withdraw.create({
            provider_id: req.user.id,
            request_amount: req.body.request_amount,
          });
          return helper.success(
            res,
            "Your withdraw request has been sent...",
            {}
          );
        } else {
          return helper.success(res, "Insufficient Balance!", {});
        }
      }
      return helper.success(res, "Your Wallet amount is Zero!", {});
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },
  withdrawHistory: async (req, res) => {
    try {
      get_transaction = await withdraw.findAll({
        where: { provider_id: req.user.id },
        include: [
          {
            attributes: ["id", "name", "image"],
            model: user,
          },
        ],
      });
      return helper.success(
        res,
        "Withdraw History fetch successfully",
        get_transaction
      );
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },
  getWallet: async (req, res) => {
    try {
      get_wallet = await wallet.findOne({
        where: { provider_id: req.user.id },
      });
      if (get_wallet) {
        return helper.success(
          res,
          "Wallet amount fetch successfully",
          get_wallet
        );
      }
      return helper.success(res, "Wallet amount fetch successfully", {});
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },
};
