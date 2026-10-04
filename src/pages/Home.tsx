import { Link } from 'react-router-dom';

export default function Home() {
  const tools = [
    { 
      path: '/security/password-generator', 
      icon: '🔐', 
      title: 'Генератор паролей', 
      desc: 'Надёжные пароли с оценкой zxcvbn',
      category: 'Безопасность'
    },
    { 
      path: '/security/password-checker', 
      icon: '', 
      title: 'Проверка утечек', 
      desc: 'Have I Been Pwned',
      category: 'Безопасность'
    },
    { 
      path: '/security/passphrase', 
      icon: '🎲', 
      title: 'Passphrase', 
      desc: 'Diceware метод',
      category: 'Безопасность'
    },
    { 
      path: '/images/compressor', 
      icon: '🗜️', 
      title: 'Сжатие', 
      desc: 'JPG/PNG/WebP',
      category: 'Картинки'
    },
    { 
      path: '/images/metadata', 
      icon: '', 
      title: 'Очистка метаданных', 
      desc: 'Удаление EXIF, GPS',
      category: 'Картинки'
    },
    { 
      path: '/images/heic-converter', 
      icon: '📱', 
      title: 'HEIC → JPG', 
      desc: 'Конвертер фото с iPhone',
      category: 'Картинки'
    },
    { 
      path: '/images/resizer', 
      icon: '📐', 
      title: 'Изменение размера', 
      desc: 'Resize с пресетами',
      category: 'Картинки'
    },
    { 
      path: '/images/cropper', 
      icon: '✂️', 
      title: 'Обрезка', 
      desc: 'Crop с пропорциями',
      category: 'Картинки'
    },
    { 
      path: '/images/blur', 
      icon: '🔒', 
      title: 'Размытие данных', 
      desc: 'Скрыть номера, лица',
      category: 'Картинки'
    },
    { 
      path: '/pdf/merger', 
      icon: '📎', 
      title: 'Объединить PDF', 
      desc: 'Несколько файлов в один',
      category: 'PDF'
    },
    { 
      path: '/pdf/splitter', 
      icon: '✂️', 
      title: 'Разделить PDF', 
      desc: 'Извлечь нужные страницы',
      category: 'PDF'
    },
    { 
      path: '/pdf/to-image', 
      icon: '🖼️', 
      title: 'PDF → JPG', 
      desc: 'Страницы в изображения',
      category: 'PDF'
    },
    { 
      path: '/text/tools', 
      icon: '', 
      title: 'Текстовые утилиты', 
      desc: '6 инструментов для текста',
      category: 'Текст'
    },
    { 
      path: '/archive', 
      icon: '📦', 
      title: 'Архиватор', 
      desc: 'ZIP архивация и разархивация',
      category: 'Архивы'
    },
  ];

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
          <span className="text-5xl"></span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Your<span className="text-blue-600">Secure</span>
        </h1>
        <p className="text-gray-600 text-lg mb-2">Локальные инструменты для файлов и безопасности</p>
        <p className="text-gray-500 text-base">Всё работает в браузере. Ваши данные никуда не загружаются.</p>
      </header>

      <main className="flex-1 px-4 pb-12 max-w-6xl mx-auto w-full">
        {Object.entries(categories).map(([category, tools]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Link
                  key={tool.path}
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
      </main>

      <footer className="bg-gray-800 text-gray-300 py-8 px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-2">© 2026 <strong>YourSecure</strong></p>
          <p className="text-sm text-gray-500">
            Все операции выполняются в вашем браузере. Мы не сохраняем и не передаём ваши данные.
          </p>
        </div>
      </footer>
    </div>
  );
}