import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  checkOutOrder,
  updateOrderDelivery,
  saveCheckoutDetails,
  saveAddressDetails,
} from "../Redux/Slice/orderSlice";
import { getHubtelCallbackById } from "../Redux/Slice/paymentSlice";
import { clearCart } from "../Redux/Slice/cartSlice";
import { message, Card, Typography, Radio, Divider, Modal, Alert } from "antd";
import CheckoutForm from "../Component/CheckoutForm";
import locations from "../Component/Locations";
import { ShoppingBagIcon, ExclamationTriangleIcon, CreditCardIcon, MapPinIcon, UserIcon, PhoneIcon,ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";


const { Text, Title } = Typography;

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(() => {
    const saved = localStorage.getItem("deliveryInfo");
    return saved ? (saved) : { address: "", fee: null };
  });

  // Validation modal states
  const [isValidationModalVisible, setIsValidationModalVisible] = useState(false);

  // Electronics alert modal
  const [isElectronicsAlertVisible, setIsElectronicsAlertVisible] = useState(false);
  
  // Payment iframe modal states
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Get cart items from localStorage
const getCartItems = () => {
  try {
    let cartData = localStorage.getItem("cart");

    // Handle legacy (unencrypted or plain stringified) values
    if (typeof cartData === "string") {
      try {
        cartData = (cartData);
      } catch {
        // If it's not valid JSON, just leave it as is
      }
    }

    return Array.isArray(cartData) ? cartData : [];
  } catch (error) {
   
    return [];
  }
};


  const [cartItems, setCartItems] = useState(getCartItems());

  // Get cart ID
  const getCartId = () => {
    return localStorage.getItem("cartId") || `cart_${Date.now()}`;
  };

  // Get customer data
  const customerData = (() => {
    try {
      const data = localStorage.getItem("customer");
      return data ? (data) : null;
    } catch (error) {
    
      return null;
    }
  })();
  
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const customerId = customerData?.customerAccountNumber;
  const customerAccountType = customerData?.accountType;
  const selectedAddress = deliveryInfo?.address;

  // Check if user is an agent
  const isAgent = customerAccountType === "agent";

  // Check if delivery is free (case-insensitive check for "free")
  const isFreeDelivery = deliveryInfo?.fee === 0 && 
    (typeof deliveryInfo?.feeDisplay === 'string' && 
     deliveryInfo.feeDisplay.toLowerCase().includes('free'));

  // Also update the isNADelivery check
  const isNADelivery = deliveryInfo?.fee === 0 && 
    (!deliveryInfo?.feeDisplay || 
     deliveryInfo?.feeDisplay === 'N/A' || 
     deliveryInfo?.feeDisplay === '' ||
     (typeof deliveryInfo?.feeDisplay === 'string' && 
      deliveryInfo.feeDisplay.toLowerCase() === 'n/a'));

  // Update delivery info initialization
  useEffect(() => {
    if (customerData) {
      setCustomerName(`${customerData.firstName || ""} ${customerData.lastName || ""}`.trim());
      setCustomerNumber(customerData.contactNumber || customerData.ContactNumber || "");

      const storedInfo = (localStorage.getItem("deliveryInfo") || "{}");
      const address = storedInfo?.address || customerData.address || "";
      const fee = storedInfo?.fee || 0;
      const feeDisplay = storedInfo?.feeDisplay || storedInfo?.feeText || "";
      setDeliveryInfo({ address, fee, feeDisplay });
      setDeliveryFee(Number(fee));
    }
  }, []);

  // Update delivery fee when deliveryInfo changes
  useEffect(() => {
    if (deliveryInfo?.fee !== undefined && !isNaN(Number(deliveryInfo.fee))) {
      setDeliveryFee(Number(deliveryInfo.fee));
    }
  }, [deliveryInfo]);



  // Monitor cart changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newItems = getCartItems();
      setCartItems(newItems);
    };

    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      const newItems = getCartItems();
      if ((newItems) !== (cartItems)) {
        setCartItems(newItems);
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [cartItems]);

  // Enhanced Hubtel payment status check with iframe communication
  useEffect(() => {
    if (isAgent || !currentOrderId) return;

    let intervalId;
    
    // Listen for messages from the iframe
    const handleIframeMessage = (event) => {
      // Ensure we're listening to the right origin (Hubtel payment gateway)
      if (!event.origin.includes('hubtel.com') && !event.origin.includes('payproxyapi.hubtel.com')) {
        return;
      }

      const { type, data } = event.data || {};
      
      if (type === 'PAYMENT_SUCCESS') {
        clearInterval(intervalId);
        setIsPaymentModalVisible(false);
        setPaymentUrl(null);
        localStorage.removeItem("pendingOrderId");
        message.success("Payment completed successfully!");
        navigate(`/order-success/${currentOrderId}`);
      } else if (type === 'PAYMENT_CANCELLED' || type === 'PAYMENT_FAILED') {
        clearInterval(intervalId);
        setIsPaymentModalVisible(false);
        setPaymentUrl(null);
        localStorage.removeItem("pendingOrderId");
        message.error("Payment was cancelled or failed. Please try again.");
      }
    };

    const checkHubtelStatus = async () => {
      if (!currentOrderId) return;

      try {
        const action = await dispatch(getHubtelCallbackById(currentOrderId));
        const response = action?.payload;

        if (response?.responseCode === "0000") {
          clearInterval(intervalId);
          setIsPaymentModalVisible(false);
          setPaymentUrl(null);
          localStorage.removeItem("pendingOrderId");
          message.success("Payment completed successfully!");
          navigate(`/order-success/${currentOrderId}`);
        } else if (response?.responseCode === "2001") {
          clearInterval(intervalId);
          setIsPaymentModalVisible(false);
          setPaymentUrl(null);
          localStorage.removeItem("pendingOrderId");
          message.error("Payment was cancelled.");
          navigate("/order-cancelled");
        }
      } catch (error) {

      }
    };

    if (["Mobile Money", "Credit Card"].includes(paymentMethod) && isPaymentModalVisible) {
      // Add iframe message listener
      window.addEventListener('message', handleIframeMessage);
      
      // Start polling for payment status
      intervalId = setInterval(checkHubtelStatus, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [paymentMethod, dispatch, navigate, isAgent, currentOrderId, isPaymentModalVisible]);
  
  const calculateTotalAmount = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const itemTotal = item.total || (item.price * item.quantity) || 0;
      return total + itemTotal;
    }, 0);

    return subtotal + deliveryFee;
  };

  const generateOrderId = () => {
    const prefix = "ORD";
    const timestamp = new Date().getTime() % 10000;
    const randomNum = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${randomNum}`;
  };

const storeCheckoutDetailsInLocalStorage = (checkoutDetails, addressDetails) => {
  try {
    localStorage.setItem("checkoutDetails", checkoutDetails);
    localStorage.setItem("orderAddressDetails", addressDetails);
    
  } catch (error) {

  }
};

 const initiatePayment = async (totalAmount, cartItems, orderId) => {
  const username = "RMWBWl0";
  const password = "3c42a596cd044fed81b492e74da4ae30";
  const encodedCredentials = btoa(`${username}:${password}`);

  const payload = {
    totalAmount,
    description: `Payment for ${cartItems.map((item) => item.productName).join(", ")}`,
    callbackUrl: "https://smfteapi.salesmate.app/PaymentSystem/PostHubtelCallBack",
    returnUrl: `https://www.frankotrading.com/payment-success/${orderId}`,
    cancellationUrl: "https://www.frankotrading.com/order-cancelled",
    merchantAccountNumber: "2020892",
    clientReference: orderId,
  };

  try {
    const response = await fetch("https://payproxyapi.hubtel.com/items/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: JSON.stringify(payload), // ✅ FIXED: must stringify payload
    });

    // Check if response has body
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP Error: ${response.status} - ${text}`);
    }

    // Try to parse JSON safely
    const text = await response.text();
    if (!text) throw new Error("Empty response from Hubtel API");
    
    const result = JSON.parse(text);

    if (result.status === "Success") {
      localStorage.setItem("pendingOrderId", orderId);
      return result.data.checkoutUrl;
    } else {
      throw new Error(`Hubtel Error: ${result.message || "Unknown error"}`);
    }
  } catch (error) {

    throw error;
  }
};


  // ENHANCED: More robust direct checkout processing with better error handling and retry mechanism
  const processDirectCheckout = async (orderId, checkoutDetails, addressDetails) => {

    
    try {

      await dispatchOrderCheckoutWithRetry(orderId, checkoutDetails);
   
      await dispatchOrderAddressWithRetry(orderId, addressDetails);

      
    } catch (error) {

      throw new Error(`Checkout failed: ${error.message}`);
    }
  };

  // ENHANCED: Checkout order dispatch with retry mechanism and better error handling
  const dispatchOrderCheckoutWithRetry = async (orderId, checkoutDetails, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
     
        const checkoutPayload = {
          cartId: getCartId(),
          ...checkoutDetails,
        };

     
        
        const result = await dispatch(checkOutOrder(checkoutPayload)).unwrap();
 
        
        // If we get here, the dispatch was successful
        return result;
        
      } catch (error) {
        
        lastError = error;
        
        // If it's the last attempt, don't wait
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If we get here, all attempts failed
    throw new Error(`Checkout failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  };

  // ENHANCED: Address dispatch with retry mechanism and better error handling
  const dispatchOrderAddressWithRetry = async (orderId, addressDetails, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        
        const result = await dispatch(updateOrderDelivery(addressDetails)).unwrap();
  
        
        // If successful, clear cart and local storage
        dispatch(clearCart());
        localStorage.removeItem("cart");
        localStorage.removeItem("cartId");
       
        
        return result;
        
      } catch (error) {
 
        lastError = error;
        
        // If it's the last attempt, don't wait
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If we get here, all attempts failed
    throw new Error(`Address update failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (e) => {
    const selectedMethod = e.target.value;
    setPaymentMethod(selectedMethod);
  };

  // Validation function to check required fields
  const validateRequiredFields = () => {
    const errors = [];
    
    if (!customerName?.trim()) {
      errors.push({ field: 'name', message: 'Recipient name is required' });
    }
    
    if (!customerNumber?.trim()) {
      errors.push({ field: 'phone', message: 'Recipient contact number is required' });
    }
    
    if (!selectedAddress?.trim()) {
      errors.push({ field: 'address', message: 'Delivery address is required' });
    }
    
    if (!paymentMethod) {
      errors.push({ field: 'payment', message: 'Payment method is required' });
    }
    
    return errors;
  };
  // ✅ Safe getter to guarantee fullname & contact number
const getSafeCustomerDetails = () => {
  let name = customerName?.trim();
  let number = customerNumber?.trim();

  // fallback from customerData
  if (!name && customerData) {
    name = `${customerData.firstName || ""} ${customerData.lastName || ""}`.trim();
  }
  if (!number && customerData) {
    number = customerData.contactNumber || customerData.ContactNumber || "";
  }

  // last fallback → guest
  if (!name) {
    name = `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
  }
  if (!number) {
    number = "0000000000"; // or force input before checkout
  }

  return { name, number };
};

  
  // ENHANCED: Main checkout handler with better error handling and logging
