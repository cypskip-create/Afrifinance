import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply persisted font-size preference before first paint.
const savedScale = localStorage.getItem("app_font_scale");
if (savedScale) document.documentElement.style.setProperty("--app-font-scale", savedScale);

createRoot(document.getElementById("root")!).render(<App />);
