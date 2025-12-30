/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  HeartIcon as OutlineHeartIcon,
  HeartIcon as SolidHeartIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/solid";
import { fetchProductByShowroomAndRecord } from "../Redux/Slice/productSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../Redux/Slice/wishlistSlice";
import useAddToCart from "./Cart";

const DEALS_SHOWROOM_ID = "1e93aeb7-bba7-4bd4-b017-ea3267047d46";

// Format image URL
const getValidImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/150";
  return imagePath.includes("\\")
    ? `https://smfteapi.salesmate.app/Media/Products_Images/${
        imagePath.split("\\").pop() ?? ""
      }`
    : imagePath;
};

// Format price
const formatPrice = (price) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(price || 0);

// Notification Component
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

  const bgColor = type === "success" ? "bg-emerald-500" : "bg-red-500";
  const Icon = type === "success" ? CheckCircleIcon : XCircleIcon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColor} text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] backdrop-blur-sm`}
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

// Compact Timer Component
const CompactTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(23, 59, 59, 999);

      const difference = nextSunday.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (num) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
      <span className="text-[10px] text-white/80">⏰</span>
      <span className="text-[10px] sm:text-[11px] font-bold text-white">
        {pad(timeLeft.days)}d : {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m :{" "}
        {pad(timeLeft.seconds)}s
      </span>
    </div>
  );
};

// Compact Deals Header Component
const DealsHeader = ({ onViewMore }) => (
  <div className="relative bg-[#10b981] rounded-xl p-3 mx-4 mb-3 overflow-hidden">
    {/* Floating Elements */}
    <div className="absolute top-1 right-4 text-lg opacity-30">✨</div>
    <div className="absolute bottom-1 right-12 text-sm opacity-30">💫</div>

    {/* Content */}
    <div className="relative z-10 flex items-center justify-between gap-2">
      {/* Left Side */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xl sm:text-2xl flex-shrink-0">🔥</span>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-white truncate">
            Deals of the Week
          </h2>
          <CompactTimer />
        </div>
      </div>

      {/* View All Button */}
      <button
        onClick={onViewMore}
        className="
          flex items-center gap-0.5
          bg-white/20 backdrop-blur-sm
          px-2.5 py-1.5
          rounded-full
          text-white text-[11px] font-semibold
          hover:bg-white/30
          active:scale-95
          transition-all
          flex-shrink-0
        "
      >
        <span>View All</span>
        <ChevronRightIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// Product Card Component (UI like NewArrivals / Combo card)
const ProductCard = ({
  product,
  onWishlistToggle,
  onAddToCart,
  isInWishlist,
  cartLoading,
  onNavigate,
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

  const handleCardClick = () => {
    onNavigate(`/product/${productID}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onWishlistToggle(product);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        flex-shrink-0
        w-[145px] sm:w-[160px]
        relative
        bg-white
        rounded-2xl
        shadow-[0_4px_12px_rgba(15,23,42,0.08)]
        overflow-hidden
        transition-transform
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_10px_25px_rgba(15,23,42,0.15)]
        cursor-pointer
      "
    >
      {/* Image Section */}
      <div className="relative h-[130px] bg-[#f8f9fa] flex items-center justify-center">
        {/* Spinner while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9fa]">
            <div className="w-9 h-9 rounded-full border-2 border-t-[#FF6347] border-r-[#FF6347] border-b-transparent border-l-transparent animate-spin" />
          </div>
        )}

        <img
          src={getValidImageUrl(productImage)}
          alt={productName}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* DEAL badge (when discounted and in stock) */}
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
            DEAL
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

        {/* Wishlist Button (bottom-right on image) */}
        <button
          onClick={handleWishlistClick}
          className="
            absolute bottom-2 right-2
            w-8 h-8
            rounded-full
            bg-white
            shadow-md
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
      <div className="px-2.5 pt-2 pb-3 pr-11">
        <h3
          className="
            text-[11px]
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
              <span className="text-[10px] font-semibold text-[#ff6b35]">
                -{discountPercent}%
              </span>
            )}
          </div>

          {oldPrice > 0 && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart FAB (floating bottom-right of card) */}
      <button
        onClick={handleAddToCartClick}
        disabled={cartLoading || isOutOfStock}
        className={`
          absolute
          bottom-2 right-2
          w-9 h-9
          rounded-full
          flex items-center justify-center
          shadow-md
          transition-transform duration-150
          ${
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#E63946] text-white hover:bg-[#d12f3b] active:scale-95"
          }
        `}
      >
        <ShoppingCartIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

