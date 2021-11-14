const { Schema, model, SchemaTypes } = require("mongoose");

const SchemaTransactions = new Schema(
  {
    date: {
      type: Number,
    },
    isExpense: { type: Boolean, default: false },
    category: {
      type: String,
    },
    comment: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
    },
    balanceAfter: {
      type: Number,
    },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: "user",
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  }
);

const Transactions = model("transactions", SchemaTransactions);

module.exports = Transactions;
