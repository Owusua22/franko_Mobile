import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  Squares2X2Icon,
  UserCircleIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  UserCircleIcon as UserCircleIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
} from "@heroicons/react/24/solid";

const StickyFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      id: "categories",
      label: "Categories",
      path: "/categories",
      icon: Squares2X2Icon,
      activeIcon: Squares2X2IconSolid,
    },
    {
      id: "shops",
      label: "Shops",
      path: "/shops",
      icon: BuildingStorefrontIcon,
      activeIcon: BuildingStorefrontIconSolid,
    },
    {
      id: "account",
      label: "Account",
      path: "/account",
      icon: UserCircleIcon,
      activeIcon: UserCircleIconSolid,
    },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Spacer */}
      <div className="h-12" />

      {/* Sticky Footer */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50
          bg-[#f0fdf4]/95 backdrop-blur-md
          border-t border-[#10b981]/20
          shadow-[0_-2px_10px_rgba(16,185,129,0.1)]
        "
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-around py-1.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = active ? item.activeIcon : item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex flex-col items-center justify-center
                    min-w-[56px]
                    py-1 px-2
                    transition-all duration-200
                    ${
                      active
                        ? "text-[#10b981]"
                        : "text-[#059669]/60 active:text-[#059669]"
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5
                      transition-transform duration-150
                      ${active ? "scale-105" : ""}
                    `}
                  />
                  <span
                    className={`
                      mt-0.5
                      text-[9px]
                      ${active ? "font-semibold" : "font-medium"}
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default StickyFooter;