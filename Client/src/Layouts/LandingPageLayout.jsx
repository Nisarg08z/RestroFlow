import React from "react";
import { Navbar, Footer } from "../components/LandingPageComponents";
import { Outlet } from "react-router-dom";

const LandingPageLayout = () => {

    return (
        <>
            <Navbar />
            <Outlet />
            <Footer/>
        </>
    );
}

export default LandingPageLayout;
