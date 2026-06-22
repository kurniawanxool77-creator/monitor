import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppDataProvider } from './hooks/AppDataContext';

export default function App() {
  return (
    <AppDataProvider>
      <RouterProvider router={router} />
    </AppDataProvider>
  );
}