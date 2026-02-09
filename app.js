// ==================== CONFIG ====================
const WEATHER = {
    date: "2026-02-14",
    city: "Санкт-Петербург",
    summary: "Облачно с прояснениями",
    tempCurrent: "-10°C",
    tempDay: "-1°C",
    tempEvening: "-7°C",
    wind: "3–6 м/с",
    type: "cloudy"
};

const STORIES = {
    silence: {
        parts: [
            "Уезжаем за город",
            "Термос. Снег. Лес",
            "Обратно в город и Aster"
        ]
    },
    movement: {
        parts: [
            "Катаемся на коньках",
            "Уезжаем греться в Aster"
        ]
    },
    light: {
        parts: [
            "Выставка про балет",
            "Вспомнил твою фотосессию балетную и возможно тебе это будет интересно",
            "Потом просто погуляем",
            "Зайдём согреться в Aster",
            "И финал. Вечерний концерт в Анненкирхе"
        ]
    }
};

const ROUTES = {
    silence: {
        title: "Тишина",
        path: "Линдуловская роща → Aster",
        description: "Эко тропа в зимнем лесу с вековыми деревьями",
        timing: "14:00 выезжаем, 15:30 на месте",
        note: "Гуляем сколько комфортно. Потом обратно в город на ужин",
        accentColor: "ice"
    },
    movement: {
        title: "Движение",
        path: "Каток у Флагштока → Aster",
        timing: "17:30–19:00 (1.5 часа катаемся)",
        note: "Потом едем в Aster",
        accentColor: "silver"
    },
    light: {
        title: "Свет",
        path: "Выставка «Пьер и Сильфиды» → прогулка по центру → Aster → Анненкирхе",
        descriptions: [
            {
                label: "Про выставку:",
                text: "Выставка про балетную эстетику. Пластика, образ, атмосфера сцены"
            },
            {
                label: "Про Анненкирхе:",
                text: "Историческое пространство с сильной атмосферой. Вечером там совсем другое ощущение города"
            }
        ],
        timing: [
            "Примерно: выставка около 17:00",
            "Aster около 18:00–18:30",
            "Анненкирхе 22:30 (≈ 1 час)"
        ],
        accentColor: "amber"
    }
};

const TELEGRAM_USERNAME = "NiAndVi";

// ==================== STATE ====================
let currentScreen = 0;
let selectedMood = null;
let preloadComplete = false;
let viewedMoods = new Set(); // Отслеживание просмотренных вариантов
let currentStoryIndex = 0; // Индекс текущей части истории

// ==================== PARTICLES ====================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.size = Math.random() * 2 + 1;
    }
    
    update() {
        this.y += this.speed;
        
        if (this.y > canvas.height) {
            this.reset();
        }
    }
    
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    const particleCount = window.innerWidth < 768 ? 50 : 100;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    animationId = requestAnimationFrame(animateParticles);
}

function updateParticleSpeed(type) {
    particles.forEach(particle => {
        switch(type) {
            case 'silence':
                particle.speed = Math.random() * 0.5 + 0.3;
                break;
            case 'movement':
                particle.speed = Math.random() * 2 + 1;
                break;
            case 'light':
                particle.speed = Math.random() * 1 + 0.5;
                break;
        }
    });
}

// ==================== SCREEN NAVIGATION ====================
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Update progress bar
        updateProgress(screenId);
        
        // Trigger animations
        triggerScreenAnimations(screenId);
    }
}

function transitionTo(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    
    if (!currentScreen) {
        showScreen(screenId);
        return;
    }
    
    // Start exit animation
    currentScreen.classList.add('exiting');
    
    // Wait for exit animation to complete
    setTimeout(() => {
        currentScreen.classList.remove('active', 'exiting');
        showScreen(screenId);
    }, 520);
}

function triggerScreenAnimations(screenId) {
    switch(screenId) {
        case 'screen-intro':
            animateIntro();
            break;
        case 'screen-mood':
            updateMoodIndicators();
            break;
        case 'screen-story':
            animateStory();
            createStoryAnimation(selectedMood);
            break;
        case 'screen-route':
            createRouteAnimation(selectedMood);
            break;
        case 'screen-reaction':
            animateReaction();
            break;
    }
}

