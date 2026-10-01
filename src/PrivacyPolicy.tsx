import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Назад на главную
        </button>

        <article className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 prose prose-gray max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Политика конфиденциальности</h1>
          <p className="text-sm text-gray-500 mb-8">Последнее обновление: 2 октября 2026 г.</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Общие положения</h2>
            <p className="text-gray-700 leading-relaxed">
              Настоящая Политика конфиденциальности описывает, как сайт <strong>yoursecure.space</strong> (далее — «Сервис») 
              обрабатывает информацию пользователей. Используя Сервис, вы соглашаетесь с условиями этой Политики.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Локальная обработка файлов (Главный принцип)</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Все операции с файлами (сжатие, удаление метаданных, шифрование, расчёт хешей) выполняются 
              исключительно на стороне клиента (в вашем браузере).</strong>
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Мы <strong>не загружаем, не храним, не обрабатываем и не передаём</strong> ваши файлы на какие-либо серверы. 
              После закрытия вкладки браузера никакие следы ваших файлов не остаются в системе Сервиса. 
              Вы несёте полную ответственность за содержание файлов, которые вы обрабатываете.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Сбор технических данных</h2>
            <p className="text-gray-700 leading-relaxed">
              Для улучшения работы Сервиса и анализа посещаемости мы используем сервис <strong>Яндекс.Метрика</strong>. 
              Он может автоматически собирать обезличенные технические данные:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
              <li>IP-адрес и данные о браузере (User-Agent);</li>
              <li>Информация о взаимодействии с интерфейсом (клики, скроллинг);</li>
              <li>Файлы cookie (для корректной работы аналитики).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              Эти данные не позволяют идентифицировать вашу личность и используются исключительно в статистических целях.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Рекламные технологии</h2>
            <p className="text-gray-700 leading-relaxed">
              На сайте могут отображаться рекламные материалы партнёрской сети <strong>Яндекс.Рекламная сеть (РСЯ)</strong>. 
              Яндекс может использовать файлы cookie для показа релевантной рекламы. Вы можете отключить персонализированную 
              рекламу в настройках вашего аккаунта Яндекс.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Контакты</h2>
            <p className="text-gray-700 leading-relaxed">
              Если у вас есть вопросы относительно этой Политики конфиденциальности, вы можете связаться с нами по адресу: 
              <a href="mailto:support@yoursecure.space" className="text-blue-600 hover:underline ml-1">support@yoursecure.space</a>
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}