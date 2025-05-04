// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Homepage";
import RegisterPage from "./pages/auth/Register";
import LoginPage from "./pages/auth/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CountryDetails from "./pages/CountryDetails";
import AllCountries from "./pages/AllCountries";
import RegionsPage from "./pages/RegionsPage";
import FavoritesPage from "./pages/Favorites";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Routes>
        <Route
          path="/auth/register"
          element={
            <>
              <Header />
              <RegisterPage />
            </>
          }
        />
        <Route
          path="/auth/login"
          element={
            <>
              <Header />
              <LoginPage />
            </>
          }
        />
        <Route
          path="/countries/:code"
          element={
            <>
              <Header />
              <CountryDetails />
              <Footer />
            </>
          }
        />
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/countries"
          element={
            <>
              <Header />
              <AllCountries />
              <Footer />
            </>
          }
        />
        <Route
          path="/regions"
          element={
            <>
              <Header />
              <RegionsPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/favorites"
          element={
            <>
              <Header />
              <FavoritesPage />
              <Footer />
            </>
          }
        />
        {/* You can add other routes here in the same way */}
      </Routes>
    </div>
  );
}
