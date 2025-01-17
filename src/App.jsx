import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Cookies from 'js-cookie';
import SignUp from "./auth/SignUp";
import Login from "./auth/Login";
import MyTodo from "./MyTodo";
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = Cookies.get('mytodo-access-token');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && !token) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <MyTodo />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;