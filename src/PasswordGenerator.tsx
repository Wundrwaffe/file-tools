import { useState, useEffect } from 'react';

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

  useEffect(() => {
    generatePassword();
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    const entropy = length * Math.log2(
      (useUppercase ? 26 : 0) +
      (useLowercase ? 26 : 0) +
      (useNumbers ? 10 : 0) +
      (useSymbols ? 26 : 0)
    );
    if (entropy < 40) return { label: 'Слабый', color: 'bg-red-500', width: '25%' };
    if (entropy < 60) return { label: 'Средний', color: 'bg-yellow-500', width: '50%' };
    if (entropy < 80) return { label: 'Хороший', color: 'bg-blue-500', width: '75%' };
    return { label: 'Отличный', color: 'bg-green-500', width: '100%' };
  };

  const strength = getStrength();

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Генератор паролей</h2>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={password}
            readOnly
            className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? '✓' : '📋'}
          </button>
          <button
            onClick={generatePassword}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄
          </button>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${strength.color} transition-all`} style={{ width: strength.width }}></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">Надёжность: <strong>{strength.label}</strong></p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Длина пароля</span>
            <span className="font-mono">{length}</span>
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={useUppercase} onChange={(e) => setUseUppercase(e.target.checked)} />
            <span className="text-sm">Заглавные (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={useLowercase} onChange={(e) => setUseLowercase(e.target.checked)} />
            <span className="text-sm">Строчные (a-z)</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
            <span className="text-sm">Цифры (0-9)</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
            <span className="text-sm">Символы (!@#)</span>
          </label>
        </div>

        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
          <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} />
          <span className="text-sm">Исключить похожие символы (0, O, l, 1)</span>
        </label>
      </div>
    </div>
  );
}