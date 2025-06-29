import "./Phychic.styles.css";
import iconProfile from "../../assets/icon-profile.png";
import greenIcon from "../../assets/Ellipse 1.png";
import iconStar from "../../assets/icon-star.png";
import iconChat from "../../assets/chat-icon.png";
import blueIconChat from "../../assets/blue-icon-chat.png";
import eyeIcon from "../../assets/eye-icon.png";
import iconSleep from "../../assets/icon-sleep.png";
import iconMingcute from "../../assets/mingcute-icon.png";
import iconCards from "../../assets/icon-cards.png";
import iconWork from "../../assets/work-icon.png";
import eclisse from "../../assets/eclipse 1x.png";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../../../config";

function LeaveReviewForm({ expertId, onReviewSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("accessToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("userProfile"));

      const res = await fetch(`${API_URL}/users/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expert_id: expertId,
          text: comment,
          author: user?.username || "Anonymous",
          stars_count: rating,
        }),
      });

      if (!res.ok) {
        console.error("Failed to submit review");
        return;
      }

      const newReview = await res.json();
      onReviewSubmit(newReview);
      setRating(5);
      setComment("");
    } catch (err) {
      console.error("Review submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-client" style={{ marginTop: "32px" }}>
      <h3 style={{ color: "#fff", fontSize: "20px", marginBottom: "16px" }}>
        Leave a Review
      </h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="container-star">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              style={{ cursor: "pointer", fontSize: "20px", color: i < rating ? "gold" : "gray" }}
              onClick={() => setRating(i + 1)}
            >
              {i < rating ? "★" : "☆"}
            </span>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Write your feedback..."
          required
          style={{
            backgroundColor: "#1a1a1f",   
            color: "#fff",                
            border: "1px solid #ccc",     
            borderRadius: "10px",
            padding: "12px",
            resize: "none",
            fontFamily: "inherit",        
            width: "100%",
            boxSizing: "border-box"
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: "#6b50ef",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default function Psychic() {
  const [expert, setExpert] = useState(null);
  const [reviews, setReviews] = useState([]);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/users/expert`)
      .then((res) => res.json())
      .then((data) => setExpert(data))
      .catch((err) => console.error("Failed to load expert info", err));
  }, []);

  useEffect(() => {
    if (expert?._id) {
      fetch(`${API_URL}/users/reviews/by_expert/${expert._id}`)
        .then((res) => res.json())
        .then((data) => setReviews(data))
        .catch((err) => console.error("Failed to load reviews", err));
    }
  }, [expert]);

  const handleMoveToChat = async () => {
    if (!token) return navigate("/login");

    try {
      const res = await fetch(`${API_URL}/chats/init`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch/init chat");

      const chat = await res.json();

      if (Array.isArray(chat) && chat.length > 0) {
        navigate(`/chat/${chat[0]._id}`);
      } else if (chat._id) {
        navigate(`/chat/${chat._id}`);
      } else {
        console.error("Unexpected chat response:", chat);
      }
    } catch (err) {
      console.error("Chat init error", err);
    }
  };

  return (
    <section className="section-conatiner">
      <div className="eclipse">
        <img src={eclisse} alt="eclisse" />
      </div>
      {expert && (
        <div className="container-hero">
          <div className="icon-container">
            <img className="icon-profile" src={iconProfile} alt="iconProfile" />
            <img className="icon-green" src={greenIcon} alt="greenIcon" />
          </div>
          <div>
            <div className="container-name">
              <p className="name">{expert.username}</p>
              <p className="love-txt">Love and Light</p>
            </div>
            <div className="container-descr">
              <div className="container-rating">
                <div className="rating-descr">
                  <img src={iconStar} alt="iconStar" />
                  <p className="txt">{expert.rating ?? "4.9"}</p>
                </div>
                <p className="text">Rating</p>
              </div>
              <div className="container-reviews">
                <div className="rating-descr">
                  <img src={blueIconChat} alt="iconChat" />
                  <p className="txt">{expert.reviews_count}</p>
                </div>
                <p className="text">Reviews</p>
              </div>
              <div className="container-price">
                <p className="price">${expert.price_per_min}/min</p>
              </div>
            </div>
            <p className="text-descr">{expert.about_me}</p>
            <div className="container-btn">
              <button className="btn-blue" onClick={handleMoveToChat}>
                <img className="chat-icon-blue" src={iconChat} alt="iconChat" />
                Move to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container-specialties">
        <p className="text-txt">Specialties</p>
        <ul className="specialties-toogle">
          <li className="specialties">
            <img src={eyeIcon} alt="eyeIcon" style={{ width: "19px", height: "19px" }} />
            <p>Psychic Readings</p>
          </li>
          <li className="specialties">
            <img src={iconCards} alt="iconCards" style={{ width: "19px", height: "19px" }} />
            <p>Tarot Readings</p>
          </li>
          <li className="specialties">
            <img src={iconSleep} alt="iconSleep" style={{ width: "19px", height: "19px" }} />
            <p>Dream Analysis</p>
          </li>
          <li className="specialties">
            <img src={iconMingcute} alt="iconMingcute" style={{ width: "19px", height: "19px" }} />
            <p>Love Psychics</p>
          </li>
          <li className="specialties">
            <img src={iconWork} alt="iconWork" style={{ width: "19px", height: "19px" }} />
            <p>Career Forecasts</p>
          </li>
        </ul>
      </div>

      {reviews.length > 0 && (
        <div className="container-client">
        <h4 className="client-reviews">Clients Reviews</h4>
          {reviews.map((review, idx) => (
            <div className="client-item" key={idx}>
              <div className="container-client-name">
                <div className="container">
                  <p className="client-name">{review.author || "Anonymous"}</p>
                  <div className="container-star">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < review.stars_count ? "★" : "☆"}</span>
                    ))}
                  </div>
                </div>
                <p className="client-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="client-comment">{review.text}</p>
            </div>
          ))}
        </div>
      )}

      {token && expert && (
        <LeaveReviewForm
          expertId={expert._id}
          onReviewSubmit={(r) => setReviews([r, ...reviews])}
        />
      )}
    </section>
  );
}
