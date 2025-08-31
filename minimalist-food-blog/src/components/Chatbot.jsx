import React, { useState, useRef, useEffect } from "react";
import Groq from "groq-sdk";
import { useAuth } from "../context/AuthContext";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const API_URL = "http://localhost:8000/api";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Food Blog Assistant. I can help you create, edit, search, or delete blog posts. Just tell me what you'd like to do!",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const messagesEndRef = useRef(null);
  const { token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch posts for search/management operations
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const getUsernameFromToken = (token) => {
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || "";
    } catch {
      return "";
    }
  };

  // Function to create a blog post
  const createBlogPost = async (postData) => {
    try {
      const username = getUsernameFromToken(token);
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          created_by: username,
          read_time: postData.readTime || "5 min read",
          category: postData.category || "General",
          excerpt: postData.excerpt || postData.content.substring(0, 150) + "...",
          image: postData.image || null,
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        return { success: true, post: newPost };
      } else {
        return { success: false, error: "Failed to create post" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Function to delete a blog post
  const deleteBlogPost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        return { success: true };
      } else {
        return { success: false, error: "Failed to delete post" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Function to search posts
  const searchPosts = (query) => {
    const searchTerm = query.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm)
    );
  };

  // Parse user intent and extract structured data from AI response
  const parseIntent = (userMessage, aiResponse) => {
    const message = userMessage.toLowerCase();
    const response = aiResponse.toLowerCase();
    
    // Intent detection patterns
    const intents = {
      create: ['create', 'write', 'post', 'publish', 'add', 'new blog'],
      delete: ['delete', 'remove', 'erase'],
      search: ['search', 'find', 'look for', 'show me'],
      list: ['list', 'show all', 'my posts'],
    };

    // Detect intent
    let detectedIntent = null;
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        detectedIntent = intent;
        break;
      }
    }

    return detectedIntent;
  };

  // Extract structured blog post data from AI response
  const extractBlogData = (text) => {
    const lines = text.split('\n');
    const postData = {};
    
    // Try to extract structured data
    for (const line of lines) {
      if (line.toLowerCase().includes('title:')) {
        postData.title = line.replace(/title:/i, '').trim();
      } else if (line.toLowerCase().includes('category:')) {
        postData.category = line.replace(/category:/i, '').trim();
      } else if (line.toLowerCase().includes('content:')) {
        postData.content = line.replace(/content:/i, '').trim();
      }
    }
    
    // If no structured format, try to guess
    if (!postData.title && !postData.content) {
      const sentences = text.split('.').filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        postData.title = sentences[0].trim();
        postData.content = text;
      }
    }
    
    return postData;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = {
      role: "user",
      content: userInput,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = userInput;
    setUserInput("");
    setIsLoading(true);

    try {
      // Enhanced system prompt for CRUD operations
      const systemPrompt = `You are a helpful assistant for a food blog with CRUD capabilities. You can help users:

1. CREATE blog posts - When user wants to create a post, ask for or help generate:
   - Title
   - Content 
   - Category (like "Desserts", "Main Course", "Appetizers", etc.)
   - Excerpt (optional)

2. SEARCH posts - Help users find specific posts

3. LIST posts - Show available posts

4. DELETE posts - Help remove unwanted posts

When creating posts, provide structured responses like:
Title: [Post Title]
Category: [Category Name]  
Content: [Full post content with cooking instructions, ingredients, etc.]

Be helpful and ask clarifying questions if needed. Focus on food and recipe content.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
          userMessage,
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || 
        "Sorry, I couldn't get a response. Please try again.";

      // Detect user intent
      const intent = parseIntent(currentInput, aiResponse);
      
      let finalResponse = aiResponse;
      let actionPerformed = false;

      // Handle different intents
      switch (intent) {
        case 'create':
          // Check if the AI response contains structured blog data
          const blogData = extractBlogData(aiResponse);
          
          if (blogData.title && blogData.content && token) {
            const result = await createBlogPost(blogData);
            if (result.success) {
              finalResponse += `\n\n✅ Blog post created successfully! Post ID: ${result.post.id}`;
              actionPerformed = true;
            } else {
              finalResponse += `\n\n❌ Failed to create post: ${result.error}`;
            }
          } else if (!token) {
            finalResponse += "\n\n⚠️ Please log in to create blog posts.";
          }
          break;

        case 'search':
          const searchQuery = currentInput.replace(/search|find|look for|show me/gi, '').trim();
          if (searchQuery) {
            const results = searchPosts(searchQuery);
            if (results.length > 0) {
              finalResponse += `\n\nFound ${results.length} post(s):\n`;
              results.slice(0, 5).forEach((post, index) => {
                finalResponse += `${index + 1}. ${post.title} (${post.category})\n`;
              });
              actionPerformed = true;
            } else {
              finalResponse += `\n\nNo posts found matching "${searchQuery}"`;
            }
          }
          break;

        case 'list':
          if (posts.length > 0) {
            finalResponse += `\n\nHere are your recent posts:\n`;
            posts.slice(0, 10).forEach((post, index) => {
              finalResponse += `${index + 1}. ${post.title} (${post.category}) - by ${post.created_by}\n`;
            });
            actionPerformed = true;
          } else {
            finalResponse += "\n\nNo posts available yet.";
          }
          break;

        case 'delete':
          // Extract post ID or title from user input
          const deleteMatch = currentInput.match(/delete.*?(\d+)|delete.*?"([^"]+)"/i);
          if (deleteMatch && token) {
            const postId = deleteMatch[1];
            const postTitle = deleteMatch[2];
            
            let targetPost = null;
            if (postId) {
              targetPost = posts.find(p => p.id == postId);
            } else if (postTitle) {
              targetPost = posts.find(p => p.title.toLowerCase().includes(postTitle.toLowerCase()));
            }
            
            if (targetPost) {
              const username = getUsernameFromToken(token);
              if (targetPost.created_by === username) {
                const result = await deleteBlogPost(targetPost.id);
                if (result.success) {
                  finalResponse += `\n\n✅ Post "${targetPost.title}" deleted successfully!`;
                  actionPerformed = true;
                } else {
                  finalResponse += `\n\n❌ Failed to delete post: ${result.error}`;
                }
              } else {
                finalResponse += "\n\n❌ You can only delete your own posts.";
              }
            } else {
              finalResponse += "\n\n❌ Post not found. Please specify a valid post ID or title.";
            }
          } else if (!token) {
            finalResponse += "\n\n⚠️ Please log in to delete posts.";
          }
          break;
      }

      // Add helpful suggestions if no action was performed
      if (!actionPerformed && !intent) {
        finalResponse += "\n\n💡 Try asking me to:\n• 'Create a new recipe post about chocolate cake'\n• 'Search for pasta recipes'\n• 'List all my posts'\n• 'Delete post 123'";
      }

      const assistantMessage = {
        role: "assistant",
        content: finalResponse,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    } catch (error) {
      console.error("Error fetching from Groq API:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "I'm having trouble connecting. Please check your API key and try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">🍳 Food Blog Assistant</h3>
              <p className="text-xs opacity-90">Create, search, manage posts</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">
              &#x2715;
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 p-3 rounded-lg max-w-[85%] ${
                  msg.role === "assistant"
                    ? "bg-white shadow-sm border border-gray-200 text-gray-800 self-start"
                    : "bg-gradient-to-r from-orange-500 to-red-500 text-white self-end ml-auto"
                } whitespace-pre-line`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="mb-3 p-3 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-500 self-start">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce">🤖</div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={userInput} 
                onChange={(e) => setUserInput(e.target.value)} 
                placeholder="Ask me to create, search, or manage posts..." 
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
                disabled={isLoading}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-16 h-16 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-2xl transition-all transform hover:scale-105"
        >
          🍳
        </button>
      )}
    </div>
  );
}