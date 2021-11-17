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

<<<<<<< Updated upstream
=======
transactionSchema.virtual('type').get(function () {
  return this.isExpense ? '-' : '+';
});

transactionSchema.virtual('date_str').get(function () {
  const dd = this.date.getDate();
  const mm = this.date.getMonth() + 1;
  const yy = this.date.getFullYear() % 100;

  return `${dd}.${mm}.${yy}`;
});

>>>>>>> Stashed changes
transactionSchema.plugin(mongoosePaginate);

const Transaction = model('transaction', transactionSchema);

module.exports = Transaction;
