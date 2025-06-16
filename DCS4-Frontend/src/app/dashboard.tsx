import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { RecentCalculations } from "../components/recent-calculations"
import { StockOverview } from "../components/stock-overview"

export default function Dashboard() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                {/*<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>*/}
                <Tabs defaultValue="overview" className="space-y-4 w-full">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        {/*<TabsTrigger value="predictions">Predictions</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>*/}
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                        {/*<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                                    <LineChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1,248</div>
                                    <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">78.2%</div>
                                    <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12</div>
                                    <p className="text-xs text-muted-foreground">+2 new users this month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Tracked Stocks</CardTitle>
                                    <Star className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">342</div>
                                    <p className="text-xs text-muted-foreground">+24 from last month</p>
                                </CardContent>
                            </Card>
                        </div>*/}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            {/*<Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Market Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <MarketSummary />
                                </CardContent>
                            </Card>*/}
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Stock Overview</CardTitle>
                                    <CardDescription>Overview of our top 8 analyzed stocks</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <StockOverview />
                                </CardContent>
                            </Card>
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Recent Calculations</CardTitle>
                                    <CardDescription>Latest prediction calculations performed by the system</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RecentCalculations />
                                </CardContent>
                            </Card>
                        </div>
                        {/*<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>High Conviction Predictions</CardTitle>
                                    <CardDescription>Predictions with confidence level above 85%</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <HighConvictionPredictions />
                                </CardContent>
                            </Card>
                        </div>*/}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}