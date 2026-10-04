import { Link } from 'react-router-dom';
import PasswordGenerator from '../../PasswordGenerator';

export default function PasswordGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Хлебные крошки */}
      <nav className="bg-gray-100 border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm">
          <Link to="/" className="text-blue-600 hover:underline">Главная</Link>
          <span className="text-gray-400">/</span>
          <Link to="/security" className="text-blue-600 hover:underline">Безопасность</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Генератор паролей</span>
        </div>
      </nav>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <PasswordGenerator />
      </div>

      <footer className="bg-gray-800 text-gray-300 py-6 px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© 2026 <strong>YourSecure</strong></p>
        </div>
      </footer>
    </div>
  );
}