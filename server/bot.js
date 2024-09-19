const fetch = require('node-fetch');
const { SMA, RSI, MACD, BollingerBands, ATR } = require('technicalindicators');

// Configurations
const API_URL = 'https://api.binance.com/api/v3/klines';
const SYMBOL = 'BTCUSDT'; // Trading pair
const INTERVAL = '1h'; // 1-hour candles
const API_LIMIT = 200; // Fetch 200 candles for more historical data

// Risk Management
const RISK_REWARD_RATIO = 2;

// Fetch historical chart data (candles)
async function fetchChartData(symbol, interval, limit) {
  const url = `${API_URL}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const response = await fetch(url);
  const data = await response.json();

  return data.map(candle => ({
    openTime: candle[0],
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
  }));
}

// Calculate various technical indicators
function calculateIndicators(candles) {
  const closes = candles.map(candle => candle.close);
  const highs = candles.map(candle => candle.high);
  const lows = candles.map(candle => candle.low);

  // Simple Moving Averages
  const sma50 = SMA.calculate({ period: 50, values: closes });
  const sma200 = SMA.calculate({ period: 200, values: closes });

  // Relative Strength Index (RSI)
  const rsi14 = RSI.calculate({ period: 14, values: closes });

  // MACD
  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  // Bollinger Bands
  const bbands = BollingerBands.calculate({
    period: 20,
    stdDev: 2,
    values: closes,
  });

  // Average True Range (ATR)
  const atr = ATR.calculate({ period: 14, high: highs, low: lows, close: closes });

  return { sma50, sma200, rsi14, macd, bbands, atr };
}

// Entry and Exit Strategy
function generateTradeSignals(candles) {
  const closes = candles.map(candle => candle.close);
  const { sma50, sma200, rsi14, macd, bbands, atr } = calculateIndicators(candles);

  const signals = [];

  for (let i = 200; i < closes.length; i++) {
    const currentClose = closes[i];
    const currentSMA50 = sma50[i - 50];
    const currentSMA200 = sma200[i - 200];
    const currentRSI = rsi14[i - 14];
    const currentMACD = macd[i - 26];
    const currentBB = bbands[i - 20];
    const currentATR = atr[i - 14];

    // Buy signal
    if (
      currentSMA50 > currentSMA200 &&
      currentMACD.MACD > currentMACD.signal &&
      currentRSI < 30 &&
      currentClose <= currentBB.lower
    ) {
      const sl = currentClose - currentATR;
      const tp = currentClose + (currentATR * RISK_REWARD_RATIO);
      
      signals.push({
        type: 'buy',
        price: currentClose,
        sl: sl,
        tp: tp
      });
    }

    // Sell signal
    if (
      currentSMA50 < currentSMA200 &&
      currentMACD.MACD < currentMACD.signal &&
      currentRSI > 70 &&
      currentClose >= currentBB.upper
    ) {
      const sl = currentClose + currentATR;
      const tp = currentClose - (currentATR * RISK_REWARD_RATIO);

      signals.push({
        type: 'sell',
        price: currentClose,
        sl: sl,
        tp: tp
      });
    }
  }

  return signals;
}

// API function to fetch signals
async function getTradingSignals() {
  const chartData = await fetchChartData(SYMBOL, INTERVAL, API_LIMIT);
  const signals = generateTradeSignals(chartData);
  return signals;
}

module.exports = { getTradingSignals };
