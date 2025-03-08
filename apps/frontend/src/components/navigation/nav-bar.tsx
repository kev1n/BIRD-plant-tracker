import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import LogoutModal from './logout-modal';

export default function NavBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setIsModalOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="flex gap-2.5 p-2.5 px-5 text-xl">
      <div className="flex-1 flex gap-2.5">
        <button
          className="p-0 text-3xl font-bold font-mono bg-transparent border-none cursor-pointer"
          onClick={() => navigate('/')}
        >
          [LOGO]
        </button>
      </div>
      {user ? (
        <Button variant="outline" onClick={handleLogoutClick}>
          Log Out
        </Button>
      ) : (
        <>
          <Button onClick={() => navigate('/signup')}>Sign Up</Button>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Login
          </Button>
        </>
      )}
      <LogoutModal isOpen={isModalOpen} onClose={handleModalClose} onLogout={handleLogoutConfirm} />
    </nav>
  );
}
