// Все инструменты DevBox с SEO-описаниями

export const TOOLS = {

    // ===== Форматирование JSON =====
    'json-formatter': {
        title: 'Форматирование JSON',
        seo: {
            title: 'Форматирование и валидация JSON онлайн | DevBox',
            description: 'Бесплатное форматирование JSON онлайн: превратите нечитаемый JSON в красивый код с отступами. Валидация, сжатие в одну строку (minify). Работает в браузере без загрузки данных.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Вставьте JSON:</label>
                <textarea id="jsonInput" placeholder='{"name": "DevBox", "version": 1}'></textarea>
                <div className="devbox-tool-row">
                    <button className="devbox-action-btn" onClick={() => window.formatJSON()}>Форматировать</button>
                    <button className="devbox-action-btn secondary" onClick={() => window.minifyJSON()}>Сжать</button>
                    <button className="devbox-action-btn secondary" onClick={() => window.validateJSON()}>Проверить</button>
                    <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                </div>
                <div className="devbox-result-box" id="jsonResult">Результат появится здесь...</div>
            </div>
        )
    },

    // ===== Base64 =====
    'base64': {
        title: 'Base64',
        seo: {
            title: 'Base64 онлайн: кодирование и декодирование текста | DevBox',
            description: 'Кодируйте и декодируйте текст в Base64 онлайн. Полная поддержка UTF-8 и кириллицы. Работает локально в браузере — данные не отправляются на сервер.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Текст:</label>
                <textarea id="base64Input" placeholder="Введите текст для кодирования..."></textarea>
                <div className="devbox-tool-row">
                    <button className="devbox-action-btn" onClick={() => window.encodeBase64()}>Кодировать → Base64</button>
                    <button className="devbox-action-btn" onClick={() => window.decodeBase64()}>Декодировать ← Base64</button>
                    <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                </div>
                <div className="devbox-result-box" id="base64Result">Результат появится здесь...</div>
            </div>
        )
    },

    // ===== Дешифровщик JWT =====
    'jwt-decoder': {
        title: 'Дешифровщик JWT',
        seo: {
            title: 'Дешифровка JWT токенов онлайн (Decoder) | DevBox',
            description: 'Безопасный декодер JWT токенов онлайн. Расшифруйте Header и Payload прямо в браузере. Данные не отправляются на сервер — полная конфиденциальность.'
        },
        render: () => (
            <div>
                <label className="devbox-label">JWT токен:</label>
                <textarea id="jwtInput" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."></textarea>
                <button className="devbox-action-btn" onClick={() => window.decodeJWT()}>Декодировать</button>
                <div className="devbox-result-box" id="jwtResult">Header и Payload появятся здесь...</div>
            </div>
        )
    },

    // ===== Кодировщик URL =====
    'url-encoder': {
        title: 'Кодировщик URL',
        seo: {
            title: 'URL кодирование и декодирование онлайн | DevBox',
            description: 'Кодируйте и декодируйте URL-адреса и GET-параметры онлайн. Поддержка кириллицы и специальных символов. Работает в браузере без сервера.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Текст или URL:</label>
                <textarea id="urlInput" placeholder="https://example.com/path?q=привет мир"></textarea>
                <div className="devbox-tool-row">
                    <button className="devbox-action-btn" onClick={() => window.encodeURL()}>Кодировать URL</button>
                    <button className="devbox-action-btn" onClick={() => window.decodeURL()}>Декодировать URL</button>
                    <button className="devbox-action-btn secondary" onClick={() => window.encodeComponent()}>Кодировать компонент</button>
                    <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                </div>
                <div className="devbox-result-box" id="urlResult">Результат появится здесь...</div>
            </div>
        )
    },

    // ===== HTML-сущности =====
    'html-entities': {
        title: 'HTML-сущности',
        seo: {
            title: 'HTML-сущности онлайн: кодирование и декодирование | DevBox',
            description: 'Конвертируйте специальные HTML-символы (&, <, >, ") в сущности и обратно. Полезно для безопасного отображения кода на страницах. Работает в браузере.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Текст:</label>
                <textarea id="htmlInput" placeholder="<div class='test'>Привет & мир</div>"></textarea>
                <div className="devbox-tool-row">
                    <button className="devbox-action-btn" onClick={() => window.encodeHTML()}>Кодировать в сущности</button>
                    <button className="devbox-action-btn" onClick={() => window.decodeHTML()}>Декодировать из сущностей</button>
                    <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                </div>
                <div className="devbox-result-box" id="htmlResult">Результат появится здесь...</div>
            </div>
        )
    },

    // ===== Форматирование SQL =====
    'sql-formatter': {
        title: 'Форматирование SQL',
        seo: {
            title: 'Форматирование SQL запросов онлайн | DevBox',
            description: 'Автоматически форматируйте SQL-запросы для удобного чтения. Расстановка ключевых слов по строкам, отступы. Упрощает отладку сложных запросов к базам данных.'
        },
        render: () => (
            <div>
                <label className="devbox-label">SQL запрос:</label>
                <textarea id="sqlInput" placeholder="SELECT * FROM users WHERE id=1 AND name='test' ORDER BY created_at"></textarea>
                <button className="devbox-action-btn" onClick={() => window.formatSQL()}>Форматировать</button>
                <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                <div className="devbox-result-box" id="sqlResult">Результат появится здесь...</div>
            </div>
        )
    },

    // ===== Тестер регулярных выражений =====
    'regex-tester': {
        title: 'Тестер регулярных выражений',
        seo: {
            title: 'Тестер регулярных выражений (Regex) онлайн | DevBox',
            description: 'Проверяйте regex-шаблоны на реальном тексте онлайн. Поддержка флагов g, i, m. Мгновенный поиск всех совпадений. Работает в браузере без сервера.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Регулярное выражение:</label>
                <input type="text" id="regexPattern" placeholder="[a-zA-Z0-9]+" />
                <label className="devbox-label">Флаги:</label>
                <input type="text" id="regexFlags" placeholder="gi" defaultValue="g" />
                <label className="devbox-label">Тестовый текст:</label>
                <textarea id="regexText" placeholder="Введите текст для проверки..."></textarea>
                <button className="devbox-action-btn" onClick={() => window.testRegex()}>Тестировать</button>
                <div className="devbox-result-box" id="regexResult">Результат появится здесь...</div>
            </div>
        )
    },

    // ===== Сравнение текстов =====
    'text-diff': {
        title: 'Сравнение текстов',
        seo: {
            title: 'Сравнение текстов онлайн: поиск различий | DevBox',
            description: 'Найдите различия между двумя версиями текста онлайн. Наглядно показывает добавленные и удалённые строки. Работает в браузере без загрузки данных.'
        },
        render: () => (
            <div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                    <div>
                        <label className="devbox-label">Текст 1 (оригинал):</label>
                        <textarea id="diffText1" style={{minHeight: '200px'}}></textarea>
                    </div>
                    <div>
                        <label className="devbox-label">Текст 2 (изменённый):</label>
                        <textarea id="diffText2" style={{minHeight: '200px'}}></textarea>
                    </div>
                </div>
                <button className="devbox-action-btn" onClick={() => window.compareTexts()}>Сравнить</button>
                <div className="devbox-result-box" id="diffResult">Различия появятся здесь...</div>
            </div>
        )
    },

    // ===== Генератор текста-заглушки =====
    'lorem-ipsum': {
        title: 'Генератор текста-заглушки',
        seo: {
            title: 'Генератор Lorem Ipsum онлайн: русский, английский, латынь | DevBox',
            description: 'Генератор текста-заглушки Lorem Ipsum онлайн. Поддержка русского, английского и классической латыни. Параграфы, предложения, слова. Работает в браузере.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Количество параграфов:</label>
                <input type="number" id="loremCount" defaultValue="3" min="1" max="20" />
                <label className="devbox-label">Тип:</label>
                <select id="loremType">
                    <option value="paragraphs">Параграфы</option>
                    <option value="sentences">Предложения</option>
                    <option value="words">Слова</option>
                </select>
                <label className="devbox-label">Язык:</label>
                <select id="loremLang">
                    <option value="ru">Русский</option>
                    <option value="en">Английский</option>
                    <option value="la">Латынь (классический Lorem Ipsum)</option>
                </select>
                <button className="devbox-action-btn" onClick={() => window.generateLorem()}>Сгенерировать</button>
                <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                <div className="devbox-result-box" id="loremResult">Текст появится здесь...</div>
            </div>
        )
    },

    // ===== Конвертер регистра =====
    'case-converter': {
        title: 'Конвертер регистра',
        seo: {
            title: 'Конвертер регистра текста онлайн: camelCase, snake_case | DevBox',
            description: 'Конвертируйте текст между регистрами онлайн: camelCase, snake_case, kebab-case, PascalCase, UPPER CASE, lower case. Работает в браузере без сервера.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Текст:</label>
                <textarea id="caseInput" placeholder="hello world example"></textarea>
                <div className="devbox-tool-row">
                    <button className="devbox-action-btn" onClick={() => window.convertCase('camel')}>camelCase</button>
                    <button className="devbox-action-btn" onClick={() => window.convertCase('snake')}>snake_case</button>
                    <button className="devbox-action-btn" onClick={() => window.convertCase('kebab')}>kebab-case</button>
                    <button className="devbox-action-btn" onClick={() => window.convertCase('pascal')}>PascalCase</button>
                    <button className="devbox-action-btn" onClick={() => window.convertCase('upper')}>UPPER CASE</button>
                    <button className="devbox-action-btn" onClick={() => window.convertCase('lower')}>lower case</button>
                    <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                </div>
                <div className="devbox-result-box" id="caseResult">Результат появится здесь...</div>
            </div>
        )
    },

    // ===== Конвертер цветов =====
    'color-picker': {
        title: 'Конвертер цветов',
        seo: {
            title: 'Конвертер цветов онлайн: HEX, RGB, HSL | DevBox',
            description: 'Конвертируйте цвета между форматами HEX, RGB и HSL онлайн. Визуальный предпросмотр цвета. Работает в браузере без загрузки данных.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Выберите цвет:</label>
                <input 
                    type="color" 
                    id="colorPicker" 
                    defaultValue="#4361ee" 
                    style={{height: '60px', cursor: 'pointer', width: '100%'}}
                    onChange={(e) => {
                        document.getElementById('colorHex').value = e.target.value;
                        document.getElementById('colorPreview').style.background = e.target.value;
                        window.convertFromHex();
                    }}
                />
                <div className="devbox-color-preview" id="colorPreview" style={{background: '#4361ee'}}></div>
                <label className="devbox-label">HEX:</label>
                <input type="text" id="colorHex" defaultValue="#4361ee" />
                <label className="devbox-label">RGB:</label>
                <input type="text" id="colorRgb" defaultValue="rgb(67, 97, 238)" readOnly />
                <label className="devbox-label">HSL:</label>
                <input type="text" id="colorHsl" defaultValue="hsl(228, 81%, 60%)" readOnly />
                <button className="devbox-action-btn" onClick={() => window.convertFromHex()}>Конвертировать из HEX</button>
                <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать все</button>
                <div className="devbox-result-box" id="colorResult">Все форматы цвета...</div>
            </div>
        )
    },

    // ===== Сжатие CSS =====
    'css-minifier': {
        title: 'Сжатие CSS',
        seo: {
            title: 'Сжатие CSS онлайн: минификация кода | DevBox',
            description: 'Сжимайте CSS код онлайн: удаление комментариев, лишних пробелов и переносов строк. Уменьшение размера файлов стилей. Работает в браузере.'
        },
        render: () => (
            <div>
                <label className="devbox-label">CSS код:</label>
                <textarea id="cssInput" placeholder="body { margin: 0; padding: 0; }"></textarea>
                <button className="devbox-action-btn" onClick={() => window.minifyCSS()}>Сжать CSS</button>
                <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                <div className="devbox-result-box" id="cssResult">Сжатый CSS появится здесь...</div>
            </div>
        )
    },

    // ===== Генератор .gitignore =====
    'gitignore-generator': {
        title: 'Генератор .gitignore',
        seo: {
            title: 'Генератор .gitignore онлайн для Python, Node.js, React | DevBox',
            description: 'Бесплатный онлайн генератор файла .gitignore. Мгновенно создайте список исключений для Git под Python, Node.js, React, Django, Go, Java, VS Code. Работает в браузере.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Выберите технологии:</label>
                <div style={{margin: '15px 0', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <label className="devbox-checkbox-label"><input type="checkbox" className="git-tech" value="python" /> Python</label>
                    <label className="devbox-checkbox-label"><input type="checkbox" className="git-tech" value="node" /> Node.js / npm</label>
                    <label className="devbox-checkbox-label"><input type="checkbox" className="git-tech" value="react" /> React / Vite</label>
                    <label className="devbox-checkbox-label"><input type="checkbox" className="git-tech" value="django" /> Django</label>
                    <label className="devbox-checkbox-label"><input type="checkbox" className="git-tech" value="go" /> Go</label>
                    <label className="devbox-checkbox-label"><input type="checkbox" className="git-tech" value="java" /> Java / Maven</label>
                    <label className="devbox-checkbox-label"><input type="checkbox" className="git-tech" value="vscode" /> VS Code</label>
                    <label className="devbox-checkbox-label"><input type="checkbox" className="git-tech" value="os" /> Операционные системы</label>
                </div>
                <button className="devbox-action-btn" onClick={() => window.generateGitignore()}>Сгенерировать .gitignore</button>
                <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                <div className="devbox-result-box" id="gitignoreResult"># Выберите технологии выше и нажмите «Сгенерировать»</div>
            </div>
        )
    },

    // ===== Генератор UUID =====
    'uuid-generator': {
        title: 'Генератор UUID',
        seo: {
            title: 'Генератор UUID онлайн: уникальные идентификаторы v4 | DevBox',
            description: 'Генератор UUID версии 4 онлайн. Создание уникальных идентификаторов с настройкой регистра и наличия дефисов. Криптографически стойкая генерация в браузере.'
        },
        render: () => (
            <div>
                <label className="devbox-label">Количество UUID:</label>
                <input type="number" id="uuidCount" defaultValue="5" min="1" max="100" />
                <div style={{margin: '15px 0', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <label className="devbox-checkbox-label"><input type="checkbox" id="uuidUppercase" /> В верхнем регистре</label>
                    <label className="devbox-checkbox-label"><input type="checkbox" id="uuidNoDashes" /> Без дефисов</label>
                </div>
                <button className="devbox-action-btn" onClick={() => window.generateUUID()}>Сгенерировать</button>
                <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать все</button>
                <div className="devbox-result-box" id="uuidResult">UUID появятся здесь...</div>
            </div>
        )
    },

    // ===== Сравнение JSON =====
    'json-diff': {
        title: 'Сравнение JSON',
        seo: {
            title: 'Сравнение JSON объектов онлайн: поиск различий | DevBox',
            description: 'Найдите различия между двумя JSON-объектами онлайн. Показывает добавленные, удалённые и изменённые поля с визуальной панелью. Работает в браузере.'
        },
        render: () => (
            <div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                    <div>
                        <label className="devbox-label">JSON 1 (оригинал):</label>
                        <textarea id="jsonDiff1" style={{minHeight: '200px'}} placeholder='{"name": "DevBox", "version": 1}'></textarea>
                    </div>
                    <div>
                        <label className="devbox-label">JSON 2 (изменённый):</label>
                        <textarea id="jsonDiff2" style={{minHeight: '200px'}} placeholder='{"name": "DevBox", "version": 2, "author": "You"}'></textarea>
                    </div>
                </div>
                <button className="devbox-action-btn" onClick={() => window.compareJSON()}>Сравнить JSON</button>
                <button className="devbox-action-btn secondary" onClick={() => window.copyResult()}>Копировать</button>
                <div className="devbox-result-box" id="jsonDiffResult">Различия появятся здесь...</div>
            </div>
        )
    }
};

// ===== Глобальные функции инструментов =====

// Показать результат
window.showResult = (elementId, text) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
};

// Копировать результат
window.copyResult = () => {
    const resultBoxes = document.querySelectorAll('.devbox-result-box');
    let text = '';
    resultBoxes.forEach(box => {
        if (box.textContent && !box.textContent.includes('появится здесь') && !box.textContent.startsWith('# Выберите')) {
            text += box.textContent + '\n';
        }
    });
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Скопировано в буфер обмена!');
        });
    }
};

