import React from "react";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import Layout from "./components/Layout";
import { ApplicationsContextProvider } from "./services/ApplicationsContext";
import { UserProfileContextProvider } from "./services/UserProfileContext";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <UserProfileContextProvider>
          <ApplicationsContextProvider>
            <Layout />
          </ApplicationsContextProvider>
        </UserProfileContextProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
