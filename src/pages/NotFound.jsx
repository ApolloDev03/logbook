import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { darkMode } = useApp();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900 p-6">
      <img
        src={darkMode ? '/images/error/404-dark.svg' : '/images/error/404.svg'}
        alt="404"
        className="mb-8 max-w-sm w-full"
        onError={e => { e.target.style.display = 'none'; }}
      />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">404 - Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')} className="btn-primary px-8 py-3">Back to Dashboard</button>
    </div>
  );
}
