import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';
import { CartProvider } from "@/contexts/CartContext";
import { UserProvider } from "@/contexts/UserContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <UserProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </UserProvider>
    </React.StrictMode>,
);