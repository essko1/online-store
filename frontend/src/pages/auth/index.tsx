// Auth component
import {Card, CardBody, CardFooter, Tab, Tabs} from "@nextui-org/react";
import { useState } from "react";
import { Login } from "../../features/user/login";
import { Register } from "../../features/user/register";
import { useRestoreAuthentication } from "../../hooks/useAuthGuard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaStar, FaShieldAlt,FaTruck  } from "react-icons/fa";
import { motion } from "framer-motion";

export const Auth = () => {
    const [selected, setSelected] = useState("login");

    useRestoreAuthentication();

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex flex-col">
                <Card className="max-w-full w-[380px] h-[480px] shadow-lg">
                    <h1 className="text-center my-[20px] text-2xl font-bold text-primary">FreshStore</h1>
                    <CardBody className="overflow-hidden">
                        <Tabs
                            fullWidth
                            size="lg"
                            selectedKey={selected}
                            onSelectionChange={(key) => setSelected(key as string)}
                            classNames={{
                                tabList: "gap-6 w-full",
                                cursor: "bg-transparent",
                                tab: "px-4 h-12",
                            }}
                        >
                            <Tab key="login" title="Вход">
                                <Login setSelected={setSelected} />
                            </Tab>
                            <Tab key="register" title="Регистрация" >
                                <Register setSelected={setSelected} />
                            </Tab>
                        </Tabs>
                    </CardBody>
                    <CardFooter className="justify-center bg-white p-6">
                        <motion.span
                            className="text-black font-bold text-lg md:text-xl text-center"
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            whileHover={{ scale: 1.01 }}
                        >
                            🛍️ Покупайте только у нас - лучшие цены и качество! 🛍️
                        </motion.span>
                    </CardFooter>
                </Card>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};