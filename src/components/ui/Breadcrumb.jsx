import { NavLink } from 'react-router-dom';
export default function Breadcrumb({ pageName, parentPage }) {
  return (
    <div className="breadcrumb mb-6">
      <NavLink to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Dashboard</NavLink>
      <span className="text-gray-400">/</span>
      {parentPage && <><span className="text-gray-500 dark:text-gray-400">{parentPage}</span><span className="text-gray-400">/</span></>}
      <span className="font-medium text-gray-800 dark:text-white/90">{pageName}</span>
    </div>
  );
}
