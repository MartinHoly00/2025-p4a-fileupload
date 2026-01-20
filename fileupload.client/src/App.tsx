import { Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import FilesPage from './pages/FilesPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/files" element={<FilesPage />} />
    </Routes>
  );
}

export default App;