// Skeleton Loader (matches new card shape)
const ProductSkeleton = () => (
  <div
    className="
      flex-shrink-0
      w-[145px] sm:w-[160px]
      relative
      bg-white
      rounded-2xl
      overflow-hidden
      shadow-[0_4px_12px_rgba(15,23,42,0.08)]
      animate-pulse
    "
  >
    <div className="h-[130px] bg-gray-200" />
    <div className="px-2.5 pt-2 pb-3 pr-11 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
    <div className="absolute bottom-2 right-2 w-9 h-9 bg-gray-200 rounded-full" />
  </div>
);

// View More Card
const ViewMoreCard = ({ extraCount, onPress }) => (
  <button
    onClick={onPress}
    className="
      flex-shrink-0
      w-[145px] sm:w-[160px]
      h-[185px]
      bg-[#f0fdf4]
      rounded-2xl
      border-2 border-dashed border-[#10b981]
      flex flex-col items-center justify-center
      gap-1.5
      hover:bg-[#dcfce7]
      transition-colors
      cursor-pointer
    "
  >
    <span className="text-4xl">🔥</span>
    <span className="text-sm font-bold text-[#10b981]">More Deals</span>
    <span className="text-[10px] text-[#059669]">{extraCount}+ items</span>
  </button>
);

// Main Deals Component
const Deals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

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

  const { addProductToCart, loading: cartLoading } = useAddToCart();
  const { productsByShowroom, loading } = useSelector(
    (state) => state.products
  );
  const wishlist = useSelector((state) => state.wishlist.items);

  const products = useMemo(
    () => productsByShowroom?.[DEALS_SHOWROOM_ID] || [],
    [productsByShowroom]
  );

  const displayProducts = useMemo(() => products.slice(0, 10), [products]);

  const extraProductsCount = useMemo(
    () => Math.max(0, products.length - 10),
    [products.length]
  );

  const isInWishlist = useCallback(
    (id) => wishlist.some((item) => item.id === id),
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

  const handleViewMore = useCallback(() => {
    navigate(`/showroom/${DEALS_SHOWROOM_ID}`);
  }, [navigate]);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(
        fetchProductByShowroomAndRecord({
          showRoomCode: DEALS_SHOWROOM_ID,
          recordNumber: 10,
        })
      );
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    const updateArrows = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
      }
    };

    updateArrows();
    const ref = scrollRef.current;
    ref?.addEventListener("scroll", updateArrows);
    return () => ref?.removeEventListener("scroll", updateArrows);
  }, [displayProducts]);

  const scroll = useCallback((direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 180;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const shouldShowLoading = loading && products.length === 0;

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <section className="w-full bg-white py-3">
        {/* Compact Header */}
        <DealsHeader onViewMore={handleViewMore} />

        {/* Products Carousel */}
        <div className="relative px-4">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="
                absolute left-1 top-1/2 -translate-y-1/2 z-20
                w-7 h-7
                bg-white/95 backdrop-blur-sm
                rounded-full
                shadow-md
                border border-gray-100
                flex items-center justify-center
                hover:bg-[#f0fdf4]
                hover:border-[#10b981]
                active:scale-95
                transition-all duration-200
              "
            >
              <ChevronLeftIcon className="w-3.5 h-3.5 text-[#10b981]" />
            </button>
          )}

          {/* Products Container */}
          <div
            ref={scrollRef}
            className="
              flex gap-2.5
              overflow-x-auto
              scroll-smooth
              pb-1
              no-scrollbar
            "
            style={{ scrollSnapType: "x mandatory" }}
          >
            {shouldShowLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <ProductSkeleton key={idx} />
                ))
              : displayProducts.map((product) => (
                  <div
                    key={product.productID}
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <ProductCard
                      product={product}
                      onWishlistToggle={handleWishlistToggle}
                      onAddToCart={handleAddToCart}
                      isInWishlist={isInWishlist}
                      cartLoading={cartLoading}
                      onNavigate={navigate}
                    />
                  </div>
                ))}

            {/* View More Card */}
            {!shouldShowLoading && extraProductsCount > 0 && (
              <ViewMoreCard
                extraCount={extraProductsCount}
                onPress={handleViewMore}
              />
            )}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="
                absolute right-1 top-1/2 -translate-y-1/2 z-20
                w-7 h-7
                bg-white/95 backdrop-blur-sm
                rounded-full
                shadow-md
                border border-gray-100
                flex items-center justify-center
                hover:bg-[#f0fdf4]
                hover:border-[#10b981]
                active:scale-95
                transition-all duration-200
              "
            >
              <ChevronRightIcon className="w-3.5 h-3.5 text-[#10b981]" />
            </button>
          )}
        </div>
      </section>

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

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Deals;