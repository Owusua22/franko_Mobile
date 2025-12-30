// Web CategoryComponent - Enhanced UI with green color palette
import React from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowForwardIos } from "react-icons/md";

// Existing website images
import phone from "../assets/phone.jpg";
import laptop from "../assets/lap.jpg";
import fridge from "../assets/fridge.jpg";
import tv from "../assets/tv.jpg";
import speaker from "../assets/speaker.jpg";
import blender from "../assets/blender.jpg";
import ac from "../assets/ac.jpg";
import combo from "../assets/machine.jpg";
import accessories from "../assets/acce.png";

const categories = [
  { name: "Phones", img: phone, route: "/phones" },
  { name: "Laptops", img: laptop, route: "/computers" },
  { name: "Refrigerator", img: fridge, route: "/refrigerator" },
  { name: "Television", img: tv, route: "/television" },
  { name: "Speakers", img: speaker, route: "/speakers" },
  { name: "Appliances", img: blender, route: "/appliances" },
  { name: "Air-conditioners", img: ac, route: "/air-condition" },
  { name: "Washing Machine", img: combo, route: "/washing-machine" },
  
];

const CategoryComponent = () => {
  const navigate = useNavigate();

  const handleViewAllPress = () => {
    navigate("/category");
  };

  const handleCategoryPress = (route) => {
    if (!route) return;
    navigate(route);
  };

  return (
    <section className="w-full bg-gradient-to-b from-green-50/80 via-emerald-50/40 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-green-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-200/25 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-teal-100/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 relative z-10">
        {/* Header */}
        <header className="mb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="relative">
              {/* Title with decorative elements */}
              <div className="flex items-center gap-3">
                {/* Green accent bar */}
               
                
                <div>
                  <h2 className="text-md sm:text-2xl md:text-[28px] font-extrabold text-gray-900 tracking-tight">
                    Categories
                  </h2>
                  
                  {/* Animated underline */}
                  <div className="relative mt-1">
                    <div className="h-[5px] w-16  rounded-full bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400" />
                    <div className="absolute top-0 left-0 h-[3px] w-8 sm:w-10 rounded-full bg-green-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* View All Button */}
            <button
              type="button"
              onClick={handleViewAllPress}
              className="
                group
                inline-flex items-center gap-1.5
                bg-gradient-to-r from-green-500 to-emerald-500
                hover:from-green-600 hover:to-emerald-600
                px-4 py-2
                rounded-full
                text-[12px] sm:text-[13px]
                font-semibold text-white
                shadow-lg shadow-green-500/25
                hover:shadow-xl hover:shadow-green-500/30
                active:scale-95
                transition-all duration-300
              "
            >
              <span>View All</span>
              <MdArrowForwardIos 
                size={12} 
                className="group-hover:translate-x-0.5 transition-transform duration-200" 
              />
            </button>
          </div>
        </header>

        {/* Categories Grid */}
        <div
          className="
            grid
            grid-cols-4
            sm:grid-cols-4
            md:grid-cols-5
            lg:grid-cols-9
            gap-3 sm:gap-4 md:gap-5
          "
        >
          {categories.map((category, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleCategoryPress(category.route)}
              className="
                group
                flex flex-col items-center
                p-2 sm:p-3
                rounded-2xl
                bg-white/60
                hover:bg-white
                backdrop-blur-sm
                border border-green-100/50
                hover:border-green-200
                shadow-sm
                hover:shadow-lg hover:shadow-green-100/50
                focus:outline-none
                active:outline-none
                touch-manipulation
                transition-all duration-300
              "
            >
              {/* Image Container */}
              <div
                className="
                  relative
                  w-12 h-12
                  sm:w-14 sm:h-14
                  md:w-16 md:h-16
                  rounded-2xl
                  mb-2 sm:mb-3
                  overflow-hidden
                  bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100
                  border border-green-200/50
                  shadow-inner
                  flex items-center justify-center
                  transform
                  transition-all duration-300
                  group-hover:-translate-y-1
                  group-hover:scale-105
                  group-hover:shadow-lg
                  group-hover:shadow-green-200/40
                  group-active:scale-95
                "
              >
                {/* Inner glow effect */}
                <div 
                  className="
                    absolute inset-0 
                    bg-gradient-to-tr from-green-200/30 via-transparent to-emerald-200/30 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300
                  " 
                />
                
                {/* Shine effect */}
                <div 
                  className="
                    absolute inset-0 
                    bg-gradient-to-br from-white/40 via-transparent to-transparent 
                    opacity-60
                  " 
                />

                {/* Category Image */}
                <img
                  src={category.img}
                  alt={category.name}
                  loading="lazy"
                  className="
                    relative z-[1]
                    w-[75%] h-[75%]
                    object-contain
                    drop-shadow-sm
                    transition-transform duration-300
                    group-hover:scale-110
                  "
                />

                {/* Hover ring effect */}
                <div
                  className="
                    absolute inset-0
                    rounded-2xl
                    ring-2 ring-green-400/0
                    group-hover:ring-green-400/50
                    transition-all duration-300
                  "
                />
              </div>

              {/* Category Name */}
              <span
                className="
                  text-[10px] sm:text-[11px] md:text-xs
                  font-semibold
                  text-gray-700
                  group-hover:text-green-700
                  text-center
                  leading-tight
                  max-w-full
                  truncate
                  transition-colors duration-200
                "
              >
                {category.name}
              </span>

              {/* Animated underline */}
              <div className="relative mt-1.5 h-0.5 w-full flex justify-center">
                <span
                  className="
                    h-full
                    w-0
                    rounded-full
                    bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400
                    group-hover:w-8
                    transition-all duration-300 ease-out
                  "
                />
              </div>
            </button>
          ))}
        </div>

        {/* Bottom decorative line */}
        <div className="mt-2 flex justify-center">
          <div className="h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-60" />
        </div>
      </div>
    </section>
  );
};

export default CategoryComponent;