//@ts-nocheck
import React, { useState } from "react";
import {
    useGetStatisticsQuery,
    useGetCategoryStatsQuery
} from "../../app/services/userApi";
import {
    Spinner,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableHeader,
    TableColumn,
    Input,
    Tabs,
    Tab,
    Card,
    CardBody,
    Divider,
    Chip,
    Select,
    SelectItem
} from "@nextui-org/react";
import { ErrorMessage } from "../../components/error-message";
import { FaSearch, FaChartLine, FaMoneyBillWave, FaBoxOpen } from "react-icons/fa";

export const StatisticsPage: React.FC = () => {
    const { data, isLoading, error } = useGetStatisticsQuery();
    // const { data: categoryStats } = useGetCategoryStatsQuery();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [timeFilter, setTimeFilter] = useState<string>("all");

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Spinner size="lg" label="Загрузка статистики..." />
        </div>
    );

    if (error) return <ErrorMessage error="Ошибка при загрузке статистики" />;

    const filteredStatistics = data?.statistics?.filter((stat) =>
        stat.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stat.product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // const filteredCategoryStats = categoryStats?.filter((cat) =>
    //     cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'BYN'
        }).format(amount);
    };

    return (
        <div className="statistics-page p-4 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaChartLine /> Статистика продаж
            </h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                    type="text"
                    placeholder="Поиск по товару или категории"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/2"
                    startContent={<FaSearch className="text-gray-400" />}
                />
                <Select
                    label="Период"
                    className="w-full md:w-1/4"
                    selectedKeys={[timeFilter]}
                    onChange={(e) => setTimeFilter(e.target.value)}
                >
                    <SelectItem key="all" value="all">Все время</SelectItem>
                    <SelectItem key="month" value="month">Последний месяц</SelectItem>
                    <SelectItem key="week" value="week">Последняя неделя</SelectItem>
                </Select>
            </div>

            <Tabs aria-label="Sales statistics tabs" className="mb-6">
                <Tab
                    key="summary"
                    title={
                        <div className="flex items-center gap-2">
                            <FaMoneyBillWave /> Общая статистика
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="bg-blue-50 dark:bg-blue-500">
                            <CardBody className="p-4">
                                <p className="text-sm text-gray-600 dark:text-white">Общая выручка</p>
                                <p className="text-2xl font-bold dark:text-white">
                                    {formatCurrency(data?.totalRevenue || 0)}
                                </p>
                            </CardBody>
                        </Card>
                        <Card className="bg-green-50 dark:bg-green-500">
                            <CardBody className="p-4">
                                <p className="text-sm text-gray-600 dark:text-white">Всего продано товаров</p>
                                <p className="text-2xl font-bol dark:text-whited">{data?.totalSold || 0}</p>
                            </CardBody>
                        </Card>
                        <Card className="bg-purple-50 dark:bg-purple-500">
                            <CardBody className="p-4">
                                <p className="text-sm text-gray-600 dark:text-white">Средний чек</p>
                                <p className="text-2xl font-bold dark:text-white">
                                    {formatCurrency(data?.totalRevenue / (data?.totalSold || 1))}
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </Tab>

                <Tab
                    key="products"
                    title={
                        <div className="flex items-center gap-2">
                            <FaBoxOpen /> Статистика по товарам
                        </div>
                    }
                >
                    <Table
                        aria-label="Product sales statistics"
                        isStriped
                        className="mt-4"
                    >
                        <TableHeader>
                            <TableColumn>ТОВАР</TableColumn>
                            <TableColumn>КАТЕГОРИЯ</TableColumn>
                            <TableColumn>ЦЕНА</TableColumn>
                            <TableColumn>ВЫРУЧКА</TableColumn>
                            <TableColumn>ПРОДАНО</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {filteredStatistics?.map((stat) => (
                                <TableRow key={stat.id}>
                                    <TableCell className="font-medium">
                                        {stat.product.title}
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">
                                            {stat.product.category?.name || 'Без категории'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(stat.product.price)}
                                    </TableCell>
                                    <TableCell className="font-semibold text-green-600">
                                        {formatCurrency(stat.totalRevenue)}
                                    </TableCell>
                                    <TableCell>{stat.totalSold}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Tab>
            </Tabs>

            <Divider className="my-6" />

            <div className="text-sm text-gray-500">
                Данные обновляются ежедневно в 00:00
            </div>
        </div>
    );
};

export default StatisticsPage;