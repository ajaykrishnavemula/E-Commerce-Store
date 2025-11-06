import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Commerce Pro</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Commerce Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;


