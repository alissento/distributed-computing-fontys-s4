import apiClient from "@/config/apiClient.ts";

type StockResponse = {
    id: string
};

type StockRequest = {
    stock_symbol: string;
    processing_type: string;
    jump_days: number;
    start_date: Date;
    end_date: Date;
};

type JobStatus = {
    s3_key: string;
    processing_type: string;
    jump_days: number;
    start_date: string;
    end_date: string;
    job_id: string;
    job_status: string;
};

const JobsAPI = {
    submitStockRequest: async (data: StockRequest): Promise<StockResponse> => {
        const response = await apiClient.post('jobs', data);
        return response.data;
    },

    getAllJobs: async (): Promise<string[]> => {
        const response = await apiClient.get('jobs');
        return response.data;
    },

    getJobStatus: async (jobId: string): Promise<JobStatus> => {
        const response = await apiClient.get(`jobs/${jobId}/status`);
        return response.data;
    },

    getJobPdf: async (jobId: string): Promise<Blob> => {
        const response = await apiClient.get(`jobs/${jobId}/pdf`, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/pdf'
            }
        });
        return response.data;
    }
}

export default JobsAPI;