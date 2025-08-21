const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Send contact form notification to admin
    async sendContactNotification(contactData) {
        const { name, email, phone, company, service, budget, timeline, message } = contactData;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Admin email
            subject: `New Contact Form Submission - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">New Contact Form Submission</h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Contact Information</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
                        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
                    </div>

                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Project Details</h3>
                        <p><strong>Service:</strong> ${this.formatService(service)}</p>
                        <p><strong>Budget:</strong> ${this.formatBudget(budget)}</p>
                        <p><strong>Timeline:</strong> ${this.formatTimeline(timeline)}</p>
                    </div>

                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Message</h3>
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="mailto:${email}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Reply to ${name}
                        </a>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        This email was sent from the EliteDevs contact form at ${new Date().toLocaleString()}
                    </p>
                </div>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    // Send confirmation email to contact form submitter
    async sendContactConfirmation(contactData) {
        const { name, email, service } = contactData;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Thank you for contacting EliteDevs',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Thank you for reaching out!</h2>
                    
                    <p>Dear ${name},</p>
                    
                    <p>Thank you for contacting EliteDevs. We have received your inquiry about <strong>${this.formatService(service)}</strong> and our team will review your requirements carefully.</p>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                        <h3 style="margin-top: 0; color: #6366f1;">What happens next?</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Our team will review your project requirements</li>
                            <li>We'll schedule a consultation call within 24 hours</li>
                            <li>You'll receive a detailed proposal tailored to your needs</li>
                            <li>We'll discuss timelines, budget, and next steps</li>
                        </ul>
                    </div>

                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Other ways to reach us:</h3>
                        <p><strong>Phone:</strong> <a href="tel:+918780881010">+91 (878) 088-1010</a></p>
                        <p><strong>WhatsApp:</strong> <a href="https://wa.me/918780881010">+91 (878) 088-1010</a></p>
                        <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/elite-devs-327a5437b/">@elitedevs</a></p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://elitedevs.work" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Visit Our Website
                        </a>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        The EliteDevs Team<br>
                        <a href="mailto:contact.us@elitedevs.work">contact.us@elitedevs.work</a>
                    </p>
                </div>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    // Send newsletter confirmation
    async sendNewsletterConfirmation(subscriberData) {
        const { email, firstName } = subscriberData;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Welcome to EliteDevs Newsletter!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Welcome to EliteDevs Newsletter! 🚀</h2>
                    
                    <p>Hi ${firstName || 'there'},</p>
                    
                    <p>Thank you for subscribing to our newsletter! You're now part of our community of tech enthusiasts, developers, and business leaders.</p>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                        <h3 style="margin-top: 0; color: #6366f1;">What you'll receive:</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Latest tech trends and insights</li>
                            <li>Project updates and case studies</li>
                            <li>Development tips and tutorials</li>
                            <li>Industry news and analysis</li>
                        </ul>
                    </div>

                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Quick Links</h3>
                        <p><a href="https://elitedevs.work/portfolio">View Our Portfolio</a></p>
                        <p><a href="https://elitedevs.work/blog">Read Our Blog</a></p>
                        <p><a href="https://elitedevs.work/contact">Get In Touch</a></p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://elitedevs.work" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Explore Our Website
                        </a>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        You can unsubscribe at any time by clicking the link in our emails.<br>
                        Best regards,<br>
                        The EliteDevs Team
                    </p>
                </div>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    // Send newsletter to subscribers
    async sendNewsletter(newsletterData, subscribers) {
        const { subject, content, previewText } = newsletterData;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: subscribers.map(sub => sub.email),
            subject: subject,
            text: previewText,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6366f1; margin: 0;">EliteDevs</h1>
                        <p style="color: #6b7280; margin: 5px 0;">Software Development Excellence</p>
                    </div>
                    
                    ${content}
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <div style="text-align: center; color: #6b7280; font-size: 14px;">
                        <p>© 2024 EliteDevs. All rights reserved.</p>
                        <p>
                            <a href="https://elitedevs.work">Website</a> | 
                            <a href="https://www.linkedin.com/in/elite-devs-327a5437b/">LinkedIn</a> | 
                            <a href="https://github.com/contactus-eng">GitHub</a> | 
                            <a href="https://x.com/EliteDevs254815">Twitter</a>
                        </p>
                        <p>You're receiving this email because you subscribed to our newsletter.</p>
                        <p><a href="[UNSUBSCRIBE_URL]">Unsubscribe</a></p>
                    </div>
                </div>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    // Helper methods for formatting
    formatService(service) {
        const serviceMap = {
            'web-development': 'Web Development',
            'mobile-development': 'Mobile App Development',
            'ai-ml': 'AI & Machine Learning',
            'cloud-solutions': 'Cloud Solutions',
            'ui-ux-design': 'UI/UX Design',
            'consulting': 'Technical Consulting',
            'other': 'Other'
        };
        return serviceMap[service] || service;
    }

    formatBudget(budget) {
        const budgetMap = {
            'under-10k': 'Under $10,000',
            '10k-25k': '$10,000 - $25,000',
            '25k-50k': '$25,000 - $50,000',
            '50k-100k': '$50,000 - $100,000',
            'over-100k': 'Over $100,000',
            'discuss': "Let's Discuss"
        };
        return budgetMap[budget] || budget;
    }

    formatTimeline(timeline) {
        const timelineMap = {
            'asap': 'ASAP',
            '1-2-months': '1-2 Months',
            '3-6-months': '3-6 Months',
            '6-months-plus': '6+ Months',
            'flexible': 'Flexible'
        };
        return timelineMap[timeline] || timeline;
    }

    // Test email connection
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service connection verified');
            return true;
        } catch (error) {
            console.error('Email service connection failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
