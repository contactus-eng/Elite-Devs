// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://your-render-app-name.onrender.com/api';

// API Utility Functions
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Contact Form API
    static async submitContactForm(formData) {
        return this.request('/contact/submit', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Newsletter API
    static async subscribeToNewsletter(subscriberData) {
        return this.request('/newsletter/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscriberData)
        });
    }

    // Analytics API
    static async trackEvent(eventData) {
        return this.request('/analytics/track', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }
}

// Contact Form Handler
async function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            company: formData.get('company') || '',
            service: formData.get('service'),
            budget: formData.get('budget'),
            timeline: formData.get('timeline'),
            message: formData.get('message')
        };

        const response = await API.submitContactForm(data);
        alert('Thank you for your message! We\'ll get back to you within 24 hours.');
        form.reset();
        
    } catch (error) {
        console.error('Contact form submission failed:', error);
        alert('Failed to submit form. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Newsletter Subscription Handler
async function handleNewsletterSubscription(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Subscribing...';
        
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            firstName: formData.get('firstName') || '',
            lastName: formData.get('lastName') || ''
        };

        const response = await API.subscribeToNewsletter(data);
        alert('Successfully subscribed to our newsletter!');
        form.reset();
        
    } catch (error) {
        console.error('Newsletter subscription failed:', error);
        alert('Failed to subscribe. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Initialize API Integration
function initAPI() {
    // Set up contact form handlers
    const contactForms = document.querySelectorAll('#contact-form, .contact-form form');
    contactForms.forEach(form => {
        form.addEventListener('submit', handleContactFormSubmit);
    });
    
    // Set up newsletter subscription handlers
    const newsletterForms = document.querySelectorAll('.newsletter-form, [data-newsletter-form]');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', handleNewsletterSubscription);
    });
}

// Export for use in other scripts
window.API = API;
window.handleContactFormSubmit = handleContactFormSubmit;
window.handleNewsletterSubscription = handleNewsletterSubscription;
window.initAPI = initAPI;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAPI);
} else {
    initAPI();
}