// JSON
window.formatJSON = () => {
    try {
        const input = document.getElementById('jsonInput').value;
        const obj = JSON.parse(input);
        window.showResult('jsonResult', JSON.stringify(obj, null, 2));
    } catch (e) {
        window.showResult('jsonResult', '❌ Ошибка: ' + e.message);
    }
};

window.minifyJSON = () => {
    try {
        const input = document.getElementById('jsonInput').value;
        const obj = JSON.parse(input);
        window.showResult('jsonResult', JSON.stringify(obj));
    } catch (e) {
        window.showResult('jsonResult', '❌ Ошибка: ' + e.message);
    }
};

window.validateJSON = () => {
    try {
        const input = document.getElementById('jsonInput').value;
        JSON.parse(input);
        window.showResult('jsonResult', '✅ Валидный JSON');
    } catch (e) {
        window.showResult('jsonResult', '❌ Невалидный JSON: ' + e.message);
    }
};

// Base64
window.encodeBase64 = () => {
    const input = document.getElementById('base64Input').value;
    try {
        window.showResult('base64Result', btoa(unescape(encodeURIComponent(input))));
    } catch (e) {
        window.showResult('base64Result', '❌ Ошибка: ' + e.message);
    }
};

window.decodeBase64 = () => {
    const input = document.getElementById('base64Input').value;
    try {
        window.showResult('base64Result', decodeURIComponent(escape(atob(input))));
    } catch (e) {
        window.showResult('base64Result', '❌ Ошибка: ' + e.message);
    }
};

