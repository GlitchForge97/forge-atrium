const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let firebaseApp;
let auth;

try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
} catch (error) {
    console.log('Firebase initialization failed - using demo mode');
}

const defaultConfig = {
    restaurant_name: "Forge's Atrium",
    tagline: 'Where Elegance Meets Flavor',
    welcome_message: 'Experience the finest dining in Dhaka',
    menu_title: 'Our Exquisite Menu',
    specials_title: "Chef's Special Selection",
    reservation_title: 'Reserve Your Table',
    contact_phone: '+1 69696969',
    contact_email: 'glitchforge97',
    contact_address: 'Gulshan Avenue, Dhaka, Bangladesh',
    background_color: '#f8f9fa',
    surface_color: '#ffffff',
    text_color: '#2d3748',
    primary_action_color: '#667eea',
    secondary_action_color: '#764ba2',
    font_family: 'system-ui',
    font_size: 16
};

let currentConfig = { ...defaultConfig };
let allData = [];
let currentView = 'guest';
let currentSection = 'orders';
let currentUserType = 'guest';
let currentAuthMode = 'signin';
let currentUser = null;
let isInitialized = false;
let selectedDishes = {};

const referenceMenuItems = [
    { id: 'menu-1', name: 'Pan-Seared Salmon Fillet', category: 'Main Course', price: 1899, description: 'Fresh Atlantic salmon with herbs and lemon butter' },
    { id: 'menu-2', name: 'Black Truffle Risotto', category: 'Main Course', price: 1699, description: 'Creamy Arborio rice with black truffle' },
    { id: 'menu-3', name: 'Caesar Salad Elegance', category: 'Appetizer', price: 849, description: 'Classic Caesar with house-made dressing' },
    { id: 'menu-4', name: 'Dark Chocolate Fondant', category: 'Dessert', price: 799, description: 'Warm chocolate cake with vanilla ice cream' },
    { id: 'menu-5', name: 'Prime Beef Tenderloin', category: 'Main Course', price: 2199, description: 'Prime beef with red wine reduction' },
    { id: 'menu-6', name: 'Lobster Bisque Royale', category: 'Appetizer', price: 999, description: 'Rich creamy lobster soup' },
    { id: 'menu-7', name: 'Wagyu Beef Steak', category: 'Main Course', price: 3699, description: 'Premium Japanese Wagyu grilled to perfection' },
    { id: 'menu-8', name: 'Dover Sole Meuniere', category: 'Main Course', price: 2499, description: 'Fresh Dover sole with brown butter' },
    { id: 'menu-9', name: 'Foie Gras Terrine', category: 'Appetizer', price: 1599, description: 'Silky foie gras with brioche and fig jam' },
    { id: 'menu-10', name: 'Crème Brûlée Lavender', category: 'Dessert', price: 799, description: 'Classic crème brûlée with lavender' }
];

const referenceTables = [
    { number: '1', status: 'available' },
    { number: '2', status: 'occupied' },
    { number: '3', status: 'available' },
    { number: '4', status: 'reserved' },
    { number: '5', status: 'available' },
    { number: '6', status: 'occupied' },
    { number: '7', status: 'available' },
    { number: '8', status: 'available' }
];

const dataHandler = {
    onDataChanged(data) {
        allData = data;
        if (currentView === 'staff') {
            updateDashboardContent();
        }
        updateAnalytics();
        renderGuestView();
    }
};

async function initApp() {
    if (isInitialized) return;
    
    initTheme();
    
    if (window.dataSdk) {
        try {
            const initResult = await window.dataSdk.init(dataHandler);
            if (!initResult.isOk) {
                console.error('Failed to initialize Data SDK, using fallback mode');
            }
        } catch (error) {
            console.error('Data SDK error:', error, '- using fallback mode');
        }
    } else {
        console.log('Data SDK not available, using fallback mode');
    }
    
    if (window.elementSdk) {
        window.elementSdk.init({
            defaultConfig,
            onConfigChange: async (config) => {
                currentConfig = { ...config };
                applyConfig();
            },
            mapToCapabilities: (config) => ({
                recolorables: [
                    {
                        get: () => config.background_color || defaultConfig.background_color,
                        set: (value) => {
                            config.background_color = value;
                            window.elementSdk.setConfig({ background_color: value });
                        }
                    },
                    {
                        get: () => config.surface_color || defaultConfig.surface_color,
                        set: (value) => {
                            config.surface_color = value;
                            window.elementSdk.setConfig({ surface_color: value });
                        }
                    },
                    {
                        get: () => config.text_color || defaultConfig.text_color,
                        set: (value) => {
                            config.text_color = value;
                            window.elementSdk.setConfig({ text_color: value });
                        }
                    },
                    {
                        get: () => config.primary_action_color || defaultConfig.primary_action_color,
                        set: (value) => {
                            config.primary_action_color = value;
                            window.elementSdk.setConfig({ primary_action_color: value });
                        }
                    },
                    {
                        get: () => config.secondary_action_color || defaultConfig.secondary_action_color,
                        set: (value) => {
                            config.secondary_action_color = value;
                            window.elementSdk.setConfig({ secondary_action_color: value });
                        }
                    }
                ],
                borderables: [],
                fontEditable: {
                    get: () => config.font_family || defaultConfig.font_family,
                    set: (value) => {
                        config.font_family = value;
                        window.elementSdk.setConfig({ font_family: value });
                    }
                },
                fontSizeable: {
                    get: () => config.font_size || defaultConfig.font_size,
                    set: (value) => {
                        config.font_size = value;
                        window.elementSdk.setConfig({ font_size: value });
                    }
                }
            }),
            mapToEditPanelValues: (config) => new Map([
                ['restaurant_name', config.restaurant_name || defaultConfig.restaurant_name],
                ['tagline', config.tagline || defaultConfig.tagline],
                ['welcome_message', config.welcome_message || defaultConfig.welcome_message],
                ['menu_title', config.menu_title || defaultConfig.menu_title],
                ['specials_title', config.specials_title || defaultConfig.specials_title]
            ])
        });
        
        if (window.elementSdk.config) {
            currentConfig = { ...window.elementSdk.config };
        }
    }
    
    if (auth) {
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            updateAuthUI();
        });
    }
    
    isInitialized = true;
    applyConfig();
    renderGuestView();
    updateAuthTabs();
}

