document.querySelectorAll('.feedback-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;

        try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRFToken': csrfToken }
        });

        const result = await response.json();
        if (result.status === 'success') {
            form.innerHTML = '<p class="text-green-600 text-sm mt-2">✅ Thank you for your feedback!</p>';
        } else {
            throw new Error();
        }
        } catch (err) {
        form.innerHTML += '<p class="text-red-600 text-sm mt-2">⚠️ Failed to submit feedback. Please try again.</p>';
        }
    });
});