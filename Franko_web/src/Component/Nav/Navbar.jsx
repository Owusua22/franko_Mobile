import { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Typography,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
} from "@material-tailwind/react";
import {
  ShoppingBagIcon,
  XMarkIcon,
  RadioIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/frankoIcon.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../Redux/Slice/productSlice";
import { getCartById } from "../../Redux/Slice/cartSlice";
import { debounce } from "lodash";

const Nav = () => {
  const [isRadioOpen, setIsRadioOpen] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const totalItems = useSelector((state) => state.cart.totalItems);
  const { products = [], loading } = useSelector((state) => state.products);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleRadio = () => setIsRadioOpen((prev) => !prev);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch products for search
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Fetch cart by ID if user exists in localStorage
  useEffect(() => {
    try {
      const storedCustomer = localStorage.getItem("customer");
      const parsedCustomer =
        typeof storedCustomer === "string"
          ? JSON.parse(storedCustomer)
          : storedCustomer;

      if (parsedCustomer && parsedCustomer.customerAccountNumber) {
        const cartId = localStorage.getItem("cartId");
        if (cartId) dispatch(getCartById(cartId));
      }
    } catch (error) {}
  }, [dispatch]);

  // Debounced search query update
  useEffect(() => {
    debounceRef.current = debounce((value) => setSearchQuery(value), 300);
    return () => debounceRef.current?.cancel();
  }, []);

  // Show/hide search results based on query
  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Close search results on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        const isScrollbarClick =
          event.target === document.documentElement ||
          event.target === document.body ||
          (event.target.tagName &&
            event.target.tagName.toLowerCase() === "html");

        if (!isScrollbarClick) setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debounceRef.current(value);
  };

  const handleProductClick = (productID) => {
    setShowSearchResults(false);
    setInputValue("");
    setSearchQuery("");
    navigate(`/product/${productID}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) setShowSearchResults(true);
  };

  const backendBaseURL = "https://smfteapi.salesmate.app";

  const formatPrice = (price) =>
    `₵${price?.toLocaleString?.() || "N/A"}`;

  const highlightText = (text = "") => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.replace(
      regex,
      '<span style="background-color: yellow; font-weight: bold;">$1</span>'
    );
  };

  const getImageURL = (productImage) => {
    if (!productImage) return null;
    const imagePath = productImage.split("\\").pop();
    return `${backendBaseURL}/Media/Products_Images/${imagePath}`;
  };

  const filteredProducts = searchQuery
    ? products.filter((product) =>
        product.productName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="sticky top-0 z-50 bg-white">
      <Navbar className="mx-auto max-w-full px-2 py-2 rounded-none shadow-md bg-white">
        {/* Single line: logo + search + icons (mobile-app style) */}
        <div className="flex items-center gap-2 w-full">
          {/* Logo */}
          <Typography as="a" href="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Franko Trading"
              className="h-8 w-auto object-contain"
            />
            
          </Typography>

          {/* Search (inline with logo) */}
          <div className="flex-1 relative" ref={searchRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center rounded-full px-3 py-1.5 shadow-sm border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 transition"
            >
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={inputValue}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="ml-2 bg-transparent text-gray-800 text-sm w-full focus:outline-none placeholder-gray-400"
              />
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {loading ? (
                  <div className="p-3">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 animate-pulse"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : inputValue.trim() === "" ? (
                  <div className="p-3 text-center text-gray-500 text-xs">
                    Start typing to search
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-xs">
                    No products found
                  </div>
                ) : (
                  <>
                    <div className="p-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
                      {filteredProducts.length} product
                      {filteredProducts.length !== 1 ? "s" : ""}
                    </div>
                    {filteredProducts.map((product) => {
                      const imageURL = getImageURL(product.productImage);
                      return (
                        <div
                          key={product.productID}
                          onClick={() => handleProductClick(product.productID)}
                          className="flex items-center gap-2 p-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {imageURL ? (
                            <img
                              src={imageURL}
                              alt={product.productName}
                              className="w-8 h-8 object-cover rounded-md"
                              onError={(e) =>
                                (e.target.style.display = "none")
                              }
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4
                              className="text-xs font-medium text-green-600 truncate"
                              dangerouslySetInnerHTML={{
                                __html: highlightText(
                                  product.productName || ""
                                ),
                              }}
                            />
                            <p className="text-xs text-red-600 font-semibold">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Radio button */}
          <button
            type="button"
            onClick={toggleRadio}
            className="p-1.5 rounded-full hover:bg-red-50 transition"
            title="Radio"
          >
            <RadioIcon className="h-5 w-5 text-red-500" />
          </button>

          {/* Cart icon */}
          <button
            type="button"
            onClick={() =>
              navigate(`/cart/${localStorage.getItem("cartId")}`)
            }
            className="relative p-1.5 rounded-full hover:bg-green-50 transition"
            title="Shopping Cart"
          >
            <ShoppingBagIcon className="h-5 w-5 text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </Navbar>

      {/* Radio dialog */}
      <Dialog open={isRadioOpen} handler={toggleRadio} size="sm">
        <DialogHeader className="flex justify-between items-center text-base py-3">
          Franko Radio Live 🎙️
          <IconButton variant="text" onClick={toggleRadio} className="p-1">
            <XMarkIcon className="h-4 w-4" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="py-3">
          <div className="flex flex-col items-center gap-3">
            <audio controls autoPlay className="w-full rounded-md shadow">
              <source
                src="https://s48.myradiostream.com/:13420/listen.mp3"
                type="audio/mpeg"
              />
            </audio>
            <p className="text-xs text-center text-gray-600">
              Streaming live now!!!!!
            </p>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
};

export default Nav;