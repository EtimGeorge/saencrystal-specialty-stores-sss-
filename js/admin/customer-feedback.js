// Simulated feedback data
const simulatedFeedbacks = [
    { id: 301, customer: 'John Doe', feedback: 'Great service!', rating: 'Positive', date: '2023-07-28' },
    { id: 302, customer: 'Jane Smith', feedback: 'Product quality could be better.', rating: 'Neutral', date: '2023-07-27' },
    { id: 303, customer: 'Jim Brown', feedback: 'Very disappointed with the delivery.', rating: 'Negative', date: '2023-07-26' },
    { id: 304, customer: 'Nancy White', feedback: 'Excellent support team.', rating: 'Positive', date: '2023-07-25' }
];

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = {
        all: document.getElementById('all-feedback'),
        positive: document.getElementById('positive-feedback'),
        negative: document.getElementById('negative-feedback'),
        neutral: document.getElementById('neutral-feedback')
    };

    Object.keys(filterButtons).forEach(key => {
        filterButtons[key].addEventListener('click', () => {
            fetchFeedback(key);
        });
    });

    // Initial fetch of all feedback
    fetchFeedback('all');

    // Modal elements
    const viewModal = document.getElementById('viewFeedbackModal');
    const deleteModal = document.getElementById('deleteFeedbackModal');
    const closeBtns = document.getElementsByClassName('close');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    // Close modal when clicking on x button
    Array.from(closeBtns).forEach(btn => {
        btn.onclick = function() {
            viewModal.style.display = "none";
            deleteModal.style.display = "none";
        }
    });

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == viewModal || event.target == deleteModal) {
            viewModal.style.display = "none";
            deleteModal.style.display = "none";
        }
    }

    // Cancel delete
    cancelDeleteBtn.onclick = function() {
        deleteModal.style.display = "none";
    }
});

async function fetchFeedback(type) {
    try {
        const response = await fetch(`/api/feedback?type=${type}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const feedbacks = await response.json();
        displayFeedback(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        // Fallback to simulated data
        console.log('Using simulated feedback data');
        const filteredFeedbacks = type === 'all' 
            ? simulatedFeedbacks 
            : simulatedFeedbacks.filter(feedback => feedback.rating.toLowerCase() === type);
        displayFeedback(filteredFeedbacks);
    }
}

function displayFeedback(feedbacks) {
    const feedbackTableBody = document.getElementById('feedback-table-body');
    feedbackTableBody.innerHTML = '';

    feedbacks.forEach(feedback => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${feedback.id}</td>
            <td>${feedback.customer}</td>
            <td>${feedback.feedback}</td>
            <td>${feedback.rating}</td>
            <td>
                <button class="action-button view" onclick="viewFeedback(${feedback.id})">View</button>
                <button class="action-button delete" onclick="deleteFeedback(${feedback.id})">Delete</button>
            </td>
        `;
        feedbackTableBody.appendChild(row);
    });
}

async function viewFeedback(feedbackId) {
    const viewModal = document.getElementById('viewFeedbackModal');
    const feedbackDetails = document.getElementById('feedbackDetails');
    
    try {
        const response = await fetch(`/api/feedback/${feedbackId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const feedbackData = await response.json();
        displayFeedbackDetails(feedbackData);
    } catch (error) {
        console.error('Error fetching feedback details:', error);
        // Fallback to simulated data
        console.log('Using simulated feedback details');
        const feedbackData = simulatedFeedbacks.find(f => f.id === feedbackId);
        displayFeedbackDetails(feedbackData);
    }

    viewModal.style.display = "block";
}

function displayFeedbackDetails(feedbackData) {
    const feedbackDetails = document.getElementById('feedbackDetails');
    feedbackDetails.innerHTML = `
        <p><strong>Feedback ID:</strong> ${feedbackData.id}</p>
        <p><strong>Customer:</strong> ${feedbackData.customer}</p>
        <p><strong>Feedback:</strong> ${feedbackData.feedback}</p>
        <p><strong>Rating:</strong> ${feedbackData.rating}</p>
        <p><strong>Date:</strong> ${feedbackData.date}</p>
    `;
}

async function deleteFeedback(feedbackId) {
    const deleteModal = document.getElementById('deleteFeedbackModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');

    deleteModal.style.display = "block";

    confirmDeleteBtn.onclick = async function() {
        try {
            const response = await fetch(`/api/feedback/${feedbackId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(`Feedback with ID ${feedbackId} deleted successfully`);
            deleteModal.style.display = "none";
            fetchFeedback('all'); // Refresh the feedback list
        } catch (error) {
            console.error('Error deleting feedback:', error);
            // Simulated delete operation
            console.log(`Simulating deletion of feedback with ID: ${feedbackId}`);
            deleteModal.style.display = "none";
            // Remove the feedback from the simulated data
            const index = simulatedFeedbacks.findIndex(f => f.id === feedbackId);
            if (index !== -1) {
                simulatedFeedbacks.splice(index, 1);
            }
            fetchFeedback('all'); // Refresh the feedback list
        }
    }
}