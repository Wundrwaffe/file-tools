import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useDocumentTitle } from './useDocumentTitle';
import PrivacyPolicy from './PrivacyPolicy';
import DropZone from './DropZone';
import Compressor from './Compressor';
import MetadataCleaner from './MetadataCleaner';
import Encryptor from './Encryptor';
import Hasher from './Hasher';
import AdBlock from './AdBlock';
import SEOContent from './SEOContent';
import PasswordGenerator from './PasswordGenerator';
import PasswordChecker from './PasswordChecker';
import PassphraseGenerator from './PassphraseGenerator';
import TextTools from './TextTools';
import ImageTools from './ImageTools';
import PdfTools from './PdfTools';
import Archiver from './Archiver';

type Tool = 'compress' | 'metadata' | 'encrypt' | 'hash' | 'password' | 'checker' | 'passphrase' | 'text' | 'images' | 'pdf' | 'archive' | null;

const fileTools = ['compress', 'metadata', 'encrypt', 'hash'];

const tools = [
  { 
    id: 'compress' as Tool, 
    path: '/compress', 
    icon: '🗜️', 
    title: 'Сжатие изображений', 
    desc: 'JPG/PNG/WebP', 
    category: 'Картинки',
    seo: {
      title: 'Сжатие изображений онлайн — JPG, PNG, WebP | YourSecure',
      description: 'Бесплатное сжатие изображений JPG, PNG, WebP прямо в браузере. Файлы не загружаются на сервер. Настройка качества, пакетная обработка, скачивание ZIP.'
    }
  },
  { 
    id: 'metadata' as Tool, 
    path: '/metadata', 
    icon: '🧹', 
    title: 'Очистка метаданных', 
    desc: 'Удаление EXIF, GPS', 
    category: 'Картинки',
    seo: {
      title: 'Удаление метаданных EXIF и GPS с фото онлайн | YourSecure',
      description: 'Удалите скрытые метаданные (EXIF, GPS, модель камеры) с фотографий. Всё работает локально в браузере — файлы никуда не отправляются.'
    }
  },
  { 
    id: 'encrypt' as Tool, 
    path: '/encrypt', 
    icon: '🔒', 
    title: 'Шифрование файлов', 
    desc: 'Пароль + HTML-контейнер', 
    category: 'Безопасность',
    seo: {
      title: 'Шифрование файлов паролем онлайн | YourSecure',
      description: 'Зашифруйте файлы паролем с помощью AES-256. Создайте самораспаковывающийся HTML-контейнер. Всё работает локально в браузере.'
    }
  },
  { 
    id: 'hash' as Tool, 
    path: '/hash', 
    icon: '#️⃣', 
    title: 'Генератор хешей', 
    desc: 'MD5, SHA-1, SHA-256, SHA-512', 
    category: 'Безопасность',
    seo: {
      title: 'Генератор хешей MD5, SHA-1, SHA-256, SHA-512 онлайн | YourSecure',
      description: 'Вычислите хеш-сумму файлов (MD5, SHA-1, SHA-256, SHA-512) для проверки целостности. Работает локально в браузере без загрузки файлов.'
    }
  },
  { 
    id: 'password' as Tool, 
    path: '/password-generator', 
    icon: '🔐', 
    title: 'Генератор паролей', 
    desc: 'Надёжные пароли', 
    category: 'Безопасность',
    seo: {
      title: 'Генератор надёжных паролей онлайн | YourSecure',
      description: 'Создавайте криптографически стойкие пароли с оценкой надёжности zxcvbn. Показывает время взлома. Всё работает локально в браузере.'
    }
  },
  { 
    id: 'checker' as Tool, 
    path: '/password-checker', 
    icon: '🔍', 
    title: 'Проверка пароля на утечки', 
    desc: 'Have I Been Pwned', 
    category: 'Безопасность',
    seo: {
      title: 'Проверка пароля на утечки онлайн | YourSecure',
      description: 'Проверьте, не был ли ваш пароль скомпрометирован в утечках данных (Have I Been Pwned). Метод k-anonymity — пароль никогда не покидает браузер.'
    }
  },
  { 
    id: 'passphrase' as Tool, 
    path: '/passphrase', 
    icon: '🎲', 
    title: 'Генератор passphrase', 
    desc: 'Diceware метод', 
    category: 'Безопасность',
    seo: {
      title: 'Генератор passphrase (Diceware) онлайн | YourSecure',
      description: 'Создавайте запоминающиеся парольные фразы из случайных слов по методу Diceware. Криптографически стойкая генерация. Энтропия в реальном времени.'
    }
  },
  { 
    id: 'text' as Tool, 
    path: '/text-tools', 
    icon: '📝', 
    title: 'Текстовые утилиты', 
    desc: '6 инструментов для текста', 
    category: 'Текст',
    seo: {
      title: 'Текстовые утилиты онлайн: счётчик слов, транслит, JSON | YourSecure',
      description: 'Набор текстовых инструментов: счётчик слов и символов, конвертер регистра, удаление дубликатов, Lorem Ipsum, транслитерация, форматтер JSON/XML.'
    }
  },
  { 
    id: 'images' as Tool, 
    path: '/image-tools', 
    icon: '🖼️', 
    title: 'Инструменты для картинок', 
    desc: 'Конвертер, resize, crop', 
    category: 'Картинки',
    seo: {
      title: 'Инструменты для обработки изображений онлайн | YourSecure',
      description: 'Конвертер HEIC в JPG, изменение размера с пресетами соцсетей, обрезка с пропорциями, размытие sensitive-данных. Всё работает локально в браузере.'
    }
  },
  { 
    id: 'pdf' as Tool, 
    path: '/pdf-tools', 
    icon: '📄', 
    title: 'PDF инструменты', 
    desc: 'Объединить, разделить, конвертировать', 
    category: 'PDF',
    seo: {
      title: 'PDF инструменты онлайн: объединить, разделить, конвертировать | YourSecure',
      description: 'Объедините несколько PDF в один, разделите PDF на страницы, конвертируйте PDF в JPG. Всё работает локально в браузере без загрузки файлов.'
    }
  },
  { 
    id: 'archive' as Tool, 
    path: '/archive', 
    icon: '📦', 
    title: 'Архиватор ZIP', 
    desc: 'ZIP архивация и разархивация', 
    category: 'Архивы',
    seo: {
      title: 'Архиватор ZIP онлайн: сжатие и разархивация | YourSecure',
      description: 'Создавайте ZIP-архивы с папками и разархивируйте файлы онлайн. Поддержка File System Access API для сохранения в настоящую папку. Всё локально.'
    }
  },
];

