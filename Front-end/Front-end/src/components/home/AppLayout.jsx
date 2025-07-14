import React from 'react'
import Navbar from '../components/home/Navbar';
import { Outlet } from 'react-router-dom';
import Footer from '../components/home/Footer';

export default function AppLayout() {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
