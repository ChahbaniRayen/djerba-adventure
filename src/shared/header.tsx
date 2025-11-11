"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, Settings } from "lucide-react";

const Header: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: "Accueil", href: "#home" },
    { name: "Activités", href: "#activities" },
    { name: "Tours", href: "#tours" },
    { name: "Transfert", href: "#transfer" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <nav className="max-w-7xl  px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center  h-16">
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="Luxury Djerba Adventure"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">
              Luxury Djerba Adventure
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-sky-600 px-3 py-2 text-sm   font-bold transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 px-3 py-2 text-sm font-bold transition-colors duration-200"
                >
                  <User className="h-5 w-5" />
                  <span>{session.user?.name || session.user?.email}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    {(session.user as { role?: string })?.role === "admin" && (
                      <a
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Dashboard Admin
                      </a>
                    )}
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/auth/signin"
                className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sky-600 transition-colors duration-200"
              >
                Connexion
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-sky-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              {session ? (
                <>
                  {(session.user as { role?: string })?.role === "admin" && (
                    <a
                      href="/admin/dashboard"
                      className="text-gray-700 hover:text-sky-600 block px-3 py-2 text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard Admin
                    </a>
                  )}
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-700 hover:text-sky-600 block px-3 py-2 text-base font-medium"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <a
                  href="/auth/signin"
                  className="bg-sky-500 text-white block px-3 py-2 rounded-lg text-base font-medium hover:bg-sky-600 mx-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </a>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