// Компонент навигации (хлебные крошки)
function Breadcrumbs({ toolId }: { toolId: Tool }) {
  const tool = tools.find(t => t.id === toolId);
  if (!tool) return null;
  return (
    <nav className="bg-gray-100 border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm">
        <Link to="/" className="text-blue-600 hover:underline">Главная</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{tool.title}</span>
      </div>
    </nav>
  );
}

// Компонент страницы инструмента
function ToolPage({ toolId }: { toolId: Tool }) {
  const [files, setFiles] = useState<File[]>([]);
  const tool = tools.find(t => t.id === toolId);
  const isFileTool = fileTools.includes(toolId as string);

  // Динамическое SEO для страницы инструмента
  useDocumentTitle(
    tool?.seo?.title || 'YourSecure',
    tool?.seo?.description
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Breadcrumbs toolId={toolId} />
      <div className="flex-1 p-4 md:p-8">
        <Link to="/" className="self-start mb-6 flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors">
          ← Все инструменты
        </Link>
        
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {tool?.icon} {tool?.title}
          </h1>
          <p className="text-gray-600">{tool?.desc}</p>
        </header>

        {isFileTool && <DropZone onFilesSelected={setFiles} />}

        <div className="w-full max-w-3xl mx-auto mt-8">
          {toolId === 'compress' && <Compressor files={files} />}
          {toolId === 'metadata' && <MetadataCleaner files={files} />}
          {toolId === 'encrypt' && <Encryptor files={files} />}
          {toolId === 'hash' && <Hasher files={files} />}
          {toolId === 'password' && <PasswordGenerator />}
          {toolId === 'checker' && <PasswordChecker />}
          {toolId === 'passphrase' && <PassphraseGenerator />}
          {toolId === 'text' && <TextTools />}
          {toolId === 'images' && <ImageTools />}
          {toolId === 'pdf' && <PdfTools />}
          {toolId === 'archive' && <Archiver />}
        </div>

        {isFileTool && files.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <AdBlock blockId="R-A-20154437-1" variant="banner" />
          </div>
        )}
      </div>

      <footer className="bg-gray-800 text-gray-300 py-6 px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© 2026 <strong>YourSecure</strong></p>
          <p className="text-gray-500 mt-1">Все операции выполняются в вашем браузере</p>
        </div>
      </footer>
    </div>
  );
}

