import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Header.css';

interface HeaderProps {
  title: string;
  highlightedText?: string;
}

function Header({ title, highlightedText }: HeaderProps) {
  const location = useLocation();
  const isUploadPage = location.pathname === '/';

  return (
    <header className="header">
      <div className="header-brand">
        <img src={logo} alt="Nalož.to" className="header-logo" />
        <h1>
          {title}
          {highlightedText && <span>{highlightedText}</span>}
        </h1>
      </div>
      {isUploadPage ? (
        <Link to="/files" className="nav-link">
          View Files →
        </Link>
      ) : (
        <Link to="/" className="nav-link">
          ← Upload
        </Link>
      )}
    </header>
  );
}

export default Header;
