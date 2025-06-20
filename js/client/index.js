document.addEventListener('DOMContentLoaded', function() {
    // Carousel functionality
    initCarousel();

    // Search bar functionality
    initSearchBar();

    // Department card animations
    initDepartmentCards();

    // Chat Assistant functionality
    initChatAssistant();

    // Fetch featured products
    fetchFeaturedProducts();

    // Fetch department data
    fetchDepartments();

     // New functionality
     initPopularCategories();
     initNewArrivals();
     initCustomerReviews();
     initNewsletterSignup();
});

function initCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    let currentIndex = 0;

    function showCarouselItem(index) {
        carouselItems.forEach(item => item.classList.remove('active'));
        carouselItems[index].classList.add('active');
    }

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselItems.length - 1;
        showCarouselItem(currentIndex);
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex < carouselItems.length - 1) ? currentIndex + 1 : 0;
        showCarouselItem(currentIndex);
    });

    // Auto-rotate carousel
    setInterval(() => {
        currentIndex = (currentIndex < carouselItems.length - 1) ? currentIndex + 1 : 0;
        showCarouselItem(currentIndex);
    }, 5000);
}


// Update the existing initCarousel function to handle multiple carousels
// function initCarousel() {
//     const carousels = document.querySelectorAll('.carousel');
//     carousels.forEach(carousel => {
//         const items = carousel.querySelectorAll('.carousel-item');
//         const prevButton = carousel.querySelector('.carousel-prev');
//         const nextButton = carousel.querySelector('.carousel-next');
//         let currentIndex = 0;

//         function showCarouselItem(index) {
//             items.forEach(item => item.classList.remove('active'));
//             items[index].classList.add('active');
//         }

//         prevButton.addEventListener('click', () => {
//             currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
//             showCarouselItem(currentIndex);
//         });

//         nextButton.addEventListener('click', () => {
//             currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
//             showCarouselItem(currentIndex);
//         });

//         // Auto-rotate carousel
//         setInterval(() => {
//             currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
//             showCarouselItem(currentIndex);
//         }, 5000);
//     });
// }

function initSearchBar() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            fetch(`/api/search?term=${encodeURIComponent(searchTerm)}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Search results:', data);
                    // Handle search results here
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Simulated fallback
                    alert(`Simulated search for: ${searchTerm}`);
                });
            searchInput.value = '';
        }
    }
}

function initDepartmentCards() {
    const departmentCards = document.querySelectorAll('.department-card');

    departmentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        card.addEventListener('click', function() {
            const departmentName = this.querySelector('h3').textContent;
            fetch(`/api/department/${encodeURIComponent(departmentName)}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Department data:', data);
                    // Handle department navigation here
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Simulated fallback
                    alert(`Simulated navigation to ${departmentName} department`);
                });
        });
    });
}

function initChatAssistant() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatBox = document.getElementById('chat-box');
    const closeChat = document.getElementById('close-chat');
    const sendMessage = document.getElementById('send-message');
    const chatMessage = document.getElementById('chat-message');
    const chatContent = document.getElementById('chat-content');

    chatToggle.addEventListener('click', () => {
        chatBox.style.display = (chatBox.style.display === 'none' || chatBox.style.display === '') ? 'block' : 'none';
    });

    closeChat.addEventListener('click', () => {
        chatBox.style.display = 'none';
    });

    sendMessage.addEventListener('click', sendChatMessage);
    chatMessage.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    function sendChatMessage() {
        const message = chatMessage.value.trim();
        if (message) {
            appendMessage('You', message);
            chatMessage.value = '';

            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            })
            .then(response => response.json())
            .then(data => {
                appendMessage('Bot', data.reply);
            })
            .catch(error => {
                console.error('Error:', error);
                // Simulated fallback
                setTimeout(() => {
                    appendMessage('Bot', 'Thank you for your message. We will get back to you shortly.');
                }, 1000);
            });
        }
    }

    function appendMessage(sender, message) {
        const messageElement = document.createElement('p');
        messageElement.textContent = `${sender}: ${message}`;
        chatContent.appendChild(messageElement);
        chatContent.scrollTop = chatContent.scrollHeight;
    }
}

