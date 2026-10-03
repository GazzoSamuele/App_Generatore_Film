import { useState, type ReactNode } from "react";
import { classePoster } from "../colori";

interface Props {
  titolo: string;
  posterUrl: string;
  /** Badge in alto a sinistra (es. "63% match" o il voto). */
  etichetta?: ReactNode;
  className?: string;
}

// Mostra l'immagine del poster; se manca o non si carica, un segnaposto
// colorato con il titolo, come nei mockup del redesign.
// È uno <span> e non un <div> perché finisce anche dentro un <button> (il mazzo della home).
function Poster({ titolo, posterUrl, etichetta, className = "" }: Props) {
  const [immagineRotta, setImmagineRotta] = useState(false);
  const conImmagine = posterUrl.length > 0 && !immagineRotta;

  return (
    <span className={`poster ${classePoster(titolo)} ${className}`}>
      {conImmagine ? (
        <img
          className="poster__immagine"
          src={posterUrl}
          alt=""
          loading="lazy"
          onError={() => setImmagineRotta(true)}
        />
      ) : (
        <span className="poster__titolo" aria-hidden="true">
          {titolo}
        </span>
      )}

      {etichetta && <span className="poster__etichetta">{etichetta}</span>}
    </span>
  );
}

export default Poster;
