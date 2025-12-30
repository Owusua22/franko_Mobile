// src/pages/FAQ.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  Building2,
  Smartphone,
  ShoppingBag,
  Truck,
  Wrench,
  MapPin,
  Gift,
  MessageCircle,
  Headphones,
  ArrowRight,
  X,
  HelpCircle,
  Phone,
  Mail,
  CheckCircle,
} from "lucide-react";

// Brand Colors
const colors = {
  primary: "#22c55e",      // Light green-500
  primaryLight: "#dcfce7", // Light green-100
  primaryDark: "#16a34a",  // Light green-600
  primaryMuted: "#bbf7d0", // Light green-200
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
};

// FAQ Data
const faqData = [
  {
    category: "About Franko Trading",
    icon: Building2,
    items: [
      {
        question: "What is Franko Trading in Ghana known for?",
        answer: "Franko Trading is a trusted electronics retailer in Ghana, selling mobile phones, laptops, TVs, home appliances, and accessories. We are known for genuine products, affordable prices, and nationwide delivery.",
       
      },
      {
        question: "Is Franko Trading a legit electronics shop?",
        answer: "Yes. Franko Trading is a well-established and trusted brand in Ghana. All products are authentic and come with manufacturer or store warranties.",

      },
    ],
  },
  {
    category: "Products",
    icon: Smartphone,
    items: [
      {
        question: "What brands of mobile phones does Franko Trading sell?",
        answer: "We stock leading brands including Samsung, Tecno, Infinix, Nokia, Itel, Huawei, TCL, iPhone, HMD, Philips, Realme, and Oale.",

      },
      {
        question: "Does Franko Trading sell iOS and Android devices?",
        answer: "Yes. We sell both iOS devices (iPhones) and Android devices from top brands, available at various Franko Trading stores nationwide.",
    
      },
      {
        question: "Does Franko Trading sell home appliances?",
        answer: "Yes. Our range includes fridges, air conditioners, blenders, microwaves, fans, generators, solar panels, air fryers, mixers, washing machines and speakers.",

      },
      {
        question: "Does Franko Trading sell TVs?",
        answer: "Yes. We stock Franko TVs and Skyworth Google TVs in sizes from 32 inches to 100 inches.",

      },
    ],
  },
  {
    category: "Shopping & Ordering",
    icon: ShoppingBag,
    items: [
      {
        question: "How can I order from Franko Trading?",
        answer: "You can shop in-store at any of our branches or order online via our official website or WhatsApp.",

      },
      {
        question: "Does Franko Trading accept installment payments?",
        answer: "Yes. Selected phone models can be purchased on installment. You pay a deposit upfront and the balance in installments. Contact 0264189099 for details.",
     
      },
      {
        question: "Does Franko Trading offer discounts?",
        answer: "Yes. We run weekly deals, seasonal discounts, and cashback promotions. Follow us on Facebook, Instagram, and TikTok for updates.",

      },
      {
        question: "Can I pre-order items not yet in stock?",
        answer: "Yes. If pre-order is available, the required amount will be displayed at checkout for you to pay.",
      
      },
    ],
  },
  {
    category: "Delivery & Shipping",
    icon: Truck,
    items: [
      {
        question: "How does same-day delivery work in Accra?",
        answer: "Orders placed before 3 PM within Accra are delivered the same day.",
     
      },
      {
        question: "How are orders outside Accra delivered?",
        answer: "Orders placed before 3 PM are sent the same day to your nearest transport station for pick-up.",
       
      },
      {
        question: "Does Franko Trading offer cash-on-delivery?",

      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept Mobile Money (MoMo Pay), bank transfers, and cash. MoMo Merchant ID: 189480.",
      },

    ],
  },
  {
    category: "Warranty & Repairs",
    icon: Wrench,
    items: [
      {
        question: "Does Franko Trading provide repair services?",
        answer: "Yes. We have dedicated technicians for phones, laptops, AC units, and TVs.",
        
      },
      {
        question: "How do I claim warranty?",
        answer: "Bring your item and proof of purchase to any branch for assessment and repair or replacement.",
    
      },
    ],
  },
  {
    category: "Branches & Contact",
    icon: MapPin,
    items: [
      {
        question: "Where are Franko Trading shops located?",
        answer: "We have branches in Accra, Kumasi, Koforidua, Obuasi, Ho, Tema, Takoradi, Cape Coast, Kasoa, and more.",

      },
      {
        question: "What are the opening hours?",
        answer: "All branches are open Monday to Saturday, 8:00 AM to 6:00 PM.",

      },
    ],
  },
  {
    category: "Other Services",
    icon: Gift,
    items: [
      {
        question: "Does Franko Trading offer promotional gifts?",
        answer: "Yes, but they are available only for online purchases, not in-store.",
   
        
      },
      {
        question: "Is there a Franko Trading app?",
        answer: "Yes. We have Android and iOS apps available in app stores.",

      },
    ],
  },
];

