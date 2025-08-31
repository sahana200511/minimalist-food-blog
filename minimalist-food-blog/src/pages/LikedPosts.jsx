import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BlogCard from "../components/blogcard";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000/api";

const LikedPosts = () => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/user/liked-posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch liked posts");
        const data = await response.json();
        setLikedPosts(data.map(post => ({ ...post, liked: true })));
      } catch (error) {
        console.error("Error fetching liked posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPosts();
  }, [token]);

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };

  const handleToggleLike = async (postId) => {
    // Since this is liked posts page, toggling like should remove it from the list
    const originalPosts = [...likedPosts];
    setLikedPosts(likedPosts.filter(post => post.id !== postId));

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to toggle like");
    } catch (error) {
      console.error("Error toggling like:", error);
      setLikedPosts(originalPosts); // revert on error
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Loading liked posts...</p>
      </div>
    );
  }

  if (!likedPosts || likedPosts.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>You haven't liked any posts yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Liked Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {likedPosts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            onClick={() => handlePostClick(post)}
            onToggleLike={() => handleToggleLike(post.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default LikedPosts;
