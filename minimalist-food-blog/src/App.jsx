import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import BlogCard from "./components/blogcard";
import PostDetail from "./pages/PostDetail";
import HomeFeed from "./components/HomeFeed";
import MyBlogs from "./pages/MyBlogs";
import ExplorePage from "./pages/ExplorePage";
import AccountDetails from "./pages/AccountDetails";
import LikedPosts from "./pages/LikedPosts";
import CreatePostModal from "./components/CreatePostModal";
import Chatbot from "./components/Chatbot";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { initialPosts } from "./data/mockdata";

const API_URL = "http://localhost:8000/api";

function MainApp() {
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { token } = useAuth();

  // Debug function to decode and validate token
  const debugToken = (token) => {
    if (!token) {
      console.log("❌ No token available");
      return null;
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error("❌ Invalid token format - should have 3 parts separated by dots");
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      console.log("✅ Token payload:", payload);
      console.log("🕒 Token expires:", new Date(payload.exp * 1000));
      console.log("🕒 Current time:", new Date());
      const isValid = payload.exp * 1000 > Date.now();
      console.log(isValid ? "✅ Token is valid" : "❌ Token is expired");
      return payload;
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      return null;
    }
  };

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("📡 Fetching posts from:", `${API_URL}/posts`);
        const response = await fetch(`${API_URL}/posts`);
        console.log("📡 Posts response status:", response.status);
        
        if (!response.ok) throw new Error(`Failed to fetch posts: ${response.status}`);
        const data = await response.json();
        console.log("✅ Posts fetched:", data.length, "posts");
        setPosts(data.map(post => ({ ...post, liked: false })));
      } catch (error) {
        console.error("❌ Error fetching posts from backend:", error);
        console.log("🔄 Using fallback mock data");
        setPosts(initialPosts.map(post => ({ ...post, liked: false }))); // fallback
      }
    };

    const fetchLikedPosts = async () => {
      if (!token) {
        console.log("⚠️ No token available for fetching liked posts");
        return;
      }

      console.log("=== 💖 Fetching Liked Posts ===");
      const tokenPayload = debugToken(token);
      if (!tokenPayload) {
        console.error("❌ Invalid token, skipping liked posts fetch");
        return;
      }

      try {
        console.log("📡 Making request to:", `${API_URL}/user/liked-posts`);
        const response = await fetch(`${API_URL}/user/liked-posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log("📡 Liked posts response status:", response.status);
        console.log("📡 Response headers:", [...response.headers.entries()]);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Error response body:", errorText);
          throw new Error(`Failed to fetch liked posts: ${response.status} - ${errorText}`);
        }

        const likedData = await response.json();
        console.log("✅ Liked posts data:", likedData);

        setPosts(prev => prev.map(post => ({
          ...post,
          liked: likedData.some(likedPost => likedPost.id == post.id)
        })));

        console.log("✅ Liked posts processing completed");
      } catch (error) {
        console.error("❌ Error fetching liked posts:", error);
      }
    };

    fetchPosts();
    if (token) {
      // Add a small delay to ensure posts are loaded first
      setTimeout(() => fetchLikedPosts(), 100);
    }
  }, [token]);

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };

  const getUsernameFromToken = (token) => {
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || "";
    } catch {
      return "";
    }
  };

  const handleCreatePost = async (newPost) => {
    const username = getUsernameFromToken(token);
    const postWithUser = { ...newPost, createdBy: username };

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: postWithUser.title,
          content: postWithUser.content,
          created_by: postWithUser.createdBy,
          read_time: postWithUser.readTime,
          category: postWithUser.category,
          excerpt: postWithUser.excerpt,
          image: postWithUser.image,
        }),
      });
      if (!response.ok) throw new Error("Failed to create post");
      const createdPost = await response.json();
      setPosts((prev) => [createdPost, ...prev]);
      return createdPost;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  const handleToggleLike = async (postId) => {
    console.log("=== ❤️ Toggle Like Debug ===");
    console.log("🎯 Post ID:", postId);
    console.log("🔑 Token available:", !!token);

    if (!token) {
      console.error("❌ No authentication token available");
      alert("Please log in to like posts");
      return;
    }

    // Debug token
    const tokenPayload = debugToken(token);
    if (!tokenPayload) {
      console.error("❌ Invalid or expired token");
      alert("Your session has expired. Please log in again.");
      return;
    }

    // Optimistic update
    const originalPosts = [...posts];
    const updated = posts.map((post) =>
      post.id == postId ? { ...post, liked: !post.liked } : post
    );
    setPosts(updated);

    try {
      const url = `${API_URL}/posts/${postId}/like`;
      console.log("📡 Making request to:", url);
      
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: 'include', // Add this for CORS
      };
      
      console.log("📡 Request options:", requestOptions);

      const response = await fetch(url, requestOptions);

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);
      console.log("📡 Response headers:", [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const updatedPost = await response.json();
      console.log("✅ Updated post received:", updatedPost);

      setPosts(prev => prev.map(post =>
        post.id == postId ? { 
          ...post, 
          liked: updatedPost.liked, 
          likes: updatedPost.likes || post.likes 
        } : post
      ));

      console.log("✅ Toggle like completed successfully");
    } catch (error) {
      console.error("❌ Error toggling like:", error.message);
      console.error("❌ Full error:", error);
      setPosts(originalPosts); // revert on error
      
      // Show user-friendly error message
      if (error.message.includes('500')) {
        alert("Server error occurred. Please try again later.");
      } else if (error.message.includes('Failed to fetch')) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert(`Failed to toggle like: ${error.message}`);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        onCreatePost={() => setModalOpen(true)}
        onHomeClick={() => navigate("/")}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {isHomePage && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold sm:text-6xl mb-4">
              Latest Recipes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover simple, delicious recipes that anyone can make at home
            </p>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <HomeFeed
                posts={posts}
                onPostClick={handlePostClick}
                onToggleLike={handleToggleLike}
              />
            }
          />
          <Route
            path="/post/:id"
            element={<PostDetail posts={posts} onDelete={handleDeletePost} />}
          />
          <Route
            path="/myblogs"
            element={
              <MyBlogs
                posts={posts}
                onPostClick={handlePostClick}
                onToggleLike={handleToggleLike}
              />
            }
          />
          <Route path="/explore" element={<ExplorePage recipes={initialPosts} />} />
          <Route path="/liked-posts" element={<LikedPosts />} />
          <Route path="/account" element={<AccountDetails />} />
        </Routes>
      </main>

      <CreatePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreatePost}
        username={getUsernameFromToken(token)}
      />
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;