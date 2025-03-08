import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { PrivateRoute, PublicOnlyRoute } from './components/protected-routes';
import { UserProvider } from './contexts/user-provider';
import NavLayout from './layouts/nav-layouts';
import AuthCallback from './pages/account/auth-callback';
import EmailVerification from './pages/account/email-verifcation';
import Login from './pages/account/login';
import RequestPasswordReset from './pages/account/request-password-reset';
import ResetPassword from './pages/account/reset-password';
import Home from './pages/home';
import NotFound from './pages/not-found';
import SignUp from './pages/signup';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NavLayout />}>
            <Route element={<PrivateRoute />}>
              <Route index element={<Home />} />
            </Route>
            <Route element={<PublicOnlyRoute />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="forgot-password" element={<RequestPasswordReset />} />
            </Route>
            <Route path="auth/callback" element={<AuthCallback />} />
            <Route path="auth/reset-password" element={<ResetPassword />} />
            <Route path="auth/verify-email" element={<EmailVerification />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
