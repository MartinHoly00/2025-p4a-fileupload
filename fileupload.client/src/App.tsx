import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FilesPage from './pages/FilesPage';
import DirectoriesPage from './pages/DirectoriesPage';
import DirectoryFilesPage from './pages/DirectoryFilesPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/files" element={<FilesPage />} />
      <Route path="/directories" element={<DirectoriesPage />} />
      <Route path="/directory/:id" element={<DirectoryFilesPage />} />
    </Routes>
  );
}

export default App;