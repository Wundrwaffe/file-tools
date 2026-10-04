import { useState } from 'react';

type TextTool = 'counter' | 'case' | 'dedup' | 'lorem' | 'translit' | 'json' | null;

export default function TextTools() {
  const [selectedTool, setSelectedTool] = useState<TextTool>(null);

  const tools = [
    { id: 'counter' as TextTool, icon: '📊', title: 'Счётчик слов', desc: 'Статистика текста' },
    { id: 'case' as TextTool, icon: '🔤', title: 'Конвертер регистра', desc: 'ВЕРХНИЙ, нижний, Заглавные' },
    { id: 'dedup' as TextTool, icon: '🗑️', title: 'Удаление дубликатов', desc: 'Убрать повторяющиеся строки' },
    { id: 'lorem' as TextTool, icon: '📝', title: 'Lorem Ipsum', desc: 'Генератор текста-заглушки' },
    { id: 'translit' as TextTool, icon: '', title: 'Транслитерация', desc: 'Кириллица ↔ Латиница' },
    { id: 'json' as TextTool, icon: '💻', title: 'JSON/XML форматтер', desc: 'Красивое форматирование' },
  ];

  if (selectedTool) {
    return (
      <div>
        <button 
          onClick={() => setSelectedTool(null)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Назад к инструментам
        </button>
        {selectedTool === 'counter' && <WordCounter />}
        {selectedTool === 'case' && <CaseConverter />}
        {selectedTool === 'dedup' && <Deduplicator />}
        {selectedTool === 'lorem' && <LoremGenerator />}
        {selectedTool === 'translit' && <Transliterator />}
        {selectedTool === 'json' && <JsonFormatter />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setSelectedTool(tool.id)}
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all text-left"
        >
          <div className="text-3xl mb-2">{tool.icon}</div>
          <h3 className="font-semibold text-gray-800">{tool.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
        </button>
      ))}
    </div>
  );
}

// 1. Счётчик слов и символов
function WordCounter() {
  const [text, setText] = useState('');
  
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const lines = text ? text.split('\n').length : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">📊 Счётчик слов и символов</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Вставьте текст сюда..."
        className="w-full h-64 p-4 border border-gray-300 rounded-lg mb-4 font-mono"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{words}</div>
          <div className="text-sm text-gray-600">Слов</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{chars}</div>
          <div className="text-sm text-gray-600">Символов</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{charsNoSpaces}</div>
          <div className="text-sm text-gray-600">Без пробелов</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{lines}</div>
          <div className="text-sm text-gray-600">Строк</div>
        </div>
      </div>
    </div>
  );
}

// 2. Конвертер регистра
function CaseConverter() {
  const [text, setText] = useState('');

  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());
  const toTitleCase = () => {
    setText(text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    ));
  };
  const toSentenceCase = () => {
    setText(text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase()));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4"> Конвертер регистра</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Вставьте текст..."
        className="w-full h-48 p-4 border border-gray-300 rounded-lg mb-4"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button onClick={toUpperCase} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          ВЕРХНИЙ
        </button>
        <button onClick={toLowerCase} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          нижний
        </button>
        <button onClick={toTitleCase} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Заглавные Буквы
        </button>
        <button onClick={toSentenceCase} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Как в предложении
        </button>
      </div>
    </div>
  );
}

// 3. Удаление дубликатов строк
function Deduplicator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const removeDuplicates = () => {
    const lines = text.split('\n');
    const unique = [...new Set(lines)];
    setResult(unique.join('\n'));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">🗑️ Удаление дубликатов строк</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Вставьте список (каждая строка с новой строки)..."
        className="w-full h-32 p-4 border border-gray-300 rounded-lg mb-4"
      />
      <button 
        onClick={removeDuplicates}
        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
      >
        Удалить дубликаты
      </button>
      {result && (
        <>
          <textarea
            value={result}
            readOnly
            className="w-full h-32 p-4 border border-gray-300 rounded-lg mb-2 bg-gray-50"
          />
          <button 
            onClick={copyResult}
            className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
             Скопировать результат
          </button>
        </>
      )}
    </div>
  );
}

// 4. Генератор Lorem Ipsum
function LoremGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [text, setText] = useState('');

  const loremTexts = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
  ];

  const generate = () => {
    const result = [];
    for (let i = 0; i < paragraphs; i++) {
      result.push(loremTexts[i % loremTexts.length]);
    }
    setText(result.join('\n\n'));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">📝 Генератор Lorem Ipsum</h2>
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium">Количество абзацев:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={paragraphs}
          onChange={(e) => setParagraphs(Number(e.target.value))}
          className="w-20 p-2 border border-gray-300 rounded"
        />
        <button 
          onClick={generate}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Сгенерировать
        </button>
      </div>
      {text && (
        <textarea
          value={text}
          readOnly
          className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-gray-50"
        />
      )}
    </div>
  );
}

// 5. Транслитерация
function Transliterator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [direction, setDirection] = useState<'ru-en' | 'en-ru'>('ru-en');

  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  const reverseMap = Object.fromEntries(
    Object.entries(translitMap).map(([k, v]) => [v, k])
  );

  const transliterate = () => {
    if (direction === 'ru-en') {
      setResult(text.toLowerCase().split('').map(c => translitMap[c] || c).join(''));
    } else {
      let res = text;
      Object.entries(reverseMap).forEach(([lat, cyr]) => {
        res = res.replace(new RegExp(lat, 'gi'), cyr);
      });
      setResult(res);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">🌐 Транслитерация</h2>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setDirection('ru-en')}
          className={`flex-1 p-3 rounded-lg ${direction === 'ru-en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Русский → English
        </button>
        <button
          onClick={() => setDirection('en-ru')}
          className={`flex-1 p-3 rounded-lg ${direction === 'en-ru' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          English → Русский
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={direction === 'ru-en' ? 'Введите текст на русском...' : 'Enter English text...'}
        className="w-full h-32 p-4 border border-gray-300 rounded-lg mb-4"
      />
      <button 
        onClick={transliterate}
        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
      >
        Транслитерировать
      </button>
      {result && (
        <textarea
          value={result}
          readOnly
          className="w-full h-32 p-4 border border-gray-300 rounded-lg bg-gray-50"
        />
      )}
    </div>
  );
}

// 6. JSON/XML форматтер
function JsonFormatter() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const formatJson = () => {
    try {
      const obj = JSON.parse(text);
      setResult(JSON.stringify(obj, null, 2));
      setError('');
    } catch (e) {
      setError('Невалидный JSON: ' + (e as Error).message);
      setResult('');
    }
  };

  const formatXml = () => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      setResult(formatted);
      setError('');
    } catch (e) {
      setError('Невалидный XML');
      setResult('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">💻 JSON/XML форматтер</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Вставьте JSON или XML...'
        className="w-full h-48 p-4 border border-gray-300 rounded-lg mb-4 font-mono text-sm"
      />
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button 
          onClick={formatJson}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Форматировать JSON
        </button>
        <button 
          onClick={formatXml}
          className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Форматировать XML
        </button>
      </div>
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}
      {result && (
        <pre className="p-4 bg-gray-50 border border-gray-300 rounded-lg overflow-auto max-h-96 text-sm">
          {result}
        </pre>
      )}
    </div>
  );
}