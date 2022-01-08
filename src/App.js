import logo from "./jimlogo.png";
import bg from "./jimsbg.jpg";
import "./App.css";
import { useEffect, useState } from "react";
import { useActiveWeb3React } from "./network/connectors";
import { injected } from "./network/connectors";
import { useWeb3React } from "@web3-react/core";
import Web3ReactManager from "./network/Web3Manager";
import { Contract } from "@ethersproject/contracts";
import { ABI, address as mintContractAddress } from "./mintContract";
import { Drawer } from "antd";
import { JimPreview } from "./JimPreview";
import axios from "axios";

const METADATA_PREFIX = "QmcnnBXi99renVhnr3wX14TEj3k2EiGHFnn1gQGJhZBmeX";
const getTokenUri = (id) => {
  return `https://gateway.pinata.cloud/ipfs/${METADATA_PREFIX}/${id}`;
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
  const [jimsOwned, setJimsOwned] = useState([]);

  useEffect(() => {
    async function fetch() {
      try {
        const contract = new Contract(mintContractAddress, ABI, library);
        const mintCount = await contract.totalSupply();
        setMintCount(mintCount.toNumber());

        if (active) {
          // const owned = await contract.getJimsOwned(account)
          const owned = [1, 65, 123, 999, 48, 12, 412];
          const ownedMetadata = await Promise.all(
            owned.map(async (id) => {
              const resp = await axios.get(getTokenUri(id));
              return resp.data;
            })
          );
          setJimsOwned(ownedMetadata);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetch();
  }, [library, active]);

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
        <div className={"top-right"}>
          {active && (
            <button
              className={"view-jims-button"}
              onClick={(e) => {
                e.preventDefault();
                setDrawerVisible(true);
              }}
            >
              View my Jims
            </button>
          )}

          <button
            className={"connect-button"}
            onClick={(e) => {
              e.preventDefault();
              activate(injected);
            }}
          >
            {active ? `Connected: ${shortenAddress(account)}` : "Connect"}
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
              {active ? "Mint" : "Connect Wallet!"}
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
          <p className="stroke">Price: 0.069 ETH</p>
          <div style={{ fontSize: "30px" }}>
            <p className="stroke">Mints remaining: {856}/1526</p>
            <p
              className="stroke"
              style={{
                fontSize: "24px",
                background: "#1890ff",
                padding: "0px 6px",
              }}
            >
              Jims is not an investment. This project is a fun,
              community-building NFT! By minting, you understand this.
            </p>
          </div>
        </header>
        <Drawer
          placement={"left"}
          closable={false}
          onClose={() => {
            setDrawerVisible(false);
          }}
          contentWrapperStyle={{
            height: "75%",
            top: "12.5%",
          }}
          bodyStyle={{ fontFamily: "Schoolbell", fontSize: "14px" }}
          visible={drawerVisible}
        >
          {jimsOwned.length !== 0 &&
            jimsOwned.map((metadata) => <JimPreview metadata={metadata} />)}
          {jimsOwned.length === 0 && (
            <p style={{ fontSize: "24px", textAlign: "center" }}>
              No jims detected... mint!
            </p>
          )}
        </Drawer>
      </div>
    </Web3ReactManager>
  );
}

export default App;