function applyConfig() {
    const customFont = currentConfig.font_family || defaultConfig.font_family;
    const baseFontStack = 'system-ui, -apple-system, sans-serif';
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    const bgColor = currentConfig.background_color || defaultConfig.background_color;
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const primaryColor = currentConfig.primary_action_color || defaultConfig.primary_action_color;
    const secondaryColor = currentConfig.secondary_action_color || defaultConfig.secondary_action_color;
    
    document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;
    document.body.style.fontSize = `${baseSize}px`;
    document.body.style.color = textColor;
    
    const gradientBg = document.querySelector('.gradient-bg');
    if (gradientBg) {
        gradientBg.style.background = `linear-gradient(135deg, ${bgColor} 0%, ${surfaceColor} 100%)`;
    }
    
    document.getElementById('restaurant-name').textContent = currentConfig.restaurant_name || defaultConfig.restaurant_name;
    document.getElementById('restaurant-name').style.fontSize = `${baseSize * 3.5}px`;
    document.getElementById('restaurant-name').style.color = 'var(--text-primary)';
    
    document.getElementById('tagline').textContent = currentConfig.tagline || defaultConfig.tagline;
    document.getElementById('tagline').style.fontSize = `${baseSize * 1.25}px`;
    document.getElementById('tagline').style.color = 'var(--text-primary)';
    
    document.getElementById('welcome-message').textContent = currentConfig.welcome_message || defaultConfig.welcome_message;
    document.getElementById('welcome-message').style.fontSize = `${baseSize * 1.25}px`;
    document.getElementById('welcome-message').style.color = 'var(--text-primary)';
    
    document.getElementById('menu-title').textContent = currentConfig.menu_title || defaultConfig.menu_title;
    document.getElementById('menu-title').style.fontSize = `${baseSize * 3.125}px`;
    document.getElementById('menu-title').style.color = textColor;
    
    document.getElementById('specials-title').textContent = currentConfig.specials_title || defaultConfig.specials_title;
    document.getElementById('specials-title').style.fontSize = `${baseSize * 3.125}px`;
    document.getElementById('specials-title').style.color = textColor;
    
    document.getElementById('contact-phone').textContent = currentConfig.contact_phone || defaultConfig.contact_phone;
    document.getElementById('contact-email').textContent = currentConfig.contact_email || defaultConfig.contact_email;
    document.getElementById('contact-address').textContent = currentConfig.contact_address || defaultConfig.contact_address;
    
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.getElementById('theme-icon');
    icon.textContent = newTheme === 'light' ? '🌙' : '☀️';
    
    showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`, 'info');
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('theme-icon');
    icon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
}

async function submitReservation(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    const preorderedDishesArray = Object.entries(selectedDishes)
        .filter(([_, qty]) => qty > 0)
        .map(([dishId, qty]) => {
            const dish = referenceMenuItems.find(d => d.id === dishId);
            return `${dish.name} x${qty}`;
        });
    
    const reservationData = {
        id: 'reservation-' + Date.now(),
        type: 'reservation',
        guest_name: document.getElementById('res-name').value,
        guest_email: document.getElementById('res-email').value,
        guest_phone: document.getElementById('res-phone').value,
        date: document.getElementById('res-date').value,
        time: document.getElementById('res-time').value,
        guests: parseInt(document.getElementById('res-guests').value),
        special_requests: document.getElementById('res-requests').value,
        preordered_dishes: preorderedDishesArray.join(', '),
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const result = await window.dataSdk.create(reservationData);
    
    if (result.isOk) {
        document.getElementById('reservation-form').classList.add('hidden');
        const successDiv = document.getElementById('reservation-success');
        successDiv.classList.remove('hidden');
        successDiv.style.background = (currentConfig.primary_action_color || defaultConfig.primary_action_color) + '20';
        successDiv.style.color = currentConfig.text_color || defaultConfig.text_color;
        
        showToast('Reservation confirmed successfully!', 'success');
        
        selectedDishes = {};
        
        setTimeout(() => {
            document.getElementById('reservation-form').reset();
            document.getElementById('reservation-form').classList.remove('hidden');
            successDiv.classList.add('hidden');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            renderDishSelection();
        }, 4000);
    } else {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showToast('Failed to create reservation. Please try again.', 'error');
    }
}

function renderDishSelection() {
    const dishSelection = document.getElementById('dish-selection');
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const primaryColor = currentConfig.primary_action_color || defaultConfig.primary_action_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    const menuItems = allData.filter(item => item.type === 'menu' && item.available !== false);
    const displayMenu = menuItems.length > 0 ? menuItems : referenceMenuItems;
    
    const emojis = ['🍽️', '🥘', '🍷', '🍰', '🥗', '🍜', '🦞', '🔪', '🌿', '🦪', '🐑', '🍫', '🦐', '🍄', '✨'];
    
    dishSelection.innerHTML = displayMenu.map((dish, idx) => {
        const qty = selectedDishes[dish.id] || 0;
        return `
            <div class="dish-item p-5 rounded-2xl transition-all hover:scale-105" style="background: var(--bg-secondary); border: 2px solid var(--border-color); margin-bottom: 1rem;">
                <div class="flex justify-between items-start mb-3">
                    <div style="flex: 1;">
                        <div style="font-size: 1.25rem; margin-bottom: 0.5rem; display: inline-block;">${emojis[idx % emojis.length]}</div>
                        <div style="font-weight: 600; color: var(--text-primary); font-size: ${baseSize * 1.125}px;">${dish.item_name || dish.name}</div>
                        <div style="font-size: ${baseSize * 0.875}px; color: var(--text-secondary); margin-top: 0.25rem;">${dish.category}</div>
                    </div>
                    <div style="font-weight: bold; color: ${primaryColor}; font-size: ${baseSize * 1.25}px; white-space: nowrap; margin-left: 1rem;">৳${dish.price}</div>
                </div>
                <div class="flex items-center justify-between gap-3 pt-3 border-t" style="border-color: var(--border-color);">
                    <p style="font-size: ${baseSize * 0.875}px; color: var(--text-secondary); margin: 0; flex: 1; line-height: 1.4;">${dish.description}</p>
                    <div class="flex items-center gap-2 ml-2">
                        <button type="button" onclick="updateDishQuantity('${dish.id}', -1)" class="quantity-btn w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: ${primaryColor}20; color: ${primaryColor}; font-size: ${baseSize * 1.125}px;">−</button>
                        <span class="w-6 text-center font-bold" style="color: var(--text-primary); font-size: ${baseSize}px;">${qty}</span>
                        <button type="button" onclick="updateDishQuantity('${dish.id}', 1)" class="quantity-btn w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: ${primaryColor}; color: white; font-size: ${baseSize * 1.125}px;">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateDishQuantity(dishId, change) {
    if (!selectedDishes[dishId]) {
        selectedDishes[dishId] = 0;
    }
    
    selectedDishes[dishId] = Math.max(0, Math.min(10, selectedDishes[dishId] + change));
    renderDishSelection();
}

function renderGuestView() {
    console.log('=== renderGuestView called ===');
    
    const menuGrid = document.getElementById('menu-grid');
    const specialsGrid = document.getElementById('specials-grid');
    const tablesGrid = document.getElementById('tables-grid');
    
    if (!menuGrid || !specialsGrid || !tablesGrid) {
        console.error('Menu grid elements not found', {menuGrid, specialsGrid, tablesGrid});
        return;
    }
    
    console.log('Grid elements found, proceeding with render');
    
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    const primaryColor = currentConfig.primary_action_color || defaultConfig.primary_action_color;
    const secondaryColor = currentConfig.secondary_action_color || defaultConfig.secondary_action_color;
    
    const menuItems = allData.filter(item => item.type === 'menu' && item.available !== false);
    const displayMenu = menuItems.length > 0 ? menuItems : referenceMenuItems;
    
    console.log('Rendering menu with', displayMenu.length, 'items', displayMenu);
    
    const emojis = ['🍽️', '🥘', '🍷', '🍰', '🥗', '🍜', '🦞', '🔪', '🌿', '🦪', '🐑', '🍫', '🦐', '🍄', '✨'];
    
    const menuHTML = displayMenu.map((item, index) => `
        <div class="menu-card p-8 card-shadow" style="background: var(--bg-secondary); color: var(--text-primary);">
            <div class="text-4xl mb-4 transition-transform hover:scale-125">${emojis[index % emojis.length]}</div>
            <h3 class="font-semibold mb-3" style="font-size: ${baseSize * 1.4}px; color: var(--text-primary);">${item.item_name || item.name}</h3>
            <p class="opacity-70 mb-5" style="font-size: ${baseSize * 0.875}px; color: var(--text-secondary); line-height: 1.6;">${item.description}</p>
            <div class="flex justify-between items-center pt-4 border-t" style="border-color: var(--border-color);">
                <span class="font-bold text-lg" style="color: ${primaryColor};">৳${item.price}</span>
                <span class="text-xs opacity-60 px-3 py-1 rounded-full" style="background: var(--card-glow); color: var(--text-secondary);">${item.category}</span>
            </div>
        </div>
    `).join('');
    
    menuGrid.innerHTML = menuHTML;
    console.log('Menu grid populated with', displayMenu.length, 'items');
    
    const specials = displayMenu.slice(0, 4);
    const specialsHTML = specials.map((item, index) => `
        <div class="special-card p-12 card-shadow flex-1" style="background: var(--bg-secondary); color: var(--text-primary);">
            <div class="text-7xl mb-6 animate-float">${['⭐', '👨‍🍳', '🌟', '✨'][index]}</div>
            <span class="inline-block font-bold px-6 py-3 rounded-full mb-6 text-lg" style="color: white; background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});">৳${item.price}</span>
            <h3 class="font-semibold mb-5" style="font-size: ${baseSize * 2}px; color: var(--text-primary); line-height: 1.2;">${item.item_name || item.name}</h3>
            <p style="font-size: ${baseSize * 0.9375}px; color: var(--text-secondary); line-height: 1.8;">${item.description}</p>
        </div>
    `).join('');
    
    specialsGrid.innerHTML = specialsHTML;
    console.log('Specials grid populated');
    
    const tablesHTML = referenceTables.map(table => {
        const statusColors = { available: '#10b981', occupied: '#f59e0b', reserved: '#3b82f6' };
        const statusColor = statusColors[table.status];
        const statusEmojis = { available: '✅', occupied: '👥', reserved: '📅' };
        
        return `
            <div class="table-card p-6 text-center rounded-3xl" style="background: var(--bg-secondary); border: 2px solid ${statusColor}30;">
                <div class="text-5xl mb-3">${statusEmojis[table.status]}</div>
                <h4 class="font-light mb-2" style="font-size: ${baseSize * 1.5}px; color: var(--text-primary);">Table ${table.number}</h4>
                <span class="status-badge px-4 py-2" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}50;">${table.status.charAt(0).toUpperCase() + table.status.slice(1)}</span>
            </div>
        `;
    }).join('');
    
    tablesGrid.innerHTML = tablesHTML;
    console.log('Tables grid populated');
    
    renderDishSelection();
    console.log('=== renderGuestView completed ===');
}

function toggleAuthPanel() {
    const panel = document.getElementById('auth-panel');
    const isOpen = !panel.classList.contains('translate-x-full');
    
    if (isOpen) {
        panel.classList.add('translate-x-full');
    } else {
        panel.classList.remove('translate-x-full');
    }
}

function switchUserType(type) {
    currentUserType = type;
    updateAuthTabs();
}

function switchAuthMode(mode) {
    currentAuthMode = mode;
    updateAuthTabs();
    
    const nameField = document.getElementById('name-field');
    const submitBtn = document.getElementById('auth-submit-btn');
    
    if (mode === 'signup') {
        nameField.classList.remove('hidden');
        nameField.querySelector('input').required = true;
        submitBtn.textContent = 'Create Account';
    } else {
        nameField.classList.add('hidden');
        nameField.querySelector('input').required = false;
        submitBtn.textContent = 'Sign In';
    }
}

function updateAuthTabs() {
    const guestTypeTab = document.getElementById('guest-type-tab');
    const staffTypeTab = document.getElementById('staff-type-tab');
    const signinModeTab = document.getElementById('signin-mode-tab');
    const signupModeTab = document.getElementById('signup-mode-tab');
    
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const primaryColor = currentConfig.primary_action_color || defaultConfig.primary_action_color;
    const secondaryColor = currentConfig.secondary_action_color || defaultConfig.secondary_action_color;
    
    [guestTypeTab, staffTypeTab, signinModeTab, signupModeTab].forEach(tab => {
        tab.style.background = surfaceColor;
        tab.style.color = textColor;
    });
    
    if (currentUserType === 'guest') {
        guestTypeTab.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
        guestTypeTab.style.color = '#ffffff';
    } else {
        staffTypeTab.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
        staffTypeTab.style.color = '#ffffff';
    }
    
    if (currentAuthMode === 'signin') {
        signinModeTab.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
        signinModeTab.style.color = '#ffffff';
    } else {
        signupModeTab.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
        signupModeTab.style.color = '#ffffff';
    }
}

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const errorDiv = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit-btn');
    
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    errorDiv.classList.add('hidden');
    
    try {
        if (auth) {
            if (currentAuthMode === 'signup') {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({ displayName: name });
                
                const userData = {
                    id: 'user-' + Date.now(),
                    type: 'user',
                    user_email: email,
                    user_type: currentUserType,
                    created_at: new Date().toISOString()
                };
                await window.dataSdk.create(userData);
                
                showToast('Account created successfully!', 'success');
            } else {
                await auth.signInWithEmailAndPassword(email, password);
                showToast('Signed in successfully!', 'success');
            }
            
            if (currentUserType === 'staff' && email.includes('admin')) {
                currentView = 'staff';
                document.getElementById('guest-view').classList.add('hidden');
                document.getElementById('staff-dashboard').classList.remove('hidden');
                switchSection('reservations');
            }
            
            toggleAuthPanel();
        } else {
            if (email === 'admin@yaras.com' && password === 'admin123') {
                currentUser = { email: email, displayName: 'Admin' };
                
                if (currentUserType === 'staff') {
                    currentView = 'staff';
                    document.getElementById('guest-view').classList.add('hidden');
                    document.getElementById('staff-dashboard').classList.remove('hidden');
                    switchSection('reservations');
                }
                
                showToast('Signed in successfully!', 'success');
                toggleAuthPanel();
                updateAuthUI();
            } else {
                errorDiv.textContent = 'Invalid credentials. Try admin@yaras.com / admin123';
                errorDiv.classList.remove('hidden');
            }
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Authentication failed';
        errorDiv.classList.remove('hidden');
        showToast(error.message || 'Authentication failed', 'error');
    } finally {
        submitBtn.textContent = currentAuthMode === 'signup' ? 'Create Account' : 'Sign In';
        submitBtn.disabled = false;
    }
}

async function handleSignOut() {
    try {
        if (auth) {
            await auth.signOut();
        } else {
            currentUser = null;
        }
        
        currentView = 'guest';
        document.getElementById('staff-dashboard').classList.add('hidden');
        document.getElementById('guest-view').classList.remove('hidden');
        
        document.getElementById('auth-email').value = '';
        document.getElementById('auth-password').value = '';
        document.getElementById('auth-name').value = '';
        
        showToast('Signed out successfully', 'info');
        updateAuthUI();
    } catch (error) {
        showToast('Sign out failed', 'error');
    }
}

function updateAuthUI() {
    const userInfo = document.getElementById('user-info');
    const authForm = document.querySelector('#auth-panel form');
    const userEmailDisplay = document.getElementById('user-email-display');
    
    if (currentUser) {
        userInfo.classList.remove('hidden');
        authForm.classList.add('hidden');
        userEmailDisplay.textContent = currentUser.email;
    } else {
        userInfo.classList.add('hidden');
        authForm.classList.remove('hidden');
    }
}

function switchSection(section) {
    currentSection = section;
    
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        const tabSection = tab.getAttribute('data-section');
        const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
        const textColor = currentConfig.text_color || defaultConfig.text_color;
        
        if (tabSection === section) {
            tab.style.background = surfaceColor;
            tab.style.color = textColor;
            tab.classList.add('active');
        } else {
            tab.style.background = 'transparent';
            tab.style.color = textColor;
            tab.classList.remove('active');
        }
    });
    
    document.getElementById(`${section}-section`).classList.remove('hidden');
    updateDashboardContent();
}

