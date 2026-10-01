import { useState } from 'react';
import DropZone from './DropZone';
import Compressor from './Compressor';
import MetadataCleaner from './MetadataCleaner';
import Encryptor from './Encryptor';
import Hasher from './Hasher';
import AdBlock from './AdBlock';
import PartnerCard from './PartnerCard';
import SEOContent from './SEOContent';

type Tool = 'compress' | 'metadata' | 'encrypt' | 'hash' | null;

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>(null);
  const [files, setFiles] = useState<File[]>([]);

  const tools = [
    { id: 'compress' as Tool, icon: '🗜️', title: 'Сжатие', desc: 'JPG/PNG/WebP' },
    { id: 'metadata' as Tool, icon: '🧹', title: 'Очистка метаданных', desc: 'Удаление EXIF, GPS' },
    { id: 'encrypt' as Tool, icon: '', title: 'Шифрование', desc: 'Пароль + HTML-контейнер' },
    { id: 'hash' as Tool, icon: '#️⃣', title: 'Генератор хешей', desc: 'MD5, SHA-1, SHA-256, SHA-512' },
  ];

  const partners = [
    {
      name: 'Cloudflare Pages',
      description: 'Бесплатный хостинг для статических сайтов с CDN по всему миру',
      url: 'https://pages.cloudflare.com',
      icon: '☁️'
    },
    {
      name: 'Vercel',
      description: 'Деплой фронтенд-проектов за секунды с автоматическим CI/CD',
      url: 'https://vercel.com',
      icon: '▲'
    },
    {
      name: 'GitHub',
      description: 'Храните код проекта и настройте автоматический деплой',
      url: 'https://github.com',
      icon: '🐙'
    }
  ];

  // Главная страница
  if (!selectedTool) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="text-center py-12 px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Локальные инструменты для файлов</h1>
          <p className="text-gray-600 text-lg">Всё работает локально в браузере. Ваши файлы никуда не загружаются.</p>
        </header>

        {/* Рекламный баннер сверху */}
        <div className="max-w-2xl mx-auto w-full px-4">
          <AdBlock title="📢 Рекламное место" description="Google Ads / Яндекс.Директ" variant="banner" />
        </div>

        <main className="flex-1 px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-blue-50 transition-all border border-gray-200"
              >
                <span className="text-3xl mb-3">{tool.icon}</span>
                <span className="text-xl font-semibold text-gray-800">{tool.title}</span>
                <span className="text-sm text-gray-500 mt-2">{tool.desc}</span>
              </button>
            ))}
          </div>

          {/* Партнёрские карточки */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Рекомендуемые сервисы</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {partners.map((partner, idx) => (
                <PartnerCard key={idx} {...partner} />
              ))}
            </div>
          </div>

          {/* SEO контент для поисковиков */}
          <SEOContent />
        </main>

        {/* Футер */}
        <footer className="bg-gray-800 text-gray-300 py-8 px-4 mt-auto">
          <div className="max-w-4xl mx-auto text-center">
            <p className="mb-2">© 2026 Локальные инструменты для файлов</p>
            <p className="text-sm text-gray-500">
              Все операции выполняются в вашем браузере. Мы не сохраняем и не передаём ваши файлы.
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm flex-wrap">
              <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-white transition-colors">Условия использования</a>
              <a href="#" className="hover:text-white transition-colors">Контакты</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Страница инструмента
  const currentTool = tools.find(t => t.id === selectedTool);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <button 
          onClick={() => { setSelectedTool(null); setFiles([]); }}
          className="self-start mb-6 flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Назад к выбору инструмента
        </button>
        
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {currentTool?.icon} {currentTool?.title}
          </h1>
          <p className="text-gray-600">{currentTool?.desc}</p>
        </header>

        <DropZone onFilesSelected={setFiles} />

        <div className="w-full max-w-3xl mx-auto mt-8">
          {selectedTool === 'compress' && <Compressor files={files} />}
          {selectedTool === 'metadata' && <MetadataCleaner files={files} />}
          {selectedTool === 'encrypt' && <Encryptor files={files} />}
          {selectedTool === 'hash' && <Hasher files={files} />}
        </div>

        {/* Рекламный блок под результатами обработки — главное место для РСЯ */}
        {files.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <AdBlock title="📢 Рекламное место" description="Яндекс РСЯ" variant="banner" />
          </div>
        )}
      </div>

      {/* Футер */}
      <footer className="bg-gray-800 text-gray-300 py-6 px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© 2026 Локальные инструменты для файлов</p>
          <p className="text-gray-500 mt-1">Все операции выполняются в вашем браузере</p>
        </div>
      </footer>
    </div>
  );
}

export default App;