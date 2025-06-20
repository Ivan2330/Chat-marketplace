import "./Tearms.styles.css";
import elipse from "../../assets/elipse-terms.png";
export default function Terams() {
  return (
    <>
      <div className="container-tearms">
        <div className="container-toogle-terms">
          <img src={elipse} alt="elipse" />
        </div>
        <h1 className="tearms-head">Terms of Service</h1>
        <p className="tearms-small-text">
          Please read these Terms of Service carefully before <br />
          using our website or services.
        </p>
      </div>
      <section className="info">
        <p className="text-terms">
          Welcome to [Your Company Name] ("Company", "we", "our", or "us").
          These Terms of Service ("Terms") govern your access to and use of our
          website [website.com] and any related services (collectively, the
          "Service").
        </p>
        <p className="text-terms">
          By accessing or using our Service, you agree to be bound by these
          Terms. If you do not agree to all the terms, you may not access or use
          the Service
        </p>
        <ul>
          <li className="tearms-list-item" style={{ position: "relative" }}>
            1. Acceptance of Terms
            <p className="text-terms-last">
              You may use our Service only in accordance with these Terms and
              all applicable local, state, national, and international laws. You
              agree not to:{" "}
            </p>
            <ul>
              <li className="list-terams-dot-left">
                <p className="text-terms-list">
                  Violate any applicable laws or regulations.
                </p>
              </li>
              <div className="list-terams-dot"></div>
              <li className="list-terams-dot-left">
                <p className="text-terms-list">
                  {" "}
                  Infringe the intellectual property or other rights of any
                  third party.
                </p>
              </li>
              <div className="list-terams-dot"></div>
              <li className="list-terams-dot-left">
                <p className="text-terms-list">
                  Transmit any harmful, abusive, or fraudulent content.
                </p>
              </li>
              <div className="list-terams-dot"></div>
              <li className="list-terams-dot-left">
                <p className="text-terms-list">
                  Interfere with the security or integrity of the Service.
                </p>
              </li>
              <div className="list-terams-dot"></div>
            </ul>
          </li>
          <li className="tearms-list-item">2. Use of the Website</li>
          <p className="list-item-paragraph">
            You may be required to register for an account to access certain
            features. You agree to provide accurate and complete information and
            keep your account secure.You are responsible for all activity under
            your account.
          </p>

          <li className="tearms-list-item">3. Intellectual Property</li>
          <p className="list-item-paragraph">
            All content and materials on the Service, including but not limited
            to text, images, logos, graphics, software, and code, are owned by
            or licensed to [Your <br /> Company Name] and are protected under
            intellectual property laws.
          </p>
          <p className="list-item-paragraph">
            You may not copy, reproduce, distribute, modify, or create
            derivative works from any part of the Service without prior written
            permission.
          </p>
          <li className="tearms-list-item">4. User Accounts</li>
          <p className="list-item-paragraph">
            Our Service may contain links to third-party websites or services
            that are not owned or controlled by us. We do not endorse or assume
            responsibility for any third-party content, products, or services.
          </p>
          <li className="tearms-list-item">Termination</li>
          <p className="list-item-paragraph">
            We may suspend or terminate your access to the Service at any time,
            with or without notice, for any reason, including violation of these
            Terms.
            <br /> Upon termination, your right to use the Service will
            immediately cease. Any provisions of these Terms that should survive
            termination shall remain in effect.
          </p>
          <li className="tearms-list-item">6. Changes to Terms</li>
          <p className="list-item-paragraph">
            The Service is provided "as is" and "as available" without
            warranties of any kind. We do not guarantee that the Service will be
            uninterrupted or error-free.
            <br /> We disclaim all warranties, express or implied, including
            merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
          <li className="tearms-list-item">7. Indemnification</li>
          <p className="list-item-paragraph">
            You agree to indemnify and hold harmless [Your Company Name], its
            affiliates, officers, directors, employees, and agents from any
            claims, liabilities, damages, <br /> and expenses (including legal
            fees) arising out of your use of the Service or violation of these
            Terms.
          </p>
          <li className="tearms-list-item">9. Contact Us</li>
          <p className="list-item-paragraph">
            If you have any questions or concerns about these Terms, please
            contact us at:<br /> Email: [email@example.com]
            <br />
            Address: [Company Address]
          </p>
        </ul>
      </section>
    </>
  );
}
