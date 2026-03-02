import React, { useState } from 'react';

function WeatherForm({ contract, account }) {
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!city) return;

        setLoading(true);
        setError(null);
        setTxHash(null);

        try {
            const tx = await contract.requestWeather(city);
            setTxHash(tx.hash);
            await tx.wait();
            setCity('');
            alert('Weather request submitted successfully!');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="weather-form">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter city name (e.g. London)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !city}>
                    {loading ? 'Submitting...' : 'Request Weather'}
                </button>
            </form>
            {txHash && (
                <p className="tx-info">
                    Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash.substring(0, 10)}...</a>
                </p>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default WeatherForm;
