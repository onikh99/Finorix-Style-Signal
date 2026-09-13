// ========================================
// FINORIX PRO
// REAL MARKET DATA + 2 FUTURE PREDICTION CANDLES
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
let futureCandles = [];
let lastPrice = null;


// ========================================
// GET MARKET DATA
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

        // Twelve Data newest first -> reverse
        candles = data.values
            .slice()
            .reverse()
            .map(item => ({
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close)
            }));


        // ========================================
        // CURRENT PRICE
        // ========================================

        const latest =
            candles[candles.length - 1];

        const currentPrice =
            latest.close;

        marketPrice.textContent =
            formatPrice(currentPrice);


        // ========================================
        // PRICE CHANGE
        // ========================================

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


        // ========================================
        // CREATE 2 FUTURE PREDICTION CANDLES
        // ========================================

        futureCandles =
            predictFutureCandles(candles);


        // ========================================
        // SIGNAL
        // ========================================

        calculateSignal(candles);


        marketStatus.textContent =
            "Connected";

        systemStatus.textContent =
            "LIVE";

        updateSignalTime();

        drawChart();

    } catch (error) {

        console.error(error);

        marketStatus.textContent =
            "Connection Error";

        systemStatus.textContent =
            "ERROR";

        signal.textContent =
            "WAIT";

        signalDescription.textContent =
            "Unable to receive market data.";

        confidence.textContent =
            "--%";
    }
}


// ========================================
// FORMAT PRICE
// ========================================

function formatPrice(price) {

    const number =
        Number(price);

    if (!Number.isFinite(number)) {
        return "--";
    }

    return number.toFixed(5);
}


// ========================================
// PREDICT 2 FUTURE CANDLES
// ========================================

function predictFutureCandles(data) {

    if (data.length < 5) {
        return [];
    }

    const recent =
        data.slice(-5);

    let bullish = 0;
    let bearish = 0;

    recent.forEach(candle => {

        if (candle.close > candle.open) {
            bullish++;
        }

        if (candle.close < candle.open) {
            bearish++;
        }

    });


    const last =
        data[data.length - 1];


    // Average recent movement
    let movement = 0;

    recent.forEach(candle => {

        movement +=
            Math.abs(
                candle.close - candle.open
            );

    });

    movement =
        movement / recent.length;


    // Prevent movement from becoming zero
    if (!movement || !Number.isFinite(movement)) {

        movement =
            Math.abs(
                last.close * 0.0001
            );
    }


    let direction;

    if (bullish > bearish) {
        direction = 1;
    } else if (bearish > bullish) {
        direction = -1;
    } else {

        // If equal, use latest candle
        direction =
            last.close >= last.open
                ? 1
                : -1;
    }


    const predictions = [];

    let previousClose =
        last.close;


    // ========================================
    // FUTURE CANDLE 1
    // ========================================

    const move1 =
        movement * 0.8 * direction;

    const close1 =
        previousClose + move1;

    const open1 =
        previousClose;

    const high1 =
        Math.max(
            open1,
            close1
        ) + movement * 0.25;

    const low1 =
        Math.min(
            open1,
            close1
        ) - movement * 0.25;


    predictions.push({

        open: open1,
        high: high1,
        low: low1,
        close: close1,

        prediction: true
    });


    // ========================================
    // FUTURE CANDLE 2
    // ========================================

    previousClose =
        close1;


    // Slightly reduce prediction distance
    const move2 =
        movement * 0.65 * direction;

    const close2 =
        previousClose + move2;

    const open2 =
        previousClose;

    const high2 =
        Math.max(
            open2,
            close2
        ) + movement * 0.22;

    const low2 =
        Math.min(
            open2,
            close2
        ) - movement * 0.22;


    predictions.push({

        open: open2,
        high: high2,
        low: low2,
        close: close2,

        prediction: true
    });


    return predictions;
}


// ========================================
// SIGNAL CALCULATION
// ========================================

function calculateSignal(data) {

    if (data.length < 5) {

        signal.textContent =
            "WAIT";

        signalDescription.textContent =
            "Analyzing market...";

        confidence.textContent =
            "--%";

        return;
    }


    const recent =
        data.slice(-5);

    let bullish = 0;
    let bearish = 0;


    recent.forEach(candle => {

        if (candle.close > candle.open) {
            bullish++;
        }

        if (candle.close < candle.open) {
            bearish++;
        }

    });


    let result =
        "WAIT";

    let percent =
        50;


    if (bullish >= 4) {

        result =
            "BUY";

        percent =
            75;

    } else if (bearish >= 4) {

        result =
            "SELL";

        percent =
            75;

    } else if (bullish > bearish) {

        result =
            "BUY";

        percent =
            60;

    } else if (bearish > bullish) {

        result =
            "SELL";

        percent =
            60;
    }


    signal.textContent =
        result;

    confidence.textContent =
        percent + "%";


    if (result === "BUY") {

        signalDescription.textContent =
            "Bullish momentum detected.";

    } else if (result === "SELL") {

        signalDescription.textContent =
            "Bearish momentum detected.";

    } else {

        signalDescription.textContent =
            "Market direction is unclear.";
    }
}