// JWT
window.decodeJWT = () => {
    const token = document.getElementById('jwtInput').value.trim();
    try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Неверный формат JWT');
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        window.showResult('jwtResult', 
            'HEADER:\n' + JSON.stringify(header, null, 2) + 
            '\n\nPAYLOAD:\n' + JSON.stringify(payload, null, 2)
        );
    } catch (e) {
        window.showResult('jwtResult', '❌ Ошибка: ' + e.message);
    }
};

// URL
window.encodeURL = () => {
    window.showResult('urlResult', encodeURI(document.getElementById('urlInput').value));
};

window.decodeURL = () => {
    try {
        window.showResult('urlResult', decodeURI(document.getElementById('urlInput').value));
    } catch (e) {
        window.showResult('urlResult', '❌ Ошибка: ' + e.message);
    }
};

window.encodeComponent = () => {
    window.showResult('urlResult', encodeURIComponent(document.getElementById('urlInput').value));
};

// HTML Entities
window.encodeHTML = () => {
    const text = document.getElementById('htmlInput').value;
    const div = document.createElement('div');
    div.textContent = text;
    window.showResult('htmlResult', div.innerHTML);
};

window.decodeHTML = () => {
    const text = document.getElementById('htmlInput').value;
    const div = document.createElement('div');
    div.innerHTML = text;
    window.showResult('htmlResult', div.textContent);
};

