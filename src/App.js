import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./Routes/Router";
// import WalletCardEthers from "./Components/Wallet";

function App() {
  return (
    <div>
      {/* <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div> */}
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
