import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from "./pages/MainPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MenuControlPage from "./pages/administration/MenuControlPage";

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/menu" element={<MenuControlPage />} />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return <Router />
}

export default App;