// ========================================
// FINORIX PRO
// REAL MARKET DATA
// Twelve Data -> Vercel API
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
const marketStatus = document.getElementById("marketStatus");

const canvas = document.getElementById("candleChart");
const ctx = canvas.getContext("2d");

let candles = [];
let lastPrice = null;


// ========================================
// Get Market Data From Vercel API
// ========================================

async function loadMarketData() {

    const symbol = marketSelect.value;

    marketStatus.textContent = "Connecting...";
    systemStatus.textContent = "LOADING";

    try {

        const response = await fetch(
            `/api/market?symbol=${encodeURIComponent(symbol)}`
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            throw new Error("No market data received");
        }

        // Twelve Data returns newest candle first
        candles = data.values
            .slice()
            .reverse()
            .map(item => ({
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close)
            }));


        // Current price
        const latest = candles[candles.length - 1];

        const currentPrice = latest.close;

        marketPrice.textContent =
            formatPrice(currentPrice);


        // Price change
        if (candles.length >= 2) {

            const previous =
                candles[candles.length - 2].close;

            const difference =
                currentPrice - previous;

            priceChange.textContent =
                difference >= 0
                    ? "+" + formatPrice(difference)
                    : formatPrice(difference);

        }


        lastPrice = currentPrice;

        marketStatus.textContent = "Connected";
        systemStatus.textContent = "LIVE";

        updateSignalTime();

        drawChart();

    } catch (error) {

        console.error(error);

        marketStatus.textContent = "Connection Error";
        systemStatus.textContent = "ERROR";

        signal.textContent = "WAIT";
        signalDescription.textContent =
            "Unable to receive market data.";

        confidence.textContent = "--%";
    }
}


// ========================================
// Format Price
// ========================================

function formatPrice(price) {

    const number = Number(price);

    if (!Number.isFinite(number)) {
        return "--";
    }

    // Forex usually needs 5 decimal places
    return number.toFixed(5);
}


// ========================================
// Draw Candlestick Chart
// ========================================

function drawChart() {

    const rect = canvas.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    ctx.fillStyle = "#0b1016";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    if (!candles.length) {
        return;
    }


    // Find price range

    let highest = -Infinity;
    let lowest = Infinity;

    candles.forEach(candle => {

        highest =
            Math.max(
                highest,
                candle.high
            );

        lowest =
            Math.min(
                lowest,
                candle.low
            );

    });


    const padding = 25;

    const chartHeight =
        height - padding * 2;

    let range =
        highest - lowest;

    if (range === 0) {
        range = 0.00001;
    }


    // Grid

    ctx.strokeStyle = "#18212b";
    ctx.lineWidth = 1;

    for (let i = 0; i < 6; i++) {

        const y =
            padding +
            (chartHeight / 5) * i;

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();
    }


    // Candle size

    const gap =
        width / candles.length;

    const candleWidth =
        Math.max(
            3,
            gap * 0.65
        );


    // Convert price to screen position

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


    // Draw candles

    candles.forEach((candle, index) => {

        const x =
            index * gap +
            gap / 2;

        const openY =
            priceToY(candle.open);

        const closeY =
            priceToY(candle.close);

        const highY =
            priceToY(candle.high);

        const lowY =
            priceToY(candle.low);

        const bullish =
            candle.close >= candle.open;


        ctx.strokeStyle =
            bullish
                ? "#25d366"
                : "#ff4d67";

        ctx.fillStyle =
            bullish
                ? "#25d366"
                : "#ff4d67";


        // Wick

        ctx.beginPath();

        ctx.moveTo(
            x,
            highY
        );

        ctx.lineTo(
            x,
            lowY
        );

        ctx.stroke();


        // Body

        const bodyTop =
            Math.min(
                openY,
                closeY
            );

        const bodyHeight =
            Math.max(
                2,
                Math.abs(
                    closeY - openY
                )
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
// Market Change
// ========================================

marketSelect.addEventListener(
    "change",
    function () {

        const selected =
            marketSelect.options[
                marketSelect.selectedIndex
            ];

        currentMarket.textContent =
            selected.textContent;

        candles = [];

        marketPrice.textContent =
            "--";

        priceChange.textContent =
            "--";

        signal.textContent =
            "WAIT";

        signalDescription.textContent =
            "Analyzing market...";

        confidence.textContent =
            "--%";

        drawChart();

        loadMarketData();
    }
);


// ========================================
// Signal Time
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
// Start
// ========================================

currentMarket.textContent =
    marketSelect.options[
        marketSelect.selectedIndex
    ].textContent;

updateSignalTime();

loadMarketData();


// Refresh every 60 seconds
// because timeframe = 1 minute

setInterval(
    loadMarketData,
    60000
);


// Redraw when screen changes

window.addEventListener(
    "resize",
    drawChart
);


console.log(
    "Finorix Pro real market mode started."
);
