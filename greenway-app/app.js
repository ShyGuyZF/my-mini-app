// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И СОСТОЯНИЯ =====
let currentScreen = 'assistant';
let chatHistory = [];
let articles = [];
let goals = [];
let userData = {
    name: 'Гость',
    email: '',
    avatar: '👤',
    streak: 0,
    completedGoals: 0,
    articlesRead: 0,
    chatsCount: 0,
    activeGoals: 0
};

let dailyQuotes = [
    "Маленькие шаги каждый день приводят к большим результатам.",
    "Здоровье — это главная жизненная ценность.",
    "Ваше тело заслуживает заботы и внимания.",
    "Каждое движение — это инвестиция в ваше будущее.",
    "Восстановление — это путь, а не пункт назначения.",
    "Слушайте свое тело, оно знает, что ему нужно.",
    "Регулярность важнее интенсивности.",
    "Позвольте себе время на восстановление."
];

// ===== DOM ЭЛЕМЕНТЫ =====
const screens = {
    assistant: document.getElementById('assistant-screen'),
    library: null,
    goals: null,
    about: null,
    profile: null
};

const navItems = document.querySelectorAll('.nav-item');
const appContent = document.getElementById('app-content');

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadScreen('assistant');
    initAssistantScreen();
    loadFromStorage();
});

// ===== НАВИГАЦИЯ =====
function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.dataset.screen;
            loadScreen(screen);
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function loadScreen(screenName) {
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });

    if (!screens[screenName]) {
        screens[screenName] = createScreen(screenName);
        appContent.appendChild(screens[screenName]);
    }

    screens[screenName].classList.add('active');
    currentScreen = screenName;
}

function createScreen(screenName) {
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.id = `${screenName}-screen`;

    switch (screenName) {
        case 'library':
            screen.innerHTML = `
                <div class="library-container">
                    <div class="library-header">
                        <h1><i class="fas fa-book-open"></i> Библиотека знаний</h1>
                        <p class="subtitle">Статьи от специалистов Пульса жизни</p>
                        
                        <div class="category-tabs" id="category-tabs">
                            <button class="category-tab active" data-category="all">Все</button>
                            <button class="category-tab" data-category="МАССАЖ">Массаж</button>
                            <button class="category-tab" data-category="ФИТНЕС-ГАЛЕРЕЯ">Фитнес</button>
                        </div>
                        
                        <div class="subcategory-filters" id="subcategory-filters"></div>
                        
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="search-input" placeholder="Поиск по статьям...">
                        </div>
                    </div>
                    
                    <div class="articles-stats">
                        <span class="stat">
                            <i class="fas fa-book"></i>
                            <span id="total-articles">0</span> статей
                        </span>
                        <span class="stat">
                            <i class="fas fa-star"></i>
                            <span id="favorite-count">0</span> в избранном
                        </span>
                    </div>
                    
                    <div class="articles-grid" id="articles-grid">
                        <div class="loading">Загрузка статей...</div>
                    </div>
                </div>
            `;

            setTimeout(() => {
                loadArticles();
                initLibraryFilters();
            }, 100);
            break;

        case 'goals':
            screen.innerHTML = `
                <div class="goals-container">
                    <div class="goals-header">
                        <h1><i class="fas fa-chart-line"></i> Мои цели</h1>
                        <p class="subtitle">Отслеживайте свой прогресс реабилитации</p>
                    </div>
                    
                    <div class="goals-stats">
                        <div class="stat-card">
                            <div class="stat-icon">🔥</div>
                            <div class="stat-info">
                                <div class="stat-value" id="current-streak">0</div>
                                <div class="stat-label">Дней подряд</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">✅</div>
                            <div class="stat-info">
                                <div class="stat-value" id="completed-goals">0</div>
                                <div class="stat-label">Выполнено целей</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📚</div>
                            <div class="stat-info">
                                <div class="stat-value" id="articles-read">0</div>
                                <div class="stat-label">Статей прочитано</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="add-goal-section">
                        <h3><i class="fas fa-plus-circle"></i> Добавить новую цель</h3>
                        <div class="goal-input">
                            <input type="text" id="new-goal-input" placeholder="Например: Делать зарядку каждый день">
                            <button id="add-goal-btn"><i class="fas fa-plus"></i> Добавить</button>
                        </div>
                        
                        <div class="goal-presets">
                            <button class="preset-btn" data-goal="Утренняя зарядка 10 мин">Утренняя зарядка</button>
                            <button class="preset-btn" data-goal="Прогулка 30 минут">Прогулка 30 мин</button>
                            <button class="preset-btn" data-goal="Прочитать 1 статью">Чтение статьи</button>
                            <button class="preset-btn" data-goal="Упражнения для спины">Упражнения для спины</button>
                        </div>
                    </div>
                    
                    <div class="goals-list">
                        <h3><i class="fas fa-list-check"></i> Активные цели</h3>
                        <div id="active-goals-list">
                            <div class="empty-state">
                                <i class="fas fa-bullseye"></i>
                                <p>У вас пока нет целей. Добавьте первую!</p>
                            </div>
                        </div>
                        
                        <h3><i class="fas fa-check-circle"></i> Выполненные цели</h3>
                        <div id="completed-goals-list">
                            <div class="empty-state">
                                <i class="fas fa-trophy"></i>
                                <p>Здесь появятся ваши достижения</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="motivation-quote">
                        <i class="fas fa-quote-left"></i>
                        <p id="daily-quote">Маленькие шаги каждый день приводят к большим результатам.</p>
                        <i class="fas fa-quote-right"></i>
                    </div>
                </div>
            `;

            setTimeout(() => {
                initGoalsScreen();
            }, 100);
            break;

        case 'about':
            screen.innerHTML = `
                <div class="about-container">
                    <div class="about-header">
                        <h1><i class="fas fa-heart"></i> О Greenway</h1>
                        <p class="subtitle">Ваш путь к здоровью и гармонии</p>
                    </div>
                    
                    <div class="about-content">
                        <div class="about-card mission-card">
                            <div class="about-icon">🏥</div>
                            <h3>Наша миссия</h3>
                            <p>Мы — команда специалистов, предоставляющая комплексные реабилитационные услуги.</p>
                        </div>
                        
                        <div class="team-section">
                            <h3><i class="fas fa-users"></i> Наша команда</h3>
                            <div class="team-grid">
                                <div class="team-member">
                                    <div class="member-avatar">👨‍⚕️</div>
                                    <h4>Алексей Петров</h4>
                                    <p class="member-role">Кинезиолог</p>
                                    <p class="member-bio">Специалист по восстановительной медицине</p>
                                </div>
                                <div class="team-member">
                                    <div class="member-avatar">👩‍⚕️</div>
                                    <h4>Мария Сидорова</h4>
                                    <p class="member-role">Психолог</p>
                                    <p class="member-bio">Работа с психосоматикой и стрессом</p>
                                </div>
                                <div class="team-member">
                                    <div class="member-avatar">💆</div>
                                    <h4>Дмитрий Иванов</h4>
                                    <p class="member-role">Массажист</p>
                                    <p class="member-bio">Специалист по медицинскому массажу</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="principles-section">
                            <h3><i class="fas fa-star"></i> Наши принципы</h3>
                            <div class="principles-list">
                                <div class="principle">
                                    <div class="principle-icon">🎯</div>
                                    <div class="principle-content">
                                        <h4>Индивидуальный подход</h4>
                                        <p>Каждая программа разрабатывается персонально под ваши потребности</p>
                                    </div>
                                </div>
                                <div class="principle">
                                    <div class="principle-icon">🤝</div>
                                    <div class="principle-content">
                                        <h4>Поддержка на каждом этапе</h4>
                                        <p>Мы остаемся с вами на протяжении всего пути восстановления</p>
                                    </div>
                                </div>
                                <div class="principle">
                                    <div class="principle-icon">💚</div>
                                    <div class="principle-content">
                                        <h4>Забота о результате</h4>
                                        <p>Наша цель — вернуть вас к активной и полноценной жизни</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="cta-section">
                            <div class="cta-card">
                                <h3>Готовы начать?</h3>
                                <p>Запишитесь на первую консультацию бесплатно</p>
                                <button class="cta-btn" id="book-consultation-btn">
                                    <i class="fas fa-calendar-check"></i> Записаться на консультацию
                                </button>
                            </div>
                            
                            <div class="join-card">
                                <h3>Присоединиться к команде</h3>
                                <p>Мы приглашаем к сотрудничеству врачей, педагогов, тренеров и всех, кто готов безвозмездно делиться своими знаниями.</p>
                                <button class="secondary-btn" id="join-team-btn">
                                    <i class="fas fa-handshake"></i> Стать партнером
                                </button>
                            </div>
                        </div>
                        
                        <div class="contact-section">
                            <h3><i class="fas fa-map-marker-alt"></i> Контакты</h3>
                            <div class="contact-info">
                                <p><i class="fas fa-phone"></i> +7 (XXX) XXX-XX-XX</p>
                                <p><i class="fas fa-envelope"></i> info@greenway-rehab.ru</p>
                                <p><i class="fas fa-clock"></i> Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(() => {
                initAboutScreen();
            }, 100);
            break;

        case 'profile':
            screen.innerHTML = `
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="user-avatar">
                            <div class="avatar-circle">👤</div>
                            <button class="edit-avatar-btn"><i class="fas fa-camera"></i></button>
                        </div>
                        <h1 id="user-name">Гость</h1>
                        <p class="user-email" id="user-email">Войдите в аккаунт</p>
                    </div>
                    
                    <div class="profile-stats">
                        <div class="profile-stat">
                            <div class="stat-number" id="profile-chats">0</div>
                            <div class="stat-label">Диалогов с ботом</div>
                        </div>
                        <div class="profile-stat">
                            <div class="stat-number" id="profile-articles">0</div>
                            <div class="stat-label">Прочитано статей</div>
                        </div>
                        <div class="profile-stat">
                            <div class="stat-number" id="profile-goals">0</div>
                            <div class="stat-label">Активных целей</div>
                        </div>
                    </div>
                    
                    <div class="profile-menu">
                        <h3><i class="fas fa-user-cog"></i> Настройки</h3>
                        
                        <div class="menu-item" id="edit-profile-btn">
                            <div class="menu-icon"><i class="fas fa-user-edit"></i></div>
                            <div class="menu-content">
                                <div class="menu-title">Редактировать профиль</div>
                                <div class="menu-subtitle">Имя, email, фото</div>
                            </div>
                            <div class="menu-arrow"><i class="fas fa-chevron-right"></i></div>
                        </div>
                        
                        <div class="menu-item" id="notifications-btn">
                            <div class="menu-icon"><i class="fas fa-bell"></i></div>
                            <div class="menu-content">
                                <div class="menu-title">Уведомления</div>
                                <div class="menu-subtitle">Настройка оповещений</div>
                            </div>
                            <div class="menu-toggle">
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="menu-item" id="appearance-btn">
                            <div class="menu-icon"><i class="fas fa-palette"></i></div>
                            <div class="menu-content">
                                <div class="menu-title">Внешний вид</div>
                                <div class="menu-subtitle">Темная тема, размер текста</div>
                            </div>
                            <div class="menu-arrow"><i class="fas fa-chevron-right"></i></div>
                        </div>
                        
                        <div class="menu-item" id="data-management-btn">
                            <div class="menu-icon"><i class="fas fa-database"></i></div>
                            <div class="menu-content">
                                <div class="menu-title">Управление данными</div>
                                <div class="menu-subtitle">Экспорт, резервное копирование</div>
                            </div>
                            <div class="menu-arrow"><i class="fas fa-chevron-right"></i></div>
                        </div>
                        
                        <div class="menu-item" id="help-btn">
                            <div class="menu-icon"><i class="fas fa-question-circle"></i></div>
                            <div class="menu-content">
                                <div class="menu-title">Помощь и поддержка</div>
                                <div class="menu-subtitle">FAQ, обратная связь</div>
                            </div>
                            <div class="menu-arrow"><i class="fas fa-chevron-right"></i></div>
                        </div>
                        
                        <div class="menu-item" id="about-app-btn">
                            <div class="menu-icon"><i class="fas fa-info-circle"></i></div>
                            <div class="menu-content">
                                <div class="menu-title">О приложении</div>
                                <div class="menu-subtitle">Версия, лицензия</div>
                            </div>
                            <div class="menu-arrow"><i class="fas fa-chevron-right"></i></div>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="logout-btn" id="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Выйти
                        </button>
                        
                        <div class="app-version">
                            <p>Greenway: Реабилитация v1.0.0</p>
                            <p class="version-info">© 2024 Все права защищены</p>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(() => {
                initProfileScreen();
            }, 100);
            break;
    }

    return screen;
}

