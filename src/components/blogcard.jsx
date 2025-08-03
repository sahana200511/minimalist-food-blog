import React from 'react';
import { Clock, Heart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BlogCard = ({ post, onClick, onToggleLike }) => {
  if (!post) return null;

  return (
    <Card className="relative cursor-pointer transition-all hover:shadow-lg group">
      <div onClick={onClick}>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{post.category || 'Uncategorized'}</Badge>
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
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Unknown Date'}
          </p>
        </CardContent>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent card click
          onToggleLike();
        }}
        className="absolute bottom-2 right-2 text-red-500 hover:scale-110 transition-transform"
      >
        <Heart fill={post.liked ? 'currentColor' : 'none'} className="w-5 h-5" />
      </button>
    </Card>
  );
};

export default BlogCard;
