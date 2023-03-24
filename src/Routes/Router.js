import { createBrowserRouter } from "react-router-dom";
import Orders from "../Components/Orders";
import Homepage from "../Pages/Homepage";
import LandingPage from "../Pages/LandingPage";
import SwapTokenPage from "../Pages/SwapTokenPage";
import SwapTokensPage from "../Utils/SwapTokensPage";
import ErrorPage from "../Utils/ErrorPage";
import OrderHistory from "../Components/OrderHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "/SwapToken",
        element: <SwapTokenPage />,
      },
      {
        path: "/SwapTokens",
        element: <SwapTokensPage />,
      },
    ],
  },
]);
