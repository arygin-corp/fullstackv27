// document.addEventListener('DOMContentLoaded', function () {
//     const descInput = document.getElementById('data-request-description');
//     const useInput = document.getElementById('intended-use');
//     const verifiedList = document.getElementById('verified-suggestions-list');
//     const regularList = document.getElementById('regular-suggestions-list');
//     const modal = new bootstrap.Modal(document.getElementById('verifiedSuggestionsModal'));

//     function getGradeAndColor(percentage) {
//         if (percentage >= 90) return ['A', 'text-success'];
//         if (percentage >= 80) return ['B', 'text-primary'];
//         if (percentage >= 70) return ['C', 'text-warning'];
//         if (percentage >= 60) return ['D', 'text-orange'];
//         return ['F', 'text-danger'];
//     }

//     function cosineSimilarity(str1, str2) {
//         const tokenize = str => str.toLowerCase().match(/\w+/g) || [];
//         const words1 = tokenize(str1);
//         const words2 = tokenize(str2);
//         const allWords = Array.from(new Set([...words1, ...words2]));

//         const freq1 = allWords.map(word => words1.filter(w => w === word).length);
//         const freq2 = allWords.map(word => words2.filter(w => w === word).length);

//         const dotProduct = freq1.reduce((sum, val, i) => sum + val * freq2[i], 0);
//         const magnitude1 = Math.sqrt(freq1.reduce((sum, val) => sum + val * val, 0));
//         const magnitude2 = Math.sqrt(freq2.reduce((sum, val) => sum + val * val, 0));

//         return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
//     }

//     function getCacheWithExpiry(key) {
//         const itemStr = sessionStorage.getItem(key);
//         if (!itemStr) return null;

//         try {
//             const item = JSON.parse(itemStr);
//             const now = new Date().getTime();

//             // Check for expiry
//             if (item.expiry && now > item.expiry) {
//                 sessionStorage.removeItem(key);
//                 return null;
//             }

//             // Handle both formats:
//             if (item.data && item.data.suggestions) {
//                 return item.data;
//             } else if (item.suggestions) {
//                 return item;
//             }
//         } catch (e) {
//             console.warn('Invalid cache JSON:', e);
//             sessionStorage.removeItem(key);
//             return null;
//         }
//     }


//     function createSuggestionCard(item) {
//         const li = document.createElement('li');
//         li.className = 'row mb-4';

//         const [grade, colorClass] = getGradeAndColor(item.match_percentage);

//         li.innerHTML = `
//             <div class="container-fluid" style="padding: 0px 12px">
//                 <div class="col-lg-1 float-start text-center">
//                     <p style="margin-bottom: 0px;">
//                         <strong><small>Match Grade:</small></strong><br>
//                         <p class="${colorClass}" style="margin-bottom: 0px;font-size: 42px !important;font-weight: bold;">
//                             ${grade}
//                         </p>
//                         <strong style="position: relative;bottom: 12px;font-weight: bold;">${item.match_percentage}%</strong>
//                     </p>
//                 </div>
//                 <div class="col-lg-2 float-start">

//                     <img src="${item.image}" alt="${item.name}" style="width: 100%; max-width: 150px">

//                 </div>
//                 <div class="col-lg-7 float-start">
//                     <h5 class="card-title" title="Verified based on previous successful access requests">
//                         ${item.verified ? '<span class="verified-badge">Verified</span>' : ''}
//                         ${item.name}
//                     </h5>
//                     <p>${item.description || 'No description available.'}</p>
//                     <p>
//                         <span>
//                             <strong>Datatype: </strong>${item.datatype}&nbsp;&nbsp;&nbsp;
//                             <strong>Classification: </strong>${item.classification}&nbsp;&nbsp;&nbsp;
//                             <strong>AD Group: </strong><span class="${colorClass}"><strong>${Array.isArray(item.ad_group) ? item.ad_group.join(', ') : item.ad_group}</strong></span>
//                         </span>
//                     </p>
//                     ${item.feedback_total > 0 ? `<p class="text-muted small">👍 ${item.feedback_positive} of ${item.feedback_total} found helpful (${item.feedback_percent}%)</p>` : ''}
//                 </div>
//                 <div class="col-lg-1 float-start">
//                     <a href="${item.url || '#'}" class="btn btn-sm btn-primary">View Product</a>
//                 </div>
//             </div>
//         `;
//         return li;
//     }

