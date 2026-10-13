document.addEventListener("DOMContentLoaded", () => {
    initCanvasAnimation();
    fetchAndRenderServices();
    setupBookingCalculator();
    setupForms();
});

/* ================= 1. BACKGROUND CANVAS ANIMATION ================= */
function initCanvasAnimation() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 35 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? "rgba(217, 4, 41, 0.25)" : "rgba(250, 250, 250, 0.08)",
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 0.8 + 0.2
    }));

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y > height) {
                p.y = 0;
                p.x = Math.random() * width;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ================= 2. DYNAMIC SERVICE FETCHING ================= */
let globalServicesData = [];
let currentVehicleSize = 'hatchback';

async function fetchAndRenderServices() {
    const container = document.getElementById("services-container");
    if (!container) return;

    try {
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error("Failed to fetch services");
        globalServicesData = await response.json();

        renderServicesGrid();
        populateBookingDropdowns();
    } catch (error) {
        console.error("Error loading services from backend:", error);
        container.innerHTML = `<p class="text-center text-accent-red col-span-2 py-8">Unable to load live service packages. Please check back soon.</p>`;
    }
}

function renderServicesGrid() {
    const container = document.getElementById("services-container");
    container.innerHTML = "";

    globalServicesData.forEach(pkg => {
        const price = currentVehicleSize === 'hatchback' ? pkg.hatchbackPrice : pkg.suvPrice;
        const featuresHtml = pkg.features.map(f => `<li class="flex items-start text-sm text-gray-300"><span class="text-accent-red mr-2 font-bold">✓</span> ${f}</li>`).join("");

        const card = document.createElement("div");
        card.className = "bg-card-bg border border-gray-800 rounded-2xl p-7 flex flex-col justify-between shadow-xl transition hover:border-accent-red/60 hover:-translate-y-1 duration-300";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-extrabold text-text-light tracking-wide">${pkg.name}</h3>
                    <span class="text-2xl font-black text-accent-red">£${price}</span>
                </div>
                <p class="text-gray-400 text-sm mb-6 leading-relaxed">${pkg.description}</p>
                <ul class="space-y-2.5 mb-8">${featuresHtml}</ul>
            </div>
            <button onclick="selectPackageForBooking('${pkg.id}')" class="w-full bg-accent-red text-white py-3 rounded-xl font-bold hover:bg-red-700 transition cursor-pointer shadow-lg shadow-accent-red/20">
                Configure & Book
            </button>
        `;
        container.appendChild(card);
    });
}

/* ================= 3. VEHICLE SIZE & CALCULATOR ================= */
function setupBookingCalculator() {
    const btnHatch = document.getElementById("size-hatch");
    const btnSuv = document.getElementById("size-suv");

    if (btnHatch && btnSuv) {
        btnHatch.addEventListener("click", () => {
            currentVehicleSize = 'hatchback';
            btnHatch.className = "px-6 py-2.5 rounded-xl font-bold bg-accent-red text-white shadow-md transition";
            btnSuv.className = "px-6 py-2.5 rounded-xl font-bold bg-transparent text-gray-400 transition hover:text-white";
            renderServicesGrid();
            updateLiveEstimate();
        });

        btnSuv.addEventListener("click", () => {
            currentVehicleSize = 'suv';
            btnSuv.className = "px-6 py-2.5 rounded-xl font-bold bg-accent-red text-white shadow-md transition";
            btnHatch.className = "px-6 py-2.5 rounded-xl font-bold bg-transparent text-gray-400 transition hover:text-white";
            renderServicesGrid();
            updateLiveEstimate();
        });
    }

    const pkgSelect = document.getElementById("calc-package");
    const addOnCheckboxes = document.querySelectorAll(".addon-checkbox");

    if (pkgSelect) pkgSelect.addEventListener("change", updateLiveEstimate);
    addOnCheckboxes.forEach(cb => cb.addEventListener("change", updateLiveEstimate));
    // Re-trigger Lucide icon replacement for dynamically generated elements
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function populateBookingDropdowns() {
    const select = document.getElementById("calc-package");
    if (!select) return;
    select.innerHTML = "";
    globalServicesData.forEach(pkg => {
        const opt = document.createElement("option");
        opt.value = pkg.id;
        const price = currentVehicleSize === 'hatchback' ? pkg.hatchbackPrice : pkg.suvPrice;
        opt.textContent = `${pkg.name} (£${price})`;
        select.appendChild(opt);
    });
    updateLiveEstimate();
}

function selectPackageForBooking(packageId) {
    const select = document.getElementById("calc-package");
    if (select) {
        select.value = packageId;
        updateLiveEstimate();
        document.getElementById("booking-section").scrollIntoView({ behavior: 'smooth' });
    }
}

function updateLiveEstimate() {
    const pkgSelect = document.getElementById("calc-package");
    const priceDisplay = document.getElementById("live-price");
    if (!pkgSelect || !priceDisplay) return;

    const selectedPkgId = pkgSelect.value;
    const pkg = globalServicesData.find(p => p.id === selectedPkgId);
    if (!pkg) return;

    Array.from(pkgSelect.options).forEach(opt => {
        const pObj = globalServicesData.find(p => p.id === opt.value);
        if (pObj) {
            const p = currentVehicleSize === 'hatchback' ? pObj.hatchbackPrice : pObj.suvPrice;
            opt.textContent = `${pObj.name} (£${p})`;
        }
    });

    let total = currentVehicleSize === 'hatchback' ? pkg.hatchbackPrice : pkg.suvPrice;
    let addonNames = [];

    document.querySelectorAll(".addon-checkbox:checked").forEach(cb => {
        total += parseInt(cb.value, 10);
        addonNames.push(cb.getAttribute("data-name"));
    });

    priceDisplay.textContent = `£${total}`;
}

/* ================= 4. FORM SUBMISSION & WHATSAPP INTEGRATION ================= */
function setupForms() {
    const bookingForm = document.getElementById("booking-form");
    if (!bookingForm) return;

    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearValidationErrors();

        const name = document.getElementById("book-name").value.trim();
        const phone = document.getElementById("book-phone").value.trim();
        const postcode = document.getElementById("book-postcode").value.trim();
        const carModel = document.getElementById("book-car").value.trim();
        const pkgSelect = document.getElementById("calc-package");
        const selectedPkgObj = globalServicesData.find(p => p.id === pkgSelect.value);
        const estimatedPrice = parseInt(document.getElementById("live-price").textContent.replace('£', ''), 10);

        let hasError = false;

        const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(phone)) {
            showFieldError("book-phone", "Please enter a valid phone number.");
            hasError = true;
        }

        const niPostcodeRegex = /^BT\d{1,2}\s?[0-9][A-Z]{2}$/i;
        if (!niPostcodeRegex.test(postcode)) {
            showFieldError("book-postcode", "Enter a valid NI postcode (e.g. BT28 1AA)");
            hasError = true;
        }

        if (hasError) return;

        // Collect add-ons
        let selectedAddons = [];
        document.querySelectorAll(".addon-checkbox:checked").forEach(cb => {
            selectedAddons.push(cb.getAttribute("data-name"));
        });

        const formData = {
            customerName: name,
            phone: phone,
            postcode: postcode.toUpperCase(),
            carModel: carModel,
            vehicleSize: currentVehicleSize,
            servicePackage: selectedPkgObj ? selectedPkgObj.name : pkgSelect.value,
            estimatedPrice: estimatedPrice
        };

        try {
            // 1. Save inquiry to backend (MariaDB & Discord notification)
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showToast("Booking saved! Opening WhatsApp...", "success");

                // 2. Construct professional WhatsApp message
                const addonsText = selectedAddons.length > 0 ? selectedAddons.join(", ") : "None";
                const whatsappMessage =
                    `Hi Vance, I'd like to book a mobile valet!%0A%0A` +
                    `*Name:* ${name}%0A` +
                    `*Car:* ${carModel} (${currentVehicleSize.toUpperCase()})%0A` +
                    `*Package:* ${selectedPkgObj ? selectedPkgObj.name : ''}%0A` +
                    `*Add-ons:* ${addonsText}%0A` +
                    `*Postcode:* ${postcode.toUpperCase()}%0A` +
                    `*Estimated Total:* £${estimatedPrice}`;

                setTimeout(() => {
                    window.open(`https://wa.me/447849351228?text=${whatsappMessage}`, '_blank');
                }, 800);

                bookingForm.reset();
                updateLiveEstimate();
            } else if (result.errors) {
                Object.keys(result.errors).forEach(field => {
                    const fieldMap = { customerName: "book-name", phone: "book-phone", postcode: "book-postcode", carModel: "book-car" };
                    showFieldError(fieldMap[field] || field, result.errors[field]);
                });
                showToast("Please correct the highlighted errors.", "error");
            } else {
                showToast(result.message || "Submission failed. Please message via WhatsApp directly.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Network error. Opening WhatsApp directly...", "error");

            // Fallback WhatsApp direct open if backend is unreachable
            const whatsappMessage = `Hi Vance, I'd like to book a valet for my ${carModel} (${currentVehicleSize}). Postcode: ${postcode}. Total: £${estimatedPrice}`;
            window.open(`https://wa.me/447849351228?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
        }
    });
}

/* ================= 5. UI HELPERS (TOAST & ERRORS) ================= */
function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add("border-accent-red");
    const errorMsg = document.createElement("p");
    errorMsg.className = "field-error-msg text-accent-red text-xs mt-1.5 font-semibold";
    errorMsg.textContent = message;
    input.parentNode.appendChild(errorMsg);
}

function clearValidationErrors() {
    document.querySelectorAll(".field-error-msg").forEach(el => el.remove());
    document.querySelectorAll("input").forEach(el => el.classList.remove("border-accent-red"));
}

function showToast(message, type = "success") {
    const existingToast = document.getElementById("toast-notification");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = `fixed bottom-6 right-6 z-50 px-6 py-3.5 rounded-xl shadow-2xl text-sm font-bold text-white transition transform duration-300 translate-y-10 opacity-0 flex items-center space-x-3 ${type === "success" ? "bg-emerald-600 border border-emerald-500" : "bg-accent-red border border-red-600"
        }`;
    toast.innerHTML = `<span>${type === "success" ? "✓" : "⚠️"}</span><span>${message}</span>`;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("translate-y-10", "opacity-0"), 50);

    setTimeout(() => {
        toast.classList.add("translate-y-10", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}