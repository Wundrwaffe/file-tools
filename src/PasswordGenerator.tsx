import { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let chars = '';
    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeAmbiguous) {
      chars = chars.replace(/[0OoIl1]/g, '');
    }

    if (chars === '') {
      setPassword('');
      return;
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    setPassword(result);
    setCopied(false);
  };

  // Генерируем пароль при первом запуске и при изменении настроек
  useEffect(() => {
    if (!password) {
      generatePassword();
    }
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Оценка надёжности через zxcvbn
  const getStrength = () => {
    if (!password) {
      return { label: 'Введите пароль', color: 'bg-gray-300', width: '0%', time: '' };
    }
    
    const result = zxcvbn(password);
    const score = result.score; // 0 to 4
    
    const labels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный'];
    const colors = ['bg-red-600', 'bg-red-400', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    
    // Форматируем время взлома
    let timeText = result.crack_times_display.offline_fast_hashing_1e10_per_second;
    if (timeText === 'less than a second') timeText = 'Мгновенно';
    else if (timeText.includes('century')) timeText = timeText.replace('century', 'века').replace('centuries', 'веков');
    else if (timeText.includes('year')) timeText = timeText.replace('years', 'лет').replace('year', 'год');
    else if (timeText.includes('day')) timeText = timeText.replace('days', 'дней').replace('day', 'день');
    else if (timeText.includes('hour')) timeText = timeText.replace('hours', 'часов').replace('hour', 'час');
    else if (timeText.includes('minute')) timeText = timeText.replace('minutes', 'минут').replace('minute', 'минуту');
    else if (timeText.includes('second')) timeText = timeText.replace('seconds', 'секунд').replace('second', 'секунду');

    return { 
      label: labels[score], 
      color: colors[score], 
      width: widths[score],
      time: `Время взлома: ${timeText}`
    };
  };

  const strength = getStrength();

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4"> Генератор паролей</h2>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setCopied(false); }}
            placeholder="Введите или сгенерируйте пароль..."
            className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg"
          />
          <button
            onClick={copyToClipboard}
            disabled={!password}
            className={`px-4 py-3 rounded-lg transition-colors ${
              password ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="Скопировать"
          >
            {copied ? '✓' : '📋'}
          </button>
          <button
            onClick={generatePassword}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Сгенерировать новый"
          >
            
          </button>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
          <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }}></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Надёжность: <strong className="text-gray-800">{strength.label}</strong></span>
          <span className="text-gray-500 font-mono">{strength.time}</span>
        </div>
        {strength.label === 'Очень слабый' && password && (
          <p className="text-xs text-red-600 mt-1">⚠️ Этот пароль слишком простой или распространённый.</p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Длина пароля</span>
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{length}</span>
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={useUppercase} onChange={(e) => setUseUppercase(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm">Заглавные (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={useLowercase} onChange={(e) => setUseLowercase(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm">Строчные (a-z)</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm">Цифры (0-9)</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm">Символы (!@#)</span>
          </label>
        </div>

        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
          <span className="text-sm">Исключить похожие символы (0, O, l, 1)</span>
        </label>
      </div>
    </div>
  );
}