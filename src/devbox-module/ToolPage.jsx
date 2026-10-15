import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOOLS } from './tools';

const ToolPage = () => {
  const { toolId } = useParams();
  const tool = TOOLS[toolId];

  // Динамическое обновление SEO для каждой страницы DevBox
  useEffect(() => {
    if (tool) {
      // 1. Меняем заголовок вкладки браузера
      document.title = tool.seo?.title || `${tool.title} | DevBox - YourSecure`;
      
      // 2. Меняем мета-тег description для поисковиков
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = tool.seo?.description || 'Бесплатные инструменты для разработчиков от YourSecure. Работают локально в браузере.';
    }
    
    // Возвращаем дефолтный title при уходе со страницы
    return () => {
      document.title = 'YourSecure — Локальные инструменты для файлов и безопасности';
    };
  }, [toolId, tool]);

  if (!tool) {
    return (
      <div className="devbox-container" style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Инструмент не найден</h2>
        <Link to="/devbox" className="devbox-action-btn">← Вернуться к списку инструментов</Link>
      </div>
    );
  }

  return (
    <div className="devbox-container">
      <Link to="/devbox" className="devbox-back-link" style={{ display: 'inline-block', marginBottom: '20px', color: '#4361ee', textDecoration: 'none', fontSize: '14px' }}>
        ← Все инструменты DevBox
      </Link>
      
      {/* SEO-блок: видимый заголовок и описание для поисковиков */}
      <header style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #2a2a40' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffffff', marginBottom: '12px', lineHeight: '1.3' }}>
          {tool.title}
        </h1>
        <p style={{ color: '#8888aa', fontSize: '16px', lineHeight: '1.6', maxWidth: '800px' }}>
          {tool.seo?.description}
        </p>
      </header>

      {/* Сам инструмент */}
      <div className="devbox-tool-content">
        {tool.render()}
      </div>

      {/* SEO-блок с дополнительной информацией (помогает поисковикам понять контекст) */}
      <section style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #2a2a40', color: '#8888aa', fontSize: '14px', lineHeight: '1.6' }}>
        <h2 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '10px' }}>О инструменте "{tool.title}"</h2>
        <p style={{ marginBottom: '10px' }}>
          Этот инструмент работает полностью локально в вашем браузере. Ваши данные <strong>никогда не отправляются на сервер</strong> — всё вычисление происходит на вашем устройстве. 
          Это гарантирует полную конфиденциальность и безопасность при работе с чувствительной информацией: кодом, токенами, паролями и личными данными.
        </p>
        <p>
          <strong>Как использовать:</strong> введите данные в поле выше, нажмите соответствующую кнопку, и результат появится в блоке ниже. 
          Вы можете скопировать результат в буфер обмена одним кликом.
        </p>
      </section>

      <footer style={{ marginTop: '40px', padding: '20px', textAlign: 'center', borderTop: '1px solid #2a2a40', color: '#666688', fontSize: '13px' }}>
        <p>© 2026 <strong>YourSecure</strong> — DevBox: Бесплатные инструменты для разработчиков</p>
        <p style={{ marginTop: '5px' }}>
          <Link to="/" style={{ color: '#4361ee', textDecoration: 'none' }}>← Вернуться на главную YourSecure</Link>
        </p>
      </footer>
    </div>
  );
};

export default ToolPage;