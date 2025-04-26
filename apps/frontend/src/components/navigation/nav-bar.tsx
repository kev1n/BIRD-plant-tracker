import { Link, useNavigate } from 'react-router-dom';
import ProfileLogo from '../../assets/logos/avatar.svg';
import BirdLogo from '../../assets/logos/bird_logo.svg';
import Lock from '../../assets/logos/lock.svg';
import { useUser } from '../../hooks/useUser';
import { Button } from '../ui/button';

export default function NavBar() {
  const navigate = useNavigate();
  const { user, setUser, isLoading } = useUser();

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
    <nav className="flex gap-2.5 p-2.5 px-5 text-xl items-center flex-wrap md:flex-nowrap border-b-2 border-black shadow-xl">
      <div className="flex-1 flex gap-2.5">
        <img src={BirdLogo} alt="Sanctuary Logo"/>
        <button
          className="display-2 p-0 font-bold bg-transparent border-none cursor-pointer text-primary-green"
          onClick={() => navigate('/')}
        >
          CSBBS Plant Tracker
        </button>
      </div>
      <ul className="heading-2 p-0 m-0 list-none flex gap-10 items-center font-bold text-neutral-heading">
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
              <img src={Lock} alt="Lock symbol"/>
              <Link to='/admin'>Admin</Link>
            </li>
            <li>
              <img src={ProfileLogo} alt="Profile Image"/>
            </li>
            <li>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
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
    </nav>
  );
}
