document.addEventListener("DOMContentLoaded", () => {
    initCanvasAnimation();
    fetchAndRenderServices();
    setupBookingCalculator();
    setupBookingActions();

    // Initialize Lucide icons on page load
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/* ================= 1. BACKGROUND CANVAS ANIMATION ================= */
function initCanvasAnimation() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const drops = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
        drops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 0.8 + 0.2,
            alpha: Math.random() * 0.6 + 0.2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw glossy red light beams
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(217, 4, 41, 0.05)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(217, 4, 41, 0.03)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Animate hydrophobic drops
        drops.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha})`;
            ctx.fill();

            d.y += d.speed;
            if (d.y > canvas.height) {
                d.y = -10;
                d.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(draw);
    }
    draw();
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
    if (!container) return;
    container.innerHTML = "";

    globalServicesData.forEach(pkg => {
        const price = currentVehicleSize === 'hatchback' ? pkg.hatchbackPrice : pkg.suvPrice;
        const featuresHtml = pkg.features.map(f => `<li class="flex items-start text-xs text-gray-300"><i data-lucide="check-circle-2" class="w-4 h-4 text-accent-red shrink-0 mt-0.5 mr-2"></i><span>${f}</span></li>`).join("");

        const card = document.createElement("div");
        card.className = "glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group";
        card.innerHTML = `
            <div>
                <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Package</div>
                <h3 class="text-xl font-extrabold text-white mb-2 group-hover:text-accent-red transition-colors">${pkg.name}</h3>
                <p class="text-xs text-gray-400 mb-4">${pkg.description}</p>
                <div class="py-3 px-4 rounded-xl bg-white/5 border border-white/10 mb-6 flex items-baseline gap-1">
                    <span class="text-3xl font-black text-accent-red price-val">£${price}</span>
                    <span class="text-xs text-gray-400 font-medium">/ ${currentVehicleSize === 'hatchback' ? 'Hatchback' : 'SUV'}</span>
                </div>
                <ul class="space-y-2.5 text-xs text-gray-300 mb-6">${featuresHtml}</ul>
            </div>
            <button onclick="selectPackageForBooking('${pkg.id}')" class="w-full py-3 rounded-xl bg-white/10 hover:bg-accent-red text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                Configure & Book
            </button>
        `;
        container.appendChild(card);
    });

    // Re-trigger Lucide icon replacement for dynamically generated elements
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/* ================= 3. VEHICLE SIZE & CALCULATOR ================= */
function setupBookingCalculator() {
    const btnHatch = document.getElementById("size-hatch");
    const btnSuv = document.getElementById("size-suv");

    if (btnHatch && btnSuv) {
        btnHatch.addEventListener("click", () => {
            currentVehicleSize = 'hatchback';
            btnHatch.className = "px-6 py-2.5 rounded-xl font-bold bg-accent-red text-white transition cursor-pointer shadow-md";
            btnSuv.className = "px-6 py-2.5 rounded-xl font-bold bg-transparent text-gray-400 transition hover:text-white cursor-pointer";
            renderServicesGrid();
            updateLiveEstimate();
        });

        btnSuv.addEventListener("click", () => {
            currentVehicleSize = 'suv';
            btnSuv.className = "px-6 py-2.5 rounded-xl font-bold bg-accent-red text-white transition cursor-pointer shadow-md";
            btnHatch.className = "px-6 py-2.5 rounded-xl font-bold bg-transparent text-gray-400 transition hover:text-white cursor-pointer";
            renderServicesGrid();
            updateLiveEstimate();
        });
    }

    const pkgSelect = document.getElementById("calc-package");
    const addOnCheckboxes = document.querySelectorAll(".addon-checkbox");

    if (pkgSelect) pkgSelect.addEventListener("change", updateLiveEstimate);
    addOnCheckboxes.forEach(cb => cb.addEventListener("change", updateLiveEstimate));
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
    if (!pkgSelect || !priceDisplay || globalServicesData.length === 0) return;

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

    document.querySelectorAll(".addon-checkbox:checked").forEach(cb => {
        total += parseInt(cb.value, 10);
    });

    priceDisplay.textContent = `£${total}`;
}

/* ================= 4. SEPARATE BOOKING ACTIONS (WEBSITE vs WHATSAPP) ================= */
function setupBookingActions() {
    const bookingForm = document.getElementById("booking-form");
    if (!bookingForm) return;

    // Handle "Book via Website" (Database + Discord)
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearValidationErrors();

        const formData = getValidatedFormData();
        if (!formData) return;

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showToast("Booking successfully saved! We will be in contact with you.", "success");
                bookingForm.reset();
                updateLiveEstimate();
            } else if (result.errors) {
                Object.keys(result.errors).forEach(field => {
                    const fieldMap = { customerName: "book-name", phone: "book-phone", postcode: "book-postcode", carModel: "book-car" };
                    showFieldError(fieldMap[field] || field, result.errors[field]);
                });
                showToast("Please correct the highlighted errors.", "error");
            } else {
                showToast(result.message || "Submission failed. Please try WhatsApp.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Network error connecting to server.", "error");
        }
    });

    // Handle "Book via WhatsApp" button explicitly
    const whatsappBtn = document.getElementById("btn-book-whatsapp");
    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", (e) => {
            e.preventDefault();
            clearValidationErrors();

            const name = document.getElementById("book-name").value.trim() || 'Customer';
            const phone = document.getElementById("book-phone").value.trim() || '';
            const postcode = document.getElementById("book-postcode").value.trim() || 'BT Area';
            const carModel = document.getElementById("book-car").value.trim() || 'Vehicle';
            const pkgSelect = document.getElementById("calc-package");
            const selectedPkgObj = globalServicesData.find(p => p.id === pkgSelect?.value);
            const estimatedPrice = document.getElementById("live-price").textContent;

            let selectedAddons = [];
            document.querySelectorAll(".addon-checkbox:checked").forEach(cb => {
                selectedAddons.push(cb.parentElement.textContent.trim().split('(')[0]);
            });
            const addonsText = selectedAddons.length > 0 ? selectedAddons.join(", ") : "None";

            const whatsappMessage =
                `Hi Vance, I'd like to book a mobile valet!%0A%0A` +
                `*Name:* ${name}%0A` +
                `*Phone:* ${phone}%0A` +
                `*Car:* ${carModel} (${currentVehicleSize.toUpperCase()})%0A` +
                `*Package:* ${selectedPkgObj ? selectedPkgObj.name : 'Valet Package'}%0A` +
                `*Add-ons:* ${addonsText}%0A` +
                `*Postcode:* ${postcode.toUpperCase()}%0A` +
                `*Estimated Total:* ${estimatedPrice}`;

            window.open(`https://wa.me/447849351228?text=${whatsappMessage}`, '_blank');
        });
    }
}

function getValidatedFormData() {
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

    if (hasError) return null;

    return {
        customerName: name,
        phone: phone,
        postcode: postcode.toUpperCase(),
        carModel: carModel,
        vehicleSize: currentVehicleSize,
        servicePackage: selectedPkgObj ? selectedPkgObj.name : pkgSelect.value,
        estimatedPrice: estimatedPrice
    };
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