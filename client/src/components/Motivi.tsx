import Icona from "./Icona";

interface Props {
  motivi: string[];
  grandi?: boolean;
}

function Motivi({ motivi, grandi = false }: Props) {
  return (
    <ul className={grandi ? "motivi motivi--grandi" : "motivi"}>
      {motivi.map((motivo) => (
        <li key={motivo} className="motivi__voce">
          <span className="motivi__spunta">
            <Icona nome="check" dimensione={grandi ? 13 : 12} />
          </span>
          {motivo}
        </li>
      ))}
    </ul>
  );
}

export default Motivi;
