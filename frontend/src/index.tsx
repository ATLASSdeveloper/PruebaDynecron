import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    fetch("/api/hello")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, []);

  return <h1>{message || "Cargando..."}</h1>;
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
