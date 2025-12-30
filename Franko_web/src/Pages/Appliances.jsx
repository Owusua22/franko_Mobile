import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByCategory } from "../Redux/Slice/productSlice";
import { useNavigate } from "react-router-dom";
import {
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  ChevronDownIcon,
  Bars3BottomLeftIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import ProductCard from "../Component/ProductCard";
import gif from "../assets/no.gif";

const categoryId = "9170b363-bb16-4980-83a1-7e3a3bbba964";
const SCROLL_KEY = "appliancesScrollY";

const Appliances = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productsByCategory = {}, loading } = useSelector(
    (state) => state.products
  );

  const [inputPriceRange, setInputPriceRange] = useState({ min: 0, max: 200000 });
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 200000]);
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [selectedBrandName, setSelectedBrandName] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Fetch products & restore scroll (Phones-style)
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    const savedY =
      saved !== null && !Number.isNaN(Number(saved)) ? Number(saved) : null;

    setInitialLoadComplete(false);
    dispatch(fetchProductsByCategory(categoryId)).then(() => {
      setInitialLoadComplete(true);

      if (savedY !== null) {
        setTimeout(() => {
          window.scrollTo(0, savedY);
          sessionStorage.removeItem(SCROLL_KEY);
        }, 0);
      } else {
        window.scrollTo(0, 0);
      }
    });
  }, [dispatch]);

  const products = useMemo(
    () =>
      Array.isArray(productsByCategory[categoryId])
        ? productsByCategory[categoryId]
        : [],
    [productsByCategory]
  );

  const availableBrands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.brandName) set.add(p.brandName);
    });
    return Array.from(set).sort();
  }, [products]);

  const applyPriceFilter = () => {
    const min = Math.max(0, inputPriceRange.min || 0);
    const max = Math.min(200000, inputPriceRange.max || 200000);
    setAppliedPriceRange([min, max]);
  };

  const resetFilters = () => {
    setInputPriceRange({ min: 0, max: 200000 });
    setAppliedPriceRange([0, 200000]);
    setShowDiscountedOnly(false);
    setSelectedBrandName(null);
    setSortBy("newest");
  };

  const sortProducts = (list) => {
    const sorted = [...list];
    switch (sortBy) {
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.dateCreated) - new Date(b.dateCreated)
        );
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "name-az":
        return sorted.sort((a, b) =>
          a.productName.localeCompare(b.productName)
        );
      case "name-za":
        return sorted.sort((a, b) =>
          b.productName.localeCompare(a.productName)
        );
      default:
        return sorted.sort(
          (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
        );
    }
  };

  const filteredProducts = sortProducts(
    products.filter((p) => {
      const withinRange =
        p.price >= appliedPriceRange[0] && p.price <= appliedPriceRange[1];
      const hasDiscount = showDiscountedOnly ? p.oldPrice > p.price : true;
      const matchesBrand = selectedBrandName ? p.brandName === selectedBrandName : true;
      return withinRange && hasDiscount && matchesBrand;
    })
  );

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-az", label: "Name: A to Z" },
    { value: "name-za", label: "Name: Z to A" },
  ];

  const showLoading = loading || !initialLoadComplete;
  const showNoProducts =
    initialLoadComplete && !loading && filteredProducts.length === 0;
  const showProducts =
    initialLoadComplete && !loading && filteredProducts.length > 0;

  const headerTitle = selectedBrandName
    ? `${selectedBrandName} Appliances`
    : "Appliances";

  const handleNavigate = (path) => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    navigate(path);
  };

  const renderFilterContent = () => (
    <div className="w-full lg:w-72 space-y-4">
      {/* Filter Header - Desktop Only */}
      <div className="hidden lg:flex items-center gap-3 pb-3 border-b border-[#bbf7d0]">
        <div className="p-2 bg-[#22c55e] rounded-lg">
          <AdjustmentsHorizontalIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-bold text-[#15803d]">Filters</h3>
      </div>

      {/* Price Range */}
      <div className="bg-[#f0fdf4] p-4 rounded-xl border border-[#bbf7d0]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
          <h4 className="text-sm font-semibold text-[#15803d]">Price Range</h4>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-[#166534] mb-1">
                Min
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#166534] text-xs">
                  ₵
                </span>
                <input
                  type="number"
                  min="0"
                  max="200000"
                  value={inputPriceRange.min}
                  onChange={(e) =>
                    setInputPriceRange((prev) => ({
                      ...prev,
                      min: +e.target.value,
                    }))
                  }
                  className="w-full pl-5 pr-2 py-2 border border-[#bbf7d0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-[#166534] mb-1">
                Max
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#166534] text-xs">
                  ₵
                </span>
                <input
                  type="number"
                  min="0"
                  max="200000"
                  value={inputPriceRange.max}
                  onChange={(e) =>
                    setInputPriceRange((prev) => ({
                      ...prev,
                      max: +e.target.value,
                    }))
                  }
                  className="w-full pl-5 pr-2 py-2 border border-[#bbf7d0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all"
                  placeholder="200000"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              applyPriceFilter();
              setIsDrawerOpen(false);
            }}
            className="w-full bg-[#22c55e] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#16a34a] transition-colors"
          >
            Apply Price Filter
          </button>

          <div className="bg-[#dcfce7] px-3 py-2 rounded-lg border border-[#bbf7d0]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#166534] font-medium">
                Applied:
              </span>
              <span className="text-[10px] text-[#15803d] font-bold">
                ₵{appliedPriceRange[0].toLocaleString()} - ₵
                {appliedPriceRange[1].toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Discount Toggle */}
      <div className="bg-[#f0fdf4] p-4 rounded-xl border border-[#bbf7d0]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] rounded-lg">
              <TagIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <label className="text-xs font-semibold text-[#15803d] cursor-pointer">
              Discounted Only
            </label>
          </div>

          <div
            onClick={() => setShowDiscountedOnly((prev) => !prev)}
            className={`w-10 h-5 rounded-full cursor-pointer transition-all duration-300 ${
              showDiscountedOnly ? "bg-[#22c55e]" : "bg-[#bbf7d0]"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 mt-0.5 ${
                showDiscountedOnly ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Brand */}
      {availableBrands.length > 0 && (
        <div className="bg-[#f0fdf4] p-4 rounded-xl border border-[#bbf7d0]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
            <h4 className="text-sm font-semibold text-[#15803d]">
              Filter by Brand
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableBrands.map((name) => (
              <button
                key={name}
                onClick={() => {
                  setSelectedBrandName((prev) => (prev === name ? null : name));
                  setIsDrawerOpen(false);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  selectedBrandName === name
                    ? "bg-[#22c55e] text-white shadow-md"
                    : "bg-white text-[#166534] border border-[#bbf7d0] hover:border-[#22c55e] hover:bg-[#dcfce7]"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => {
          resetFilters();
          setIsDrawerOpen(false);
        }}
        className="w-full bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] py-2 rounded-lg text-xs font-semibold transition-colors border border-[#bbf7d0]"
      >
        Reset All Filters
      </button>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="bg-[#f0fdf4] p-4 rounded-xl border animate-pulse">
        <div className="h-5 bg-[#bbf7d0] rounded w-1/3 mb-2" />
        <div className="h-3 bg-[#dcfce7] rounded w-1/4" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-[#bbf7d0] overflow-hidden animate-pulse"
          >
            <div className="h-28 sm:h-36 bg-[#dcfce7]" />
            <div className="p-2 space-y-2">
              <div className="h-3 bg-[#bbf7d0] rounded w-3/4" />
              <div className="h-3 bg-[#dcfce7] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="px-3">
        {/* STICKY HEADER (Phones-style) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#bbf7d0]">
          <div className="py-3 space-y-2">
            {/* Title row */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="md:hidden p-2 bg-[#f0fdf4] rounded-lg border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 text-[#15803d]" />
              </button>

              <div className="flex-1">
                {showLoading ? (
                  <div className="animate-pulse">
                    <div className="h-5 bg-[#bbf7d0] rounded w-1/3 mb-1" />
                    <div className="h-3 bg-[#dcfce7] rounded w-1/4" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-base md:text-lg font-bold text-[#15803d]">
                      {headerTitle}
                    </h2>
                    <p className="text-[10px] md:text-xs text-[#166534]">
                      {filteredProducts.length} products
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Controls row */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 p-2.5 bg-[#22c55e] rounded-xl text-white font-medium text-xs shadow-md hover:bg-[#16a34a] transition-colors md:hidden"
                disabled={showLoading}
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filter</span>
              </button>

              <div className="relative flex-1 md:flex-none md:w-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortDropdown((prev) => !prev);
                  }}
                  className="w-full flex items-center justify-center md:justify-between gap-1.5 px-3 py-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-[#15803d] font-medium text-xs hover:bg-[#dcfce7] transition-colors"
                  disabled={showLoading}
                >
                  <Bars3BottomLeftIcon className="w-4 h-4 text-[#166534]" />
                  <span className="truncate">
                    {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  </span>
                  <ChevronDownIcon
                    className={`w-3 h-3 text-[#166534] transition-transform ${
                      showSortDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSortDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-[#bbf7d0] rounded-xl shadow-lg z-50 overflow-hidden">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${
                          sortBy === option.value
                            ? "bg-[#dcfce7] text-[#15803d] font-semibold"
                            : "text-[#166534] hover:bg-[#f0fdf4]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />

            <div className="relative w-full max-w-xs h-full bg-white shadow-2xl overflow-auto">
              <div className="sticky top-0 bg-white border-b border-[#bbf7d0] px-4 py-3 z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#22c55e] rounded-lg">
                      <AdjustmentsHorizontalIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-bold text-[#15803d]">
                      Filters
                    </h2>
                  </div>

                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 hover:bg-[#f0fdf4] rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-[#166534]" />
                  </button>
                </div>
              </div>

              <div className="p-4">{renderFilterContent()}</div>
            </div>
          </div>
        )}

        {/* Layout */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <aside className="md:w-72">
            <div className="hidden md:block sticky top-28">
              {renderFilterContent()}
            </div>
          </aside>

          <section className="flex-1">
            {showLoading && <LoadingSkeleton />}

            {showProducts && (
              <ProductCard
                /* no pagination */
                currentProducts={filteredProducts}
                navigate={handleNavigate}
                loading={false}
              />
            )}

            {showNoProducts && (
              <div className="bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] p-6 mt-4">
                <div className="flex flex-col items-center text-center space-y-4">
                  <img
                    src={gif}
                    alt="No products"
                    className="max-h-20 md:max-h-40 opacity-80"
                  />

                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[#15803d]">
                      No Appliances Found
                    </h3>
                    <p className="text-xs text-[#166534] max-w-sm">
                      We couldn't find any appliances matching your filters. Try
                      adjusting your criteria.
                    </p>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-[#22c55e] text-white text-xs font-semibold rounded-lg shadow-md hover:bg-[#16a34a] transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Click outside sort dropdown */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
};

export default Appliances;