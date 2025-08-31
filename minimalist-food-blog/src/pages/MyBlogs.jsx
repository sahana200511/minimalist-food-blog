import React from "react";
import BlogCard from "../components/blogcard";
import { useAuth } from "../context/AuthContext";

export default function MyBlogs({ posts, onPostClick, onToggleLike }) {
  const { token } = useAuth();

  // Decode username from JWT (simple base64 decode, not secure for prod)
  function getUsernameFromToken(token) {
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || "";
    } catch {
      return "";
    }
  }

  const username = getUsernameFromToken(token);

  // Filter posts by current user
  const myPosts = posts.filter((post) => post.createdBy === username);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Blogs</h2>
      {myPosts.length === 0 ? (
        <div className="text-gray-500">You haven't created any blogs yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPosts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              onClick={() => onPostClick(post)}
              onToggleLike={() => onToggleLike(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}