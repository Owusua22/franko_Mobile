import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Image } from "antd";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ShareIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Button, IconButton, Drawer } from "@material-tailwind/react";

import { fetchProductById, fetchProducts } from "../Redux/Slice/productSlice";
import { updateCartItem, deleteCartItem, getCartById } from "../Redux/Slice/cartSlice";

import ProductDetailSkeleton from "../Component/ProductDetailSkeleton";
import ProductCard from "../Component/ProductCard";
import useAddToCart from "../Component/Cart";
import AuthModal from "../Component/AuthModal";
import gif from "../assets/no.gif";

/* -------------------- utils -------------------- */
const SCROLL_KEY = "productDetailScrollY";

const formatPrice = (price) => {
  const n = Number(price);
  if (!Number.isFinite(n)) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getValidImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/600x600?text=No+Image";
  const file = imagePath.includes("\\")
    ? imagePath.split("\\").pop()
    : imagePath.includes("/")
      ? imagePath.split("/").pop()
      : imagePath;
  return `https://smfteapi.salesmate.app/Media/Products_Images/${file}`;
};

const safeText = (v) => (typeof v === "string" ? v.trim() : "");

const normalizeCategoryName = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const CATEGORY_ROUTE_MAP = {
  phones: "/phones",
  phone: "/phones",

  computer: "/computers",
  computers: "/computers",

  accessories: "/accessories",
  accessory: "/accessories",

  television: "/television",
  tv: "/television",
  televisions: "/television",

  speakers: "/speakers",
  speaker: "/speakers",

  "home appliances": "/appliances",
  appliances: "/appliances",

  "air condition": "/air-condition",
  "air conditioner": "/air-condition",
  "air-conditioning": "/air-condition",

  "washing machine": "/washing-machine",
  "washing machines": "/washing-machine",

  fridge: "/refrigerator",
  refrigerator: "/refrigerator",
  "fridge/freezer": "/refrigerator",
};

const getCategoryRoute = (categoryName) => {
  const key = normalizeCategoryName(categoryName);
  return CATEGORY_ROUTE_MAP[key] || null; // null means fallback to slug route
};

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/** Convert raw description (plain text OR HTML-ish) into clean lines */
const normalizeDescriptionToLines = (raw) => {
  let text = typeof raw === "string" ? raw : "";
  if (!text.trim()) return [];

  // common HTML -> text lines
  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "");

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
};

const getRawDescription = (p) =>
  p?.description ||
  p?.productDescription ||
  p?.details ||
  p?.shortDescription ||
  p?.longDescription ||
  p?.specification ||
  p?.productDetails ||
  "";

/**
 * Output:
 * intro: paragraph
 * sections: [{title, items:[{label,value}]}]
 */
const splitDescription = (product) => {
  const raw = getRawDescription(product);
  const lines = normalizeDescriptionToLines(raw);

  const stripLeadingBullet = (l) => l.replace(/^([•*-])\s+/, "").trim();
  const isSectionHeader = (l) => /^[^:]{2,}:\s*$/.test(stripLeadingBullet(l)); // "Processor:"
  const isKeyValue = (l) => /^([^:]{1,}):\s*(.+)$/.test(stripLeadingBullet(l)); // "CPU: x"

  const firstStructuredIdx = lines.findIndex((l) => isSectionHeader(l) || isKeyValue(l));

  const intro =
    firstStructuredIdx === -1 ? lines.join(" ") : lines.slice(0, firstStructuredIdx).join(" ");

  const structuredLines = firstStructuredIdx === -1 ? [] : lines.slice(firstStructuredIdx);

  const sections = [];
  let current = null;

  for (const rawLine of structuredLines) {
    const line = stripLeadingBullet(rawLine);

    if (isSectionHeader(line)) {
      const title = line.replace(/:\s*$/, "").trim();
      current = { title, items: [] };
      sections.push(current);
      continue;
    }

    const kv = line.match(/^([^:]{1,}):\s*(.+)$/);
    if (kv) {
      const label = kv[1].trim();
      const value = kv[2].trim();
      if (!current) {
        current = { title: "Details", items: [] };
        sections.push(current);
      }
      current.items.push({ label, value });
      continue;
    }

    if (!current) {
      current = { title: "Details", items: [] };
      sections.push(current);
    }
    current.items.push({ label: "", value: line });
  }

  return { intro: intro.trim(), sections };
};

