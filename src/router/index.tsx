import { createBrowserRouter } from 'react-router';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import NotFound from '@/components/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);