import os
import sys
import json
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.database import SessionLocal, engine
import pathlib

# Add project root to sys.path for imports
sys.path.append(str(pathlib.Path(__file__).parent))

# Load mockdata from frontend src/data/mockdata.js converted to JSON format
# Since mockdata.js is JS module, we create a JSON file or embed data here directly

# For simplicity, embed mockdata here as a list of dicts (extracted from mockdata.js)
mockdata = [
  {
    "title": "30-Minute Creamy Mushroom Risotto",
    "content": "This creamy mushroom risotto comes together in just 30 minutes and requires minimal ingredients. Perfect for a cozy weeknight dinner when you want something comforting but don't have hours to spend in the kitchen.\\n\\nIngredients:\\n- 1 cup Arborio rice\\n- 2 cups vegetable broth\\n- 8 oz mixed mushrooms, sliced\\n- 1/2 cup white wine\\n- 1/4 cup nutritional yeast\\n- 2 tbsp olive oil\\n- 1 onion, diced\\n- 2 cloves garlic, minced\\n- Salt and pepper to taste\\n\\nInstructions:\\n1. Heat olive oil in a large pan and sauté onions until translucent.\\n2. Add garlic and mushrooms, cooking until mushrooms are golden.\\n3. Add rice and stir for 2 minutes.\\n4. Pour in wine and let it absorb.\\n5. Gradually add warm broth, stirring frequently until rice is creamy and tender.\\n6. Stir in nutritional yeast and season with salt and pepper.\\n\\nServe immediately with fresh herbs and enjoy!",
    "category": "Dinner",
    "created_by": "system",
    "read_time": "5 min read",
    "excerpt": "Creamy, comforting risotto that comes together in just 30 minutes with simple ingredients.",
    "image": "/assets/risotto.jpg"
  },
  {
    "title": "Fluffy Vegan Pancakes",
    "content": "Start your morning right with these incredibly fluffy vegan pancakes. They're light, airy, and absolutely delicious - no one will guess they're plant-based!\\n\\nIngredients:\\n- 1 1/2 cups all-purpose flour\\n- 2 tbsp sugar\\n- 2 tsp baking powder\\n- 1/2 tsp salt\\n- 1 1/4 cups plant milk\\n- 2 tbsp melted coconut oil\\n- 1 tsp vanilla extract\\n- 1 tbsp apple cider vinegar\\n\\nInstructions:\\n1. Whisk together dry ingredients in a large bowl.\\n2. In another bowl, combine plant milk, melted coconut oil, vanilla, and vinegar.\\n3. Pour wet ingredients into dry and gently fold until just combined - don't overmix!\\n4. Cook on a hot griddle until bubbles form on surface.\\n5. Flip and cook until golden brown.\\n\\nTop with fresh berries, maple syrup, or coconut whipped cream. These pancakes freeze beautifully too!",
    "category": "Breakfast",
    "created_by": "system",
    "read_time": "3 min read",
    "excerpt": "Light, fluffy, and completely plant-based - these pancakes will become your weekend favorite.",
    "image": "/assets/pancake.jpg"
  },
  {
    "title": "Mediterranean Quinoa Bowl",
    "content": "This vibrant Mediterranean quinoa bowl is packed with fresh flavors and nutrients. It's perfect for meal prep and tastes even better the next day.\\n\\nIngredients:\\n- 1 cup quinoa\\n- 1 cucumber, diced\\n- 1 cup cherry tomatoes, halved\\n- 1/2 red onion, thinly sliced\\n- 1/2 cup kalamata olives\\n- 1/4 cup fresh parsley\\n- 1/4 cup crumbled feta cheese\\n- 2 tbsp olive oil\\n- 1 lemon, juiced\\n- 1 tsp dried oregano\\n- Salt and pepper to taste\\n\\nInstructions:\\n1. Cook quinoa according to package directions and let cool.\\n2. Combine all vegetables and herbs in a large bowl.\\n3. Whisk together olive oil, lemon juice, oregano, salt and pepper.\\n4. Toss everything together and let marinate for at least 15 minutes before serving.\\n\\nThis bowl keeps well in the refrigerator for up to 4 days. Perfect for meal prep!",
    "category": "Lunch",
    "created_by": "system",
    "read_time": "4 min read",
    "excerpt": "A colorful, nutrient-packed bowl that gets better with time. Perfect for meal prep!",
    "image": "/assets/quinoa.jpg"
  },
  {
    "title": "Delicious Pasta",
    "content": "A classic pasta recipe that is quick, easy, and delicious. Perfect for any night of the week!\\n\\nIngredients:\\n- 200g pasta of your choice\\n- 2 tbsp olive oil\\n- 2 cloves garlic, minced\\n- 1 cup tomato sauce\\n- Fresh basil\\n- Salt and pepper to taste\\n- Grated parmesan for topping (optional)\\n\\nInstructions:\\n1. Cook pasta according to package instructions until al dente.\\n2. Heat olive oil in a pan, sauté garlic until fragrant.\\n3. Add tomato sauce and simmer for 5 minutes.\\n4. Toss pasta in sauce, season with salt and pepper.\\n5. Serve hot, garnished with basil and parmesan.",
    "category": "Dinner",
    "created_by": "system",
    "read_time": "4 min read",
    "excerpt": "Classic, easy, and delicious pasta for any occasion.",
    "image": "/assets/pasta.jpg"
  },
  {
    "title": "Authentic Chicken Biryani",
    "content": "This aromatic chicken biryani is a feast for the senses, combining tender chicken, fragrant spices, and perfectly cooked rice.\\n\\nIngredients:\\n- 2 cups basmati rice\\n- 500g chicken, cut into pieces\\n- 1 cup yogurt\\n- 2 onions, thinly sliced\\n- 2 tomatoes, chopped\\n- 2 tbsp biryani masala\\n- 1 tsp turmeric\\n- 2 tsp ginger-garlic paste\\n- 4 cups chicken stock\\n- Fresh cilantro and mint leaves\\n- 3 tbsp ghee or oil\\n- Salt to taste\\n\\nInstructions:\\n1. Wash and soak rice for 30 minutes.\\n2. Heat ghee, fry onions until golden, remove half for garnish.\\n3. Add ginger-garlic paste, tomatoes, spices, and chicken, cook until chicken is done.\\n4. Parboil rice in salted water until 70% cooked.\\n5. Layer chicken and rice in a pot, sprinkle herbs, drizzle ghee.\\n6. Cover and cook on low heat (dum) for 20 minutes.\\n7. Serve hot, garnished with fried onions and herbs.",
    "category": "Dinner",
    "created_by": "system",
    "read_time": "6 min read",
    "excerpt": "Fragrant and flavorful, this chicken biryani is a true classic of Indian cuisine.",
    "image": "/assets/biryani.jpg"
  },
  {
    "title": "Classic Margherita Pizza",
    "content": "A timeless favorite, Margherita pizza features fresh tomatoes, mozzarella, and basil for the perfect balance of flavors.\\n\\nIngredients:\\n- Pizza dough (store-bought or homemade)\\n- 1/2 cup tomato sauce\\n- 1 cup fresh mozzarella, sliced\\n- Fresh basil leaves\\n- 2 tbsp olive oil\\n- Salt to taste\\n\\nInstructions:\\n1. Preheat oven to 475°F (245°C).\\n2. Roll out pizza dough on a floured surface.\\n3. Spread tomato sauce evenly, arrange mozzarella slices.\\n4. Bake for 8-10 minutes until crust is golden and cheese is bubbling.\\n5. Top with fresh basil and drizzle with olive oil before serving.",
    "category": "Dinner",
    "created_by": "system",
    "read_time": "5 min read",
    "excerpt": "Simple yet delicious — the perfect balance of tomato, cheese, and basil.",
    "image": "/assets/pizza.jpg"
  },
  {
    "title": "Spicy Thai Peanut Noodles",
    "content": "These spicy Thai peanut noodles are quick, flavorful, and perfect for a weeknight dinner.\\n\\nIngredients:\\n- 8 oz rice noodles\\n- 1/4 cup peanut butter\\n- 3 tbsp soy sauce\\n- 1 tbsp sriracha\\n- 1 tbsp lime juice\\n- 2 cloves garlic, minced\\n- 1 tbsp sesame oil\\n- 1/2 cup shredded carrots\\n- 1/4 cup chopped peanuts\\n- Fresh cilantro for garnish\\n\\nInstructions:\\n1. Cook noodles according to package instructions and drain.\\n2. In a bowl, whisk peanut butter, soy sauce, sriracha, lime juice, garlic, and sesame oil.\\n3. Toss noodles with sauce and carrots.\\n4. Garnish with peanuts and cilantro. Serve warm or cold.",
    "category": "Dinner",
    "created_by": "system",
    "read_time": "20 min read",
    "excerpt": "Quick, spicy, and creamy Thai peanut noodles perfect for any day.",
    "image": "/assets/spicythainoodles.jpg"
  },
  {
    "title": "Avocado Toast with Poached Egg",
    "content": "A simple yet satisfying breakfast with creamy avocado and perfectly poached eggs.\\n\\nIngredients:\\n- 2 slices whole grain bread, toasted\\n- 1 ripe avocado\\n- 2 eggs\\n- 1 tbsp white vinegar\\n- Salt and pepper to taste\\n- Red pepper flakes (optional)\\n- Fresh lemon juice\\n\\nInstructions:\\n1. Mash avocado with lemon juice, salt, and pepper.\\n2. Poach eggs by simmering water with vinegar, cooking eggs for 3-4 minutes.\\n3. Spread avocado on toast.\\n4. Top with poached eggs and sprinkle red pepper flakes if desired.",
    "category": "Breakfast",
    "created_by": "system",
    "read_time": "10 min read",
    "excerpt": "Creamy avocado meets perfectly poached eggs in this healthy breakfast.",
    "image": "/assets/avocadotoast.jpg"
  },
  {
    "title": "Hearty Lentil Soup",
    "content": "A warm and comforting lentil soup packed with veggies and flavor.\\n\\nIngredients:\\n- 1 cup dried lentils, rinsed\\n- 1 onion, chopped\\n- 2 carrots, diced\\n- 2 celery stalks, diced\\n- 3 cloves garlic, minced\\n- 1 can diced tomatoes\\n- 6 cups vegetable broth\\n- 1 tsp cumin\\n- 1 tsp smoked paprika\\n- Salt and pepper to taste\\n- Fresh parsley for garnish\\n\\nInstructions:\\n1. Sauté onion, carrots, celery, and garlic in a large pot.\\n2. Add lentils, diced tomatoes, broth, cumin, and paprika.\\n3. Bring to boil, then simmer 30-40 minutes until lentils are tender.\\n4. Season with salt and pepper.\\n5. Garnish with parsley and serve.",
    "category": "Soup",
    "created_by": "system",
    "read_time": "45 min read",
    "excerpt": "Warm, filling lentil soup perfect for chilly days.",
    "image": "/assets/lentilsoup.jpg"
  },
  {
    "title": "Classic Caesar Salad",
    "content": "A fresh Caesar salad with crunchy croutons and creamy dressing.\\n\\nIngredients:\\n- 1 head romaine lettuce, chopped\\n- 1/2 cup croutons\\n- 1/4 cup grated Parmesan cheese\\n- Caesar dressing (store-bought or homemade)\\n\\nInstructions:\\n1. Toss lettuce with dressing.\\n2. Add croutons and Parmesan.\\n3. Serve immediately.",
    "category": "Salad",
    "created_by": "system",
    "read_time": "10 min read",
    "excerpt": "Crisp romaine tossed with creamy Caesar dressing and crunchy croutons.",
    "image": "/assets/ceasarsalad.jpg"
  }
]

def seed_posts():
    db: Session = SessionLocal()
    try:
        for post_data in mockdata:
            post_create = schemas.PostCreate(
                title=post_data["title"],
                content=post_data["content"],
                created_by=post_data.get("created_by", "system"),
                read_time=post_data.get("read_time"),
                category=post_data.get("category"),
                excerpt=post_data.get("excerpt"),
                image=post_data.get("image"),
            )
            crud.create_post(db, post_create)
        print("Seeded posts successfully.")
    except Exception as e:
        print(f"Error seeding posts: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_posts()