function fetchFeaturedProducts() {
    fetch('/api/featured-products')
        .then(response => response.json())
        .then(data => {
            console.log('Featured products:', data);
            // Update carousel with fetched products
        })
        .catch(error => {
            console.error('Error:', error);
            // Simulated fallback
            console.log('Using default featured products');
        });
}

// function fetchDepartments() {
//     fetch('/api/departments')
//         .then(response => response.json())
//         .then(data => {
//             console.log('Departments:', data);
//             // Update department grid with fetched data
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             // Simulated fallback
//             console.log('Using default departments');
//         });

// }

// ... (existing functions remain the same) ...

function initPopularCategories() {
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.textContent;
            console.log(`Navigating to ${category} category`);
            // Here you would typically navigate to the category page
            // For now, we'll just log it
        });
    });
}

function initNewArrivals() {
    const addToCartButtons = document.querySelectorAll('.product-card .btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.parentElement.querySelector('h3').textContent;
            console.log(`Added ${productName} to cart`);
            // Here you would typically add the product to the cart
            // For now, we'll just log it
        });
    });
}

function initCustomerReviews() {
    const reviewCarousel = document.querySelector('.review-carousel');
    let isDown = false;
    let startX;
    let scrollLeft;

    reviewCarousel.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - reviewCarousel.offsetLeft;
        scrollLeft = reviewCarousel.scrollLeft;
    });

    reviewCarousel.addEventListener('mouseleave', () => {
        isDown = false;
    });

    reviewCarousel.addEventListener('mouseup', () => {
        isDown = false;
    });

    reviewCarousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - reviewCarousel.offsetLeft;
        const walk = (x - startX) * 3;
        reviewCarousel.scrollLeft = scrollLeft - walk;
    });
}

function initNewsletterSignup() {
    const newsletterForm = document.getElementById('newsletter-form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        console.log(`Subscribing email: ${email}`);
        // Here you would typically send this to your server
        // For now, we'll just log it and show an alert
        alert('Thank you for subscribing!');
        this.reset();
    });
}




// document.addEventListener('DOMContentLoaded', function() {
  

//   // Carousel
//   const carouselItems = document.querySelectorAll('.carousel-item');
//   const prevButton = document.querySelector('.carousel-prev');
//   const nextButton = document.querySelector('.carousel-next');
//   let currentIndex = 0;

//   function showCarouselItem(index) {
//       carouselItems.forEach(item => item.classList.remove('active'));
//       carouselItems[index].classList.add('active');
//   }

//   prevButton.addEventListener('click', function() {
//       currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselItems.length - 1;
//       showCarouselItem(currentIndex);
//   });

//   nextButton.addEventListener('click', function() {
//       currentIndex = (currentIndex < carouselItems.length - 1) ? currentIndex + 1 : 0;
//       showCarouselItem(currentIndex);
//   });

//   // Chat Assistant
//   const chatToggle = document.getElementById('chat-toggle');
//   const chatBox = document.getElementById('chat-box');
//   const closeChat = document.getElementById('close-chat');
//   const sendMessage = document.getElementById('send-message');
//   const chatMessage = document.getElementById('chat-message');
//   const chatContent = document.getElementById('chat-content');

//   chatToggle.addEventListener('click', function() {
//       chatBox.style.display = (chatBox.style.display === 'none' || chatBox.style.display === '') ? 'block' : 'none';
//   });

//   closeChat.addEventListener('click', function() {
//       chatBox.style.display = 'none';
//   });

//   sendMessage.addEventListener('click', function() {
//       const message = chatMessage.value.trim();
//       if (message) {
//           const userMessage = document.createElement('p');
//           userMessage.textContent = `You: ${message}`;
//           chatContent.appendChild(userMessage);
//           chatMessage.value = '';
//           chatContent.scrollTop = chatContent.scrollHeight;

//           // Simulate a response
//           setTimeout(function() {
//               const botMessage = document.createElement('p');
//               botMessage.textContent = 'Bot: Thank you for your message. We will get back to you shortly.';
//               chatContent.appendChild(botMessage);
//               chatContent.scrollTop = chatContent.scrollHeight;
//           }, 1000);
//       }
//   });
// });