// ===== LOCALSTORAGE =====
function saveToStorage() {
    localStorage.setItem('greenway_chat_history', JSON.stringify(chatHistory));
}

function loadFromStorage() {
    const saved = localStorage.getItem('greenway_chat_history');
    if (saved) {
        chatHistory = JSON.parse(saved);
        renderChatHistory();
    }
}

// ===== ЧАТ-БОТ =====
const botStates = {
    INITIAL: 'initial',
    WAITING_COMPLAINT: 'waiting_complaint',
    WAITING_LOCATION: 'waiting_location',
    WAITING_PAIN_TYPE: 'waiting_pain_type',
    WAITING_DIASTASIS_DETAILS: 'waiting_diastasis_details',
    WAITING_KNEE_DETAILS: 'waiting_knee_details',
    WAITING_FOOT_DETAILS: 'waiting_foot_details',
    WAITING_OTHER_DESCRIPTION: 'waiting_other_description',
    WAITING_ACTIVITY_LEVEL: 'waiting_activity_level',
    WAITING_DURATION: 'waiting_duration',
    COMPLETED: 'completed'
};

let currentBotState = botStates.INITIAL;
let currentSurvey = {
    complaint: '',
    location: '',
    painType: '',
    activityLevel: '',
    duration: '',
    details: {},
    timestamp: ''
};

// Инициализация экрана помощника
function initAssistantScreen() {
    const screen = screens.assistant;
    screen.innerHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <h2><i class="fas fa-robot"></i> Помощник Пульса жизни</h2>
                <p class="subtitle">Я помогу определить, что вас беспокоит</p>
                <button class="clear-chat-btn" id="clear-chat-btn" title="Очистить историю">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            
            <div class="chat-messages" id="chat-messages"></div>
            
            <div class="quick-buttons" id="quick-buttons"></div>
            
            <div class="input-area">
                <input type="text" id="user-input" placeholder="Напишите сообщение...">
                <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    initChat();
}

