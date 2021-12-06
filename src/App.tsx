import React from "react";

import "./App.css";
import Layout from "./components/Layout";
import { UserProfileContextProvider } from "./services/UserProfileContext";

function App() {
  return (
    <div className="App">
      <UserProfileContextProvider>
        <Layout />
      </UserProfileContextProvider>
    </div>
  );
}

export default App;
