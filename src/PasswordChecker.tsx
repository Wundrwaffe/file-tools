import { useState } from 'react';

export default function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{ breached: boolean; count: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkPassword = async () => {
    if (!password) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Вычисляем SHA-1 хеш пароля
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      // Отправляем только первые 5 символов (k-anonymity)
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();

      // Ищем наш суффикс в ответе
      const lines = text.split('\n');
      let count = 0;
      for (const line of lines) {
        const [hashSuffix, hashCount] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          count = parseInt(hashCount);
          break;
        }
      }

      setResult({ breached: count > 0, count });
    } catch (err) {
      setError('Ошибка проверки. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🔍 Проверка пароля на утечки</h2>
      <p className="text-sm text-gray-600 mb-4">
        Проверяем, не был ли ваш пароль скомпрометирован в утечках данных. 
        Пароль <strong>никогда не покидает ваш браузер</strong> — отправляется только хеш.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль для проверки"
          className="flex-1 p-3 border border-gray-300 rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
        />
        <button
          onClick={checkPassword}
          disabled={loading || !password}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            loading || !password
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {loading ? '⏳' : 'Проверить'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ️ {error}
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg border ${
          result.breached 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {result.breached ? (
            <>
              <p className="font-bold text-lg"> Пароль найден в утечках!</p>
              <p className="mt-2">
                Этот пароль встречался в <strong>{result.count.toLocaleString()}</strong> утечках данных. 
                Немедленно смените его на всех сервисах, где вы его используете.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-lg">✅ Пароль не найден в известных утечках</p>
              <p className="mt-2">
                Хорошая новость! Этот пароль не встречается в базе данных Have I Been Pwned. 
                Но всё равно используйте уникальный пароль для каждого сервиса.
              </p>
            </>
          )}
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <strong>🔒 Как это работает безопасно?</strong>
        <p className="mt-1">
          Мы используем метод <strong>k-anonymity</strong>: отправляем только первые 5 символов SHA-1 хеша пароля. 
          Сервер возвращает список всех хешей с таким префиксом, а проверка происходит локально в вашем браузере. 
          Сам пароль никогда не передаётся.
        </p>
      </div>
    </div>
  );
}