function animateIntro() {
    setTimeout(() => {
        document.querySelectorAll('.intro-line').forEach(line => {
            line.classList.add('animate');
        });
        document.querySelector('.intro-content .btn-primary').classList.add('animate');
    }, 100);
}

function animateStory() {
    const storyText = document.getElementById('story-text');
    storyText.classList.remove('animate');
    
    setTimeout(() => {
        storyText.classList.add('animate');
    }, 100);
}

function animateReaction() {
    setTimeout(() => {
        document.querySelectorAll('.reaction-text').forEach(text => {
            text.classList.add('animate');
        });
        document.querySelector('.reaction-content .btn-primary').classList.add('animate');
    }, 100);
}

// ==================== PRELOAD ====================
function checkFontsLoaded() {
    return document.fonts.ready;
}

async function preload() {
    try {
        await checkFontsLoaded();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Минимальное время показа
        preloadComplete = true;
        showScreen('screen-intro');
    } catch (error) {
        console.error('Preload error:', error);
        preloadComplete = true;
        showScreen('screen-intro');
    }
}

// ==================== ANIMATIONS ====================

function createStoryAnimation(mood) {
    const container = document.getElementById('story-animation');
    container.innerHTML = '';
    
    if (mood === 'silence') {
        // Forest growth animation
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'forest-animation');
        svg.setAttribute('viewBox', '0 0 800 600');
        
        // Create tree trunks
        for (let i = 0; i < 7; i++) {
            const tree = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            tree.setAttribute('class', 'tree-trunk');
            tree.setAttribute('x', 50 + i * 120);
            tree.setAttribute('y', 300);
            tree.setAttribute('width', 12);
            tree.setAttribute('height', 300);
            tree.setAttribute('fill', 'rgba(255,255,255,0.15)');
            tree.style.animationDelay = `${i * 0.2}s`;
            svg.appendChild(tree);
        }
        
        // Mist layers
        const mist1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        mist1.setAttribute('class', 'forest-mist');
        mist1.setAttribute('cx', '400');
        mist1.setAttribute('cy', '500');
        mist1.setAttribute('rx', '600');
        mist1.setAttribute('ry', '100');
        mist1.setAttribute('fill', 'rgba(255,255,255,0.08)');
        svg.appendChild(mist1);
        
        container.appendChild(svg);
    } else if (mood === 'movement') {
        // Ice rink traces animation
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'skate-animation');
        svg.setAttribute('viewBox', '0 0 800 600');
        
        const tracePaths = [
            'M -50 430 Q 200 360 420 400 T 900 360',
            'M -80 470 Q 120 520 320 470 T 820 520',
            'M -60 320 Q 160 260 380 300 T 900 260',
            'M -100 560 Q 180 600 360 560 T 900 600',
            'M -40 380 Q 220 330 420 360 T 900 320',
            'M -70 520 Q 200 480 360 520 T 880 480'
        ];
        
        tracePaths.forEach((d, i) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'skate-trace');
            path.setAttribute('d', d);
            path.style.animationDelay = `${i * 0.6}s`;
            svg.appendChild(path);
        });
        
        container.appendChild(svg);
    }
}

function createRouteAnimation(mood) {
    const container = document.getElementById('route-animation');
    container.innerHTML = '';
    
    if (mood === 'silence') {
        // Forest animated GIF background
        const imageHTML = `
            <div class="sceneVideo">
                <img class="route-bg-animation" 
                     src="assets/video/silence-forest.gif" 
                     alt="">
            </div>
        `;
        container.innerHTML = imageHTML;
        
    } else if (mood === 'movement') {
        // Ice rink animated GIF background
        const imageHTML = `
            <div class="sceneVideo">
                <img class="route-bg-animation" 
                     src="assets/video/movement-rink.gif" 
                     alt="">
            </div>
        `;
        container.innerHTML = imageHTML;
        
    } else if (mood === 'light') {
        // Concert/light animated GIF background
        const imageHTML = `
            <div class="sceneVideo">
                <img class="route-bg-animation" 
                     src="assets/video/light-concert.gif" 
                     alt="">
            </div>
        `;
        container.innerHTML = imageHTML;
    }
}

