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
        container.innerHTML = `<p class="text-center text-accentRed col-span-2">Unable to load live service packages. Please check back soon.</p>`;
    }
}

function renderServicesGrid() {
    const container = document.getElementById("services-container");
    container.innerHTML = "";

    globalServicesData.forEach(pkg => {
        const price = currentVehicleSize === 'hatchback' ? pkg.hatchbackPrice : pkg.suvPrice;
        
        const featuresHtml = pkg.features.map(f => `<li class="flex items-start text-sm text-gray-300"><span class="text-accentRed mr-2">✓</span> ${f}</li>`).join("");

        const card = document.createElement("div");
        card.className = "bg-cardBg border border-gray-800 rounded-xl p-6 flex flex-col justify-between shadow-lg transition hover:border-accentRed";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-textLight">${pkg.name}</h3>
                    <span class="text-2xl font-extrabold text-accentRed">£${price}</span>
                </div>
                <p class="text-gray-400 text-sm mb-6">${pkg.description}</p>
                <ul class="space-y-2 mb-6">${featuresHtml}</ul>
            </div>
            <button onclick="selectPackageForBooking('${pkg.id}')" class="w-full bg-accentRed text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition">
                Book This Package
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
            btnHatch.className = "px-4 py-2 rounded-lg font-bold bg-accentRed text-white transition";
            btnSuv.className = "px-4 py-2 rounded-lg font-bold bg-gray-800 text-gray-300 transition hover:bg-gray-700";
            renderServicesGrid();
            updateLiveEstimate();
        });

        btnSuv.addEventListener("click", () => {
            currentVehicleSize = 'suv';
            btnSuv.className = "px-4 py-2 rounded-lg font-bold bg-accentRed text-white transition";
            btnHatch.className = "px-4 py-2 rounded-lg font-bold bg-gray-800 text-gray-300 transition hover:bg-gray-700";
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
        opt.textContent = `${pkg.name} (£${currentVehicleSize === 'hatchback' ? pkg.hatchbackPrice : pkg.suvPrice})`;
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

    // Update dropdown labels dynamically for active size
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

/* ================= 4. FORM SUBMISSIONS ================= */
function setupForms() {
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = {
                customerName: document.getElementById("book-name").value,
                phone: document.getElementById("book-phone").value,
                postcode: document.getElementById("book-postcode").value,
                carModel: document.getElementById("book-car").value,
                vehicleSize: currentVehicleSize,
                servicePackage: document.getElementById("calc-package").value,
                estimatedPrice: parseInt(document.getElementById("live-price").textContent.replace('£', ''), 10)
            };

            try {
                const res = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    alert("Booking inquiry received! Vance will contact you shortly.");
                    bookingForm.reset();
                } else {
                    alert("Submission failed. Please try calling or messaging directly.");
                }
            } catch (err) {
                console.error(err);
                alert("Network error. Please try again or message via WhatsApp.");
            }
        });
    }

    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById("contact-name").value,
                contact: document.getElementById("contact-info").value,
                message: document.getElementById("contact-msg").value
            };

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    alert("Message sent successfully!");
                    contactForm.reset();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
}