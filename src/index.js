import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Navbar";
import Home from "./pages/Home";
import Mathematics from "./pages/Mathematics";
import Calculus1 from "./pages/Calculus1";
import NoPage from "./pages/NoPage";
import Navbar from "./pages/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<Home />} />
          <Route path="math" element={<Mathematics />}>
            <Route path="calculus1" element={<Calculus1 />} />
          </Route>
          <Route path="*" element={<NoPage />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);