function updateDashboardContent() {
    if (currentSection === 'reservations') {
        renderReservations();
    } else if (currentSection === 'orders') {
        renderOrders();
    } else if (currentSection === 'menu') {
        renderMenuManagement();
    } else if (currentSection === 'inventory') {
        renderInventory();
    } else if (currentSection === 'staff') {
        renderStaff();
    }
}

function renderReservations() {
    const reservationsList = document.getElementById('reservations-list');
    const reservations = allData.filter(item => item.type === 'reservation');
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    if (reservations.length === 0) {
        reservationsList.innerHTML = `<div class="col-span-full text-center p-12 opacity-60" style="color: ${textColor}; font-size: ${baseSize}px;">No reservations yet</div>`;
        return;
    }
    
    reservationsList.innerHTML = reservations.map(res => {
        const statusColors = {
            pending: '#f59e0b',
            confirmed: '#10b981',
            cancelled: '#ef4444'
        };
        const statusColor = statusColors[res.status] || '#6b7280';
        
        return `
            <div class="staff-card p-6 card-shadow" style="background: ${surfaceColor};">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-light mb-1" style="font-size: ${baseSize * 1.125}px; color: ${textColor};">${res.guest_name}</h4>
                        <p class="text-sm opacity-60" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">${res.guest_email}</p>
                        <p class="text-sm opacity-60" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">${res.guest_phone}</p>
                    </div>
                    <span class="status-badge" style="background: ${statusColor}20; color: ${statusColor}; font-size: ${baseSize * 0.8}px;">
                        ${res.status}
                    </span>
                </div>
                <div class="space-y-2 mb-4">
                    <p class="text-sm" style="font-size: ${baseSize * 0.875}px; color: ${textColor};"><strong>Date:</strong> ${res.date}</p>
                    <p class="text-sm" style="font-size: ${baseSize * 0.875}px; color: ${textColor};"><strong>Time:</strong> ${res.time}</p>
                    <p class="text-sm" style="font-size: ${baseSize * 0.875}px; color: ${textColor};"><strong>Guests:</strong> ${res.guests}</p>
                    ${res.preordered_dishes && res.preordered_dishes !== '' ? `<p class="text-sm" style="font-size: ${baseSize * 0.875}px; color: ${textColor};"><strong>Pre-ordered:</strong> ${res.preordered_dishes}</p>` : ''}
                    ${res.special_requests ? `<p class="text-sm opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">${res.special_requests}</p>` : ''}
                </div>
                <button onclick="deleteReservation('${res.__backendId}')" class="text-sm opacity-60 hover:opacity-100 transition-opacity" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Delete</button>
            </div>
        `;
    }).join('');
}

