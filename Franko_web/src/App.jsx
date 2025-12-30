

import { useState, useEffect } from 'react'
import {Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Nav from './Component/Nav/Navbar'
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'
import BrandsPage from './Pages/Brands'
import ShowroomProductsPage from './Pages/ShowRooomProducts'
import Phones from './Pages/Phones'
import ProductDescription from './Pages/ProductDescription'
import ProductCard from './Component/ProductCard'
import Cart from './Pages/Cart'
import Laptops from './Pages/Laptops'
import Fridge from './Pages/Fridge'
import Television from './Pages/Television'
import Speakers from './Pages/Speaker'
import Accessories from './Pages/Accessories'
import Appliances from './Pages/Appliances'
import Combo from './Pages/Combo'
import Airconditioners from './Pages/AC'
import Checkout from './Pages/Checkout'
import OrderReceived from './Pages/OrderReceived'
import Locations from './Pages/Locations'
import Cancellation from './Pages/OrderCancelled'

import Account from './Pages/Account'
import Products from './Pages/Products'
import Terms from './Pages/Terms'
import OrderHistory from './Pages/OrderHistory'
import Wishlist from './Pages/Wishlist'

import NoInternetPage from './Component/NoInternet'

import OrderSuccessPage from './Pages/OrderSucess'
import ScrollToTop from './Pages/ScrollToTop'
import CategoryPage from './Pages/CategoriesPage'

import FAQ from './Pages/Faq'
// import BackToSchool from './Pages/ClearanceSale'
// import ClearanceSale from './Pages/ClearanceSale'


// Utility to fetch customer role


const getUserRole = () => {
  try {
    const customer = (localStorage.getItem("customer"));
    const user = (localStorage.getItem("user"));
    if (!customer && !user) return null;

    if (user?.position) return user.position; // Supervisor, Developer, etc.
    return customer?.accountType || null; // customer, agent, admin
  } catch (err) {
    console.error("Error reading user role from localStorage", err);
    return null;
  }
};

const isWebBrowser = () => {
  const ua = navigator.userAgent;
  return !ua.includes("Electron") && /Mozilla|Chrome|Safari|Firefox/i.test(ua);
};

const isElectron = () => navigator.userAgent.includes("Electron");

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userRole = getUserRole();

  // ✅ Web-only restriction: allow only Developer and agent
  if (isWebBrowser() && userRole && !["Developer", "agent"].includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Electron allows all roles (you can modify this as needed)
  if (isElectron()) {
    return children;
  }

  // ✅ Check if user's role is in the allowed roles
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};


const ConditionalNavbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const hiddenPaths = [
    "/admin/login",
    "/admin/register",
    
  ];

  const isAdminPath = pathname.startsWith("/admin/");
 
  const isFulfillmentPath = pathname.startsWith("/fulfillment/");
  const isContentPath = pathname.startsWith("/content/");
  const isDevPath = pathname.startsWith("/dev/");
  const isDigiPath = pathname.startsWith("/digi/");
  

  return !hiddenPaths.includes(pathname) && 
         !isAdminPath && 
       
         !isFulfillmentPath && 
         !isContentPath &&
          !isDevPath && 
          !isDigiPath &&
         <Nav />;
};

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <div>
<NoInternetPage/>
    </div>; 
  }

  return (
    <>
      <ConditionalNavbar />

   <ScrollToTop/>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/phones" element={<Phones ProductCard={ProductCard} />} />
        {/* <Route path= "/pre-black friday" element= {<ClearanceSale/>} /> */}
 
        <Route path="/computers" element={<Laptops ProductCard={ProductCard} />} />
        <Route path="/refrigerator" element={<Fridge ProductCard={ProductCard} />} />
        <Route path="/television" element={<Television ProductCard={ProductCard} />} />
        <Route path="/speakers" element={<Speakers ProductCard={ProductCard} />} />
        <Route path="/accessories" element={<Accessories ProductCard={ProductCard} />} />
        <Route path="/appliances" element={<Appliances ProductCard={ProductCard} />} />
        <Route path="/washing-machine" element={< Combo ProductCard={ProductCard} />} />
        <Route path="/air-condition" element={<Airconditioners ProductCard={ProductCard} />} />
        <Route path="/cart/:cartId" element={<Cart />} />
        <Route path="/product/:productID" element={<ProductDescription />} />
        <Route path="showroom/:showRoomID" element={<ShowroomProductsPage />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/brand/:brandId" element={<BrandsPage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/products" element={<Products />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-received" element={<OrderReceived />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/shops" element={<Locations />} />
        <Route path="/categories" element={< CategoryPage />} />
        <Route path="/faq" element={<FAQ />} />
 
        <Route path="/order-cancelled" element={<Cancellation />} />
         

        

  


        {/* Default route redirects */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  
    </>
  )
}

export default App