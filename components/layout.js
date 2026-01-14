'use client';

import Link from 'next/link';
import { useAuthStore, useCartStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { count } = useCartStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast.success('Déconnexion réussie');
      router.push('/');
    } catch (error) {
      console.error(error);
      logout();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-blue-600">
              🛒 E-Commerce
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Accueil
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600">
                Produits
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/cart" className="relative text-gray-700 hover:text-blue-600">
                    🛒 Panier
                    {count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </Link>
                  <Link href="/orders" className="text-gray-700 hover:text-blue-600">
                    Mes Commandes
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Bonjour, {user?.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600">
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p>&copy; 2026 E-Commerce. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}