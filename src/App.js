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
import { Drawer } from 'antd';
import { JimPreview } from './JimPreview';

const EXAMPLE_METADATA = {
  name: 'Jim #1',
  description:
    'A collection of 1024 unique Jims, made with <3 by FingerprintsDAO.',
  image: 'ipfs://QmeUf98Zwrm7EzSeWwtzmFDb8tWLi2DeDRBrdoGgwAEpux/1.png',
  dna: '3296ea3808c6c9ede4d656e875192d40fc313a2f',
  edition: 1,
  attributes: [
    {
      trait_type: 'Background',
      value: 'Void',
    },
    {
      trait_type: 'Body',
      value: 'Jim Bedtime',
    },
    {
      trait_type: 'Mouth',
      value: 'Fingerprints',
    },
    {
      trait_type: 'Head',
      value: 'Deafbeef Cap',
    },
    {
      trait_type: 'Eyes',
      value: '3d',
    },
    {
      trait_type: 'Accessory',
      value: 'None',
    },
  ],
};

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
  const [drawerVisible, setDrawerVisible] = useState(false);

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
        <div className={'top-right'}>
          {active && (
            <button
              className={'view-jims-button'}
              onClick={(e) => {
                e.preventDefault();
                setDrawerVisible(true);
              }}
            >
              View my Jims
            </button>
          )}

          <button
            className={'connect-button'}
            onClick={(e) => {
              e.preventDefault();
              activate(injected);
            }}
          >
            {active ? `Connected: ${shortenAddress(account)}` : 'Connect'}
          </button>
        </div>
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
                className="amount-input"
                type="number"
                placeholder="Amount (up to 10)"
                onChange={(e) => {
                  e.preventDefault();
                  setAmountToMint(e.target.value);
                }}
              ></input>
            </span>
          </p>
          <p className="stroke">Current Price: 0.069 ETH</p>
          <p className="stroke">{103}/2048 minted</p>
        </header>
        <Drawer
          placement={'left'}
          closable={false}
          onClose={() => {
            setDrawerVisible(false);
          }}
          contentWrapperStyle={{
            height: '75%',
            top: '12.5%',
          }}
          bodyStyle={{ fontFamily: 'Schoolbell', fontSize: '14px' }}
          visible={drawerVisible}
        >
          <JimPreview metadata={EXAMPLE_METADATA} />
          <JimPreview metadata={EXAMPLE_METADATA} />
          <JimPreview metadata={EXAMPLE_METADATA} />
          <JimPreview metadata={EXAMPLE_METADATA} />
          <JimPreview metadata={EXAMPLE_METADATA} />
        </Drawer>
      </div>
    </Web3ReactManager>
  );
}

export default App;
