<<<<<<< HEAD
# Minimilastic blog page

It's a simple and beginner friendly blog page with the theme of food and recipies. I've made these using simple and core frontend techstack.

TechStacks Used:
                                                        
1. **React (via Vite)** :- Core library for building user interfaces using components. Vite offers lightning-fast development and optimized builds.                        
2. **React Router DOM**:- Enables client-side routing, allowing navigation between blog listings and detail views.                                                          
3. **Tailwind CSS**:- Utility-first CSS framework for styling the app with a clean, responsive design.                                                                 
4. **ShadCN UI**:- A UI component library built on top of Radix UI and Tailwind CSS, used for consistent and accessible UI elements like buttons, modals, and cards. 
5. **Lucide Icons**:-Icon library for modern and customizable icons (e.g., heart, plus, chef hat).                                                                   
6. **localStorage**:-Browser storage API used to persist posts and likes across sessions (no backend required).                                                        
7. **useState, useEffect**:-React hooks for managing component state and lifecycle events like loading posts or syncing with storage.                                                                
8. **Vercel** (Deployment):-Hosting platform for static front-end apps. Handles builds and provides automatic HTTPS and CI/CD integration.           

Features:-
*Homepage*- the homepage contains a simplae and minilistic view.
-> The header part contains a logo of a chefcrown and a name that says 'FoodBlog'. With a small tagline below.
->On the top right corner there'll be a 'new recipe' button, where we will be able to add our own recipie which will be posted in the homepage.
-> The content of the page will contain blog cards, each will consist the recipies and ingredients.

*BlogCard*- The blogcards are represented in card structures.
-> Clean card layout with title, brief description, category badge, and read time.
->Includes a like (heart) icon at the bottom-right corner to mark favorite recipes.
->Clicking a card navigates to the detailed blog post.

*PostCreation*-Modal-based form to create new recipes without navigating away.
->Inputs include Title, Excerpt, Category, and Full Content.
->Automatically generates timestamp and estimated read time.
->Posts are immediately visible on the homepage once created.

*PostDetailView*-Each blog card links to a dedicated post detail page with,
->Full recipe content in a well-structured article layout.
->Clearly formatted date and read time.
->Buttons at the bottom for:
->Deleting the post
->Navigating back to the homepage with a small 'back<-' link.

*Like Feature*- Posts can be liked/unliked using a heart icon.
->Like state is saved using localStorage, ensuring persistence after reloads.

*Persistent Data*-All posts (created, liked, or deleted) are stored locally using the browser's localStorage.
->Ensures that content is retained between sessions.

*Routing*-Uses React Router for clean client-side routing.
->Supports routes:
/ – Homepage with all posts.
/post/:id – Individual post detail view.


DIFFICULTIES FACED AND SOLUTIONS:
1. Setting Up TailwindCSS & ShadCN UI
Challenge: Initially, configuring TailwindCSS along with ShadCN UI in a Vite + React environment was confusing. The documentation for both tools had differences in structure, and there were compatibility concerns.

->Solution: I referred to the official docs and step-by-step guides, ensured all required dependencies were installed correctly (tailwindcss, postcss, autoprefixer), and used npx tailwindcss init -p to generate the configuration files. Once the base was working, I integrated ShadCN components with Tailwind’s utility classes for a consistent design.

2. Persisting Posts and Likes with localStorage
Challenge: Posts and like states were lost on page refresh, which was breaking the core user experience.

->Solution: I built a utility (utils/localstorage.js) to manage all interactions with localStorage. I ensured all create, delete, and like actions synced correctly with the stored data, and loaded the stored data during app initialization using useEffect.

3. Component Reusability and Routing
Challenge: I initially had duplicated logic between the homepage and the detail pages, and managing state across routes was tricky.

->Solution: I modularized the code by creating reusable components like BlogCard, CreatePostModal, and used React Router effectively for route-based rendering. Passing props like onDelete, onToggleLike, and posts helped manage state in a predictable way.

4. UI Layout & Responsiveness
Challenge: Positioning elements like the like icon, and aligning content properly across different screen sizes, was difficult to get perfect.

->Solution: I used Tailwind’s utility classes (absolute, bottom-4, right-4, flex, grid-cols-*, etc.) to fine-tune the layout. The layout now looks clean on both desktop and mobile screens.

5. Versioning and Hosting
Challenge: Understanding how to prepare the app for production and deploy it was slightly overwhelming at first.

->Solution: I used Vercel for deployment, which simplified the hosting process. By pushing the code to a GitHub repository and connecting it to Vercel, the deployment process became seamless.


Project Structure:-

minimalist-food-blog/
├── public/                     # Static files
├── src/                        # Source files
│   ├── assets/                 # Static images and icons
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # ShadCN UI components 
│   │   ├── BlogCard.jsx        # Blog post card component
│   │   ├── CreatePostModal.jsx# Modal for creating a post
│   │   └── Header.jsx          # App header component
│   ├── data/
│   │   └── mockdata.js         # Initial post data
│   ├── lib/
│   │   └── utils.js            # Utility functions 
│   ├── pages/
│   │   └── PostDetail.jsx      # Individual blog post detail page
│   ├── utils/
│   │   └── localstorage.js     # Helpers to interact with localStorage
│   ├── App.jsx                 # Main app logic with routing
│   ├── main.jsx                # React app entry point
│   ├── index.css               # Tailwind base styles
│   └── App.css                 # Optional additional styles
├── .gitignore
├── components.json             # ShadCN component registry
├── index.html                  # Root HTML template
├── jsconfig.json
├── package.json                # Project metadata and dependencies
├── postcss.config.js           # PostCSS config (for Tailwind)
├── tailwind.config.js          # Tailwind custom configuration
├── vite.config.js              # Vite bundler configuration
└── README.md                   # Project documentation


## Live Demo

Check out the live version here:  
🔗 [[Minimalist Food Blog on Vercel](https://your-vercel-project-name.vercel.app/](https://minimalist-food-blog-t8es.vercel.app/))
