import { Link, useNavigate } from 'react-router-dom';
import ProfileLogo from '../../assets/logos/avatar.svg';
import BirdLogo from '../../assets/logos/bird_logo.svg';
import Lock from '../../assets/logos/lock.svg';

export default function NavBar() {
  const navigate = useNavigate();
  return (
    <nav className="flex gap-2.5 p-2.5 px-5 text-xl items-center flex-wrap md:flex-nowrap border-b-2 border-black shadow-xl">
      <div className="flex-1 flex gap-2.5">
        <img src={BirdLogo} alt="Sanctuary Logo"/>
        <button
          className="p-0 text-3xl font-bold bg-transparent border-none cursor-pointer text-lime-600"
          onClick={() => navigate('/')}
        >
          CSBBS Plant Tracker
        </button>
      </div>
      <ul className="p-0 m-0 list-none flex gap-10 items-center font-bold text-1xl text-violet-950">
        <li>
          <Link to='/about'>About</Link>
        </li>
        <li>
          <Link to='/map'>Map</Link>
        </li>
        <li>
          <Link to='/spreadsheet'>Spreadsheet</Link>
        </li>
        <li className="flex items-center gap-2">
          <img src={Lock} alt="Lock symbol"/>
          <Link to='/admin'>Admin</Link>
        </li>
        <li>
          <img src={ProfileLogo} alt="Profile Image"/>
        </li>
      </ul>
    </nav>
  );
}
