import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PostDetail = ({ posts, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="text-center mt-20">
        <p className="text-lg text-muted-foreground">Post not found.</p>
        <Link to="/" className="text-blue-500 underline mt-4 block">← Back to posts</Link>
      </div>
    );
  }

  const handleDelete = () => {
    const confirm = window.confirm('Are you sure you want to delete this post?');
    if (confirm) {
      onDelete(post.id);
      navigate('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-4">
        {post.title}
      </h1>

      {/* Metadata */}
      <p className="text-sm text-muted-foreground mb-6">
        {new Date(post.createdAt).toLocaleDateString()} • {post.readTime}
      </p>

      <hr className="border-gray-200 mb-8" />

      {/* Content */}
      <article className="prose prose-neutral prose-lg max-w-none mb-12">
        {post.content.split('\n').map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </article>

      {/* Footer buttons */}
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
