import React from 'react';
import { ChefHat, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ onCreatePost, onHomeClick }) => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={onHomeClick}
          >
            <ChefHat className="h-8 w-8 text-primary" />  {/*chefhat icon*/}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Food Blog</h1>
              <p className="text-sm text-muted-foreground">Ecstasy of taste</p>
            </div>
          </div>
          
          <Button onClick={onCreatePost}>
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