// ========================================
// DRAW CHART
// ========================================

function drawChart() {

    const rect =
        canvas.getBoundingClientRect();

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


    const width =
        rect.width;

    const height =
        rect.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.fillStyle =
        "#0b1016";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    if (!candles.length) {
        return;
    }


    // ========================================
    // COMBINE REAL + FUTURE CANDLES
    // ========================================

    const allCandles =
        candles.concat(
            futureCandles
        );


    // ========================================
    // PRICE RANGE
    // ========================================

    let highest =
        -Infinity;

    let lowest =
        Infinity;


    allCandles.forEach(candle => {

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


    const padding =
        25;

    const chartHeight =
        height - padding * 2;


    let range =
        highest - lowest;


    if (range === 0) {
        range = 0.00001;
    }


    // ========================================
    // GRID
    // ========================================

    ctx.strokeStyle =
        "#18212b";

    ctx.lineWidth =
        1;


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


    // ========================================
    // CANDLE SIZE
    // ========================================

    const gap =
        width / allCandles.length;

    const candleWidth =
        Math.max(
            3,
            gap * 0.65
        );


    // ========================================
    // PRICE TO Y
    // ========================================

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


    // ========================================
    // DRAW CANDLES
    // ========================================

    allCandles.forEach(
        (candle, index) => {

            const x =
                index * gap +
                gap / 2;


            const openY =
                priceToY(
                    candle.open
                );

            const closeY =
                priceToY(
                    candle.close
                );

            const highY =
                priceToY(
                    candle.high
                );

            const lowY =
                priceToY(
                    candle.low
                );


            const bullish =
                candle.close >=
                candle.open;


            // Future candle style
            if (candle.prediction) {

                ctx.strokeStyle =
                    bullish
                        ? "#66ff99"
                        : "#ff7b91";

                ctx.fillStyle =
                    bullish
                        ? "#66ff99"
                        : "#ff7b91";

                // Dashed wick
                ctx.setLineDash([
                    4,
                    3
                ]);

            } else {

                ctx.strokeStyle =
                    bullish
                        ? "#25d366"
                        : "#ff4d67";

                ctx.fillStyle =
                    bullish
                        ? "#25d366"
                        : "#ff4d67";

                ctx.setLineDash([]);
            }


            // ========================================
            // WICK
            // ========================================

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


            // ========================================
            // BODY
            // ========================================

            ctx.setLineDash([]);


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


            if (candle.prediction) {

                // Outline prediction candle
                ctx.strokeRect(
                    x - candleWidth / 2,
                    bodyTop,
                    candleWidth,
                    bodyHeight
                );

            } else {

                // Real candle
                ctx.fillRect(
                    x - candleWidth / 2,
                    bodyTop,
                    candleWidth,
                    bodyHeight
                );
            }

        }
    );


    ctx.setLineDash([]);


    // ========================================
    // FUTURE AREA LABEL
    // ========================================

    if (futureCandles.length) {

        const realCount =
            candles.length;

        const separatorX =
            realCount * gap;


        ctx.strokeStyle =
            "#536170";

        ctx.setLineDash([
            6,
            5
        ]);

        ctx.beginPath();

        ctx.moveTo(
            separatorX,
            padding
        );

        ctx.lineTo(
            separatorX,
            height - padding
        );

        ctx.stroke();

        ctx.setLineDash([]);


        ctx.fillStyle =
            "#9aa7b5";

        ctx.font =
            "11px Arial";

        ctx.fillText(
            "PREDICTION",
            separatorX + 6,
            padding + 12
        );
    }
}


// ========================================
// MARKET CHANGE
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

        futureCandles = [];


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
// SIGNAL TIME
// ========================================

function updateSignalTime() {

    const now =
        new Date();


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    signalTime.textContent =
        `${hours}:${minutes}`;
}


// ========================================
// START
// ========================================

currentMarket.textContent =
    marketSelect.options[
        marketSelect.selectedIndex
    ].textContent;


updateSignalTime();

loadMarketData();


// ========================================
// REFRESH EVERY 60 SECONDS
// ========================================

setInterval(
    loadMarketData,
    60000
);


// ========================================
// REDRAW ON RESIZE
// ========================================

window.addEventListener(
    "resize",
    drawChart
);


console.log(
    "Finorix Pro real market + prediction mode started."
);
