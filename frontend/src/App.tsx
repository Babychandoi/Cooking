import React from 'react';
import './App.css';
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { indexRouter } from './router/indexRouter';
import { authRouter } from './router/authRouter';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './component/AuthContext';
import { BranchProvider } from './component/BranchContext';
function AppRouter() {
  const routes = useRoutes([...authRouter, indexRouter]);
  return routes;
}

function App() {
  
  return (
    <AuthProvider>
      <BranchProvider>
        <Router>
          <AppRouter />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </Router>
      </BranchProvider>
    </AuthProvider>
  );
}

export default App;