// Главная страница
function HomePage() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Динамическое SEO для главной страницы
  useDocumentTitle(
    'YourSecure — Локальные инструменты для файлов и безопасности',
    'Бесплатные онлайн-инструменты для работы с файлами: сжатие изображений, шифрование, генератор паролей, PDF, архиватор. Всё работает локально в браузере без загрузки файлов.'
  );

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  // Группируем по категориям
  const categories = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="text-center py-12 px-4">
        <div className="mb-4">
          <span className="text-5xl">🔐</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Your<span className="text-blue-600">Secure</span>
        </h1>
        <p className="text-gray-600 text-lg mb-2">Локальные инструменты для файлов и безопасности</p>
        <p className="text-gray-500 text-base">Всё работает в браузере. Ваши данные никуда не загружаются.</p>
      </header>

      <div className="max-w-2xl mx-auto w-full px-4 mb-8">
        <AdBlock blockId="R-A-20154437-1" variant="banner" />
      </div>

      <main className="flex-1 px-4 pb-12 max-w-6xl mx-auto w-full">
        {Object.entries(categories).map(([category, categoryTools]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-blue-50 transition-all border border-gray-200"
                >
                  <span className="text-3xl mb-3">{tool.icon}</span>
                  <span className="text-xl font-semibold text-gray-800">{tool.title}</span>
                  <span className="text-sm text-gray-500 mt-2">{tool.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <SEOContent />
      </main>

      <footer className="bg-gray-800 text-gray-300 py-8 px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-2">© 2026 <strong>YourSecure</strong></p>
          <p className="text-sm text-gray-500">
            Все операции выполняются в вашем браузере. Мы не сохраняем и не передаём ваши данные.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm flex-wrap">
            <button 
              onClick={() => setShowPrivacy(true)} 
              className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer font-inherit text-sm"
            >
              Политика конфиденциальности
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Главный роутер
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/compress" element={<ToolPage toolId="compress" />} />
        <Route path="/metadata" element={<ToolPage toolId="metadata" />} />
        <Route path="/encrypt" element={<ToolPage toolId="encrypt" />} />
        <Route path="/hash" element={<ToolPage toolId="hash" />} />
        <Route path="/password-generator" element={<ToolPage toolId="password" />} />
        <Route path="/password-checker" element={<ToolPage toolId="checker" />} />
        <Route path="/passphrase" element={<ToolPage toolId="passphrase" />} />
        <Route path="/text-tools" element={<ToolPage toolId="text" />} />
        <Route path="/image-tools" element={<ToolPage toolId="images" />} />
        <Route path="/pdf-tools" element={<ToolPage toolId="pdf" />} />
        <Route path="/archive" element={<ToolPage toolId="archive" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;