// Finorix Pro
// Main application logic

const marketSelect = document.getElementById("marketSelect");
const currentMarket = document.getElementById("currentMarket");
const marketPrice = document.getElementById("marketPrice");
const priceChange = document.getElementById("priceChange");
const signal = document.getElementById("signal");
const signalDescription = document.getElementById("signalDescription");
const signalTime = document.getElementById("signalTime");
const confidence = document.getElementById("confidence");
const systemStatus = document.getElementById("systemStatus");


// Change market
marketSelect.addEventListener("change", function () {

    const selectedMarket = marketSelect.value;

    const marketName =
        marketSelect.options[marketSelect.selectedIndex].text;

    currentMarket.textContent = marketName;

    marketPrice.textContent = "--.--";
    priceChange.textContent = "Waiting for market data...";

    signal.textContent = "WAIT";
    signalDescription.textContent = "Analyzing market...";
    confidence.textContent = "--%";

    systemStatus.textContent = "READY";

    updateSignalTime();
});


// Update signal time
function updateSignalTime() {

    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    signalTime.textContent = `${hours}:${minutes}`;
}


// Initial setup
updateSignalTime();


// Demo system status
function systemReady() {
    systemStatus.textContent = "READY";
}


// Placeholder for future market-data connection
function receiveMarketData(data) {

    if (!data) {
        return;
    }

    if (data.price !== undefined) {
        marketPrice.textContent = data.price;
    }

    if (data.change !== undefined) {
        priceChange.textContent = data.change;
    }
}


// Placeholder for future signal system
function showSignal(type, confidenceValue) {

    signal.textContent = type;
    confidence.textContent = confidenceValue + "%";

    if (type === "CALL") {

        signalDescription.textContent =
            "Possible upward movement";

    } else if (type === "PUT") {

        signalDescription.textContent =
            "Possible downward movement";

    } else {

        signalDescription.textContent =
            "Waiting for confirmation";
    }

    updateSignalTime();
}


// Start application
console.log("Finorix Pro started successfully.");
systemReady();
