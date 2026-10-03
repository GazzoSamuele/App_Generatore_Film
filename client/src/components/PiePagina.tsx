import Icona from "./Icona";

// I crediti sono obbligatori per i termini d'uso:
// - TMDB chiede di citare la fonte con questa nota (e con il loro logo ufficiale,
//   da https://www.themoviedb.org/about/logos-attribution, meno evidente del nostro);
// - i dati "Dove guardarlo" arrivano da JustWatch tramite TMDB, e va citato anche lui.
function PiePagina() {
  return (
    <footer className="pie-pagina">
      <div className="pie-pagina__interno">
        <p className="pie-pagina__marchio">
          <span className="pie-pagina__icona">
            <Icona nome="play" dimensione={11} />
          </span>
          MovieMatch
        </p>

        <div className="pie-pagina__crediti">
          <img
            src="/tmdb-logo.svg"
            alt="The Movie Database (TMDB)"
            className="pie-pagina__logo-tmdb"
          />
          <p>
            Dati e immagini dei film da{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
            >
              TMDB
            </a>
            . Questo prodotto usa l'API di TMDB ma non è approvato né
            certificato da TMDB.
          </p>
          <p>
            Disponibilità sulle piattaforme fornita da{" "}
            <a
              href="https://www.justwatch.com/"
              target="_blank"
              rel="noreferrer"
            >
              JustWatch
            </a>
            .
          </p>
          <p>
            <a href="/privacy.html">Informativa privacy</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PiePagina;
