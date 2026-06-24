import { apiCall } from "@/services/api";

export const createWeeklyUpdate = (payload: any) =>
    apiCall("/updates", "POST", payload);

export const getMyWeeklyUpdates = (filters: any = {}) => {
    const params = new URLSearchParams({ type: 'WEEKLY', ...filters }).toString();
    return apiCall(`/updates/my?${params}`, "GET");
};

export const getVisibleWeeklyUpdates = (filters: any = {}) => {
    const params = new URLSearchParams({ type: 'WEEKLY', ...filters }).toString();
    return apiCall(`/updates/visible?${params}`, "GET");
};

export const addWeeklyFeedback = (id: string, comment: string) =>
    apiCall(`/updates/${id}/feedback`, "POST", { comment });

export const updateWeeklyUpdate = (id: string, payload: any) =>
    apiCall(`/updates/${id}`, "PUT", payload);

export const deleteWeeklyUpdate = (id: string) =>
    apiCall(`/updates/${id}`, "DELETE");
