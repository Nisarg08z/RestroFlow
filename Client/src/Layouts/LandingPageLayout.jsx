import React from "react";
import { Navbar, Footer } from "../components/LandingPageComponents";
import { Outlet } from "react-router-dom";

const LandingPageLayout = () => {

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="relative">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
                    <div className="absolute left-1/2 top-[-12rem] h-[26rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                </div>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default LandingPageLayout;
