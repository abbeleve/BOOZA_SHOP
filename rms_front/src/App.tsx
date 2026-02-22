import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from "./pages/MainPage";
import CartPage from "./pages/CartPage";

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/cart" element={<CartPage />} />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <Router />
    )
}

export default App
