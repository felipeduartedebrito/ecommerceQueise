// QUEISE - JavaScript Integrado com Sistema de Personalização

// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================

// DOM Elements
const pageLoader = document.getElementById('pageLoader');
const header = document.getElementById('header');

// Product configuration
let productConfig = {
    basePrice: 165,
    selectedSize: '1L',
    selectedColor: 'yellow',
    selectedFont: 'Manuscript',
    customizationType: '',
    customText: '',
    quantity: 1,
    customizationCost: 20,
    isCustomized: false
};

// Color mappings for SVG generation
const colorMappings = {
    'yellow': '#FBBF24',
    'blue': '#398BEB', 
    'green': '#22C55E',
    'red': '#EF4444',
    'purple': '#8B5CF6',
    'black': '#374151',
    'orange': '#F59E0B',
    'teal': '#10B981'
};

const colorNames = {
    'yellow': 'Amarelo',
    'blue': 'Azul',
    'green': 'Verde', 
    'red': 'Vermelho',
    'purple': 'Roxo',
    'black': 'Preto',
    'orange': 'Laranja',
    'teal': 'Verde Água'
};

// ========================================
// INICIALIZAÇÃO
// ========================================

// Page Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        pageLoader.classList.add('hidden');
    }, 1200);
});

// Header Scroll Effect
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Add scrolled class for styling
    if (scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Hide header on scroll down, show on scroll up
    if (scrollY > lastScrollY && scrollY > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScrollY = scrollY;
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Scroll Animations (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all scroll-animate elements
document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el);
});

// ========================================
// PRODUCT PAGE MODAL FUNCTIONS
// ========================================

