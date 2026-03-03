# Decentralized Weather Data Oracle & Subgraph

A robust, decentralized weather data oracle using Chainlink Any API and The Graph Protocol for indexing historical weather reports.

## Overview

This project consists of:
1.  **Smart Contract**: A Solidity contract deployed on Sepolia that requests weather data from off-chain APIs via Chainlink.
2.  **Subgraph**: A Graph Protocol project that indexes `WeatherReported` events for efficient historical querying.
3.  **Frontend**: A React application that allows users to request weather data and view historical reports.
4.  **Local Environment**: A Docker Compose setup for local development.

## Architecture

The system follows a request-response pattern:
1.  User calls `requestWeather("City")` on the smart contract.
2.  Contract emits `WeatherRequested` event and sends a request to Chainlink.
3.  Chainlink Oracle fetches data from a weather API (e.g., OpenWeatherMap).
4.  Oracle calls back the contract's `fulfill` function with the weather data.
5.  Contract stores data and emits `WeatherReported`.
6.  The Subgraph notices the event, parses it, and updates the indexed data.
7.  The Frontend queries the Subgraph via GraphQL to display the history.

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- MetaMask installed in browser

### Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
Key variables:
- `RPC_URL`: Your Alchemy/Infura URL for Sepolia.
- `PRIVATE_KEY`: Your wallet private key (ensure it has Sepolia ETH and LINK).
- `WEATHER_API_KEY`: API key from OpenWeatherMap.

### Local Development
Run the following to start the local environment:
```bash
docker-compose up
```
This starts:
- A Hardhat node (local EVM)
- A Graph Node (Postgres, IPFS, Graph Indexer)
- The React Frontend

### Deployment

#### 1. Smart Contract
Deploy to Sepolia:
```bash
docker-compose run --rm hardhat npx hardhat run scripts/deploy.js --network sepolia
```

#### 2. Subgraph
1. Update `subgraph/subgraph.yaml` with the deployed contract address.
2. Deploy to The Graph Hosted Service or local node:
```bash
cd subgraph
npm install
npm run deploy
```

#### 3. Frontend
Update `.env` in the `frontend` directory with the contract address and subgraph URL, then run:
```bash
cd frontend
npm install
npm start
```

## Testing
Run smart contract tests:
```bash
docker-compose run --rm hardhat npx hardhat test
```

## Security
- **Ownable**: Access control for administrative functions.
- **Reentrancy**: Not directly applicable here but best practices followed.
- **Data Integrity**: Chainlink provides secure data delivery.


