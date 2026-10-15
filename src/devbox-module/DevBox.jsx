import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from './tools';
import './DevBox.css'; // Подключаем стили друга

const DevBox = () => {
  // Динамическое SEO для главной страницы DevBox
  useEffect(() => {
    document.title = 'DevBox: Бесплатные инструменты для разработчиков онлайн | YourSecure';
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'DevBox — набор бесплатных онлайн-инструментов для разработчиков: генератор .gitignore, форматирование JSON, Base64, JWT декодер, SQL, Regex и другие. Всё работает локально в браузере без регистрации.';
    
    // Возвращаем дефолтный title при уходе со страницы
    return () => {
      document.title = 'YourSecure — Локальные инструменты для файлов и безопасности';
    };
  }, []);

  const toolKeys = Object.keys(TOOLS);

  return (
    <div 
      className="devbox-container"
      style={{ 
        minHeight: '100vh',
        background: '#0f0f1a', // ТЁМНЫЙ ФОН на всю страницу
        padding: '40px 20px',
        fontFamily: 'sans-serif'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* SEO Header: Заголовок и описание */}
        <header style={{ marginBottom: '40px', textAlign: 'center', padding: '20px 0' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#ffffff', // Белый текст на тёмном фоне — теперь виден!
            marginBottom: '15px' 
          }}>
            DevBox: Бесплатные инструменты для разработчиков
          </h1>
          <p style={{ 
            color: '#a0a0c0', // Светло-серый для читаемости
            fontSize: '16px', 
            maxWidth: '800px', 
            margin: '0 auto', 
            lineHeight: '1.6' 
          }}>
            Набор быстрых и безопасных онлайн-утилит для программистов: генератор .gitignore, форматирование JSON, декодирование JWT, Base64, работа с SQL и Regex. 
            <strong style={{ color: '#ffffff' }}> Все вычисления происходят локально в вашем браузере</strong>, данные никогда не покидают ваше устройство.
          </p>
        </header>

        {/* Сетка инструментов */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {toolKeys.map(key => {
            const tool = TOOLS[key];
            const shortDesc = tool.seo?.description 
              ? tool.seo.description.split('.').slice(0, 1).join('.') + '.' 
              : 'Инструмент для разработчиков';
            
            return (
              <Link 
                key={key} 
                to={`/devbox/${key}`}
                className="devbox-card"
                style={{
                  background: '#1a1a2e',
                  border: '1px solid #2a2a40',
                  borderRadius: '12px',
                  padding: '25px',
                  textDecoration: 'none',
                  color: '#ffffff',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => { 
                  e.currentTarget.style.transform = 'translateY(-5px)'; 
                  e.currentTarget.style.borderColor = '#4361ee';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(67, 97, 238, 0.2)';
                }}
                onMouseOut={(e) => { 
                  e.currentTarget.style.transform = 'translateY(0)'; 
                  e.currentTarget.style.borderColor = '#2a2a40';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '10px', 
                  color: '#ffffff' 
                }}>
                  {tool.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#a0a0c0', 
                  margin: 0, 
                  lineHeight: '1.4' 
                }}>
                  {shortDesc}
                </p>
              </Link>
            );
          })}
        </div>

        {/* SEO-блок с дополнительной информацией */}
        <section style={{ 
          marginTop: '50px', 
          padding: '25px', 
          background: '#1a1a2e',
          border: '1px solid #2a2a40',
          borderRadius: '12px',
          color: '#a0a0c0', 
          fontSize: '14px', 
          lineHeight: '1.6' 
        }}>
          <h2 style={{ 
            color: '#ffffff', 
            fontSize: '20px', 
            marginBottom: '15px' 
          }}>Почему выбирают DevBox?</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '15px' }}>
            <li style={{ marginBottom: '8px' }}><strong style={{ color: '#ffffff' }}>Полная конфиденциальность:</strong> код, токены и данные не отправляются на сервер.</li>
            <li style={{ marginBottom: '8px' }}><strong style={{ color: '#ffffff' }}>Мгновенная работа:</strong> никаких загрузок, регистраций и ожиданий.</li>
            <li style={{ marginBottom: '8px' }}><strong style={{ color: '#ffffff' }}>Бесплатно навсегда:</strong> все инструменты доступны без ограничений.</li>
          </ul>
        </section>

        {/* Футер с перелинковкой */}
        <footer style={{ 
          marginTop: '40px', 
          padding: '20px', 
          textAlign: 'center', 
          borderTop: '1px solid #2a2a40', 
          color: '#666688', 
          fontSize: '13px' 
        }}>
          <p>© 2026 <strong style={{ color: '#a0a0c0' }}>YourSecure</strong> — DevBox</p>
          <p style={{ marginTop: '10px' }}>
            <Link to="/" style={{ color: '#4361ee', textDecoration: 'none' }}>← Вернуться на главную YourSecure</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DevBox;