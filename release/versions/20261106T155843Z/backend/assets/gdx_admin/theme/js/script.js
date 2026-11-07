/*
Author       : Dreamstechnologies
Template Name: Kanakku - Bootstrap Admin Template
*/

(function () {
	"use strict";

	// The lightweight $/jQuery shim below is only a partial jQuery
	// implementation (no static $.Event, etc). Bootstrap 5's bundle
	// auto-detects any window.jQuery and tries to register its optional
	// jQuery interface against it, which then breaks the moment Bootstrap
	// fires an internal event (it calls jQuery.Event(), which our shim
	// doesn't implement). Bootstrap explicitly supports opting out of that
	// auto-detection via this attribute, so set it unconditionally before
	// the shim (or real jQuery) is ever installed.
	document.body.setAttribute('data-bs-no-jquery', '');

	// Lightweight Vanilla DOM wrapper for plugin compatibility
	if (typeof window.$ === 'undefined') {
		var vanillaDomQsa = function (selector, context) {
			var root = context || document;
			try {
				return Array.from(root.querySelectorAll(selector));
			} catch (e) {
				// Strip jQuery-only pseudo-selectors (:last, :first, :eq(n)) that
				// native querySelectorAll doesn't understand, then re-run and index.
				var m = selector.match(/^(.*):(last|first|eq\((\d+)\))$/);
				if (!m) return [];
				var base = m[1];
				var list;
				try {
					list = Array.from(root.querySelectorAll(base));
				} catch (e2) {
					return [];
				}
				if (m[2] === 'last') return list.length ? [list[list.length - 1]] : [];
				if (m[2] === 'first') return list.length ? [list[0]] : [];
				var idx = parseInt(m[3], 10);
				return list[idx] ? [list[idx]] : [];
			}
		};

		window.jQuery = window.$ = function (selector, context) {
			if (typeof selector === 'function') {
				if (document.readyState === 'complete' || document.readyState === 'interactive') {
					setTimeout(selector, 1);
				} else {
					document.addEventListener('DOMContentLoaded', selector);
				}
				return;
			}
			if (selector instanceof window.$) return selector;

			var els = [];
			if (typeof selector === 'string') {
				var trimmed = selector.trim();
				if (trimmed.charAt(0) === '<' && trimmed.charAt(trimmed.length - 1) === '>') {
					var temp = document.createElement('div');
					temp.innerHTML = trimmed;
					els = Array.from(temp.children);
				} else {
					els = vanillaDomQsa(selector, context);
				}
			} else if (selector) {
				if (selector.nodeType || selector === window || selector === document) {
					els = [selector];
				} else if (Array.isArray(selector) || selector instanceof HTMLCollection || selector instanceof NodeList) {
					els = Array.from(selector);
				} else {
					els = [selector];
				}
			}

			els.ready = function (cb) {
				if (typeof cb === 'function') {
					if (document.readyState === 'complete' || document.readyState === 'interactive') {
						setTimeout(cb, 1);
					} else {
						document.addEventListener('DOMContentLoaded', cb);
					}
				}
				return els;
			};

			els.on = function (evt, selectorOrCb, cb) {
				if (typeof evt === 'object' && evt !== null) {
					for (var key in evt) {
						els.on(key, selectorOrCb, evt[key]);
					}
					return els;
				}
				var actualCb = typeof selectorOrCb === 'function' ? selectorOrCb : cb;
				var sel = typeof selectorOrCb === 'string' ? selectorOrCb : null;
				if (typeof evt === 'string') {
					evt.split(' ').forEach(function (eName) {
						var baseEvt = eName.split('.')[0];
						els.forEach(function (e) {
							if (e && e.addEventListener) {
								e.addEventListener(baseEvt, function (eObj) {
									if (!sel || (eObj.target && eObj.target.closest && eObj.target.closest(sel))) {
										actualCb.call(e, eObj);
									}
								});
							}
						});
					});
				}
				return els;
			};

			els.off = function (evt) {
				if (typeof evt === 'string') {
					evt.split(' ').forEach(function (eName) {
						var baseEvt = eName.split('.')[0];
						els.forEach(function (e) {
							if (e && e.removeEventListener) {
								e.removeEventListener(baseEvt, function () {});
							}
						});
					});
				}
				return els;
			};

			els.html = function (val) {
				if (val === undefined) return els[0] ? els[0].innerHTML : '';
				els.forEach(function (e) { if (e) e.innerHTML = val; });
				return els;
			};

			els.text = function (val) {
				if (val === undefined) return els[0] ? els[0].textContent : '';
				els.forEach(function (e) { if (e) e.textContent = val; });
				return els;
			};

			els.val = function (val) {
				if (val === undefined) return els[0] ? els[0].value : '';
				els.forEach(function (e) { if (e) e.value = val; });
				return els;
			};

			els.css = function (prop, val) {
				if (typeof prop === 'object') {
					els.forEach(function (e) { if (e && e.style) Object.assign(e.style, prop); });
				} else if (val === undefined) {
					return els[0] && els[0].style ? getComputedStyle(els[0])[prop] : '';
				} else {
					els.forEach(function (e) { if (e && e.style) e.style[prop] = val; });
				}
				return els;
			};

			els.addClass = function (cls) {
				if (!cls) return els;
				var classes = cls.split(' ').filter(Boolean);
				els.forEach(function (e) {
					if (e && e.classList) classes.forEach(function (c) { e.classList.add(c); });
				});
				return els;
			};

			els.removeClass = function (cls) {
				if (!cls) return els;
				var classes = cls.split(' ').filter(Boolean);
				els.forEach(function (e) {
					if (e && e.classList) classes.forEach(function (c) { e.classList.remove(c); });
				});
				return els;
			};

			els.toggleClass = function (cls) {
				if (!cls) return els;
				var classes = cls.split(' ').filter(Boolean);
				els.forEach(function (e) {
					if (e && e.classList) classes.forEach(function (c) { e.classList.toggle(c); });
				});
				return els;
			};

			els.hasClass = function (cls) {
				if (!els[0] || !els[0].classList) return false;
				return els[0].classList.contains(cls);
			};

			els.hide = function () {
				els.forEach(function (e) { if (e && e.style) e.style.display = 'none'; });
				return els;
			};

			els.show = function () {
				els.forEach(function (e) { if (e && e.style) e.style.display = ''; });
				return els;
			};

			els.find = function (sel) {
				var res = [];
				els.forEach(function (e) {
					if (e && e.querySelectorAll) res = res.concat(Array.from(e.querySelectorAll(sel)));
				});
				return window.$(res);
			};

			els.closest = function (sel) {
				var res = [];
				els.forEach(function (e) {
					if (e && e.closest) { var c = e.closest(sel); if (c) res.push(c); }
				});
				return window.$(res);
			};

			els.parent = function () {
				var res = [];
				els.forEach(function (e) { if (e && e.parentElement) res.push(e.parentElement); });
				return window.$(res);
			};

			els.parents = function (sel) {
				var res = [];
				els.forEach(function (e) {
					var p = e ? e.parentElement : null;
					while (p) {
						if (!sel || (p.matches && p.matches(sel))) res.push(p);
						p = p.parentElement;
					}
				});
				return window.$(res);
			};

			els.next = function (sel) {
				var res = [];
				els.forEach(function (e) {
					var n = e ? e.nextElementSibling : null;
					if (n && (!sel || (n.matches && n.matches(sel)))) res.push(n);
				});
				return window.$(res);
			};

			els.prev = function (sel) {
				var res = [];
				els.forEach(function (e) {
					var p = e ? e.previousElementSibling : null;
					if (p && (!sel || (p.matches && p.matches(sel)))) res.push(p);
				});
				return window.$(res);
			};

			els.children = function (sel) {
				var res = [];
				els.forEach(function (e) {
					if (e && e.children) {
						Array.from(e.children).forEach(function (c) {
							if (!sel || (c.matches && c.matches(sel))) res.push(c);
						});
					}
				});
				return window.$(res);
			};

			els.append = function (content) {
				els.forEach(function (e) {
					if (!e) return;
					if (typeof content === 'string') e.insertAdjacentHTML('beforeend', content);
					else if (content instanceof Node) e.appendChild(content);
					else if (content && content.length) Array.from(content).forEach(function (c) { if (c instanceof Node) e.appendChild(c); });
				});
				return els;
			};

			els.appendTo = function (target) {
				var targetEls = window.$(target);
				if (targetEls[0]) {
					els.forEach(function (e) {
						if (e instanceof Node) targetEls[0].appendChild(e);
					});
				}
				return els;
			};

			els.prepend = function (content) {
				els.forEach(function (e) {
					if (!e) return;
					if (typeof content === 'string') e.insertAdjacentHTML('afterbegin', content);
					else if (content instanceof Node) e.insertBefore(content, e.firstChild);
				});
				return els;
			};

			els.before = function (content) {
				els.forEach(function (e) {
					if (!e || !e.parentNode) return;
					if (typeof content === 'string') e.insertAdjacentHTML('beforebegin', content);
					else if (content instanceof Node) e.parentNode.insertBefore(content, e);
					else if (content && content.length) Array.from(content).forEach(function (c) { if (c instanceof Node) e.parentNode.insertBefore(c, e); });
				});
				return els;
			};

			els.after = function (content) {
				els.forEach(function (e) {
					if (!e || !e.parentNode) return;
					if (typeof content === 'string') e.insertAdjacentHTML('afterend', content);
					else if (content instanceof Node) e.parentNode.insertBefore(content, e.nextSibling);
					else if (content && content.length) Array.from(content).forEach(function (c) { if (c instanceof Node) e.parentNode.insertBefore(c, e.nextSibling); });
				});
				return els;
			};

			els.remove = function () {
				els.forEach(function (e) {
					if (e && e.parentNode) e.parentNode.removeChild(e);
				});
				return els;
			};

			els.attr = function (attr, val) {
				if (val === undefined) return els[0] ? els[0].getAttribute(attr) : null;
				els.forEach(function (e) { if (e) e.setAttribute(attr, val); });
				return els;
			};

			els.removeAttr = function (attr) {
				els.forEach(function (e) { if (e) e.removeAttribute(attr); });
				return els;
			};

			els.data = function (key, val) {
				if (!els[0]) return undefined;
				if (val === undefined) return els[0].dataset[key] !== undefined ? els[0].dataset[key] : els[0]['_data_' + key];
				els.forEach(function (e) { if (e) { e.dataset[key] = val; e['_data_' + key] = val; } });
				return els;
			};

			els.focus = function () {
				if (els[0] && els[0].focus) els[0].focus();
				return els;
			};

			els.filter = function (sel) {
				var res = [];
				var fn = typeof sel === 'function' ? sel : null;
				els.forEach(function (e, idx) {
					if (!e) return;
					if (fn) { if (fn.call(e, idx, e)) res.push(e); }
					else if (e.matches && e.matches(sel)) res.push(e);
				});
				return window.$(res);
			};

			els.removeData = function (key) {
				els.forEach(function (e) {
					if (e) {
						if (key) { delete e.dataset[key]; delete e['_data_' + key]; }
						else { Object.keys(e.dataset).forEach(function (k) { delete e.dataset[k]; }); }
					}
				});
				return els;
			};

			els.trigger = function (evtName, extra) {
				els.forEach(function (e) {
					if (e) {
						var event = new CustomEvent(evtName, { detail: extra, bubbles: true, cancelable: true });
						e.dispatchEvent(event);
					}
				});
				return els;
			};

			els.is = function (sel) {
				if (!els[0]) return false;
				if (sel === ':text') return els[0].tagName === 'INPUT' && (els[0].type === 'text' || !els[0].type);
				if (typeof sel === 'string') return els[0].matches ? els[0].matches(sel) : false;
				if (sel.nodeType) return els[0] === sel;
				return false;
			};

			els.height = function () { return els[0] ? els[0].offsetHeight : 0; };
			els.width = function () { return els[0] ? els[0].offsetWidth : 0; };
			els.outerHeight = function () { return els[0] ? els[0].offsetHeight : 0; };
			els.outerWidth = function () { return els[0] ? els[0].offsetWidth : 0; };
			els.offset = function () {
				if (!els[0]) return { top: 0, left: 0 };
				var rect = els[0].getBoundingClientRect();
				return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
			};
			els.position = function () {
				if (!els[0]) return { top: 0, left: 0 };
				return { top: els[0].offsetTop, left: els[0].offsetLeft };
			};
			els.each = function (cb) {
				els.forEach(function (e, idx) { cb.call(e, idx, e); });
				return els;
			};

			return new Proxy(els, {
				get: function (target, prop) {
					if (prop in target) return target[prop];
					if (window.$.fn && typeof window.$.fn[prop] === 'function') {
						return function () {
							var args = arguments;
							var ret = target;
							target.forEach(function (e) {
								var r = window.$.fn[prop].apply(window.$(e), args);
								if (r !== undefined && r !== target) ret = r;
							});
							return ret;
						};
					}
					return undefined;
				}
			});
		};
		window.jQuery = window.$;
		window.$.fn = window.$.prototype = {};
		window.$.proxy = function (fn, context) {
			if (typeof fn !== 'function') return undefined;
			var args = Array.prototype.slice.call(arguments, 2);
			var proxy = function () {
				return fn.apply(context || this, args.concat(Array.prototype.slice.call(arguments)));
			};
			proxy.guid = fn.guid = fn.guid || (window.$.guid++);
			return proxy;
		};
		window.$.guid = 1;
		window.$.isFunction = function (obj) { return typeof obj === 'function'; };
		window.$.isArray = Array.isArray;
		window.$.trim = function (str) { return str == null ? "" : (str + "").trim(); };
		window.$.each = function (obj, cb) {
			if (Array.isArray(obj) || (obj && typeof obj.length === 'number')) {
				for (var i = 0; i < obj.length; i++) { if (cb.call(obj[i], i, obj[i]) === false) break; }
			} else if (obj) {
				for (var key in obj) { if (cb.call(obj[key], key, obj[key]) === false) break; }
			}
			return obj;
		};
		window.$.grep = function (arr, cb, invert) {
			var res = [];
			(arr || []).forEach(function (el, idx) {
				var keep = !!cb(el, idx);
				if (invert) keep = !keep;
				if (keep) res.push(el);
			});
			return res;
		};
		window.$.inArray = function (val, arr) {
			if (!arr) return -1;
			return Array.prototype.indexOf.call(arr, val);
		};
		window.$.map = function (arr, cb) {
			var res = [];
			(arr || []).forEach(function (el, idx) {
				var r = cb(el, idx);
				if (r !== null && r !== undefined) res = res.concat(r);
			});
			return res;
		};
		window.$.Event = function (type, props) {
			var event = new CustomEvent(type, { bubbles: true, cancelable: true });
			if (props) Object.assign(event, props);
			return event;
		};
		window.$.when = function () {
			return Promise.all(Array.prototype.slice.call(arguments));
		};
		window.$.extend = function () {
			var target = arguments[0] || {};
			var deep = false;
			var i = 1;
			var length = arguments.length;
			if (typeof target === 'boolean') {
				deep = target;
				target = arguments[1] || {};
				i = 2;
			}
			if (typeof target !== 'object' && typeof target !== 'function') target = {};
			for (; i < length; i++) {
				var options = arguments[i];
				if (options != null) {
					for (var name in options) {
						var src = target[name];
						var copy = options[name];
						if (target === copy) continue;
						if (deep && copy && (typeof copy === 'object' || Array.isArray(copy))) {
							var clone = src && (typeof src === 'object' || Array.isArray(src)) ? src : (Array.isArray(copy) ? [] : {});
							target[name] = window.$.extend(deep, clone, copy);
						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}
			return target;
		};
	}

	// ---- Vanilla slideUp / slideDown / slideToggle helpers ----
	function slideUp(target, duration) {
		duration = duration || 300;
		if (!target || target.dataset.slidingUp === '1') return;
		target.dataset.slidingUp = '1';
		delete target.dataset.slidingDown;
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.boxSizing = 'border-box';
		target.style.height = target.offsetHeight + 'px';
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(function () {
			target.style.display = 'none';
			target.style.removeProperty('height');
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			delete target.dataset.slidingUp;
		}, duration);
	}

	function slideDown(target, duration) {
		duration = duration || 300;
		if (!target || target.dataset.slidingDown === '1') return;
		target.dataset.slidingDown = '1';
		delete target.dataset.slidingUp;
		target.style.removeProperty('display');
		var display = window.getComputedStyle(target).display;
		if (display === 'none') display = 'block';
		target.style.display = display;
		var height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.boxSizing = 'border-box';
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(function () {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			delete target.dataset.slidingDown;
		}, duration);
	}

	function isVisible(el) {
		return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
	}

	function delegate(root, eventName, selector, handler) {
		root.addEventListener(eventName, function (e) {
			var target = e.target.closest(selector);
			if (target && root.contains(target)) {
				handler.call(target, e);
			}
		});
	}

	// Vanilla (jQuery-less) reimplementation of the DataTable behavior
	// (filter / sort / paginate / length menu / info text). Builds the
	// same .dataTables_wrapper / .dataTables_filter / .dataTables_length /
	// .dataTables_info / .dataTables_paginate .pagination / .sorting*
	// markup and classes that the real jQuery DataTables plugin produces,
	// so it inherits this project's existing DataTables styling exactly
	// (no new CSS needed) while matching the same config used elsewhere
	// in this file (row-per-page menu, "_START_ - _END_ of _TOTAL_ items"
	// info text, custom prev/next icons, filter box moved into
	// #tableSearch/.search-input).
	function initVanillaDataTable(table) {
		if (table.dataset.vanillaDatatableInit) return;
		table.dataset.vanillaDatatableInit = '1';
		table.classList.add('dataTable');

		var wrapper = document.createElement('div');
		wrapper.className = 'dataTables_wrapper';
		table.parentNode.insertBefore(wrapper, table);

		var thead = table.querySelector('thead');
		var tbody = table.querySelector('tbody');
		var headerCells = thead ? Array.from(thead.querySelectorAll('th')) : [];
		var allRows = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];

		var pageSize = 10;
		var currentPage = 1;
		var searchTerm = '';
		var sortColIndex = null;
		var sortDir = 'asc';

		var filterDiv = document.createElement('div');
		filterDiv.className = 'dataTables_filter';
		var filterLabel = document.createElement('label');
		var filterInput = document.createElement('input');
		filterInput.type = 'search';
		filterInput.className = 'form-control';
		filterInput.placeholder = 'Search';
		filterLabel.appendChild(filterInput);
		filterDiv.appendChild(filterLabel);

		var lengthDiv = document.createElement('div');
		lengthDiv.className = 'dataTables_length';
		var lengthLabel = document.createElement('label');
		lengthLabel.appendChild(document.createTextNode('Row Per Page '));
		var lengthSelect = document.createElement('select');
		lengthSelect.className = 'form-select';
		[10, 25, 50, 100].forEach(function (n) {
			var opt = document.createElement('option');
			opt.value = String(n);
			opt.textContent = String(n);
			lengthSelect.appendChild(opt);
		});
		lengthLabel.appendChild(lengthSelect);
		lengthLabel.appendChild(document.createTextNode(' Entries'));
		lengthDiv.appendChild(lengthLabel);

		var infoDiv = document.createElement('div');
		infoDiv.className = 'dataTables_info';

		var paginateDiv = document.createElement('div');
		paginateDiv.className = 'dataTables_paginate';
		var paginationUl = document.createElement('ul');
		paginationUl.className = 'pagination';
		paginateDiv.appendChild(paginationUl);

		wrapper.appendChild(filterDiv);
		wrapper.appendChild(table);
		wrapper.appendChild(lengthDiv);
		wrapper.appendChild(paginateDiv);
		wrapper.appendChild(infoDiv);

		function getFilteredRows() {
			if (!searchTerm) return allRows.slice();
			var term = searchTerm.toLowerCase();
			return allRows.filter(function (row) {
				return row.textContent.toLowerCase().indexOf(term) > -1;
			});
		}

		function getSortedRows(rows) {
			if (sortColIndex === null) return rows;
			return rows.slice().sort(function (a, b) {
				var ac = a.children[sortColIndex], bc = b.children[sortColIndex];
				var av = ac ? ac.textContent.trim() : '';
				var bv = bc ? bc.textContent.trim() : '';
				var an = parseFloat(av.replace(/,/g, '')), bn = parseFloat(bv.replace(/,/g, ''));
				var cmp;
				if (av !== '' && bv !== '' && !isNaN(an) && !isNaN(bn)) {
					cmp = an - bn;
				} else {
					cmp = av.localeCompare(bv);
				}
				return sortDir === 'asc' ? cmp : -cmp;
			});
		}

		function renderPagination(totalPages) {
			paginationUl.innerHTML = '';

			var prevLi = document.createElement('li');
			prevLi.className = 'page-item previous' + (currentPage === 1 ? ' disabled' : '');
			var prevA = document.createElement('a');
			prevA.href = 'javascript:void(0);';
			prevA.className = 'page-link';
			prevA.innerHTML = '<i class="isax isax-arrow-left"></i> ';
			prevA.addEventListener('click', function () {
				if (currentPage > 1) { currentPage--; render(); }
			});
			prevLi.appendChild(prevA);
			paginationUl.appendChild(prevLi);

			for (var i = 1; i <= totalPages; i++) {
				(function (pageNum) {
					var li = document.createElement('li');
					li.className = 'page-item' + (pageNum === currentPage ? ' active' : '');
					var a = document.createElement('a');
					a.href = 'javascript:void(0);';
					a.className = 'page-link';
					a.textContent = String(pageNum);
					a.addEventListener('click', function () { currentPage = pageNum; render(); });
					li.appendChild(a);
					paginationUl.appendChild(li);
				})(i);
			}

			var nextLi = document.createElement('li');
			nextLi.className = 'page-item next' + (currentPage === totalPages ? ' disabled' : '');
			var nextA = document.createElement('a');
			nextA.href = 'javascript:void(0);';
			nextA.className = 'page-link';
			nextA.innerHTML = '<i class="isax isax-arrow-right-1"></i>';
			nextA.addEventListener('click', function () {
				if (currentPage < totalPages) { currentPage++; render(); }
			});
			nextLi.appendChild(nextA);
			paginationUl.appendChild(nextLi);
		}

		function render() {
			var filtered = getFilteredRows();
			var sorted = getSortedRows(filtered);
			var total = sorted.length;
			var totalPages = Math.max(1, Math.ceil(total / pageSize));
			if (currentPage > totalPages) currentPage = totalPages;
			var startIdx = (currentPage - 1) * pageSize;
			var pageRows = sorted.slice(startIdx, startIdx + pageSize);
			var pageRowSet = new Set(pageRows);

			allRows.forEach(function (r) {
				r.style.display = pageRowSet.has(r) ? '' : 'none';
			});
			pageRows.forEach(function (r) {
				if (tbody) tbody.appendChild(r);
			});

			var start = total === 0 ? 0 : startIdx + 1;
			var end = Math.min(startIdx + pageSize, total);
			infoDiv.textContent = start + ' - ' + end + ' of ' + total + ' items';

			renderPagination(totalPages);
		}

		headerCells.forEach(function (th, idx) {
			if (th.classList.contains('no-sort')) return;
			th.classList.add('sorting');
			th.style.cursor = 'pointer';
			th.addEventListener('click', function () {
				if (sortColIndex === idx) {
					sortDir = sortDir === 'asc' ? 'desc' : 'asc';
				} else {
					sortColIndex = idx;
					sortDir = 'asc';
				}
				headerCells.forEach(function (h) {
					h.classList.remove('sorting_asc', 'sorting_desc');
					if (!h.classList.contains('no-sort')) h.classList.add('sorting');
				});
				th.classList.remove('sorting');
				th.classList.add(sortDir === 'asc' ? 'sorting_asc' : 'sorting_desc');
				currentPage = 1;
				render();
			});
		});

		filterInput.addEventListener('input', function () {
			searchTerm = this.value;
			currentPage = 1;
			render();
		});

		lengthSelect.value = '10';
		lengthSelect.addEventListener('change', function () {
			pageSize = parseInt(this.value, 10);
			currentPage = 1;
			render();
		});

		render();

		// initComplete equivalent: move the filter box into the page's own
		// search container, matching the real plugin's initComplete callback.
		var tableSearchTarget = document.getElementById('tableSearch') || document.querySelector('.search-input');
		if (tableSearchTarget) {
			tableSearchTarget.appendChild(filterDiv);
		}
	}

	// Vanilla (jQuery-less) reimplementation of Ion.RangeSlider (single and
	// double handle, with optional grid + prefix/postfix), covering the
	// configuration actually used across the project. Generates the exact
	// same .irs / .irs-line / .irs-bar / .irs-handle / .irs-from / .irs-to /
	// .irs-single / .irs-grid markup and classes the real plugin produces
	// (default "flat" skin), so it inherits the existing ion.rangeSlider CSS
	// with no changes needed.
	function initVanillaIonRangeSlider(input, options) {
		if (input.dataset.vanillaIrsInit) return;
		input.dataset.vanillaIrsInit = '1';
		options = options || {};

		var values = options.values || null; // custom label array (index-based slider)
		var min = values ? 0 : (options.min !== undefined ? options.min : 0);
		var max = values ? values.length - 1 : (options.max !== undefined ? options.max : 100);
		var step = options.step || 1;
		var isDouble = options.type === 'double';
		var grid = !!options.grid;
		var prefix = options.prefix || '';
		var postfix = options.postfix || '';
		var maxPostfix = options.max_postfix || postfix;
		var skin = options.skin || 'flat';
		var disabled = !!options.disable;
		var hideMinMax = !!options.hide_min_max;
		var hideFromTo = !!options.hide_from_to;
		var curFrom = options.from !== undefined ? options.from : min;
		var curTo = options.to !== undefined ? options.to : max;

		function formatNum(n) {
			if (values) return values[n] !== undefined ? values[n] : n;
			return Number(n).toLocaleString('en-US');
		}
		function labelFor(n, isMax) {
			return prefix + formatNum(n) + (isMax ? maxPostfix : postfix);
		}

		var cont = document.createElement('span');
		cont.className = 'irs irs--' + skin + ' js-irs-vanilla' + (grid ? ' irs-with-grid' : '') + (disabled ? ' irs-disabled' : '');
		input.parentNode.insertBefore(cont, input);
		input.setAttribute('readonly', 'readonly');
		input.style.display = 'none';

		cont.innerHTML =
			'<span class="irs">' +
			'<span class="irs-line" tabindex="0"></span>' +
			'<span class="irs-min">' + labelFor(min, false) + '</span>' +
			'<span class="irs-max">' + labelFor(max, true) + '</span>' +
			'<span class="irs-from">' + labelFor(curFrom, false) + '</span>' +
			'<span class="irs-to">' + labelFor(curTo, false) + '</span>' +
			'<span class="irs-single">' + labelFor(curFrom, false) + '</span>' +
			'</span>' +
			'<span class="irs-grid"></span>';

		if (isDouble) {
			cont.insertAdjacentHTML('beforeend',
				'<span class="irs-bar"></span>' +
				'<span class="irs-shadow shadow-from"></span>' +
				'<span class="irs-shadow shadow-to"></span>' +
				'<span class="irs-handle from"><i></i><i></i><i></i></span>' +
				'<span class="irs-handle to"><i></i><i></i><i></i></span>'
			);
		} else {
			cont.insertAdjacentHTML('beforeend',
				'<span class="irs-bar irs-bar--single"></span>' +
				'<span class="irs-shadow shadow-single"></span>' +
				'<span class="irs-handle single"><i></i><i></i><i></i></span>'
			);
		}
		if (disabled) {
			cont.insertAdjacentHTML('beforeend', '<span class="irs-disable-mask"></span>');
		}

		var line = cont.querySelector('.irs-line');
		var bar = cont.querySelector('.irs-bar');
		var minLabel = cont.querySelector('.irs-min');
		var maxLabel = cont.querySelector('.irs-max');
		var fromLabel = cont.querySelector('.irs-from');
		var toLabel = cont.querySelector('.irs-to');
		var singleLabel = cont.querySelector('.irs-single');
		var handleFrom = isDouble ? cont.querySelector('.irs-handle.from') : cont.querySelector('.irs-handle.single');
		var handleTo = isDouble ? cont.querySelector('.irs-handle.to') : null;

		if (isDouble) {
			singleLabel.style.display = 'none';
		} else {
			fromLabel.style.visibility = 'hidden';
			toLabel.style.visibility = 'hidden';
		}
		if (hideMinMax) {
			minLabel.style.display = 'none';
			maxLabel.style.display = 'none';
		}
		if (hideFromTo) {
			fromLabel.style.display = 'none';
			toLabel.style.display = 'none';
			singleLabel.style.display = 'none';
		}

		function pctFor(val) {
			return max > min ? (val - min) / (max - min) * 100 : 0;
		}

		function clamp(v) {
			v = Math.round((v - min) / step) * step + min;
			return Math.max(min, Math.min(max, v));
		}

		function render() {
			var pFrom = pctFor(curFrom);
			if (isDouble) {
				var pTo = pctFor(curTo);
				bar.style.left = pFrom + '%';
				bar.style.width = (pTo - pFrom) + '%';
				handleFrom.style.left = pFrom + '%';
				handleTo.style.left = pTo + '%';
				fromLabel.textContent = labelFor(curFrom, false);
				fromLabel.style.left = pFrom + '%';
				toLabel.textContent = labelFor(curTo, curTo === max);
				toLabel.style.left = pTo + '%';
				input.value = (values ? values[curFrom] : curFrom) + ';' + (values ? values[curTo] : curTo);
			} else {
				bar.style.left = '0%';
				bar.style.width = pFrom + '%';
				handleFrom.style.left = pFrom + '%';
				singleLabel.textContent = labelFor(curFrom, curFrom === max);
				singleLabel.style.left = pFrom + '%';
				input.value = String(values ? values[curFrom] : curFrom);
			}
			input.dispatchEvent(new Event('change', { bubbles: true }));
		}

		function valueFromClientX(clientX) {
			var rect = line.getBoundingClientRect();
			var pct = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
			pct = Math.max(0, Math.min(1, pct));
			return clamp(min + pct * (max - min));
		}

		function bindDrag(handle, isFromHandle) {
			function apply(clientX) {
				var val = valueFromClientX(clientX);
				if (isDouble) {
					if (isFromHandle) curFrom = Math.min(val, curTo);
					else curTo = Math.max(val, curFrom);
				} else {
					curFrom = val;
				}
				render();
			}
			function onMouseMove(e) { apply(e.clientX); }
			function onTouchMove(e) { if (e.touches && e.touches[0]) apply(e.touches[0].clientX); }
			function onUp() {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onUp);
				document.removeEventListener('touchmove', onTouchMove);
				document.removeEventListener('touchend', onUp);
			}
			handle.addEventListener('mousedown', function (e) {
				if (disabled) return;
				e.preventDefault();
				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onUp);
			});
			handle.addEventListener('touchstart', function () {
				if (disabled) return;
				document.addEventListener('touchmove', onTouchMove, { passive: true });
				document.addEventListener('touchend', onUp);
			}, { passive: true });
		}

		bindDrag(handleFrom, true);
		if (isDouble) bindDrag(handleTo, false);

		line.addEventListener('click', function (e) {
			if (disabled) return;
			var val = valueFromClientX(e.clientX);
			if (isDouble) {
				if (Math.abs(val - curFrom) <= Math.abs(val - curTo)) curFrom = Math.min(val, curTo);
				else curTo = Math.max(val, curFrom);
			} else {
				curFrom = val;
			}
			render();
		});

		if (grid) {
			var gridEl = cont.querySelector('.irs-grid');
			var gridCount = Math.min(values ? values.length - 1 : 5, 20) || 1;
			for (var i = 0; i <= gridCount; i++) {
				var gv = min + (max - min) * (i / gridCount);
				var leftPct = (i / gridCount * 100) + '%';

				var pol = document.createElement('span');
				pol.className = 'irs-grid-pol';
				pol.style.left = leftPct;
				gridEl.appendChild(pol);

				var text = document.createElement('span');
				text.className = 'irs-grid-text';
				text.style.left = leftPct;
				text.textContent = values ? formatNum(Math.round(gv)) : formatNum(Math.round(gv));
				gridEl.appendChild(text);
			}
		}

		render();
	}

	// Variables declarations
	var wrapper = document.querySelector('.main-wrapper');
	var pageWrapper = document.querySelector('.page-wrapper');
	// feather.replace();

	// Page Content Height Resize
	window.addEventListener('resize', function () {
		if (document.querySelector('.page-wrapper')) {
			var height = window.innerHeight;
			document.querySelectorAll('.page-wrapper').forEach(function (el) {
				el.style.minHeight = height + 'px';
			});
		}
	});

	// Mobile menu sidebar overlay
	document.body.insertAdjacentHTML('beforeend', '<div class="sidebar-overlay"></div>');

	delegate(document, 'click', '#mobile_btn', function () {
		if (wrapper) wrapper.classList.toggle('slide-nav');
		var overlay = document.querySelector('.sidebar-overlay');
		if (overlay) overlay.classList.toggle('opened');
		document.documentElement.classList.add('menu-opened');
		var taskWindow = document.getElementById('task_window');
		if (taskWindow) taskWindow.classList.remove('opened');
		return false;
	});

	delegate(document, 'click', '.sidebar-overlay', function () {
		document.documentElement.classList.remove('menu-opened');
		this.classList.remove('opened');
		if (wrapper) wrapper.classList.remove('slide-nav');
		document.querySelectorAll('.sidebar-overlay').forEach(function (el) {
			el.classList.remove('opened');
		});
		var taskWindow = document.getElementById('task_window');
		if (taskWindow) taskWindow.classList.remove('opened');
	});

	// Logo Hide Btn
	delegate(document, 'click', '.hideset', function () {
		var el = this.parentElement && this.parentElement.parentElement && this.parentElement.parentElement.parentElement;
		if (el) el.style.display = 'none';
	});

	delegate(document, 'click', '.delete-set', function () {
		var el = this.parentElement && this.parentElement.parentElement;
		if (el) el.style.display = 'none';
	});

	// Stick Sidebar -> native CSS position:sticky (vanilla)
	if (window.innerWidth > 767) {
		document.querySelectorAll('.theiaStickySidebar').forEach(function (el) {
			el.style.position = 'sticky';
			el.style.top = '30px';
		});
	}

	// Datatable
	if (window.jQuery && window.jQuery.fn && window.jQuery.fn.DataTable && document.querySelector('.datatable')) {
		var legacyPlugin = window.jQuery;
		legacyPlugin('.datatable').DataTable({
			"bFilter": true,
			"sDom": 'fBtlpi',
			"ordering": true,
			"language": {
				search: ' ',
				sLengthMenu: '_MENU_',
				searchPlaceholder: "Search",
				sLengthMenu: 'Row Per Page _MENU_ Entries',
				info: "_START_ - _END_ of _TOTAL_ items",
				paginate: {
					next: '<i class="isax isax-arrow-right-1"></i>',
					previous: '<i class="isax isax-arrow-left"></i> '
				},
			},
			"scrollX": false,
			"scrollCollapse": false,
			"responsive": false,
			"autoWidth": false,
			initComplete: function (settings, json) {
				legacyPlugin('.dataTables_filter').appendTo('#tableSearch');
				legacyPlugin('.dataTables_filter').appendTo('.search-input');
			},
		});
	} else {
		document.querySelectorAll('.datatable').forEach(function (table) {
			initVanillaDataTable(table);
		});
	}

	// Datetimepicker / Timepicker -> Flatpickr (vanilla, already vendored in this project)
	function initFlatpickr(container) {
		if (!window.flatpickr) return;
		var scope = container || document;

		function customParseDate(dateStr, format) {
			if (!dateStr) return null;
			var parsed = flatpickr.parseDate(dateStr, format);
			if (parsed && !isNaN(parsed.getTime())) return parsed;
			var d = new Date(dateStr);
			if (!isNaN(d.getTime())) return d;
			var parts = String(dateStr).trim().split(/[-/ ]+/);
			if (parts.length === 3) {
				var day = parseInt(parts[0], 10);
				var month = parseInt(parts[1], 10) - 1;
				var year = parseInt(parts[2], 10);
				if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
					return new Date(year, month, day);
				}
			}
			return null;
		}

		scope.querySelectorAll('.datetimepicker').forEach(function (el) {
			if (!el._flatpickr) {
				var fp = flatpickr(el, {
					dateFormat: 'd-m-Y',
					allowInput: true,
					static: true,
					parseDate: customParseDate
				});
				var parentGroup = el.closest('.input-group');
				if (parentGroup) {
					var iconAddon = parentGroup.querySelector('.input-icon-addon');
					if (iconAddon) {
						iconAddon.style.cursor = 'pointer';
						iconAddon.style.pointerEvents = 'auto';
						iconAddon.addEventListener('click', function (e) {
							e.stopPropagation();
							fp.open();
						});
					}
				}
			}
		});

		scope.querySelectorAll('.timepicker').forEach(function (el) {
			if (!el._flatpickr) {
				var fp = flatpickr(el, {
					enableTime: true,
					noCalendar: true,
					dateFormat: 'H:i K',
					allowInput: true,
					static: true
				});
				var parentGroup = el.closest('.input-group');
				if (parentGroup) {
					var iconAddon = parentGroup.querySelector('.input-icon-addon');
					if (iconAddon) {
						iconAddon.style.cursor = 'pointer';
						iconAddon.style.pointerEvents = 'auto';
						iconAddon.addEventListener('click', function (e) {
							e.stopPropagation();
							fp.open();
						});
					}
				}
			}
		});
	}

	initFlatpickr();

	document.addEventListener('shown.bs.modal', function (e) {
		initFlatpickr(e.target);
		e.target.querySelectorAll('.datetimepicker, .timepicker').forEach(function (el) {
			if (el._flatpickr) {
				el._flatpickr.redraw();
			}
		});
	});
	document.addEventListener('shown.bs.offcanvas', function (e) {
		initFlatpickr(e.target);
		e.target.querySelectorAll('.datetimepicker, .timepicker').forEach(function (el) {
			if (el._flatpickr) {
				el._flatpickr.redraw();
			}
		});
	});


	// Kanban drag -> SortableJS (vanilla, already vendored in this project)
	if (window.Sortable) {
		document.querySelectorAll('.kanban-drag-wrap').forEach(function (el) {
			if (!el._sortableInit) {
				el._sortableInit = true;
				Sortable.create(el, {
					group: 'kanban-drag-wrap',
					handle: '.kanban-card',
					ghostClass: 'drag-placeholder'
				});
			}
		});
	}

	// Range slider(s) -> vanilla Ion.RangeSlider reimplementation, used only
	// when the real jQuery plugin isn't loaded. Covers both the single
	// "Amount" filter slider (#range_03) used across list/report pages, and
	// the full showcase set (#range_01 - #range_16) on the rangeslider
	// component demo page.
	(function () {
		var hasRealPlugin = window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.ionRangeSlider !== 'undefined';
		if (hasRealPlugin) return;

		var rangeConfigs = {
			range_01: {},
			range_02: { min: 100, max: 1000, from: 550 },
			range_03: { type: 'double', grid: true, min: 0, max: 1000, from: 200, to: 800, prefix: '$' },
			range_04: { type: 'double', grid: true, min: -1000, max: 1000, from: -500, to: 500 },
			range_05: { type: 'double', grid: true, min: -1000, max: 1000, from: -500, to: 500, step: 250 },
			range_06: {
				grid: true, from: 3,
				values: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			},
			range_07: { grid: true, min: 1000, max: 1000000, from: 200000, step: 1000 },
			range_08: { min: 100, max: 1000, from: 550, disable: true },
			range_09: { grid: true, min: 18, max: 70, from: 30, prefix: 'Age ', max_postfix: '+' },
			range_10: { type: 'double', min: 100, max: 200, from: 145, to: 155, prefix: 'Weight: ', postfix: ' million pounds' },
			range_11: { type: 'single', grid: true, min: -90, max: 90, from: 0, postfix: '°' },
			range_12: { type: 'double', min: 1000, max: 2000, from: 1200, to: 1800, hide_min_max: true, hide_from_to: true, grid: true },
			range_13: { skin: 'modern' },
			range_14: { skin: 'sharp' },
			range_15: { skin: 'round' },
			range_16: { skin: 'square' }
		};

		Object.keys(rangeConfigs).forEach(function (id) {
			var rangeInput = document.getElementById(id);
			if (rangeInput) initVanillaIonRangeSlider(rangeInput, rangeConfigs[id]);
		});
	})();

	// toggle-password
	delegate(document, 'click', '.toggle-password', function () {
		this.classList.toggle('isax-eye');
		this.classList.toggle('isax-eye-slash');
		var input = document.querySelector('.pass-input');
		if (input) {
			input.setAttribute('type', input.getAttribute('type') === 'password' ? 'text' : 'password');
		}
	});
	delegate(document, 'click', '.toggle-passwords', function () {
		this.classList.toggle('isax-eye');
		this.classList.toggle('isax-eye-slash');
		var input = document.querySelector('.pass-inputs');
		if (input) {
			input.setAttribute('type', input.getAttribute('type') === 'password' ? 'text' : 'password');
		}
	});
	delegate(document, 'click', '.toggle-passworda', function () {
		this.classList.toggle('ti-eye');
		this.classList.toggle('ti-eye-off');
		var input = document.querySelector('.pass-inputa');
		if (input) {
			input.setAttribute('type', input.getAttribute('type') === 'password' ? 'text' : 'password');
		}
	});

	// Select 2 -> Choices.js (vanilla, already themed in this project's SCSS)
	if (window.Choices) {
		document.querySelectorAll('.select2').forEach(function (el) {
			if (!el.dataset.choicesInit) {
				el.dataset.choicesInit = '1';
				new Choices(el, { shouldSort: false, allowHTML: false, removeItemButton: el.multiple });
			}
		});

		document.querySelectorAll('.select').forEach(function (el) {
			if (!el.dataset.choicesInit) {
				el.dataset.choicesInit = '1';
				new Choices(el, { searchEnabled: false, shouldSort: false, allowHTML: false, removeItemButton: el.multiple });
			}
		});
	}

	// Summernote -> Quill (vanilla, already vendored/used elsewhere in this project)
	if (window.Quill) {
		document.querySelectorAll('.summernote').forEach(function (el) {
			if (el.dataset.quillInit) return;
			el.dataset.quillInit = '1';
			var quill = new Quill(el, {
				theme: 'snow',
				modules: {
					toolbar: [
						[{ size: [] }],
						['bold', 'italic', 'underline', 'strike'],
						['clean'],
						['image']
					]
				}
			});
			var editorEl = el.querySelector('.ql-editor');
			if (editorEl) editorEl.style.height = '100px';
		});
	}

	// Sidebar
	function init() {
		document.querySelectorAll('.sidebar-menu a').forEach(function (link) {
			link.addEventListener('click', function (e) {
				if (this.parentElement && this.parentElement.classList.contains('submenu')) {
					e.preventDefault();
				}
				var parentUl = this.closest('ul');
				var nextUl = this.nextElementSibling;
				if (!(nextUl && nextUl.tagName === 'UL')) nextUl = null;
				if (!this.classList.contains('subdrop')) {
					if (parentUl) {
						parentUl.querySelectorAll('ul').forEach(function (ul) {
							if (ul !== nextUl) slideUp(ul, 250);
						});
						parentUl.querySelectorAll('a').forEach(function (a) {
							if (a !== this) a.classList.remove('subdrop');
						}, this);
					}
					if (nextUl) slideDown(nextUl, 350);
					this.classList.add('subdrop');
				} else if (this.classList.contains('subdrop')) {
					this.classList.remove('subdrop');
					if (nextUl) slideUp(nextUl, 350);
				}
			});
		});
	}

	// Sidebar Initiate
	init();
	document.addEventListener('mouseover', function (e) {
		e.stopPropagation();
		if (document.body.classList.contains('mini-sidebar')) {
			var toggleBtn = document.getElementById('toggle_btn');
			if (toggleBtn && isVisible(toggleBtn)) {
				var targ = e.target.closest('.sidebar, .header-left, #toggle_btn');
				if (targ) {
					document.body.classList.add('expand-menu');
					document.querySelectorAll('.subdrop + ul').forEach(function (ul) { slideDown(ul); });
				} else {
					document.body.classList.remove('expand-menu');
					document.querySelectorAll('.subdrop + ul').forEach(function (ul) { slideUp(ul); });
				}
				return false;
			}
		}
	});

	// Sidebar (right)
	function colinit() {
		document.querySelectorAll('.sidebar-right ul a').forEach(function (link) {
			link.addEventListener('click', function (e) {
				if (this.parentElement && this.parentElement.classList.contains('submenu')) {
					e.preventDefault();
				}
				var parentUl = this.closest('ul');
				var nextUl = this.nextElementSibling;
				if (!(nextUl && nextUl.tagName === 'UL')) nextUl = null;
				if (!this.classList.contains('subdrop')) {
					if (parentUl) {
						parentUl.querySelectorAll('ul').forEach(function (ul) {
							if (ul !== nextUl) slideUp(ul, 250);
						});
						parentUl.querySelectorAll('a').forEach(function (a) {
							if (a !== this) a.classList.remove('subdrop');
						}, this);
					}
					if (nextUl) slideDown(nextUl, 350);
					this.classList.add('subdrop');
				} else if (this.classList.contains('subdrop')) {
					this.classList.remove('subdrop');
					if (nextUl) slideUp(nextUl, 350);
				}
			});
		});
	}
	colinit();

	// Sidebar: keep the active menu item visible on load.
	// Registered on DOMContentLoaded. Handlers fire in registration order and
	// script.js is the last script on the page, so by the time this runs
	// theme-script.js (head) has applied the body layout classes and
	// simplebar.min.js has built .simplebar-content-wrapper -- the element that
	// really scrolls. The scrollTop write is synchronous inside that handler, so
	// the browser cannot paint between SimpleBar's wrap and the scroll.

	// Three active-marking conventions exist across the sidebar pages:
	//   1. leaf   <a href="page.html" class="active">
	//   2. group  <a href="javascript:void(0);" class="active subdrop">
	//   3. item   <li class="active"><a href="page.html">
	// Group headers normally use a javascript: href and must never be the scroll
	// target. On the call pages the header does carry a real href alongside the
	// leaf, so take the LAST match: a descendant's start tag always follows its
	// ancestor's, which makes document order pick the leaf.
	var SIDEBAR_TARGET_SELECTOR =
		'a.active[href]:not([href^="javascript"]):not([href="#"]),' +
		'li.active > a[href]:not([href^="javascript"]):not([href="#"])';

	function sidebarActiveLink(menu) {
		var found = menu.querySelectorAll(SIDEBAR_TARGET_SELECTOR);
		return found.length ? found[found.length - 1] : null;
	}

	function sidebarFileName(value) {
		if (!value) return '';
		var path = value.split('#')[0].split('?')[0];
		var file = path.substring(path.lastIndexOf('/') + 1);
		try { file = decodeURIComponent(file); } catch (e) { /* keep raw */ }
		return file.toLowerCase();
	}

	function sidebarLinkByFile(menu, file) {
		var links = menu.querySelectorAll('a[href]');
		for (var i = 0; i < links.length; i++) {
			var href = links[i].getAttribute('href');
			if (!href || href.charAt(0) === '#' || href.indexOf('javascript') === 0) continue;
			if (sidebarFileName(href) === file) return links[i];
		}
		return null;
	}

	// Route fallback, consulted only when the markup says nothing. That order
	// matters: many pages deliberately highlight their list page rather than
	// themselves (edit-invoice.html -> invoices.html, supplier-details.html ->
	// suppliers.html), and matching the route first would overwrite them.
	function sidebarActivateFromRoute(menu) {
		var file = sidebarFileName(window.location.pathname) || 'index.html';
		var link = sidebarLinkByFile(menu, file);
		if (!link) return null;

		link.classList.add('active');
		var li = link.closest('li');
		if (li) li.classList.add('active');

		// `.active.subdrop ~ ul { display: block !important }` in
		// assets/scss/layout/_sidebar.scss is what actually opens a group.
		while (li) {
			var parentLi = li.parentElement ? li.parentElement.closest('li') : null;
			if (parentLi && parentLi.classList.contains('submenu')) {
				var opener = parentLi.querySelector(':scope > a');
				if (opener) {
					opener.classList.add('active');
					opener.classList.add('subdrop');
				}
			}
			li = parentLi;
		}
		return link;
	}

	function scrollSidebarToActive() {
		var sidebar = document.getElementById('sidebar-two');
		if (!sidebar) return;

		// Collapsed rail: submenus are force-hidden, so there is nothing to reveal.
		if (document.body.classList.contains('mini-sidebar') &&
			!document.body.classList.contains('expand-menu')) return;

		var menu = sidebar.querySelector('.sidebar-menu');
		// SimpleBar moves the real scrolling to .simplebar-content-wrapper;
		// .sidebar-inner is the fallback for the one sidebar page that does not
		// load simplebar.min.js (writing scrollTop there is a harmless no-op).
		var scroller = sidebar.querySelector('.simplebar-content-wrapper') ||
			sidebar.querySelector('.sidebar-inner');
		if (!menu || !scroller) return;

		// Resolve -- and for the route fallback APPLY -- the target before
		// measuring: opening a group changes scrollHeight.
		var target = sidebarActiveLink(menu) || sidebarActivateFromRoute(menu);
		if (!target) return;

		// A hidden or non-overflowing scroller has nothing to do. This is a
		// geometric test rather than a body.menu-horizontal test because below lg
		// the horizontal layout falls back to this same vertical sidebar.
		var viewH = scroller.clientHeight;
		if (!viewH || scroller.scrollHeight <= viewH) return;

		var box = target.getBoundingClientRect();
		if (!box.height) return; // inside a collapsed ancestor

		// Rect deltas, never offsetTop: the submenu ul and its a are both
		// position:relative, so offsetTop is measured from the nearest positioned
		// ancestor rather than from the scroller.
		var view = scroller.getBoundingClientRect();
		var relTop = scroller.scrollTop + (box.top - view.top) - scroller.clientTop;

		// Already comfortably in view -> leave the scroll position alone.
		var margin = 8;
		if (relTop >= scroller.scrollTop + margin &&
			relTop + box.height <= scroller.scrollTop + viewH - margin) return;

		// Centre it, clamped so a near-the-top item cannot go negative.
		var top = relTop - (viewH / 2) + (box.height / 2);
		scroller.scrollTop = Math.max(0, Math.min(top, scroller.scrollHeight - viewH));
	}

	document.addEventListener('DOMContentLoaded', function () {
		scrollSidebarToActive();
		// Icon fonts can settle after DCL and shift row heights. Re-running is
		// idempotent: an in-view target is left alone, so this causes no second jump.
		window.addEventListener('load', scrollSidebarToActive, { once: true });
	});

	// Minimal moment()-like wrapper around native Date, supporting only the
	// subset of chainable operations (subtract/add/startOf/endOf/format/toDate)
	// used by the date range pickers below. Keeps call sites unchanged in
	// shape while removing the Moment.js runtime dependency.
	var MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	function pad2(n) { return (n < 10 ? '0' : '') + n; }
	function NDate(d) {
		this._d = d ? new Date(d) : new Date();
	}
	NDate.prototype.subtract = function (amount, unit) {
		if (unit === 'days') this._d.setDate(this._d.getDate() - amount);
		else if (unit === 'month') this._d.setMonth(this._d.getMonth() - amount);
		else if (unit === 'year') this._d.setFullYear(this._d.getFullYear() - amount);
		else if (unit === 'hour') this._d.setHours(this._d.getHours() - amount);
		return this;
	};
	NDate.prototype.add = function (amount, unit) {
		if (unit === 'days') this._d.setDate(this._d.getDate() + amount);
		else if (unit === 'month') this._d.setMonth(this._d.getMonth() + amount);
		else if (unit === 'year') this._d.setFullYear(this._d.getFullYear() + amount);
		else if (unit === 'hour') this._d.setHours(this._d.getHours() + amount);
		return this;
	};
	NDate.prototype.startOf = function (unit) {
		if (unit === 'month') this._d = new Date(this._d.getFullYear(), this._d.getMonth(), 1, 0, 0, 0, 0);
		else if (unit === 'year') this._d = new Date(this._d.getFullYear(), 0, 1, 0, 0, 0, 0);
		else if (unit === 'hour') this._d.setMinutes(0, 0, 0);
		else if (unit === 'day') this._d.setHours(0, 0, 0, 0);
		return this;
	};
	NDate.prototype.endOf = function (unit) {
		if (unit === 'month') this._d = new Date(this._d.getFullYear(), this._d.getMonth() + 1, 0, 23, 59, 59, 999);
		else if (unit === 'year') this._d = new Date(this._d.getFullYear(), 11, 31, 23, 59, 59, 999);
		else if (unit === 'day') this._d.setHours(23, 59, 59, 999);
		return this;
	};
	NDate.prototype.format = function (fmt) {
		var d = this._d;
		var hours24 = d.getHours();
		var hours12 = hours24 % 12 || 12;
		return fmt.replace(/YYYY|YY|MMM|MM|M|DD|D|hh|mm|A/g, function (token) {
			switch (token) {
				case 'YYYY': return String(d.getFullYear());
				case 'YY': return String(d.getFullYear()).slice(-2);
				case 'MMM': return MONTH_SHORT[d.getMonth()];
				case 'MM': return pad2(d.getMonth() + 1);
				case 'M': return String(d.getMonth() + 1);
				case 'DD': return pad2(d.getDate());
				case 'D': return String(d.getDate());
				case 'hh': return pad2(hours12);
				case 'mm': return pad2(d.getMinutes());
				case 'A': return hours24 < 12 ? 'AM' : 'PM';
			}
			return token;
		});
	};
	NDate.prototype.toDate = function () {
		return new Date(this._d);
	};
	function ndate(d) {
		return new NDate(d);
	}

	// Date Range Picker (Preserved original implementation)
	function initDateRangePicker() {
		if (typeof window.$.fn !== 'undefined' && typeof window.$.fn.daterangepicker !== 'undefined') {
			if (window.$('#reportrange').length > 0) {
				var start = ndate().subtract(29, "days"),
					end = ndate();

				var report_range = function (start, end) {
					window.$("#reportrange span").html(start.format("D MMM YY") + " - " + end.format("D MMM YY"));
				};
				window.$("#reportrange").daterangepicker({
					startDate: start.toDate(),
					endDate: end.toDate(),
					ranges: {
						'Today': [ndate().toDate(), ndate().toDate()],
						'Yesterday': [ndate().subtract(1, "days").toDate(), ndate().subtract(1, "days").toDate()],
						"Last 7 Days": [ndate().subtract(6, "days").toDate(), ndate().toDate()],
						"Last 30 Days": [ndate().subtract(29, "days").toDate(), ndate().toDate()],
						"This Month": [ndate().startOf("month").toDate(), ndate().endOf("month").toDate()],
						"Last Month": [ndate().subtract(1, "month").startOf("month").toDate(), ndate().subtract(1, "month").endOf("month").toDate()]
					}
				}, report_range);
				report_range(start, end);
			}

			if (window.$('.bookingrange').length > 0) {
				var bstart = ndate().subtract(6, 'days');
				var bend = ndate();
				var booking_range = function (start, end) {
					window.$('.bookingrange span').html(start.format('M/D/YYYY') + ' - ' + end.format('M/D/YYYY'));
				};

				window.$('.bookingrange').daterangepicker({
					startDate: bstart.toDate(),
					endDate: bend.toDate(),
					ranges: {
						'Today': [ndate().toDate(), ndate().toDate()],
						'Yesterday': [ndate().subtract(1, 'days').toDate(), ndate().subtract(1, 'days').toDate()],
						'Last 7 Days': [ndate().subtract(6, 'days').toDate(), ndate().toDate()],
						'Last 30 Days': [ndate().subtract(29, 'days').toDate(), ndate().toDate()],
						'This Year': [ndate().startOf('year').toDate(), ndate().endOf('year').toDate()],
						'Next Year': [ndate().add(1, 'year').startOf('year').toDate(), ndate().add(1, 'year').endOf('year').toDate()]
					}
				}, booking_range);
				booking_range(bstart, bend);
			}

			if (window.$('.daterange').length > 0) {
				window.$('.daterange').daterangepicker({
					autoUpdateInput: false,
					ranges: {
						'Today': [ndate().toDate(), ndate().toDate()],
						'Yesterday': [ndate().subtract(1, 'days').toDate(), ndate().subtract(1, 'days').toDate()],
						'Last 7 Days': [ndate().subtract(6, 'days').toDate(), ndate().toDate()],
						'Last 30 Days': [ndate().subtract(29, 'days').toDate(), ndate().toDate()],
						'This Year': [ndate().startOf('year').toDate(), ndate().endOf('year').toDate()],
						'Next Year': [ndate().add(1, 'year').startOf('year').toDate(), ndate().add(1, 'year').endOf('year').toDate()]
					},
					locale: {
						cancelLabel: 'Clear'
					}
				});
				var daterangeInput = document.getElementById('daterange');
				if (daterangeInput) {
					daterangeInput.addEventListener('input', function () {
						var textLength = this.value.length;
						this.style.width = (textLength + 10) + 'px';
					});
				}

				window.$('.daterange').on('apply.daterangepicker', function (ev, picker) {
					window.$(this).val(ndate(picker.startDate).format('MM/DD/YYYY') + ' - ' + ndate(picker.endDate).format('MM/DD/YYYY'));
				});

				window.$('.daterange').on('cancel.daterangepicker', function (ev, picker) {
					window.$(this).val('');
				});
			}

			if (window.$('input[name="datetimes"]').length > 0) {
				window.$('input[name="datetimes"]').daterangepicker({
					timePicker: true,
					startDate: ndate().startOf('hour').toDate(),
					endDate: ndate().startOf('hour').add(32, 'hour').toDate(),
					locale: {
						format: 'M/DD hh:mm A'
					}
				});
			}

			if (typeof window.$.fn.datetimepicker !== 'undefined' && window.$('.yearpicker').length > 0) {
				window.$('.yearpicker').datetimepicker({
					viewMode: 'years',
					format: 'YYYY',
					icons: {
						up: "fas fa-angle-up",
						down: "fas fa-angle-down",
						next: 'fas fa-angle-right',
						previous: 'fas fa-angle-left'
					}
				});
			}
		} else if (typeof flatpickr !== 'undefined') {
			var reportRangeEl = document.getElementById('reportrange');
			if (reportRangeEl) {
				initVanillaDateRangePicker(reportRangeEl, {
					format: 'D MMM YY',
					initialStart: ndate().subtract(29, 'days'),
					initialEnd: ndate(),
					presets: [
						['Today', function () { return [ndate(), ndate()]; }],
						['Yesterday', function () { return [ndate().subtract(1, 'days'), ndate().subtract(1, 'days')]; }],
						['Last 7 Days', function () { return [ndate().subtract(6, 'days'), ndate()]; }],
						['Last 30 Days', function () { return [ndate().subtract(29, 'days'), ndate()]; }],
						['This Month', function () { return [ndate().startOf('month'), ndate().endOf('month')]; }],
						['Last Month', function () { return [ndate().subtract(1, 'month').startOf('month'), ndate().subtract(1, 'month').endOf('month')]; }]
					]
				});
			}

			document.querySelectorAll('.bookingrange').forEach(function (bookingEl) {
				initVanillaDateRangePicker(bookingEl, {
					format: 'M/D/YYYY',
					initialStart: ndate().subtract(6, 'days'),
					initialEnd: ndate(),
					presets: [
						['Today', function () { return [ndate(), ndate()]; }],
						['Yesterday', function () { return [ndate().subtract(1, 'days'), ndate().subtract(1, 'days')]; }],
						['Last 7 Days', function () { return [ndate().subtract(6, 'days'), ndate()]; }],
						['Last 30 Days', function () { return [ndate().subtract(29, 'days'), ndate()]; }],
						['This Year', function () { return [ndate().startOf('year'), ndate().endOf('year')]; }],
						['Next Year', function () { return [ndate().add(1, 'year').startOf('year'), ndate().add(1, 'year').endOf('year')]; }]
					]
				});
			});
		}
	}

	// Vanilla (jQuery-less) reimplementation of the daterangepicker-driven
	// pickers (#reportrange, .bookingrange), matching the live Kanakku
	// template's behavior: same initial range, same display format, and
	// the same preset list per variant. Reuses the project's existing
	// .daterangepicker / .ranges markup and classes so it inherits the
	// same styling as the jQuery-driven picker used elsewhere in the project.
	function initVanillaDateRangePicker(el, config) {
		var span = el.querySelector('span');
		var format = config.format;
		var currentStart = config.initialStart;
		var currentEnd = config.initialEnd;

		function renderLabel(start, end) {
			var text = start.format(format) + ' - ' + end.format(format);
			if (span) span.textContent = text;
			// .bookingrange (and any other trigger without a label span) is a
			// plain <input> — the picker's own value is the display surface.
			else if (el.tagName === 'INPUT') el.value = text;
		}
		renderLabel(currentStart, currentEnd);

		var presets = config.presets;

		var pendingStart = currentStart, pendingEnd = currentEnd;

		var panel = document.createElement('div');
		panel.className = 'daterangepicker ltr show-ranges opensleft';
		panel.style.display = 'none';
		panel.style.position = 'absolute';
		panel.style.zIndex = '3001';

		var rangesWrap = document.createElement('div');
		rangesWrap.className = 'ranges';
		var ul = document.createElement('ul');
		var liEls = [];

		function clearActive() {
			liEls.forEach(function (x) { x.classList.remove('active'); });
		}

		presets.forEach(function (preset) {
			var label = preset[0];
			var getRange = preset[1];
			var li = document.createElement('li');
			li.textContent = label;
			li.addEventListener('click', function () {
				var range = getRange();
				currentStart = range[0];
				currentEnd = range[1];
				renderLabel(currentStart, currentEnd);
				clearActive();
				li.classList.add('active');
				panel.classList.remove('show-calendar');
				closePanel();
			});
			liEls.push(li);
			ul.appendChild(li);
		});

		// Custom Range option — reveals the calendar + Apply/Cancel, matching
		// the reference behavior (list-only by default).
		var customLi = document.createElement('li');
		customLi.textContent = 'Custom Range';
		customLi.addEventListener('click', function () {
			clearActive();
			customLi.classList.add('active');
			pendingStart = currentStart;
			pendingEnd = currentEnd;
			if (fp) fp.setDate([pendingStart.toDate(), pendingEnd.toDate()], false);
			// Reveals both .drp-calendar and .drp-buttons (Apply/Cancel) —
			// the stylesheet gates their visibility off this class on the
			// panel itself, not off .drp-calendar's own inline display.
			panel.classList.add('show-calendar');
			// The panel just grew (calendar revealed), so its previous
			// position may now clip the viewport — recompute.
			positionPanel();
		});
		liEls.push(customLi);
		ul.appendChild(customLi);

		rangesWrap.appendChild(ul);
		panel.appendChild(rangesWrap);

		var calendarWrap = document.createElement('div');
		calendarWrap.className = 'drp-calendar left single';

		var calendarInner = document.createElement('div');
		calendarInner.className = 'calendar-table';
		calendarWrap.appendChild(calendarInner);

		var buttonsWrap = document.createElement('div');
		buttonsWrap.className = 'drp-buttons';
		var cancelBtn = document.createElement('button');
		cancelBtn.type = 'button';
		cancelBtn.className = 'cancelBtn btn btn-sm btn-light';
		cancelBtn.textContent = 'Cancel';
		var applyBtn = document.createElement('button');
		applyBtn.type = 'button';
		applyBtn.className = 'applyBtn btn btn-sm btn-primary';
		applyBtn.textContent = 'Apply';
		buttonsWrap.appendChild(cancelBtn);
		buttonsWrap.appendChild(applyBtn);
		calendarWrap.appendChild(buttonsWrap);

		panel.appendChild(calendarWrap);

		document.body.appendChild(panel);

		var fp = flatpickr(calendarInner, {
			inline: true,
			mode: 'range',
			dateFormat: 'Y-m-d',
			defaultDate: [currentStart.toDate(), currentEnd.toDate()],
			onChange: function (selectedDates) {
				if (selectedDates.length === 2) {
					pendingStart = ndate(selectedDates[0]);
					pendingEnd = ndate(selectedDates[1]);
				}
			}
		});

		cancelBtn.addEventListener('click', function () {
			panel.classList.remove('show-calendar');
			closePanel();
		});
		applyBtn.addEventListener('click', function () {
			currentStart = pendingStart;
			currentEnd = pendingEnd;
			renderLabel(currentStart, currentEnd);
			panel.classList.remove('show-calendar');
			closePanel();
		});

		var EDGE_MARGIN = 8;

		// Positions the panel relative to the trigger element, flipping to
		// whichever side/edge keeps it fully inside the viewport (matching
		// the reference daterangepicker's own opensleft/opensright/drop-up
		// flipping behavior) without altering its size, styling, or markup.
		function positionPanel() {
			var wasOpen = panel.style.display !== 'none';
			var prevVisibility = panel.style.visibility;
			if (!wasOpen) {
				// Measure off-screen (no flash) since a hidden panel has no layout box.
				panel.style.visibility = 'hidden';
				panel.style.display = 'flex';
			}

			var rect = el.getBoundingClientRect();
			var panelWidth = panel.offsetWidth;
			var panelHeight = panel.offsetHeight;
			var viewportWidth = document.documentElement.clientWidth;
			var viewportHeight = document.documentElement.clientHeight;

			// Horizontal: default left-aligned to the trigger; flip to
			// right-aligned if it would overflow the right edge.
			var left = rect.left;
			if (left + panelWidth > viewportWidth - EDGE_MARGIN) {
				left = rect.right - panelWidth;
			}
			if (left < EDGE_MARGIN) left = EDGE_MARGIN;
			if (left + panelWidth > viewportWidth - EDGE_MARGIN) {
				left = Math.max(EDGE_MARGIN, viewportWidth - EDGE_MARGIN - panelWidth);
			}

			// Vertical: default below the trigger; flip above it if there's
			// not enough room below but there is above (drop-up).
			var spaceBelow = viewportHeight - rect.bottom;
			var spaceAbove = rect.top;
			var dropUp = (spaceBelow < panelHeight + EDGE_MARGIN) && (spaceAbove > spaceBelow);
			var top = dropUp ? (rect.top - panelHeight - 4) : (rect.bottom + 4);
			if (top < EDGE_MARGIN) top = EDGE_MARGIN;
			if (top + panelHeight > viewportHeight - EDGE_MARGIN) {
				top = Math.max(EDGE_MARGIN, viewportHeight - EDGE_MARGIN - panelHeight);
			}

			panel.classList.toggle('drop-up', dropUp);
			panel.style.top = (top + window.scrollY) + 'px';
			panel.style.left = (left + window.scrollX) + 'px';

			if (!wasOpen) {
				panel.style.display = 'none';
				panel.style.visibility = prevVisibility;
			}
		}

		function reposition() {
			if (panel.style.display !== 'none') positionPanel();
		}

		function openPanel() {
			positionPanel();
			panel.style.display = 'flex';
			// Re-measure now that it's actually laid out (e.g. fonts/scrollbars
			// can shift dimensions slightly between the hidden and shown states).
			positionPanel();
		}
		function closePanel() {
			panel.style.display = 'none';
		}

		el.addEventListener('click', function (e) {
			e.stopPropagation();
			if (panel.style.display === 'none') openPanel(); else closePanel();
		});
		var parentGroup = el.closest('.input-group');
		if (parentGroup) {
			var iconAddon = parentGroup.querySelector('.input-icon-addon');
			if (iconAddon) {
				iconAddon.style.cursor = 'pointer';
				iconAddon.style.pointerEvents = 'auto';
				iconAddon.addEventListener('click', function (e) {
					e.stopPropagation();
					if (panel.style.display === 'none') openPanel(); else closePanel();
				});
			}
		}
		document.addEventListener('click', function (e) {
			if (panel.style.display !== 'none' && !panel.contains(e.target) && e.target !== el && !el.contains(e.target)) {
				closePanel();
			}
		});
		window.addEventListener('resize', reposition);
		window.addEventListener('scroll', reposition, true);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initDateRangePicker);
	} else {
		initDateRangePicker();
	}

	// toggle_btn
	delegate(document, 'click', '#toggle_btn', function () {
		if (document.body.classList.contains('mini-sidebar')) {
			document.body.classList.remove('mini-sidebar');
			this.classList.add('active');
			localStorage.setItem('screenModeNightTokenState', 'night');
			setTimeout(function () {
				document.body.classList.remove('mini-sidebar');
				var headerLeft = document.querySelector('.header-left');
				if (headerLeft) headerLeft.classList.add('active');
			}, 100);
		} else {
			document.body.classList.add('mini-sidebar');
			this.classList.remove('active');
			localStorage.removeItem('screenModeNightTokenState');
			setTimeout(function () {
				document.body.classList.add('mini-sidebar');
				var headerLeft = document.querySelector('.header-left');
				if (headerLeft) headerLeft.classList.remove('active');
			}, 100);
		}
		return false;
	});

	document.querySelectorAll('.themecolorset').forEach(function (el) {
		el.addEventListener('click', function () {
			document.querySelectorAll('.themecolorset').forEach(function (e2) { e2.classList.remove('active'); });
			this.classList.add('active');
		});
	});

	document.querySelectorAll('.theme-layout').forEach(function (el) {
		el.addEventListener('click', function () {
			document.querySelectorAll('.theme-layout').forEach(function (e2) { e2.classList.remove('active'); });
			this.classList.add('active');
		});
	});

	document.querySelectorAll('.win-maximize').forEach(function (el) {
		el.addEventListener('click', function (e) {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen();
			} else if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		});
	});

	// Custom Country Code Selector
	['#phone', '#phone2', '#phone3'].forEach(function (sel) {
		var input = document.querySelector(sel);
		if (input) {
			window.intlTelInput(input, {
				utilsScript: "assets/plugins/intlTelInput/js/utils.js",
			});
		}
	});

	// select all checkboxes
	function setupSelectAll(selectAllSelector) {
		var selectAllEl = document.querySelector(selectAllSelector);
		if (!selectAllEl) return;
		selectAllEl.addEventListener('click', function () {
			var checkboxItems = document.querySelectorAll('.form-check.form-check-md :checkbox');
			checkboxItems.forEach(function (cb) { cb.checked = selectAllEl.checked; });
		});
	}

	delegate(document, 'click', '#check_all', function () {
		document.querySelectorAll('.checkmail').forEach(function (el) { el.click(); });
		return false;
	});
	setupSelectAll('#select-all2');
	setupSelectAll('#select-all3');
	setupSelectAll('#select-all');

	document.addEventListener("DOMContentLoaded", function () {
		document.querySelectorAll(".close-modal").forEach(function (element) {
			element.addEventListener("click", function () {
				var modal = document.querySelector(".custom-modal.show");
				if (modal && window.bootstrap) {
					var modalInstance = bootstrap.Modal.getInstance(modal);
					if (modalInstance) modalInstance.hide();
				}
			});
		});
	});

	// Tooltip
	if (document.querySelector('[data-bs-toggle="tooltip"]') && window.bootstrap) {
		var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
		tooltipTriggerList.map(function (tooltipTriggerEl) {
			return new bootstrap.Tooltip(tooltipTriggerEl);
		});
	}

	if (window.location.hash === "#LightMode") {
		localStorage.setItem('theme', 'dark');
	} else if (window.location.hash === "#DarkMode") {
		localStorage.setItem('theme', 'light');
	}

	document.querySelectorAll('ul.tabs li').forEach(function (li) {
		li.addEventListener('click', function () {
			var theTab = this.getAttribute('id');
			if (this.classList.contains('active')) {
				// do nothing
			} else {
				var wrapperEl = this.closest('.tabs_wrapper');
				if (wrapperEl) {
					wrapperEl.querySelectorAll('ul.tabs li, .tabs_container .tab_content').forEach(function (el) {
						el.classList.remove('active');
					});
				}
				document.querySelectorAll('.tabs_container .tab_content[data-tab="' + theTab + '"], ul.tabs li[id="' + theTab + '"]').forEach(function (el) {
					el.classList.add('active');
				});
			}
		});
	});

	var customInputRange = document.querySelector('.custom-input');
	if (customInputRange) {
		customInputRange.addEventListener('input', function () {
			var progress = (customInputRange.value - customInputRange.min) / (customInputRange.max - customInputRange.min) * 100;
			customInputRange.style.background = 'linear-gradient(to top, var(--md-sys-color-on-surface-variant) 0%, var(--md-sys-color-on-surface-variant) ' + progress + '%, var(--md-sys-color-surface-variant) ' + progress + '%, var(--md-sys-color-surface-variant) 100%)';
		});
	}

	// month picker
	if (document.querySelector('.month-picker')) {
		var monthly = document.getElementById('monthly');
		var monthly2 = document.getElementById('monthly2');
		if (monthly) monthly.value = '2025-01';
		if (monthly2) monthly2.value = '2025-12';
	}

	// Collapse Header
	var btnFullscreenElements = document.getElementsByClassName('btnFullscreen');
	if (btnFullscreenElements.length > 0) {
		Array.from(btnFullscreenElements).forEach(function (element) {
			element.addEventListener('click', function () {
				toggleFullscreen();
			});
		});

		function toggleFullscreen() {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen();
			} else if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}

	var collapseHeaderEl = document.getElementById('collapse-header');
	if (collapseHeaderEl) {
		collapseHeaderEl.onclick = function () {
			this.classList.toggle('active');
			document.body.classList.toggle('header-collapse');
		};
	}

	// Increment Decrement
	function updateValue(obj, delta) {
		var container = obj.parentElement;
		var item = container && container.querySelector('input');
		if (!item) return;
		var newValue = parseInt(item.value, 10) + delta;
		item.value = Math.max(newValue, 0);
	}
	document.querySelectorAll('.inc').forEach(function (el) {
		el.addEventListener('click', function () { updateValue(this, 1); });
	});
	document.querySelectorAll('.dec').forEach(function (el) {
		el.addEventListener('click', function () { updateValue(this, -1); });
	});

	/* card with fullscreen */
	var DIV_CARD = ".card";
	var cardFullscreenBtn = document.querySelectorAll('[data-bs-toggle="card-fullscreen"]');
	cardFullscreenBtn.forEach(function (ele) {
		ele.addEventListener("click", function (e) {
			var card = this.closest(DIV_CARD);
			card.classList.toggle("card-fullscreen");
			card.classList.remove("card-collapsed");
			e.preventDefault();
			return false;
		});
	});
	/* card with fullscreen */

	/* card with close button */
	var DIV_CARD_CLOSE = ".card";
	var cardRemoveBtn = document.querySelectorAll('[data-bs-toggle="card-remove"]');
	cardRemoveBtn.forEach(function (ele) {
		ele.addEventListener("click", function (e) {
			e.preventDefault();
			var card = this.closest(DIV_CARD_CLOSE);
			if (card) card.remove();
			return false;
		});
	});
	/* card with close button */

	setTimeout(function () {
		document.querySelectorAll('.rating-select').forEach(function (el) {
			el.addEventListener('click', function () {
				var icon = this.querySelector('i');
				if (icon) {
					icon.classList.toggle('ti-star');
					icon.classList.toggle('ti-star-filled');
					icon.classList.toggle('filled');
				}
			});
		});
	}, 100);

	// Upload Image
	document.querySelectorAll('.image-sign').forEach(function (input) {
		input.addEventListener('change', function () {
			var uploadPic = this.closest('.upload-pic');
			var frames = uploadPic && uploadPic.querySelector('.frames');
			if (!frames) return;
			frames.innerHTML = '';
			for (var i = 0; i < this.files.length; i++) {
				frames.insertAdjacentHTML('beforeend', '<img src="' + window.URL.createObjectURL(this.files[i]) + '" width="100px" height="100px">');
			}
		});
	});

	if (document.querySelector('.stack-menu')) {
		var activeTab = null;
		document.querySelectorAll('.stack-menu .nav a').forEach(function (link) {
			link.addEventListener('click', function (e) {
				e.preventDefault();
				var currentTab = this.getAttribute('href');
				var currentTabEl = document.querySelector(currentTab);

				if (activeTab === currentTab) {
					if (currentTabEl && isVisible(currentTabEl)) {
						currentTabEl.style.display = 'none';
						activeTab = null;
					} else if (currentTabEl) {
						currentTabEl.style.display = '';
						activeTab = currentTab;
					}
				} else {
					document.querySelectorAll('#myTabContent .tab-pane').forEach(function (pane) { pane.style.display = 'none'; });
					if (currentTabEl) currentTabEl.style.display = '';
					activeTab = currentTab;
				}
			});
		});
	}

	function toggleFullscreenElem(elem) {
		elem = elem || document.documentElement;
		if (!document.fullscreenElement && !document.mozFullScreenElement &&
			!document.webkitFullscreenElement && !document.msFullscreenElement) {
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.msRequestFullscreen) {
				elem.msRequestFullscreen();
			} else if (elem.mozRequestFullScreen) {
				elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) {
				elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
	}

	document.querySelectorAll('.switch-coder').forEach(function (el) {
		el.addEventListener('change', function () {
			var card = this.closest('.card');
			var viewPreview = card && card.querySelector('.view-preview');
			var viewCode = card && card.querySelector('.view-code');
			if (this.checked) {
				if (viewPreview) viewPreview.classList.add('d-none');
				if (viewCode) viewCode.classList.remove('d-none');
			} else {
				if (viewPreview) viewPreview.classList.remove('d-none');
				if (viewCode) viewCode.classList.add('d-none');
			}
		});
	});

	document.addEventListener("DOMContentLoaded", function () {
		document.addEventListener("click", function (event) {
			if (event.target.classList.contains("close-filter")) {
				var filterDropdown = event.target.closest(".dropdown-info");
				if (filterDropdown) {
					filterDropdown.classList.remove("show");
					console.log("Dropdown closed:", filterDropdown);
				}
			}
		});
	});

	// Trial Item
	document.querySelectorAll('.trial-item .close-icon').forEach(function (el) {
		el.addEventListener('click', function () {
			var trialItem = this.closest('.trial-item');
			if (trialItem) trialItem.style.display = 'none';
		});
	});

	/* Aprrearence Settings */
	document.querySelectorAll('.theme-image').forEach(function (el) {
		el.addEventListener('click', function () {
			document.querySelectorAll('.theme-image').forEach(function (e2) { e2.classList.remove('active'); });
			this.classList.add('active');
		});
	});

	// Select Color -> Choices.js (vanilla) with a colored-dot template
	if (window.Choices) {
		document.querySelectorAll('.select2-color').forEach(function (el) {
			if (el.dataset.choicesInit) return;
			el.dataset.choicesInit = '1';

			// carry each <option>'s own class (e.g. text-success) into Choices' customProperties
			el.querySelectorAll('option').forEach(function (opt) {
				if (opt.className) {
					opt.dataset.customProperties = JSON.stringify({ colorClass: opt.className });
				}
			});

			var colorIcon = function (data) {
				var colorClass = (data.customProperties && data.customProperties.colorClass) || '';
				return colorClass ? '<i class="fa-solid fa-circle fs-6 me-1 ' + colorClass + '"></i> ' : '';
			};

			new Choices(el, {
				searchEnabled: false,
				shouldSort: false,
				allowHTML: false,
				callbackOnCreateTemplates: function (template) {
					return {
						item: function (classNamesObj, data) {
							var classNames = classNamesObj.classNames || classNamesObj;
							return template(
								'<div class="' + classNames.item + ' ' + (data.highlighted ? classNames.highlightedState : classNames.itemSelectable) + '" data-item data-id="' + data.id + '" data-value="' + data.value + '">' +
								colorIcon(data) + data.label +
								'</div>'
							);
						},
						choice: function (classNamesObj, data) {
							var classNames = classNamesObj.classNames || classNamesObj;
							return template(
								'<div class="' + classNames.item + ' ' + classNames.itemChoice + ' ' + classNames.itemSelectable + '" data-choice data-choice-selectable data-id="' + data.id + '" data-value="' + data.value + '" role="option">' +
								colorIcon(data) + data.label +
								'</div>'
							);
						}
					};
				}
			});
		});
	}

	// Select All for Dropdown
	document.querySelectorAll('.select-all').forEach(function (el) {
		el.addEventListener('click', function () {
			var dropdown = this.closest('.dropdown');
			var checkboxGroup = dropdown && dropdown.querySelectorAll(':checkbox');
			if (checkboxGroup) {
				checkboxGroup.forEach(function (cb) { cb.checked = el.checked; });
			}
		});
	});

	// Tag Close
	document.querySelectorAll('.tag-close').forEach(function (el) {
		el.addEventListener('click', function () {
			var tag = this.closest('.tag');
			if (tag) tag.style.display = 'none';
		});
	});

	// Filter Submit
	var filterSubmit = document.getElementById('filter-submit');
	if (filterSubmit) {
		filterSubmit.addEventListener('click', function () {
			document.querySelectorAll('.filter-info').forEach(function (el) {
				slideDown(el, 300);
				el.classList.add('show');
				el.classList.add('d-flex');
			});
		});
	}

	document.addEventListener("DOMContentLoaded", function () {
		var closeBtn = document.getElementById("close-filter");
		if (closeBtn) {
			closeBtn.addEventListener("click", function () {
				var parentDropdown = closeBtn.closest(".dropdown-info");
				if (parentDropdown) {
					parentDropdown.classList.remove("show");
				}
			});
		}
	});

	document.addEventListener("DOMContentLoaded", function () {
		document.querySelectorAll(".twocol-mini .dropdown").forEach(function (dropdown) {
			dropdown.addEventListener("show.bs.dropdown", function (event) {
				var menu = this.querySelector(".dropdown-menu");
				var rect = this.getBoundingClientRect();
				menu.style.position = "fixed";
				menu.style.top = rect.bottom + "px";
				menu.style.left = rect.left + "px";
				menu.style.width = rect.width + "px";
			});
		});
	});

	// Quill Editor
	if (document.querySelector('.editor') && window.Quill) {
		document.querySelectorAll('.editor').forEach(function (editor) {
			new Quill(editor, {
				theme: 'snow'
			});
		});
	}

	// Remove Gallery
	delegate(document, 'click', '.gallery-trash', function () {
		if (this.parentElement) this.parentElement.style.display = 'none';
	});

	// Add Invoice Table
	document.querySelectorAll('.add-invoice-data').forEach(function (btn) {
		btn.addEventListener('click', function (e) {
			var addTable = '<tr>' +
				'<td><input type="text" class="form-control" value="Enter Product Name"></td>' +
				'<td><input type="text" class="form-control" value="0"></td>' +
				'<td><input type="text" class="form-control" value="Unit"></td>' +
				'<td><input type="text" class="form-control" value="0"></td>' +
				'<td><input type="text" class="form-control" value="0%"></td>' +
				'<td><input type="text" class="form-control" value="0"></td>' +
				'<td><input type="text" class="form-control" value="0" style="min-width: 66px;"></td>' +
				'<td><div><a href="javascript:void(0);" class="text-danger remove-table"><i class="isax isax-close-circle"></i></a></div></td>' +
				'</tr>';
			var tbody = document.querySelector('tbody.add-tbody');
			if (tbody) tbody.insertAdjacentHTML('beforeend', addTable);
			e.preventDefault();
		});
	});

	delegate(document, 'click', '.remove-table', function () {
		var row = this.closest('tr');
		if (row) row.remove();
	});

	// Add Invoice Table Row
	document.querySelectorAll('.add-invoice-data1').forEach(function (btn) {
		btn.addEventListener('click', function (e) {
			e.preventDefault();

			var addTable = '<tr>' +
				'<td><input type="text" class="form-control" value="Enter Product Name"></td>' +
				'<td><input type="text" class="form-control" value="0"></td>' +
				'<td><input type="text" class="form-control" value="Unit"></td>' +
				'<td><input type="text" class="form-control" value="0"></td>' +
				'<td class="td-custom-width"><select class="select">' +
				'<option>0%</option><option>10%</option><option>20%</option>' +
				'<option>30%</option><option>40%</option><option>50%</option>' +
				'</select></td>' +
				'<td><input type="text" class="form-control" value="0"></td>' +
				'<td><input type="text" class="form-control" value="0" style="min-width:66px;"></td>' +
				'<td><div><a href="javascript:void(0);" class="text-danger remove-table1"><i class="isax isax-close-circle"></i></a></div></td>' +
				'</tr>';

			var tbody1 = document.querySelector('.add-tbody1');
			if (!tbody1) return;
			tbody1.insertAdjacentHTML('beforeend', addTable);
			var newRow = tbody1.lastElementChild;

			// reinitialize Choices.js on the new row's select
			if (window.Choices) {
				var newSelectEl = newRow.querySelector('.select');
				if (newSelectEl && !newSelectEl.dataset.choicesInit) {
					newSelectEl.dataset.choicesInit = '1';
					new Choices(newSelectEl, { searchEnabled: false, shouldSort: false, allowHTML: false });
				}
			}
		});
	});

	delegate(document, 'click', '.remove-table1', function () {
		var row = this.closest('tr');
		if (row) row.remove();
	});

	/* Invoice Template */
	document.querySelectorAll('.invoice-template').forEach(function (el) {
		el.addEventListener('click', function () {
			document.querySelectorAll('.invoice-template').forEach(function (e2) { e2.classList.remove('active'); });
			this.classList.add('active');
		});
	});

	// Increment Decrement Numbers
	document.querySelectorAll('.quantity-btn').forEach(function (button) {
		button.addEventListener('click', function () {
			var quantityContainer = this.closest('.product-quantity');
			var input = quantityContainer && quantityContainer.querySelector('input.quntity-input');
			if (!input) return;
			var oldValue = input.value;
			var newVal;
			if (this.textContent.trim() === "+") {
				newVal = parseFloat(oldValue) + 1;
			} else {
				newVal = oldValue > 0 ? parseFloat(oldValue) - 1 : 0;
			}
			input.value = newVal;
		});
	});

	// Pricing Tabs
	document.addEventListener('DOMContentLoaded', function () {
		function togglePricing(toggle) {
			var wrapper = toggle.closest('.pricing-wrapper');
			if (!wrapper) return;
			var monthly = wrapper.querySelector('.pricing-monthly');
			var yearly = wrapper.querySelector('.pricing-yearly');
			if (toggle.checked) {
				if (monthly) monthly.style.display = 'none';
				if (yearly) yearly.style.display = '';
			} else {
				if (yearly) yearly.style.display = 'none';
				if (monthly) monthly.style.display = '';
			}
		}

		document.querySelectorAll('.pricing-yearly').forEach(function (el) { el.style.display = 'none'; });

		delegate(document, 'change', '.pricing-toggle', function () {
			togglePricing(this);
		});
	});

	// Recurring Expenses
	document.addEventListener('DOMContentLoaded', function () {
		document.querySelectorAll('.cutomer-radio-form').forEach(function (el) { el.style.display = ''; });
		document.querySelectorAll('.vendor-radio-form, .myself-radio-form').forEach(function (el) { el.style.display = 'none'; });

		document.querySelectorAll('.customer-radio').forEach(function (el) {
			el.addEventListener('change', function () {
				if (this.checked) {
					document.querySelectorAll('.cutomer-radio-form').forEach(function (e2) { e2.style.display = ''; });
					document.querySelectorAll('.vendor-radio-form, .myself-radio-form').forEach(function (e2) { e2.style.display = 'none'; });
				}
			});
		});

		document.querySelectorAll('.vendor-radio').forEach(function (el) {
			el.addEventListener('change', function () {
				if (this.checked) {
					document.querySelectorAll('.vendor-radio-form').forEach(function (e2) { e2.style.display = ''; });
					document.querySelectorAll('.cutomer-radio-form, .myself-radio-form').forEach(function (e2) { e2.style.display = 'none'; });
				}
			});
		});

		document.querySelectorAll('.myself-radio').forEach(function (el) {
			el.addEventListener('change', function () {
				if (this.checked) {
					document.querySelectorAll('.myself-radio-form').forEach(function (e2) { e2.style.display = ''; });
					document.querySelectorAll('.cutomer-radio-form, .vendor-radio-form').forEach(function (e2) { e2.style.display = 'none'; });
				}
			});
		});
	});

	// Choices
	function initChoices() {
		document.querySelectorAll('[data-choices]').forEach(function (item) {
			if (item.dataset.choicesInitialized || item.classList.contains('choices__input')) {
				return;
			}
			var config = {
				allowHTML: true
			};
			var attrs = item.attributes;

			if (attrs['data-choices-groups']) {
				config.placeholderValue = 'This is a placeholder set in the config';
			}
			if (attrs['data-choices-search-false']) {
				config.searchEnabled = false;
			}
			if (attrs['data-choices-search-true']) {
				config.searchEnabled = true;
			}
			if (attrs['data-choices-removeItem']) {
				config.removeItemButton = true;
			}
			if (attrs['data-choices-sorting-false']) {
				config.shouldSort = false;
			}
			if (attrs['data-choices-sorting-true']) {
				config.shouldSort = true;
			}
			if (attrs['data-choices-multiple-remove']) {
				config.removeItemButton = true;
			}
			if (attrs['data-choices-limit']) {
				config.maxItemCount = parseInt(attrs['data-choices-limit'].value);
			}
			if (attrs['data-choices-editItem-true']) {
				config.editItems = true;
			}
			if (attrs['data-choices-editItem-false']) {
				config.editItems = false;
			}
			if (attrs['data-choices-text-unique-true']) {
				config.duplicateItemsAllowed = false;
			}
			if (attrs['data-choices-text-disabled-true']) {
				config.addItems = false;
			}

			var instance;
			try {
				instance = new Choices(item, config);
			} catch (e) {
				return;
			}
			item.dataset.choicesInitialized = 'true';

			if (instance && attrs['data-choices-text-disabled-true']) {
				instance.disable();
			}
		});
	}

	// Call it when the DOM is ready
	document.addEventListener('DOMContentLoaded', initChoices);

})();

