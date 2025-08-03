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

const defaultPost = {
  title: '',
  content: '',
  category: '',
  excerpt: '',
};

const CreatePostModal = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState(defaultPost);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    const newPost = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      readTime: '3 min read',
    };
    onCreate(newPost);
    setFormData(defaultPost);
    onClose();
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
          <Input
            name="title"
            placeholder="Recipe title"
            value={formData.title}
            onChange={handleChange}
          />
          <Input
            name="category"
            placeholder="Category (e.g., Breakfast, Lunch)"
            value={formData.category}
            onChange={handleChange}
          />
          <Input
            name="excerpt"
            placeholder="Short excerpt"
            value={formData.excerpt}
            onChange={handleChange}
          />
          <Textarea
            name="content"
            placeholder="Full recipe content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
          />
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
