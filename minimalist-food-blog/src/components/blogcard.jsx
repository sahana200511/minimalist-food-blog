import React from 'react';
import { Clock, Heart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Make sure these components exist in your ui folder
import { Badge } from '@/components/ui/badge'; // Same for Badge

const BlogCard = ({ post, onClick, onToggleLike }) => {
  if (!post) return null; // Fallback if no post data

  return (
    <Card className="relative cursor-pointer transition-all hover:shadow-lg group">
      <div onClick={onClick}>
        {/* Image at the top */}
        <img
          src={post.image || "https://via.placeholder.com/400x200?text=No+Image"}
          alt={post.title || "No title"}
          className="w-full h-48 object-cover rounded-t-md"
        />

        <CardHeader>
          <div className="flex items-center justify-between mb-2">
          {/* Display category */}
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags && post.tags.length > 0 ? (
              post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">{post.category || 'Uncategorized'}</Badge>
            )}
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {post.readTime || '1 min read'}
          </div>
          </div>
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
          <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            {/* Format the creation date */}
            {post.created_at
              ? new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Unknown Date'}
          </p>
        </CardContent>
      </div>

      {/* Like button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent the card from triggering the onClick event
          onToggleLike(post.id); // Trigger like toggle function with post id
        }}
        className="absolute bottom-2 right-2 text-red-500 hover:scale-110 transition-transform"
      >
        <Heart fill={post.liked ? 'currentColor' : 'none'} className="w-5 h-5" />
      </button>
    </Card>
  );
};

export default BlogCard;
