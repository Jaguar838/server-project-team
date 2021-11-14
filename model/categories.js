const { Schema, model, SchemaTypes } = require("mongoose");

const categorySchema = new Schema(
  {
    value: { type: String },
    color: { type: String },
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

const Categories = model("categories", categorySchema);

module.exports = Categories;
