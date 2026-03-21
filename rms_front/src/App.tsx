import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from "./pages/MainPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrdersControlPage from "./pages/administration/OrdersControlPage";
import MenuControlPage from "./pages/administration/MenuControlPage";
import AnalyticsPage from "./pages/administration/AnalyticsPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/orders" element={
                    <ProtectedRoute requiredRole="staff">
                        <OrdersControlPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/menu" element={
                    <ProtectedRoute requiredRole="staff">
                        <MenuControlPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                    <ProtectedRoute requiredRole="staff">
                        <AnalyticsPage />
                    </ProtectedRoute>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return <Router />
}

export default App;