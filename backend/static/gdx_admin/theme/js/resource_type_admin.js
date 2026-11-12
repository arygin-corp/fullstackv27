(function () {
  function selectedKind() {
    var select = document.getElementById("id_type");
    if (!select || select.selectedIndex < 0) {
      return "";
    }
    return (select.options[select.selectedIndex].text || "").trim().toLowerCase();
  }

  function row(name) {
    return document.querySelector(".form-row.field-" + name) || document.querySelector(".field-" + name);
  }

  function toggle() {
    var api = selectedKind() === "api";
    ["original_name", "query"].forEach(function (name) {
      var field = row(name);
      if (field) {
        field.style.display = api ? "" : "none";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var select = document.getElementById("id_type");
    if (select) {
      select.addEventListener("change", toggle);
    }
    toggle();
  });
})();
