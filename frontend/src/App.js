import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import WeatherOracleABI from './contracts/WeatherOracle.json';
import WeatherForm from './components/WeatherForm';
import WeatherReportsList from './components/WeatherReportsList';
import './App.css';

const weatherOracleAddress = process.env.REACT_APP_WEATHER_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000';
const subgraphUri = process.env.REACT_APP_SUBGRAPH_URL || 'http://localhost:8000/subgraphs/name/weather-oracle';

const client = new ApolloClient({
    uri: subgraphUri,
    cache: new InMemoryCache(),
});

function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [network, setNetwork] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            const p = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(p);
            p.getNetwork().then(setNetwork);
            p.listAccounts().then(accounts => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    const s = p.getSigner();
                    setSigner(s);
                    setContract(new ethers.Contract(weatherOracleAddress, WeatherOracleABI.abi, s));
                }
            });

            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    const s = p.getSigner();
                    setSigner(s);
                    setContract(new ethers.Contract(weatherOracleAddress, WeatherOracleABI.abi, s));
                } else {
                    setAccount(null);
                    setSigner(null);
                    setContract(null);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    const connectWallet = async () => {
        if (provider) {
            const accounts = await provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);
            const s = provider.getSigner();
            setSigner(s);
            setContract(new ethers.Contract(weatherOracleAddress, WeatherOracleABI.abi, s));
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (
        <ApolloProvider client={client}>
            <div className="App">
                <header className="App-header">
                    <h1>Decentralized Weather Oracle</h1>
                    <div className="status-bar">
                        {account ? (
                            <span className="account-info">Connected: {account.substring(0, 6)}...{account.substring(38)}</span>
                        ) : (
                            <button className="connect-btn" onClick={connectWallet}>Connect Wallet</button>
                        )}
                        {network && <span className="network-info">Network: {network.name}</span>}
                    </div>
                </header>

                <main>
                    <div className="container">
                        <section className="request-section">
                            <h2>Request Weather Data</h2>
                            {contract ? (
                                <WeatherForm contract={contract} account={account} />
                            ) : (
                                <p>Please connect your wallet to request weather data.</p>
                            )}
                        </section>

                        <section className="reports-section">
                            <h2>Historical Weather Reports</h2>
                            <WeatherReportsList />
                        </section>
                    </div>
                </main>
            </div>
        </ApolloProvider>
    );
}

export default App;
