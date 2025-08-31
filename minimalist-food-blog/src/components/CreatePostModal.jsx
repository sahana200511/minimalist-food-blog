import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const defaultPost = {
  title: '',
  content: '',
  category: '',
  excerpt: '',
  image: '',
};

const CreatePostModal = ({ open, onClose, onCreate, username }) => {
  const [formData, setFormData] = useState(defaultPost);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 50) {
      newErrors.category = 'Category cannot exceed 50 characters';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length > 200) {
      newErrors.excerpt = 'Excerpt cannot exceed 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const newPost = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      readTime: '3 min read',
      image: formData.image || 'https://source.unsplash.com/600x400/?food,recipe',
      createdBy: username,
    };

    try {
      const createdPost = await onCreate(newPost);
      setFormData(defaultPost);
      onClose();

      // ✅ Navigate to the newly created post
      navigate(`/post/${createdPost.id}`);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Recipe Post</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new recipe post.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Input
              name="title"
              placeholder="Recipe title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          <div>
            <Input
              name="category"
              placeholder="Category (e.g., Breakfast, Lunch)"
              value={formData.category}
              onChange={handleChange}
            />
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>

          <div>
            <Input
              name="excerpt"
              placeholder="Short excerpt"
              value={formData.excerpt}
              onChange={handleChange}
            />
            {errors.excerpt && <p className="text-red-500 text-sm">{errors.excerpt}</p>}
          </div>

          <div>
            <Textarea
              name="content"
              placeholder="Full recipe content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
            />
            {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
          </div>

          <div>
            <input
              name="image"
              type="url"
              placeholder="Image URL (optional)"
              value={formData.image || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded mb-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Post</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
