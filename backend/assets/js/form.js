document.addEventListener('DOMContentLoaded', () => {
    const dbInput = document.getElementById('database');
    const tableInput = document.getElementById('table');
    let adGroups = [];

    dbInput.addEventListener('input', () => {
        fetch(`/api/database-search/?database=${encodeURIComponent(dbInput.value)}`)
            .then(resthen(res => res.json())
            .then(data => {
                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = '';

                if (data.suggested_products.length > 0) {
                    data.suggested_products.forEach(product => {
                        modalBody.innerHTML += `<p>${product}</p>`;
                    });
                    const modal = new bootstrap.Modal(document.getElementById('suggestionModal'));
                    modal.show();
                }
            });
    });
});
