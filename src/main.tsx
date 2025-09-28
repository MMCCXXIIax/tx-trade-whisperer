import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure TX dark theme is applied by default
document.documentElement.classList.add('dark');
document.body.style.background = 'hsl(210 25% 8%)';

createRoot(document.getElementById("root")!).render(<App />);
