import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Subscriptions from "./pages/Subscriptions";
import Users from "./pages/Users";
import ServiceableAreas from "./pages/ServiceableAreas";

export default function App() {
  return (
    <Routes>
       <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}> 
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/users" element={<Users />} />
          <Route path="/areas" element={<ServiceableAreas />} />
        </Route>
       </Route> 
    </Routes>
  );
}
