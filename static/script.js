/* ---------- CUSTOM CURSOR ---------- */
const cursor = document.querySelector(".cursor");
document.addEventListener("mousemove", e => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
});

/* ---------- ELEMENT REFERENCES ---------- */
const selected = {};

const weight = document.getElementById("weight");
const screen_size = document.getElementById("screen_size");
const touchscreen = document.getElementById("touchscreen");
const ips = document.getElementById("ips");
const resolution = document.getElementById("resolution");
const hdd = document.getElementById("hdd");
const ssd = document.getElementById("ssd");
const result = document.getElementById("result");

/* ---------- FETCH DROPDOWN OPTIONS ---------- */
fetch("/options")
    .then(res => res.json())
    .then(data => {
        initDropdown("company", data.company);
        initDropdown("type", data.type);
        initDropdown("cpu", data.cpu);
        initDropdown("gpu", data.gpu);
        initDropdown("os", data.os);
        initDropdown("ram", data.ram);
    });

/* ---------- DROPDOWN INITIALIZER ---------- */
function initDropdown(name, values) {
    const dropdown = document.querySelector(`.dropdown[data-name="${name}"]`);
    const btn = dropdown.querySelector(".dropdown-btn");
    const menu = dropdown.querySelector(".dropdown-menu");

    values.forEach(v => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = v;

        // 🔥 IMPORTANT: stop propagation
        item.onclick = (e) => {
            e.stopPropagation();
            btn.textContent = v;
            btn.style.color = "#e5e7eb";
            selected[name] = v;
            dropdown.classList.remove("open");
        };

        menu.appendChild(item);
    });

    // 🔥 IMPORTANT: stop propagation
    btn.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
        dropdown.classList.toggle("open");
    };
}

/* ---------- CLOSE DROPDOWNS ON OUTSIDE CLICK ---------- */
document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
});

/* ---------- PREDICTION ---------- */
function predict() {
    if (
        !selected.company ||
        !selected.type ||
        !selected.cpu ||
        !selected.gpu ||
        !selected.os ||
        !selected.ram
    ) {
        alert("Please select all dropdown values");
        return;
    }

    if (!weight.value || !screen_size.value) {
        alert("Please enter weight and screen size");
        return;
    }

    const payload = {
        company: selected.company,
        type: selected.type,
        cpu: selected.cpu,
        gpu: selected.gpu,
        os: selected.os,
        ram: selected.ram,
        weight: weight.value,
        screen_size: screen_size.value,
        touchscreen: touchscreen.value,
        ips: ips.value,
        resolution: resolution.value,
        hdd: hdd.value || 0,
        ssd: ssd.value || 0
    };

    fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            result.innerHTML = "❌ Error: " + data.error;
        } else {
            result.innerHTML = `💰 Estimated Price: ₹${data.price}`;
        }
    })
    .catch(err => {
        result.innerHTML = "❌ Server Error";
        console.error(err);
    });
}
