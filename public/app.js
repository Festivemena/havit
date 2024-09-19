async function fetchSignals() {
  try {
    const response = await fetch('/api/signals');
    const signals = await response.json();
    displaySignals(signals);
  } catch (error) {
    console.error('Error fetching signals:', error);
  }
}

function displaySignals(signals) {
  const signalsDiv = document.getElementById('signals');
  signalsDiv.innerHTML = '';

  signals.forEach(signal => {
    const signalDiv = document.createElement('div');
    signalDiv.classList.add('signal', signal.type === 'buy' ? 'buy' : 'sell');
    signalDiv.innerHTML = `
      <h2>${signal.type.toUpperCase()}</h2>
      <p>Price: $${signal.price.toFixed(2)}</p>
      <p>Stop Loss: $${signal.sl.toFixed(2)}</p>
      <p>Take Profit: $${signal.tp.toFixed(2)}</p>
    `;
    signalsDiv.appendChild(signalDiv);
  });
}

// Fetch signals when the page loads
window.onload = fetchSignals;
