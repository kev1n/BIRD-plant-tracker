import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ProfileLogo from '../../assets/logos/avatar.svg';
import BirdLogo from '../../assets/logos/bird_logo.svg';
import Lock from '../../assets/logos/lock.svg';
import { useUser } from '../../hooks/useUser';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export default function NavBar() {
  const navigate = useNavigate();
  const { user, setUser, isLoading } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${baseUrl}/auth/logout`, { method: 'POST' });
      if (response.ok) {
        setUser(null);
        navigate('/login');
      } else {
        toast.error('Logout failed: ' + response.statusText);
      }
    } catch (error) {
      toast.error('Logout error: ' + error);
    }
  };

  const handleRequestEditing = async () => {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${baseUrl}/users/info`, {
      method: 'PUT',
      body: JSON.stringify({ roleRequested: 'editor' }),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status >= 200 && response.status < 300) {
      toast.success('Editing requested');
    } else {
      toast.error('Failed to request editing');
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="relative flex gap-2 py-2 px-3 sm:px-4 md:px-6 text-base sm:text-lg md:text-xl items-center border-b border-black shadow-md bg-white">
      <div className="flex-1 flex gap-2 sm:gap-3 items-center min-w-0">
        <img src={BirdLogo} alt="Sanctuary Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0"/>
        <button
          className="font-bold bg-transparent border-none cursor-pointer text-primary-green text-sm sm:text-base md:text-lg lg:text-xl truncate hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          CSBBS Plant Tracker
        </button>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      
      {/* Desktop menu */}
      <ul className="hidden md:flex p-0 m-0 list-none gap-4 lg:gap-6 xl:gap-8 items-center font-medium text-neutral-heading text-sm lg:text-base xl:text-lg">
        <li>
          <Link to='/about' className="hover:text-primary-green transition-colors py-2 px-1">About</Link>
        </li>
        <li>
          <Link to='/map' className="hover:text-primary-green transition-colors py-2 px-1">Map</Link>
        </li>
        <li>
          <Link to='/spreadsheet' className="hover:text-primary-green transition-colors py-2 px-1">Spreadsheet</Link>
        </li>
        {isLoading ? (
          <li className="text-gray-500">Loading...</li>
        ) : user ? (
          <>
            {(user.role === 'admin' || user.role === 'owner') && (
              <li className="flex items-center gap-2">
                <img src={Lock} alt="Lock symbol" className="w-5 h-5 lg:w-6 lg:h-6"/>
                <Link to='/admin' className="hover:text-primary-green transition-colors py-2 px-1">Admin</Link>
              </li>
            )}
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer bg-transparent border-none p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <img src={ProfileLogo} alt="Profile Image" className="w-6 h-6 lg:w-7 lg:h-7"/>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user.role === 'user' && (
                  <DropdownMenuItem onClick={handleRequestEditing} className="cursor-pointer">
                    Request Editing
                  </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to='/login' className="hover:text-primary-green transition-colors py-2 px-1">Login</Link>
            </li>
            <li>
              <Link to='/signup' className="hover:text-primary-green transition-colors py-2 px-1">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
      
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}
      
      {/* Mobile menu */}
      <div className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile menu header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src={BirdLogo} alt="Sanctuary Logo" className="w-8 h-8"/>
            <span className="font-bold text-primary-green text-sm">CSBBS Plant Tracker</span>
          </div>
          <button 
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu content */}
        <div className="flex flex-col h-full">
          <ul className="flex flex-col p-0 m-0 list-none font-medium text-neutral-heading">
            <li>
              <Link 
                to='/about' 
                onClick={closeMobileMenu}
                className="block py-4 px-6 text-base hover:bg-gray-50 hover:text-primary-green transition-colors border-b border-gray-100"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to='/map' 
                onClick={closeMobileMenu}
                className="block py-4 px-6 text-base hover:bg-gray-50 hover:text-primary-green transition-colors border-b border-gray-100"
              >
                Map
              </Link>
            </li>
            <li>
              <Link 
                to='/spreadsheet' 
                onClick={closeMobileMenu}
                className="block py-4 px-6 text-base hover:bg-gray-50 hover:text-primary-green transition-colors border-b border-gray-100"
              >
                Spreadsheet
              </Link>
            </li>
            {isLoading ? (
              <li className="py-4 px-6 text-gray-500 text-base border-b border-gray-100">Loading...</li>
            ) : user ? (
              <>
                {(user.role === 'admin' || user.role === 'owner') && (
                  <li>
                    <Link 
                      to='/admin' 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-4 px-6 text-base hover:bg-gray-50 hover:text-primary-green transition-colors border-b border-gray-100"
                    >
                      <img src={Lock} alt="Lock symbol" className="w-5 h-5"/>
                      Admin
                    </Link>
                  </li>
                )}
                <li className="border-b border-gray-100">
                  <div className="flex items-center gap-3 py-4 px-6 bg-gray-50">
                    <img src={ProfileLogo} alt="Profile Image" className="w-6 h-6"/>
                    <span className="text-sm text-gray-600 truncate">{user.username || user.email}</span>
                  </div>
                </li>
                <li className="p-4 space-y-3">
                  <Button 
                    variant="outline" 
                    size="default" 
                    onClick={() => {
                      handleRequestEditing();
                      closeMobileMenu();
                    }} 
                    className="w-full text-base py-3 h-auto"
                  >
                    Request Editing
                  </Button>
                  <Button 
                    variant="outline" 
                    size="default" 
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }} 
                    className="w-full text-base py-3 h-auto"
                  >
                    Logout
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to='/login' 
                    onClick={closeMobileMenu}
                    className="block py-4 px-6 text-base hover:bg-gray-50 hover:text-primary-green transition-colors border-b border-gray-100"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to='/signup' 
                    onClick={closeMobileMenu}
                    className="block py-4 px-6 text-base hover:bg-gray-50 hover:text-primary-green transition-colors border-b border-gray-100"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
