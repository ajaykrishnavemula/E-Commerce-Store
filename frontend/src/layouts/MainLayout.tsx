import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Package, LayoutDashboard, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import Button from '../components/common/Button';
import { useState } from 'react';

const MainLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Commerce Pro</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link to="/products">
                <Button variant="ghost" size="sm">
                  Products
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className="relative">
                    <Button variant="ghost" size="sm" leftIcon={<Heart className="h-5 w-5" />}>
                      <span className="hidden sm:inline">Wishlist</span>
                    </Button>
                  </Link>

                  <Link to="/cart" className="relative">
                    <Button variant="ghost" size="sm" leftIcon={<ShoppingCart className="h-5 w-5" />}>
                      <span className="hidden sm:inline">Cart</span>
                    </Button>
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  <Link to="/orders">
                    <Button variant="ghost" size="sm" leftIcon={<Package className="h-5 w-5" />}>
                      <span className="hidden sm:inline">Orders</span>
                    </Button>
                  </Link>

                  {user?.role === 'admin' && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" leftIcon={<LayoutDashboard className="h-5 w-5" />}>
                        <span className="hidden sm:inline">Admin</span>
                      </Button>
                    </Link>
                  )}

                  <div className="relative group">
                    <Button variant="ghost" size="sm" leftIcon={<User className="h-5 w-5" />}>
                      <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Commerce Pro</h3>
              <p className="text-gray-400 text-sm">
                Your one-stop shop for all your needs. Quality products at great prices.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/products" className="hover:text-white">All Products</Link></li>
                <li><Link to="/products?category=electronics" className="hover:text-white">Electronics</Link></li>
                <li><Link to="/products?category=clothing" className="hover:text-white">Clothing</Link></li>
                <li><Link to="/products?featured=true" className="hover:text-white">Featured</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Commerce Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;