const handleCheckout = async () => {


  // ✅ Always fetch guaranteed name & number
  const { name: safeName, number: safeNumber } = getSafeCustomerDetails();

  // overwrite state so UI also updates
  setCustomerName(safeName);
  setCustomerNumber(safeNumber);

  // Validate required fields
  const validationErrors = validateRequiredFields();
  if (validationErrors.length > 0) {
   
    setIsValidationModalVisible(true);
    return;
  }

  const orderId = generateOrderId();
  setCurrentOrderId(orderId);
  const orderDate = new Date().toISOString();
  const totalAmount = calculateTotalAmount();
  const cartId = getCartId();

  // ✅ Use safe values in payloads
  const checkoutDetails = {
    Cartid: cartId,
    customerId,
    orderCode: orderId,
    PaymentMode: paymentMethod,
    PaymentAccountNumber: safeNumber || "0000000000",
    customerAccountType,
    paymentService: "Mtn",
    totalAmount,
    recipientName: safeName || `Guest ${Math.floor(1000 + Math.random() * 9000)}`,
    recipientContactNumber: safeNumber || "0000000000", 
    orderNote: orderNote || "N/A",
    orderDate,
  };

  const addressDetails = {
    orderCode: orderId,
    address: selectedAddress,
    Customerid: customerId,
    recipientName: safeName,
    recipientContactNumber: safeNumber,
    orderNote: orderNote || "N/A",
    geoLocation: "N/A",
  };

    try {
      setLoading(true);
      
      // For agents or non-Hubtel payment methods, process direct checkout
      if (isAgent || !["Mobile Money", "Credit Card"].includes(paymentMethod)) {
   
        
        await processDirectCheckout(orderId, checkoutDetails, addressDetails);
   
        message.success("Your order has been placed successfully!");
        navigate("/order-received");
        
      } else {
     
        
        // Store details for later processing after payment
        storeCheckoutDetailsInLocalStorage(checkoutDetails, addressDetails);
        dispatch(saveCheckoutDetails(checkoutDetails));
        dispatch(saveAddressDetails(addressDetails));
        
        setPaymentLoading(true);
        const paymentUrl = await initiatePayment(totalAmount, cartItems, orderId);
        if (paymentUrl) {
         
          setPaymentUrl(paymentUrl);
          setIsPaymentModalVisible(true);
        }
        setPaymentLoading(false);
      }
      
    } catch (error) {
   
      
      // Show specific error message if available
      const errorMessage = error.message || "An error occurred during checkout.";
      message.error(errorMessage);
      

      
    } finally {
      setLoading(false);
   
    }
  };

  const renderImage = (imagePath) => {
    if (!imagePath) {
      return <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-xs">No Image</span>
      </div>;
    }
    
    const backendBaseURL = "https://smfteapi.salesmate.app";
    const imageUrl = `${backendBaseURL}/Media/Products_Images/${imagePath.split("\\").pop()}`;
    
    return (
      <img 
        src={imageUrl} 
        alt="Product" 
        className="w-16 h-16 object-cover rounded-lg"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  };

  // Show empty state if no items
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="p-4 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-4">
          <ShoppingBagIcon className="w-12 h-12 text-gray-400 mr-3" />
          <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
        </div>
        <p className="text-gray-500 mb-6">Add some items to your cart to proceed with checkout.</p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate("/")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (

  <div className="min-h-screen bg-slate-50 pb-24 md:pb-16">
    {/* Loading overlay */}
    {loading && (
      <div className="fixed inset-0 bg-slate-900/30 flex items-center justify-center z-50">
        <div className="bg-white/90 rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-500" />
          <p className="text-sm font-medium text-slate-700">
            Processing your order…
          </p>
        </div>
      </div>
    )}

    {/* Top bar */}
    <header className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur border-b border-slate-200/60">
      <div className="flex items-center justify-between px-3 md:px-6 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-slate-200/70 transition"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-5 h-5 text-slate-900" />
          </button>
          <h1 className="text-sm md:text-base font-semibold text-slate-900">
            Checkout
          </h1>
        </div>

        {/* small step indicator */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
            1
          </span>
          <span>Details</span>
          <span className="mx-1 text-slate-400">›</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
            2
          </span>
          <span>Delivery</span>
          <span className="mx-1 text-slate-400">›</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
            3
          </span>
          <span>Payment</span>
        </div>
      </div>

      {/* Notification banner */}
      <div className="px-2 md:px-6 pb-1">
        <div className="rounded-xl bg-gradient-to-r from-amber-50 via-emerald-50 to-white border border-emerald-100 px-3 py-2 flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          <span className="text-slate-800 font-medium">
            Free delivery within Accra and Kumasi
          </span>
         
        </div>
      </div>
    </header>

    {/* Empty state */}
    {!cartItems || cartItems.length === 0 ? (
      <div className="p-4 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-4">
          <ShoppingBagIcon className="w-10 h-10 text-emerald-500 mr-3" />
          <h2 className="text-xl font-bold text-slate-800">
            Your cart is empty
          </h2>
        </div>
        <p className="text-slate-500 text-sm mb-5">
          Add some items to your cart to proceed with checkout.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition"
        >
          Continue Shopping
        </button>
      </div>
    ) : (
      <div className="px-3 md:px-6 pt-2">
        <div className="flex items-center mb-3">
          <h2 className="text-sm md:text-lg font-semibold text-slate-800 flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-emerald-500" />
            Checkout ({cartItems.length} item
            {cartItems.length !== 1 && "s"})
          </h2>
          <div className="flex-1 border-t border-slate-200 ml-3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)] gap-4 md:gap-6">
          {/* Left: Billing / Address */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-3 md:p-4">
            <div className="mb-3">
              <h3 className="text-sm md:text-base font-semibold text-slate-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-500" />
                Billing & Delivery Details
              </h3>
              <div className="mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-lime-400" />
            </div>

            <CheckoutForm
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerNumber={customerNumber}
              setCustomerNumber={setCustomerNumber}
              deliveryInfo={deliveryInfo}
              setDeliveryInfo={setDeliveryInfo}
              orderNote={orderNote}
              setOrderNote={setOrderNote}
              locations={locations}
              customerAccountType={customerAccountType}
              firstName={customerData?.firstName || "Guest"}
            />
          </div>

          {/* Right: Order summary & payment */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-3 md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">
                    Order Summary
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Review your items before placing the order.
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700 font-medium">
                  {cartItems.length} item
                  {cartItems.length !== 1 && "s"}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item, index) => (
                  <div
                    key={item.productId || index}
                    className="flex justify-between items-start py-3 gap-3"
                  >
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                        {renderImage(item.imagePath)}
                      </div>
                      <div className="text-xs sm:text-sm flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {item.productName || "Product"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.quantity || 1}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Unit: ₵{(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs sm:text-sm">
                      <p className="font-semibold text-slate-900">
                        ₵
                        {(
                          item.total ||
                          (item.price * item.quantity) ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & totals */}
              <div className="pt-3 mt-2 border-t border-slate-100 text-xs sm:text-sm space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₵
                    {cartItems
                      .reduce(
                        (acc, item) =>
                          acc +
                          (item.total ||
                            item.price * item.quantity ||
                            0),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Shipping fee</span>
                  {isFreeDelivery ? (
                    <span className="font-semibold text-emerald-600">
                      FREE
                    </span>
                  ) : isNADelivery ? (
                    <span className="text-amber-600 text-xs font-medium">
                      {isAgent
                        ? "Agent delivery"
                        : "Select address for fee"}
                    </span>
                  ) : deliveryFee > 0 ? (
                    <span className="font-semibold text-slate-900">
                      ₵{deliveryFee.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-amber-600 text-xs font-medium">
                      Select location for fee
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">
                    Total to pay
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-red-500">
                    ₵{calculateTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-3 md:p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4 text-emerald-500" />
                Payment Method
              </p>
              <Radio.Group
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {(isAgent ||
                  isFreeDelivery ||
                  (deliveryFee > 0 && !isNADelivery)) && (
                  <div className="border rounded-xl px-3 py-2 hover:border-emerald-400 transition cursor-pointer">
                    <Radio value="Cash on Delivery" className="text-xs">
                      Cash on Delivery
                    </Radio>
                  </div>
                )}

                {!isAgent && (
                  <>
                    <div className="border rounded-xl px-3 py-2 hover:border-emerald-400 transition cursor-pointer">
                      <Radio value="Mobile Money" className="text-xs">
                        Mobile Money
                      </Radio>
                    </div>
                    <div className="border rounded-xl px-3 py-2 hover:border-emerald-400 transition cursor-pointer">
                      <Radio value="Credit Card" className="text-xs">
                        Credit Card
                      </Radio>
                    </div>
                  </>
                )}

                {isAgent && (
                  <>
                    <div className="border rounded-xl px-3 py-2 hover:border-emerald-400 transition cursor-pointer">
                      <Radio value="Pick Up" className="text-xs">
                        Pick Up
                      </Radio>
                    </div>
                    <div className="border rounded-xl px-3 py-2 hover:border-emerald-400 transition cursor-pointer">
                      <Radio value="Paid Already" className="text-xs">
                        Paid Already
                      </Radio>
                    </div>
                  </>
                )}
              </Radio.Group>

              <p className="mt-2 text-[11px] text-slate-500">
                Your payment details are encrypted and securely processed.
              </p>
            </div>

            {/* Place Order CTA – full width, modern */}
            <div className="bg-transparent rounded-2xl pt-1">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className={`
                  relative w-full flex items-center justify-center gap-2
                  rounded-2xl py-3.5 text-sm font-semibold text-white
                  bg-gradient-to-r from-green-500 via-green-400 to-green-300
                  
                  active:shadow-md transform hover:-translate-y-[1px] active:translate-y-0
                  transition-all disabled:bg-slate-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed
                `}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span>Placing order…</span>
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span>Place Order</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}


      {/* Validation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>Complete Required Fields</span>
          </div>
        }
        open={isValidationModalVisible}
        onCancel={() => setIsValidationModalVisible(false)}
        centered
        footer={[
          <button
            key="ok"
            onClick={() => setIsValidationModalVisible(false)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Got It
          </button>,
        ]}
      >
        <div className="space-y-3 mt-4">
          <p className="text-gray-600 mb-4">Please fill in the following required fields to place your order:</p>
          {validateRequiredFields().map((error, index) => {
            const getIcon = (field) => {
              switch (field) {
                case 'name': return <UserIcon className="w-4 h-4 text-red-500" />;
                case 'phone': return <PhoneIcon className="w-4 h-4 text-red-500" />;
                case 'address': return <MapPinIcon className="w-4 h-4 text-red-500" />;
                case 'payment': return <CreditCardIcon className="w-4 h-4 text-red-500" />;
                default: return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
              }
            };

            const getFieldName = (field) => {
              switch (field) {
                case 'name': return 'Recipient Name';
                case 'phone': return 'Contact Number';
                case 'address': return 'Delivery Address';
                case 'payment': return 'Payment Method';
                default: return 'Required Field';
              }
            };

            return (
              <div key={index} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border border-red-200">
                {getIcon(error.field)}
                <span className="text-sm font-medium text-red-700">
                  {getFieldName(error.field)}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>


      {/* Payment Iframe Modal */}
      {/* Payment Modal - ONLY for non-agents */}
      {!isAgent && (
        <Modal
          open={isPaymentModalVisible}
          onCancel={() => setIsPaymentModalVisible(false)}
          footer={null}
          closable
          centered
          width={600}
        >
          {paymentUrl ? (
            <iframe
              src={paymentUrl}
              title="Hubtel Payment"
              width="100%"
              height="700px"
              frameBorder="0"
            />
          ) : (
            <p>Loading payment interface...</p>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Checkout;
