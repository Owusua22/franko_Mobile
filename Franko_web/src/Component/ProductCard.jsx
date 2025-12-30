// ProductCard.jsx - Reusable Product Card Component styled like ComboComponent

import React,
{
  useCallback,
  useState,
  useRef,
  useEffect,
  memo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  HeartIcon as SolidHeartIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { addToWishlist, removeFromWishlist } from "../Redux/Slice/wishlistSlice";
import useAddToCart from "./Cart";

const SCROLL_KEY = "phonesScrollY"; // must match the key used in Phones.jsx

// ---------------------------------------------------
// Notification Component
// ---------------------------------------------------
const Notification = ({ message, type, isVisible, onClose }) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isVisible && message) {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [isVisible, message, onClose]);

  if (!isVisible || !message) return null;

  const bgColor = type === "success" ? "bg-[#10b981]" : "bg-red-500";
  const Icon = type === "success" ? CheckCircleIcon : XCircleIcon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] backdrop-blur-sm`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-lg leading-none p-1"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------
// Single Product Card Item
// ---------------------------------------------------
const ProductCardItem = memo(
  ({
    product,
    onWishlistToggle,
    onAddToCart,
    isInWishlist,
    cartLoading,
    navigate,
    isNew,
  }) => {
    const { productID, productName, productImage, price, oldPrice, stock } =
      product;

    const [imageLoaded, setImageLoaded] = useState(false);

    const isOnSale = oldPrice > 0 && oldPrice > price;
    const discountPercent = isOnSale
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;
    const inWishlist = isInWishlist(productID);
    const isOutOfStock = stock === 0;

    const getValidImageUrl = (imagePath) => {
      if (!imagePath) return "https://via.placeholder.com/150";
      return imagePath.includes("\\")
        ? `https://smfteapi.salesmate.app/Media/Products_Images/${
            imagePath.split("\\").pop() ?? ""
          }`
        : imagePath;
    };

    const formatPrice = (value) =>
      new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
      }).format(value || 0);

    const handleCardClick = useCallback(() => {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem(
            SCROLL_KEY,
            String(window.scrollY || window.pageYOffset || 0)
          );
        }
      } catch {
        // ignore storage errors
      }

      navigate(`/product/${productID}`);
    }, [navigate, productID]);

    const handleWishlistClick = useCallback(
      (e) => {
        e.stopPropagation();
        onWishlistToggle(product);
      },
      [onWishlistToggle, product]
    );

    const handleAddToCartClick = useCallback(
      (e) => {
        e.stopPropagation();
        onAddToCart(product);
      },
      [onAddToCart, product]
    );

    return (
      <div
        onClick={handleCardClick}
        className="
          relative
          bg-white
          rounded-2xl
          shadow-[0_10px_30px_rgba(15,23,42,0.18)]
          overflow-hidden
          transition-all
          duration-200
          hover:-translate-y-1
          hover:shadow-[0_20px_60px_rgba(15,23,42,0.28)]
        "
      >
        {/* Image Section */}
        <div className="relative h-40 bg-white flex items-center justify-center">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="w-10 h-10 rounded-full border-2 border-t-[#FF6347] border-r-[#FF6347] border-b-transparent border-l-transparent animate-spin" />
            </div>
          )}

          <img
            src={getValidImageUrl(productImage)}
            alt={productName}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            className={`
              w-full h-full object-contain
              transition-opacity duration-300
              ${imageLoaded ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* NEW Badge */}
          {isNew && !isOutOfStock && (
            <span
              className="
                absolute top-2 left-2
                bg-[#ff4757]
                text-white
                text-[10px]
                font-bold
                px-2 py-0.5
                rounded-full
                shadow-sm
              "
            >
              NEW
            </span>
          )}

          {/* SALE Badge */}
          {isOnSale && !isOutOfStock && (
            <span
              className="
                absolute top-2 right-2
                bg-[#ff6b35]
                text-white
                text-[10px]
                font-bold
                px-2 py-0.5
                rounded-full
                shadow-sm
              "
            >
              SALE
            </span>
          )}

          {/* Sold Out Badge */}
          {isOutOfStock && (
            <span
              className="
                absolute top-2 left-2
                bg-black/80
                text-white
                text-[10px]
                font-semibold
                px-2 py-0.5
                rounded-full
              "
            >
              Sold Out
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="
              absolute bottom-2 right-2
              w-8 h-8
              rounded-full
              bg-white
              shadow-[0_4px_12px_rgba(15,23,42,0.25)]
              flex items-center justify-center
              hover:scale-105
              active:scale-95
              transition-transform
            "
          >
            {inWishlist ? (
              <SolidHeartIcon className="w-4 h-4 text-red-500" />
            ) : (
              <OutlineHeartIcon className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className="px-3 pt-2 pb-3 pr-12">
          <h3
            className="
              text-xs
              font-medium
              text-gray-800
              line-clamp-2
              min-h-[32px]
              leading-snug
            "
          >
            {productName}
          </h3>

          <div className="mt-2 space-y-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-gray-900">
                {formatPrice(price)}
              </span>

              {discountPercent > 0 && (
                <span className="text-[11px] font-semibold text-[#ff6b35]">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {oldPrice > 0 && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart FAB */}
        <button
          onClick={handleAddToCartClick}
          disabled={cartLoading || isOutOfStock}
          className={`
            absolute
            bottom-3 right-3
            w-9 h-9
            rounded-full
            flex items-center justify-center
            shadow-[0_6px_16px_rgba(220,38,38,0.35)]
            transition-transform duration-150
            ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-[#E63946] text-white hover:bg-[#d12f3b] active:scale-95"
            }
          `}
        >
          <ShoppingCartIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

ProductCardItem.displayName = "ProductCardItem";

// ---------------------------------------------------
// Skeleton Loader
// ---------------------------------------------------
const ProductSkeleton = () => (
  <div
    className="
      relative
      bg-white
      rounded-2xl
      overflow-hidden
      shadow-[0_10px_30px_rgba(15,23,42,0.15)]
      animate-pulse
    "
  >
    <div className="h-40 bg-gray-100" />
    <div className="px-3 pt-2 pb-3 pr-12 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
    <div className="absolute bottom-3 right-3 w-9 h-9 bg-gray-200 rounded-full" />
  </div>
);

// ---------------------------------------------------
// Main ProductCard Component - Grid Layout
// ---------------------------------------------------
const ProductCard = ({ currentProducts, navigate, loading }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items || []);
  const { addProductToCart, loading: cartLoading } = useAddToCart();

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message: "", type: "success", isVisible: false });
    requestAnimationFrame(() => {
      setNotification({
        message,
        type,
        isVisible: true,
      });
    });
  }, []);

  const isInWishlist = useCallback(
    (id) => Array.isArray(wishlist) && wishlist.some((item) => item.id === id),
    [wishlist]
  );

  const handleWishlistToggle = useCallback(
    async (product) => {
      try {
        const id = product.id || product.productID;
        if (isInWishlist(id)) {
          dispatch(removeFromWishlist(id));
          showNotification("Removed from wishlist", "success");
        } else {
          dispatch(addToWishlist({ ...product, id }));
          showNotification("Added to wishlist", "success");
        }
      } catch {
        showNotification("Failed to update wishlist", "error");
      }
    },
    [dispatch, isInWishlist, showNotification]
  );

  const handleAddToCart = useCallback(
    async (product) => {
      try {
        await addProductToCart(product);
        showNotification("Added to cart successfully", "success");
      } catch {
        showNotification("Failed to add to cart", "error");
      }
    },
    [addProductToCart, showNotification]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!currentProducts || currentProducts.length === 0) {
    return null;
  }

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {currentProducts.map((product, index) => (
          <ProductCardItem
            key={product.productID}
            product={product}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            isInWishlist={isInWishlist}
            cartLoading={cartLoading}
            navigate={navigate}
            isNew={index < 3}
          />
        ))}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ProductCard;