import CSBBSLogo from '../../assets/logos/csbbs_logo.svg';

export default function Footer() {
  return (
    <footer className="flex gap-2 p-2 px-2 md:px-4 text-base items-center border-t border-black shadow-md sticky top-[100vh]">
      <div className="flex-1 flex gap-2">
        <ul className="p-0 m-0 list-none flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <img className="w-20 md:w-24" src={CSBBSLogo} alt="sanctuary logo"/>
          <li className="text-sm md:text-base text-secondary-light-grey">
            <p className="text-center sm:text-left m-0">Copyright © 2025</p>
            <p className="text-center sm:text-left m-0">Clark Street Bird Sanctuary</p>
          </li>
        </ul>
      </div>
    </footer>
  );
}
