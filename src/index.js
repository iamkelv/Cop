import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";

import App from "./App";
import "./index.css";

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider); // return the initialized Web3 provider
}
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    </Web3ReactProvider>
  </React.StrictMode>
);
