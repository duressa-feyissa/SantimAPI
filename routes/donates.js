const { sendEmail } = require('../services/email');
const { getPaymentUrl } = require('../services/example');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const upload = require('../middleWare/upload');
const { Donation, validate } = require('../models/donation');
const config = require('config'); 

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { title, description, image, amount, goal } = req.body;

  const donation = new Donation({
    title,
    description,
    image,
    amount,
    goal,
  });

  try {
    await donation.save();
    res.status(201).send(donation);
  } catch (err) {
    res.status(500).send('Failed to create a new donation');
  }
});

router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find();
    res.status(200).send(donations);
  } catch (err) {
    res.status(500).send('Failed to fetch donations');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).send('Donation not found');
    }
    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send('Failed to fetch the donation');
  }
});


router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const { title, description, image, amount, goal } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        image,
        amount,
        goal
      },
      { new: true }
    );

    if (!donation) {
      return res.status(404).send('Donation not found');
    }

    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send('Failed to update the donation');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndRemove(req.params.id);

    if (!donation) {
      return res.status(404).send('Donation not found');
    }

    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send('Failed to delete the donation');
  }
});

router.post('/:id/donate', async (req, res) => {
  const { name, email, amount, phone } = req.body;

  const { error } = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    amount: Joi.number().required(),
    phone: Joi.string().required(),
  }).validate({ name, email, amount, phone });

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    return res.status(404).send('Donation not found');
  }

  const donorId = new mongoose.Types.ObjectId(); 
  const data = {
    id: donorId.toString(), 
    name,
    email,
    amount,
    phone,
  };

  const donotionId = req.params.id;
  const successUrl = "https://santimpay.com/success"; 
  const failureUrl = "https://santimpay.com/failure"; 
  
  const baseUrl = config.get('base_url');
  const notifyUrl = `${baseUrl}/api/donations/${donotionId}/notify${donorId}`; 

  try {
    const url = await getPaymentUrl(data, successUrl, failureUrl, notifyUrl);
    await sendEmail('Excited User <me@samples.mailgun.org>' ,"duresafeyisa2022@gmail.com", "Donation", url);
    donation.donors.push(data);
    await donation.save(); 
    res.status(201).send(url);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to process the donation');
  }
});

router.post('/donations/:donationId/notify/:donorId', async (req, res) => {
  const donationId = req.params.donationId;
  const donorId = req.params.donorId;

  const { thirdPartyId, Status } = req.body;

  if (thirdPartyId !== donorId) {
    return res.status(400).send('Invalid donor ID');
  }

  try {
    const donation = await Donation.findOne({ _id: donationId, 'donors.id': donorId });
    if (!donation) {
      return res.status(404).send('Donation not found');
    }

    const donor = donation.donors.find((donor) => donor.id === donorId);
    donor.status = Status;
    await donation.save();

    res.status(200).json({ status: Status });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to process the notification');
  }
});

router.get('/:id/qr-generator', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid donation ID');
  }

  const donationId = req.params.id;
  try {
    const baseUrl = config.get('base_url');
    const donationPageUrl = `${baseUrl}/api/donations/${donationId}/donate`;
    const qrCodeDataUrl = await QRCode.toDataURL(donationPageUrl);
    res.send(qrCodeDataUrl);
  } catch (error) {
    res.status(500).send('Failed to generate QR code');
  }
});


router.post('/:id/upload'), upload.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid donation ID');
  }

  let donation = await Donation.findById(req.params.id);
  if (!donation) {
    return res.status(404).json({ error: 'Donation not found' });
  }

  const file = req.file;
  const newImage = req.file.filename;

  if (!file) {
    return res.status(400).send('No file found');
  }

  donation.image = newImage;
  donation = await donation.save();
  res.status(200).send('Profile image uploaded successfully');
}

module.exports = router;
