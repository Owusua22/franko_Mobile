import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../Redux/Slice/categorySlice";
import { fetchBrands } from "../Redux/Slice/brandSlice";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Footer from "../Component/Footer";

const CategoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector(
    (state) => state.categories
  );
  const { brands, loading: brandsLoading } = useSelector((state) => state.brands);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [hasFetchedCategories, setHasFetchedCategories] = useState(false);

  // Memoize filtered categories
  const filteredCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.filter(
      (category) =>
        category.categoryName?.toLowerCase() !== "products out of stock"
    );
  }, [categories]);

  // Memoize selected category name
  const selectedCategoryName = useMemo(() => {
    const category = filteredCategories.find(
      (cat) => cat.categoryId === selectedCategoryId
    );
    return category ? category.categoryName : "";
  }, [filteredCategories, selectedCategoryId]);

  // Memoize filtered brands for the selected category
  const filteredBrands = useMemo(() => {
    if (!brands || !Array.isArray(brands)) return [];
    return brands.filter((brand) => brand.categoryId === selectedCategoryId);
  }, [brands, selectedCategoryId]);

  // Fetch categories only once on mount
  useEffect(() => {
    if (!hasFetchedCategories && categories.length === 0) {
      dispatch(fetchCategories());
      setHasFetchedCategories(true);
    }
  }, [dispatch, hasFetchedCategories, categories.length]);

  // Auto-select first category when categories load
  useEffect(() => {
    if (filteredCategories.length > 0 && !selectedCategoryId) {
      const firstCategory = filteredCategories[0];
      setSelectedCategoryId(firstCategory.categoryId);
    }
  }, [filteredCategories, selectedCategoryId]);

  // Fetch brands when component mounts (fetch all brands once)
  useEffect(() => {
    if (brands.length === 0) {
      dispatch(fetchBrands());
    }
  }, [dispatch, brands.length]);

  // Memoize category selection handler
  const handleCategoryPress = useCallback((categoryId) => {
    setSelectedCategoryId(categoryId);
  }, []);

  // Memoize brand press handler
  const handleBrandPress = useCallback(
    (brandId) => {
      navigate(`/brand/${brandId}`);
    },
    [navigate]
  );

  // Loading State
  if (categoriesLoading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0fdf4]">
        <div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm font-medium text-[#16a34a]">
          Loading categories...
        </p>
      </div>
    );
  }

  // Error State
  if (categoriesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0fdf4] px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         
        </div>
        <p className="text-sm font-medium text-red-600 text-center mb-4">
          {categoriesError}
        </p>
        <button
          onClick={() => dispatch(fetchCategories())}
          className="px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium hover:bg-[#16a34a] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Categories Sidebar */}
      <div
        className="
          w-[35%] sm:w-[30%] md:w-[25%]
          bg-[#dcfce7]
          shadow-[2px_0_8px_rgba(22,163,74,0.1)]
          flex flex-col
          max-h-screen
          sticky top-0
        "
      >
        {/* Category Header */}
        <div className="p-3 pb-4 border-b border-[#bbf7d0]">
          <h2 className="text-base sm:text-lg font-bold text-[#15803d] text-center">
            Categories
          </h2>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto pb-16">
          {filteredCategories.map((category) => {
            const isActive = selectedCategoryId === category.categoryId;

            return (
              <button
                key={category.categoryId}
                onClick={() => handleCategoryPress(category.categoryId)}
                className={`
                  w-full
                  mx-1 my-1
                  rounded-xl
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#22c55e] shadow-md"
                      : "hover:bg-[#bbf7d0]/50 active:bg-[#bbf7d0]"
                  }
                `}
              >
                <div className="flex items-center p-3 sm:p-4">
                  {/* Indicator */}
                  <div
                    className={`
                      w-1 h-5
                      rounded-full
                      mr-3
                      transition-colors duration-200
                      ${isActive ? "bg-white" : "bg-[#bbf7d0]"}
                    `}
                  />
                  {/* Category Name */}
                  <span
                    className={`
                      text-[11px] sm:text-xs md:text-sm
                      font-medium
                      flex-1
                      text-left
                      transition-colors duration-200
                      ${isActive ? "text-white font-semibold" : "text-[#166534]"}
                    `}
                  >
                    {category.categoryName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands Panel */}
      <div className="flex-1 p-4 sm:p-5 bg-white overflow-y-auto pb-20">
        {selectedCategoryId ? (
          <>
            {/* Brand Header */}
            <div className="mb-5 pb-4 border-b-2 border-[#f0fdf4]">
              <h3 className="text-lg sm:text-xl font-bold text-[#15803d] mb-1">
                {selectedCategoryName}
              </h3>
              <p className="text-[10px] sm:text-xs font-medium text-gray-500">
                Explore brands in this category
              </p>
            </div>

            {/* Loading Brands */}
            {brandsLoading && filteredBrands.length === 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-[#f0fdf4] rounded-2xl p-4 border border-[#bbf7d0] animate-pulse"
                  >
                    <div className="h-4 bg-[#bbf7d0] rounded w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            ) : filteredBrands.length === 0 ? (
              /* No Brands */
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-14 h-14 bg-[#f0fdf4] rounded-full flex items-center justify-center mb-4 border-2 border-[#bbf7d0]">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-base font-semibold text-[#16a34a] mb-2">
                  No brands available
                </p>
                <p className="text-xs text-[#22c55e] text-center">
                  Try selecting a different category
                </p>
              </div>
            ) : (
              /* Brands Grid */
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-4">
                {filteredBrands.map((brand) => (
                  <button
                    key={brand.brandId}
                    onClick={() => handleBrandPress(brand.brandId)}
                    className="
                      relative
                      bg-[#f0fdf4]
                      rounded-2xl
                      p-3 sm:p-4
                      border border-[#bbf7d0]
                      shadow-sm
                      hover:shadow-md
                      hover:border-[#22c55e]
                      active:scale-[0.98]
                      transition-all duration-200
                      group
                    "
                  >
                    {/* Brand Name */}
                    <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#15803d] text-center leading-5">
                      {brand.brandName}
                    </p>

                    {/* Arrow Icon */}
                    <div
                      className="
                        absolute top-2 right-2
                        w-5 h-5 sm:w-6 sm:h-6
                        bg-[#22c55e]
                        rounded-full
                        flex items-center justify-center
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity duration-200
                      "
                    >
                      <ChevronRightIcon className="w-3 h-3 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full py-10">
            <div
              className="
                w-16 h-16 sm:w-20 sm:h-20
                bg-[#f0fdf4]
                rounded-full
                flex items-center justify-center
                mb-5
                border-2 border-[#bbf7d0]
              "
            >
              <span className="text-3xl sm:text-4xl">📂</span>
            </div>
            <p className="text-base sm:text-lg font-semibold text-[#16a34a] text-center mb-2">
              Select a category to view brands
            </p>
            <p className="text-xs sm:text-sm text-[#22c55e] text-center">
              Choose from the categories on the left
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;