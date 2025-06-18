import { Container } from "../container";
import { Outlet } from "react-router-dom";
import { Header } from "../header";
import { AppFooter } from "../footer";

export const Layout = () => {
    return (
        <>
            <Header />
            <Container>
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4 w-full">
                    <div className="w-full">
                        <Outlet />
                    </div>

                </div>
            </Container>
            <AppFooter/>
        </>
    );
};
