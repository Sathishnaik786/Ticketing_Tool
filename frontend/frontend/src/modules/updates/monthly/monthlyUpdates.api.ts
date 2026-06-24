import { apiCall } from "@/services/api";

export const createMonthlyUpdate = (payload: any) =>
    apiCall("/updates", "POST", payload);

export const getMyMonthlyUpdates = (filters: any = {}) => {
    const params = new URLSearchParams({ type: 'MONTHLY', ...filters }).toString();
    return apiCall(`/updates/my?${params}`, "GET");
};

export const getVisibleMonthlyUpdates = (filters: any = {}) => {
    const params = new URLSearchParams({ type: 'MONTHLY', ...filters }).toString();
    return apiCall(`/updates/visible?${params}`, "GET");
};

export const addMonthlyFeedback = (id: string, comment: string) =>
    apiCall(`/updates/${id}/feedback`, "POST", { comment });

export const updateMonthlyUpdate = (id: string, payload: any) =>
    apiCall(`/updates/${id}`, "PUT", payload);

export const deleteMonthlyUpdate = (id: string) =>
    apiCall(`/updates/${id}`, "DELETE");
