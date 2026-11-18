import { COMMUTE_PHOTO } from '../lib/media';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <a href="#topo" className="wordmark">
            HORA REAL
          </a>
          <p className="footer-note">
            Calculadora aberta de finanças pessoais com base de 4,33 semanas por mês.
          </p>
          <p className="footer-portfolio">
            Projeto de portfólio desenvolvido por{' '}
            <a
              href="https://github.com/Kasprzak-k"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-author-link"
            >
              Arthur Ramos Kasprzak
            </a>
            .
          </p>
          <p className="footer-credits" data-credits>
            Fotografia:{' '}
            <a href={COMMUTE_PHOTO.pageUrl}>{COMMUTE_PHOTO.author}</a> ({COMMUTE_PHOTO.license},
            Wikimedia Commons).
          </p>
        </div>

        <nav aria-label="Seções da página">
          <ul className="footer-nav">
            <li>
              <a href="#anatomia">Anatomia</a>
            </li>
            <li>
              <a href="#comparador">Cenários</a>
            </li>
            <li>
              <a href="#trocas">Vale o tempo?</a>
            </li>
            <li>
              <a href="#resumo">Recibo</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