// SQL Formatter
window.formatSQL = () => {
    let sql = document.getElementById('sqlInput').value;
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
                      'HAVING', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
                      'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'AS', 'IN', 'NOT', 'NULL'];
    keywords.forEach(kw => {
        const regex = new RegExp('\\b' + kw + '\\b', 'gi');
        sql = sql.replace(regex, '\n' + kw);
    });
    window.showResult('sqlResult', sql.trim());
};

// Regex
window.testRegex = () => {
    try {
        const pattern = document.getElementById('regexPattern').value;
        const flags = document.getElementById('regexFlags').value;
        const text = document.getElementById('regexText').value;
        const regex = new RegExp(pattern, flags);
        const matches = text.match(regex);
        if (matches) {
            window.showResult('regexResult', `Найдено совпадений: ${matches.length}\n\n${matches.join('\n')}`);
        } else {
            window.showResult('regexResult', 'Совпадений не найдено');
        }
    } catch (e) {
        window.showResult('regexResult', '❌ Ошибка: ' + e.message);
    }
};

// Text Diff
window.compareTexts = () => {
    const text1 = document.getElementById('diffText1').value.split('\n');
    const text2 = document.getElementById('diffText2').value.split('\n');
    const maxLines = Math.max(text1.length, text2.length);
    let result = '';
    for (let i = 0; i < maxLines; i++) {
        const line1 = text1[i] || '';
        const line2 = text2[i] || '';
        if (line1 === line2) {
            result += `  ${line1}\n`;
        } else {
            if (line1) result += `- ${line1}\n`;
            if (line2) result += `+ ${line2}\n`;
        }
    }
    window.showResult('diffResult', result || 'Тексты идентичны');
};