/* -------------------- UI bits -------------------- */
const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]">
    {children}
  </span>
);

const ProductSpecsList = ({ product }) => {
  const name = product?.productName || "Product";
  const { intro, sections } = splitDescription(product);

  return (
    <div className="bg-white rounded-2xl border border-[#bbf7d0] overflow-hidden">
      <div className="px-3 py-2 bg-[#f0fdf4] border-b border-[#bbf7d0]">
        <p className="text-xs font-extrabold text-[#15803d]">Product details</p>
      </div>

      <div className="p-3">
      
       
        {sections.length > 0 && (
          <div className="mt-3 space-y-4">
            {sections.map((sec) => (
              <div key={sec.title}>
               
                <ul className="mt-1 space-y-1">
                  {sec.items.map((it, idx) => (
                    <li
                      key={`${sec.title}-${idx}`}
                      className="text-[12px] leading-relaxed text-[#166534]"
                    >
                      {it.label ? (
                        <>
                          <span className="font-semibold">{it.label}:</span>{" "}
                          <span>{it.value}</span>
                        </>
                      ) : (
                        <span>{it.value}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------- page -------------------- */
const ProductDescription = () => {
  const { productID } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { addProductToCart, loading: cartHookLoading } = useAddToCart();
  const { currentProduct, products, loading } = useSelector((s) => s.products);
  const { cart, loading: cartLoadingState, cartId } = useSelector((s) => s.cart);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState({});
  const [removingItem, setRemovingItem] = useState({});
  const [cartSyncError, setCartSyncError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [mobileQty, setMobileQty] = useState(1);

  const relatedSectionRef = useRef(null);

  // Flix
  const flixMountRef = useRef(null);
  const [flixLoading, setFlixLoading] = useState(false);
  const [flixError, setFlixError] = useState(false);

  /* ---------- fetch + restore scroll (critical fix on productID change) ---------- */
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    const savedY = saved !== null && !Number.isNaN(Number(saved)) ? Number(saved) : null;

    dispatch(fetchProducts());

    // IMPORTANT: scroll to top immediately so user doesn't stay in old position
    window.scrollTo(0, 0);

    dispatch(fetchProductById(productID)).then(() => {
      if (savedY !== null) {
        setTimeout(() => {
          window.scrollTo(0, savedY);
          sessionStorage.removeItem(SCROLL_KEY);
        }, 0);
      }
    });
  }, [dispatch, productID]);

  /* ---------- online/offline ---------- */
  useEffect(() => {
    const onOnline = () => {
      setNetworkStatus(true);
      setCartSyncError(null);
      if (cartId) syncCartWithDatabase();
    };
    const onOffline = () => {
      setNetworkStatus(false);
      setCartSyncError("You're offline. Cart changes will sync when connection is restored.");
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  const syncCartWithDatabase = async () => {
    if (!cartId || !networkStatus) return;
    try {
      const result = await dispatch(getCartById(cartId)).unwrap();
      if (Array.isArray(result)) {
        localStorage.setItem("selectedCart", JSON.stringify(result));
        setCartSyncError(null);
      }
    } catch {
      setCartSyncError("Failed to sync cart. Changes saved locally.");
    }
  };

  useEffect(() => {
    if (cartId) syncCartWithDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  // ---- product selection + gating (prevents stale product rendering) ----
  const product = currentProduct?.[0];

  const productMatchesRoute = useMemo(() => {
    if (!product) return false;
    return String(product.productID) === String(productID);
  }, [product, productID]);

  const isOutOfStock = (p) => {
    if (!p) return false;
    const indicators = ["products out of stock", "out of stock", "unavailable", "not available"];
    if (p.brandName && indicators.some((x) => p.brandName.toLowerCase().includes(x))) return true;
    if (p.categoryName && indicators.some((x) => p.categoryName.toLowerCase().includes(x))) return true;
    if (p.showRoomName && indicators.some((x) => p.showRoomName.toLowerCase().includes(x))) return true;
    if (p.stockStatus && p.stockStatus.toLowerCase() === "out of stock") return true;
    if (p.quantity !== undefined && Number(p.quantity) <= 0) return true;
    return false;
  };

  const outOfStock = isOutOfStock(product);
  const imageUrl = useMemo(() => getValidImageUrl(product?.productImage), [product]);

  const discountPercent = useMemo(() => {
    const oldP = Number(product?.oldPrice || 0);
    const newP = Number(product?.price || 0);
    if (!oldP || oldP <= newP) return 0;
    return Math.round(((oldP - newP) / oldP) * 100);
  }, [product]);

  const related = useMemo(() => {
    if (!Array.isArray(products) || !product) return [];
    const cat = product.categoryName;
    const base = cat ? products.filter((p) => p.categoryName === cat) : [...products];
    return base.filter((p) => p.productID !== product.productID).slice(0, 12);
  }, [products, product]);

  const hasMoreInCategory = useMemo(() => {
    if (!Array.isArray(products) || !product?.categoryName) return false;
    const sameCat = products.filter(
      (p) => p.categoryName === product.categoryName && p.productID !== product.productID
    );
    return sameCat.length > related.length;
  }, [products, product, related.length]);

  // ✅ category navigation to your fixed pages
  const categoryPath = useMemo(() => {
    if (!product?.categoryName) return "/categories";
    const mapped = getCategoryRoute(product.categoryName);
    if (mapped) return mapped;
    // fallback if category doesn't match list
    return `/category/${slugify(product.categoryName)}`;
  }, [product]);

  const cartTotal = Array.isArray(cart)
    ? cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
    : 0;

  const totalCartItems = Array.isArray(cart)
    ? cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
    : 0;

  const handleNavigate = (path) => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    navigate(path);
  };

  const isCartButtonLoading = cartHookLoading || isAddingToCart;

  /* ---------- flix ---------- */
  const isValidSamsungProduct = useMemo(() => {
    const mpn = product?.productId3;
    return typeof mpn === "string" && mpn.trim().toUpperCase().startsWith("SM");
  }, [product]);

  useEffect(() => {
    if (!product || !productMatchesRoute) return;

    if (!isValidSamsungProduct) {
      setFlixLoading(false);
      setFlixError(false);
      if (flixMountRef.current) flixMountRef.current.innerHTML = "";
      return;
    }

    const mount = flixMountRef.current;
    if (!mount) return;

    setFlixLoading(true);
    setFlixError(false);

    const cleanup = () => {
      document
        .querySelectorAll('script[src*="media.flixfacts.com/js/loader.js"]')
        .forEach((s) => s.remove());
      if (mount) mount.innerHTML = "";
      document.querySelectorAll('link[href*="flixfacts.com"]').forEach((l) => l.remove());
    };

    cleanup();

    const inpageId = `flix-inpage-${product.productID}`;
    const minisiteId = `flix-minisite-${product.productID}`;

    mount.innerHTML = `
      <div class="bg-white rounded-2xl border border-[#bbf7d0] overflow-hidden">
        <div class="p-4 border-b border-[#bbf7d0] bg-[#f0fdf4]">
          <div class="text-sm font-bold text-[#15803d]">More Product Details</div>
          <div class="text-[10px] text-[#166534] mt-1">Loading Samsung details...</div>
        </div>
        <div class="p-4">
          <div id="${inpageId}"></div>
          <div id="${minisiteId}" class="mt-4"></div>
        </div>
      </div>
    `;

    const script = document.createElement("script");
    script.src = "https://media.flixfacts.com/js/loader.js";
    script.async = true;

    script.setAttribute("data-flix-distributor", "17909");
    script.setAttribute("data-flix-language", "gh");
    script.setAttribute("data-flix-mpn", (product.productId3 || "").trim());
    script.setAttribute("data-flix-ean", (product.productId2 || "").trim());
    script.setAttribute("data-flix-brand", (product.brandName || "Samsung").trim());
    script.setAttribute("data-flix-inpage", inpageId);
    script.setAttribute("data-flix-button", minisiteId);

    script.onload = () => {
      setFlixLoading(false);
      setTimeout(() => {
        const inpage = document.getElementById(inpageId);
        const minisite = document.getElementById(minisiteId);
        const empty =
          (!inpage || inpage.innerHTML.trim() === "") &&
          (!minisite || minisite.innerHTML.trim() === "");
        if (empty) setFlixError(true);
      }, 1200);
    };

    script.onerror = () => {
      setFlixLoading(false);
      setFlixError(true);
    };

    document.body.appendChild(script);
    return () => cleanup();
  }, [product, productMatchesRoute, isValidSamsungProduct]);

  /* ---------- cart helpers ---------- */
  const handleAddToCartAndOpenSidebar = async (p) => {
    if (!p || outOfStock) return;

    if (!networkStatus) {
      setCartSyncError("No internet connection. Please check your network.");
      return;
    }

    setIsAddingToCart(true);
    setCartSyncError(null);

    try {
      await addProductToCart(p);

      if (cartId) {
        try {
          const updatedCart = await dispatch(getCartById(cartId)).unwrap();
          if (Array.isArray(updatedCart)) localStorage.setItem("selectedCart", JSON.stringify(updatedCart));
        } catch {
          setCartSyncError("Added to cart, but sync failed. Changes saved locally.");
        }
      }

      setCartSidebarOpen(true);
    } catch {
      setCartSyncError("Failed to add product to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (!cartId || newQuantity < 1) return;

    setUpdatingQuantity((prev) => ({ ...prev, [productId]: true }));
    setCartSyncError(null);

    try {
      await dispatch(updateCartItem({ cartId, productId, quantity: newQuantity })).unwrap();
      const updatedCart = await dispatch(getCartById(cartId)).unwrap();
      if (Array.isArray(updatedCart)) localStorage.setItem("selectedCart", JSON.stringify(updatedCart));
    } catch {
      setCartSyncError("Failed to update quantity. Please try again.");
    } finally {
      setUpdatingQuantity((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!cartId) return;

    setRemovingItem((prev) => ({ ...prev, [productId]: true }));
    setCartSyncError(null);

    try {
      await dispatch(deleteCartItem({ cartId, productId })).unwrap();
      const updatedCart = await dispatch(getCartById(cartId)).unwrap();
      if (Array.isArray(updatedCart)) localStorage.setItem("selectedCart", JSON.stringify(updatedCart));
    } catch {
      setCartSyncError("Failed to remove item. Please try again.");
    } finally {
      setRemovingItem((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleCheckout = () => {
    const storedCustomer = localStorage.getItem("customer");
    if (!storedCustomer) {
      setCartSidebarOpen(false);
      setTimeout(() => setAuthModalOpen(true), 150);
      return;
    }
    localStorage.setItem("selectedCart", JSON.stringify(cart || []));
    navigate("/checkout");
  };

  const cartLineForThisProduct = useMemo(() => {
    if (!product || !Array.isArray(cart)) return null;
    const pid = String(product.productID ?? productID);
    return cart.find((it) => String(it.productId) === pid) || null;
  }, [cart, product, productID]);

  useEffect(() => {
    const q = Number(cartLineForThisProduct?.quantity);
    if (Number.isFinite(q) && q > 0) setMobileQty(q);
    else setMobileQty(1);
  }, [cartLineForThisProduct]);

  const handleStickyAddOrUpdate = async () => {
    if (!product || outOfStock) return;

    if (cartLineForThisProduct?.productId && cartId) {
      await handleQuantityChange(cartLineForThisProduct.productId, mobileQty);
      setCartSidebarOpen(true);
      return;
    }

    await handleAddToCartAndOpenSidebar(product);
  };

  // ✅ If route changed but slice still has old product, show skeleton until correct one arrives
  if (loading || !product || !productMatchesRoute) return <ProductDetailSkeleton />;

  return (
    <div className="min-h-screen bg-white pb-24" key={productID}>
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#bbf7d0]">
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[#f0fdf4] rounded-lg border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors"
              aria-label="Back"
            >
              <ChevronLeftIcon className="w-4 h-4 text-[#15803d]" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-sm md:text-base font-extrabold text-[#15803d] line-clamp-1">
                {product.productName}
              </h1>
              <p className="text-[10px] md:text-xs text-[#166534]">
                {product.brandName || "Brand"} • {product.categoryName || "Category"}
              </p>
            </div>

            <IconButton
              variant="text"
              className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4]"
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) navigator.share({ title: product.productName, url });
                else window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, "_blank");
              }}
              aria-label="Share"
            >
              <ShareIcon className="w-5 h-5 text-[#15803d]" />
            </IconButton>
          </div>
        </div>
      </div>

      {cartSyncError && (
        <div className="px-3 mt-3">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-3 flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 text-yellow-600" />
            <p className="text-xs">{cartSyncError}</p>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="px-3 pt-4">
        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {/* Image + info under image */}
          <div className="bg-white rounded-2xl border border-[#bbf7d0] overflow-hidden">
            <div className="p-3">
              <div className="relative  rounded-2xl border border-[#bbf7d0] overflow-hidden">
               
                <Image.PreviewGroup>
                  <Image
                    src={getValidImageUrl(product?.productImage)}
                    alt={product.productName}
                    className="w-full object-contain"
                    style={{ maxHeight: 420 }}
                  />
                </Image.PreviewGroup>
              </div>

              <div className="mt-3 bg-white rounded-2xl border border-[#bbf7d0] overflow-hidden">
                <div className="p-3">
                  <p className="text-base font-extrabold text-[#14532d] line-clamp-2">
                    {product.productName}
                  </p>

                  <div className="mt-2 flex items-end gap-2 flex-wrap">
                    <span className="text-2xl font-extrabold text-[#15803d]">
                      ₵{formatPrice(product.price)}.00
                    </span>
                    {Number(product.oldPrice) > Number(product.price) && (
                      <span className="text-xs text-[#166534] line-through opacity-70">
                        ₵{formatPrice(product.oldPrice)}.00
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Chip>
                      <TagIcon className="w-3.5 h-3.5 text-[#15803d]" />
                      {product.brandName || "Brand"}
                    </Chip>
                    <Chip>
                      <TagIcon className="w-3.5 h-3.5 text-[#15803d]" />
                      {product.categoryName || "Category"}
                    </Chip>
                  </div>

                  <div
                    className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-extrabold border ${
                      outOfStock
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-[#dcfce7] text-[#166534] border-[#bbf7d0]"
                    }`}
                  >
                    {outOfStock ? (
                      <>
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        Out of stock
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 text-[#22c55e]" />
                        In stock
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop buttons only */}
              <div className="hidden md:grid mt-3 grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddToCartAndOpenSidebar(product)}
                  disabled={isCartButtonLoading || outOfStock}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-extrabold shadow-sm border transition-colors ${
                    outOfStock
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-[#22c55e] text-white border-[#22c55e] hover:bg-[#16a34a]"
                  }`}
                >
                  {isCartButtonLoading ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  onClick={() => setCartSidebarOpen(true)}
                  className="w-full px-4 py-3 rounded-xl text-xs font-extrabold border border-[#bbf7d0] text-[#15803d] bg-[#f0fdf4] hover:bg-[#dcfce7] transition-colors"
                  disabled={!Array.isArray(cart) || cart.length === 0}
                >
                  View Cart {totalCartItems ? `(${totalCartItems})` : ""}
                </button>
              </div>
            </div>
          </div>

          {/* Description + Flix */}
          <div className="space-y-3">
            <ProductSpecsList product={product} />

            {isValidSamsungProduct && (
              <div ref={flixMountRef}>
                {flixLoading && (
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 text-center text-xs text-[#166534]">
                    Loading Samsung product details...
                  </div>
                )}
                {flixError && !flixLoading && (
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 text-center text-xs text-[#166534]">
                    Unable to load additional Samsung details right now.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* You may also like */}
      <div ref={relatedSectionRef} className="px-3 mt-8">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm md:text-base font-extrabold text-[#15803d]">
            You may also like
          </h3>
          <div className="flex-1 h-px bg-[#bbf7d0]" />
        </div>

        {related.length > 0 ? (
          <>
            <ProductCard
              currentProducts={related}
              navigate={(path) => {
                // Ensure path is correct: if ProductCard sends just productID,
                // you should pass a full route like `/product/${id}` from ProductCard.
                handleNavigate(path);
              }}
              loading={false}
              showDescription
            />

            {(hasMoreInCategory || related.length >= 12) && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => navigate(categoryPath)}
                  className="px-5 py-3 rounded-xl text-xs font-extrabold border border-[#bbf7d0] bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d]"
                >
                  View more in {product?.categoryName || "this category"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] p-6 text-center">
            <img src={gif} alt="No products" className="max-h-24 mx-auto opacity-80" />
            <p className="text-xs text-[#166534] mt-2">No related products found.</p>
          </div>
        )}
      </div>

      {/* Mobile sticky bar (ONLY add-to-cart on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-[#bbf7d0]">
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="flex items-center bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl overflow-hidden">
            <button
              className="px-3 py-3"
              onClick={() => setMobileQty((q) => Math.max(1, q - 1))}
              disabled={outOfStock || mobileQty <= 1}
              aria-label="Decrease quantity"
            >
              <MinusIcon className="w-4 h-4 text-[#15803d]" />
            </button>
            <div className="w-9 text-center text-xs font-extrabold text-[#14532d]">{mobileQty}</div>
            <button
              className="px-3 py-3"
              onClick={() => setMobileQty((q) => Math.min(99, q + 1))}
              disabled={outOfStock}
              aria-label="Increase quantity"
            >
              <PlusIcon className="w-4 h-4 text-[#15803d]" />
            </button>
          </div>

          <button
            onClick={handleStickyAddOrUpdate}
            disabled={isCartButtonLoading || outOfStock}
            className={`px-4 py-2 rounded-xl w-full text-md font-extrabold shadow-md transition-colors ${
              outOfStock
                ? "bg-gray-100 text-gray-400 border border-gray-200"
                : "bg-[#22c55e] text-white hover:bg-[#16a34a]"
            }`}
          >
            {outOfStock ? "Out of Stock" : isCartButtonLoading ? "..." : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Cart drawer */}
      <Drawer
        placement="right"
        open={cartSidebarOpen}
        onClose={() => setCartSidebarOpen(false)}
        className="p-0"
        size={400}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="w-6 h-6 text-[#22c55e]" />
              <h2 className="text-lg font-extrabold text-[#14532d]">Shopping Cart</h2>
            </div>
            <IconButton variant="text" onClick={() => setCartSidebarOpen(false)}>
              <XMarkIcon className="w-5 h-5" />
            </IconButton>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cartLoadingState ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]" />
              </div>
            ) : !Array.isArray(cart) || cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <ShoppingCartIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-sm font-semibold text-gray-600">Your cart is empty</p>
                <p className="text-xs text-gray-500 mt-1">Add items to see them here.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.map((item, idx) => {
                  const isUpdating = updatingQuantity[item.productId];
                  const isRemovingNow = removingItem[item.productId];
                  const itemImage = getValidImageUrl(item.imagePath || item.productImage || item.image);

                  return (
                    <div key={`${item.productId}-${idx}`} className="bg-white border border-[#bbf7d0] rounded-2xl p-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={itemImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/150";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#14532d] line-clamp-2">{item.productName}</p>
                          <p className="text-xs text-[#15803d] font-extrabold mt-1">
                            ₵{formatPrice(item.price)}.00
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl">
                              <button
                                className="px-2 py-2"
                                onClick={() => handleQuantityChange(item.productId, (Number(item.quantity) || 1) - 1)}
                                disabled={isUpdating || isRemovingNow || (Number(item.quantity) || 1) <= 1}
                              >
                                <MinusIcon className="w-4 h-4 text-[#15803d]" />
                              </button>
                              <span className="w-8 text-center text-xs font-extrabold text-[#14532d]">
                                {Number(item.quantity) || 1}
                              </span>
                              <button
                                className="px-2 py-2"
                                onClick={() => handleQuantityChange(item.productId, (Number(item.quantity) || 1) + 1)}
                                disabled={isUpdating || isRemovingNow}
                              >
                                <PlusIcon className="w-4 h-4 text-[#15803d]" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              disabled={isUpdating || isRemovingNow}
                              className="p-2 rounded-xl bg-red-50 border border-red-200"
                            >
                              {isRemovingNow ? (
                                <div className="w-4 h-4 border border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <TrashIcon className="w-4 h-4 text-red-600" />
                              )}
                            </button>
                          </div>

                          {isUpdating && <p className="text-[10px] text-[#166534] mt-1">Updating...</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {Array.isArray(cart) && cart.length > 0 && (
            <div className="border-t p-4 bg-white">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#14532d]">Total</span>
                <span className="text-lg font-extrabold text-[#15803d]">
                  ₵{formatPrice(cartTotal)}.00
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <Button
                  fullWidth
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl"
                  onClick={handleCheckout}
                  disabled={cartLoadingState}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  className="border-[#bbf7d0] text-[#15803d] rounded-xl"
                  onClick={() => navigate(`/cart/${cartId}`)}
                  disabled={!cartId}
                >
                  View Cart Page
                </Button>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          localStorage.setItem("selectedCart", JSON.stringify(cart || []));
          navigate("/checkout");
        }}
      />
    </div>
  );
};

export default ProductDescription;