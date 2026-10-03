import type { ReactNode } from "react";

type NomeIcona =
  | "play"
  | "freccia"
  | "cerca"
  | "cuore"
  | "pollice-su"
  | "pollice-giu"
  | "check"
  | "stella"
  | "piu"
  | "aggiorna";

interface Props {
  nome: NomeIcona;
  dimensione?: number;
  className?: string;
}

// Icone a tratto, stile Lucide. Il colore segue currentColor.
const TRACCIATI: Record<NomeIcona, ReactNode> = {
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />,
  freccia: <path d="M5 12h14M13 6l6 6-6 6" />,
  cerca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  cuore: (
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
  ),
  "pollice-su": (
    <path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z" />
  ),
  "pollice-giu": (
    <path d="M17 14V3M9 18.1 10 14H4.2a2 2 0 0 1-1.9-2.6l2.3-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.8a2 2 0 0 0-1.8 1.1L12 22a3.1 3.1 0 0 1-3-3.9z" />
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  stella: (
    <path
      d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"
      fill="currentColor"
      stroke="none"
    />
  ),
  piu: <path d="M12 5v14M5 12h14" />,
  aggiorna: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6l2.5 2.5" />
      <path d="M20.5 3.5v5h-5" />
    </>
  ),
};

function Icona({ nome, dimensione = 18, className }: Props) {
  return (
    <svg
      className={className}
      width={dimensione}
      height={dimensione}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {TRACCIATI[nome]}
    </svg>
  );
}

export default Icona;
