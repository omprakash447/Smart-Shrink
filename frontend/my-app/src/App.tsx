import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Uploder } from './components/uploder/Uploder';




function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' />
        <Route path='/uploder' element={<Uploder />}/>
      </Routes>
    </div>
  );
}

export default App;
