// src/pages/Account.jsx
import { useEffect, useMemo, useState } from "react";
import { Modal, message } from "antd";
import {
  LogOut,
  Trash2,
  User,
  Mail,
  Phone,
  Package,
  Heart,
  Gift,
  ChevronRight,
  HelpCircle,
  History,
  Headphones,
  ShieldCheck,
  Info,

  Sparkles,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateAccountStatus, logoutCustomer } from "../Redux/Slice/customerSlice";
import AuthModal from "../Component/AuthModal";

const Account = () => {
  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signup");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    try {
      const storedCustomer = localStorage.getItem("customer");
      setCustomer(storedCustomer || null);
    } catch (e) {
      setCustomer(null);
    } finally {
      setLoadingCustomer(false);
    }
  }, []);

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem("wishlist");
      setWishlist(Array.isArray(storedWishlist) ? storedWishlist : []);
    } catch {
      setWishlist([]);
    }
  }, []);

  const hasCustomer = !!customer;
  const { firstName, lastName, email, contactNumber, customerAccountNumber, isGuest, accountType, isAgent } = customer || {};
  const isUserAgent = accountType === "agent" || isAgent;

  const openSignupModal = () => { setAuthMode("signup"); setShowAuthModal(true); };
  const openLoginModal = () => { setAuthMode("login"); setShowAuthModal(true); };

  const handleAuthSuccess = () => {
    const storedCustomer = localStorage.getItem("customer");
    setCustomer(storedCustomer || null);
    setShowAuthModal(false);
  };

  const confirmLogout = () => {
    dispatch(logoutCustomer());
    localStorage.removeItem("wishlist");
    localStorage.removeItem("authToken");
    message.success("Logged out successfully");
    setShowLogoutModal(false);
    navigate("/");
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: <span className="text-lg font-semibold">Delete Account?</span>,
      icon: null,
      content: (
        <div className="py-2">
          <p className="text-gray-500 text-sm">This will permanently delete your account and all associated data.</p>
        </div>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      className: "compact-modal",
      onOk: async () => {
        try {
          await dispatch(updateAccountStatus()).unwrap();
          ["customer", "wishlist", "authToken"].forEach(k => localStorage.removeItem(k));
          message.success("Account deleted");
          navigate("/");
        } catch (error) {
          message.error(error || "Failed to delete account");
        }
      },
    });
  };

  const handleNavigation = (path, requiresAuth = false) => {
    if (requiresAuth && !hasCustomer) {
      openLoginModal();
      return;
    }
    navigate(path);
  };

  // Menu Configuration
  const menuSections = [
    {
      title: "Orders & Activity",
      items: [
        { icon: Package, label: "My Orders", path: "/order-history", auth: true, badge: null },
        { icon: Heart, label: "Wishlist", path: "/wishlist", auth: true, badge: wishlist.length || null },
        { icon: History, label: "Recently Viewed", path: "/recently-viewed", auth: false },
      ]
    },

 
    {
      title: "Support",
      items: [
        { icon: Headphones, label: "Help Center", path: "/help", auth: false },
        { icon: HelpCircle, label: "FAQs", path: "/faq", auth: false },
        { icon: ShieldCheck, label: "Privacy & Terms", path: "/terms", auth: false },
        { icon: Info, label: "About", path: "/about", auth: false },
      ]
    }
  ];

  if (loadingCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 pt-4 pb-6">
          <h1 className="text-white text-xl font-bold mb-4">My Account</h1>
          
          {hasCustomer ? (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg font-bold">
                  {firstName?.[0]}{lastName?.[0] || "U"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-green-500" />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-semibold truncate">{firstName} {lastName}</h2>
                  {isUserAgent && (
                    <span className="px-1.5 py-0.5 bg-blue-500 text-[10px] text-white rounded font-medium">AGENT</span>
                  )}
                  {isGuest && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-[10px] text-white rounded font-medium">GUEST</span>
                  )}
                </div>
                <p className="text-green-100 text-xs truncate">{email}</p>
                <p className="text-green-200/70 text-[10px]">ID: {customerAccountNumber}</p>
              </div>
              
              
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Welcome!</h2>
                  <p className="text-green-100 text-xs">Sign in for the best experience</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={openLoginModal}
                  className="flex-1 py-2 bg-white text-green-600 rounded-xl text-sm font-semibold hover:bg-green-50 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={openSignupModal}
                  className="flex-1 py-2 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 transition"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats - Only for logged in users */}
        {hasCustomer && (
          <div className="px-4 -mt-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex justify-around">
              {[
                { label: "Orders", value: "12", icon: Package },
                { label: "Wishlist", value: wishlist.length, icon: Heart },
                { label: "Points", value: "250", icon: Sparkles },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-900 font-bold">
                    <stat.icon className="w-3.5 h-3.5 text-green-500" />
                    {stat.value}
                  </div>
                  <p className="text-[10px] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Sections */}
        <div className="px-4 py-4 space-y-4">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {section.title}
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {section.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => handleNavigation(item.path, item.auth)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-[10px] text-white rounded-full font-medium min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] rounded-full font-medium">
                        {item.highlight}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Danger Zone - Only for logged in users */}
          {hasCustomer && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Account Actions
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 transition text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="flex-1 text-sm text-amber-700">Sign Out</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 transition text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="flex-1 text-sm text-red-600">Delete Account</span>
                  <ChevronRight className="w-4 h-4 text-red-300" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-8 pt-2">
          <div className="text-center text-[10px] text-gray-400 space-y-0.5">
            <p>Franko Trading v2.1.0</p>
            <p>© 2025 All rights reserved</p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Logout Modal */}
      <Modal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        footer={null}
        closable={false}
        centered
        width={320}
        className="logout-modal"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogOut className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Sign Out?</h3>
          <p className="text-sm text-gray-500 mb-4">You'll need to sign in again to access your account.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="flex-1 py-2.5 bg-amber-500 rounded-xl text-sm font-medium text-white hover:bg-amber-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Custom Styles */}
      <style jsx global>{`
        .logout-modal .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
        }
        .compact-modal .ant-modal-content {
          border-radius: 12px;
        }
        .compact-modal .ant-modal-confirm-btns {
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
};

export default Account;