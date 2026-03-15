const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    story: Number,
    gameplay: Number,
    graphics: Number,
    optimization: Number,
    replayability: Number
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    year: Number,
    genres: [String],
    heroTag: String,
    description: String,
    structuredRatings: ratingSchema,
    bugStatus: {
      label: String,
      note: String
    },
    valueRating: {
      score: Number,
      advice: String
    },
    playerTypes: {
      bestFor: [String],
      notIdealFor: [String]
    },
    timeCommitment: {
      mainStory: String,
      mainPlusSide: String,
      completionist: String
    },
    requirements: {
      minimum: {
        cpuScore: Number,
        gpuScore: Number,
        ram: Number
      },
      recommended: {
        cpuScore: Number,
        gpuScore: Number,
        ram: Number
      }
    },
    comments: [
      {
        username: String,
        message: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
