import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PostDetail = ({ posts, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteMessage, setDeleteMessage] = useState('');

  const post = posts.find((p) => p.id == id);

  if (!post) {
    return (
      <div className="text-center mt-20">
        <p className="text-lg text-muted-foreground">Post not found.</p>
        <Link to="/" className="text-blue-500 underline mt-4 block">← Back to posts</Link>
      </div>
    );
  }

  const handleDelete = () => {
    setDeleteMessage('Post deleted successfully.');
    onDelete(post.id);

    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {deleteMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md shadow-sm border border-red-300">
          {deleteMessage}
        </div>
      )}

      <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-4">
        {post.title}
      </h1>

      <p className="text-sm text-muted-foreground mb-6">
        {new Date(post.created_at).toLocaleDateString()} • {post.readTime}
      </p>

      <img
        src={post.image || 'https://via.placeholder.com/600x400?text=No+Image'}
        alt={post.title}
        className="mb-8 rounded shadow-md"
      />

      <hr className="border-gray-200 mb-8" />

      <article className="prose prose-neutral prose-lg max-w-none mb-12">
        {post.content.split('\n').map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </article>

      <div className="flex justify-between items-center mt-12 border-t pt-6">
        <Link to="/" className="text-blue-500 underline text-sm">
          ← Back to posts
        </Link>
        <Button variant="destructive" onClick={handleDelete}>
          Delete Post
        </Button>
      </div>
    </div>
  );
};

export default PostDetail;
