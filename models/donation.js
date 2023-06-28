const mongoose = require('mongoose');
const Joi = require('joi');

const donationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  goal: {
    type: Number,
    required: true
  },
  donors: [
    {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      }, phone : {
        type: String,
        required: true
      },
      status: {
        type: String,
        default: 'pending'
      }
    }
  ]
});

const Donation = mongoose.model('Donation', donationSchema);

function validateDonation(donation) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string(),
    amount: Joi.number().required(),
    goal: Joi.number().required(),
    donors: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        amount: Joi.number().required()
      })
    ).optional()
  });
  return schema.validate(donation);
}

exports.Donation = Donation;
exports.validate = validateDonation;
