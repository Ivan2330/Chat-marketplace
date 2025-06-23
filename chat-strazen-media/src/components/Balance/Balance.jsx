import "./Balance.style.css";
import React, { useState, useEffect } from "react";
import elipseBalance from '../../assets/Ellipse-balance.png';
import elipseForm from '../../assets/Ellipse-form-balance.png';
import elipseDown from "../../assets/Ellipse-balance-down.png";
import { API_URL } from "../../../config";


const Balance = () => {
  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchUserAndPlans = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("No token in localStorage");
        return;
      }

      try {
        const userRes = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        console.log("Fetched user:", userData);
        setUser(userData);

        const plansRes = await fetch(`${API_URL}/plans/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const plansData = await plansRes.json();
        console.log("Fetched plans:", plansData);
        setPlans(plansData);
      } catch (err) {
        console.error("Failed to fetch user or plans", err);
      }
    };

    fetchUserAndPlans();
  }, []);

  const handleConfirm = async () => {
    const token = localStorage.getItem("accessToken");
    console.log("Selected plan:", selectedPlan);
    console.log("User:", user);

    if (!user || !user._id || !selectedPlan || !token) {
      console.warn("Missing user, selected plan, or token");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/payments/create-checkout-session/${selectedPlan}?user_id=${user._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      console.log("Checkout session response:", data);

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        console.error("No checkout URL returned", data);
      }
    } catch (err) {
      console.error("Checkout error", err);
    }
  };

  return (
    <section className="container-balance">
      <img className="elipse-balance" src={elipseBalance} alt="elipseBalance" />
      <div className="form-balance">
        <img className="elipse-form" src={elipseForm} alt="elipseForm" />
        <p className="text-balance">Select Amount</p>
        <p className="text-small-balance">Recommended Plans</p>
        <div className="container-button">
          {plans.map((plan) => (
            <button
              key={plan._id || plan.stripe_price_id}
              className={`button-balance ${selectedPlan === plan._id ? "selected" : ""}`}
              onClick={() => {
                console.log("Plan selected:", plan);
                setSelectedPlan(plan._id);
              }}
            >
              {plan.is_most_popular && (
                <p className="popular-balance">Most Popular</p>
              )}
              <p className="number">{plan.minutes}</p>
              <p className="minutes">minutes</p>
              <p className="plus-minutes">+{plan.bonus_minutes} free min</p>
              <div className="container-btn-price">
                <p className="price">${plan.price_usd.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
        {selectedPlan && (
          <button className="return-accaunt" onClick={handleConfirm}>
            Confirm and Pay
          </button>
        )}
        <p className="text-small-balance-down">
          You can hang up any time. Unused funds will be <br /> returned to your account.
        </p>
        <img className="elipse-down" src={elipseDown} alt="elipseDown" />
      </div>
    </section>
  );
};

export default Balance;
