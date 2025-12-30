import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../Redux/Slice/wishlistSlice";
import { fetchProducts } from "../Redux/Slice/productSlice";
import {
  HeartIcon as SolidHeartIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import useAddToCart from "./Cart";
import { useNavigate } from "react-router-dom";

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

// Section Header Component
const SectionHeader = ({ title, emoji, onViewAll }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {emoji && <span className="text-lg sm:text-xl md:text-2xl">{emoji}</span>}
      <div className="relative">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
          {title}
        </h2>
        <div className="absolute -bottom-1 left-0 h-[3px] w-10 rounded-full bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#6ee7b7]" />
        <div className="absolute -bottom-1.5 left-0 h-[8px] w-3/4 bg-[#10b981]/20 blur-sm rounded-full" />
      </div>
    </div>

    <button
      onClick={onViewAll}
      className="
        flex items-center gap-1
        px-3 py-1.5
        rounded-full
        text-[#10b981] text-xs sm:text-sm font-semibold
        border border-[#10b981]/30
        bg-[#f0fdf4]
        hover:bg-[#dcfce7]
        hover:border-[#10b981]
        active:scale-95
        transition-all
        flex-shrink-0
      "
    >
      <span>Shop All</span>
      <ChevronRightIcon className="w-3.5 h-3.5" />
    </button>
  </div>
);

// New Arrival Card (UI matches Combo / updated ProductCard)
const NewArrivalCard = ({
  product,
  onWishlistToggle,
  onAddToCart,
  isInWishlist,
  cartLoading,
  onNavigate,
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
      <div className="relative h-40 bg-[#f8f9fa] flex items-center justify-center">
        {/* Spinner while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9fa]">
            <div className="w-10 h-10 rounded-full border-2 border-t-[#FF6347] border-r-[#FF6347] border-b-transparent border-l-transparent animate-spin" />
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

        {/* NEW Badge (for first few items) */}
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

        {/* Wishlist Button (on image, bottom-right) */}
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

      {/* Add to Cart FAB (floating bottom-right) */}
      <button
        onClick={handleAddToCartClick}
        disabled={cartLoading || isOutOfStock}
        className={`
          absolute
          bottom-3 right-3
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

// Skeleton Loader matching new card shape
const ProductSkeleton = () => (
  <div
    className="
      relative
      bg-white
      rounded-2xl
      overflow-hidden
      shadow-[0_4px_12px_rgba(15,23,42,0.08)]
      animate-pulse
    "
  >
    <div className="h-40 bg-gray-200" />
    <div className="px-3 pt-2 pb-3 pr-12 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
    <div className="absolute bottom-3 right-3 w-9 h-9 bg-gray-200 rounded-full" />
  </div>
);

// Main NewArrivals Component
const NewArrivals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state) => state.products);
  const wishlist = useSelector((state) => state.wishlist.items || []);
  const { addProductToCart, loading: cartLoading } = useAddToCart();

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get the 10 most recent products based on creation date
  const recentProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const sortedProducts = [...products].sort((a, b) => {
      const dateA = new Date(
        a.dateCreated ||
          a.createdAt ||
          a.created_at ||
          a.date_created ||
          a.creationDate ||
          0
      );
      const dateB = new Date(
        b.dateCreated ||
          b.createdAt ||
          b.created_at ||
          b.date_created ||
          b.creationDate ||
          0
      );

      return dateB - dateA;
    });

    return sortedProducts.slice(0, 10);
  }, [products]);

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
    (id) =>
      Array.isArray(wishlist) && wishlist.some((item) => item.id === id),
    [wishlist]
  );

  const handleWishlistToggle = useCallback(
    (product) => {
      const id = product.productID;
      if (isInWishlist(id)) {
        dispatch(removeFromWishlist(id));
        showNotification("Removed from wishlist");
      } else {
        dispatch(addToWishlist({ ...product, id }));
        showNotification("Added to wishlist");
      }
    },
    [dispatch, isInWishlist, showNotification]
  );

  const handleAddToCart = useCallback(
    async (product) => {
      try {
        await addProductToCart(product);
        showNotification("Added to cart");
      } catch {
        showNotification("Failed to add to cart", "error");
      }
    },
    [addProductToCart, showNotification]
  );

  const shouldShowLoading = loading && recentProducts.length === 0;

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <section className="w-full bg-white py-4 px-4">
        {/* Section Header */}
        <SectionHeader
          title="New Arrivals"
          emoji="✨"
          onViewAll={() => navigate("/products")}
        />

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {shouldShowLoading
            ? Array.from({ length: 10 }).map((_, idx) => (
                <ProductSkeleton key={idx} />
              ))
            : recentProducts.map((product, index) => (
                <NewArrivalCard
                  key={product.productID}
                  product={product}
                  onWishlistToggle={handleWishlistToggle}
                  onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist}
                  cartLoading={cartLoading}
                  onNavigate={navigate}
                  // Mark first 3 as NEW (you can change this logic as needed)
                  isNew={index < 3}
                />
              ))}
        </div>

        {/* Divider */}
        <div className="mt-6 flex justify-center">
          <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-[#10b981]/20 to-transparent" />
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
      `}</style>
    </>
  );
};

export default NewArrivals;