// Инициализация чата
function initChat() {
    // Загружаем историю чата
    if (chatHistory.length > 0) {
        renderChatHistory();
    } else {
        addBotMessage('Здравствуйте! Меня зовут Гринви. Я помогу определить, что вас беспокоит, чтобы наш специалист мог подготовиться к встрече с вами. Что вас беспокоит?');
        showQuickButtons([
            { text: 'СПИНА', value: 'спина' },
            { text: 'ШЕЯ', value: 'шея' },
            { text: 'ДИАСТАЗ', value: 'диастаз' },
            { text: 'КОЛЕНИ', value: 'колени' },
            { text: 'СТОПЫ', value: 'стопы' },
            { text: 'ДРУГОЕ', value: 'другое' }
        ]);
    }

    currentBotState = botStates.WAITING_COMPLAINT;

    // Настройка обработчиков
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Кнопка очистки чата
    document.getElementById('clear-chat-btn').addEventListener('click', clearChat);
}

// Добавление сообщения бота
function addBotMessage(text) {
    const messages = document.getElementById('chat-messages');
    const message = document.createElement('div');
    message.className = 'message bot-message';

    // Если текст содержит рекомендации, добавляем специальный стиль
    if (text.includes('**Персональные рекомендации:**')) {
        const recommendations = text.split('\n');
        const mainText = recommendations.shift();
        const listItems = recommendations.filter(item => item.trim());

        message.innerHTML = `
            <div class="avatar">G</div>
            <div class="bubble">
                <div class="recommendations">
                    <p><strong>${mainText.replace('**', '').replace('**', '')}</strong></p>
                    <ul>
                        ${listItems.map(item => `<li>${item.replace('• ', '')}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    } else {
        message.innerHTML = `
            <div class="avatar">G</div>
            <div class="bubble">${text}</div>
        `;
    }

    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;

    // Сохраняем в историю
    chatHistory.push({ type: 'bot', text, timestamp: new Date().toISOString() });
    saveToStorage();
}

// Добавление сообщения пользователя
function addUserMessage(text) {
    const messages = document.getElementById('chat-messages');
    const message = document.createElement('div');
    message.className = 'message user-message';
    message.innerHTML = `
        <div class="bubble">${text}</div>
        <div class="avatar">Вы</div>
    `;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;

    // Сохраняем в историю
    chatHistory.push({ type: 'user', text, timestamp: new Date().toISOString() });
    saveToStorage();
}

// Показать быстрые кнопки
function showQuickButtons(buttons) {
    const container = document.getElementById('quick-buttons');
    container.innerHTML = '';

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'quick-btn';
        button.textContent = btn.text;
        button.dataset.value = btn.value;
        button.addEventListener('click', () => handleQuickButton(btn.value));
        container.appendChild(button);
    });
}

// Обработка нажатия быстрой кнопки
function handleQuickButton(value) {
    addUserMessage(value.toUpperCase());

    // Сохраняем ответ в текущий опрос
    saveSurveyAnswer(value);

    switch (currentBotState) {
        case botStates.WAITING_COMPLAINT:
            handleComplaint(value);
            break;
        case botStates.WAITING_LOCATION:
            handleLocation(value);
            break;
        case botStates.WAITING_PAIN_TYPE:
            handlePainType(value);
            break;
        case botStates.WAITING_DIASTASIS_DETAILS:
            handleDiastasisDetails(value);
            break;
        case botStates.WAITING_KNEE_DETAILS:
            handleKneeDetails(value);
            break;
        case botStates.WAITING_FOOT_DETAILS:
            handleFootDetails(value);
            break;
        case botStates.WAITING_OTHER_DESCRIPTION:
            handleOtherDescription(value);
            break;
        case botStates.WAITING_ACTIVITY_LEVEL:
            handleActivityLevel(value);
            break;
        case botStates.WAITING_DURATION:
            handleDuration(value);
            break;
    }
}

// Обработка жалобы
function handleComplaint(complaint) {
    currentSurvey.complaint = complaint;

    switch (complaint) {
        case 'спина':
            addBotMessage('Понял. Уточните, пожалуйста, в каком отделе спины вы чувствуете дискомфорт?');
            showQuickButtons([
                { text: 'ПОЯСНИЦА', value: 'поясница' },
                { text: 'КРЕСТЕЦ', value: 'крестец' },
                { text: 'ГРУДНОЙ ОТДЕЛ', value: 'грудной отдел' },
                { text: 'МЕЖДУ ЛОПАТКАМИ', value: 'между лопатками' },
                { text: 'ВСЯ СПИНА', value: 'вся спина' }
            ]);
            currentBotState = botStates.WAITING_LOCATION;
            break;

        case 'шея':
            addBotMessage('Понял. Уточните, где именно в области шеи вы чувствуете дискомфорт?');
            showQuickButtons([
                { text: 'СПЕРЕДИ', value: 'спереди' },
                { text: 'СЗАДИ', value: 'сзади' },
                { text: 'СБОКУ СЛЕВА', value: 'слева' },
                { text: 'СБОКУ СПРАВА', value: 'справа' },
                { text: 'ВСЯ ШЕЯ', value: 'вся шея' }
            ]);
            currentBotState = botStates.WAITING_LOCATION;
            break;

        case 'диастаз':
            addBotMessage('Понял. Диастаз — это расхождение прямых мышц живота. Уточните:');
            showQuickButtons([
                { text: 'ПОСЛЕ РОДОВ', value: 'после родов' },
                { text: 'ПОСЛЕ ОПЕРАЦИИ', value: 'после операции' },
                { text: 'ИЗ-ЗА ЛИШНЕГО ВЕСА', value: 'лишний вес' },
                { text: 'НЕ ЗНАЮ ПРИЧИНЫ', value: 'не знаю' }
            ]);
            currentBotState = botStates.WAITING_DIASTASIS_DETAILS;
            break;

        case 'колени':
            addBotMessage('Понял. Уточните, какое колено вас беспокоит?');
            showQuickButtons([
                { text: 'ЛЕВОЕ', value: 'левое' },
                { text: 'ПРАВОЕ', value: 'правое' },
                { text: 'ОБА', value: 'оба' }
            ]);
            currentBotState = botStates.WAITING_KNEE_DETAILS;
            break;

        case 'стопы':
            addBotMessage('Понял. Уточните, какая часть стопы вас беспокоит?');
            showQuickButtons([
                { text: 'ПЯТКА', value: 'пятка' },
                { text: 'СВОД СТОПЫ', value: 'свод' },
                { text: 'ПАЛЬЦЫ', value: 'пальцы' },
                { text: 'ГОЛЕНОСТОП', value: 'голеностоп' }
            ]);
            currentBotState = botStates.WAITING_FOOT_DETAILS;
            break;

        case 'другое':
            addBotMessage('Опишите, пожалуйста, что именно вас беспокоит. Можно написать текстом в поле ниже или пропустить описание.');
            showQuickButtons([
                { text: 'ПРОПУСТИТЬ ОПИСАНИЕ', value: 'пропустить' }
            ]);
            currentBotState = botStates.WAITING_OTHER_DESCRIPTION;
            break;

        default:
            addBotMessage('Записал. Рекомендую записаться на консультацию к нашему специалисту.');
            showFinalButtons();
            currentBotState = botStates.COMPLETED;
    }
}

