const express = require('express');
const { processPayment, paytmResponse, getPaymentStatus, processCOD } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Route for processing payment
router.post('/payment/process', processPayment);

// Route for handling Paytm callback
router.post('/payment/callback', paytmResponse);

// Route for getting payment status
router.get('/payment/status/:id', isAuthenticatedUser, getPaymentStatus);

// Route for processing Cash on Delivery (COD) orders
router.post('/payment/process-cod', processCOD);

module.exports = router;
