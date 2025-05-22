import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Credential/Login';
import Signup from './components/Credential/Signup';
import FileUplode from './components/fileuplode/FileUplode';
import PdfUploder from './components/pdfuploder/PdfUploder';
import { Uploder } from './components/uploder/Uploder';




function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' />
        <Route path='/uploder' element={<Uploder />}/>
        <Route path='/signin' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path="/file" element={<FileUplode />} />
        <Route path="/pdf-compressser" element={<PdfUploder />} />
      </Routes>
    </div>
  );
}

export default App;
