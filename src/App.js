import logo from './assets/logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from "react-router-dom";
import './App.css';
import About from './pages/about.jsx';
import Education from './pages/edu.jsx';
import Experience from './pages/experience.jsx';
import Projects from './pages/projects.jsx';
import Home from './pages/home.jsx';
import Nav from './components/header.jsx';

function App() {
  return (
    <div className="App">
      <Router>
        <Nav/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/edu" element={<Education />} />
          <Route path="/exp" element={<Experience />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </Router>
       
    </div>
  );
}

export default App;
