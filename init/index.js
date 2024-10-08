const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing.js");

// main()
//   .then((res) => console.log("mongoose connected"))
//   .catch((err) => console.log(err));
//   const URL = process.env.ATLASPASSWORD;

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust" );

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
//

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "669a2405cd6859c9a2005357",
  }));

  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};
initDB();