// ==================== EVENT HANDLERS ====================

// Screen 1: Intro -> Weather
document.getElementById('btn-start').addEventListener('click', () => {
    transitionTo('screen-weather');
});

// Screen 2: Weather -> Mood
document.getElementById('btn-weather-next').addEventListener('click', () => {
    transitionTo('screen-mood');
});

// Screen 3: Mood Selection
document.querySelectorAll('.mood-zone').forEach(zone => {
    zone.addEventListener('click', function() {
        selectedMood = this.dataset.mood;
        viewedMoods.add(selectedMood);
        currentStoryIndex = 0; // Сброс индекса истории
        
        // Visual feedback
        document.querySelectorAll('.mood-zone').forEach(z => z.classList.remove('selected'));
        this.classList.add('selected');
        
        // Update particle speed
        updateParticleSpeed(selectedMood);
        
        // Wait a bit, then proceed
        setTimeout(() => {
            // Сбрасываем состояние текста перед началом новой истории
            const storyText = document.getElementById('story-text');
            storyText.classList.remove('animate', 'exiting');
            
            showNextStory();
        }, 800);
    });
});

// Функция для обновления индикаторов просмотренных вариантов
function updateMoodIndicators() {
    document.querySelectorAll('.mood-zone').forEach(zone => {
        const mood = zone.dataset.mood;
        if (viewedMoods.has(mood)) {
            zone.classList.add('viewed');
        }
    });
}

// Функция показа следующей части истории
function showNextStory() {
    const story = STORIES[selectedMood];
    const storyText = document.getElementById('story-text');
    
    if (currentStoryIndex < story.parts.length) {
        // Если текст уже показан, делаем плавный переход
        if (storyText.classList.contains('animate')) {
            storyText.classList.add('exiting');
            storyText.classList.remove('animate');
            
            setTimeout(() => {
                storyText.textContent = story.parts[currentStoryIndex];
                storyText.classList.remove('exiting');
                setTimeout(() => {
                    storyText.classList.add('animate');
                }, 50);
                currentStoryIndex++;
            }, 450);
        } else {
            // Первый показ
            storyText.textContent = story.parts[currentStoryIndex];
            transitionTo('screen-story');
            currentStoryIndex++;
        }
    } else {
        // Все части показаны, идём к раскрытию маршрута
        showRouteReveal();
    }
}

// Screen 4: Story -> Next part or Route
document.getElementById('btn-story-next').addEventListener('click', () => {
    showNextStory();
});

// Функция отображения раскрытия маршрута
function showRouteReveal() {
    const route = ROUTES[selectedMood];
    const badge = document.getElementById('route-badge');
    const path = document.getElementById('route-path');
    const details = document.getElementById('route-details');
    
    // Set badge with accent
    badge.textContent = route.title;
    badge.className = 'route-badge';
    if (route.accentColor === 'ice') badge.classList.add('accent-ice');
    if (route.accentColor === 'silver') badge.classList.add('accent-silver');
    if (route.accentColor === 'amber') badge.classList.add('accent-amber');
    
    // Set path
    path.textContent = route.path;
    
    // Set details
    let detailsHTML = '';
    
    if (selectedMood === 'silence' && route.description) {
        // Для маршрута "Тишина" - описание + тайминг
        detailsHTML = `
            <div class="route-description-block">
                <div class="route-description-text">${route.description}</div>
            </div>
            <div class="route-timing">
                <div class="route-timing-line">${route.timing}</div>
                <div class="route-timing-line">${route.note}</div>
            </div>
        `;
    } else if (selectedMood === 'light' && route.descriptions) {
        // Для маршрута "Свет" - отдельные блоки с описаниями
        route.descriptions.forEach(desc => {
            detailsHTML += `
                <div class="route-description-block">
                    <div class="route-description-label">${desc.label}</div>
                    <div class="route-description-text">${desc.text}</div>
                </div>
            `;
        });
        
        // Добавляем тайминг
        detailsHTML += '<div class="route-timing">';
        route.timing.forEach(time => {
            detailsHTML += `<div class="route-timing-line">${time}</div>`;
        });
        detailsHTML += '</div>';
        
    } else {
        // Для остальных маршрутов - простой формат
        detailsHTML = `
            <div class="route-timing">
                <div class="route-timing-line">${route.timing}</div>
                <div class="route-timing-line">${route.note}</div>
            </div>
        `;
    }
    
    details.innerHTML = detailsHTML;
    
    // Обновляем текст кнопки
    const btnRouteNext = document.getElementById('btn-route-next');
    if (viewedMoods.size >= 3) {
        btnRouteNext.textContent = 'Продолжить';
    } else {
        const remaining = 3 - viewedMoods.size;
        btnRouteNext.textContent = `Посмотреть ещё (осталось ${remaining})`;
    }
    
    transitionTo('screen-route');
}