async function deleteReservation(backendId) {
    const record = allData.find(item => item.__backendId === backendId);
    if (!record) return;
    
    const result = await window.dataSdk.delete(record);
    if (!result.isOk) {
        showToast('Failed to delete reservation', 'error');
    } else {
        showToast('Reservation deleted', 'success');
    }
}

function renderOrders() {
    const ordersList = document.getElementById('orders-list');
    const orders = allData.filter(item => item.type === 'order');
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    if (orders.length === 0) {
        ordersList.innerHTML = `<div class="col-span-full text-center p-12 opacity-60" style="color: ${textColor}; font-size: ${baseSize}px;">No active orders</div>`;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => {
        const statusColors = {
            pending: '#f59e0b',
            preparing: '#3b82f6',
            ready: '#10b981',
            completed: '#6b7280'
        };
        const statusColor = statusColors[order.status] || '#6b7280';
        
        return `
            <div class="menu-card p-6 rounded-3xl card-shadow" style="background: ${surfaceColor};">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-light mb-1" style="font-size: ${baseSize * 1.125}px; color: ${textColor};">Table ${order.table_number}</h4>
                        <p class="text-sm opacity-60" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">${order.guest_name}</p>
                    </div>
                    <span class="status-badge" style="background: ${statusColor}20; color: ${statusColor}; font-size: ${baseSize * 0.8}px;">
                        ${order.status}
                    </span>
                </div>
                <p class="text-sm mb-3 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">${order.items}</p>
                <div class="flex justify-between items-center">
                    <span class="font-light" style="font-size: ${baseSize * 1.125}px; color: ${textColor};">BDT ${order.total}</span>
                    <button onclick="deleteOrder('${order.__backendId}')" class="text-sm opacity-60 hover:opacity-100 transition-opacity" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderMenuManagement() {
    const menuList = document.getElementById('menu-management-list');
    const menuItems = allData.filter(item => item.type === 'menu');
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    if (menuItems.length === 0) {
        menuList.innerHTML = `<div class="col-span-full text-center p-12 opacity-60" style="color: ${textColor}; font-size: ${baseSize}px;">No menu items yet</div>`;
        return;
    }
    
    menuList.innerHTML = menuItems.map(item => `
        <div class="menu-card p-6 rounded-3xl card-shadow" style="background: ${surfaceColor};">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-light" style="font-size: ${baseSize * 1.125}px; color: ${textColor};">${item.item_name}</h4>
                <span class="font-light" style="font-size: ${baseSize * 1.125}px; color: ${textColor};">�����${item.price}</span>
            </div>
            <p class="text-sm opacity-60 mb-3" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">${item.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-xs opacity-50" style="font-size: ${baseSize * 0.75}px; color: ${textColor};">${item.category}</span>
                <button onclick="deleteMenuItem('${item.__backendId}')" class="text-sm opacity-60 hover:opacity-100 transition-opacity" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Delete</button>
            </div>
        </div>
    `).join('');
}

function renderInventory() {
    const inventoryList = document.getElementById('inventory-list');
    const inventory = allData.filter(item => item.type === 'inventory');
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    if (inventory.length === 0) {
        inventoryList.innerHTML = `<div class="text-center p-12 opacity-60" style="color: ${textColor}; font-size: ${baseSize}px;">No inventory items yet</div>`;
        return;
    }
    
    inventoryList.innerHTML = inventory.map(item => `
        <div class="p-6 rounded-3xl card-shadow flex justify-between items-center" style="background: ${surfaceColor};">
            <div>
                <h4 class="font-light mb-1" style="font-size: ${baseSize * 1.125}px; color: ${textColor};">${item.item_name}</h4>
                <p class="text-sm opacity-60" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">${item.category}</p>
            </div>
            <div class="text-right">
                <p class="font-light mb-1" style="font-size: ${baseSize * 1.125}px; color: ${textColor};">Stock: ${item.stock_quantity}</p>
                <button onclick="deleteInventoryItem('${item.__backendId}')" class="text-sm opacity-60 hover:opacity-100 transition-opacity" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Delete</button>
            </div>
        </div>
    `).join('');
}

function renderStaff() {
    const staffList = document.getElementById('staff-list');
    const staff = allData.filter(item => item.type === 'staff');
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    if (staff.length === 0) {
        staffList.innerHTML = `<div class="col-span-full text-center p-12 opacity-60" style="color: ${textColor}; font-size: ${baseSize}px;">No staff members yet</div>`;
        return;
    }
    
    staffList.innerHTML = staff.map(member => `
        <div class="staff-card p-6 rounded-3xl card-shadow" style="background: ${surfaceColor};">
            <h4 class="font-light mb-2" style="font-size: ${baseSize * 1.125}px; color: ${textColor};">${member.staff_name}</h4>
            <p class="text-sm opacity-60 mb-1" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">${member.role}</p>
            <p class="text-sm opacity-60 mb-3" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Shift: ${member.shift}</p>
            <div class="flex justify-between items-center">
                <span class="text-xs opacity-50" style="font-size: ${baseSize * 0.75}px; color: ${textColor};">${member.contact}</span>
                <button onclick="deleteStaff('${member.__backendId}')" class="text-sm opacity-60 hover:opacity-100 transition-opacity" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateAnalytics() {
    const orders = allData.filter(item => item.type === 'order');
    const staff = allData.filter(item => item.type === 'staff');
    
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => order.timestamp && order.timestamp.startsWith(today));
    
    document.getElementById('total-orders').textContent = todayOrders.length;
    
    const revenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('total-revenue').textContent = `BDT ${revenue.toFixed(2)}`;
    
    document.getElementById('active-staff').textContent = staff.length;
}

function showAddOrderForm() {
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const primaryColor = currentConfig.primary_action_color || defaultConfig.primary_action_color;
    const secondaryColor = currentConfig.secondary_action_color || defaultConfig.secondary_action_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h3 class="font-light mb-6" style="font-size: ${baseSize * 1.5}px; color: ${textColor};">New Order</h3>
        <form onsubmit="submitOrder(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Table Number</label>
                <input type="text" id="order-table" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Guest Name</label>
                <input type="text" id="order-guest" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Items</label>
                <textarea id="order-items" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" rows="3" required style="color: ${textColor};"></textarea>
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Total (BDT)</label>
                <input type="number" id="order-total" step="0.01" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Status</label>
                <select id="order-status" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" style="color: ${textColor};">
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <div class="flex gap-3 pt-4">
                <button type="button" onclick="closeModal()" class="flex-1 py-3 rounded-full border border-gray-300 hover:border-gray-400 transition-all font-light hover:scale-105" style="color: ${textColor}; font-size: ${baseSize}px;">Cancel</button>
                <button type="submit" class="flex-1 py-3 rounded-full text-white btn-primary font-light" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); font-size: ${baseSize}px;">Add Order</button>
            </div>
        </form>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

async function submitOrder(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;
    
    const orderData = {
        id: 'order-' + Date.now(),
        type: 'order',
        table_number: document.getElementById('order-table').value,
        guest_name: document.getElementById('order-guest').value,
        items: document.getElementById('order-items').value,
        total: parseFloat(document.getElementById('order-total').value),
        status: document.getElementById('order-status').value,
        timestamp: new Date().toISOString()
    };
    
    const result = await window.dataSdk.create(orderData);
    
    if (result.isOk) {
        closeModal();
        showToast('Order added successfully', 'success');
    } else {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showToast('Failed to add order', 'error');
    }
}

function showAddMenuItemForm() {
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const primaryColor = currentConfig.primary_action_color || defaultConfig.primary_action_color;
    const secondaryColor = currentConfig.secondary_action_color || defaultConfig.secondary_action_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h3 class="font-light mb-6" style="font-size: ${baseSize * 1.5}px; color: ${textColor};">Add Menu Item</h3>
        <form onsubmit="submitMenuItem(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Item Name</label>
                <input type="text" id="menu-name" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Category</label>
                <input type="text" id="menu-category" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Description</label>
                <textarea id="menu-description" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" rows="3" required style="color: ${textColor};"></textarea>
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Price (BDT)</label>
                <input type="number" id="menu-price" step="0.01" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div class="flex gap-3 pt-4">
                <button type="button" onclick="closeModal()" class="flex-1 py-3 rounded-full border border-gray-300 hover:border-gray-400 transition-all font-light hover:scale-105" style="color: ${textColor}; font-size: ${baseSize}px;">Cancel</button>
                <button type="submit" class="flex-1 py-3 rounded-full text-white btn-primary font-light" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); font-size: ${baseSize}px;">Add Item</button>
            </div>
        </form>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

async function submitMenuItem(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;
    
    const menuData = {
        id: 'menu-' + Date.now(),
        type: 'menu',
        item_name: document.getElementById('menu-name').value,
        category: document.getElementById('menu-category').value,
        description: document.getElementById('menu-description').value,
        price: parseFloat(document.getElementById('menu-price').value),
        available: true
    };
    
    const result = await window.dataSdk.create(menuData);
    
    if (result.isOk) {
        closeModal();
        showToast('Menu item added successfully', 'success');
    } else {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showToast('Failed to add menu item', 'error');
    }
}

function showAddInventoryForm() {
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const primaryColor = currentConfig.primary_action_color || defaultConfig.primary_action_color;
    const secondaryColor = currentConfig.secondary_action_color || defaultConfig.secondary_action_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h3 class="font-light mb-6" style="font-size: ${baseSize * 1.5}px; color: ${textColor};">Add Inventory Item</h3>
        <form onsubmit="submitInventory(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Item Name</label>
                <input type="text" id="inventory-name" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Category</label>
                <input type="text" id="inventory-category" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Stock Quantity</label>
                <input type="number" id="inventory-stock" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div class="flex gap-3 pt-4">
                <button type="button" onclick="closeModal()" class="flex-1 py-3 rounded-full border border-gray-300 hover:border-gray-400 transition-all font-light hover:scale-105" style="color: ${textColor}; font-size: ${baseSize}px;">Cancel</button>
                <button type="submit" class="flex-1 py-3 rounded-full text-white btn-primary font-light" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); font-size: ${baseSize}px;">Add Item</button>
            </div>
        </form>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

async function submitInventory(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;
    
    const inventoryData = {
        id: 'inventory-' + Date.now(),
        type: 'inventory',
        item_name: document.getElementById('inventory-name').value,
        category: document.getElementById('inventory-category').value,
        stock_quantity: parseInt(document.getElementById('inventory-stock').value)
    };
    
    const result = await window.dataSdk.create(inventoryData);
    
    if (result.isOk) {
        closeModal();
        showToast('Inventory item added successfully', 'success');
    } else {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showToast('Failed to add inventory item', 'error');
    }
}

function showAddStaffForm() {
    const surfaceColor = currentConfig.surface_color || defaultConfig.surface_color;
    const textColor = currentConfig.text_color || defaultConfig.text_color;
    const primaryColor = currentConfig.primary_action_color || defaultConfig.primary_action_color;
    const secondaryColor = currentConfig.secondary_action_color || defaultConfig.secondary_action_color;
    const baseSize = currentConfig.font_size || defaultConfig.font_size;
    
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h3 class="font-light mb-6" style="font-size: ${baseSize * 1.5}px; color: ${textColor};">Add Staff Member</h3>
        <form onsubmit="submitStaff(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Name</label>
                <input type="text" id="staff-name-input" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Role</label>
                <input type="text" id="staff-role" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Shift</label>
                <input type="text" id="staff-shift" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div>
                <label class="block text-sm font-light mb-2 opacity-70" style="font-size: ${baseSize * 0.875}px; color: ${textColor};">Contact</label>
                <input type="text" id="staff-contact" class="w-full px-4 py-3 rounded-2xl border border-gray-200 input-field focus:outline-none focus:border-gray-400" required style="color: ${textColor};">
            </div>
            <div class="flex gap-3 pt-4">
                <button type="button" onclick="closeModal()" class="flex-1 py-3 rounded-full border border-gray-300 hover:border-gray-400 transition-all font-light hover:scale-105" style="color: ${textColor}; font-size: ${baseSize}px;">Cancel</button>
                <button type="submit" class="flex-1 py-3 rounded-full text-white btn-primary font-light" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); font-size: ${baseSize}px;">Add Staff</button>
            </div>
        </form>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

async function submitStaff(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;
    
    const staffData = {
        id: 'staff-' + Date.now(),
        type: 'staff',
        staff_name: document.getElementById('staff-name-input').value,
        role: document.getElementById('staff-role').value,
        shift: document.getElementById('staff-shift').value,
        contact: document.getElementById('staff-contact').value
    };
    
    const result = await window.dataSdk.create(staffData);
    
    if (result.isOk) {
        closeModal();
        showToast('Staff member added successfully', 'success');
    } else {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showToast('Failed to add staff member', 'error');
    }
}

async function deleteOrder(backendId) {
    const record = allData.find(item => item.__backendId === backendId);
    if (!record) return;
    
    const result = await window.dataSdk.delete(record);
    if (!result.isOk) {
        showToast('Failed to delete order', 'error');
    } else {
        showToast('Order deleted', 'success');
    }
}

async function deleteMenuItem(backendId) {
    const record = allData.find(item => item.__backendId === backendId);
    if (!record) return;
    
    const result = await window.dataSdk.delete(record);
    if (!result.isOk) {
        showToast('Failed to delete menu item', 'error');
    } else {
        showToast('Menu item deleted', 'success');
    }
}

async function deleteInventoryItem(backendId) {
    const record = allData.find(item => item.__backendId === backendId);
    if (!record) return;
    
    const result = await window.dataSdk.delete(record);
    if (!result.isOk) {
        showToast('Failed to delete inventory item', 'error');
    } else {
        showToast('Inventory item deleted', 'success');
    }
}

async function deleteStaff(backendId) {
    const record = allData.find(item => item.__backendId === backendId);
    if (!record) return;
    
    const result = await window.dataSdk.delete(record);
    if (!result.isOk) {
        showToast('Failed to delete staff member', 'error');
    } else {
        showToast('Staff member deleted', 'success');
    }
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-overlay').classList.add('hidden');
}

initApp();
