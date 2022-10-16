import React from "react";

//Redux store imports
import store from "./store/store";
import { Provider } from "react-redux";

import { createRoot } from "react-dom/client";
import App from "./App";
const root = createRoot(document.getElementById("root"));

// Wrap Redux store provider around application and pass in store as prop
root.render(
  <Provider store={store}>
    <App tab="home" />
  </Provider>
);
