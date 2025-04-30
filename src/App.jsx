import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Spaces from './pages/spaces/Spaces';
import SpaceDetail from './pages/spaces/SpaceDetail';
import MeetingDetail from './pages/meetings/MeetingDetail';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div>
                    <Navbar />
                    <Spaces />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/spaces/:spaceId"
              element={
                <PrivateRoute>
                  <div>
                    <Navbar />
                    <SpaceDetail />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/spaces/:spaceId/meetings/:meetingId"
              element={
                <PrivateRoute>
                  <div>
                    <Navbar />
                    <MeetingDetail />
                  </div>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
