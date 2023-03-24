import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { IoWalletSharp } from "react-icons/io5";
import "../App.css";

const Navbar = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");
  const [provider, setProvider] = useState(null);

  const connectWalletHandler = () => {
    if (window.ethereum && defaultAccount == null) {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));

      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          setConnButtonText(
            result[0].length > 10 ? result[0].slice(0, 10) + "..." : result[0]
          );
          setDefaultAccount();
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    } else if (!window.ethereum) {
      console.log("Need to install MetaMask");
      setErrorMessage("Please install MetaMask browser extension to interact");
    }
  };

  useEffect(() => {
    if (defaultAccount) {
      provider.getBalance(defaultAccount).then((balanceResult) => {
        setUserBalance(ethers.utils.formatEther(balanceResult));
      });
    }
  }, []);

  return (
    <div
      className="walletCard
    text-white font-medium  justify-between p-[1rem] space-y-2 mb-4 flex items-center rounded-lg"
    >
      <Link to="/" className="logo w-[30%] ">
        {" "}
        Prove of Concept{" "}
      </Link>
      <div className="flex  w-[40%]">
        <ul className="list-none flex w-full hover:cursor-pointer items-center justify-evenly text-xl font-bold">
          <li className="text-txt hover:text-headers text">Limit Trade</li>
          <Link to="/SwapTokens" className="text-txt hover:text-headers">
            Swap Tokens
          </Link>
          <li className="text-txt hover:text-headers">About Us</li>
        </ul>
      </div>
      <div className="flex items-center justify-evenly w-[30%]">
        <button
          onClick={connectWalletHandler}
          className="p-3 w-[28%] font-s flex font-bold border-none text-txt hover:border-headers hover:cursor-pointer hover:text-white hover:bg-headers bg-button rounded-lg"
        >
          <IoWalletSharp className="text-2xl " />
          {connButtonText}
        </button>
        <select
          name=""
          id=""
          className="w-[35%] font-bold border-none text-txt hover:border-headers hover:cursor-pointer hover:text-white hover:bg-headers p-3 rounded-lg bg-button "
        >
          <option value={"Networks"} hidden>
            Networks
          </option>
          <option className="text-black">
            <span>
              <img src="" alt="icon" />
            </span>
            LocalHost
          </option>
        </select>
      </div>
    </div>
  );
};

export default Navbar;
