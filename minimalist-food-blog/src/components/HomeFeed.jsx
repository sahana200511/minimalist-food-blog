import React from "react";
import BlogCard from "./blogcard";

const HomeFeed = ({ posts, onPostClick, onToggleLike }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No recipes found. Why not create one?</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          onClick={() => onPostClick(post)}
          onToggleLike={() => onToggleLike(post.id)}
        />
      ))}
    </div>
  );
};

export default HomeFeed;