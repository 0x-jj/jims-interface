import logo from "./jimlogo.png";
import "./App.css";
import { useEffect, useState } from "react";
import { useActiveWeb3React } from "./network/connectors";
import { injected } from "./network/connectors";
import { useWeb3React } from "@web3-react/core";
import Web3ReactManager from "./network/Web3Manager";
import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";

import { ABI, address as mintContractAddress } from "./mintContract";
import { Drawer, notification } from "antd";
import { JimPreview } from "./JimPreview";
import axios from "axios";

const openNotification = (content) => {
  notification.error({
    message: `Error`,
    description: content,
    placement: "topLeft",
    className: "notif",
    duration: 10,
  });
};

const METADATA_PREFIX = "Qmf3yLqLE2DwpvN4MmPyy7bkCGXZFzf8EJPRoYiebJN96X";
const getTokenUri = (id) => {
  return `https://fingerprints.mypinata.cloud/ipfs/${METADATA_PREFIX}/${id}`;
};

function shortenAddress(address, chars = 4) {
  return `${address.substring(0, chars + 2)}...${address.substring(
    42 - chars
  )}`;
}

function App() {
  const { activate, active } = useWeb3React();
  const { account, library } = useActiveWeb3React();
  const [mintCount, setMintCount] = useState(null);
  const [amountToMint, setAmountToMint] = useState(3);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [jimsOwned, setJimsOwned] = useState([]);
  const [mintStarted, setMintStarted] = useState(true);
  const [publicMintStarted, setPublicMintStarted] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const contract = new Contract(mintContractAddress, ABI, library);
        const mintStarted = await contract.mintAllowed();
        const mintCount = await contract.totalSupply();
        const publicMintStarted = await contract.publicSaleStarted();
        setPublicMintStarted(publicMintStarted);
        setMintStarted(mintStarted);
        setMintCount(mintCount.toNumber());

        if (active) {
          const owned = await contract.allOwned(account);
          const ownedMetadata = await Promise.all(
            owned.map(async (id) => {
              try {
                const resp = await axios.get(getTokenUri(id));
                return resp.data;
              } catch (e) {
                console.log(e);
              }
            })
          );
          setJimsOwned(ownedMetadata);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetch();
  }, [library, active, account]);

  const handleMint = async () => {
    if (!mintStarted) {
      openNotification("Minting hasn't started yet!");
      return;
    }
    if (active && !publicMintStarted && amountToMint != 1) {
      openNotification("You can only mint 1 Jim in presale");
      return;
    } else if (active && publicMintStarted && amountToMint > 20) {
      openNotification("You can only mint 20 Jims per transaction");
      return;
    }

    const mintContract = new Contract(
      mintContractAddress,
      ABI,
      library.getSigner(account).connectUnchecked()
    );
    try {
      const success = await mintContract.mint(amountToMint, {
        value: ethers.utils.parseEther("0.069").mul(amountToMint),
      });
      return success;
    } catch (e) {
      if (e.code == 4001) {
        console.log("tx rejected");
        return;
      } else {
        const msg = JSON.stringify(e);
        if (msg.includes("not eligible")) {
          openNotification(
            "Either you are not whitelisted or you have already pre-minted. Come back in a few minutes for the public mint!"
          );
        } else {
          alert(JSON.stringify(e));
        }
      }
    }
  };

  return (
    <Web3ReactManager>
      <div className="App">
        {mintStarted && (
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
        )}

        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <>
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
                {active && publicMintStarted
                  ? "Mint"
                  : active && !publicMintStarted
                  ? "Pre-mint"
                  : "Connect Wallet!"}
                {Array.from(Array(6)).map((x, i) => {
                  return <div className="stroke parrot"></div>;
                })}
              </button>
            </div>
            <p>
              <span>
                <input
                  className="amount-input"
                  type="number"
                  placeholder="Amount"
                  defaultValue={3}
                  onChange={(e) => {
                    e.preventDefault();
                    setAmountToMint(e.target.value);
                  }}
                ></input>
              </span>
            </p>
            <p className="stroke">Price: 0.069 ETH</p>
            <div style={{ fontSize: "30px" }}>
              <p className="stroke">
                Mints remaining: {mintCount !== null ? 2048 - mintCount : null}
                /2048
              </p>
              <p
                className="stroke"
                style={{
                  fontSize: "24px",
                  background: "#1890ff",
                  padding: "0px 6px",
                }}
              >
                Jims is not an investment. This is a fun, non-speculative
                profile picture project! By FingerprintsDAO and Gremplin. CC0.
                By minting, you understand this.
              </p>
            </div>
          </>
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
