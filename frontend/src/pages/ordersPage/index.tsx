//@ts-nocheck
import React from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardBody,
    Spinner,
    Chip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button
} from "@nextui-org/react";
import { useGetOrdersByUserQuery } from "../../app/services/userApi";
import { VerticalDotsIcon } from "../../components/icons/VerticalDotsIcon";
import { formatDate } from "../../app/utils/dateUtils";

export const OrdersPage: React.FC = () => {
    const userId = parseInt(localStorage.getItem("userId")!, 10);
    const { data: orders, isLoading, error } = useGetOrdersByUserQuery({ userId });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-danger">
                Произошла ошибка при загрузке заказов. Пожалуйста, попробуйте позже.
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="p-4 text-center">
                <h2 className="text-xl font-semibold">У вас пока нет заказов</h2>
                <p className="text-gray-500 mt-2">Ваши заказы будут отображаться здесь</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "success";
            case "processing":
                return "primary";
            case "shipped":
                return "secondary";
            case "cancelled":
                return "danger";
            default:
                return "default";
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Мои заказы</h1>

            <Table aria-label="Orders table" className="mb-8">
                <TableHeader>
                    <TableColumn>ЗАКАЗ</TableColumn>
                    <TableColumn>ДАТА</TableColumn>
                    {/*<TableColumn>СТАТУС</TableColumn>*/}
                    <TableColumn>СУММА</TableColumn>
                    {/*<TableColumn>ДЕЙСТВИЯ</TableColumn>*/}
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            {/*<TableCell>*/}
                            {/*    /!*<Chip color={getStatusColor(order.status)} variant="flat">*!/*/}
                            {/*    /!*    {order.status}*!/*/}
                            {/*    /!*</Chip>*!/*/}
                            {/*</TableCell>*/}
                            <TableCell>{order.finalAmount.toFixed(2)}руб</TableCell>
                            {/*<TableCell>*/}
                            {/*    <Dropdown>*/}
                            {/*        <DropdownTrigger>*/}
                            {/*            <Button isIconOnly size="sm" variant="light">*/}
                            {/*                <VerticalDotsIcon className="text-default-300" />*/}
                            {/*            </Button>*/}
                            {/*        </DropdownTrigger>*/}
                            {/*        <DropdownMenu>*/}
                            {/*            <DropdownItem>Просмотреть детали</DropdownItem>*/}
                            {/*            <DropdownItem>Повторить заказ</DropdownItem>*/}
                            {/*            {order.status === "Processing" && (*/}
                            {/*                <DropdownItem className="text-danger">Отменить заказ</DropdownItem>*/}
                            {/*            )}*/}
                            {/*        </DropdownMenu>*/}
                            {/*    </Dropdown>*/}
                            {/*</TableCell>*/}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <h2 className="text-xl font-semibold mb-4">Детали заказов</h2>
            <div className="space-y-6">
                {orders.map((order) => (
                    <Card key={order.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold">Заказ #{order.id}</h3>
                                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Chip color={getStatusColor(order.status)} variant="flat">
                                    {order.status}
                                </Chip>
                                <span className="font-bold">{order.finalAmount.toFixed(2)}руб</span>
                            </div>
                        </div>

                        <CardBody className="pt-4">
                            <div className="flex justify-between border-t pt-4">
                                <div>
                                    <h4 className="font-semibold">Адрес доставки</h4>
                                    <p className="text-sm text-gray-500">{order.address || "Не указан"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">Итого: {order.finalAmount.toFixed(2)}руб</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
};