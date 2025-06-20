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

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Psychic() {
  const [expert, setExpert] = useState(null);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/users/expert")
      .then(res => res.json())
      .then(data => setExpert(data))
      .catch(err => console.error("Failed to load expert info", err));
  }, []);

  const handleMoveToChat = async () => {
    if (!token) return navigate("/login");

    try {
      const res = await fetch("http://localhost:8000/chats/init", {
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
    </section>
  );
}
