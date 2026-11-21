(function () {
    var node = document.getElementById("cc-operations");
    if (!node || !window.ApexCharts) return;
    var report = JSON.parse(node.textContent);
    var colors = ["#1a73e8", "#5547ff", "#8ab4f8", "#174ea6", "#22a06b", "#d97706", "#64758b"];

    function number(value) {
        var parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function rowsOf(column) {
        return (column.rows || []).map(function (row) {
            return { label: String(row.label || ""), value: number(row.value) };
        });
    }

    function empty(host, column) {
        var note = document.createElement("p");
        note.className = "cc-note";
        note.textContent = column.empty || "No records.";
        host.replaceWith(note);
    }

    function mount(host, options) {
        options.chart = Object.assign({
            fontFamily: "inherit",
            parentHeightOffset: 0,
            toolbar: { show: false },
            animations: { enabled: true },
        }, options.chart || {});
        options.colors = options.colors || colors;
        options.grid = options.grid || {
            borderColor: "#eef2f6",
            strokeDashArray: 4,
            padding: { top: 0, right: 8, bottom: 0, left: 0 },
        };
        options.tooltip = { theme: "light" };
        new window.ApexCharts(host, options).render();
    }

    function draw(host, column) {
        var rows = rowsOf(column);
        var kind = column.chart || "bar";
        if (kind === "donut") kind = "column";
        if (kind !== "line" && kind !== "area") {
            var nonzero = rows.filter(function (row) { return row.value > 0; });
            if (nonzero.length) rows = nonzero;
        }
        var keepZeros = kind === "area" || kind === "column" || kind === "line";
        if (!rows.length || (!keepZeros && !rows.some(function (row) { return row.value > 0; }))) {
            empty(host, column);
            return;
        }
        var labels = rows.map(function (row) { return row.label; });
        var values = rows.map(function (row) { return row.value; });
        var horizontal = kind === "bar";
        var height = horizontal ? Math.max(88, labels.length * 32 + 24) : (labels.length > 8 ? 210 : 168);
        var columnWidth = labels.length <= 2 ? "16%" : labels.length <= 6 ? "32%" : "48%";
        var chartType = kind === "area" || kind === "line" ? kind : "bar";
        mount(host, {
            chart: { type: chartType, height: height },
            series: [{ name: column.title, data: values }],
            xaxis: {
                categories: labels,
                labels: { style: { colors: "#64758b", fontSize: "12px" }, rotate: horizontal ? 0 : -35, hideOverlappingLabels: true },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: horizontal
                ? { labels: { style: { colors: "#3d4d63", fontSize: "12px" }, maxWidth: 180 } }
                : { min: 0, forceNiceScale: true, labels: { style: { colors: "#64758b" } } },
            plotOptions: { bar: { horizontal: horizontal, borderRadius: 4, columnWidth: columnWidth, barHeight: "70%" } },
            stroke: { curve: "smooth", width: kind === "area" || kind === "line" ? 2 : 0 },
            markers: { size: kind === "line" ? 3 : 0 },
            fill: kind === "area"
                ? { type: "gradient", gradient: { shadeIntensity: 0, opacityFrom: 0.28, opacityTo: 0.02, stops: [0, 100] } }
                : { opacity: 1 },
            dataLabels: { enabled: false },
            colors: [kind === "bar" ? "#174ea6" : kind === "column" ? "#5547ff" : "#1a73e8"],
            legend: { show: false },
        });
    }

    document.querySelectorAll(".cc-chart").forEach(function (host) {
        var section = report.sections[Number(host.getAttribute("data-section"))];
        var column = section && section.columns[Number(host.getAttribute("data-column"))];
        if (column) draw(host, column);
    });
}());
