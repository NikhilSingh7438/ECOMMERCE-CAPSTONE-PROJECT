const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const paytm = require('paytmchecksum');
const https = require('https');
const Payment = require('../models/paymentModel');
const ErrorHandler = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

// Process Payment
exports.processPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount, email, phoneNo } = req.body;
    try {
        const params = {
            MID: process.env.PAYTM_MID,
            WEBSITE: process.env.PAYTM_WEBSITE,
            CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
            INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE,
            ORDER_ID: "oid" + uuidv4(),
            CUST_ID: process.env.PAYTM_CUST_ID,
            TXN_AMOUNT: amount.toString(),
            CALLBACK_URL: `https://${req.get("host")}/api/v1/callback`,
            EMAIL: email,
            MOBILE_NO: phoneNo
        };
        const checksum = paytm.generateSignature(params, process.env.PAYTM_MERCHANT_KEY);
        const paytmParams = {
            ...params,
            CHECKSUMHASH: checksum
        };
        res.status(200).json({ paytmParams });
    } catch (error) {
        console.error('Error processing payment:', error);
        next(new ErrorHandler("Failed to process payment", 500));
    }
});

// Paytm Callback
exports.paytmResponse = asyncErrorHandler(async (req, res, next) => {
    const paytmChecksum = req.body.CHECKSUMHASH;
    delete req.body.CHECKSUMHASH;
    try {
        const isVerifySignature = paytm.verifySignature(req.body, process.env.PAYTM_MERCHANT_KEY, paytmChecksum);
        if (isVerifySignature) {
            const paytmParams = {
                body: {
                    mid: req.body.MID,
                    orderId: req.body.ORDERID
                }
            };
            const checksum = await paytm.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY);
            paytmParams.head = {
                signature: checksum
            };
            const post_data = JSON.stringify(paytmParams);
            const options = {
                hostname: 'securegw-stage.paytm.in',
                port: 443,
                path: '/v3/order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };
            let response = "";
            const post_req = https.request(options, (post_res) => {
                post_res.on('data', (chunk) => {
                    response += chunk;
                });
                post_res.on('end', () => {
                    const { body } = JSON.parse(response);
                    addPayment(body);
                    res.redirect(`https://${req.get("host")}/order/${body.orderId}`);
                });
            });
            post_req.write(post_data);
            post_req.end();
        } else {
            console.error('Checksum Mismatched');
            throw new ErrorHandler("Checksum Mismatched", 400);
        }
    } catch (error) {
        console.error('Error processing Paytm response:', error);
        next(new ErrorHandler("Failed to process Paytm response", 500));
    }
});

// Add Payment to Database
const addPayment = async (data) => {
    try {
        await Payment.create(data);
    } catch (error) {
        console.error('Failed to add payment to database:', error);
        throw new ErrorHandler("Failed to add payment to database", 500);
    }
};

// Get Payment Status
exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.id });
        if (!payment) {
            throw new ErrorHandler("Payment Details Not Found", 404);
        }
        const txn = {
            id: payment.txnId,
            status: payment.resultInfo.resultStatus,
        };
        res.status(200).json({ success: true, txn });
    } catch (error) {
        console.error('Error getting payment status:', error);
        next(new ErrorHandler("Failed to get payment status", 500));
    }
});

// Process Cash on Delivery (COD)
exports.processCOD = asyncErrorHandler(async (req, res, next) => {
    const { amount, email, phoneNo } = req.body;
    try {
        const codOrder = {
            amount,
            email,
            phoneNo,
        };
        res.status(200).json({
            success: true,
            message: "Cash on Delivery order processed successfully.",
            order: codOrder,
        });
    } catch (error) {
        console.error('Error processing Cash on Delivery order:', error);
        next(new ErrorHandler("Failed to process Cash on Delivery order.", 500));
    }
});

