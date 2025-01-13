import { Link } from "react-router-dom";

export const NavbarLogo = () => {
  return (
    <Link to="/" className="flex-shrink-0">
      <span className="text-2xl font-bold text-primary">Logo</span>
    </Link>
  );
};