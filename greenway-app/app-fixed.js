// ===== БАЗОВЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ =====
let currentScreen = 'assistant';
let chatHistory = [];
let articles = [];

// DOM элементы
const screens = {};
const navItems = document.querySelectorAll('.nav-item');
const appContent = document.getElementById('app-content');

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Загружаем приложение...');
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
    // Скрываем все экраны
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });

    // Если экран не создан - создаем
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

    let screenContent = '';

    switch (screenName) {
        case 'assistant':
            screenContent = `
                <div class="chat-container">
                    <div class="chat-header">
                        <h2><i class="fas fa-robot"></i> Помощник Greenway</h2>
                        <p class="subtitle">Я помогу определить, что вас беспокоит</p>
                    </div>
                    <div class="chat-messages" id="chat-messages"></div>
                    <div class="quick-buttons" id="quick-buttons"></div>
                    <div class="input-area">
                        <input type="text" id="user-input" placeholder="Напишите сообщение...">
                        <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            `;
            break;

        case 'library':
            screenContent = `
                <div class="library-container">
                    <h1><i class="fas fa-book-open"></i> Библиотека знаний</h1>
                    <p>Здесь будут статьи</p>
                </div>
            `;
            break;

        case 'goals':
            screenContent = `
                <div class="goals-container">
                    <h1><i class="fas fa-chart-line"></i> Мои цели</h1>
                    <p>Трекер прогресса</p>
                </div>
            `;
            break;

        case 'about':
            screenContent = `
                <div class="about-container">
                    <h1><i class="fas fa-info-circle"></i> О нас</h1>
                    <p>Информация о Greenway</p>
                </div>
            `;
            break;

        case 'profile':
            screenContent = `
                <div class="profile-container">
                    <h1><i class="fas fa-user"></i> Профиль</h1>
                    <p>Ваши данные</p>
                </div>
            `;
            break;
    }

    screen.innerHTML = screenContent;
    return screen;
}

// ===== ЧАТ-БОТ (базовая версия) =====
function initAssistantScreen() {
    addBotMessage('Здравствуйте! Меня зовут Гринви. Я помогу определить, что вас беспокоит. Что вас беспокоит?');
    showQuickButtons(['СПИНА', 'ШЕЯ', 'ДИАСТАЗ', 'КОЛЕНИ', 'СТОПЫ', 'ДРУГОЕ']);

    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function addBotMessage(text) {
    const messages = document.getElementById('chat-messages');
    const message = document.createElement('div');
    message.className = 'message bot-message';
    message.innerHTML = `
        <div class="avatar">G</div>
        <div class="bubble">${text}</div>
    `;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

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
}

function showQuickButtons(buttons) {
    const container = document.getElementById('quick-buttons');
    container.innerHTML = '';

    buttons.forEach(text => {
        const button = document.createElement('button');
        button.className = 'quick-btn';
        button.textContent = text;
        button.addEventListener('click', () => {
            addUserMessage(text);
            // Простая логика ответа
            setTimeout(() => {
                addBotMessage('Понял вас. Для точной диагностики рекомендую записаться на консультацию.');
            }, 500);
        });
        container.appendChild(button);
    });
}

function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();

    if (text) {
        addUserMessage(text);
        input.value = '';

        setTimeout(() => {
            addBotMessage('Спасибо за сообщение. Для более точного анализа используйте кнопки выше.');
        }, 500);
    }
}

// ===== LOCALSTORAGE =====
function saveToStorage() {
    localStorage.setItem('greenway_chat_history', JSON.stringify(chatHistory));
}

function loadFromStorage() {
    const saved = localStorage.getItem('greenway_chat_history');
    if (saved) {
        chatHistory = JSON.parse(saved);
    }
}

console.log('✅ Базовое приложение загружено');