// Обработка локализации боли
function handleLocation(location) {
    currentSurvey.location = location;

    // Для разных жалоб - разные вопросы о характере боли
    let painQuestions = [
        { text: 'ОСТРАЯ БОЛЬ', value: 'острая боль' },
        { text: 'НОЮЩАЯ БОЛЬ', value: 'ноющая боль' },
        { text: 'СКОВАННОСТЬ', value: 'скованность' }
    ];

    if (currentSurvey.complaint === 'спина') {
        painQuestions.push(
            { text: 'ПРОСТРЕЛЫ', value: 'прострелы' },
            { text: 'ОНЕМЕНИЕ', value: 'онемение' },
            { text: 'СЛАБОСТЬ В НОГАХ', value: 'слабость в ногах' }
        );
    } else if (currentSurvey.complaint === 'шея') {
        painQuestions.push(
            { text: 'ГОЛОВОКРУЖЕНИЕ', value: 'головокружение' },
            { text: 'ГОЛОВНАЯ БОЛЬ', value: 'головная боль' },
            { text: 'ОГРАНИЧЕНИЕ ПОВОРОТА', value: 'ограничение поворота' }
        );
    } else {
        painQuestions.push(
            { text: 'ЖЖЕНИЕ', value: 'жжение' },
            { text: 'ПОКАЛЫВАНИЕ', value: 'покалывание' },
            { text: 'ОТЕК', value: 'отек' }
        );
    }

    addBotMessage('Спасибо. Опишите характер боли или ощущений? (можно выбрать несколько)');
    showQuickButtons(painQuestions);
    currentBotState = botStates.WAITING_PAIN_TYPE;
}

// Обработка типа боли
function handlePainType(painType) {
    currentSurvey.painType = painType;

    addBotMessage('Как часто вы занимаетесь физической активностью? Это важно для рекомендаций.');
    showQuickButtons([
        { text: 'КАЖДЫЙ ДЕНЬ', value: 'ежедневно' },
        { text: '2-3 РАЗА В НЕДЕЛЮ', value: '2-3 раза' },
        { text: 'РЕДКО ИЛИ НИКОГДА', value: 'редко' },
        { text: 'ТОЛЬКО РАБОТА ПО ДОМУ', value: 'работа по дому' }
    ]);
    currentBotState = botStates.WAITING_ACTIVITY_LEVEL;
}

// Обработка деталей диастаза
function handleDiastasisDetails(detail) {
    currentSurvey.details.diastasisCause = detail;

    addBotMessage('Как давно вы заметили расхождение мышц?');
    showQuickButtons([
        { text: 'МЕНЕЕ МЕСЯЦА', value: '< 1 месяца' },
        { text: '1-6 МЕСЯЦЕВ', value: '1-6 месяцев' },
        { text: 'БОЛЕЕ ПОЛУГОДА', value: '> 6 месяцев' },
        { text: 'БОЛЕЕ ГОДА', value: '> 1 года' }
    ]);
    currentBotState = botStates.WAITING_DURATION;
}

// Обработка деталей коленей
function handleKneeDetails(detail) {
    currentSurvey.details.knee = detail;

    addBotMessage(`Записал: ${detail} колено. Что именно беспокоит?`);
    showQuickButtons([
        { text: 'БОЛЬ ПРИ ХОДЬБЕ', value: 'боль при ходьбе' },
        { text: 'БОЛЬ В ПОКОЕ', value: 'боль в покое' },
        { text: 'ОТЕК И ПРИПУХЛОСТЬ', value: 'отек' },
        { text: 'ХРУСТ И ЩЕЛЧКИ', value: 'хруст' },
        { text: 'НЕУСТОЙЧИВОСТЬ', value: 'неустойчивость' },
        { text: 'ТРУДНО СГИБАТЬ', value: 'трудно сгибать' }
    ]);
    currentBotState = botStates.WAITING_PAIN_TYPE;
}

// Обработка деталей стоп
function handleFootDetails(detail) {
    currentSurvey.details.footPart = detail;

    addBotMessage(`Записал: ${detail}. Какой характер дискомфорта?`);
    showQuickButtons([
        { text: 'ЖЖЕНИЕ, ГОРЕНИЕ', value: 'жжение' },
        { text: 'ОСТРАЯ КОЛЮЩАЯ БОЛЬ', value: 'острая боль' },
        { text: 'ТЯНУЩАЯ БОЛЬ', value: 'тянущая боль' },
        { text: 'ОНЕМЕНИЕ', value: 'онемение' },
        { text: 'СУДОРОГИ', value: 'судороги' },
        { text: 'ИЗМЕНЕНИЕ ФОРМЫ', value: 'изменение формы' }
    ]);
    currentBotState = botStates.WAITING_PAIN_TYPE;
}

// Обработка описания "другого"
function handleOtherDescription(value) {
    if (value === 'пропустить') {
        currentSurvey.details.description = 'Пользователь пропустил описание';
    } else {
        currentSurvey.details.description = value;
    }

    addBotMessage('Как часто вы занимаетесь физической активностью?');
    showQuickButtons([
        { text: 'КАЖДЫЙ ДЕНЬ', value: 'ежедневно' },
        { text: '2-3 РАЗА В НЕДЕЛЮ', value: '2-3 раза' },
        { text: 'РЕДКО ИЛИ НИКОГДА', value: 'редко' }
    ]);
    currentBotState = botStates.WAITING_ACTIVITY_LEVEL;
}

// Обработка уровня активности
function handleActivityLevel(level) {
    currentSurvey.activityLevel = level;

    addBotMessage('Как давно вас беспокоит эта проблема?');
    showQuickButtons([
        { text: 'НЕДАВНО (ДО 2 НЕДЕЛЬ)', value: 'недавно' },
        { text: 'НЕСКОЛЬКО МЕСЯЦЕВ', value: 'несколько месяцев' },
        { text: 'БОЛЕЕ ГОДА', value: 'более года' },
        { text: 'ПЕРИОДИЧЕСКИ ОБОСТРЯЕТСЯ', value: 'периодически' }
    ]);
    currentBotState = botStates.WAITING_DURATION;
}

// Обработка длительности проблемы
function handleDuration(duration) {
    currentSurvey.duration = duration;
    currentSurvey.timestamp = new Date().toISOString();

    // Генерируем персональные рекомендации
    const recommendations = generateRecommendations();

    addBotMessage('Спасибо за подробные ответы! Вот что я могу порекомендовать:');

    setTimeout(() => {
        addBotMessage(recommendations);
    }, 1500);

    setTimeout(() => {
        showFinalButtons();
        saveSurveyToStorage();
    }, 3000);

    currentBotState = botStates.COMPLETED;
}

