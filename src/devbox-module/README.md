# DevBox — Модуль для YourSecure

## Установка

1. Скопируйте папку `devbox-module` в корень проекта YourSecure
2. Импортируйте компоненты в ваш роутер:

```jsx
import DevBox from './devbox-module/DevBox';
import ToolPage from './devbox-module/ToolPage';

// В роутере добавьте два роута:
<Route path="/devbox" element={<DevBox />} />
<Route path="/devbox/:toolId" element={<ToolPage />} />