// Lorem Ipsum
window.generateLorem = () => {
    const words = {
        ru: ['далеко', 'за', 'словесными', 'горами', 'в', 'стране', 'гласных', 
             'и', 'согласных', 'живут', 'рыбные', 'тексты', 'всемогущая', 
             'языковая', 'семантика', 'имеет', 'огромную', 'силу', 'влияния', 
             'на', 'процесс', 'создания', 'удобных', 'макетов', 'всевозможных', 
             'букв', 'знаков', 'цифр', 'а', 'также', 'множество', 'других', 
             'важных', 'элементов', 'которые', 'используются', 'при', 'разработке', 
             'сайтов', 'приложений', 'интерфейсов', 'дизайна', 'кода', 'программ', 
             'функций', 'переменных', 'массивов', 'объектов', 'данных'],
        en: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 
             'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
             'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
             'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut'],
        la: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 
             'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
             'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
             'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut']
    };
    const count = parseInt(document.getElementById('loremCount').value);
    const type = document.getElementById('loremType').value;
    const lang = document.getElementById('loremLang').value;
    const wordList = words[lang];
    let result = '';
    function randomWord() {
        return wordList[Math.floor(Math.random() * wordList.length)];
    }
    function randomSentence() {
        const len = 8 + Math.floor(Math.random() * 10);
        let sentence = Array.from({length: len}, randomWord).join(' ');
        return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    }
    if (type === 'words') {
        result = Array.from({length: count}, randomWord).join(' ');
    } else if (type === 'sentences') {
        result = Array.from({length: count}, randomSentence).join(' ');
    } else {
        for (let i = 0; i < count; i++) {
            const sentences = 3 + Math.floor(Math.random() * 4);
            result += Array.from({length: sentences}, randomSentence).join(' ') + '\n\n';
        }
    }
    window.showResult('loremResult', result.trim());
};

