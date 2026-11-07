document.addEventListener('DOMContentLoaded', function() {
    // 1. Element Selectors
    const dbInput = document.getElementById('database-schema');
    const tableInput = document.getElementById('tablenames');
    const descInput = document.getElementById('data-request-description');
    const useInput = document.getElementById('intended-use');
    
    const verifiedList = document.getElementById('verified-suggestions-list');
    const regularList = document.getElementById('regular-suggestions-list');
    const modalElement = document.getElementById('verifiedSuggestionsModal');
    const modal = modalElement ? new bootstrap.Modal(modalElement) : null;

    // The fetch logic is triggered here
    function debounce() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchSuggestions, 1000); // Wait 1s after typing stops
    }

    if (descInput) {
        descInput.addEventListener('input', debounce);
    }

    // 2. Helper: UI Styling for Match Grades
    function getGradeAndColor(percentage) {
        if (percentage >= 100) return ['A+', 'text-success fw-bold'];
        if (percentage >= 95) return ['A', 'text-success'];
        if (percentage >= 90) return ['A-', 'text-success'];
        if (percentage >= 89) return ['B+', 'text-primary'];
        if (percentage >= 85) return ['B', 'text-primary'];
        if (percentage >= 80) return ['B-', 'text-primary'];
        if (percentage >= 70) return ['C', 'text-warning'];
        if (percentage >= 60) return ['D', 'text-orange'];
        return ['F', 'text-danger'];
    }

    // 3. Core Logic: Render Suggestions with Historical Proof
    function renderSuggestions(data) {
        if (!verifiedList || !regularList) return;

        verifiedList.innerHTML = '';
        regularList.innerHTML = '';

        let hasVerified = false;
        let hasRegular = false;

        data.suggestions.forEach(item => {
            const [grade, colorClass] = getGradeAndColor(item.match_percentage);
            
            // Logic for the "Path Previously Approved" Badge
            // This checks a flag returned by the AI backend cross-referencing master-order.json
            const historicalBadge = item.historical_match ? 
                `<div class="mt-2">
                    <span class="badge bg-success-light text-success border border-success p-2">
                        <i class="fa fa-history me-1"></i> Previously Approved (Closed Complete)
                    </span>
                 </div>` : '';

            const verifiedBadge = item.verified ? 
                `<img class="custom-badge-icon" src="/marketplace/media/marketplace/badges/dm-ai-verified.svg" style="width:25px; margin-right:5px;">` : '';

            const cardHtml = `
                <li class="list-unstyled mb-4 p-3 border rounded bg-white shadow-sm">
                    <div class="row align-items-center">
                        <div class="col-lg-2 text-center border-end">
                            <small class="text-muted d-block uppercase fw-bold">Match Grade</small>
                            <h1 class="${colorClass} display-5 fw-bold mb-0">${grade}</h1>
                            <span class="badge bg-light text-dark border">${item.match_percentage}% Match</span>
                        </div>
                        <div class="col-lg-7 px-4">
                            <h5 class="fw-bold mb-1">
                                ${verifiedBadge} ${item.name}
                            </h5>
                            <p class="text-muted small mb-2">${item.explanation || item.description || 'Verified metadata match.'}</p>
                            <div class="small">
                                <strong>Datatype:</strong> ${item.datatype} | 
                                <strong>Classification:</strong> ${item.classification}
                                ${historicalBadge}
                            </div>
                        </div>
                        <div class="col-lg-3 text-end">
                            <a href="${item.url || '#'}" class="btn btn-primary btn-sm w-100 mb-2">Request Access</a>
                            <button class="btn btn-outline-secondary btn-sm w-100" onclick="alert('Confidence Score: ${item.match_percentage}%\\n\\nReason: ${item.reason || 'Technical similarity to verified patterns.'}')">
                                <i class="fa fa-info-circle"></i> Why this?
                            </button>
                        </div>
                    </div>
                </li>`;

            if (item.verified) {
                verifiedList.insertAdjacentHTML('beforeend', cardHtml);
                hasVerified = true;
            } else {
                regularList.insertAdjacentHTML('beforeend', cardHtml);
                hasRegular = true;
            }
        });

        // Placeholder Empty States
        if (!hasVerified) {
            verifiedList.innerHTML = '<div class="alert alert-secondary text-center">No high-confidence verified assets found for this technical path.</div>';
        }
        if (!hasRegular) {
            regularList.innerHTML = '<div class="alert alert-light text-center">No additional suggestions.</div>';
        }

        if (modal) modal.show();
    }

    // 4. Fetch Strategy: Aggregates Technical Patterns
    function fetchSuggestions() {
        const desc = descInput.value.trim();
        const dbValue = dbInput.value.trim();
        const tableValue = tableInput.value.trim();

        // FIXED: Now triggers if Description is > 5 chars OR technical fields are filled
        const hasDescription = desc.length >= 5;
        const hasTechnicalPath = dbValue.length >= 3 && tableValue.length >= 3;

        if (!hasDescription && !hasTechnicalPath) {
            console.log("Input too short, waiting for more context...");
            return;
        }

        console.log("Initiating AI Verification Call...");
        
        const formData = new FormData();
        formData.append('data_request_description', desc);
        formData.append('database-schema', dbValue);
        formData.append('tablenames', tableValue);

        fetch('/ai/suggest-products-enhanced/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken') // Ensure utility function is used
            },
            body: formData,
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                renderSuggestions(data);
            }
        });
    }

    // 5. Shared Debounce and Event Listeners
    let debounceTimer;

    function debounce() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchSuggestions, 1000);
    }

    [descInput, dbInput, tableInput].forEach(el => {
        if (el) el.addEventListener('input', debounce);
    });

    // Helper: Django CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
