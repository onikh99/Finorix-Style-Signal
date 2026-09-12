export default async function handler(req, res) {
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "API key not configured"
        });
    }

    const symbol = req.query.symbol || "EUR/USD";

    const url =
        `https://api.twelvedata.com/time_series` +
        `?symbol=${encodeURIComponent(symbol)}` +
        `&interval=1min` +
        `&outputsize=50` +
        `&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return res.status(response.ok ? 200 : 500).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Market data request failed"
        });
    }
}