// Генерация персональных рекомендаций
function generateRecommendations() {
    let recommendations = [];
    recommendations.push('📋 **Персональные рекомендации:**');

    // Общие рекомендации
    recommendations.push('• Консультация специалиста обязательна для точной диагностики');

    // Рекомендации в зависимости от жалобы
    switch (currentSurvey.complaint) {
        case 'спина':
            recommendations.push('• Избегайте поднятия тяжестей');
            recommendations.push('• Используйте ортопедический матрас');
            recommendations.push('• Делайте упражнения на растяжку поясницы');
            if (currentSurvey.painType === 'острая боль') {
                recommendations.push('• В остром периоде — покой, холодные компрессы');
            }
            break;

        case 'шея':
            recommendations.push('• Делайте перерывы при работе за компьютером');
            recommendations.push('• Используйте ортопедическую подушку');
            recommendations.push('• Выполняйте упражнения для шеи каждые 2 часа');
            if (currentSurvey.location === 'сзади') {
                recommendations.push('• Массаж воротниковой зоны 2 раза в неделю');
            }
            break;

        case 'диастаз':
            recommendations.push('• Исключите упражнения на пресс');
            recommendations.push('• Носите бандаж при физических нагрузках');
            recommendations.push('• Выполняйте дыхательные упражнения');
            if (currentSurvey.details.diastasisCause === 'после родов') {
                recommendations.push('• Консультация гинеколога обязательна');
            }
            break;

        case 'колени':
            recommendations.push('• Носите удобную обувь с амортизацией');
            recommendations.push('• Избегайте бега по твердой поверхности');
            recommendations.push('• Укрепляйте мышцы бедра');
            if (currentSurvey.details.knee === 'оба') {
                recommendations.push('• Возможна системная причина — нужны анализы');
            }
            break;

        case 'стопы':
            recommendations.push('• Носите ортопедические стельки');
            recommendations.push('• Делайте ванночки для ног с морской солью');
            recommendations.push('• Массаж стоп перед сном');
            if (currentSurvey.details.footPart === 'пятка') {
                recommendations.push('• Возможна плантарный фасциит — нужен рентген');
            }
            break;
    }

    // Рекомендации по активности
    if (currentSurvey.activityLevel === 'редко') {
        recommendations.push('• Начните с легкой ходьбы 30 минут в день');
        recommendations.push('• Постепенно увеличивайте активность');
    } else if (currentSurvey.activityLevel === 'ежедневно') {
        recommendations.push('• Возможно, нужна коррекция нагрузки');
        recommendations.push('• Добавьте дни восстановления');
    }

    // Рекомендации по длительности
    if (currentSurvey.duration === 'более года') {
        recommendations.push('• Хроническое состояние требует комплексного подхода');
        recommendations.push('• Рассмотрите курс реабилитации');
    } else if (currentSurvey.duration === 'недавно') {
        recommendations.push('• В остром периоде важен покой');
        recommendations.push('• При ухудшении — срочно к врачу');
    }

    return recommendations.join('\n');
}

// Показать финальные кнопки
function showFinalButtons() {
    showQuickButtons([
        {
            text: '📅 ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ',
            value: 'запись',
            action: () => {
                showConsultationModal();
                // Передаем данные опроса в форму записи
                setTimeout(() => {
                    const commentField = document.getElementById('client-comment');
                    if (commentField) {
                        commentField.value = `Жалоба: ${currentSurvey.complaint}\nЛокализация: ${currentSurvey.location}\nХарактер: ${currentSurvey.painType}\nДлительность: ${currentSurvey.duration}`;
                    }
                }, 500);
            }
        },
        {
            text: '📚 ПОЛУЧИТЬ СТАТЬИ',
            value: 'статьи',
            action: () => {
                // Переход в библиотеку с фильтрацией по теме
                loadScreen('library');
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                document.querySelector('[data-screen="library"]').classList.add('active');

                // Фильтруем статьи по теме
                setTimeout(() => {
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.value = currentSurvey.complaint;
                        searchQuery = currentSurvey.complaint;
                        filterArticles();
                    }
                }, 1000);

                showToast(`📖 Подобрали статьи по теме "${currentSurvey.complaint}"`);
            }
        },
        {
            text: '🔄 НАЧАТЬ НОВЫЙ ОПРОС',
            value: 'новый опрос',
            action: () => {
                // Сброс состояния бота
                currentBotState = botStates.WAITING_COMPLAINT;
                currentSurvey = {
                    complaint: '',
                    location: '',
                    painType: '',
                    activityLevel: '',
                    duration: '',
                    details: {},
                    timestamp: ''
                };

                addBotMessage('Отлично! Давайте начнем новый опрос. Что вас беспокоит?');
                showQuickButtons([
                    { text: 'СПИНА', value: 'спина' },
                    { text: 'ШЕЯ', value: 'шея' },
                    { text: 'ДИАСТАЗ', value: 'диастаз' },
                    { text: 'КОЛЕНИ', value: 'колени' },
                    { text: 'СТОПЫ', value: 'стопы' },
                    { text: 'ДРУГОЕ', value: 'другое' }
                ]);
            }
        }
    ]);

    // Обновляем обработчики для кнопок с действиями
    document.querySelectorAll('.quick-btn').forEach(btn => {
        const originalClick = btn.onclick;
        btn.onclick = null;
        btn.addEventListener('click', function () {
            const value = this.dataset.value;
            const buttonConfig = [
                { value: 'запись', action: () => showConsultationModal() },
                {
                    value: 'статьи', action: () => {
                        loadScreen('library');
                        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                        document.querySelector('[data-screen="library"]').classList.add('active');
                        setTimeout(() => {
                            const searchInput = document.getElementById('search-input');
                            if (searchInput) {
                                searchInput.value = currentSurvey.complaint;
                                searchQuery = currentSurvey.complaint;
                                filterArticles();
                            }
                        }, 1000);
                    }
                },
                {
                    value: 'новый опрос', action: () => {
                        currentBotState = botStates.WAITING_COMPLAINT;
                        currentSurvey = {
                            complaint: '',
                            location: '',
                            painType: '',
                            activityLevel: '',
                            duration: '',
                            details: {},
                            timestamp: ''
                        };
                        addBotMessage('Отлично! Давайте начнем новый опрос. Что вас беспокоит?');
                        showQuickButtons([
                            { text: 'СПИНА', value: 'спина' },
                            { text: 'ШЕЯ', value: 'шея' },
                            { text: 'ДИАСТАЗ', value: 'диастаз' },
                            { text: 'КОЛЕНИ', value: 'колени' },
                            { text: 'СТОПЫ', value: 'стопы' },
                            { text: 'ДРУГОЕ', value: 'другое' }
                        ]);
                    }
                }
            ].find(b => b.value === value);

            if (buttonConfig) {
                buttonConfig.action();
            }
        });
    });
}

// Сохранение ответа опроса
function saveSurveyAnswer(value) {
    switch (currentBotState) {
        case botStates.WAITING_COMPLAINT:
            currentSurvey.complaint = value;
            break;
        case botStates.WAITING_LOCATION:
            currentSurvey.location = value;
            break;
        case botStates.WAITING_PAIN_TYPE:
            currentSurvey.painType = value;
            break;
        case botStates.WAITING_DIASTASIS_DETAILS:
            currentSurvey.details.diastasisCause = value;
            break;
        case botStates.WAITING_KNEE_DETAILS:
            currentSurvey.details.knee = value;
            break;
        case botStates.WAITING_FOOT_DETAILS:
            currentSurvey.details.footPart = value;
            break;
        case botStates.WAITING_ACTIVITY_LEVEL:
            currentSurvey.activityLevel = value;
            break;
        case botStates.WAITING_DURATION:
            currentSurvey.duration = value;
            break;
    }
}

