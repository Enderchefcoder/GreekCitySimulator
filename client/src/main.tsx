import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Add custom styles to match the design reference
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  body {
    background-color: #F5F5DC;
    font-family: 'Open Sans', sans-serif;
  }
  
  .greek-border {
    border-width: 0 0 8px 0;
    border-style: solid;
    border-image: linear-gradient(90deg, #8B4513 10%, #D2B48C 30%, #8B4513 50%, #D2B48C 70%, #8B4513 90%) 1;
  }
  
  .event-card {
    position: relative;
    overflow: hidden;
  }
  
  .event-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #F5F5DC;
    opacity: 0.3;
    z-index: -1;
  }

  .cinzel {
    font-family: 'Cinzel', serif;
  }
`;
document.head.appendChild(styleSheet);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
