import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import LoginForm from './components/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
    </Routes>
  );
}

export default App;
