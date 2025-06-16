import apiClient from "@/config/apiClient.ts";
import {User} from "@/types/user.ts";

const UsersAPI = {
    getAllUsers: async (): Promise<User[]> => {
        const response = await apiClient.get('users');
        return response.data;
    },

    updateUserRole: async (userId: string, role: string): Promise<User> => {
        const response = await apiClient.patch(`users/${userId}`, { role });
        return response.data;
    }
}

export default UsersAPI;