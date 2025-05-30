import { Outlet } from 'react-router-dom';
import Footer from '../components/navigation/footer';
import NavBar from '../components/navigation/nav-bar';

export default function NavLayout() {
  return (
    <div className="flex flex-col responsive-height">
      <NavBar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
