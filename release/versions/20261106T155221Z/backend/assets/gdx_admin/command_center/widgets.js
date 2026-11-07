(function () {
    var node = document.getElementById("cc-dataset");
    if (!node) return;
    var data = JSON.parse(node.textContent);
    var state = { limit: 14, filter: "all" };
    var charts = [];

    function num(values) {
        return values.map(function (value) { return Number(value) || 0; });
    }

    function mean(values) {
        return values.reduce(function (sum, value) { return sum + value; }, 0) / (values.length || 1);
    }

    function deviation(values) {
        var mid = mean(values);
        return Math.sqrt(values.reduce(function (sum, value) { return sum + Math.pow(value - mid, 2); }, 0) / (values.length || 1));
    }

    function running(values) {
        var total = 0;
        return values.map(function (value) { total += value; return total; });
    }

    function keep(labels, values) {
        if (state.filter !== "above") return { labels: labels, values: values };
        var mid = mean(values);
        var nextLabels = [];
        var nextValues = [];
        values.forEach(function (value, index) {
            if (value >= mid) {
                nextLabels.push(labels[index]);
                nextValues.push(value);
            }
        });
        return nextLabels.length ? { labels: nextLabels, values: nextValues } : { labels: labels, values: values };
    }

    function categories() {
        return keep(data.labels.slice(), num(data.values));
    }

    function days() {
        var labels = (data.days.length ? data.days : data.labels).slice();
        var values = num(data.days.length ? data.dayValues : data.values);
        if (data.days.length) {
            labels = labels.slice(-state.limit);
            values = values.slice(-state.limit);
        }
        return { labels: labels, values: values };
    }

    function note(host, message) {
        var paragraph = document.createElement("p");
        paragraph.className = "cc-note";
        paragraph.textContent = message;
        host.appendChild(paragraph);
    }

    function shorten(label) {
        label = String(label);
        return label.length > 22 ? label.slice(0, 20) + "…" : label;
    }

    function capped(source, max) {
        if (source.labels.length <= max) return source;
        var items = source.labels.map(function (label, index) {
            return { label: label, value: source.values[index] };
        }).sort(function (a, b) { return b.value - a.value; });
        var head = items.slice(0, max - 1);
        var other = items.slice(max - 1).reduce(function (sum, item) { return sum + item.value; }, 0);
        return {
            labels: head.map(function (item) { return item.label; }).concat(["Other"]),
            values: head.map(function (item) { return item.value; }).concat([other]),
        };
    }

    function axis(labels, horizontal) {
        return {
            categories: labels.map(shorten),
            labels: {
                rotate: !horizontal && labels.length > 5 ? -35 : 0,
                rotateAlways: !horizontal && labels.length > 5,
                hideOverlappingLabels: true,
                trim: true,
                maxHeight: 72,
                style: { fontSize: "12px", colors: "#64758b" },
            },
        };
    }

    function palette() { return ["#5547ff", "#22a06b", "#d97706", "#8b7cff", "#0ea5e9"]; }

    function mount(host, options) {
        var target = document.createElement("div");
        host.appendChild(target);
        if (!window.ApexCharts) {
            note(host, "The chart library did not load.");
            return;
        }
        options.chart = Object.assign({ fontFamily: "inherit", parentHeightOffset: 0, toolbar: { show: false } }, options.chart || {});
        var chart = new window.ApexCharts(target, options);
        charts.push(chart);
        chart.render();
    }

    function base(type, labels, series, extra) {
        return Object.assign({
            chart: { type: type, height: 320, toolbar: { show: false }, fontFamily: "inherit" },
            series: series,
            xaxis: axis(labels, false),
            yaxis: { min: 0, forceNiceScale: true, labels: { style: { colors: "#64758b" } } },
            grid: { borderColor: "#eef2f6", strokeDashArray: 4 },
            colors: palette(),
            dataLabels: { enabled: false },
            legend: { show: series.length > 1, position: "bottom" },
        }, extra || {});
    }

    function pairs(labels, values) {
        return labels.map(function (label, index) {
            var current = values[index];
            var previous = index ? values[index - 1] : 0;
            return { x: label, y: [Math.min(previous, current), Math.max(previous, current)] };
        });
    }

    function bars(host, horizontal, stacked, full, useBreakdown) {
        var source = useBreakdown && data.breakdown && data.breakdown.labels && data.breakdown.labels.length
            ? { labels: data.breakdown.labels.slice(), values: num(data.breakdown.values) }
            : capped(categories(), 8);
        var series = [{ name: data.title, data: source.values }];
        if (stacked) series.push({ name: "Running total", data: running(source.values) });
        var height = horizontal ? Math.min(420, Math.max(220, source.labels.length * 52 + 48)) : 320;
        mount(host, base("bar", source.labels, series, {
            chart: { type: "bar", height: height, stacked: !!stacked, stackType: full ? "100%" : "normal", toolbar: { show: false } },
            xaxis: axis(source.labels, horizontal),
            plotOptions: { bar: { horizontal: !!horizontal, borderRadius: 6, barHeight: "58%", columnWidth: "42%" } },
            yaxis: horizontal
                ? { labels: { maxWidth: 180, style: { fontSize: "12px", colors: "#3d4d63" } } }
                : { min: 0, forceNiceScale: true, labels: { style: { colors: "#64758b" } } },
        }));
    }

    function trend(host, type, smooth) {
        var source = days();
        var peak = Math.max.apply(null, source.values.concat([0]));
        mount(host, base(type, source.labels, [{ name: "Requests", data: source.values }], {
            chart: { type: type, height: 300, toolbar: { show: false } },
            stroke: { curve: smooth ? "smooth" : "straight", width: 3 },
            markers: { size: source.labels.length > 20 ? 0 : 4, strokeWidth: 0 },
            fill: type === "area" ? { type: "gradient", gradient: { shadeIntensity: 0, opacityFrom: 0.28, opacityTo: 0.02, stops: [0, 100] } } : { opacity: 1 },
            yaxis: { min: 0, max: peak === 0 ? 4 : undefined, forceNiceScale: true, labels: { style: { colors: "#64758b" } } },
            xaxis: axis(source.labels, false),
        }));
    }

    function slices(host, type) {
        var source = capped(categories(), 6);
        mount(host, base(type, source.labels, source.values, {
            chart: { type: type, height: 320, toolbar: { show: false } },
            labels: source.labels.map(shorten),
            legend: { show: true, position: "bottom", fontSize: "13px" },
            plotOptions: { pie: { donut: { size: "68%" } } },
            dataLabels: { enabled: true },
            stroke: { width: 2, colors: ["#fff"] },
        }));
    }

    function htmlTable(host, headers, rows, onClick) {
        var table = document.createElement("table");
        table.className = "deploy-table";
        var head = document.createElement("thead");
        var headRow = document.createElement("tr");
        headers.forEach(function (header) {
            var cell = document.createElement("th");
            cell.textContent = header;
            headRow.appendChild(cell);
        });
        head.appendChild(headRow);
        var body = document.createElement("tbody");
        rows.forEach(function (row) {
            var line = document.createElement("tr");
            line.className = "cc-row";
            row.forEach(function (value) {
                var cell = document.createElement("td");
                cell.textContent = value;
                line.appendChild(cell);
            });
            if (onClick) line.addEventListener("click", function () { onClick(row, host); });
            body.appendChild(line);
        });
        table.appendChild(head);
        table.appendChild(body);
        host.appendChild(table);
    }

    function svgEl(name) { return document.createElementNS("http://www.w3.org/2000/svg", name); }

    function canvas(host) {
        var svg = svgEl("svg");
        svg.setAttribute("viewBox", "0 0 640 260");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "260");
        host.appendChild(svg);
        return svg;
    }

    function ranked() {
        var source = categories();
        return source.labels.map(function (label, index) {
            return { label: label, value: source.values[index] };
        }).sort(function (a, b) { return b.value - a.value; });
    }

    var renderers = {
        vertical_bar: function (host) { bars(host, false, false, false, false); },
        horizontal_bar: function (host) { bars(host, true, false, false, true); },
        grouped_bar: function (host) {
            var source = categories();
            mount(host, base("bar", source.labels, [
                { name: data.title, data: source.values },
                { name: "Running total", data: running(source.values) },
            ]));
        },
        stacked_bar: function (host) { bars(host, false, true, false); },
        stacked_bar_100: function (host) { bars(host, false, true, true); },
        range_bar: function (host) {
            var source = categories();
            note(host, "Each bar runs from the previous value to the current value.");
            mount(host, base("rangeBar", [], [{ name: data.title, data: pairs(source.labels, source.values) }]));
        },
        floating_bar: function (host) {
            var source = categories();
            note(host, "Each bar floats from 75% of the value to the value.");
            mount(host, base("rangeBar", [], [{
                data: source.labels.map(function (label, index) {
                    return { x: label, y: [source.values[index] * 0.75, source.values[index]] };
                }),
            }]));
        },
        line: function (host) { trend(host, "line", true); },
        multi_line: function (host) {
            var source = days();
            mount(host, base("line", source.labels, [
                { name: data.title, data: source.values },
                { name: "Running total", data: running(source.values) },
            ]));
        },
        step_line: function (host) {
            var source = days();
            mount(host, base("line", source.labels, [{ name: data.title, data: source.values }], { stroke: { curve: "stepline", width: 2 } }));
        },
        spline: function (host) {
            var source = days();
            mount(host, base("line", source.labels, [{ name: data.title, data: source.values }], { stroke: { curve: "smooth", width: 2 } }));
        },
        area_spline: function (host) {
            var source = days();
            mount(host, base("area", source.labels, [{ name: data.title, data: source.values }], { stroke: { curve: "smooth" } }));
        },
        area: function (host) { trend(host, "area", true); },
        stacked_area: function (host) {
            var source = days();
            mount(host, base("area", source.labels, [
                { name: data.title, data: source.values },
                { name: "Running total", data: running(source.values) },
            ], { chart: { type: "area", height: 280, stacked: true, toolbar: { show: false } } }));
        },
        stacked_area_100: function (host) {
            var source = days();
            mount(host, base("area", source.labels, [
                { name: data.title, data: source.values },
                { name: "Running total", data: running(source.values) },
            ], { chart: { type: "area", height: 280, stacked: true, stackType: "100%", toolbar: { show: false } } }));
        },
        stream: function (host) {
            var source = days();
            note(host, "The lower band mirrors half of each value so the stream stays centered.");
            mount(host, base("area", source.labels, [
                { name: "Center offset", data: source.values.map(function (value) { return -value / 2; }) },
                { name: data.title, data: source.values },
            ], { chart: { type: "area", height: 280, stacked: true, toolbar: { show: false } } }));
        },
        pie: function (host) { slices(host, "pie"); },
        donut: function (host) { slices(host, "donut"); },
        nested_donut: function (host) {
            var items = ranked().slice(0, 8);
            var svg = canvas(host);
            var total = items.reduce(function (sum, item) { return sum + item.value; }, 0) || 1;
            var angle = -Math.PI / 2;
            items.forEach(function (item, index) {
                var slice = (item.value / total) * Math.PI * 2;
                ring(svg, 320, 130, 88, 118, angle, angle + slice, palette()[index % 5]);
                ring(svg, 320, 130, 48, 76, angle, angle + slice / 2, palette()[(index + 2) % 5]);
                angle += slice;
            });
        },
        nightingale: function (host) { var source = categories(); mount(host, base("polarArea", source.labels, source.values, { labels: source.labels })); },
        candlestick: function (host) { candles(host); },
        ohlc: function (host) { candles(host); note(host, "Open is the previous point. Close is the current point."); },
        waterfall: function (host) {
            var source = categories();
            var deltas = source.values.map(function (value, index) { return index ? value - source.values[index - 1] : value; });
            mount(host, base("bar", source.labels, [{ name: "Change", data: deltas }]));
        },
        budget: function (host) {
            var source = categories();
            var average = mean(source.values);
            mount(host, base("bar", source.labels, [
                { name: "Actual", data: source.values },
                { name: "Average", data: source.values.map(function () { return average; }) },
            ]));
        },
        histogram: function (host) {
            var bins = bin(categories().values, 6);
            mount(host, base("bar", bins.labels, [{ name: "Count", data: bins.counts }]));
        },
        box_plot: function (host) {
            var stats = five(categories().values);
            mount(host, base("boxPlot", [], [{ name: data.title, data: [{ x: data.title, y: stats }] }]));
        },
        violin: function (host) { densityShape(host, bin(categories().values, 8)); },
        ridgeline: function (host) { ridges(host, ranked().slice(0, 6)); },
        scatter: function (host) { points(host, "scatter"); },
        bubble: function (host) { points(host, "bubble"); },
        hexbin: function (host) { grid(host, bin(categories().values, 5), "Count of values in each bin"); },
        correlation_matrix: function (host) { matrix(host); },
        heatmap: function (host) { heat(host, days()); },
        calendar_heatmap: function (host) { heat(host, days()); note(host, "Each cell is one recorded day."); },
        matrix_heatmap: function (host) { matrix(host); },
        density_heatmap: function (host) { heat(host, days()); },
        gauge: function (host) { radial(host, share()); },
        radial_gauge: function (host) { radial(host, share()); },
        progress_bar: function (host) { progress(host, share()); },
        circular_progress: function (host) { radial(host, share()); },
        kpi_scorecard: function (host) { cards(host); },
        bullet: function (host) {
            var source = categories();
            mount(host, base("bar", source.labels, [{ name: data.title, data: source.values }], {
                plotOptions: { bar: { horizontal: true } },
                annotations: { xaxis: [{ x: mean(source.values), borderColor: "#d97706", label: { text: "Average" } }] },
            }));
        },
        treemap: function (host) {
            var source = categories();
            mount(host, base("treemap", [], [{ data: source.labels.map(function (label, index) { return { x: label, y: Math.max(source.values[index], 0) }; }) }]));
        },
        sunburst: function (host) { packed(host, "sunburst"); },
        icicle: function (host) { packed(host, "icicle"); },
        circle_packing: function (host) { packed(host, "pack"); },
        radar: function (host) { var source = categories(); mount(host, base("radar", source.labels, [{ name: data.title, data: source.values }], { labels: source.labels })); },
        spider: function (host) { var source = categories(); mount(host, base("radar", source.labels, [{ name: data.title, data: source.values }], { labels: source.labels, stroke: { width: 2 }, markers: { size: 4 } })); },
        polar_area: function (host) { var source = categories(); mount(host, base("polarArea", source.labels, source.values, { labels: source.labels })); },
        parallel_coordinates: function (host) { parallel(host); },
        choropleth: function (host) { geo(host, "color"); },
        bubble_map: function (host) { geo(host, "bubble"); },
        marker_map: function (host) { geo(host, "marker"); },
        route_map: function (host) { geo(host, "route"); },
        geo_heat: function (host) { geo(host, "color"); },
        geo_treemap: function (host) { renderers.treemap(host); note(host, "Regions are the selected modules or pages. This data has no map coordinates."); },
        google_map: function (host) { googleMap(host); },
        timeline: function (host) { renderers.range_bar(host); },
        gantt: function (host) { renderers.range_bar(host); },
        milestone: function (host) { renderers.scatter(host); },
        roadmap: function (host) { renderers.horizontal_bar(host); },
        network: function (host) { graph(host, "circle"); },
        force_directed: function (host) { graph(host, "force"); },
        dependency: function (host) { graph(host, "tree"); },
        sankey: function (host) { flow(host, "sankey"); },
        chord: function (host) { graph(host, "chord"); },
        funnel: function (host) { funnel(host); },
        conversion_funnel: function (host) { funnel(host); },
        sankey_flow: function (host) { flow(host, "sankey"); },
        flow_diagram: function (host) { flow(host, "steps"); },
        control_chart: function (host) { control(host); },
        pareto: function (host) { pareto(host); },
        run_chart: function (host) { renderers.line(host); },
        qq_plot: function (host) { qq(host); },
        cohort: function (host) { cohort(host); },
        retention: function (host) { retention(host); },
        journey: function (host) { flow(host, "steps"); },
        forecast: function (host) { project(host, true); },
        trend: function (host) { project(host, false); },
        anomaly: function (host) { anomaly(host); },
        data_grid: function (host) { rows(host); },
        pivot: function (host) { cross(host, false); },
        cross_tab: function (host) { cross(host, true); },
        drilldown: function (host) { drill(host); },
        summary_table: function (host) { summary(host); },
        kpi_cards: function (host) { cards(host); },
        metrics_cards: function (host) { cards(host); },
        leaderboard: function (host) {
            htmlTable(host, ["Rank", "Item", "Value"], ranked().slice(0, 8).map(function (item, index) {
                return [String(index + 1), item.label, String(item.value)];
            }));
        },
        activity_feed: function (host) {
            var items = data.activity.length ? data.activity : [{ label: "No recorded builds", detail: "" }];
            htmlTable(host, ["Activity", "Result"], items.map(function (item) { return [item.label, item.detail]; }));
        },
        alert_panel: function (host) {
            htmlTable(host, ["Check", "State", "Detail"], (data.alerts.length ? data.alerts : [{ name: "Platform", state: "ok", detail: "No checks" }]).map(function (item) {
                return [item.name, item.state, item.detail];
            }));
        },
        filters: function (host) {
            var select = document.createElement("select");
            [["all", "All values"], ["above", "At or above average"]].forEach(function (choice) {
                var option = document.createElement("option");
                option.value = choice[0];
                option.textContent = choice[1];
                option.selected = state.filter === choice[0];
                select.appendChild(option);
            });
            select.addEventListener("change", function () { state.filter = select.value; rerender(); });
            host.appendChild(select);
            note(host, "Filters the charts on this dashboard.");
        },
        date_range: function (host) {
            var select = document.createElement("select");
            [["14", "Last 14 days"], ["7", "Last 7 days"]].forEach(function (choice) {
                var option = document.createElement("option");
                option.value = choice[0];
                option.textContent = choice[1];
                option.selected = String(state.limit) === choice[0];
                select.appendChild(option);
            });
            select.addEventListener("change", function () { state.limit = Number(select.value); rerender(); });
            host.appendChild(select);
            note(host, "Limits line, area, and calendar charts to the selected days.");
        },
        drilldown_widget: function (host) { drill(host); },
        export_widget: function (host) {
            var button = document.createElement("button");
            button.type = "button";
            button.textContent = "Download CSV";
            button.addEventListener("click", download);
            host.appendChild(button);
        },
        search_panel: function (host) {
            var input = document.createElement("input");
            input.type = "search";
            input.placeholder = "Search tables on this page";
            input.addEventListener("input", function () {
                var query = input.value.toLowerCase();
                document.querySelectorAll(".cc-row").forEach(function (row) {
                    row.hidden = !!query && row.textContent.toLowerCase().indexOf(query) === -1;
                });
            });
            host.appendChild(input);
        },
    };

    function share() {
        var source = categories();
        var total = source.values.reduce(function (sum, value) { return sum + value; }, 0) || 1;
        return Math.round(Math.max.apply(null, source.values.concat([0])) / total * 100);
    }

    function radial(host, percent) {
        mount(host, { chart: { type: "radialBar", height: 280 }, series: [percent], labels: [data.title], colors: ["#5547ff"] });
    }

    function progress(host, percent) {
        var bar = document.createElement("div");
        bar.className = "deploy-bar";
        var fill = document.createElement("span");
        fill.style.width = percent + "%";
        bar.appendChild(fill);
        host.appendChild(bar);
        note(host, percent + "% of the total is in the largest item.");
    }

    function cards(host) {
        var wrap = document.createElement("div");
        wrap.className = "deploy-grid";
        (data.metrics.length ? data.metrics : [{ label: data.title, value: 0 }]).forEach(function (metric) {
            var card = document.createElement("article");
            card.className = "deploy-metric";
            var label = document.createElement("span");
            label.textContent = metric.label;
            var strong = document.createElement("strong");
            strong.textContent = metric.value;
            card.appendChild(label);
            card.appendChild(strong);
            wrap.appendChild(card);
        });
        host.appendChild(wrap);
    }

    function candles(host) {
        var source = days();
        mount(host, base("candlestick", [], [{
            data: source.labels.map(function (label, index) {
                var close = source.values[index];
                var open = index ? source.values[index - 1] : close;
                return { x: label, y: [open, Math.max(open, close), Math.min(open, close), close] };
            }),
        }]));
    }

    function bin(values, count) {
        var low = Math.min.apply(null, values.concat([0]));
        var high = Math.max.apply(null, values.concat([1]));
        var step = (high - low) / count || 1;
        var counts = [];
        var labels = [];
        for (var index = 0; index < count; index += 1) {
            counts.push(0);
            labels.push(String(Math.round((low + step * index) * 10) / 10));
        }
        values.forEach(function (value) {
            var slot = Math.min(count - 1, Math.max(0, Math.floor((value - low) / step)));
            counts[slot] += 1;
        });
        return { labels: labels, counts: counts };
    }

    function five(values) {
        var sorted = values.slice().sort(function (a, b) { return a - b; });
        function pick(ratio) { return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))] || 0; }
        return [sorted[0] || 0, pick(0.25), pick(0.5), pick(0.75), sorted[sorted.length - 1] || 0];
    }

    function densityShape(host, bins) {
        var svg = canvas(host);
        var peak = Math.max.apply(null, bins.counts.concat([1]));
        var mid = 130;
        bins.counts.forEach(function (count, index) {
            var width = (count / peak) * 90;
            var y = 20 + index * 28;
            var rect = svgEl("rect");
            rect.setAttribute("x", 320 - width);
            rect.setAttribute("y", y);
            rect.setAttribute("width", width * 2);
            rect.setAttribute("height", 18);
            rect.setAttribute("rx", 9);
            rect.setAttribute("fill", "#5547ff");
            svg.appendChild(rect);
        });
        note(host, "The shape is the distribution of values in this scope.");
    }

    function ridges(host, items) {
        var svg = canvas(host);
        items.forEach(function (item, index) {
            var y = 36 + index * 36;
            var width = Math.max(8, item.value / (Math.max.apply(null, items.map(function (row) { return row.value; }).concat([1]))) * 420);
            var path = svgEl("path");
            path.setAttribute("d", "M40 " + y + " Q " + (40 + width / 2) + " " + (y - 24) + " " + (40 + width) + " " + y);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", palette()[index % 5]);
            path.setAttribute("stroke-width", "3");
            svg.appendChild(path);
            var label = svgEl("text");
            label.setAttribute("x", "40");
            label.setAttribute("y", y + 14);
            label.setAttribute("font-size", "11");
            label.setAttribute("fill", "#64758b");
            label.textContent = item.label;
            svg.appendChild(label);
        });
    }

    function points(host, type) {
        var source = categories();
        var series = source.values.map(function (value, index) {
            return type === "bubble" ? [index + 1, value, Math.max(value, 1)] : [index + 1, value];
        });
        mount(host, base(type, [], [{ name: data.title, data: series }]));
    }

    function grid(host) {
        var source = bin(categories().values, 5);
        mount(host, base("heatmap", [], [{ name: "Bin", data: source.labels.map(function (label, index) { return { x: label, y: source.counts[index] }; }) }]));
    }

    function heat(host, source) {
        mount(host, base("heatmap", [], [{ name: data.title, data: source.labels.map(function (label, index) { return { x: label, y: source.values[index] }; }) }]));
    }

    function matrix(host) {
        var source = categories();
        var total = running(source.values);
        var rows = [
            { name: "Value", data: source.labels.map(function (label, index) { return { x: label, y: source.values[index] }; }) },
            { name: "Running total", data: source.labels.map(function (label, index) { return { x: label, y: total[index] }; }) },
        ];
        mount(host, base("heatmap", [], rows));
    }

    function ring(svg, cx, cy, inner, outer, start, end, color) {
        var large = end - start > Math.PI ? 1 : 0;
        var a = [cx + Math.cos(start) * outer, cy + Math.sin(start) * outer];
        var b = [cx + Math.cos(end) * outer, cy + Math.sin(end) * outer];
        var c = [cx + Math.cos(end) * inner, cy + Math.sin(end) * inner];
        var d = [cx + Math.cos(start) * inner, cy + Math.sin(start) * inner];
        var path = svgEl("path");
        path.setAttribute("d", "M " + a[0] + " " + a[1] + " A " + outer + " " + outer + " 0 " + large + " 1 " + b[0] + " " + b[1] + " L " + c[0] + " " + c[1] + " A " + inner + " " + inner + " 0 " + large + " 0 " + d[0] + " " + d[1] + " Z");
        path.setAttribute("fill", color);
        svg.appendChild(path);
    }

    function packed(host, mode) {
        var items = ranked().slice(0, 8);
        var svg = canvas(host);
        if (mode === "icicle") {
            var width = 560 / (items.length || 1);
            items.forEach(function (item, index) {
                var rect = svgEl("rect");
                rect.setAttribute("x", 40 + index * width);
                rect.setAttribute("y", 40);
                rect.setAttribute("width", width - 6);
                rect.setAttribute("height", 40 + item.value);
                rect.setAttribute("fill", palette()[index % 5]);
                svg.appendChild(rect);
            });
            return;
        }
        if (mode === "pack") {
            var x = 70;
            items.forEach(function (item, index) {
                var radius = 12 + Math.min(item.value, 40);
                var circle = svgEl("circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", 120);
                circle.setAttribute("r", radius);
                circle.setAttribute("fill", palette()[index % 5]);
                svg.appendChild(circle);
                x += radius * 2 + 8;
            });
            return;
        }
        var total = items.reduce(function (sum, item) { return sum + item.value; }, 0) || 1;
        var angle = -Math.PI / 2;
        items.forEach(function (item, index) {
            var slice = item.value / total * Math.PI * 2;
            ring(svg, 320, 130, 36, 110, angle, angle + slice, palette()[index % 5]);
            angle += slice;
        });
    }

    function parallel(host) {
        var source = categories();
        var total = running(source.values);
        var axes = [source.values.map(function (_, index) { return index + 1; }), source.values, total];
        var svg = canvas(host);
        [80, 320, 560].forEach(function (x) {
            var line = svgEl("line");
            line.setAttribute("x1", x); line.setAttribute("x2", x); line.setAttribute("y1", 20); line.setAttribute("y2", 220);
            line.setAttribute("stroke", "#d7deea");
            svg.appendChild(line);
        });
        source.labels.forEach(function (_, index) {
            var path = svgEl("polyline");
            var coords = axes.map(function (axis, axisIndex) {
                var peak = Math.max.apply(null, axis.concat([1]));
                return (80 + axisIndex * 240) + "," + (220 - (axis[index] / peak) * 180);
            }).join(" ");
            path.setAttribute("points", coords);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "#5547ff");
            svg.appendChild(path);
        });
        note(host, "Axes are order, value, and running total.");
    }

    function googleMap(host) {
        var places = (data.places || []).filter(function (place) {
            return place.latitude != null && place.longitude != null && Number(place.value) > 0;
        });
        var world = data.mapView === "world";
        var options = { world: world, bubbles: data.mapBubbles === true };
        if (!places.length && data.mapKey && !world) note(host, "No visitor states are saved on profiles yet.");
        if (data.mapKey) {
            var target = document.createElement("div");
            target.className = "cc-map";
            host.appendChild(target);
            loadGoogle(data.mapKey, function (failed) {
                if (failed || !(window.google && window.google.maps)) {
                    host.removeChild(target);
                    streetMap(host, places, options);
                    return;
                }
                var map = new window.google.maps.Map(target, {
                    center: world
                        ? (places.length ? { lat: Number(places[0].latitude), lng: Number(places[0].longitude) } : { lat: 20, lng: 0 })
                        : (places.length ? { lat: Number(places[0].latitude), lng: Number(places[0].longitude) } : { lat: 39.8283, lng: -98.5795 }),
                    zoom: world ? 2 : 4,
                    mapTypeControl: false,
                    streetViewControl: false,
                });
                if (!places.length) return;
                var peak = places.reduce(function (max, place) { return Math.max(max, Number(place.value) || 0); }, 1);
                var bounds = new window.google.maps.LatLngBounds();
                places.forEach(function (place) {
                    var position = { lat: Number(place.latitude), lng: Number(place.longitude) };
                    bounds.extend(position);
                    var marker = new window.google.maps.Marker({
                        position: position,
                        map: map,
                        title: place.label + " · " + place.value + " " + (place.unit || "visitors"),
                        icon: options.bubbles ? {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8 + (Number(place.value) / peak) * 16,
                            fillColor: "#1a73e8",
                            fillOpacity: 0.72,
                            strokeWeight: 0,
                        } : undefined,
                    });
                    var info = new window.google.maps.InfoWindow({
                        content: "<strong>" + escapeHtml(place.label) + "</strong><br>" + escapeHtml(place.value) + " " + escapeHtml(place.unit || "visitors"),
                    });
                    marker.addListener("click", function () { info.open({ anchor: marker, map: map }); });
                });
                if (!world && places.length > 1) map.fitBounds(bounds);
            });
            return;
        }
        streetMap(host, places, options);
    }

    var googleQueue = [];
    var googleLoading = false;

    function loadGoogle(key, done) {
        if (window.google && window.google.maps) { done(); return; }
        googleQueue.push(done);
        if (googleLoading) return;
        googleLoading = true;
        var script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key);
        script.async = true;
        script.onload = function () { googleQueue.splice(0).forEach(function (fn) { fn(); }); };
        script.onerror = function () { googleQueue.splice(0).forEach(function (fn) { fn(true); }); };
        document.head.appendChild(script);
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
        });
    }

    function mapPoint(latitude, longitude, zoom) {
        var sine = Math.sin(latitude * Math.PI / 180);
        var scale = 256 * Math.pow(2, zoom);
        return {
            x: (longitude + 180) / 360 * scale,
            y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale,
        };
    }

    function streetMap(host, places, options) {
        options = options || {};
        if (!options.world) {
            note(host, places.length ? "Visitors are grouped by the state on their profile." : "No visitor states are saved on profiles yet. Set GOOGLE_MAPS_API_KEY to open this on Google Maps.");
        }
        var zoom = options.world ? 2 : 4;
        var center = options.world
            ? (places.length ? { lat: Number(places[0].latitude), lng: Number(places[0].longitude) } : { lat: 20, lng: 0 })
            : (places.length
                ? places.reduce(function (sum, place) {
                    return { lat: sum.lat + Number(place.latitude), lng: sum.lng + Number(place.longitude) };
                }, { lat: 0, lng: 0 })
                : { lat: 39.8283, lng: -98.5795 });
        if (!options.world && places.length) {
            center.lat /= places.length;
            center.lng /= places.length;
        }
        var frame = document.createElement("div");
        frame.className = "cc-map";
        var zoomBox = document.createElement("div");
        zoomBox.className = "cc-map-zoom";
        ["+", "−"].forEach(function (symbol, index) {
            var button = document.createElement("button");
            button.type = "button";
            button.textContent = symbol;
            button.addEventListener("click", function () {
                zoom = Math.min(12, Math.max(options.world ? 1 : 3, zoom + (index === 0 ? 1 : -1)));
                draw();
            });
            zoomBox.appendChild(button);
        });
        frame.appendChild(zoomBox);
        host.appendChild(frame);
        var drag = null;
        frame.addEventListener("pointerdown", function (event) {
            drag = { x: event.clientX, y: event.clientY, lat: center.lat, lng: center.lng };
            frame.setPointerCapture(event.pointerId);
        });
        frame.addEventListener("pointermove", function (event) {
            if (!drag) return;
            var scale = 256 * Math.pow(2, zoom);
            center.lng = drag.lng - (event.clientX - drag.x) / scale * 360;
            var start = mapPoint(drag.lat, drag.lng, zoom);
            var nextY = start.y + (event.clientY - drag.y);
            var mercator = Math.PI * (1 - 2 * nextY / scale);
            center.lat = Math.max(-80, Math.min(80, Math.atan(Math.sinh(mercator)) * 180 / Math.PI));
            draw();
        });
        frame.addEventListener("pointerup", function () { drag = null; });

        function draw() {
            Array.prototype.slice.call(frame.querySelectorAll("img, .cc-map-pin, .cc-map-credit")).forEach(function (node) { node.remove(); });
            var width = frame.clientWidth || 640;
            var height = frame.clientHeight || 360;
            var scale = 256 * Math.pow(2, zoom);
            var origin = mapPoint(center.lat, center.lng, zoom);
            var left = origin.x - width / 2;
            var top = origin.y - height / 2;
            var max = Math.pow(2, zoom);
            var xStart = Math.floor(left / 256);
            var yStart = Math.floor(top / 256);
            var xEnd = Math.floor((left + width) / 256);
            var yEnd = Math.floor((top + height) / 256);
            for (var x = xStart; x <= xEnd; x += 1) {
                for (var y = yStart; y <= yEnd; y += 1) {
                    if (y < 0 || y >= max) continue;
                    var tile = document.createElement("img");
                    var wrapped = ((x % max) + max) % max;
                    tile.alt = "";
                    tile.src = "https://tile.openstreetmap.org/" + zoom + "/" + wrapped + "/" + y + ".png";
                    tile.style.left = (x * 256 - left) + "px";
                    tile.style.top = (y * 256 - top) + "px";
                    frame.appendChild(tile);
                }
            }
            var peak = places.reduce(function (max, place) { return Math.max(max, Number(place.value) || 0); }, 1);
            places.forEach(function (place) {
                var point = mapPoint(Number(place.latitude), Number(place.longitude), zoom);
                var pin = document.createElement("button");
                pin.type = "button";
                pin.className = options.bubbles ? "cc-map-pin cc-map-bubble" : "cc-map-pin";
                var size = options.bubbles ? 18 + (Number(place.value) / peak) * 34 : 12;
                pin.style.width = size + "px";
                pin.style.height = size + "px";
                pin.style.marginLeft = (-size / 2) + "px";
                pin.style.marginTop = (-size / 2) + "px";
                pin.style.left = (point.x - left) + "px";
                pin.style.top = (point.y - top) + "px";
                pin.title = place.label + " · " + place.value + " " + (place.unit || "visitors");
                frame.appendChild(pin);
            });
            var credit = document.createElement("a");
            credit.className = "cc-map-credit";
            credit.href = "https://www.openstreetmap.org/copyright";
            credit.target = "_blank";
            credit.rel = "noopener";
            credit.textContent = "OpenStreetMap";
            frame.appendChild(credit);
        }
        draw();
    }

    function geo(host, mode) {
        note(host, "Regions are the selected modules or pages. This data has no map coordinates.");
        var items = ranked().slice(0, 12);
        var svg = canvas(host);
        var peak = Math.max.apply(null, items.map(function (item) { return item.value; }).concat([1]));
        items.forEach(function (item, index) {
            var column = index % 4;
            var row = Math.floor(index / 4);
            var x = 40 + column * 150;
            var y = 30 + row * 74;
            if (mode === "bubble" || mode === "marker") {
                var mark = svgEl("circle");
                mark.setAttribute("cx", x + 40);
                mark.setAttribute("cy", y + 24);
                mark.setAttribute("r", mode === "marker" ? 8 : 8 + (item.value / peak) * 22);
                mark.setAttribute("fill", "#5547ff");
                svg.appendChild(mark);
            } else {
                var rect = svgEl("rect");
                rect.setAttribute("x", x);
                rect.setAttribute("y", y);
                rect.setAttribute("width", 120);
                rect.setAttribute("height", 48);
                rect.setAttribute("rx", 8);
                rect.setAttribute("fill", "rgba(85,71,255," + (0.2 + item.value / peak * 0.8) + ")");
                svg.appendChild(rect);
            }
            if (mode === "route" && index) {
                var line = svgEl("line");
                var previous = index - 1;
                line.setAttribute("x1", 40 + (previous % 4) * 150 + 60);
                line.setAttribute("y1", 30 + Math.floor(previous / 4) * 74 + 24);
                line.setAttribute("x2", x + 60);
                line.setAttribute("y2", y + 24);
                line.setAttribute("stroke", "#5547ff");
                svg.appendChild(line);
            }
        });
    }

    function graph(host, mode) {
        var items = ranked().slice(0, 8);
        var svg = canvas(host);
        var positions = items.map(function (item, index) {
            var angle = mode === "tree" ? 0 : (index / items.length) * Math.PI * 2;
            var radius = mode === "force" ? 40 + (item.value % 70) : 90;
            return mode === "tree"
                ? [index ? 180 + (index % 3) * 140 : 320, index ? 70 + Math.floor(index / 3) * 80 : 130]
                : [320 + Math.cos(angle) * radius, 130 + Math.sin(angle) * radius];
        });
        items.forEach(function (_, index) {
            var target = mode === "tree" ? 0 : (index + 1) % items.length;
            if (mode === "tree" && index === 0) return;
            var line = svgEl("line");
            line.setAttribute("x1", positions[index][0]);
            line.setAttribute("y1", positions[index][1]);
            line.setAttribute("x2", positions[target][0]);
            line.setAttribute("y2", positions[target][1]);
            line.setAttribute("stroke", "#c4b8ff");
            svg.appendChild(line);
        });
        positions.forEach(function (position, index) {
            var circle = svgEl("circle");
            circle.setAttribute("cx", position[0]);
            circle.setAttribute("cy", position[1]);
            circle.setAttribute("r", mode === "chord" ? 18 : 14);
            circle.setAttribute("fill", palette()[index % 5]);
            svg.appendChild(circle);
        });
    }

    function flow(host, mode) {
        var items = ranked().slice(0, 5);
        if (mode === "sankey") {
            var svg = canvas(host);
            items.forEach(function (item, index) {
                var y = 24 + index * 46;
                var path = svgEl("path");
                path.setAttribute("d", "M 40 " + y + " C 240 " + y + ", 400 120, 560 120");
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", palette()[index % 5]);
                path.setAttribute("stroke-width", Math.max(2, Math.min(item.value, 18)));
                svg.appendChild(path);
            });
            return;
        }
        htmlTable(host, ["Step", "Item", "Value"], items.map(function (item, index) {
            return [String(index + 1), item.label, String(item.value)];
        }));
    }

    function funnel(host) {
        var items = ranked();
        var peak = items[0] ? items[0].value : 1;
        var svg = canvas(host);
        items.slice(0, 6).forEach(function (item, index) {
            var width = 80 + (item.value / (peak || 1)) * 360;
            var rect = svgEl("rect");
            rect.setAttribute("x", 320 - width / 2);
            rect.setAttribute("y", 16 + index * 40);
            rect.setAttribute("width", width);
            rect.setAttribute("height", 28);
            rect.setAttribute("rx", 6);
            rect.setAttribute("fill", palette()[index % 5]);
            svg.appendChild(rect);
        });
    }

    function control(host) {
        var source = days();
        var mid = mean(source.values);
        var spread = deviation(source.values);
        mount(host, base("line", source.labels, [
            { name: data.title, data: source.values },
            { name: "Mean", data: source.values.map(function () { return mid; }) },
            { name: "Upper", data: source.values.map(function () { return mid + spread * 3; }) },
            { name: "Lower", data: source.values.map(function () { return mid - spread * 3; }) },
        ]));
    }

    function pareto(host) {
        var items = ranked();
        var total = items.reduce(function (sum, item) { return sum + item.value; }, 0) || 1;
        var cumulative = 0;
        mount(host, base("line", items.map(function (item) { return item.label; }), [
            { name: "Value", type: "column", data: items.map(function (item) { return item.value; }) },
            { name: "Cumulative %", type: "line", data: items.map(function (item) { cumulative += item.value; return Math.round(cumulative / total * 100); }) },
        ]));
    }

    function qq(host) {
        var sorted = categories().values.slice().sort(function (a, b) { return a - b; });
        var mid = mean(sorted);
        var spread = deviation(sorted) || 1;
        mount(host, base("scatter", [], [{
            name: "Observed",
            data: sorted.map(function (value, index) {
                var probability = (index + 0.5) / sorted.length;
                var quantile = mid + spread * (probability - 0.5) * 3;
                return [quantile, value];
            }),
        }]));
        note(host, "Observed values against an even spread of the same values.");
    }

    function cohort(host) {
        var source = days();
        note(host, "Only the observed day is filled. Later periods are not in this data.");
        htmlTable(host, ["Day", "Observed"], source.labels.map(function (label, index) {
            return [label, String(source.values[index])];
        }));
    }

    function retention(host) {
        var source = days();
        var first = source.values[0] || 0;
        var series = first ? source.values.map(function (value) { return Math.round(value / first * 100); }) : source.values;
        if (!first) note(host, "The first day is 0, so this line is the daily total.");
        mount(host, base("line", source.labels, [{ name: first ? "Index" : data.title, data: series }]));
    }

    function project(host, futureOnly) {
        var source = days();
        var count = source.values.length || 1;
        var midX = (count - 1) / 2;
        var midY = mean(source.values);
        var slope = source.values.reduce(function (sum, value, index) { return sum + (index - midX) * (value - midY); }, 0) / (source.values.reduce(function (sum, _, index) { return sum + Math.pow(index - midX, 2); }, 0) || 1);
        var labels = source.labels.slice();
        var actual = futureOnly ? source.values.slice() : source.values.map(function (_, index) { return midY + slope * (index - midX); });
        var forecast = source.values.map(function () { return null; });
        for (var step = 1; step <= 3; step += 1) {
            labels.push("+" + step);
            actual.push(null);
            forecast.push(midY + slope * (count - 1 + step - midX));
        }
        forecast[count - 1] = source.values[count - 1];
        mount(host, base("line", labels, [
            { name: futureOnly ? data.title : "Trend", data: futureOnly ? actual : source.values.map(function (_, index) { return midY + slope * (index - midX); }) },
            { name: "Projection", data: forecast },
        ], { stroke: { dashArray: [0, 6], width: 2 } }));
        note(host, "The projection continues the straight line through these points.");
    }

    function anomaly(host) {
        var source = days();
        var mid = mean(source.values);
        var spread = deviation(source.values);
        var flagged = source.values.filter(function (value) { return Math.abs(value - mid) > spread * 2; });
        mount(host, base("line", source.labels, [{ name: data.title, data: source.values }]));
        note(host, flagged.length ? flagged.length + " point(s) sit more than two standard deviations from the mean." : "No point is more than two standard deviations from the mean.");
    }

    function rows(host) {
        var source = categories();
        htmlTable(host, ["Item", "Value"], source.labels.map(function (label, index) { return [label, String(source.values[index])]; }));
    }

    function cross(host, withTotal) {
        var source = categories();
        var total = running(source.values);
        var body = source.labels.map(function (label, index) { return [label, String(source.values[index]), String(total[index])]; });
        if (withTotal) body.push(["Total", String(source.values.reduce(function (sum, value) { return sum + value; }, 0)), ""]);
        htmlTable(host, ["Item", "Value", "Running total"], body);
    }

    function drill(host) {
        var detail = document.createElement("p");
        detail.className = "cc-note";
        detail.textContent = "Select a row.";
        rows(host);
        host.querySelectorAll(".cc-row").forEach(function (row) {
            row.addEventListener("click", function () {
                detail.textContent = row.children[0].textContent + ": " + row.children[1].textContent;
            });
        });
        host.appendChild(detail);
    }

    function summary(host) {
        var source = categories();
        htmlTable(host, ["Measure", "Value"], [
            ["Items", String(source.values.length)],
            ["Total", String(source.values.reduce(function (sum, value) { return sum + value; }, 0))],
            ["Average", String(Math.round(mean(source.values) * 100) / 100)],
        ]);
    }

    function download() {
        var source = categories();
        var lines = ["Item,Value"].concat(source.labels.map(function (label, index) {
            return '"' + String(label).replace(/"/g, '""') + '",' + source.values[index];
        }));
        var link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
        link.download = "command-center.csv";
        link.click();
    }

    function renderWidget(widget) {
        var body = widget.querySelector(".cc-widget-body");
        var type = widget.getAttribute("data-element");
        body.innerHTML = "";
        (renderers[type] || function (host) { note(host, "This element is not available."); })(body);
    }

    function rerender() {
        charts.splice(0).forEach(function (chart) { chart.destroy(); });
        document.querySelectorAll("[data-element]").forEach(renderWidget);
    }

    rerender();
}());
