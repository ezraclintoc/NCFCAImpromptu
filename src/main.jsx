import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import ErrorBoundary from './components/ErrorBoundary.jsx'

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Remove skeleton
const skeleton = document.getElementById('root-skeleton');
if (skeleton) skeleton.remove();

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