// Open product page modal
function openProductPage() {
    const overlay = document.getElementById('productPageOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize product page
    updateTotalPrice();
    updateMainImage();
    
    // Track event
    trackEvent('open', 'Product Page');
}

// Close product page modal
function closeProductPage() {
    const overlay = document.getElementById('productPageOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form if needed
    resetCustomization();
    
    trackEvent('close', 'Product Page');
}

// Size Selection
function selectSize(element, size, price) {
    // Remove selected from all size options
    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected to clicked option
    element.classList.add('selected');
    
    // Update product config
    productConfig.selectedSize = size;
    productConfig.basePrice = price;
    
    // Update display price and total
    updateTotalPrice();
    
    trackEvent('select_size', 'Product Options', size);
}

// Color Selection
function selectColor(element, color, colorName) {
    // Remove selected from all color options
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected to clicked option
    element.classList.add('selected');
    
    // Update product config
    productConfig.selectedColor = color;
    
    // Update color name display
    const colorNameEl = document.getElementById('colorName');
    if (colorNameEl) {
        colorNameEl.textContent = colorName;
    }
    
    // Update main image
    updateMainImage();
    
    // Update customization preview if active
    if (productConfig.isCustomized && productConfig.customText) {
        updatePreview();
    }
    
    trackEvent('select_color', 'Product Options', color);
}

// Thumbnail image change
function changeMainImage(thumbnail, color) {
    // Remove active from all thumbnails
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    // Add active to clicked thumbnail
    thumbnail.classList.add('active');
    
    // Update main image based on color
    updateMainImage();
}

// Update main product image
function updateMainImage() {
    const mainImg = document.getElementById('productImage');
    if (!mainImg) return;
    
    const color = colorMappings[productConfig.selectedColor];
    
    // Generate new SVG with selected color
    const svg = generateProductSVG(color);
    mainImg.src = 'data:image/svg+xml;base64,' + btoa(svg);
}

// Generate product SVG
function generateProductSVG(color) {
    return `
        <svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="garrafa">
                <ellipse cx="150" cy="370" rx="80" ry="15" fill="#E5E7EB" fill-opacity="0.5"/>
                <rect x="100" y="100" width="100" height="250" rx="50" fill="${color}" stroke="#374151" stroke-width="2"/>
                <rect x="120" y="80" width="60" height="40" rx="20" fill="#374151"/>
                <circle cx="150" cy="100" r="15" fill="#374151"/>
                <rect x="105" y="105" width="90" height="240" rx="45" fill="url(#gradient1)"/>
            </g>
            <defs>
                <linearGradient id="gradient1" x1="150" y1="105" x2="150" y2="345" gradientUnits="userSpaceOnUse">
                    <stop stop-color="${color}"/>
                    <stop offset="1" stop-color="${color}" stop-opacity="0.8"/>
                </linearGradient>
            </defs>
        </svg>
    `;
}

// ========================================
// CUSTOMIZATION FUNCTIONS
// ========================================

// Customization toggle
function toggleCustomization() {
    const form = document.getElementById('customizationForm');
    const toggle = document.getElementById('customizeToggle');
    if (!form || !toggle) return;
    
    const isHidden = form.classList.contains('hidden');
    
    if (isHidden) {
        form.classList.remove('hidden');
        toggle.textContent = 'Remove';
        toggle.classList.add('remove');
        productConfig.isCustomized = true;
        trackEvent('enable_customization', 'Product Options');
    } else {
        form.classList.add('hidden');
        toggle.textContent = 'Personalizar';
        toggle.classList.remove('remove');
        productConfig.isCustomized = false;
        productConfig.customText = '';
        productConfig.customizationType = '';
        
        // Clear form
        const typeSelect = document.getElementById('customizationType');
        const textInput = document.getElementById('customText');
        if (typeSelect) typeSelect.value = '';
        if (textInput) textInput.value = '';
        
        hideCustomizationPreview();
        updateCustomizationFields();
        trackEvent('disable_customization', 'Product Options');
    }
    
    updateTotalPrice();
}

// Update customization fields based on type
function updateCustomizationFields() {
    const typeSelect = document.getElementById('customizationType');
    const textGroup = document.getElementById('textGroup');
    const fontGroup = document.getElementById('fontGroup');
    
    if (!typeSelect || !textGroup || !fontGroup) return;
    
    const type = typeSelect.value;
    productConfig.customizationType = type;
    
    // Hide all groups first
    textGroup.style.display = 'none';
    fontGroup.style.display = 'none';
    
    // Show relevant groups based on type
    if (type === 'text' || type === 'name' || type === 'phrase') {
        textGroup.style.display = 'block';
        fontGroup.style.display = 'block';
        
        // Update placeholder based on type
        const input = document.getElementById('customText');
        if (input) {
            switch(type) {
                case 'text':
                    input.placeholder = 'Digite seu texto...';
                    break;
                case 'name':
                    input.placeholder = 'Digite seu nome...';
                    break;
                case 'phrase':
                    input.placeholder = 'Digite sua frase...';
                    break;
            }
        }
    } else if (type === 'logo') {
        textGroup.style.display = 'block';
        fontGroup.style.display = 'none';
        const input = document.getElementById('customText');
        if (input) {
            input.placeholder = 'Nome do ícone/logo...';
        }
    }
    
    trackEvent('select_customization_type', 'Product Options', type);
}

// Font selection
function selectFont(element, font) {
    document.querySelectorAll('.font-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    productConfig.selectedFont = font;
    
    if (productConfig.customText) {
        updatePreview();
    }
    
    trackEvent('select_font', 'Product Options', font);
}

// Update customization preview
function updatePreview() {
    const textInput = document.getElementById('customText');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    productConfig.customText = text;
    
    if (text && productConfig.customizationType) {
        showCustomizationPreview(text);
    } else {
        hideCustomizationPreview();
    }
}

// Show customization preview
function showCustomizationPreview(text) {
    const preview = document.getElementById('customizationPreview');
    const mainImage = document.getElementById('mainImage');
    
    if (!preview || !mainImage) return;
    
    preview.textContent = text.toUpperCase();
    preview.style.fontFamily = getFontFamily(productConfig.selectedFont);
    mainImage.classList.add('has-customization');
}

// Hide customization preview
function hideCustomizationPreview() {
    const preview = document.getElementById('customizationPreview');
    const mainImage = document.getElementById('mainImage');
    
    if (!preview || !mainImage) return;
    
    preview.textContent = '';
    mainImage.classList.remove('has-customization');
}

// Get font family for preview
function getFontFamily(fontName) {
    const fontMap = {
        'Manuscript': 'cursive',
        'Regards': 'serif',
        'Montserrat': 'sans-serif',
        'UNDERGRAD': 'monospace',
        'Verdana': 'Verdana, sans-serif',
        'QUEISE': 'Georgia, serif'
    };
    return fontMap[fontName] || 'sans-serif';
}

// Show preview (button action)
function showPreview() {
    if (!productConfig.customText) {
        alert('Digite um texto para ver o preview!');
        return;
    }
    
    // Enhanced preview animation
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            mainImage.style.transform = 'scale(1)';
        }, 500);
    }
    
    trackEvent('preview_customization', 'Product Options');
}

