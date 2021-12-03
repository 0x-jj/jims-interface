import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from './network/utils';

const Web3ProviderNetwork = createWeb3ReactRoot('NETWORK');

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false;
}

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <App />
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