// Screen 5: Route -> Reaction OR back to Mood
document.getElementById('btn-route-next').addEventListener('click', () => {
    if (viewedMoods.size >= 3) {
        transitionTo('screen-reaction');
    } else {
        transitionTo('screen-mood');
    }
});

// Screen 6: Reaction -> Final
document.getElementById('btn-reaction-next').addEventListener('click', () => {
    transitionTo('screen-final');
});

// ==================== FINAL SCREEN ====================

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const targetTab = this.dataset.tab;
        
        // Switch active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Switch content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
});

// Ready Routes - Radio selection
const radioInputs = document.querySelectorAll('input[name="route"]');
const btnTelegramReady = document.getElementById('btn-telegram-ready');

radioInputs.forEach(input => {
    input.addEventListener('change', () => {
        btnTelegramReady.disabled = false;
    });
});

btnTelegramReady.addEventListener('click', () => {
    const selected = document.querySelector('input[name="route"]:checked');
    if (!selected) return;
    
    const routeValue = selected.value;
    let message = '';
    
    switch(routeValue) {
        case 'silence':
            message = 'Выбираю вариант "Тишина". Линдуловская роща → Aster';
            break;
        case 'movement':
            message = 'Выбираю вариант "Движение". Каток у Флагштока → Aster';
            break;
        case 'light':
            message = 'Выбираю вариант "Свет". Пьер и Сильфиды → Aster → Анненкирхе';
            break;
    }
    
    const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});

// Custom Routes - Checkbox selection
const checkboxes = document.querySelectorAll('#tab-custom input[type="checkbox"]:not([disabled])');
const btnTelegramCustom = document.getElementById('btn-telegram-custom');

function updateCustomButton() {
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
    btnTelegramCustom.disabled = !anyChecked;
}

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateCustomButton);
});

btnTelegramCustom.addEventListener('click', () => {
    const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selected.length === 0) return;
    
    selected.push('Aster'); // Always included
    
    const message = `Хочу собрать свой вариант:\n${selected.join(' + ')}`;
    const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});

// ==================== OVERLAY EFFECTS ====================

// Cursor Glow
let cursorX = 0;
let cursorY = 0;
let glowX = 0;
let glowY = 0;

const cursorGlow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function updateCursorGlow() {
    // Lerp for smooth following
    glowX += (cursorX - glowX) * 0.15;
    glowY += (cursorY - glowY) * 0.15;
    
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    
    requestAnimationFrame(updateCursorGlow);
}

// Progress Bar
const progressFill = document.getElementById('progressFill');
const progressMap = {
    'screen-preload': 0,
    'screen-intro': 10,
    'screen-weather': 20,
    'screen-mood': 35,
    'screen-story': 55,
    'screen-route': 75,
    'screen-reaction': 90,
    'screen-final': 100
};

function updateProgress(screenId) {
    const progress = progressMap[screenId] || 0;
    progressFill.style.width = progress + '%';
}

// Light Wipe Effect
const lightWipe = document.getElementById('lightWipe');

function triggerLightWipe() {
    lightWipe.classList.remove('active');
    // Force reflow
    void lightWipe.offsetWidth;
    lightWipe.classList.add('active');
}

// ==================== INITIALIZATION ====================
window.addEventListener('resize', () => {
    initCanvas();
});

document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    createParticles();
    animateParticles();
    updateCursorGlow(); // Start cursor glow
    preload();
});
