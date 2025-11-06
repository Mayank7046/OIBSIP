// toggle icon navbar
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

// scroll sections
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 100;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            // active navbar links
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
            // active sections for animation on scroll
            sec.classList.add('show-animate');
        }
        // if want to animation that repeats on scroll use this
        else {
            sec.classList.remove('show-animate');
        }
    });

    // sticky navbar
    let header = document.querySelector('header');

    header.classList.toggle('sticky', window.scrollY > 100);

    // remove toggle icon and navbar when click navbar links (scroll)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');

    // animation footer on scroll
    let footer = document.querySelector('footer');

    footer.classList.toggle('show-animate', this.innerHeight + this.scrollY >= document.scrollingElement.scrollHeight);
}

// Contact Form Submission
async function submitForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        mobileNumber: document.getElementById('mobileNumber').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to send message. Server responded with status: ' + response.status);
        }

        // Show success message
        formMessage.textContent = result.message || 'Message sent successfully! I\'ll get back to you soon.';
        formMessage.className = 'form-message success';
        form.reset();
    } catch (error) {
        console.error('Error:', error);
        // More specific error messages
        if (error.message.includes('Failed to fetch')) {
            formMessage.textContent = 'Failed to connect to the server. Please check your internet connection and try again.';
        } else {
            formMessage.textContent = error.message || 'Failed to send message. Please try again later.';
        }
        formMessage.className = 'form-message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message <i class="bx bxs-send"></i>';
    }
}

// Add this CSS for form messages
const style = document.createElement('style');
style.textContent = `
    .form-message {
        margin-top: 2rem;
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
        font-size: 1.6rem;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
    }
    
    .form-message.success {
        background-color: rgba(46, 204, 113, 0.1);
        color: #2ecc71;
        border: 1px solid #2ecc71;
        opacity: 1;
        transform: translateY(0);
    }
    
    .form-message.error {
        background-color: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
        border: 1px solid #e74c3c;
        opacity: 1;
        transform: translateY(0);
    }
    
    #submitBtn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

document.getElementById('contactForm').addEventListener('submit', submitForm);