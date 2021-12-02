import React, { useEffect, useState } from "react";

import { ClientPrincipalContextProvider } from "@aaronpowell/react-static-web-apps-auth";

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

          {/* {message && <p>{message}</p>} */}
        </>
      </ClientPrincipalContextProvider>
    </div>
  );
}

export default App;