//     function renderSuggestions(data) {
//         verifiedList.innerHTML = '';
//         regularList.innerHTML = '';

//         let hasVerified = false;
//         let hasRegular = false;

//         data.suggestions.forEach(item => {
//             if (item.verified) {
//                 const card = createSuggestionCard(item);
//                 verifiedList.appendChild(card);
//                 hasVerified = true;
//             }
//         });

//         data.suggestions.forEach(item => {
//             if (!item.verified) {
//                 const card = createSuggestionCard(item);
//                 regularList.appendChild(card);
//                 hasRegular = true;
//             }
//         });

//         if (!hasVerified) {
//             verifiedList.innerHTML = `<li><div class="alert alert-secondary">No verified suggestions found.</div></li>`;
//         }

//         if (!hasRegular) {
//             regularList.innerHTML = `<li><div class="alert alert-secondary">No regular suggestions found.</div></li>`;
//         }

//         modal.show();

//         if (hasVerified) {
//             const verifiedTab = document.querySelector('#verified-tab');
//             if (verifiedTab) verifiedTab.scrollIntoView({ behavior: 'smooth' });
//         }
//     }

//     function fetchSuggestions() {
//     const desc = descInput.value.trim();
//     const use = useInput.value.trim();

//     if (desc.length === 0 || use.length === 0) return;

//     const dbValue = document.getElementById('database-schema').value.trim();
//     const tableValue = document.getElementById('tablenames').value.trim();
//     const cacheKey = `suggestions:${dbValue}:${tableValue}:page=1:limit=5`;
//     const cachedData = getCacheWithExpiry(cacheKey);

//     // Show spinners
//     document.getElementById('verified-loading-spinner').style.display = 'block';
//     document.getElementById('regular-loading-spinner').style.display = 'block';

//     // Get product_id from URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = urlParams.get('product_id');

//     fetch('/static/json/marketplace/products/products.json').then(res => res.json()).then(products => {
//         // If product_id is present, show only that product
//         if (productId) {
//             const product = products.find(p => p.id === productId);
//             if (product) {
//                 renderProduct(product); // You define this function
//             } else {
//                 console.warn('Product not found for ID:', productId);
//             }

//             // Hide spinners and exit early
//             document.getElementById('verified-loading-spinner').style.display = 'none';
//             document.getElementById('regular-loading-spinner').style.display = 'none';
//             return;
//         }

//             // Continue with suggestion logic
//             if (cachedData && cachedData.suggestions?.length > 0) {
//                 const enrichedSuggestions = cachedData.suggestions.map(item => {
//                 const productDesc = item.description || '';
//                 const productUse = item.intended_use || '';
//                 const descSimilarity = cosineSimilarity(desc, productDesc);
//                 const useSimilarity = cosineSimilarity(use, productUse);
//                 const isVerified = descSimilarity >= 0.9 && useSimilarity >= 0.9;

//                 return {
//                     ...item,
//                     verified: isVerified,
//                     badge: isVerified ? '/static/images/brands/dm-ai-verified.svg' : '',
//                     feedback_total: 0,
//                     feedback_positive: 0,
//                     feedback_percent: 0,
//                     message: isVerified
//                         ? 'Verified based on previous successful access requests.'
//                         : 'Suggested based on your database and table selection.'
//                 };
//             });

//             const verifiedSuggestions = enrichedSuggestions
//                 .filter(item => item.verified && item.ad_group)
//                 .map(item => {
//                     const match = products.find(p => p.ad_group === item.ad_group);
//                     return match ? { ...item, product_id: match.id } : null;
//                 })
//                 .filter(Boolean);

//             const regularSuggestions = enrichedSuggestions.filter(item => !item.verified);

//                 renderSuggestions({ suggestions: [...verifiedSuggestions, ...regularSuggestions] });
//             } else {
//                 const formData = new FormData();
//                 formData.append('data_request_description', desc);
//                 formData.append('intended_use', use);
//                 formData.append('database-schema', dbValue);
//                 formData.append('elementname', tableValue);
//                 formData.append('column_name', '');

//                 fetch('/ai/suggest-products-enhanced/', {
//                     method: 'POST',
//                     body: formData,
//                 })
//                 .then(res => res.json())
//                 .then(data => renderSuggestions(data))
//                 .catch(err => {
//                     verifiedList.innerHTML = `<li><div class="alert alert-danger">Error fetching suggestions. Please try again.</div></li>`;
//                     regularList.innerHTML = '';
//                     modal.show();
//                     console.error(err);
//                 });
//             }

