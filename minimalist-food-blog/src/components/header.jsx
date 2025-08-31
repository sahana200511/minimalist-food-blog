import React from 'react';
import { ChefHat, Plus, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ onCreatePost }) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">

          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Food Blog</h1>
              <p className="text-sm text-muted-foreground">Ecstasy of taste</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/myblogs"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              My Blogs
            </Link>
            <Link
              to="/liked-posts"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center"
            >
              <Heart className="h-4 w-4 mr-1" />
              Liked Posts
            </Link>
            <Link
              to="/explore"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Explore
            </Link>
            <Link 
              to="/account" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Account"
              title="Account"
            >
              <User className="h-6 w-6 cursor-pointer p-1 rounded hover:bg-gray-200" />
            </Link>
          </nav>

          {/* Buttons */}
          <div className="flex items-center space-x-4">
            {token ? (
              <>
                <Button onClick={onCreatePost} className="ml-4">
                  <Plus className="h-4 w-4 mr-2" />
                  New Recipe
                </Button>
                <Button onClick={handleLogout} className="ml-4 bg-gray-600 hover:bg-gray-700">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} className="ml-4 bg-blue-600 hover:bg-blue-700">
                  Login
                </Button>
                <Button onClick={() => navigate('/signup')} className="ml-4 bg-green-600 hover:bg-green-700">
                  Signup
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
