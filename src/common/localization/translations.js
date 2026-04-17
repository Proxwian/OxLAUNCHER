export const LANGUAGES = {
  RU: 'ru',
  EN: 'en'
};

const directTranslations = {
  en: {
    'settings.sidebar.parameters': 'Settings',
    'settings.sidebar.general': 'General',
    'settings.sidebar.java': 'Java Settings',
    'settings.general.title': 'General',
    'settings.language.title': 'Language',
    'settings.language.description':
      'Choose the launcher interface language. Changes apply immediately.',
    'settings.language.ru': 'Russian',
    'settings.language.en': 'English'
  },
  ru: {
    'settings.sidebar.parameters': 'Параметры',
    'settings.sidebar.general': 'Общие',
    'settings.sidebar.java': 'Настройки Java',
    'settings.general.title': 'Общие',
    'settings.language.title': 'Язык',
    'settings.language.description':
      'Выберите язык интерфейса лаунчера. Изменения применяются сразу.',
    'settings.language.ru': 'Русский',
    'settings.language.en': 'English'
  }
};

export const legacyRuToEn = {
  Общие: 'General',
  'Настройки Java': 'Java Settings',
  Параметры: 'Settings',
  'Добавить клиент': 'Add Instance',
  'Своя сборка': 'Custom Client',
  CurseForge: 'CurseForge',
  Modrinth: 'Modrinth',
  Импорт: 'Import',
  'Выберите версию': 'Select a version',
  'Открыть...': 'Browse...',
  'Выберите язык интерфейса лаунчера. Изменения применяются сразу.':
    'Choose the launcher interface language. Changes apply immediately.',
  'Одновременные загрузки': 'Concurrent Downloads',
  'Сортировка сборок': 'Instance Sorting',
  'Предпочитаемый канал релизов': 'Preferred Release Channel',
  'Активность Discord': 'Discord Rich Presence',
  'Спрятать лаунчер во время игры': 'Hide Launcher While Playing',
  'Режим "Картошка"': 'Potato Mode',
  'Очистить данные сборок': 'Clear Instance Data',
  'Папка с пользовательскими данными': 'User Data Folder',
  'Сбросить путь': 'Reset Path',
  'Применить и перезапустить': 'Apply and Restart',
  'Копировать текущие данные в новую папку':
    'Copy current data into the new folder',
  'Релиз': 'Release',
  'Бета': 'Beta',
  'Альфа': 'Alpha',
  'По Алфавиту': 'Alphabetical',
  Последние: 'Last Played',
  'Часто запускаемые': 'Most Played',
  Никнейм: 'Username',
  Скопировано: 'Copied',
  Копировать: 'Copy',
  'У вас установлена актуальная версия лаунчера.':
    'You are using the latest launcher version.',
  'Доступно обновление лаунчера. Нажмите на кнопку Обновить, чтобы загрузить актуальную версию лаунчера':
    'A launcher update is available. Click Update to install the latest version.',
  Обновить: 'Update',
  'Нет обновлений': 'No updates',
  Играть: 'Play',
  ИГРАТЬ: 'PLAY',
  Описание: 'Overview',
  Скриншоты: 'Screenshots',
  Модификации: 'Mods',
  Обновления: 'Updates',
  Заметки: 'Notes',
  Ресурспаки: 'Resource Packs',
  Изменить: 'Change',
  'Управление клиентом': 'Manage Instance',
  'Версия Minecraft': 'Minecraft Version',
  Загрузчик: 'Loader',
  Аккаунт: 'Account',
  Наиграно: 'Time Played',
  'Последний запуск': 'Last Played',
  'Модпак CurseForge': 'CurseForge Modpack',
  Переименовать: 'Rename',
  'Настроить разрешение экрана': 'Set game resolution',
  'Настроить выделяемую Java память': 'Set Java memory',
  'Указать аргументы JVM': 'Set JVM arguments',
  'Настроить путь до Java': 'Set Java path',
  Пресеты: 'Presets',
  Сегодня: 'Today',
  Вчера: 'Yesterday',
  'Изменение версии Minecraft': 'Change Minecraft Version',
  ВНИМАНИЕ: 'WARNING',
  'Изменение вида загрузчика модификаций (Forge, Fabric, Quilt) приведёт к потере данных установленных модификаций.':
    'Changing the mod loader type (Forge, Fabric, Quilt) will remove data for installed mods.',
  'Путь к локальному файлу или прямая ссылка на архив':
    'Path to a local archive or direct ZIP link',
  'При импорте возникла ошибка.': 'An error occurred while importing.',
  'Название клиента слишком длинное, или некорректное. Введите другое':
    'The instance name is too long or invalid. Please enter another one.',
  'Клиент с таким названием уже существует!':
    'An instance with this name already exists!',
  'Делаю некоторые магические штуки...': 'Doing a few magical things...',
  'Открыть местоположение': 'Open Location',
  'Вернуться к сборкам': 'Back to Instances',
  'Импорт завершён!': 'Export completed!',
  'Автор: ': 'Author: ',
  'Скачиваний: ': 'Downloads: ',
  'Обновлено: ': 'Updated: ',
  'Версия MC: ': 'MC Version: ',
  'Загрузка файлов...': 'Loading files...',
  'Модификация недоступна': 'Mod unavailable',
  'Выберите версию': 'Select version',
  'Изменить версию': 'Change Version',
  Загрузить: 'Download',
  'Настраивает лаунчер': 'Configuring launcher',
  'Настраивает сборку': 'Configuring instance',
  'Подтверждение': 'Confirmation',
  'Подтвердить': 'Confirm',
  'Очистить': 'Clear',
  'Открыть папку': 'Open Folder',
  Авторизация: 'Authorization',
  'Загрузка...': 'Loading...',
  'Никнейм': 'Username',
  Пароль: 'Password',
  Войти: 'Login',
  Авторизоваться: 'Sign In',
  Регистрация: 'Register',
  'На главной': 'On Home Screen',
  'На главном экране': 'On Home Screen',
  'Скрыть объявление': 'Hide Announcement',
  'Показать объявление': 'Show Announcement',
  'Анекдот дня': 'Joke of the Day',
  Закрыть: 'Close',
  'Ещё один': 'One More',
  'Не удалось загрузить анекдот. Попробуйте ещё раз.':
    'Could not load a joke. Please try again.',
  'Ошибка при загрузке анекдота. Проверьте подключение к интернету.':
    'Error loading joke. Check your internet connection.',
  'Клиенты не установлены': 'No instances installed',
  'Нажмите на значок + в нижнем левом углу, чтобы скачать клиент':
    'Press the + button in the bottom-left corner to download an instance',
  Сортировка: 'Sorting',
  'По алфавиту': 'Alphabetical',
  'По последним': 'Last Played',
  'По популярным': 'Most Played',
  'Свой порядок': 'Custom Order',
  'В очереди': 'Queued',
  Остановить: 'Stop',
  Управление: 'Manage',
  Экспорт: 'Export',
  Дублировать: 'Duplicate',
  Починить: 'Repair',
  Удалить: 'Delete',
  'ПРОСССССТИТЕ. OxLAUNCHER врезался в крипера и взорвался..':
    'SORRRRRY. OxLAUNCHER crashed into a creeper and exploded..',
  'Перезапустить OxLAUNCHER': 'Restart OxLAUNCHER',
  'Автоопределение установки Java': 'Automatic Java Detection',
  'Запустить установку Java заново': 'Run Java installation again',
  'Отключите это, чтобы указать путь к Java вручную. Это отключит используемую OxLAUNCHER версию OpenJDK по умолчанию.':
    'Disable this to set the Java path manually. This will turn off OxLAUNCHER default OpenJDK usage.',
  'Разрешение экрана': 'Screen Resolution',
  'Выберите базовое разрешение экрана для игры (ширина х высота).':
    'Choose the base game resolution (width x height).',
  Ширина: 'Width',
  Высота: 'Height',
  'Память Java': 'Java Memory',
  'Выберите выделяемую Java память для запуска игры.':
    'Choose the Java memory allocated to launch the game.',
  'Параметры запуска JVM': 'JVM Launch Arguments',
  'Укажите собственные параметры запуска виртуальной машины Java.':
    'Specify custom Java Virtual Machine launch arguments.',
  'Способ запуска Minecraft': 'Minecraft Launch Method',
  'Выберите основной или альтернативный способ запуска игры. Используйте в случае, когда предыдущий метод не сработал.':
    'Choose the primary or alternative launch method. Use this if the previous method did not work.',
  'Подробнее / Версии': 'Details / Versions',
  Подробнее: 'Details',
  Подробности: 'Details',
  Установить: 'Install',
  'Поиск...': 'Search...',
  'По заданным критериям сборок не найдено.':
    'No modpacks matched the selected criteria.',
  'Произошла ошибка при загрузке списка...':
    'An error occurred while loading the list...',
  'Ничего не найдено по указанному запросу.':
    'Nothing found for the given query.',
  'Произошла ошибка при загрузке списка сборок...':
    'An error occurred while loading the modpack list...',
  'Какие файлы включить в архив': 'Which files to include in the archive',
  'Изображение скопировано в буфер обмена!':
    'Image copied to clipboard!',
  'Подождите загрузки предыдущего изображения':
    'Please wait for the previous image upload to finish',
  'Поделиться ссылкой на изображение': 'Share image link',
  'Копировать картинку': 'Copy Image',
  'Вы уверены, что хотите удалить это изображение?':
    'Are you sure you want to delete this image?',
  'Вы уверены, что хотите удалить этот скриншот?':
    'Are you sure you want to delete this screenshot?',
  'Удалить все': 'Delete All',
  Просмотр: 'View',
  'Скриншоты не найдены': 'No screenshots found',
  'Любуется скриншотами': 'Browsing screenshots',
  'Менеджер скриншотов': 'Screenshot Manager',
  'Изображение слишком большое...': 'Image is too large...',
  'Загрузка сторонних модификаций': 'Third-Party Mod Downloads',
  'Часть модов из сборки необходимо скачать через внутренний браузер.':
    'Some mods in this modpack must be downloaded through the built-in browser.',
  'Не переживайте, это произойдёт автоматически. Нажмите "Подтвердить", и подождите, пока все загрузки завершатся! Пожалуйста, не нажимайте ничего внутри браузера - процесс автоматический.':
    'Do not worry, this will happen automatically. Press "Confirm" and wait until all downloads finish. Please do not click anything inside the browser, the process is automatic.',
  'Cloudflare заблокировал трафик из вашей сети. Вы можете загрузить модификации вручную и поместить их в папку mods. Используйте кнопки Загрузить напротив незагруженных модификаций выше, и кнопку ниже, чтобы открыть папку с игрой.':
    'Cloudflare blocked traffic from your network. You can download the mods manually and put them into the mods folder. Use the Download buttons next to the missing mods above and the button below to open the game folder.',
  Отмена: 'Cancel',
  Продолжить: 'Continue',
  'Открыть все ссылки': 'Open All Links',
  'Сегодня': 'Today',
  'Вчера': 'Yesterday',
  'дней назад': 'days ago',
  'мес. назад': 'mo. ago',
  'лет назад': 'years ago',
  'мес.': 'mo.',
  'нед.': 'wk.',
  '1 неделя': '1 week',
  'дн.,': 'd,',
  'ч.,': 'h,',
  '1 час': '1 hour',
  'мин.': 'min.',
  '0 мин.': '0 min.',
  '1 мин.': '1 min.',
  'На главном экране': 'On Home Screen',
  'OxLAUNCHER - Лучший Minecraft лаунчер для установки сборок с модификациями и не только':
    'OxLAUNCHER - The best Minecraft launcher for installing modpacks and more'
};

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const legacyRuToEnEntries = Object.entries(legacyRuToEn).sort(
  ([a], [b]) => b.length - a.length
);

export const translateKey = (language, key, fallback = key) => {
  return directTranslations[language]?.[key] || fallback;
};

export const translateLegacyString = (language, value) => {
  if (language !== LANGUAGES.EN || typeof value !== 'string') return value;

  const match = value.match(/^(\s*)(.*?)(\s*)$/s);
  if (!match) return value;
  const [, prefix, core, suffix] = match;

  let translatedCore = core;
  legacyRuToEnEntries.forEach(([ru, en]) => {
    translatedCore = translatedCore.replace(new RegExp(escapeRegex(ru), 'g'), en);
  });

  return `${prefix}${translatedCore}${suffix}`;
};
