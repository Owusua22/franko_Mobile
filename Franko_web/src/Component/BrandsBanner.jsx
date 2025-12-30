import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/solid";

// Importing image assets directly
import Samsung from "../assets/samsung.png";
import infinix from "../assets/infinix.png";
import tecno from "../assets/tec.png";
import Hmd from "../assets/hmd.png";
import itelImg from "../assets/itel.png";
import Huawei from "../assets/huawel.png";

// Brand data with unique UUIDs
const brands = [
  { id: "760af684-7a19-46ab-acc5-7445ef32073a", name: "Samsung", src: Samsung },
  { id: "c163ee86-1d24-4c97-943b-1f82a09c6066", name: "Infinix", src: infinix },
  { id: "86cca959-70a4-448e-86f1-3601309f49a6", name: "Tecno", src: tecno },
  { id: "fb694e59-77be-455f-9573-acf917ffb39d", name: "HMD", src: Hmd },
  { id: "4c1dba1d-61b2-4ec3-9c03-38036dd02c89", name: "Itel", src: itelImg },
  { id: "d643698d-f794-4d33-9237-4a913aa463a2", name: "Huawei", src: Huawei },
];

// Section Header Component
const SectionHeader = ({ title, emoji }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
   
      <div className="relative">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
          {title}
        </h2>
        <div className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#6ee7b7]" />
        <div className="absolute -bottom-1.5 left-0 h-[8px] w-3/4 bg-[#10b981]/20 blur-sm rounded-full" />
      </div>
    </div>
  </div>
);

// Brand Card Component
const BrandCard = ({ brand, onClick }) => {
  return (
    <button
      onClick={() => onClick(brand.id)}
      className="
        flex-shrink-0
        w-[100px] sm:w-[120px] md:w-[140px]
        group
        cursor-pointer
        focus:outline-none
      "
    >
      <div
        className="
          relative
          bg-white
          rounded-2xl
          p-4 sm:p-5 md:p-6
          border border-gray-100
          shadow-sm
          hover:shadow-xl
          hover:border-[#10b981]/30
          transition-all duration-300
          overflow-hidden
        "
      >
        {/* Background Gradient on Hover */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5]
            opacity-0
            group-hover:opacity-100
            transition-opacity duration-300
          "
        />

        {/* Decorative Corner */}
        <div
          className="
            absolute -top-4 -right-4
            w-12 h-12
            bg-gradient-to-br from-[#10b981]/10 to-transparent
            rounded-full
            opacity-0
            group-hover:opacity-100
            transition-opacity duration-300
          "
        />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center justify-center h-10 sm:h-12 md:h-14">
          <img
            src={brand.src}
            alt={brand.name}
            className="
              max-h-full
              max-w-full
              object-contain
              transition-transform duration-300
              group-hover:scale-110
            "
          />
        </div>


        {/* Bottom Accent Line */}
        <div
          className="
            absolute bottom-0 left-1/2 -translate-x-1/2
            h-[3px] w-0
            bg-gradient-to-r from-[#10b981] to-[#34d399]
            rounded-full
            group-hover:w-3/4
            transition-all duration-300
          "
        />
      </div>
    </button>
  );
};

const BrandsBanner = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleBrandClick = useCallback(
    (brandId) => {
      navigate(`/brand/${brandId}`);
    },
    [navigate]
  );

  const updateArrows = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  }, []);

  const scroll = useCallback((direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 150;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return (
    <section className="w-full bg-white py-4 px-4">
      {/* Section Header */}
      <SectionHeader title="Shop by Brand" emoji="🏷️" />

      {/* Brands Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="
              absolute left-0 top-1/2 -translate-y-1/2 z-20
              w-8 h-8
              bg-white/95 backdrop-blur-sm
              rounded-full
              shadow-lg
              border border-[#10b981]/20
              flex items-center justify-center
              hover:bg-[#f0fdf4]
              hover:border-[#10b981]
              active:scale-95
              transition-all duration-200
            "
          >
            <ChevronLeftIcon className="w-4 h-4 text-[#10b981]" />
          </button>
        )}

        {/* Brands Container */}
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="
            flex gap-3 sm:gap-4
            overflow-x-auto
            scroll-smooth
            pb-2
            no-scrollbar
          "
          style={{ scrollSnapType: "x mandatory" }}
        >
          {brands.map((brand) => (
            <div key={brand.id} style={{ scrollSnapAlign: "start" }}>
              <BrandCard brand={brand} onClick={handleBrandClick} />
            </div>
          ))}

       
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="
              absolute right-0 top-1/2 -translate-y-1/2 z-20
              w-8 h-8
              bg-white/95 backdrop-blur-sm
              rounded-full
              shadow-lg
              border border-[#10b981]/20
              flex items-center justify-center
              hover:bg-[#f0fdf4]
              hover:border-[#10b981]
              active:scale-95
              transition-all duration-200
            "
          >
            <ChevronRightIcon className="w-4 h-4 text-[#10b981]" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mt-5 flex justify-center">
        <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-[#10b981]/20 to-transparent" />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default BrandsBanner;