// Reset customization
function resetCustomization() {
    productConfig.isCustomized = false;
    productConfig.customText = '';
    productConfig.customizationType = '';
    productConfig.selectedFont = 'Manuscript';
    
    const form = document.getElementById('customizationForm');
    const toggle = document.getElementById('customizeToggle');
    
    if (form && toggle) {
        form.classList.add('hidden');
        toggle.textContent = 'Personalizar';
        toggle.classList.remove('remove');
    }
    
    hideCustomizationPreview();
    updateCustomizationFields();
}

// ========================================
// QUANTITY & PRICING FUNCTIONS
// ========================================

// Quantity controls
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    const newQuantity = parseInt(quantityInput.value) + delta;
    
    if (newQuantity >= 1) {
        quantityInput.value = newQuantity;
        productConfig.quantity = newQuantity;
        updateTotalPrice();
        trackEvent('change_quantity', 'Product Options', newQuantity.toString());
    }
}

// Update total price
function updateTotalPrice() {
    const basePrice = productConfig.basePrice;
    const customizationCost = productConfig.isCustomized && productConfig.customizationType ? productConfig.customizationCost : 0;
    const quantity = productConfig.quantity;
    const total = (basePrice + customizationCost) * quantity;
    
    // Update display
    const displayPriceEl = document.getElementById('displayPrice');
    const totalPriceEl = document.getElementById('totalPrice');
    
    if (displayPriceEl) {
        displayPriceEl.textContent = `R$ ${basePrice.toFixed(2).replace('.', ',')}`;
    }
    
    if (totalPriceEl) {
        totalPriceEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

// ========================================
// CART & PURCHASE FUNCTIONS
// ========================================

// Add to cart
function addToCart() {
    const button = document.querySelector('.btn-primary');
    if (!button) return;
    
    // Validation
    if (productConfig.isCustomized && productConfig.customizationType && !productConfig.customText) {
        alert('Por favor, complete a personalização antes de adicionar ao carrinho!');
        return;
    }
    
    // Animation
    button.classList.add('loading');
    button.textContent = 'Adicionando...';
    
    // Simulate adding to cart
    setTimeout(() => {
        button.classList.remove('loading');
        button.classList.add('added-animation');
        button.textContent = 'Adicionado!';
        
        // Store cart data
        saveToCart();
        
        setTimeout(() => {
            button.classList.remove('added-animation');
            button.textContent = 'Adicionar ao carrinho';
        }, 2000);
        
        trackEvent('add_to_cart', 'Purchase', `${productConfig.selectedSize}_${productConfig.selectedColor}`);
    }, 1000);
}

// Save to cart (localStorage for demo)
function saveToCart() {
    const cartItem = {
        id: Date.now(),
        name: 'Garrafa Térmica Premium',
        size: productConfig.selectedSize,
        color: productConfig.selectedColor,
        colorName: colorNames[productConfig.selectedColor],
        price: productConfig.basePrice,
        quantity: productConfig.quantity,
        customization: productConfig.isCustomized ? {
            type: productConfig.customizationType,
            text: productConfig.customText,
            font: productConfig.selectedFont,
            cost: productConfig.customizationCost
        } : null,
        total: (productConfig.basePrice + (productConfig.isCustomized && productConfig.customizationType ? productConfig.customizationCost : 0)) * productConfig.quantity
    };
    
    // Get existing cart
    let cart = JSON.parse(localStorage.getItem('queise_cart') || '[]');
    cart.push(cartItem);
    
    // Save updated cart
    localStorage.setItem('queise_cart', JSON.stringify(cart));
    
    console.log('Item adicionado ao carrinho:', cartItem);
}

// ========================================
// CONTACT & QUOTE FUNCTIONS
// ========================================

// Request quote from product page
function requestQuote() {
    // Generate WhatsApp message
    const message = generateQuoteMessage();
    
    // Open WhatsApp
    const whatsappURL = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    
    trackEvent('request_quote', 'Lead Generation', 'Product Page');
}

// Generate quote message
function generateQuoteMessage() {
    const customizationText = productConfig.isCustomized && productConfig.customizationType ? 
        `\n\n✨ *PERSONALIZAÇÃO*\n• Tipo: ${getCustomizationTypeName()}\n• Texto: ${productConfig.customText}\n• Fonte: ${productConfig.selectedFont}\n• Custo adicional: R$ ${productConfig.customizationCost.toFixed(2)}` : 
        '\n\n✨ *SEM PERSONALIZAÇÃO*';
    
    const total = (productConfig.basePrice + (productConfig.isCustomized && productConfig.customizationType ? productConfig.customizationCost : 0)) * productConfig.quantity;
    
    return `🛍️ *SOLICITAÇÃO DE ORÇAMENTO - QUEISE*

📦 *PRODUTO*
• Garrafa Térmica Premium
• Tamanho: ${productConfig.selectedSize}
• Cor: ${colorNames[productConfig.selectedColor]}
• Quantidade: ${productConfig.quantity} unidade(s)
• Preço unitário: R$ ${productConfig.basePrice.toFixed(2)}${customizationText}

💰 *TOTAL: R$ ${total.toFixed(2)}*

---
Solicitação enviada via site QUEISE
Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
}

// Get customization type name
function getCustomizationTypeName() {
    const typeNames = {
        'text': 'Texto vertical',
        'logo': 'Logo/Ícone',
        'name': 'Nome personalizado',
        'phrase': 'Frase motivacional'
    };
    return typeNames[productConfig.customizationType] || productConfig.customizationType;
}

// Open contact modal
function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        trackEvent('open', 'Contact Modal');
    }
}

// Close contact modal
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        hideMessage('contactMessage');
        trackEvent('close', 'Contact Modal');
    }
}

// Submit contact form
async function submitContact() {
    if (!validateContactForm()) return;

    const submitBtn = document.querySelector('#contactModal .btn-primary-modal');
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Enviando...';
    }

    try {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        
        const contactData = {
            type: 'contact',
            name: formData.get('name'),
            company: formData.get('company'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            productType: formData.get('product_type'),
            quantity: formData.get('quantity'),
            description: formData.get('description'),
            timestamp: new Date().toISOString()
        };

        // Simulate API call
        await simulateAPICall();

        // Generate WhatsApp message for contact
        const whatsappMessage = generateContactWhatsAppMessage(contactData);
        
        showMessage('contactMessage', 'Solicitação enviada com sucesso! Redirecionando para WhatsApp...', 'success');
        
        setTimeout(() => {
            window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
            closeContactModal();
            resetContactForm();
        }, 2000);

        trackEvent('submit_contact', 'Lead Generation', contactData.productType);

    } catch (error) {
        showMessage('contactMessage', 'Erro ao enviar solicitação. Tente novamente.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Enviar Solicitação';
        }
    }
}

// Generate contact WhatsApp message
function generateContactWhatsAppMessage(data) {
    return `📞 *SOLICITAÇÃO DE ORÇAMENTO - QUEISE*

👤 *Cliente:* ${data.name}
🏢 *Empresa:* ${data.company || 'Não informado'}
📧 *Email:* ${data.email}
📱 *WhatsApp:* ${data.phone}

🎯 *PRODUTO*
• Tipo: ${data.productType}
• Quantidade: ${data.quantity}

📋 *DESCRIÇÃO DO PROJETO*
${data.description}

---
Solicitação enviada via site QUEISE
Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
}

// ========================================
// VALIDATION & UTILITY FUNCTIONS
// ========================================

// Validate contact form
function validateContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return false;
    
    const formData = new FormData(form);
    
    const requiredFields = ['name', 'email', 'phone', 'product_type', 'description'];
    
    for (let field of requiredFields) {
        if (!formData.get(field) || formData.get(field).trim() === '') {
            showMessage('contactMessage', 'Por favor, preencha todos os campos obrigatórios.', 'error');
            return false;
        }
    }

    if (!isValidEmail(formData.get('email'))) {
        showMessage('contactMessage', 'Por favor, insira um email válido.', 'error');
        return false;
    }

    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message
function showMessage(messageId, text, type = 'success') {
    const messageEl = document.getElementById(messageId);
    if (!messageEl) return;
    
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
    
    setTimeout(() => {
        hideMessage(messageId);
    }, 5000);
}

// Hide message
function hideMessage(messageId) {
    const messageEl = document.getElementById(messageId);
    if (messageEl) {
        messageEl.classList.remove('show');
    }
}

// Reset contact form
function resetContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.reset();
    }
}

