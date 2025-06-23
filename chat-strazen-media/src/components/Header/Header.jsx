import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router"; 
import "./Header.styles.css";
import menu from "../../assets/Vector.png";
import homeIcon from "../../assets/Home.png";
import peopleIcon from "../../assets/ion_people.png";
import { googleLogout } from "@react-oauth/google";
import plusBalance from "../../assets/icon-plus.png";
import iconLogout from "../../assets/icon-logout.png";
import prof_image from "../../assets/prof_image.svg"

export default function Header({ userProfile, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuToggleButtonRef = useRef(null);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

 
  const [showLogoutButton, setShowLogoutButton] = useState(false);  
  const avatarRef = useRef(null);
  const logoutButtonRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prevState) => !prevState);
  };

  
  const toggleLogoutVisibility = () => {
    setShowLogoutButton((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {      
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !menuToggleButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }

      if (
        showLogoutButton &&
        logoutButtonRef.current &&
        !logoutButtonRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowLogoutButton(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen, showLogoutButton]);

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/terms") {
      setShowGetStarted(true);
    } else {
      setShowGetStarted(false);
    }
  }, [location]);

  const handleUserLogout = () => {
    googleLogout();
    onLogout();
    setShowLogoutButton(false);
    navigate("/login");
  };

  return (
    <>
      <header className="header sticky">
        <div className="header-container">
          <div className="logo">Starzen</div>
          <nav className="nav-desktop">
            <Link className="nav-link" to="/">
              Home
            </Link>
            <Link className="nav-link" to="#">
              Find Specialists
            </Link>
          </nav>
          <div className="container-btn-header">
            {userProfile ? (
              <div className="user-info-header">
                <div className="container-balance-img">
                  <p className="balance-price"><span className="text-balance-price">Raise Your Balance:</span></p>
                  <Link className="balance-button" to="/topup">
                    <img
                      src={plusBalance}
                      alt="plusBalance"
                      style={{ width: 16, height: 16 }}
                    />
                  </Link>
                </div>

                <button
                  className="avatar-button"
                  onClick={toggleLogoutVisibility}
                  ref={avatarRef}
                >
                  <img
                    src={prof_image}
                    alt="User Avatar"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                    }}
                  />
                </button>
                {showLogoutButton && (
                  <button
                    className="logout-button"
                    onClick={handleUserLogout}
                    ref={logoutButtonRef}
                  >
                    <div className="container-logout">
                      <img
                        className="image-loguot-btn"
                        src={iconLogout}
                        alt="iconLogout"
                        style={{ width: 16, height: 16, marginRight: "8px" }}
                      />
                      Log Out
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <>
                <Link
                  className={`login-link ${
                    showGetStarted ? "" : "active-sign-in"
                  }`}
                  to="/login"
                >
                  Sign in
                </Link>
                {showGetStarted && (
                  <Link className="get-started-button" to="#">
                    Get Started
                  </Link>
                )}
              </>
            )}
          </div>
          <button
            className="menu-toggle"
            onClick={toggleMobileMenu}
            ref={menuToggleButtonRef}
          >
            <img src={menu} alt="Menu" style={{ width: 18, height: 12 }} />
          </button>
        </div>
        {isMobileMenuOpen && (
          <nav className="nav-mobile" ref={mobileMenuRef}>
            <div className="container-icon">
              <img
                src={homeIcon}
                alt="homeIcon"
                style={{ width: 24, height: 24 }}
              />
              <Link to="/" onClick={toggleMobileMenu}>
                Home
              </Link>
            </div>
            <div className="container-icon2">
              <img
                src={peopleIcon}
                alt="peopleIcon"
                style={{ width: 24, height: 24 }}
              />
              <Link to="/chat" onClick={toggleMobileMenu}>
                Find Specialists
              </Link>
            </div>           
          </nav>
        )}
      </header>
    </>
  );
}
