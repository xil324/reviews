const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/ecommmerce");

const reviewlist = new mongoose.Schema({
  product_id: Number,
  rating: Number,
  date: String,
  summary: String,
  body: String,
  recommend: Boolean,
  reported: Boolean,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: Number,
});

const characteristics = new mongoose.Schema({
  product_id: Number,
  name: String,
});

const characteristics_review = new mongoose.Schema({
  characteristics_id: Number,
  review_id: Number,
  value: Number,
});

const photolist = new mongoose.Schema({
  id: Number,
  url: [String],
});

// const review = mongoose.model("review", Review);
const Photo = mongoose.model("photos", photolist);
const Review = mongoose.model("reviews", reviewlist);
const Characteristics = mongoose.model("characteristics", characteristics);
const Characteristics_review = mongoose.model(
  "characteristics_reviews",
  characteristics_review
);
// mongoimport --type csv -d ecommmerce -c photos --headerline --drop reviews_photos.csv