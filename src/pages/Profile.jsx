import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Profile.css";
import { FiChevronLeft, FiBell, FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_URL = "https://6758e6bf60576a194d122d5c.mockapi.io/accounts";
const IMAGE_API = "https://6758e6bf60576a194d122d5c.mockapi.io/Images";

function Profile() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [videoData, setVideoData] = useState([]);

  useEffect(() => {
    fetchUsers();
    generateInitialVideos();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
      setSelectedUser(res.data[0]);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const generateInitialVideos = async () => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const newVideo = generateRandomVideo(i + 1);
        setVideoData((prev) => [...prev, newVideo]);
      }, i * 200);
    }
  };

  const generateRandomVideo = (id) => {
    const categories = [
      "nature",
      "cat",
      "food",
      "mountain",
      "flower",
      "person",
    ];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomViews = Math.floor(Math.random() * 91) + 10;

    const timestamp = Math.floor(performance.now() * 1000000); // "nano" timestamp (giả lập)

    return {
      id: timestamp + id,
      name: `Random ${randomCategory}`,
      image: `https://picsum.photos/200/300?random=${timestamp + id}`, // random cực mạnh
      isLiked: false,
      views: `${randomViews}K`,
    };
  };

  const handleFollow = async (user) => {
    try {
      const updatedUser = {
        ...user,
        isFollowed: !user.isFollowed,
        followers: user.isFollowed ? user.followers - 1 : user.followers + 1,
      };
      await axios.put(`${API_URL}/${user.id}`, updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      console.error("Failed to follow user:", err);
    }
  };

  const toggleLike = async (id) => {
    const updatedVideos = videoData.map((video) => {
      if (video.id === id) {
        const updated = { ...video, isLiked: !video.isLiked };
        if (updated.isLiked) {
          axios.post(IMAGE_API, updated).catch(console.error);
        }
        return updated;
      }
      return video;
    });
    setVideoData(updatedVideos);
  };

  const loadNewImage = () => {
    const newVideos = [];
    for (let i = 0; i < 6; i++) {
      const newVideo = generateRandomVideo(i + 1);
      newVideos.push(newVideo);
    }
    setVideoData(newVideos);
  };

  const filteredAccounts = users.filter((user) => user.id !== selectedUser?.id);
  const visibleAccounts = showMore
    ? filteredAccounts
    : filteredAccounts.slice(0, 3);

  const renderImages = () => {
    const filtered =
      activeTab === "liked"
        ? videoData.filter((video) => video.isLiked)
        : videoData;

    return filtered.map((video) => (
      <div key={video.id} className="video-card">
        <img
          src={video.image}
          alt={video.name}
          onDoubleClick={() => toggleLike(video.id)}
        />
        <div className="video-info">
          <span>{video.views} views</span>
          <span
            className={`heart ${video.isLiked ? "liked" : ""}`}
            onClick={() => toggleLike(video.id)}
          >
            ♥
          </span>
        </div>
      </div>
    ));
  };

  if (!selectedUser) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header-bar">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft size={24} />
        </button>
        <div className="right-icons">
          <button className="icon-btn">
            <FiBell size={20} />
          </button>
          <button className="icon-btn">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>
      <div className="profile-header">
        <img className="avatar" src={selectedUser.avatar} alt="Avatar" />
        <h2>{selectedUser.name}</h2>
        <p>{selectedUser.bio}</p>
        <div className="stats">
          <div>
            {selectedUser.following}
            <br />
            Following
          </div>
          <div>
            {selectedUser.followers}
            <br />
            Followers
          </div>
          <div>
            {selectedUser.likes}
            <br />
            Likes
          </div>
        </div>
        <div className="buttons">
          <button className="follow" onClick={() => handleFollow(selectedUser)}>
            {selectedUser.isFollowed ? "Unfollow" : "Follow"}
          </button>
          <button className="message">Message</button>
        </div>
      </div>

      <div className="suggested-section">
        <div className="suggested-header">
          <h3>Suggested accounts</h3>
          <button className="buttonShow" onClick={() => setShowMore(!showMore)}>
            {showMore ? "View less" : "View more"}
          </button>
        </div>
        <div className={`suggested-list ${showMore ? "expanded" : ""}`}>
          {visibleAccounts.map((user) => (
            <div
              className="suggested-user bordered"
              key={user.id}
              onClick={() => setSelectedUser(user)}
            >
              <img src={user.avatar} alt={user.name} />
              <p>{user.name}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(user);
                }}
              >
                {user.isFollowed ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "videos" ? "active" : ""}
          onClick={() => setActiveTab("videos")}
        >
          ▶ Videos
        </button>
        <button
          className={activeTab === "liked" ? "active" : ""}
          onClick={() => setActiveTab("liked")}
        >
          ❤️ Liked
        </button>
      </div>

      <button className="load-more-btn" onClick={loadNewImage}>
        Reload new Videos
      </button>

      <div className="video-grid">{renderImages()}</div>
    </div>
  );
}

export default Profile;
