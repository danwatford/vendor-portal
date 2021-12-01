import React, { useEffect, useState } from "react";

import { ClientPrincipalContextProvider } from "@aaronpowell/react-static-web-apps-auth";

import logo from "./logo.svg";
import "./App.css";
import Layout from "./components/Layout";

function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/get-message?name=Static Web Apps")
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);
  return (
    <div className="App">
      <ClientPrincipalContextProvider>
        <>
          <Layout />
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            {message && <p>{message}</p>}
          </header>
        </>
      </ClientPrincipalContextProvider>
    </div>
  );
}

export default App;
