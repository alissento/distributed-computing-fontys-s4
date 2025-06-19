import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./ui/table"
import JobsAPI from "@/api/JobsAPI.ts";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {useEffect, useState} from "react";
import Spinner from "./ui/spinner";
import {Badge} from "./ui/badge";
import {DownloadIcon} from "lucide-react";

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
    const [downloadingJobs, setDownloadingJobs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!isAuthenticated || isLoading) {
            return;
        }

        JobsAPI.getAllJobs()
            .then((data) => {
                if (!Array.isArray(data)) {
                    console.error("Unexpected response format, expected an array.");
                    return;
                }
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
            })
            .catch(error => {
                console.error("Error fetching jobs:", error);
            });
    }, [isAuthenticated, isLoading]);

    const handleDownload = async (jobId: string) => {
        try {
            setDownloadingJobs(prev => ({ ...prev, [jobId]: true }));
            const pdfBlob = await JobsAPI.getJobPdf(jobId);
            
            // Verify it's actually a PDF
            if (!pdfBlob.type.includes('pdf')) {
                throw new Error('Invalid file type received');
            }

            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `job-${jobId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error downloading PDF for job ${jobId}:`, error);
            // You might want to add a toast notification here
        } finally {
            setDownloadingJobs(prev => ({ ...prev, [jobId]: false }));
        }
    };

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
                    <TableHead>Download</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {jobs ? jobs.map((jobId) => (
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
                        <TableCell className="flex items-center justify-center">
                            {loadingStatuses[jobId] ? (
                                <Spinner />
                            ) : jobStatuses[jobId]?.job_status === "completed" ? (
                                <button
                                    onClick={() => handleDownload(jobId)}
                                    disabled={downloadingJobs[jobId]}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    {downloadingJobs[jobId] ? (
                                        <Spinner />
                                    ) : (
                                        <DownloadIcon className="m-auto" />
                                    )}
                                </button>
                            ) : null}
                        </TableCell>
                    </TableRow>
                )) : null}
            </TableBody>
        </Table>
    )
}