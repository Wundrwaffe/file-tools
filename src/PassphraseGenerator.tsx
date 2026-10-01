import { useState, useEffect } from 'react';

// Упрощённый список слов Diceware (в реальности нужно 7776 слов)
const WORDLIST = [
  'correct', 'horse', 'battery', 'staple', 'monkey', 'coffee', 'dragon', 'puzzle',
  'thunder', 'lightning', 'rainbow', 'mountain', 'ocean', 'forest', 'desert', 'river',
  'sunset', 'sunrise', 'galaxy', 'planet', 'comet', 'asteroid', 'nebula', 'star',
  'quantum', 'photon', 'electron', 'neutron', 'proton', 'atom', 'molecule', 'cell',
  'tiger', 'elephant', 'dolphin', 'eagle', 'wolf', 'bear', 'fox', 'rabbit',
  'guitar', 'piano', 'violin', 'drum', 'flute', 'trumpet', 'saxophone', 'harp',
  'castle', 'tower', 'bridge', 'fortress', 'palace', 'temple', 'pyramid', 'lighthouse',
  'butterfly', 'blossom', 'crystal', 'diamond', 'emerald', 'sapphire', 'ruby', 'pearl',
  'adventure', 'journey', 'quest', 'mission', 'expedition', 'voyage', 'trek', 'safari',
  'wisdom', 'knowledge', 'insight', 'genius', 'talent', 'skill', 'mastery', 'expertise'
];

export default function PassphraseGenerator() {
  const [passphrase, setPassphrase] = useState('');
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassphrase = () => {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * WORDLIST.length);
      let word = WORDLIST[randomIndex];
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      words.push(word);
    }

    if (addNumber) {
      words.push(Math.floor(Math.random() * 100).toString());
    }

    setPassphrase(words.join(separator));
    setCopied(false);
  };

  useEffect(() => {
    generatePassphrase();
  }, [wordCount, separator, capitalize, addNumber]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(passphrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEntropy = () => {
    const words = wordCount + (addNumber ? 1 : 0);
    const entropy = words * Math.log2(WORDLIST.length + (addNumber ? 100 : 0));
    return Math.round(entropy);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2"> Генератор passphrase</h2>
      <p className="text-sm text-gray-600 mb-4">
        Запоминающаяся фраза из случайных слов. Надёжнее пароля и легче запоминается.
      </p>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={passphrase}
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
            onClick={generatePassphrase}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Энтропия: <strong>{getEntropy()} бит</strong> (рекомендуется 60+)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Количество слов</span>
            <span className="font-mono">{wordCount}</span>
          </label>
          <input
            type="range"
            min="4"
            max="8"
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Разделитель</label>
          <div className="flex gap-2">
            {['-', '.', '_', ' ', '/'].map((sep) => (
              <button
                key={sep}
                onClick={() => setSeparator(sep)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  separator === sep
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {sep === ' ' ? 'пробел' : sep}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={capitalize} onChange={(e) => setCapitalize(e.target.checked)} />
            <span className="text-sm">Заглавная первая буква</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={addNumber} onChange={(e) => setAddNumber(e.target.checked)} />
            <span className="text-sm">Добавить число в конце</span>
          </label>
        </div>
      </div>
    </div>
  );
}