import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { SUB_GRAPH_API } from "../services/Constants";
import Loading from "../Utils/Loading";
import ErrorPage from "../Utils/ErrorPage";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "../App.css";
// import CryptoIcon from "../Components/CryptoIcon";
function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const onClickSwap = (e) => {
    // console.log(e.target.id);
    navigate(`/SwapToken`);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // handle form submission
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const fetchTopTokens = useQuery(
    "topTokens",
    async () => {
      const query = `
      {
       tokens(where: {}, orderBy: volumeUSD, orderDirection: desc) {
      id
      name
      decimals
      feesUSD
      derivedETH
      poolCount
      symbol
      volumeUSD
      volume
      untrackedVolumeUSD
      txCount
      totalValueLocked
      totalValueLockedUSDUntracked
      totalValueLockedUSD
      totalSupply
    }
      }
     `;
      const data = await axios.post(SUB_GRAPH_API, { query: query });
      console.log(data.data.data.tokens);
      return data.data.data.tokens;
    },

    {
      // Refetch the data every 30 minutes
      staleTime: 1000 * 60 * 30, // 30 minutes in milliseconds
      // Enable background updates so the data is always up-to-date
      refetchIntervalInBackground: true,
    }
  );

  const { data: tokens, isLoading: loading, error } = fetchTopTokens;
  useEffect(() => {
    setIsLoading(loading);
    setData(tokens);
    setIsLoading(loading);
  }, [tokens, setData, loading, setIsLoading]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return < ErrorPage message={error.message} />;
  }

  return (
    <div className="w-full p-[2rem] h-full ">
      <div className="w-full h-full flex flex-col ">
        <div className="header">
          <h1 className="text1 text-5xl ml-10 text-white font-bold text-center">
            Welcome to the Prove of Concept
          </h1>
          <p className="text2 text-xl text-white font-medium text-center">
            This is a simple dApp that allows you to Trade your cryptocurrency
          </p>
          <img
            src="https://www.neteller.com/fileadmin/content/Cryptocurrency/buy_and_sell/NT_What_Is_Crypto.png"
            alt=""
            style={{
              width: "45%",
              marginLeft: "60%",
              height: "10%",
            }}
          />
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/bitcoin-mining-4292737-3562242.png"
            alt=""
            style={{
              marginTop: "-25%",
              width: "45%",
            }}
          />
        </div>
        <div className="tab w-full h-full flex flex-col items-center my-20 space-y-8 ">
          <h1 className="text-3xl  text-center text-white mt-20 hover:text-white font-bold">
            Search a currency
          </h1>
          <div>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleInputChange}
                className="search-bar-input"
              />
              {/* <button type="submit">Search</button> */}
            </form>
          </div>
          <table className="w-[80%] bg-body rounded-3xl flex flex-col min-h-[300px] p-2">
            {/* <thead className="flex w-[100]  justify-evenly items-start">
              <tr className="w-[20%] m-1 p-2 text-xl text-white font-sans font-bold">
                SYMBOL
              </tr>
              <tr className="w-[20%] m-1 p-2 text-xl text-white font-sans font-bold">
                NAME
              </tr>
              <tr className="w-[20%] m-1 p-2 text-xl text-white font-sans font-bold">
                TOTAL SUPPLY
              </tr>
              <tr className="w-[20%] m-1 p-2 text-xl text-white font-sans font-bold">
                VOLUME
              </tr>
              <tr className="w-[20%] m-1 p-2  text-xl font-sans font-bold"></tr>
            </thead> */}
            {data?.map((token, index) => {
              // let icon = cryptoIcons.get(token.symbol);
              let volume = ethers.utils.commify(token.volume.split(".")[0]);
              return (
                <tbody
                  className="w-[100%] flex text-white hover:text-headers justify-evenly items-start border-b-1"
                  key={index}
                >

                  {/* <CryptoIcon symbol={token.symbol} size={40} color="#f7931a" /> */}
                  <tr className="w-[20%]  m-1 p-3 text-xl font-sans font-bold">
                    {token.symbol}
                  </tr>
                  <tr className="w-[20%] m-1 p-2 text-xl font-sans font-bold">
                    {token.name}
                  </tr>
                  <tr className="w-[20%] m-1 p-2 text-xl font-sans font-bold">
                    ${volume}
                  </tr>
                  <tr className="w-[20%] m-1 text-white text-xl font-sans font-bold">
                    <button
                      onClick={onClickSwap}
                      id={token.id}
                      className="p-2 bg-button hover:bg-headers hover:text-white px-8 rounded-full "
                    >
                      Swap
                    </button>
                  </tr>
                </tbody>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
