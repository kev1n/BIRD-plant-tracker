import { Outlet } from 'react-router-dom';
import NavBar from '../components/navigation/nav-bar';

export default function NavLayout() {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <Outlet />
    </div>
  );
}
