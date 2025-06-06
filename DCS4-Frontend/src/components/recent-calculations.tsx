import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./ui/table"
import JobsAPI from "@/api/JobsAPI.ts";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {useEffect, useState} from "react";
import Spinner from "./ui/spinner";
import {Badge} from "./ui/badge";

type JobStatus = {
    s3_key: string;
    processing_type: string;
    jump_days: number;
    start_date: string;
    end_date: string;
    job_id: string;
    job_status: string;
};

export function RecentCalculations() {
    const {isAuthenticated, isLoading} = useAuth();
    const [jobs, setJobs] = useState<string[]>([]);
    const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
    const [loadingStatuses, setLoadingStatuses] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!isAuthenticated || isLoading) {
            return;
        }

        JobsAPI.getAllJobs()
            .then((data) => {
                setJobs(data);
                // Initialize loading states for all jobs
                const initialLoadingStates = data.reduce((acc, jobId) => {
                    acc[jobId] = true;
                    return acc;
                }, {} as Record<string, boolean>);
                setLoadingStatuses(initialLoadingStates);

                // Fetch status for each job
                data.forEach(jobId => {
                    JobsAPI.getJobStatus(jobId)
                        .then(status => {
                            setJobStatuses(prev => ({...prev, [jobId]: status}));
                            setLoadingStatuses(prev => ({...prev, [jobId]: false}));
                        })
                        .catch(error => {
                            console.error(`Error fetching status for job ${jobId}:`, error);
                            setLoadingStatuses(prev => ({...prev, [jobId]: false}));
                        });
                });
            });
    }, [isAuthenticated, isLoading]);

    if (!isAuthenticated || isLoading) {
        return null;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processing Type</TableHead>
                    <TableHead>Date Range</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {jobs.map((jobId) => (
                    <TableRow key={jobId}>
                        <TableCell className="font-medium">{jobId}</TableCell>
                        <TableCell>
                            {loadingStatuses[jobId] ? (
                                <Spinner />
                            ) : (
                                jobStatuses[jobId]?.s3_key
                            )}
                        </TableCell>
                        <TableCell>
                            {loadingStatuses[jobId] ? (
                                <Spinner />
                            ) : (
                                <Badge variant={jobStatuses[jobId]?.job_status === "completed" ? "default" : "destructive"}>
                                    {jobStatuses[jobId]?.job_status}
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell>
                            {loadingStatuses[jobId] ? (
                                <Spinner />
                            ) : (
                                jobStatuses[jobId]?.processing_type
                            )}
                        </TableCell>
                        <TableCell>
                            {loadingStatuses[jobId] ? (
                                <Spinner />
                            ) : (
                                `${jobStatuses[jobId]?.start_date} - ${jobStatuses[jobId]?.end_date}`
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}