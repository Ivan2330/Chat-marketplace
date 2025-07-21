import { Route, Routes, useLocation, Navigate } from "react-router";
import { useState, useEffect } from "react";
import Login from "./components/Login/Login";
import Header from "./components/Header/Header";

import Home from "./components/Home/Phychic";
import Footer from "./components/Footer/Footer";
import Terms from "./components/Terms/Terms";
import Balance from "./components/Balance/Balance";
import Chat from "./components/Chat/Chat";

function ProtectedRoute({ children, userProfile }) {
  console.log("ProtectedRoute: userProfile =", userProfile);
  return userProfile ? children : <Navigate to="/login" />;
}

function App() {
  const location = useLocation();
  const shouldShowFooter =
    location.pathname !== "/login" && !location.pathname.startsWith("/chat"); // показувати футер на всьому, крім /chat і /chat/:id

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      const profileData = JSON.parse(storedProfile);
      setUserProfile(profileData);
      console.log("App: User Profile loaded from localStorage:", profileData);
    }
  }, []);

  const handleLoginSuccess = (profileData) => {
    setUserProfile(profileData);
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    console.log("App: User Profile on successful login:", profileData);
  };

  const handleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem("userProfile");
    localStorage.removeItem("accessToken");
    console.log("App: User has logged out. localStorage cleared.");
  };

  return (
    <>
      <Header userProfile={userProfile} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home userProfile={userProfile} />} />

        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />

        <Route path="/terms" element={<Terms />} />

        <Route path="/topup" element={<Balance />} />

        <Route
          path="/chat/:chatId"
          element={
            <ProtectedRoute userProfile={userProfile}>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>

      {shouldShowFooter && <Footer />}
    </>
  );
}

export default App;
