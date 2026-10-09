import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import Admin from './pages/Admin.tsx'
import ContactPage from './pages/ContactPage.tsx'
import Home from './pages/Home.tsx'
import LocationPage from './pages/LocationPage.tsx'
import MenuPage from './pages/MenuPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="ubicacion" element={<LocationPage />} />
        <Route path="contacto" element={<ContactPage />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
