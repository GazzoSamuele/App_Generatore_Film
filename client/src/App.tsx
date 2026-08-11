import { useState } from 'react';
import Splash from './components/Splash';
import ListaConsigli from './components/ListaConsigli';
import './App.scss'


function App() {
  type Schermata = "splash" | "consigli";
  const [schermata, setSchermata] = useState<Schermata>("splash");

  return (
    <div className="App">
      {schermata === "splash" && (
        <Splash onScegliPerMe={() => setSchermata("consigli")} />
      )}
      {schermata === "consigli" && <ListaConsigli />}
    </div>
  );
  
}

export default App
