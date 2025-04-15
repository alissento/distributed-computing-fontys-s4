import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Checkbox } from "../../components/ui/checkbox"
import { Separator } from "../../components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {toast} from "sonner";
import {cn} from "@/lib/utils.ts";

const calculationFormSchema = z.object({
    stockSymbol: z.string().min(1, {
        message: "Stock symbol is required.",
    }),
    timeframe: z.string({
        required_error: "Please select a timeframe.",
    }),
    startDate: z.date({
        required_error: "Start date is required.",
    }),
    endDate: z.date({
        required_error: "End date is required.",
    }),
    includeMarketSentiment: z.boolean().default(false),
    includeNewsAnalysis: z.boolean().default(false),
    includeTechnicalIndicators: z.boolean().default(true),
    priority: z.string().default("normal"),
})

type CalculationFormValues = z.infer<typeof calculationFormSchema>

const defaultValues: Partial<CalculationFormValues> = {
    stockSymbol: "",
    timeframe: "1w",
    includeMarketSentiment: false,
    includeNewsAnalysis: false,
    includeTechnicalIndicators: true,
    priority: "normal",
}

export default function AdminCalculations() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CalculationFormValues>({
        resolver: zodResolver(calculationFormSchema),
        defaultValues,
    })

    function onSubmit(data: CalculationFormValues) {
        setIsSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            console.log(data)
            setIsSubmitting(false)
            toast("Calculation request submitted", {
                description: `Calculation for ${data.stockSymbol} has been queued.`,
            })
            form.reset(defaultValues)
        }, 2000)
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Calculation Requests</h2>
            </div>

            <Tabs defaultValue="new" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="new">New Calculation</TabsTrigger>
                    <TabsTrigger value="batch">Batch Processing</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled Jobs</TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Calculation Request</CardTitle>
                            <CardDescription>
                                Create a new stock prediction calculation request that will be processed by the backend.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="stockSymbol"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Stock Symbol</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="AAPL" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Enter the stock symbol (e.g., AAPL for Apple Inc.)</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="timeframe"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Prediction Timeframe</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a timeframe" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="1d">1 Day</SelectItem>
                                                            <SelectItem value="1w">1 Week</SelectItem>
                                                            <SelectItem value="2w">2 Weeks</SelectItem>
                                                            <SelectItem value="1m">1 Month</SelectItem>
                                                            <SelectItem value="3m">3 Months</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>How far into the future to predict</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="priority"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Processing Priority</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select priority" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="low">Low</SelectItem>
                                                            <SelectItem value="normal">Normal</SelectItem>
                                                            <SelectItem value="high">High</SelectItem>
                                                            <SelectItem value="urgent">Urgent</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>Set the processing priority for this calculation</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Start Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormDescription>Historical data start date</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>End Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormDescription>Historical data end date</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Additional Options</h3>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="includeTechnicalIndicators"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>Technical Indicators</FormLabel>
                                                            <FormDescription>Include technical analysis indicators</FormDescription>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="includeMarketSentiment"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>Market Sentiment</FormLabel>
                                                            <FormDescription>Include market sentiment analysis</FormDescription>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="includeNewsAnalysis"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>News Analysis</FormLabel>
                                                            <FormDescription>Include news sentiment analysis</FormDescription>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Submit Calculation Request"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="batch" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Processing</CardTitle>
                            <CardDescription>Upload a CSV file with multiple stocks to process in batch.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="batch-file">CSV File</Label>
                                <Input id="batch-file" type="file" accept=".csv" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Upload and Process</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="scheduled" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scheduled Jobs</CardTitle>
                            <CardDescription>Configure recurring calculation jobs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Scheduled jobs feature coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => (
    <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
        {children}
    </label>
)