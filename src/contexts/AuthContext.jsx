import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Mock users database
const mockUsers = [
  { id: 1, email: 'admin@lumen.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { id: 2, email: 'user@lumen.com', password: 'user123', role: 'user', name: 'John Doe' },
  { id: 3, email: 'driver@lumen.com', password: 'driver123', role: 'driver', name: 'Driver User' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('lumen_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      if (foundUser) {
        const userData = { ...foundUser };
        delete userData.password;
        setUser(userData);
        localStorage.setItem('lumen_user', JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true };
      } else {
        toast.error('Invalid email or password');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name, role = 'user') => {
    try {
      // Check if user already exists
      if (mockUsers.find(u => u.email === email)) {
        toast.error('User already exists');
        return { success: false, error: 'User already exists' };
      }

      const newUser = {
        id: mockUsers.length + 1,
        email,
        password,
        role,
        name,
      };
      mockUsers.push(newUser);
      
      const userData = { ...newUser };
      delete userData.password;
      setUser(userData);
      localStorage.setItem('lumen_user', JSON.stringify(userData));
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumen_user');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    isDriver: user?.role === 'driver',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

