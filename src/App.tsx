import React from "react";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import Layout from "./components/Layout";
import { ApplicationsContextProvider } from "./services/ApplicationsContext";
import { DraftApplicationsContextProvider } from "./services/DraftApplicationsContext";
import { UserProfileContextProvider } from "./services/UserProfileContext";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <UserProfileContextProvider>
          <DraftApplicationsContextProvider>
            <ApplicationsContextProvider>
              <Layout />
            </ApplicationsContextProvider>
          </DraftApplicationsContextProvider>
        </UserProfileContextProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
