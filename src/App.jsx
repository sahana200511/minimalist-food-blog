import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/header';
import BlogCard from './components/blogcard';
import PostDetail from './pages/PostDetail';
import { initialPosts } from './data/mockdata';
import { loadPosts, savePosts } from './utils/localstorage';
import CreatePostModal from './components/CreatePostModal';

function App() {
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const saved = loadPosts();
    if (saved.length > 0) setPosts(saved);
    else {
      setPosts(initialPosts);
      savePosts(initialPosts);
    }
  }, []);

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };

  const handleCreatePost = (newPost) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    savePosts(updated);
  };

  const handleToggleLike = (postId) => {
    const updated = posts.map(post =>
      post.id === postId ? { ...post, liked: !post.liked } : post
    );
    setPosts(updated);
    savePosts(updated);
  };

  const handleDeletePost = (postId) => {
    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    savePosts(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => setModalOpen(true)}
        onHomeClick={() => navigate('/')}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {isHomePage && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold sm:text-6xl mb-4">Latest Recipes</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover simple, delicious recipes that anyone can make at home
            </p>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    onClick={() => handlePostClick(post)}
                    onToggleLike={() => handleToggleLike(post.id)}
                  />
                ))}
              </div>
            }
          />
          <Route
            path="/post/:id"
            element={
              <PostDetail
                posts={posts}
                onDelete={handleDeletePost}
              />
            }
          />
        </Routes>
      </main>

      <CreatePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreatePost}
      />
    </div>
  );
}

export default App;
