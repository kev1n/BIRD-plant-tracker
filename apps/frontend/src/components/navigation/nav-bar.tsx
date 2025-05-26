import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileLogo from '../../assets/logos/avatar.svg';
import BirdLogo from '../../assets/logos/bird_logo.svg';
import Lock from '../../assets/logos/lock.svg';
import { useUser } from '../../hooks/useUser';
import { Button } from '../ui/button';

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
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="flex gap-2 py-1 px-2 md:px-4 text-lg md:text-xl items-center border-b border-black shadow-md">
      <div className="flex-1 flex gap-2 items-center">
        <img src={BirdLogo} alt="Sanctuary Logo" className="w-9 h-9 md:w-12 md:h-12"/>
        <button
          className="font-bold bg-transparent border-none cursor-pointer text-primary-green text-lg md:text-xl"
          onClick={() => navigate('/')}
        >
          CSBBS Plant Tracker
        </button>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden p-1"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      
      {/* Desktop menu */}
      <ul className="hidden md:flex p-0 m-0 list-none gap-6 lg:gap-8 items-center font-medium text-neutral-heading text-lg">
        <li>
          <Link to='/about'>About</Link>
        </li>
        <li>
          <Link to='/map'>Map</Link>
        </li>
        <li>
          <Link to='/spreadsheet'>Spreadsheet</Link>
        </li>
        {isLoading ? (
          <li>Loading...</li>
        ) : user ? (
          <>
            <li className="flex items-center gap-2">
              <img src={Lock} alt="Lock symbol" className="w-6 h-6"/>
              <Link to='/admin'>Admin</Link>
            </li>
            <li>
              <img src={ProfileLogo} alt="Profile Image" className="w-7 h-7"/>
            </li>
            <li>
              <Button variant="outline" size="default" onClick={handleLogout} className="text-base py-1 px-4">Logout</Button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to='/login'>Login</Link>
            </li>
            <li>
              <Link to='/signup'>Sign Up</Link>
            </li>
          </>
        )}
      </ul>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[50px] left-0 right-0 bg-white z-50 shadow-lg md:hidden border-b border-black">
          <ul className="flex flex-col p-4 m-0 list-none gap-4 font-medium text-neutral-heading text-lg">
            <li>
              <Link to='/about' onClick={() => setMobileMenuOpen(false)}>About</Link>
            </li>
            <li>
              <Link to='/map' onClick={() => setMobileMenuOpen(false)}>Map</Link>
            </li>
            <li>
              <Link to='/spreadsheet' onClick={() => setMobileMenuOpen(false)}>Spreadsheet</Link>
            </li>
            {isLoading ? (
              <li>Loading...</li>
            ) : user ? (
              <>
                <li className="flex items-center gap-2">
                  <img src={Lock} alt="Lock symbol" className="w-6 h-6"/>
                  <Link to='/admin' onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                </li>
                <li className="flex items-center gap-2">
                  <img src={ProfileLogo} alt="Profile Image" className="w-7 h-7"/>
                  <span>{user.username || user.email}</span>
                </li>
                <li>
                  <Button 
                    variant="outline" 
                    size="default" 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }} 
                    className="text-base py-1 px-4"
                  >
                    Logout
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to='/login' onClick={() => setMobileMenuOpen(false)}>Login</Link>
                </li>
                <li>
                  <Link to='/signup' onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
