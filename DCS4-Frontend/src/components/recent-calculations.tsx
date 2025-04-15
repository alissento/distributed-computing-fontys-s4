import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

const recentCalculations = [
    {
        id: "CALC-1234",
        stock: "AAPL",
        status: "completed",
        date: "2023-04-01T09:00:00",
        duration: "2m 34s",
    },
    {
        id: "CALC-1233",
        stock: "MSFT",
        status: "completed",
        date: "2023-04-01T08:45:00",
        duration: "3m 12s",
    },
    {
        id: "CALC-1232",
        stock: "GOOGL",
        status: "completed",
        date: "2023-04-01T08:30:00",
        duration: "2m 56s",
    },
    {
        id: "CALC-1231",
        stock: "AMZN",
        status: "failed",
        date: "2023-04-01T08:15:00",
        duration: "1m 47s",
    },
    {
        id: "CALC-1230",
        stock: "TSLA",
        status: "completed",
        date: "2023-04-01T08:00:00",
        duration: "2m 23s",
    },
]

export function RecentCalculations() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recentCalculations.map((calc) => (
                    <TableRow key={calc.id}>
                        <TableCell className="font-medium">{calc.id}</TableCell>
                        <TableCell>{calc.stock}</TableCell>
                        <TableCell>
                            <Badge variant={calc.status === "completed" ? "default" : "destructive"}>{calc.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(calc.date).toLocaleString()}</TableCell>
                        <TableCell>{calc.duration}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}