// Simulate API call
async function simulateAPICall() {
    return new Promise(resolve => {
        setTimeout(resolve, 1500); // Simulate network delay
    });
}

// ========================================
// MODAL & INTERACTION HANDLERS
// ========================================

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    // Product page modal
    const productPageOverlay = document.getElementById('productPageOverlay');
    if (e.target === productPageOverlay) {
        closeProductPage();
    }
    
    // Contact modal
    const contactModal = document.getElementById('contactModal');
    if (e.target === contactModal) {
        closeContactModal();
    }
});

// ESC key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const productPageOverlay = document.getElementById('productPageOverlay');
        const contactModal = document.getElementById('contactModal');
        
        if (productPageOverlay && productPageOverlay.classList.contains('active')) {
            closeProductPage();
        }
        
        if (contactModal && contactModal.classList.contains('active')) {
            closeContactModal();
        }
    }
});

// ========================================
// ENHANCED INTERACTIONS
// ========================================

// Enhanced Card Interactions
const setupCardHovers = () => {
    document.querySelectorAll('.product-card, .collection-card, .featured-main, .featured-side, .empresa-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            if (this.classList.contains('product-card')) {
                this.style.transform = 'translateY(-15px) scale(1.03)';
            } else if (this.classList.contains('empresa-card')) {
                this.style.transform = 'translateY(-8px)';
            } else {
                this.style.transform = 'translateY(-8px)';
            }
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
};