// Filter functions - defined globally for onclick access
function toggleFilterForm() {
	const emptyState = document.getElementById('filterEmptyState');
	const formState = document.getElementById('filterFormState');

	emptyState.classList.add('d-none');
	formState.classList.remove('d-none');
}

function removeFilterForm() {
	const emptyState = document.getElementById('filterEmptyState');
	const formState = document.getElementById('filterFormState');

	formState.classList.add('d-none');
	emptyState.classList.remove('d-none');
}

// Module card toggle functions
function toggleModule(element) {
	element.classList.toggle('active');
	const checkIcon = element.querySelector('.module-check');
	if (checkIcon) {
		if (element.classList.contains('active')) {
			checkIcon.classList.remove('d-none');
		} else {
			checkIcon.classList.add('d-none');
		}
	}
	updateSelectedCount();
}

function updateSelectedCount() {
	const activeModules = document.querySelectorAll('.module-card.active');
	const countElement = document.getElementById('selected-count');
	if (countElement) {
		countElement.textContent = activeModules.length;
	}

	// Show/hide select-fields and selected-filter based on active modules
	const selectFields = document.querySelector('.select-fields');
	const selectedFilter = document.querySelector('.selected-filter');

	if (selectFields && selectedFilter) {
		if (activeModules.length > 0) {
			selectFields.style.display = 'block';
			selectedFilter.style.display = 'block';
		} else {
			selectFields.style.display = 'none';
			selectedFilter.style.display = 'none';
		}
	}

	// Filter accordions based on selected modules
	const activeModuleNames = Array.from(activeModules).map(module => module.getAttribute('data-module'));
	const accordions = document.querySelectorAll('.accordion-item[data-accordion-module]');

	accordions.forEach(accordion => {
		const accordionModule = accordion.getAttribute('data-accordion-module');
		if (activeModuleNames.includes(accordionModule)) {
			accordion.style.display = 'block';
		} else {
			accordion.style.display = 'none';
		}
	});

	// Enable/disable action buttons based on active modules
	const btnSaveReport = document.getElementById('btnSaveReport');
	const btnGeneratePreview = document.getElementById('btnGeneratePreview');

	if (btnSaveReport && btnGeneratePreview) {
		if (activeModules.length > 0) {
			btnSaveReport.classList.remove('disabled');
			btnGeneratePreview.classList.remove('disabled');
		} else {
			btnSaveReport.classList.add('disabled');
			btnGeneratePreview.classList.add('disabled');
		}
	}
}
