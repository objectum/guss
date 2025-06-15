import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RoundList from './pages/RoundList';
import Round from './pages/Round';

function App() {
    return (
        <ConfigProvider locale={ruRU}>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route
                            path="/rounds"
                            element={
                                <ProtectedRoute>
                                    <RoundList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/round/:id"
                            element={
                                <ProtectedRoute>
                                    <Round />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </ConfigProvider>
    );
}

export default App;
