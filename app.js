// ========================================
// FINORIX PRO
// Demo Candlestick Chart
// ========================================

const marketSelect = document.getElementById("marketSelect");
const currentMarket = document.getElementById("currentMarket");
const marketPrice = document.getElementById("marketPrice");
const priceChange = document.getElementById("priceChange");
const signal = document.getElementById("signal");
const signalDescription = document.getElementById("signalDescription");
const signalTime = document.getElementById("signalTime");
const confidence = document.getElementById("confidence");
const systemStatus = document.getElementById("systemStatus");

const canvas = document.getElementById("candleChart");
const ctx = canvas.getContext("2d");


// ========================================
// Demo Candle Data
// ========================================

let candles = [];

let basePrice = 1.08540;

for (let i = 0; i < 45; i++) {

    const open = basePrice;

    const movement =
        (Math.random() - 0.5) * 0.0015;

    const close = open + movement;

    const high =
        Math.max(open, close) +
        Math.random() * 0.0007;

    const low =
        Math.min(open, close) -
        Math.random() * 0.0007;

    candles.push({
        open: open,
        close: close,
        high: high,
        low: low
    });

    basePrice = close;
}


// ========================================
// Draw Candlestick Chart
// ========================================

function drawChart() {

    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);


    // Background
    ctx.fillStyle = "#0b1016";
    ctx.fillRect(0, 0, width, height);


    if (candles.length === 0) {
        return;
    }


    // Find price range

    let highest = -Infinity;
    let lowest = Infinity;

    candles.forEach(candle => {

        highest = Math.max(
            highest,
            candle.high
        );

        lowest = Math.min(
            lowest,
            candle.low
        );

    });


    const padding = 25;

    const chartHeight =
        height - padding * 2;

    const range =
        highest - lowest;


    // Grid

    ctx.strokeStyle = "#18212b";
    ctx.lineWidth = 1;

    for (let i = 0; i < 6; i++) {

        const y =
            padding +
            (chartHeight / 5) * i;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }


    // Candles

    const candleWidth =
        Math.max(
            4,
            (width / candles.length) * 0.65
        );

    const gap =
        width / candles.length;


    candles.forEach((candle, index) => {

        const x =
            index * gap +
            gap / 2;


        function priceToY(price) {

            return (
                padding +
                (
                    (highest - price) /
                    range
                ) *
                chartHeight
            );

        }


        const openY =
            priceToY(candle.open);

        const closeY =
            priceToY(candle.close);

        const highY =
            priceToY(candle.high);

        const lowY =
            priceToY(candle.low);


        const isBullish =
            candle.close >= candle.open;


        // Candle color

        ctx.strokeStyle =
            isBullish
                ? "#25d366"
                : "#ff4d67";

        ctx.fillStyle =
            isBullish
                ? "#25d366"
                : "#ff4d67";


        // Wick

        ctx.beginPath();

        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);

        ctx.stroke();


        // Body

        const bodyTop =
            Math.min(openY, closeY);

        const bodyHeight =
            Math.max(
                2,
                Math.abs(closeY - openY)
            );

        ctx.fillRect(
            x - candleWidth / 2,
            bodyTop,
            candleWidth,
            bodyHeight
        );

    });

}


// ========================================
// Market Selection
// ========================================

marketSelect.addEventListener(
    "change",
    function () {

        const marketName =
            marketSelect.options[
                marketSelect.selectedIndex
            ].text;

        currentMarket.textContent =
            marketName;

        // Reset demo price
        basePrice = 1.08540;

        generateNewCandles();

        signal.textContent = "WAIT";

        signalDescription.textContent =
            "Analyzing market...";

        confidence.textContent =
            "--%";

        systemStatus.textContent =
            "READY";

        updateSignalTime();

    }
);


// ========================================
// Generate New Demo Candles
// ========================================

function generateNewCandles() {

    candles = [];

    let price = basePrice;

    for (let i = 0; i < 45; i++) {

        const open = price;

        const movement =
            (Math.random() - 0.5) *
            0.0015;

        const close =
            open + movement;

        const high =
            Math.max(open, close) +
            Math.random() * 0.0007;

        const low =
            Math.min(open, close) -
            Math.random() * 0.0007;

        candles.push({
            open,
            close,
            high,
            low
        });

        price = close;
    }

    const last =
        candles[candles.length - 1];

    marketPrice.textContent =
        last.close.toFixed(5);

    drawChart();
}


// ========================================
// Update Signal Time
// ========================================

function updateSignalTime() {

    const now = new Date();

    const hours =
        String(now.getHours())
        .padStart(2, "0");

    const minutes =
        String(now.getMinutes())
        .padStart(2, "0");

    signalTime.textContent =
        `${hours}:${minutes}`;
}


// ========================================
// Demo Price Update
// ========================================

function updateDemoPrice() {

    if (!candles.length) {
        return;
    }

    const last =
        candles[candles.length - 1];

    const oldPrice =
        last.close;

    const movement =
        (Math.random() - 0.5) *
        0.0004;

    const newPrice =
        oldPrice + movement;

    last.close = newPrice;

    last.high =
        Math.max(
            last.high,
            newPrice
        );

    last.low =
        Math.min(
            last.low,
            newPrice
        );

    marketPrice.textContent =
        newPrice.toFixed(5);

    priceChange.textContent =
        newPrice >= oldPrice
            ? "+ Price moving up"
            : "- Price moving down";

    drawChart();

    updateSignalTime();
}


// ========================================
// Start
// ========================================

generateNewCandles();

updateSignalTime();

systemStatus.textContent =
    "DEMO";


// Demo update every 3 seconds

setInterval(
    updateDemoPrice,
    3000
);


// Redraw when screen changes

window.addEventListener(
    "resize",
    drawChart
);

console.log(
    "Finorix Pro demo started."
);
