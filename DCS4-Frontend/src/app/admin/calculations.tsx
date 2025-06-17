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
import jobsAPI from "@/api/JobsAPI.ts";

const calculationFormSchema = z.object({
    stock_symbol: z.string().min(1, "Stock symbol is required.").max(5, "Stock symbol must be between 1 and 5 characters long."),
    processing_type: z.string().min(1, "Processing type is required.").max(35, "Processing type must be between 1 and 35 characters long."),
    jump_days: z.number({
        required_error: "Please select a valid timeframe.",
        invalid_type_error: "Please select a valid timeframe."
    }).int().min(1, "Jump days must be between 1 and 10.").max(10, "Jump days must be between 1 and 10."),
    start_date: z.date({
        required_error: "Start date is required.",
    }),
    end_date: z.date({
        required_error: "End date is required.",
    }),
}).refine((data) => {
    if (data.start_date > data.end_date) {
        return "Start date must be before end date.";
    }
    if (data.end_date.getTime() - data.start_date.getTime() > 31536000000) {
        return "End date must be within 1 year.";
    }
    return true;
}, "Invalid date range.");

type CalculationFormValues = z.infer<typeof calculationFormSchema>

const defaultValues: Partial<CalculationFormValues> = {
    stock_symbol: "",
    processing_type: "Predict_Average",
    jump_days: 2
}

export default function AdminCalculations() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CalculationFormValues>({
        resolver: zodResolver(calculationFormSchema),
        defaultValues,
    })

    function onSubmit(data: CalculationFormValues) {
        setIsSubmitting(true)

        jobsAPI.submitStockRequest(data).finally(resetForm)

    }

    function resetForm() {
        form.reset(defaultValues)
        setIsSubmitting(false)
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Calculation Requests</h2>
            </div>

            <Tabs defaultValue="new" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="new">New Calculation</TabsTrigger>
                    {/*<TabsTrigger value="batch">Batch Processing</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled Jobs</TabsTrigger>*/}
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
                                            name="stock_symbol"
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
                                            name="processing_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Processing Type</FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a processing type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Predict_Average">Predict Average</SelectItem>
                                                                <SelectItem value="Predict_Regression">Predict Regression</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormDescription>Enter the processing type.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="jump_days"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Prediction Jump days</FormLabel>
                                                    <Select 
                                                        onValueChange={(value) => field.onChange(parseInt(value))} 
                                                        defaultValue={field.value.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a timeframe" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="1">1 Day</SelectItem>
                                                            <SelectItem value="2">2 Days</SelectItem>
                                                            <SelectItem value="3">3 Days</SelectItem>
                                                            <SelectItem value="4">4 Days</SelectItem>
                                                            <SelectItem value="5">5 Days</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>Select the number of days to jump.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="start_date"
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
                                                    <FormDescription>Future predicted data start date</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="end_date"
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
                                                    <FormDescription>Future predicted data end date</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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

                {/*<TabsContent value="batch" className="space-y-4">
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
                </TabsContent>*/}
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