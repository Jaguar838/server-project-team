const { Schema, model, SchemaTypes } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new Schema(
  {
    date: {
      type: Date,
    },
    isExpense: { type: Boolean, default: false },
    category: {
      type: String,
    },
    comment: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
    },
    balanceAfter: {
      type: Number,
    },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: 'user',
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
  },
);

transactionSchema.plugin(mongoosePaginate);

const Transaction = model('transaction', transactionSchema);

module.exports = Transaction;
