// src/utils/localstorage.js

import { initialPosts } from '../data/mockdata'; // adjust path if needed

const STORAGE_KEY = 'food-blog-posts';

export const loadPosts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [...initialPosts];

    const savedPosts = JSON.parse(saved);

    // Fix missing images by merging with initialPosts
    const fixedPosts = savedPosts.map(post => {
      if (!post.image) {
        const original = initialPosts.find(p => p.id === post.id);
        return original ? { ...post, image: original.image } : post;
      }
      return post;
    });

    return fixedPosts;
  } catch (error) {
    console.error('Error loading posts from localStorage:', error);
    return [...initialPosts];
  }
};

export const savePosts = (posts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts to localStorage:', error);
  }
};
