import { Outlet } from "react-router-dom";

const ChefPageLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <main className="flex-1 w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default ChefPageLayout;
