import logo from './jimlogo.png';
import bg from './jimsbg.jpg';
import './App.css';
import { useEffect, useState } from 'react';
import { useActiveWeb3React } from './network/connectors';
import { injected } from './network/connectors';
import { useWeb3React } from '@web3-react/core';
import Web3ReactManager from './network/Web3Manager';
import { Contract } from '@ethersproject/contracts';
import { ABI, address as mintContractAddress } from './mintContract';

function shortenAddress(address, chars = 4) {
  return `${address.substring(0, chars + 2)}...${address.substring(
    42 - chars
  )}`;
}

function App() {
  const { activate, active } = useWeb3React();
  const { account, library } = useActiveWeb3React();
  const [mintCount, setMintCount] = useState(0);
  const [amountToMint, setAmountToMint] = useState(1);

  useEffect(() => {
    async function fetch() {
      try {
        const contract = new Contract(mintContractAddress, ABI, library);
        const mintCount = await contract.totalSupply();
        setMintCount(mintCount.toNumber());
      } catch (e) {
        console.log(e);
      }
    }
    fetch();
  }, [library]);

  const handleMint = async () => {
    const mintContract = new Contract(
      mintContractAddress,
      ABI,
      library.getSigner(account).connectUnchecked()
    );
    const success = await mintContract.mintApe(amountToMint);
    return success;
  };

  return (
    <Web3ReactManager>
      <div className="App">
        {/* {Array.from(Array(50)).map((x, i) => {
          return <div class="snowflake"></div>;
        })} */}

        <button
          className={'connect-button'}
          onClick={(e) => {
            e.preventDefault();
            activate(injected);
          }}
        >
          {active ? `Connected: ${shortenAddress(account)}` : 'Connect'}
        </button>
        <header
          className="App-header"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <img src={logo} className="App-logo" alt="logo" />

          <div class="item button-parrot">
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!active) {
                  activate(injected);
                } else {
                  handleMint();
                }
              }}
            >
              {active ? 'Mint' : 'Connect Wallet!'}
              {Array.from(Array(6)).map((x, i) => {
                return <div class="stroke parrot"></div>;
              })}
            </button>
          </div>
          <p>
            <span>
              <input
                className="input"
                type="number"
                max="3"
                placeholder="amount (up to 3)"
                onChange={(e) => {
                  e.preventDefault();
                  setAmountToMint(e.target.value);
                }}
              ></input>
            </span>
          </p>
          <p className="stroke">{103}/1024 minted</p>
        </header>
      </div>
    </Web3ReactManager>
  );
}

export default App;