// Сохранение полного опроса
function saveSurveyToStorage() {
    let surveys = JSON.parse(localStorage.getItem('greenway_surveys') || '[]');
    surveys.push(currentSurvey);
    localStorage.setItem('greenway_surveys', JSON.stringify(surveys));

    // Обновляем статистику пользователя
    userData.chatsCount = (userData.chatsCount || 0) + 1;
    saveUserData();
    updateProfileStats();
}

// Отправка текстового сообщения
function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();

    if (text) {
        addUserMessage(text);

        // Обработка текстового ввода в зависимости от состояния
        switch (currentBotState) {
            case botStates.WAITING_OTHER_DESCRIPTION:
                handleOtherDescription(text);
                break;
            default:
                setTimeout(() => {
                    addBotMessage('Понял вас. Для более точной диагностики, пожалуйста, используйте кнопки выше или опишите проблему подробнее.');
                }, 500);
        }

        input.value = '';
    }
}

// Очистка чата
function clearChat() {
    if (confirm('Очистить всю историю диалога?')) {
        chatHistory = [];
        localStorage.removeItem('greenway_chat_history');
        const messages = document.getElementById('chat-messages');
        if (messages) {
            messages.innerHTML = '';
        }

        // Начинаем новый диалог
        addBotMessage('Здравствуйте! Меня зовут Гринви. Я помогу определить, что вас беспокоит. Что вас беспокоит?');
        showQuickButtons([
            { text: 'СПИНА', value: 'спина' },
            { text: 'ШЕЯ', value: 'шея' },
            { text: 'ДИАСТАЗ', value: 'диастаз' },
            { text: 'КОЛЕНИ', value: 'колени' },
            { text: 'СТОПЫ', value: 'стопы' },
            { text: 'ДРУГОЕ', value: 'другое' }
        ]);
        currentBotState = botStates.WAITING_COMPLAINT;

        showToast('История диалога очищена');
    }
}

// Восстановление истории чата
function renderChatHistory() {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    messages.innerHTML = '';

    chatHistory.forEach(msg => {
        if (msg.type === 'bot') {
            const message = document.createElement('div');
            message.className = 'message bot-message';

            // Проверяем, содержит ли сообщение рекомендации
            if (msg.text.includes('**Персональные рекомендации:**')) {
                const recommendations = msg.text.split('\n');
                const mainText = recommendations.shift();
                const listItems = recommendations.filter(item => item.trim());

                message.innerHTML = `
                    <div class="avatar">G</div>
                    <div class="bubble">
                        <div class="recommendations">
                            <p><strong>${mainText.replace('**', '').replace('**', '')}</strong></p>
                            <ul>
                                ${listItems.map(item => `<li>${item.replace('• ', '')}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            } else {
                message.innerHTML = `
                    <div class="avatar">G</div>
                    <div class="bubble">${msg.text}</div>
                `;
            }

            messages.appendChild(message);
        } else {
            const message = document.createElement('div');
            message.className = 'message user-message';
            message.innerHTML = `
                <div class="bubble">${msg.text}</div>
                <div class="avatar">Вы</div>
            `;
            messages.appendChild(message);
        }
    });

    messages.scrollTop = messages.scrollHeight;

    // Определяем последнее состояние бота
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.type === 'bot') {
        if (lastMessage.text.includes('**Персональные рекомендации:**')) {
            currentBotState = botStates.COMPLETED;
            showFinalButtons();
        } else if (lastMessage.text.includes('Что вас беспокоит?')) {
            currentBotState = botStates.WAITING_COMPLAINT;
            showQuickButtons([
                { text: 'СПИНА', value: 'спина' },
                { text: 'ШЕЯ', value: 'шея' },
                { text: 'ДИАСТАЗ', value: 'диастаз' },
                { text: 'КОЛЕНИ', value: 'колени' },
                { text: 'СТОПЫ', value: 'стопы' },
                { text: 'ДРУГОЕ', value: 'другое' }
            ]);
        }
    }
}

// Глобальная функция для экспорта истории опроса
window.exportSurveyHistory = function () {
    const surveys = JSON.parse(localStorage.getItem('greenway_surveys') || '[]');
    if (surveys.length === 0) {
        alert('История опросов пуста');
        return;
    }

    const dataStr = JSON.stringify(surveys, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `greenway_surveys_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showToast('✅ История опросов экспортирована');
};



// ===== БИБЛИОТЕКА СТАТЕЙ =====
let filteredArticles = [];
let currentCategory = 'all';
let currentSubcategory = 'all';
let searchQuery = '';

async function loadArticles() {
    try {
        const response = await fetch('data/articles.json');
        const data = await response.json();
        articles = data.articles;
        loadFavorites();
        filterArticles();
        updateStats();
    } catch (error) {
        console.error('Ошибка загрузки статей:', error);
        document.getElementById('articles-grid').innerHTML =
            '<div class="error">Не удалось загрузить статьи. Проверьте подключение к интернету.</div>';
    }
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('greenway_favorites')) || [];
    articles.forEach(article => {
        article.favorite = favorites.includes(article.id);
    });
}

function saveFavorites() {
    const favorites = articles.filter(a => a.favorite).map(a => a.id);
    localStorage.setItem('greenway_favorites', JSON.stringify(favorites));
}

function filterArticles() {
    filteredArticles = articles.filter(article => {
        if (currentCategory !== 'all' && article.category !== currentCategory) {
            return false;
        }
        if (currentSubcategory !== 'all' && article.subcategory !== currentSubcategory) {
            return false;
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const inTitle = article.title.toLowerCase().includes(query);
            const inDesc = article.description.toLowerCase().includes(query);
            const inTags = article.tags.some(tag => tag.toLowerCase().includes(query));
            if (!inTitle && !inDesc && !inTags) return false;
        }
        return true;
    });
    renderArticles();
}

function renderArticles() {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    if (filteredArticles.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Статьи не найдены</h3>
                <p>Попробуйте изменить фильтры или поисковый запрос</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredArticles.map(article => `
        <div class="article-card" data-id="${article.id}">
            <div class="article-card-header">
                <div class="article-emoji">${article.image}</div>
                <button class="favorite-btn ${article.favorite ? 'active' : ''}" 
                        onclick="toggleFavorite(${article.id})">
                    <i class="fas fa-star"></i>
                </button>
            </div>
            
            <div class="article-card-body">
                <div class="article-category">${article.category} / ${article.subcategory}</div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-description">${article.description}</p>
                
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                
                <div class="article-meta">
                    <span class="read-time">${article.readTime} чтения</span>
                    ${article.read ? '<span class="read-badge"><i class="fas fa-check"></i> Прочитано</span>' : ''}
                </div>
            </div>
            
            <div class="article-card-footer">
                <button class="read-btn" onclick="openArticle(${article.id})">
                    <i class="fas fa-book-open"></i> Читать
                </button>
                <button class="share-btn" onclick="shareArticle(${article.id})">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function initLibraryFilters() {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            updateSubcategoryFilters();
            filterArticles();
        });
    });

    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = e.target.value.trim();
                filterArticles();
            }, 300);
        });
    }

    updateSubcategoryFilters();
}

