document.addEventListener('DOMContentLoaded', function () {
    const platformSelect = document.getElementById('v_dar_platform');
    const dbInput = document.getElementById('database-schema');
    const tableInput = document.getElementById('tablenames');
    const apiInput = document.getElementById('v_dat_api_name');
    const modal = new bootstrap.Modal(document.getElementById('verifiedSuggestionsModal'));

    // 1. Manages shown/hidden fields based on platform selection
    function toggleFields() {
        const platform = platformSelect.value;
        const apiSec = document.getElementById('api-name-section');
        const dbSec = document.getElementById('db-section');
        const tblSec = document.getElementById('table-section');

        if (platform.includes("API")) {
            if(apiSec) apiSec.style.display = 'block';
            if(dbSec) dbSec.style.display = 'none';
            if(tblSec) tblSec.style.display = 'none';
        } else if (platform.includes("Gateway")) {
            if(apiSec) apiSec.style.display = 'none';
            if(dbSec) dbSec.style.display = 'block';
            if(tblSec) tblSec.style.display = 'none';
        } else {
            if(apiSec) apiSec.style.display = 'none';
            if(dbSec) dbSec.style.display = 'block';
            if(tblSec) tblSec.style.display = 'block';
        }
    }

    // 2. Renders the AI results into the modal list
    function renderSuggestions(data) {
        const list = document.getElementById('verified-suggestions-list');
        list.innerHTML = '';

        if (!data.suggestions || data.suggestions.length === 0) {
            list.innerHTML = '<div class="alert alert-secondary">Comparing your request against master metadata...</div>';
            return;
        }

        data.suggestions.forEach(item => {
            const li = document.createElement('li');
            li.className = 'mb-5 border-bottom pb-5 list-unstyled';

            // AD Group String Logic
            const adGroupVal = Array.isArray(item.ad_group) ? item.ad_group.join(', ') : (item.ad_group || '');

            // Image Pathing Logic (Original)
            let imgPath = '/static/ai/img/illustrations/empty-search.svg';
            if (item.images && item.images.length > 0) {
                imgPath = item.images[0].startsWith('http') ? item.images[0] : `/marketplace/media/${item.images[0]}`;
            }

            li.innerHTML = `
                <div class="row align-items-start" id="asset-${item.slug}">
                    <div class="col-lg-2 text-center border-end">
                        <small class="text-muted d-block uppercase fw-bold">Grade:</small>
                        <h1 class="${item.color_class} display-4 fw-bold mb-0">${item.grade}</h1>
                        <div class="badge bg-light text-dark border p-2 mt-2">
                            <span class="fw-bold fs-5">${item.match_percentage}%</span><br>Match
                        </div>
                        ${item.badges.includes('TECHNICAL MATCH') ? '<div class="mt-2 text-success small fw-bold"><i class="fa fa-check-circle"></i> Technical Match</div>' : ''}
                    </div>
                    
                    <div class="col-lg-3 text-center position-relative">
                        <img src="${imgPath}" class="img-fluid rounded shadow-sm border" style="max-height: 140px; background: #f8f9fa;">
                         ${item.verified ? '<div class="position-absolute top-0 right-0 p-1 bg-white rounded-circle shadow-sm"><i class="fa fa-certificate text-primary"></i></div>' : ''}
                    </div>

                    <div class="col-lg-7">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h4 class="fw-bold mb-0">${item.name}</h4>
                            <button class="btn btn-link btn-sm text-muted p-0" onclick="alert('${item.explanation.replace(/'/g, "\\'")}')">
                                <i class="fa fa-info-circle"></i> Why match?
                            </button>
                        </div>
                        <p class="text-muted small mb-3">${item.short_desc || item.brief_desc || 'No description available for this asset.'}</p>
                        
                        <div class="row small mb-3 g-2">
                            <div class="col-md-6"><strong>Datatype:</strong> ${item.datatype}</div>
                            <div class="col-md-6"><strong>Classification:</strong> ${item.classification}</div>
                            <div class="col-12 mt-1">
                                <strong>AD Group:</strong> 
                                <span class="text-primary fw-bold font-monospace">${adGroupVal || '<span class="text-muted">None Provided</span>'}</span>
                            </div>
                        </div>

                        <div class="row small mb-4 bg-light rounded px-3 py-2 border mx-0">
                            <div class="col-6 p-0"><strong>DATABASE:</strong> ${item.db_name || '--'}</div>
                            <div class="col-6 p-0 text-end"><strong>TABLE:</strong> ${item.tbl_name || '--'}</div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="badge bg-white text-dark border me-1"><i class="fa fa-shield-alt text-muted"></i> ${item.reason}</span>
                                ${item.badges.map(b => `<span class="badge rounded-pill bg-white text-dark border me-1"><i class="fa fa-tag me-1 text-muted"></i>${b}</span>`).join('')}
                            </div>
                            <div class="btn-group">
                                <a href="${item.url}" class="btn btn-primary btn-sm">Request Access</a>
                                <a href="${item.url}" class="btn btn-outline-primary btn-sm">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            list.appendChild(li);
        });
        modal.show();
    }

    // 3. Communicates with Django Backend
    function fetchSuggestions() {
        const params = new URLSearchParams({
            'v_dar_platform': platformSelect.value,
            'database-schema': dbInput.value.trim(),
            'tablenames': tableInput.value.trim(),
            'v_dat_api_name': apiInput.value.trim()
        });

        const spinner = document.getElementById('loading-spinner');
        if(spinner) spinner.style.display = 'block';

        fetch(`/ai/suggest-products-by-role/?${params.toString()}`)
            .then(res => res.json())
            .then(data => renderSuggestions(data))
            .catch(err => {
                console.error("Search Error:", err);
                const list = document.getElementById('verified-suggestions-list');
                list.innerHTML = `<div class="alert alert-danger">Error retrieving suggestions. ${err.message}</div>`;
                modal.show();
            })
            .finally(() => { if(spinner) spinner.style.display = 'none'; });
    }

    // 4. Rate-limiter
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // 5. Event Listeners
    platformSelect.addEventListener('change', () => {
        toggleFields();
        fetchSuggestions();
    });

    [dbInput, tableInput, apiInput].forEach(el => {
        if(el) el.addEventListener('input', debounce(fetchSuggestions, 800));
    });

    // Initialize UI
    toggleFields();
});