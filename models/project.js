const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  template: String,
  content: String,
  styles: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", ProjectSchema);
