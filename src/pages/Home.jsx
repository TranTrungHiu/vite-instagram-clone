import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="premium-container">
      <div className="overlay">
        <div className="logo">🔊</div>
        <h1 className="title">Welcome to<br />Premium</h1>
        <div className="dots">•••</div>
        <button className="start-button" onClick={() => navigate("/profile")}>
          Start listening
        </button>
      </div>
    </div>
  );
}

export default Home;
