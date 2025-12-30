// src/pages/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCartItem,
  deleteCartItem,
  getCartById,
} from "../Redux/Slice/cartSlice";
import AuthModal from "../Component/AuthModal";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ShareIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

/* -------------------- money formatting -------------------- */
const formatMoney = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { cart, loading, error, cartId } = useSelector(
    (state) => state.cart
  );

  const [networkError, setNetworkError] = useState({
    show: false,
    message: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const storedId = cartId || localStorage.getItem("cartId");
    if (storedId) dispatch(getCartById(storedId));
  }, [dispatch, cartId]);

  useEffect(() => {
    if (cart && cart.length >= 0) {
      try {
        localStorage.setItem("cart", JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to sync cart to localStorage:", e);
      }
    }
  }, [cart]);

  const showNetErr = (msg) => {
    setNetworkError({ show: true, message: msg });
    setTimeout(
      () => setNetworkError({ show: false, message: "" }),
      4000
    );
  };

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;

    const previousLocalStorage = localStorage.getItem("cart");

    try {
      const optimisticCart = cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
      localStorage.setItem("cart", JSON.stringify(optimisticCart));

      await dispatch(
        updateCartItem({ cartId, productId, quantity })
      ).unwrap();
      await dispatch(getCartById(cartId)).unwrap();
    } catch (e) {
      console.error("Failed to update cart:", e);
      if (previousLocalStorage)
        localStorage.setItem("cart", previousLocalStorage);
      showNetErr(
        "Failed to update cart. Please check your connection and try again."
      );
      try {
        await dispatch(getCartById(cartId)).unwrap();
      } catch {}
    }
  };

  const handleRemoveItem = async (productId) => {
    const previousLocalStorage = localStorage.getItem("cart");

    try {
      const optimisticCart = cart.filter(
        (item) => item.productId !== productId
      );
      localStorage.setItem("cart", JSON.stringify(optimisticCart));

      await dispatch(
        deleteCartItem({ cartId, productId })
      ).unwrap();
      await dispatch(getCartById(cartId)).unwrap();
    } catch (e) {
      console.error("Delete failed:", e);
      if (previousLocalStorage)
        localStorage.setItem("cart", previousLocalStorage);
      showNetErr(
        "Failed to remove item. Please check your connection and try again."
      );
      try {
        await dispatch(getCartById(cartId)).unwrap();
      } catch {}
    }
  };

  const handleCheckout = () => {
    const storedCustomer = localStorage.getItem("customer");
    if (!storedCustomer) {
      setAuthModalOpen(true);
      return;
    }

    const cartTotal = cart.reduce(
      (acc, item) =>
        acc +
        (Number(item.price) || 0) *
          (Number(item.quantity) || 0),
      0
    );

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "proceed_to_checkout",
      cartValue: Number(cartTotal.toFixed(2)),
      cartItems: cart.map((item) => ({
        productId: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    localStorage.setItem("selectedCart", JSON.stringify(cart));
    navigate("/checkout");
  };

  const handleContinueShopping = () => navigate("/products");

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (acc, item) =>
          acc +
          (Number(item.price) || 0) *
            (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  const totalCartItems = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  const renderImage = (imagePath) => {
    if (!imagePath) {
      return (
        <div className="w-full h-full bg-[#f0fdf4] flex items-center justify-center text-[10px] text-[#166534]">
          No Image
        </div>
      );
    }
    const backendBaseURL = "https://smfteapi.salesmate.app";
    const file = imagePath.includes("\\")
      ? imagePath.split("\\").pop()
      : imagePath;
    const imageUrl = `${backendBaseURL}/Media/Products_Images/${file}`;
    return (
      <img
        src={imageUrl}
        alt="Product"
        className="w-full h-full object-cover"
      />
    );
  };

  /* ---------- Loading / error states ---------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#22c55e] mx-auto" />
          <p className="text-[#166534] mt-4 font-semibold text-sm">
            Loading your cart…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-4">
        <div className="text-center bg-white p-6 rounded-2xl border border-red-100 shadow-sm max-w-md w-full">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">
            Couldn’t load your cart
          </h3>
          <p className="text-gray-600 mb-5 text-sm">
            Please refresh and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-sm transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Main UI ---------- */

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Network Error Toast */}
      {networkError.show && (
        <div className="fixed top-3 right-3 z-50 max-w-xs">
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-3">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-800">
                  {networkError.message}
                </p>
              </div>
              <button
                onClick={() =>
                  setNetworkError({ show: false, message: "" })
                }
                className="text-red-700 text-xs font-bold px-1"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="h-12 flex items-center justify-between px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-900" />
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            My Cart
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <button className="p-1.5 rounded-full hover:bg-gray-100 transition">
              <ShareIcon className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-100 transition">
              <BookmarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-28 lg:pb-6">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-white p-7 rounded-3xl border border-[#bbf7d0] shadow-sm max-w-md w-full">
              <div className="w-20 h-20 bg-[#f0fdf4] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#bbf7d0]">
                <ShoppingBagIcon className="w-10 h-10 text-[#15803d]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#14532d] mb-2">
                Your cart is empty
              </h3>
              <p className="text-[#166534] text-sm mb-6 leading-relaxed">
                Add products to your cart to see them here.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleContinueShopping}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold py-3 px-6 rounded-2xl shadow-sm transition"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] font-extrabold py-3 px-6 rounded-2xl border border-[#bbf7d0] transition"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Items + Order Summary (desktop) */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Items list */}
              <div className="flex-1">
                {cart.map((item, index) => {
                  const unit = Number(item.price) || 0;
                  const qty = Number(item.quantity) || 0;

                  const goToProduct = () => {
                    if (!item.productId) return;
                    navigate(`/product/${item.productId}`);
                  };

                  return (
                    <div
                      key={item.productId}
                      className={`flex items-start py-3 ${
                        index < cart.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      {/* Image */}
                      <div
                        className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-[#f0fdf4] flex-shrink-0"
                        onClick={goToProduct}
                      >
                        {renderImage(item.imagePath)}
                      </div>

                      {/* Center: name + price + qty */}
                      <div
                        className="ml-3 flex-1 min-w-0"
                        onClick={goToProduct}
                      >
                        <p className="text-[13px] font-medium text-gray-900 line-clamp-2">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-[12px] font-semibold text-gray-900">
                          ₵{formatMoney(unit)}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(
                                item.productId,
                                qty - 1
                              );
                            }}
                            disabled={qty <= 1}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 text-lg disabled:opacity-50"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-gray-900">
                            {qty}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(
                                item.productId,
                                qty + 1
                              );
                            }}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 text-lg"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.productId);
                        }}
                        className="ml-3 mt-2 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary - Desktop */}
              <aside className="hidden lg:flex flex-col w-full max-w-sm">
                <div className="bg-white rounded-3xl border border-[#bbf7d0] p-4 shadow-sm flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-[#dcfce7] rounded-xl flex items-center justify-center border border-[#bbf7d0]">
                      <ShoppingBagIcon className="w-5 h-5 text-[#15803d]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-[#14532d]">
                        Order Summary
                      </h2>
                      <p className="text-[11px] text-[#166534]">
                        {totalCartItems} item
                        {totalCartItems !== 1 && "s"} in cart
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex justify-between items-center text-[#166534]">
                      <span>Subtotal</span>
                      <span className="font-extrabold text-[#14532d]">
                        ₵{formatMoney(cartTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#9ca3af] text-[11px]">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-[#14532d]">
                      Total
                    </span>
                    <span className="text-lg font-extrabold text-[#15803d]">
                      ₵{formatMoney(cartTotal)}
                    </span>
                  </div>

                  <p className="text-[11px] text-center text-[#166534] mb-4">
                    Taxes, discounts & shipping calculated at checkout.
                  </p>

                  {/* FULL-WIDTH checkout button (desktop) */}
                  <button
                    onClick={handleCheckout}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white font-semibold py-3 shadow-[0_14px_30px_rgba(37,99,235,0.35)] active:shadow-md transform hover:-translate-y-[1px] active:translate-y-0 transition-all"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span className="tracking-wide uppercase text-[12px]">
                      Proceed to Checkout
                    </span>
                    <ArrowRightIcon className="w-4 h-4 animate-pulse" />
                  </button>

                  <button
                    onClick={handleContinueShopping}
                    className="mt-3 w-full bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] font-extrabold py-3 px-4 rounded-2xl border border-[#bbf7d0] transition flex items-center justify-center gap-2 text-xs"
                  >
                    Continue Shopping
                  </button>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      {/* Mobile Checkout Bar – full-width button */}
      {cart.length > 0 && (
        <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#bbf7d0] z-50">
          <div className="px-4 pt-2 pb-1 flex justify-between items-center text-xs text-[#166534]">
            <span>
              {totalCartItems} item
              {totalCartItems !== 1 && "s"}
            </span>
            <span className="font-extrabold text-[#15803d]">
              ₵{formatMoney(cartTotal)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 via-green-300 to-green-500  text-white font-semibold text-sm py-3 shadow-[0_-6px_20px_rgba(15,23,42,0.35)] active:shadow-md transform active:scale-[0.99] transition-all"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span className="tracking-wide uppercase">
              Proceed to Checkout
            </span>
            <ArrowRightIcon className="w-4 h-4 animate-pulse" />
          </button>
        </footer>
      )}

      {/* Auth modal for checkout */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default Cart;