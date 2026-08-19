import { useState } from 'react';
import Splash from './components/Splash';
import ListaConsigli from './components/ListaConsigli';
import './App.scss'
import Preferenze from './components/Preferenze';


function App() {
  type Schermata = "splash" | "preferenze" | "consigli";
  const [schermata, setSchermata] = useState<Schermata>("splash");

  return (
    <div className="App">
      {schermata === "splash" && (
        <Splash 
          onScegliPerMe={() => setSchermata("consigli")} 
          onScegliGeneri={() => setSchermata("preferenze")} 
        />
      )}
      {schermata === "consigli" && (
        <ListaConsigli onIndietro={() => setSchermata("splash")} />
      )}
      {schermata === "preferenze" && (
        <Preferenze onSalvato={() => setSchermata("consigli")} />
      )}  
    </div>
  );
}

export default App
