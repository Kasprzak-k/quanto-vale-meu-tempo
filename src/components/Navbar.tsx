import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <nav className="container site-nav" aria-label="Navegação principal">
        <a href="#topo" className="wordmark">
          HORA REAL
        </a>

        <button
          type="button"
          className="nav-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="nav-destinos"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          <span>{menuOpen ? 'Fechar' : 'Menu'}</span>
        </button>

        <ul id="nav-destinos" className={menuOpen ? 'nav-links is-open' : 'nav-links'}>
          <li>
            <a href="#anatomia" className="nav-link" onClick={closeMenu}>
              Anatomia
            </a>
          </li>
          <li>
            <a href="#comparador" className="nav-link" onClick={closeMenu}>
              Cenários
            </a>
          </li>
          <li>
            <a href="#trocas" className="nav-link" onClick={closeMenu}>
              Vale o tempo?
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Kasprzak-k/quanto-vale-meu-tempo"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              onClick={closeMenu}
            >
              GitHub
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
