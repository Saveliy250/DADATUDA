## Аналитика: Яндекс.Метрика

Полная документация по внедрённой в проект интеграции Яндекс.Метрики: инициализация, используемые методы-обёртки, параметры событий, «пинги» (хиты), учёт сессий/экранов/свайпов, а также примеры использования.

### Инициализация счётчика

Скрипт метрики подключён в `index.html`. ID берётся из переменной окружения `VITE_METRICA_ID`:

```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
  })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=%VITE_METRICA_ID%', 'ym');

  ym(Number('%VITE_METRICA_ID%'), 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    accurateTrackBounce: true,
    trackLinks: true
  });
</script>
<!-- /Yandex.Metrika counter -->
```

- Переменная `VITE_METRICA_ID` должна быть определена (например, в `.env`) – без неё вызовы безопасно игнорируются.
- Включены `webvisor`, `clickmap`, учёт отказов (`accurateTrackBounce`) и отслеживание кликов по ссылкам (`trackLinks`).

### Обёртка над `ym`

Вся работа с Метрикой инкапсулирована в `src/tools/analytics/ym.ts`. Обёртка автоматически проверяет наличие `window.ym` и ID счётчика и безопасно «no-op» при их отсутствии.

Доступные функции:

```ts
// Отправка цели
export function trackGoal(goalName: string, params?: Record<string, unknown>): void

// Отправка хита (страница/экран); referrer опционален
export function trackHit(path: string, referrer?: string): void

// Установка пользовательских параметров (например, userId)
export function setUserParams(params: Record<string, unknown>): void

// Управление сессией приложения
export function startSession(): void
export function endSession(reason: 'hidden' | 'unload' | 'manual' = 'manual'): void

// Учёт экранов и времени на экране
export function startScreen(path: string): void

// Учёт свайпов (глобальный счётчик в рамках сессии)
export function addSwipe(): void

// Вспомогательные флаги/маркеры для уникальных целей регистрации
export function isCurrentSessionFirstVisit(): boolean
export function markRegFirstVisitSent(): void
export function wasRegFirstVisitSent(): boolean
```

#### Внутренние детали

- `safeYm(method, ...args)` — защищённый вызов `ym(COUNTER_ID, method, ...)` с логированием.
- `COUNTER_ID` читается из `import.meta.env.VITE_METRICA_ID` и приводится к числу; если `null`, вызовы Метрики не выполняются.
- Для хранения «первых» визитов/сессий/целей используются `localStorage`-ключи:
  - `app_first_visit_at`
  - `app_first_session_id`
  - `app_reg_first_sent`

### Жизненный цикл и «пинги» (хиты)

- При монтировании приложения вызывается `startSession()`.
- На каждое изменение маршрута вызывается `startScreen(path)`, который:
  - закрывает предыдущий экран и отправляет цель `screen_time` с временем на нём,
  - отправляет хит `hit` для нового `path`.
- Автоматическое завершение сессии происходит при `visibilitychange` (в скрытое состояние), `pagehide` и `beforeunload` — при этом отправляется цель `session_end`.

Важно: в проекте не используются периодические «keep-alive» пинги. Роль пингов выполняют хиты `hit`, отправляемые на смену экрана. Дополнительно отправляются цели на завершение экрана/сессии и пользовательские действия.

### События/цели и их параметры

Ниже — перечень целей, отправляемых обёрткой, и где они используются.

- `screen_time` — время, проведённое на предыдущем экране
  - Параметры: `{ path: string, durationSec: number }`
  - Отправляется в `startScreen()` при переходе между экранами

- `session_end` — завершение сессии
  - Параметры: `{ durationSec: number, swipes: number, reason: 'hidden' | 'unload' | 'manual' }`
  - Отправляется в `endSession()` и при авто-завершении (скрытие вкладки/уход со страницы)

- `mainPageSwipe` — свайп карточки на главной
  - Параметры: нет
  - Отправляется на каждый `addSwipe()`

- `swipes_10` — достигнут порог 10 свайпов за сессию
  - Параметры: нет
  - Отправляется один раз за сессию внутри `addSwipe()`

- `reg_first_visit` — регистрация, совершённая в первую сессию
  - Параметры: нет
  - Отправляется из `authStore` после успешной регистрации при условиях:
    - `isCurrentSessionFirstVisit() === true`
    - `wasRegFirstVisitSent() === false`
  - После отправки выставляется `markRegFirstVisitSent()`

### Пользовательские параметры (userParams)

При успешном логине в `authStore` из JWT читается `sub` и отправляется в Метрику:

```ts
setUserParams({ userId: decoded.sub });
```

Это связывает события с конкретным пользователем в отчётах Метрики.

### Хиты (page hits)

Для учёта экранов используется метод `hit`:

```ts
trackHit(path, referrer?)
```

- Опционально передаётся `referrer` (в Метрике ключ называется `referer`).
- Вызывается из `startScreen(path)` на каждый переход.

### Где это используется в коде

- Инициализация жизненного цикла:
  - `App.tsx` — `startSession()` при монтировании и `startScreen(location.pathname)` при смене маршрута.
- Свайпы на главном экране:
  - `MainPageCard.tsx` — `addSwipe()` при завершении карточки.
- Регистрация/логин:
  - `store/authStore.ts` — условная отправка цели `reg_first_visit`, установка `userId` через `setUserParams()`.

### Примеры использования

Отправка произвольной цели:

```ts
import { trackGoal } from '@/tools/analytics/ym';

trackGoal('filters_applied', { selectedCount: 5 });
```

Учёт кастомного экрана (если требуется вне роутера):

```ts
import { startScreen } from '@/tools/analytics/ym';

startScreen('/custom-modal');
```

Установка пользовательских параметров:

```ts
import { setUserParams } from '@/tools/analytics/ym';

setUserParams({ subscription: 'premium', abGroup: 'A' });
```

Завершение сессии вручную (по событию приложения):

```ts
import { endSession } from '@/tools/analytics/ym';

endSession('manual');
```

### Отладка и безопасность вызовов

- Все вызовы обёртки логируются через `logger.info`/`logger.error`.
- Если Метрика не инициализирована или `VITE_METRICA_ID` не задан, вызовы безопасно игнорируются.

### Добавление новых событий

1) Определите точку вызова и импортируйте функцию:

```ts
import { trackGoal } from '@/tools/analytics/ym';
```

2) Отправьте цель с понятным именем и минимальным набором параметров:

```ts
trackGoal('purchase_started', { productId, price });
```

Рекомендации по именованию целей: `snake_case`, кратко и по делу; параметры — примитивы (числа/строки/boolean) или плоские объекты.

### Среда и конфигурация

- `VITE_METRICA_ID` — обязательная переменная окружения для активации Метрики.
- Встроенные опции инициализации (webvisor/clickmap/trackLinks/accurateTrackBounce) заданы в `index.html` и применяются глобально.