// Parallax Effect for Geometric Backgrounds
const setupParallax = () => {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const geometricBgs = document.querySelectorAll('.geometric-bg');

        geometricBgs.forEach((element, index) => {
            const speed = 0.3 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
};

// Button Animation Effects
const setupButtonAnimations = () => {
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-white').forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            const span = this.querySelector('span');
            if (span) {
                span.style.transform = 'translateX(4px)';
                span.style.transition = 'transform 0.3s ease';
            }
        });

        btn.addEventListener('mouseleave', function () {
            const span = this.querySelector('span');
            if (span) {
                span.style.transform = 'translateX(0)';
            }
        });
    });
};

// Feature Icon Hover Effects
const setupFeatureHovers = () => {
    document.querySelectorAll('.feature, .empresa-feature').forEach(feature => {
        feature.addEventListener('mouseenter', function () {
            const icon = this.querySelector('.feature-icon, .empresa-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });

        feature.addEventListener('mouseleave', function () {
            const icon = this.querySelector('.feature-icon, .empresa-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
};

// Dynamic Pricing Effects
const setupPricingEffects = () => {
    document.querySelectorAll('.product-price, .featured-price').forEach(price => {
        price.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        price.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });
};

// Image Error Handling
const setupImageFallbacks = () => {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            console.log(`Failed to load image: ${this.src}`);
            this.style.display = 'none';
        });
    });
};

// Performance Optimization
const setupPerformanceOptimizations = () => {
    let ticking = false;

    const optimizedScrollHandler = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
};

// Accessibility Enhancements
const setupAccessibility = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.setAttribute('role', 'menuitem');
    });

    const cards = document.querySelectorAll('.product-card, .collection-card');
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
};

// ========================================
// FORM & DATA HANDLING
// ========================================

// Phone number formatting
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{0,5})(\d{0,4})/, function(match, p1, p2, p3) {
            if (p3) return `(${p1}) ${p2}-${p3}`;
            if (p2) return `(${p1}) ${p2}`;
            if (p1) return `(${p1}`;
            return match;
        });
    }
    
    input.value = value;
}

