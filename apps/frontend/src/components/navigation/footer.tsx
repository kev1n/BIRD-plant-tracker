import CSBBSLogo from '../../assets/logos/csbbs_logo.svg';

export default function Footer() {
  return (
    <footer className="flex gap-2.5 p-2.5 px-5 text-xl items-center flex-wrap md:flex-nowrap border-t-2 border-black shadow-lg sticky top-[100vh]">
      <div className="flex-1 flex gap-2.5">
        <ul className="p-0 m-0 list-none flex gap-10 items-center font-serif text-1s text-violet-950">
          <img className="w-24" src={CSBBSLogo} alt="sanctuary logo"/>
          <li>
            <p className="text-left">Copyright © 2025</p>
            <p className="text-left">Clark Street Bird Sanctuary</p>
          </li>
        </ul>
      </div>
    </footer>
  );
}