// FAQ Item Component
const FAQItem = ({ faq, isOpen, onToggle, searchQuery, index }) => {
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-green-200 text-green-900 rounded px-0.5">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all duration-200 hover:bg-gray-50 ${
          isOpen ? "bg-green-50/50" : ""
        }`}
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-semibold mt-0.5">
          {index + 1}
        </span>
        <span className={`flex-1 text-sm font-medium leading-relaxed transition-colors ${
          isOpen ? "text-green-700" : "text-gray-700"
        }`}>
          {highlightText(faq.question, searchQuery)}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-all duration-300 ${
            isOpen ? "rotate-180 text-green-500" : "text-gray-400"
          }`}
        />
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pl-[52px]">
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {highlightText(faq.answer, searchQuery)}
            </p>
            {faq.tags && (
              <div className="flex flex-wrap gap-1.5">
                {faq.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Section Component
const CategorySection = ({ section, sectionIndex, expanded, toggleExpand, searchQuery }) => {
  const IconComponent = section.icon;
  const expandedCount = section.items.filter((_, qIdx) => expanded[`${sectionIndex}-${qIdx}`]).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-shadow">
      {/* Category Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm">{section.category}</h3>
            <p className="text-xs text-gray-500">
              {section.items.length} question{section.items.length > 1 ? "s" : ""}
              {expandedCount > 0 && (
                <span className="text-green-600"> · {expandedCount} open</span>
              )}
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            {section.items.length}
          </span>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="divide-y divide-gray-50">
        {section.items.map((faq, qIdx) => (
          <FAQItem
            key={qIdx}
            faq={faq}
            index={qIdx}
            isOpen={expanded[`${sectionIndex}-${qIdx}`]}
            onToggle={() => toggleExpand(sectionIndex, qIdx)}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
};

// Main FAQ Component
const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleExpand = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const allExpanded = {};
    filteredData.forEach((section, cIdx) => {
      const originalIdx = section.originalIndex ?? cIdx;
      section.items.forEach((_, qIdx) => {
        allExpanded[`${originalIdx}-${qIdx}`] = true;
      });
    });
    setExpanded(allExpanded);
  };

  const collapseAll = () => setExpanded({});

  const filteredData = useMemo(() => {
    let data = faqData.map((section, idx) => ({ ...section, originalIndex: idx }));
    
    if (activeCategory !== null) {
      data = [data[activeCategory]];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              item.question.toLowerCase().includes(query) ||
              item.answer.toLowerCase().includes(query) ||
              item.tags?.some((tag) => tag.toLowerCase().includes(query))
          ),
        }))
        .filter((section) => section.items.length > 0);
    }

    return data;
  }, [searchQuery, activeCategory]);

  const totalResults = filteredData.reduce((sum, section) => sum + section.items.length, 0);
  const totalFAQs = faqData.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Help Center</h1>
              <p className="text-xs text-gray-500">{totalFAQs} frequently asked questions</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full">
              <HelpCircle className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-700">FAQ</span>
            </div>
          </div>

          
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold text-green-600">{totalResults}</span> result
              {totalResults !== 1 ? "s" : ""} for "<span className="text-gray-800">{searchQuery}</span>"
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={expandAll}
                className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                Expand all
              </button>
              <button
                onClick={collapseAll}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium hover:underline"
              >
                Collapse all
              </button>
            </div>
          </div>
        )}

        {/* FAQ Sections */}
        {filteredData.length > 0 ? (
          <div className="space-y-4">
            {filteredData.map((section) => (
              <CategorySection
                key={section.originalIndex}
                section={section}
                sectionIndex={section.originalIndex}
                expanded={expanded}
                toggleExpand={toggleExpand}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">No results found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try different keywords or browse categories
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
              }}
              className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Help Card */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-gray-800 mb-0.5">Still need help?</h3>
              <p className="text-gray-500 text-sm">
                Our team is available Mon-Sat, 8 AM - 6 PM
              </p>
            </div>
            <button
              onClick={() => navigate("/contact")}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm"
            >
              <Headphones className="w-4 h-4" />
              Contact Us
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="mt-4 grid grid-cols-2 gap-3">
      
          <button
            onClick={() => navigate("/shops")}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-200 hover:bg-green-50/50 transition group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Visit store</p>
              <p className="text-sm font-medium text-gray-800 group-hover:text-green-700">Find locations</p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 py-4 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-xs text-gray-400">
            © 2025 Franko Trading · All rights reserved
          </p>
        </div>
      </div>

      {/* Custom scrollbar hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default FAQ;