// Case Converter
window.convertCase = (type) => {
    const input = document.getElementById('caseInput').value;
    const words = input.toLowerCase().split(/[\s_\-]+/).filter(w => w);
    let result = '';
    switch(type) {
        case 'camel':
            result = words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
            break;
        case 'snake':
            result = words.join('_');
            break;
        case 'kebab':
            result = words.join('-');
            break;
        case 'pascal':
            result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
            break;
        case 'upper':
            result = input.toUpperCase();
            break;
        case 'lower':
            result = input.toLowerCase();
            break;
    }
    window.showResult('caseResult', result);
};

// Color Converter
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

window.convertFromHex = () => {
    const hex = document.getElementById('colorHex').value;
    const rgb = hexToRgb(hex);
    if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        document.getElementById('colorRgb').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        document.getElementById('colorHsl').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        document.getElementById('colorPreview').style.background = hex;
        window.showResult('colorResult', 
            `HEX: ${hex}\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        );
    }
};

// CSS Minifier
window.minifyCSS = () => {
    let css = document.getElementById('cssInput').value;
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    css = css.replace(/\s+/g, ' ');
    css = css.replace(/\s*([{}:;,])\s*/g, '$1');
    css = css.replace(/;}/g, '}');
    window.showResult('cssResult', css.trim());
};

// Gitignore Generator
window.generateGitignore = () => {
    const templates = {
        python: '# Python\n__pycache__/\n*.py[cod]\n*$py.class\n*.so\n.Python\nbuild/\ndevelop-eggs/\ndist/\ndownloads/\neggs/\n.eggs/\nlib/\nlib64/\nparts/\nsdist/\nvar/\nwheels/\npip-wheel-metadata/\nshare/python-wheels/\n*.egg-info/\n.installed.cfg\n*.egg\nMANIFEST\n.pytest_cache/\n.coverage\nhtmlcov/\n.tox/\n.nox/\n.hypothesis/\n.venv/\nenv/\nvenv/\nENV/\nenv.bak/\nvenv.bak/\n.idea/\n.vscode/\n*.log\n.env\n.DS_Store',
        node: '# Node.js\nnode_modules/\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\npnpm-debug.log*\nlerna-debug.log*\n.npm\n.eslintcache\ncoverage/\n.nyc_output/\n.next/\nout/\nbuild/\n!.next/cache/\ndist/\n.tmp/\n.cache/\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n.vercel\n.turbo\n.DS_Store',
        react: '# React / Vite\ndist/\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\npnpm-debug.log*\nnode_modules/\ncoverage/\n.nyc_output/\n.tmp/\n.cache/\n.vercel\n.turbo\n.DS_Store',
        django: '# Django\n*.pyc\n__pycache__/\nlocal_settings.py\ndb.sqlite3\ndb.sqlite3-journal\n/media\n/staticfiles\nstatic/\n.env\n.venv/\nvenv/\nENV/\n.DS_Store\n.idea/\n.vscode/',
        go: '# Go\nbin/\nob/\n*.exe\n*.exe~\n*.dll\n*.so\n*.dylib\n*.test\n*.out\nvendor/\n.DS_Store',
        java: '# Java / Maven\ntarget/\n!.mvn/wrapper/maven-wrapper.jar\n!**/src/main/**/target/\n!**/src/test/**/target/\n.sts4-cache/\n.classpath\n.project\n.settings/\n.factorypath\n.idea/\n*.iml\n*.iws\n*.ipr\n.DS_Store',
        vscode: '# VS Code\n.vscode/*\n!.vscode/settings.json\n!.vscode/tasks.json\n!.vscode/launch.json\n!.vscode/extensions.json\n.history/\n*.code-workspace',
        os: '# OS\n.DS_Store\n.DS_Store?\n._*\n.Spotlight-V100\n.Trashes\nehthumbs.db\nThumbs.db\nDesktop.ini\n$RECYCLE.BIN/\nSystem Volume Information/'
    };
    const checkboxes = document.querySelectorAll('.git-tech:checked');
    if (checkboxes.length === 0) {
        window.showResult('gitignoreResult', '⚠️ Выберите хотя бы одну технологию');
        return;
    }
    let result = [];
    checkboxes.forEach(cb => {
        if (templates[cb.value]) {
            result.push(templates[cb.value]);
        }
    });
    window.showResult('gitignoreResult', result.join('\n\n'));
};

// UUID Generator
window.generateUUID = () => {
    const count = parseInt(document.getElementById('uuidCount').value);
    const uppercase = document.getElementById('uuidUppercase').checked;
    const noDashes = document.getElementById('uuidNoDashes').checked;
    let result = '';
    for (let i = 0; i < count; i++) {
        let uuid = crypto.randomUUID();
        if (uppercase) uuid = uuid.toUpperCase();
        if (noDashes) uuid = uuid.replace(/-/g, '');
        result += uuid + '\n';
    }
    window.showResult('uuidResult', result.trim());
};

// JSON Diff
window.compareJSON = () => {
    try {
        const json1 = JSON.parse(document.getElementById('jsonDiff1').value);
        const json2 = JSON.parse(document.getElementById('jsonDiff2').value);
        const allKeys = new Set([...Object.keys(json1), ...Object.keys(json2)]);
        let result = [];
        for (const key of [...allKeys].sort()) {
            const in1 = key in json1;
            const in2 = key in json2;
            if (in1 && !in2) {
                result.push(`- "${key}": ${JSON.stringify(json1[key])} [УДАЛЕНО]`);
            } else if (!in1 && in2) {
                result.push(`+ "${key}": ${JSON.stringify(json2[key])} [ДОБАВЛЕНО]`);
            } else if (JSON.stringify(json1[key]) !== JSON.stringify(json2[key])) {
                result.push(`~ "${key}": ${JSON.stringify(json1[key])} → ${JSON.stringify(json2[key])} [ИЗМЕНЕНО]`);
            } else {
                result.push(`  "${key}": ${JSON.stringify(json1[key])}`);
            }
        }
        if (result.length === 0) {
            window.showResult('jsonDiffResult', '✅ JSON-объекты идентичны');
        } else {
            window.showResult('jsonDiffResult', result.join('\n'));
        }
    } catch (e) {
        window.showResult('jsonDiffResult', '❌ Ошибка: ' + e.message + '\n\nУбедитесь, что оба поля содержат валидный JSON.');
    }
};