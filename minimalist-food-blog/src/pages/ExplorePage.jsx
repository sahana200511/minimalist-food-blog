import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../components/blogcard';

const categories = [
  'Quick and Easy',
  'Instant Pot',
  'Meal Prep',
  'Vegan',
  'Vegetarian',
  'Air Fryer',
  'Pasta',
  'Tacos',
  'Desserts',
  'Breakfast',
];

export default function ExplorePage({ recipes = [] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };

  useEffect(() => {
    if (!recipes) return;

    const filtered = recipes.filter((recipe) => {
      const title = recipe.title.toLowerCase();
      const tags = recipe.tags || [];
      const searchLower = search.toLowerCase();
      const selectedCatLower = selectedCategory ? selectedCategory.toLowerCase() : null;

      const matchesSearch = title.includes(searchLower);
      const matchesCategory = selectedCategory ? tags.some(tag => tag.toLowerCase() === selectedCatLower) : true;

      return matchesSearch && matchesCategory;
    });

    // Update state only if filtered results actually changed (prevent infinite loop)
    setFilteredRecipes((prev) => {
      const prevIds = prev.map((r) => r.id).join(',');
      const newIds = filtered.map((r) => r.id).join(',');
      if (prevIds !== newIds) {
        return filtered;
      }
      return prev;
    });
  }, [search, selectedCategory, recipes]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 relative">
      {/* Search Bar */}
      <div className="mb-8 relative">
        <input
          type="text"
          placeholder="Search by keyword"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-md text-lg"
          autoComplete="off"
        />
      </div>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Popular Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Filtered Recipes */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recipes</h2>
        {filteredRecipes.length === 0 ? (
          <p className="text-gray-500">No recipes found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <BlogCard
                key={recipe.id}
                post={recipe}
                onClick={() => handlePostClick(recipe)}
                onToggleLike={() => {}}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