function updateSubcategoryFilters() {
    const container = document.getElementById('subcategory-filters');
    if (!container) return;

    let subcategories = ['all'];
    if (currentCategory === 'all') {
        articles.forEach(article => {
            if (!subcategories.includes(article.subcategory)) {
                subcategories.push(article.subcategory);
            }
        });
    } else {
        articles.forEach(article => {
            if (article.category === currentCategory && !subcategories.includes(article.subcategory)) {
                subcategories.push(article.subcategory);
            }
        });
    }

    container.innerHTML = subcategories.map(sub => `
        <button class="subcategory-btn ${currentSubcategory === sub ? 'active' : ''}" 
                data-subcategory="${sub}">
            ${sub === 'all' ? 'Все подрубрики' : sub}
        </button>
    `).join('');

    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSubcategory = btn.dataset.subcategory;
            filterArticles();
        });
    });
}

function updateStats() {
    const totalArticles = document.getElementById('total-articles');
    const favoriteCount = document.getElementById('favorite-count');

    if (totalArticles) totalArticles.textContent = filteredArticles.length;
    if (favoriteCount) {
        const favoriteCountNum = articles.filter(a => a.favorite).length;
        favoriteCount.textContent = favoriteCountNum;
    }
}

// ===== ФУНКЦИОНАЛ "МОИ ЦЕЛИ" =====
function initGoalsScreen() {
    loadGoalsFromStorage();
    updateGoalsDisplay();

    const addGoalBtn = document.getElementById('add-goal-btn');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', addNewGoal);
    }

    const newGoalInput = document.getElementById('new-goal-input');
    if (newGoalInput) {
        newGoalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewGoal();
        });
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (newGoalInput) {
                newGoalInput.value = btn.dataset.goal;
            }
        });
    });

    const dailyQuote = document.getElementById('daily-quote');
    if (dailyQuote) {
        dailyQuote.textContent = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];
    }
}

function loadGoalsFromStorage() {
    const saved = localStorage.getItem('greenway_goals');
    if (saved) {
        goals = JSON.parse(saved);
    } else {
        goals = [
            { id: 1, text: "Утренняя зарядка 10 минут", completed: false, createdAt: new Date().toISOString(), progress: 5 },
            { id: 2, text: "Прогулка на свежем воздухе 30 минут", completed: false, createdAt: new Date().toISOString(), progress: 3 },
            { id: 3, text: "Прочитать статью о массаже", completed: true, createdAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date().toISOString() }
        ];
        saveGoalsToStorage();
    }
}

function saveGoalsToStorage() {
    localStorage.setItem('greenway_goals', JSON.stringify(goals));
}

function addNewGoal() {
    const input = document.getElementById('new-goal-input');
    if (!input) return;

    const text = input.value.trim();
    if (text) {
        const newGoal = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            progress: 0
        };

        goals.unshift(newGoal);
        saveGoalsToStorage();
        updateGoalsDisplay();
        input.value = '';
        showToast('🎯 Цель добавлена!');
    }
}

function toggleGoalCompletion(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        goal.completed = !goal.completed;
        goal.completedAt = goal.completed ? new Date().toISOString() : null;

        if (goal.completed) {
            userData.completedGoals++;
            showToast('✅ Цель выполнена!');
        } else {
            userData.completedGoals = Math.max(0, userData.completedGoals - 1);
        }

        saveGoalsToStorage();
        saveUserData();
        updateGoalsDisplay();
        updateProfileStats();
    }
}

function deleteGoal(goalId) {
    goals = goals.filter(g => g.id !== goalId);
    saveGoalsToStorage();
    updateGoalsDisplay();
    showToast('🗑️ Цель удалена');
}

function editGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        const newText = prompt('Редактировать цель:', goal.text);
        if (newText !== null && newText.trim()) {
            goal.text = newText.trim();
            saveGoalsToStorage();
            updateGoalsDisplay();
            showToast('✏️ Цель обновлена');
        }
    }
}

function updateGoalsDisplay() {
    const activeList = document.getElementById('active-goals-list');
    const completedList = document.getElementById('completed-goals-list');
    const currentStreak = document.getElementById('current-streak');
    const completedGoalsEl = document.getElementById('completed-goals');
    const articlesRead = document.getElementById('articles-read');

    if (!activeList || !completedList) return;

    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);

    if (currentStreak) currentStreak.textContent = userData.streak;
    if (completedGoalsEl) completedGoalsEl.textContent = completedGoals.length;
    if (articlesRead) articlesRead.textContent = userData.articlesRead || 0;

    userData.completedGoals = completedGoals.length;

    if (activeGoals.length === 0) {
        activeList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <p>У вас пока нет активных целей. Добавьте первую!</p>
            </div>
        `;
    } else {
        activeList.innerHTML = activeGoals.map(goal => `
            <div class="goal-item" data-id="${goal.id}">
                <div class="goal-content">
                    <div class="goal-checkbox">
                        <input type="checkbox" id="goal-${goal.id}" ${goal.completed ? 'checked' : ''}
                               onchange="toggleGoalCompletion(${goal.id})">
                        <label for="goal-${goal.id}"></label>
                    </div>
                    <div class="goal-text">
                        <h4>${goal.text}</h4>
                        <div class="goal-meta">
                            <span class="goal-date">Добавлено: ${formatDate(goal.createdAt)}</span>
                            <div class="goal-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                                </div>
                                <span class="progress-text">${goal.progress}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="goal-btn edit-btn" onclick="editGoal(${goal.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="goal-btn delete-btn" onclick="deleteGoal(${goal.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    if (completedGoals.length === 0) {
        completedList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <p>Здесь появятся ваши достижения</p>
            </div>
        `;
    } else {
        completedList.innerHTML = completedGoals.map(goal => `
            <div class="goal-item completed" data-id="${goal.id}">
                <div class="goal-content">
                    <div class="goal-checkbox">
                        <input type="checkbox" id="goal-${goal.id}" checked disabled>
                        <label for="goal-${goal.id}"></label>
                    </div>
                    <div class="goal-text">
                        <h4><s>${goal.text}</s></h4>
                        <div class="goal-meta">
                            <span class="goal-date">Выполнено: ${formatDate(goal.completedAt)}</span>
                            <span class="completion-badge"><i class="fas fa-check-circle"></i> Выполнено</span>
                        </div>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="goal-btn restore-btn" onclick="toggleGoalCompletion(${goal.id})">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateProfileStats();
}

// ===== ФУНКЦИОНАЛ ПРОФИЛЯ =====
function initProfileScreen() {
    loadUserData();
    updateProfileStats();

    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditProfileModal);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

function loadUserData() {
    const saved = localStorage.getItem('greenway_user');
    if (saved) {
        userData = JSON.parse(saved);
    }

    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');

    if (userName) userName.textContent = userData.name;
    if (userEmail) userEmail.textContent = userData.email || 'Войдите в аккаунт';

    const chatHistory = JSON.parse(localStorage.getItem('greenway_chat_history') || '[]');
    userData.chatsCount = chatHistory.filter(msg => msg.type === 'user').length;

    const articles = JSON.parse(localStorage.getItem('greenway_articles_read') || '[]');
    userData.articlesRead = articles.length;

    userData.activeGoals = goals.filter(g => !g.completed).length;

    updateStreak();
}

function saveUserData() {
    localStorage.setItem('greenway_user', JSON.stringify(userData));
}

function updateStreak() {
    const lastActivity = localStorage.getItem('greenway_last_activity');
    const today = new Date().toDateString();

    if (lastActivity === today) return;

    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastActivity === yesterday) {
        userData.streak++;
    } else if (lastActivity !== today) {
        userData.streak = 1;
    }

    localStorage.setItem('greenway_last_activity', today);
    saveUserData();
}

function updateProfileStats() {
    const profileChats = document.getElementById('profile-chats');
    const profileArticles = document.getElementById('profile-articles');
    const profileGoals = document.getElementById('profile-goals');

    if (profileChats) profileChats.textContent = userData.chatsCount || 0;
    if (profileArticles) profileArticles.textContent = userData.articlesRead || 0;
    if (profileGoals) profileGoals.textContent = goals.filter(g => !g.completed).length;
}

// ===== ФУНКЦИОНАЛ "О НАС" =====
function initAboutScreen() {
    const bookBtn = document.getElementById('book-consultation-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', showConsultationModal);
    }

    const joinBtn = document.getElementById('join-team-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', showJoinTeamModal);
    }
}

