import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import RouteConfig from './routes/routes';
import { useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import './styles.css'; 

const App = () => {
  const location = useLocation();
  
  const getBackgroundClass = () => {
    switch (location.pathname) {
      case '/':
        return 'home-background';
      case '/signup':
        return 'signup-background';
      case '/dashboard':
        return 'dashboard-background';
      case '/login':
        return 'login-background';
      default:
        return 'home-background';
    }
  };

  return (
    <div className={`page-container ${getBackgroundClass()}`}>
      <NavBar />
      <Routes>
        {RouteConfig.map(({ path, component: Component }, index) => (
          <Route key={index} path={path} element={<Component />} />
        ))}
      </Routes>
    </div>
  );
};


export default App;