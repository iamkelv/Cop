// Import necessary dependencies
import axios from "axios";
import { BigNumber, ethers, utils } from "ethers";
import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { BsArrowDownUp } from "react-icons/bs";
import { StyledButton, StyledForm } from "./FormComponents";
import { injected } from "../services/provider";
import orderBook from '../artifacts/contracts/OrderBookExec.sol/OrderBookExec.json'
import router from '../artifacts/contracts/Router.sol/Router.json'
import ERC20_ABI from "../artifacts/ercAbi.json";
import { customRouter, OrderBookExec } from "../services/ContractAddress";
import { getPoolFee } from "../services/helpers";
import "../App.css";

// Define a functional component called 'TokenSwapUi'
function TokenSwapUi() {
  // Declare state variables
  const [fromToken, setFromToken] = useState({});
  const [toToken, setToToken] = useState({});
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState(null);
  const [price2, setPrice2] = useState(null);
  const [limit, setLimit] = useState("");
  const [tokenList, setTokenList] = useState([]);
  const [minOut, setMinOut] = useState(0);

  // Use Web3React hook to access Web3 provider
  const { activate, library, account } = useWeb3React();

  // Function to handle change in 'from' token
  const handleFromTokenChange = async (e) => {
    const getTokenObj = tokenList.find((token) => token.id === e.target.value);

    // Use Coingecko API to get price of the selected token
    const getPrice = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${getTokenObj.id}&vs_currencies=usd`
    );
    if (getPrice.status !== 200) return alert("Error fetching price");
    // Update the state variables with the new values
    let price = ethers.utils.commify(getPrice.data[getTokenObj.id].usd);
    setPrice(price);
    setFromToken(getTokenObj);
  };

  // Use React Query hook to retrieve cached data
  const queryClient = useQueryClient("topTokens");
  const topTokens = queryClient.getQueryData("topTokens");

  // Function to handle change in 'to' token
  const handleToTokenChange = async (e) => {
    const getTokenObj = tokenList.find((token) => token.id === e.target.value);

    // Use Coingecko API to get price of the selected token
    const getPrice = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${getTokenObj.id}&vs_currencies=usd`
    );

    if (getPrice.status !== 200) return alert("Error fetching price");

    // Update the state variables with the new values
    let price = ethers.utils.commify(getPrice.data[getTokenObj.id].usd);
    setPrice2(price);
    setToToken(getTokenObj);
  };

  // Function to handle change in amount to swap
  const handleAmountChange = (e) => {
    if (toToken.decimals === undefined)
      return alert("Please select a token to swap ");
    let sell = price.replace(/,/g, "")
    let buy = price2.replace(/,/g, "")
    let displayAmount = ((e.target.value * sell) / buy).toFixed(toToken.decimals);
    console.log(displayAmount)
    setAmount(displayAmount);
  };

  // Function to connect the wallet
  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error(`Error occurred while connecting wallet: ${error.message}`);
    }
  };

  // Function to retrieve user's wallet balance
  const getBalance = async () => {
    try {
      const balance = await library.getBalance(account); // access the library after activating the provider
      console.log(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error(`Error occurred while retrieving balance: ${error.message}`);
    }
  };

  // Function to approve orderbook on the router contract
  async function approveOrderBookExecAsPlugin(RouterContract, OrderBookExec) {
    try {
      await RouterContract.approvePlugin(OrderBookExec);
      console.log("OrderBookExec has been approved as a plugin on the RouterContract.");
    } catch (error) {
      console.error("Error while approving OrderBookExec as a plugin on the RouterContract:", error);
    }
  }

  // Function to set limit trade and update the amount state 
  async function setLimitTrade(e) {
    let sell = price.replace(/,/g, "")
    let limit = (e.target.value / sell).toFixed(toToken.decimals)
    setLimit(e.target.value)
    setAmount(limit)
  }

  // Function to get the swap order from the orderbook
  async function getSwapOrder(orderBookContract, minOut) {
    await orderBookContract.getSwapOrder(account, minOut)
  }

  // Function to swap tokens
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if all fields are filled
    if (!amount || !limit || !toToken.id || !fromToken.id) {
      return alert("all fields are required");
    }


    // Check if Metamask is installed and connected
    if (!window.ethereum || window.ethereum === "undefined" || null) {
      return alert("Please install Metamask");
    }

    // Connect to the user's wallet
    await connectWallet();

    // Get the user's token balance
    await getBalance();

    // Get the pool fee for the given token pair
    const poolFee = await getPoolFee(
      fromToken.id,
      fromToken.decimals,
      toToken.id,
      toToken.decimals
    );
    let fee = await poolFee;
    console.log(await poolFee);
    // Get the user's Web3 provider and signer
    const provider = new ethers.providers.Web3Provider(library.provider);
    const signer = provider.getSigner();

    // Create a contract instance for the token being swapped
    const tokenToSwapContract = new ethers.Contract(
      fromToken.id,
      ERC20_ABI,
      signer
    );

    // Create contract instances for the router and orderbook contracts
    const RouterContract = new ethers.Contract(
      customRouter,
      router.abi,
      signer
    );
    const orderBookContract = new ethers.Contract(
      OrderBookExec,
      orderBook.abi,
      signer
    );

    // Check if the token has been approved for trading on the router contract
    const data = await tokenToSwapContract.allowance(account, customRouter);
    const defaultValue = "0"
    console.log(data.toString());
    if (data.toString() === defaultValue) {
      // Approve the token for trading
      await tokenToSwapContract.approve(
        customRouter,
        ethers.constants.MaxUint256
      );
    }

    // Approve the orderbook contract as a plugin on the router contract
    await approveOrderBookExecAsPlugin(RouterContract, OrderBookExec);
    // Convert the limit value to a BigNumber and calculate the trigger ratio
    const sanitizedValue = limit.replace(/,/g, "");
    if (!BigNumber.isBigNumber(sanitizedValue.toString())) {
      const ratio = BigNumber.from(sanitizedValue.toString());
      const triggerRatio = ratio.mul(BigNumber.from(10).pow(30));
      // Create a swap order on the orderbook contract
      try {
        await orderBookContract.createSwapOrder(
          [fromToken.id, toToken.id],
          [fromToken.decimals, toToken.decimals],
          ethers.utils.parseEther(amount),
          minOut,
          triggerRatio.toString(),
          false,
          utils.parseEther(".005").toString(),
          false,// should wrap true if using native eth token
          false,
          fee,
          {
            value: utils.parseEther(".005")
          }
        )
        let swapOrder = await getSwapOrder(orderBookContract, minOut)
        console.log(swapOrder)
        alert("Swap order created successfully");
      } catch (error) {
        console.log("Error creating swap order:", error);
        alert("Error creating swap order. Please try again later.");
        return;
      }
    }

    // Reset the input values
    setAmount("");
    setToToken({});
    setFromToken({});
    setLimit("");
  };


  useEffect(() => {
    setTokenList(topTokens);
    setMinOut(0)
  }, [topTokens]);

  return (
    <div className="py-[3rem]">
      <AppBody>
        <SwapContainer>
          <SwapHeader>
            <SwapLink1 className="nav-link active" to="/limit">
              Limit SwapOrder
            </SwapLink1>
          </SwapHeader>
          <div className="swapBody">
            <StyledForm onSubmit={handleSubmit} className="token-swap-form">

              <CurrencyInput>
                <Sell className="nav-link active" to="/sell">
                  You sell
                </Sell>
                <select
                  className="token-swap-select text-white bg-body2  p-3 w-[30%] rounded-md"
                  defaultValue={fromToken.name}
                  onChange={handleFromTokenChange}
                >
                  <option value="BTC" hidden>
                    Select Token
                  </option>
                  {tokenList.map((token) => {
                    return (
                      <option key={token.id} value={token.id}>
                        {token.name}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="number"
                  className="bg-inherit p-3  ml-2 text-white w-[68%]"
                  onChange={handleAmountChange}
                />
                {
                  price !== null &&
                  <p className="w-full m-4 text-white ">${price}</p>
                }
              </CurrencyInput>
              <div className="icon">
                <BsArrowDownUp />
              </div>
              <CurrencyInput1>
                <Sell1 className="nav-link active" to="/buy">
                  You buy
                </Sell1>
                <select
                  defaultValue={toToken.name}
                  onChange={handleToTokenChange}
                  className="token-swap-select  p-3 bg-body2 text-white w-[30%] rounded-md"
                >
                  <option value="BTC" hidden>
                    Select Token
                  </option>
                  {tokenList.map((token) => {
                    return (
                      <option key={token.id} value={token.id}>
                        {token.name}
                      </option>
                    );
                  })}
                </select>
                <input
                  className=" bg-body2 text-left  p-3 rounded-md ml-2 text-white w-[68%]"
                  defaultValue={amount}
                />
              </CurrencyInput1>
              <CurrencyInput2>
                <label className=" text-white font-bold">Set Limit</label>
                <input
                  className=" bg-body2 text-left  py-3 rounded-md text-white w-[100%]"
                  // defaultValue={price2 !== null && price2.split('.')[0]}
                  placeholder="$ 100"
                  onChange={setLimitTrade}
                />
              </CurrencyInput2>
              <CurrencyInput3>
                <label className=" text-white font-bold">
                  Price
                </label>
                {
                  price2 !== null &&
                  <p className="font-sm text-sm text-white p-3 w-full"> 1 {toToken.symbol} = $ {price2} </p>
                }
              </CurrencyInput3>
              <StyledButton type="submit" className="token-swap-button">
                Swap Tokens
              </StyledButton>
            </StyledForm>
          </div>
        </SwapContainer>
      </AppBody>
    </div>
  );
}

export default TokenSwapUi;

const AppBody = styled.div`
  // height: 86vh;
  // overflow: hidden;

  padding-top: 120px;
`;

const SwapContainer = styled.div`
  background-color: #131823;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba (0, 0, 0, 0.25);
  width: 560px;
  height: 600px;
  min-height: 100px;
  margin: 0 auto;
  top: 50%;
  border-radius: 24px;
  padding: 16px;
  display: block;
`;

const SwapHeader = styled.div`
  text-align: left;
  padding: 4px 20px 0px 20px;
`;

const SwapLink = styled(Link)`
  color: #fff;
  font-size: 20px;
  margin: 15px;
  font-weight: 600;
`;
const SwapLink1 = styled(Link)`
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  &:hover {
    color: #a0a7ad;
  }
`;

const CurrencyInput = styled.div`
  background-color: #06070a;
  height: 130px;
  margin: 13px !important;
  margin-top: 30px !important;
  padding: 15px;
  border-radius: 20px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 5s ease infinite;
`;

const CurrencyInput1 = styled.div`
  background-color: #06070a;
  height: 130px;
  margin: 10px !important;
  margin-top: 3px !important;
  padding: 15px;
  border-radius: 20px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 5s ease infinite;
`;

const CurrencyInput2 = styled.div`
  background-color: #06070a;
  height: 100px;
  width: 300px;
  margin: 10px !important;
  margin-top: 3px !important;
  padding: 15px;
  border-radius: 20px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 5s ease infinite;
`;

const CurrencyInput3 = styled.div`
  background-color: #06070a;
  height: 100px;
  width: 200px;
  margin: 10px !important;
  margin-top: -112px !important;
  margin-left: 318px !important;
  padding: 15px;
  border-radius: 20px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 5s ease infinite;
`;

const Sell = styled.div`
  color: #a0a7ad;
  font-size: 14px;
  margin-right: 420px;
  &:hover {
    color: #fff;
  }
`;

const Sell1 = styled.div`
  color: #a0a7ad;
  font-size: 14px;
  margin-right: 420px;

  &:hover {
    color: #fff;
  }
`;

const icon = styled.div`
  color: #a0a7ad;
`;