import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors } from '../../actions/orderAction';
import { useSnackbar } from 'notistack';
import { post } from '../../utils/paytmForm';
import { emptyCart } from '../../actions/cartAction'; 
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import MetaData from '../Layouts/MetaData';
import COD from '../../assets/images/cod.jpg';
import axios from 'axios';
import Stepper from '@mui/material/Stepper';


const Payment = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [payDisable, setPayDisable] = useState(false);
    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error } = useSelector((state) => state.newOrder);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const paymentData = {
        amount: Math.round(totalPrice),
        email: user.email,
        phoneNo: shippingInfo.phoneNo,
    };

    const handlePayment = async (paymentMethod) => {
        setPayDisable(true);
        try {
            if (paymentMethod === 'COD') {
                await axios.post('/api/v1/payment/process-cod', paymentData);
                enqueueSnackbar('Your order has been placed successfully!', { variant: 'success' });
                dispatch(emptyCart()); // Empty cart upon successful COD payment
            } else {
                const config = { headers: { 'Content-Type': 'application/json' } };
                const { data } = await axios.post('/api/v1/payment/process', paymentData, config);
                const info = { action: 'https://securegw-stage.paytm.in/order/process', params: data.paytmParams };
                post(info);
            }
        } catch (error) {
            setPayDisable(false);
            enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
    };

    useEffect(() => {
        if (error) {
            dispatch(clearErrors());
            enqueueSnackbar(error, { variant: 'error' });
        }
    }, [dispatch, error, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Ecommerce: Secure Payment | Paytm" />
            <main className="w-full mt-20">
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">
                    <div className="flex-1">
                        <Stepper activeStep={3}>
                            <div className="w-full bg-white">
                                <form onSubmit={(e) => e.preventDefault()} autoComplete="off" className="flex flex-col justify-start gap-2 w-full mx-8 my-4 overflow-hidden">
                                    <FormControl>
                                        <RadioGroup
                                            aria-labelledby="payment-radio-group"
                                            defaultValue="paytm"
                                            name="payment-radio-button"
                                        >
                                            <FormControlLabel
                                                value="paytm"
                                                control={<Radio />}
                                                label={
                                                    <div className="flex items-center gap-4">
                                                        <img draggable="false" className="h-6 w-6 object-contain" src="https://rukminim1.flixcart.com/www/96/96/promos/01/09/2020/a07396d4-0543-4b19-8406-b9fcbf5fd735.png" alt="Paytm Logo" />
                                                        <span>Paytm</span>
                                                    </div>
                                                }
                                            />
                                            <FormControlLabel
                                                value="COD"
                                                control={<Radio />}
                                                label={
                                                    <div className="flex items-center gap-4">
                                                        <img draggable="false" className="h-6 w-6 object-contain" src={COD} alt="COD Logo" />
                                                        <span>Cash on Delivery</span>
                                                    </div>
                                                }
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                    <button onClick={() => handlePayment('paytm')} disabled={payDisable} className={`bg-primary-orange w-1/2 sm:w-1/4 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none ${payDisable ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Pay ₹{totalPrice.toLocaleString()} (Paytm)</button>
                                    <button onClick={() => handlePayment('COD')} disabled={payDisable} className={`bg-primary-orange w-1/2 sm:w-1/4 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none ${payDisable ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Place Order (COD)</button>
                                </form>
                            </div>
                        </Stepper>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Payment;
