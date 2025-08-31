export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 py-6 mt-10 border-t">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <p className="text-sm">© {new Date().getFullYear()} Minimalist Food Blog. All rights reserved.</p>
        <nav className="space-x-4 text-sm">
          <a href="/" className="hover:text-gray-900">Home</a>
          <a href="/about" className="hover:text-gray-900">About</a>
          <a href="/contact" className="hover:text-gray-900">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
