import { Outlet } from "react-router-dom";
import { ChefHeader } from "../components/ChefPageComponents";

const ChefPageLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <ChefHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default ChefPageLayout;
