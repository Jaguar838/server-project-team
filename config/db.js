const mongoose = require("mongoose");

require("dotenv").config();

let uri;

// test mode: add test-db in mongoDB
if (process.env.NODE_ENV === "test") {
  uri = process.env.URI_DB_TEST;
} else {
  uri = process.env.URI_DB;
}

const db = mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

if (process.env.NODE_ENV === "development") {
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connection to DB");
  });

  mongoose.connection.on("error", (err) => {
    console.log(`Mongoose connection error ${err.message}`);
    process.exit(1);
  });
}

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Connection to DB closed");
  process.exit();
});

module.exports = db;