// ===== УТИЛИТЫ =====
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--beige-dark);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
window.toggleGoalCompletion = toggleGoalCompletion;
window.deleteGoal = deleteGoal;
window.editGoal = editGoal;
window.toggleFavorite = function (articleId) {
    const article = articles.find(a => a.id === articleId);
    if (article) {
        article.favorite = !article.favorite;
        saveFavorites();
        filterArticles();
        updateStats();
    }
};

window.openArticle = function (articleId) {
    const article = articles.find(a => a.id === articleId);
    if (article) {
        article.read = true;
        showArticleModal(article);
        filterArticles();
    }
};

window.shareArticle = function (articleId) {
    const article = articles.find(a => a.id === articleId);
    if (article && navigator.share) {
        navigator.share({
            title: article.title,
            text: article.description,
            url: window.location.href,
        });
    } else {
        navigator.clipboard.writeText(`${article.title} - ${article.description}`);
        alert('Ссылка на статью скопирована в буфер обмена!');
    }
};

function showArticleModal(article) {
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close"><i class="fas fa-times"></i></button>
            <div class="modal-header">
                <span class="modal-category">${article.category} / ${article.subcategory}</span>
                <h2>${article.title}</h2>
                <div class="modal-meta">
                    <span>${article.readTime} чтения</span>
                    <button class="modal-favorite ${article.favorite ? 'active' : ''}" 
                            onclick="toggleFavorite(${article.id})">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <div class="article-emoji-large">${article.image}</div>
                <p><strong>${article.description}</strong></p>
                <div class="article-full-content">
                    ${article.content || 'Полное содержание статьи...'}
                </div>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-close-modal">Закрыть</button>
                <button class="btn-share" onclick="shareArticle(${article.id})">
                    <i class="fas fa-share"></i> Поделиться
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('.btn-close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function showEditProfileModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-header">
                <h2><i class="fas fa-user-edit"></i> Редактировать профиль</h2>
            </div>
            <div class="modal-body">
                <div class="avatar-edit">
                    <div class="avatar-preview" id="avatar-preview">${userData.avatar}</div>
                    <div class="avatar-options" id="avatar-options">
                        ${['👤', '👨', '👩', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '💆', '🧘'].map(emoji => `
                            <button class="avatar-option ${emoji === userData.avatar ? 'selected' : ''}" 
                                    data-emoji="${emoji}">${emoji}</button>
                        `).join('')}
                    </div>
                </div>
                
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label for="edit-name">Имя</label>
                        <input type="text" id="edit-name" value="${userData.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Email</label>
                        <input type="email" id="edit-email" value="${userData.email}" placeholder="your@email.com">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" id="cancel-edit">Отмена</button>
                <button class="btn-primary" id="save-profile">Сохранить</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cancel-edit').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('#save-profile').addEventListener('click', () => {
        const nameInput = document.getElementById('edit-name');
        const emailInput = document.getElementById('edit-email');

        if (nameInput && emailInput) {
            userData.name = nameInput.value;
            userData.email = emailInput.value;
            saveUserData();

            const userName = document.getElementById('user-name');
            const userEmail = document.getElementById('user-email');
            if (userName) userName.textContent = userData.name;
            if (userEmail) userEmail.textContent = userData.email || 'Войдите в аккаунт';

            document.body.removeChild(modal);
            showToast('✅ Профиль обновлен');
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    setTimeout(() => {
        const avatarOptions = document.querySelectorAll('.avatar-option');
        avatarOptions.forEach(btn => {
            btn.addEventListener('click', function () {
                avatarOptions.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                const emoji = this.dataset.emoji;
                document.getElementById('avatar-preview').textContent = emoji;
                userData.avatar = emoji;
            });
        });
    }, 100);
}

function showConsultationModal() {
    const chat = document.getElementById('chat');

    const message = document.createElement('div');
    message.className = 'chat-message';

    message.innerHTML = `
        👋 Привет!  
        <br><br>
        📞 <strong>Запись на консультацию</strong>
        <br>
        Телефон: <a href="tel:+79332415394">+7 933 241-53-94</a>
        <br><br>
        💬 <a href="https://t.me/+lZvws0gc-0Y5YmY6" target="_blank">
        Перейти в Telegram-группу
        </a>
    `;

    chat.appendChild(message);
}



function showJoinTeamModal() {
    alert('Присоединение к команде. В реальном приложении здесь будет форма.');
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        userData.name = 'Гость';
        userData.email = '';
        saveUserData();
        loadUserData();
        updateProfileStats();
        showToast('👋 До свидания!');
    }
}

// ===== PWA ФУНКЦИИ =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ ServiceWorker зарегистрирован');
                setInterval(() => {
                    registration.update();
                }, 24 * 60 * 60 * 1000);
            })
            .catch(error => {
                console.log('❌ Ошибка регистрации ServiceWorker:', error);
            });
    });
}

function updateOnlineStatus() {
    const statusElement = document.createElement('div');
    statusElement.id = 'network-status';
    statusElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        z-index: 10000;
        transition: transform 0.3s;
    `;

    if (!navigator.onLine) {
        statusElement.textContent = '📶 Вы в офлайн-режиме. Некоторые функции недоступны.';
        statusElement.style.backgroundColor = 'var(--error)';
        statusElement.style.color = 'white';
        statusElement.style.transform = 'translateY(0)';
    } else {
        statusElement.textContent = '✅ Соединение восстановлено!';
        statusElement.style.backgroundColor = 'var(--success)';
        statusElement.style.color = 'white';
        statusElement.style.transform = 'translateY(0)';

        setTimeout(() => {
            statusElement.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                if (statusElement.parentNode) {
                    statusElement.parentNode.removeChild(statusElement);
                }
            }, 300);
        }, 3000);
    }

    const oldStatus = document.getElementById('network-status');
    if (oldStatus) oldStatus.remove();

    document.body.appendChild(statusElement);
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
document.addEventListener('DOMContentLoaded', updateOnlineStatus);

console.log('✅ Приложение Пульс жизни загружено!');