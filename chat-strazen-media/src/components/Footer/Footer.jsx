import "./Footer.style.css";
import iconInsta from "../../assets/icon-instagram.png";
import icnLinked from "../../assets/icon-linkedin.png";
import iconTwit from "../../assets/icon-twitter.png";
import iconFacebook from "../../assets/icon-facebook.png";
import tel from "../../assets/icon-phone.png";
import mail from "../../assets/icon-email.png";
import location from "../../assets/icon-location.png";
import { Link } from "react-router";


export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-contacts">
          <div className="logo-footer">Starzen</div>
          <p className="text">
            Connecting you with verified experts across various fields. Get
            personalized advice and achieve your goals with professional
            guidance.
          </p>
          <div>
            <ul className="icon-list">
              <li className="icon-list-item">
                <img
                  src={iconFacebook}
                  alt="iconFacebook"
                  style={{ width: 16, height: 16 }}
                />
              </li>
              <li className="icon-list-item">
                <img
                  src={iconTwit}
                  alt="iconTwit"
                  style={{ width: 16, height: 16 }}
                />
              </li>
              <li className="icon-list-item">
                <img
                  src={iconInsta}
                  alt="iconInsta"
                  style={{ width: 16, height: 16 }}
                />
              </li>
              <li className="icon-list-item">
                <img
                  src={icnLinked}
                  alt="icnLinked"
                  style={{ width: 16, height: 16 }}
                />
              </li>
            </ul>
          </div>
          <address>
            <ul className="contacts">
              <li className="conatcts-list">
                <img src={mail} alt="mail" style={{ width: 16, height: 16 }} />
                <a className="contacts-company" href="mailto:example@gmail.com">
                  example@gmail.com
                </a>
              </li>
              <li className="conatcts-list">
                <img src={tel} alt="tel" style={{ width: 16, height: 16 }} />
                <a className="contacts-company" href="tel:+1 (555) 123-4567">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="conatcts-list">
                <img
                  src={location}
                  alt="location"
                  style={{ width: 16, height: 16 }}
                />
                <p className="contacts-company">San Francisco, CA</p>
              </li>
            </ul>
          </address>
        </div>
        <div className="container-links">
          <div>
            <p className="contacts-text">Platform</p>
            <ul>
              <li className="contact-text-link">Find Specialists</li>
              <li className="contact-text-link">How It Works</li>
              <li className="contact-text-link">Pricing</li>
              <li className="contact-text-link">Success Stories</li>
            </ul>
          </div>
          <div>
            <p className="contacts-text">Categories</p>
            <ul>
              <li className="contact-text-link">Psychology</li>
              <li className="contact-text-link">Business</li>
              <li className="contact-text-link">Health & Wellness</li>
              <li className="contact-text-link">Technology</li>
              <li className="contact-text-link">Finance</li>
            </ul>
          </div>
        </div>
      </footer>
      <div className="container-footer-dowm">
        <p className="rights-txt">© 2025 Starzen. All rights reserved.</p>
        <ul className="links-terms-item">
          <li>
            <Link className="links-terms" to="/terms">Terms of Service</Link>
          </li>
          <li>
            <a  className="links-terms" >Privacy Policy</a>
          </li>
        </ul>
      </div>
    </>
  );
}