// Save form data to localStorage (for user convenience)
function saveFormData() {
    const customerData = {
        name: document.getElementById('customerName')?.value || '',
        email: document.getElementById('customerEmail')?.value || '',
        phone: document.getElementById('customerPhone')?.value || ''
    };
    
    localStorage.setItem('queise_customer_data', JSON.stringify(customerData));
}

function loadFormData() {
    const savedData = localStorage.getItem('queise_customer_data');
    if (savedData) {
        const data = JSON.parse(savedData);
        const nameEl = document.getElementById('customerName');
        const emailEl = document.getElementById('customerEmail');
        const phoneEl = document.getElementById('customerPhone');
        
        if (nameEl) nameEl.value = data.name || '';
        if (emailEl) emailEl.value = data.email || '';
        if (phoneEl) phoneEl.value = data.phone || '';
    }
}

// ========================================
// ANALYTICS & TRACKING
// ========================================

// Analytics tracking (ready for Google Analytics)
function trackEvent(action, category = 'General', label = '') {
    // When Google Analytics is integrated, add:
    // gtag('event', action, {
    //     event_category: category,
    //     event_label: label
    // });
    
    console.log(`Analytics: ${category} - ${action} - ${label}`);
    
    // Send to any other analytics platforms
    // Facebook Pixel, Mixpanel, etc.
}

// Track page views
function trackPageView(page) {
    trackEvent('page_view', 'Navigation', page);
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize all functionality
const initializeApp = () => {
    // Setup all interactive elements
    setupCardHovers();
    setupParallax();
    setupButtonAnimations();
    setupFeatureHovers();
    setupPricingEffects();
    setupImageFallbacks();
    setupPerformanceOptimizations();
    setupAccessibility();

    // Add phone formatting to phone inputs
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            formatPhone(this);
        });
    });

    // Load saved form data
    loadFormData();
    
    // Save data when typing in customer inputs
    const customerInputs = ['customerName', 'customerEmail', 'customerPhone'];
    customerInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', saveFormData);
        }
    });

    // Add quantity input listener for product page
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            productConfig.quantity = parseInt(this.value) || 1;
            if (productConfig.quantity < 1) {
                productConfig.quantity = 1;
                this.value = 1;
            }
            updateTotalPrice();
        });
    }
    
    // Add text input listener for customization
    const customTextInput = document.getElementById('customText');
    if (customTextInput) {
        customTextInput.addEventListener('input', function() {
            updatePreview();
        });
    }

    // Track initial page load
    trackPageView('home');
    
    console.log('QUEISE website initialized successfully');
};

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ========================================
// EXPORT FUNCTIONS FOR INTEGRATION
// ========================================

// Export functions for potential use in other scripts
window.QueiseApp = {
    // Main functions
    openProductPage,
    closeProductPage,
    openContactModal,
    closeContactModal,
    requestQuote,
    
    // Product functions
    selectColor,
    selectSize,
    selectFont,
    toggleCustomization,
    addToCart,
    
    // Utility functions
    trackEvent,
    updateTotalPrice,
    updatePreview,
    
    // Setup functions
    setupCardHovers,
    setupParallax,
    setupButtonAnimations,
    setupFeatureHovers,
    setupPricingEffects,
    setupImageFallbacks,
    setupPerformanceOptimizations,
    setupAccessibility,
    
    // Data access
    getProductConfig: () => productConfig,
    getCart: () => JSON.parse(localStorage.getItem('queise_cart') || '[]')
};

// Service Worker Registration (for future PWA implementation)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is ready
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(registrationError => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}

// ========================================
// READY FOR SHOPIFY INTEGRATION
// ========================================

// Shopify integration functions (to be implemented when account is ready)
window.QueiseShopify = {
    // Add product to Shopify cart
    addToShopifyCart: async (variantId, quantity, properties = {}) => {
        // Implementation when Shopify is ready
        console.log('Shopify integration ready for:', { variantId, quantity, properties });
    },
    
    // Update cart
    updateCart: async (updates) => {
        // Implementation when Shopify is ready
        console.log('Cart update ready for:', updates);
    },
    
    // Get product variants
    getProductVariants: async (productId) => {
        // Implementation when Shopify is ready
        console.log('Product variants ready for:', productId);
    }
};