//             document.getElementById('verified-loading-spinner').style.display = 'none';
//             document.getElementById('regular-loading-spinner').style.display = 'none';
//         })
//         .catch(err => {
//             console.error('Error loading products.json:', err);
//             document.getElementById('verified-loading-spinner').style.display = 'none';
//             document.getElementById('regular-loading-spinner').style.display = 'none';
//         });
//     }



//     let debounceTimer;
//     function debounceEnhancedSuggestions() {
//         clearTimeout(debounceTimer);
//         debounceTimer = setTimeout(fetchSuggestions, 1000);
//     }

//     descInput.addEventListener('input', debounceEnhancedSuggestions);
//     useInput.addEventListener('input', debounceEnhancedSuggestions);
// });

// document.addEventListener('DOMContentLoaded', function () {
//     const descInput = document.getElementById('data-request-description');
//     const useInput = document.getElementById('intended-use');
//     const verifiedList = document.getElementById('verified-suggestions-list');
//     const regularList = document.getElementById('regular-suggestions-list');
//     const modal = new bootstrap.Modal(document.getElementById('verifiedSuggestionsModal'));
//     const dbInput = document.getElementById('database-schema');
//     const tableInput = document.getElementById('tablenames');
//
//     function getGradeAndColor(percentage) {
//         if (percentage >= 90) return ['A', 'text-success'];
//         if (percentage >= 80) return ['B', 'text-primary'];
//         if (percentage >= 70) return ['C', 'text-warning'];
//         if (percentage >= 60) return ['D', 'text-orange'];
//         return ['F', 'text-danger'];
//     }
//
//     function cosineSimilarity(str1, str2) {
//         const tokenize = str => str.toLowerCase().match(/\w+/g) || [];
//         const words1 = tokenize(str1);
//         const words2 = tokenize(str2);
//         const allWords = Array.from(new Set([...words1, ...words2]));
//
//         const freq1 = allWords.map(word => words1.filter(w => w === word).length);
//         const freq2 = allWords.map(word => words2.filter(w => w === word).length);
//
//         const dotProduct = freq1.reduce((sum, val, i) => sum + val * freq2[i], 0);
//         const magnitude1 = Math.sqrt(freq1.reduce((sum, val) => sum + val * val, 0));
//         const magnitude2 = Math.sqrt(freq2.reduce((sum, val) => sum + val * val, 0));
//
//         return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
//     }
//
//     function getCacheWithExpiry(key) {
//         const itemStr = sessionStorage.getItem(key);
//         if (!itemStr) return null;
//
//         try {
//             const item = JSON.parse(itemStr);
//             const now = new Date().getTime();
//
//             // Check for expiry
//             if (item.expiry && now > item.expiry) {
//                 sessionStorage.removeItem(key);
//                 return null;
//             }
//
//             // Handle both formats:
//             if (item.data && item.data.suggestions) {
//                 return item.data;
//             } else if (item.suggestions) {
//                 return item;
//             }
//         } catch (e) {
//             console.warn('Invalid cache JSON:', e);
//             sessionStorage.removeItem(key);
//             return null;
//         }
//     }
//
//     function createSuggestionCard(item) {
//         const li = document.createElement('li');
//         li.className = 'row mb-4';
//
//         const [grade, colorClass] = getGradeAndColor(item.match_percentage);
//
//         li.innerHTML = `
//             <div class="container-fluid" style="padding: 0px 12px">
//                 <div class="col-lg-1 float-start text-center">
//                     <p style="margin-bottom: 0px;">
//                         <strong><small>Match Grade:</small></strong><br>
//                         <p class="${colorClass}" style="margin-bottom: 0px;font-size: 42px !important;font-weight: bold;">
//                             ${grade}
//                         </p>
//                         <strong style="position: relative;bottom: 12px;font-weight: bold;">${item.match_percentage}%</strong>
//                     </p>
//                 </div>
//                 <div class="col-lg-2 float-start">
//                     <img src="${item.image}" alt="${item.name}" style="width: 100%; max-width: 150px">
//                 </div>
//                 <div class="col-lg-7 float-start">
//                     <h5 class="card-title" title="Verified based on previous successful access requests">
//                         ${item.verified ? '<span class="verified-badge">Verified</span>' : ''}
//                         ${item.name}
//                     </h5>
//                     <p>${item.description || 'No description available.'}</p>
//                     <p>
//                         <span>
//                             <strong>Datatype: </strong>${item.datatype}&nbsp;&nbsp;&nbsp;
//                             <strong>Classification: </strong>${item.classification}&nbsp;&nbsp;&nbsp;
//                             <strong>AD Group: </strong><span class="${colorClass}"><strong>${Array.isArray(item.ad_group) ? item.ad_group.join(', ') : item.ad_group}</strong></span>
//                         </span>
//                     </p>
//                     ${item.feedback_total > 0 ? `<p class="text-muted small">👍 ${item.feedback_positive} of ${item.feedback_total} found helpful (${item.feedback_percent}%)</p>` : ''}
//                 </div>
//                 <div class="col-lg-1 float-start">
//                     <a href="${item.url || '#'}" class="btn btn-sm btn-primary">View Product</a>
//                 </div>
//             </div>
//         `;
//         return li;
//     }
//
//     function renderSuggestions(data) {
//         verifiedList.innerHTML = `<ul class="list-unstyled">
//                                     <div class="container">
//                                         <div class="card">
//                                             <div class="card__toptitle">
//                                                 <div class="icon">
//                                                     <a href="#"><i class="fa fa-arrow-left"></i></a>
//                                                 </div>
//                                                 <h3>Suggested Product</h3>
//                                             </div>
//                                             <div class="card__producttitle">
//                                                 <img class="custom-badge-icon" src="http://localhost:8000/marketplace/media/marketplace/badges/dm-ai-verified.svg">
//                                                 <span style="position: relative; bottom: -13px;"><h1>This is Where the Product Name Is Going</h1><br>
//                                                     <h6>
//                                                         <strong>Datatype: </strong>Datatset&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//                                                         <span><strong>Classification: </strong> Confidential</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//                                                         <span><strong>PI: </strong> Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//                                                         <span><strong>SPI: </strong> Yes</span>
//                                                     </h6>
//                                                 </span>
//                                             </div>
//                                             <div class="card__body">
//                                                 <div class="half">
//                                                     <div class="image">
//                                                         <img src="http://localhost:8000/marketplace/media/marketplace/products/garage_details_evehicle.jpg" alt="">
//                                                     </div>
//                                                 </div>
//                                                 <div class="half">
//                                                     <div class="description mt-2">
//                                                         <h4 class="text-center mt-2"><strong>Verification Score & Summary</strong></h4>
//                                                     </div>
//                                                     <span class="stock"><i class="fa fa-pen"></i>A</span>
//                                                 </div>
//                                             </div>
//                                             <div class="card__footer">
//                                                 <div class="recommend">
//                                                     <p>Recommended by</p>
//                                                     <h3 class="text-primary">Data Marketplace AI</h3>
//                                                 </div>
//                                                 <div class="">
//                                                     <button type="button" class="btn btn-md btn-primary">View Product</button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </ul>   `;
//         regularList.innerHTML = '';
//
//         let hasVerified = false;
//         let hasRegular = false;
//
//         data.suggestions.forEach(item => {
//             if (item.verified) {
//                 const card = createSuggestionCard(item);
//                 verifiedList.appendChild(card);
//                 hasVerified = true;
//             }
//         });
//
//         data.suggestions.forEach(item => {
//             if (!item.verified) {
//                 const card = createSuggestionCard(item);
//                 regularList.appendChild(card);
//                 hasRegular = true;
//             }
//         });
//
//         if (!hasVerified) {
//             verifiedList.innerHTML = `<li><div class="alert alert-secondary">No verified suggestions found.</div></li>`;
//         }
//
//         if (!hasRegular) {
//             regularList.innerHTML = `<li><div class="alert alert-secondary">No regular suggestions found.</div></li>`;
//         }
//
//         modal.show();
//
//         if (hasVerified) {
//             const verifiedTab = document.querySelector('#verified-tab');
//             if (verifiedTab) verifiedTab.scrollIntoView({ behavior: 'smooth' });
//         }
//     }
//
//     function fetchSuggestions() {
//         const desc = descInput.value.trim();
//         const use = useInput.value.trim();
//
//         if (desc.length === 0 || use.length === 0) return;
//
//         const dbValue = document.getElementById('database-schema').value.trim();
//         const tableValue = document.getElementById('tablenames').value.trim();
//         const cacheKey = `suggestions:${dbValue}:${tableValue}:page=1:limit=5`;
//         const cachedData = getCacheWithExpiry(cacheKey);
//
//         // Show spinners
//         document.getElementById('verified-loading-spinner').style.display = 'block';
//         document.getElementById('regular-loading-spinner').style.display = 'block';
//
//         // Get product_id from URL
//         const urlParams = new URLSearchParams(window.location.search);
//         const productId = urlParams.get('product_id');
//
//         fetch('/static/json/marketplace/products/products.json').then(res => res.json()).then(products => {
//             // If product_id is present, show only that product
//             if (productId) {
//                 const product = products.find(p => p.id === productId);
//                 if (product) {
//                     renderProduct(product); // You define this function
//                 } else {
//                     console.warn('Product not found for ID:', productId);
//                 }
//
//                 // Hide spinners and exit early
//                 document.getElementById('verified-loading-spinner').style.display = 'none';
//                 document.getElementById('regular-loading-spinner').style.display = 'none';
//                 return;
//             }
//
//             // Continue with suggestion logic
//             if (cachedData && cachedData.suggestions?.length > 0) {
//                 const enrichedSuggestions = cachedData.suggestions.map(item => {
//                     const productDesc = item.description || '';
//                     const productUse = item.intended_use || '';
//                     const descSimilarity = cosineSimilarity(desc, productDesc);
//                     const useSimilarity = cosineSimilarity(use, productUse);
//                     const isVerified = descSimilarity >= 0.9 && useSimilarity >= 0.9;
//
//                     return {
//                         ...item,
//                         verified: isVerified,
//                         badge: isVerified ? '/static/images/brands/dm-ai-verified.svg' : '',
//                         feedback_total: 0,
//                         feedback_positive: 0,
//                         feedback_percent: 0,
//                         message: isVerified
//                             ? 'Verified based on previous successful access requests.'
//                             : 'Suggested based on your database and table selection.'
//                     };
//                 });
//
//
//                // Add dummy verified suggestion
//                 const dummySuggestion = {
//                     name: "Dummy Verified Product",
//                     description: "This is a hardcoded dummy verified suggestion for testing.",
//                     image: "/static/images/placeholder-product.png",
//                     datatype: "Structured",
//                     classification: "Confidential",
//                     ad_group: "DUMMY-GROUP",
//                     match_percentage: 100,
//                     verified: true,
//                     badge: '/static/images/brands/dm-ai-verified.svg',
//                     feedback_total: 0,
//                     feedback_positive: 0,
//                     feedback_percent: 0,
//                     url: "#",
//                     message: "This is a dummy verified suggestion."
//                 };
//
//                 // Prepend or append dummy to verified list
//                 const suggestionsWithDummy = [dummySuggestion, ...enrichedSuggestions.filter(item => item.verified), ...enrichedSuggestions.filter(item => !item.verified)];
//
//
//                 // Render
//                 renderSuggestions({ suggestions: suggestionsWithDummy });
//
//             } else {
//                 const formData = new FormData();
//                 formData.append('data_request_description', desc);
//                 formData.append('intended_use', use);
//                 formData.append('database-schema', dbValue);
//                 formData.append('elementname', tableValue);
//                 formData.append('column_name', '');
//
//                 fetch('/ai/suggest-products-enhanced/', {
//                     method: 'POST',
//                     body: formData,
//                 })
//                 .then(res => res.json())
//                 .then(data => renderSuggestions(data))
//                 .catch(err => {
//                     verifiedList.innerHTML = `<li><div class="alert alert-danger">Error fetching suggestions. Please try again.</div></li>`;
//                     regularList.innerHTML = '';
//                     modal.show();
//                     console.error(err);
//                 });
//             }
//
//             document.getElementById('verified-loading-spinner').style.display = 'none';
//             document.getElementById('regular-loading-spinner').style.display = 'none';
//         })
//         .catch(err => {
//             console.error('Error loading products.json:', err);
//             document.getElementById('verified-loading-spinner').style.display = 'none';
//             document.getElementById('regular-loading-spinner').style.display = 'none';
//         });
//     }
//
//     let debounceTimer;
//     function debounceEnhancedSuggestions() {
//         clearTimeout(debounceTimer);
//         debounceTimer = setTimeout(fetchSuggestions, 1000);
//     }
//
//     descInput.addEventListener('input', debounceEnhancedSuggestions);
//     useInput.addEventListener('input', debounceEnhancedSuggestions);
// });
//
