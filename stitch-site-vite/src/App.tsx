import React, { useState, useEffect } from 'react'
import { LandingPage } from './LandingPage'
import { DocsPage } from './DocsPage'
import './index.css' // Import Tailwind directives and tokens

function App() {
    const [page, setPage] = useState('home');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#docs') setPage('docs');
            else setPage('home');
        };

        window.addEventListener('hashchange', handleHashChange);
        // Handle initial hash
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <>
            {page === 'home' && <LandingPage />}
            {page === 'docs' && <DocsPage />}
        </>
    )
}

export default App
