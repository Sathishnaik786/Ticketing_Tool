import { apiCall } from "@/services/api";

export const createDailyUpdate = (payload: any) =>
    apiCall("/updates", "POST", payload);

export const getMyDailyUpdates = (filters: any = {}) => {
    const params = new URLSearchParams({ type: 'DAILY', ...filters }).toString();
    return apiCall(`/updates/my?${params}`, "GET");
};

export const getVisibleDailyUpdates = (filters: any = {}) => {
    const params = new URLSearchParams({ type: 'DAILY', ...filters }).toString();
    return apiCall(`/updates/visible?${params}`, "GET");
};

export const addDailyFeedback = (id: string, comment: string) =>
    apiCall(`/updates/${id}/feedback`, "POST", { comment });

export const updateDailyUpdate = (id: string, payload: any) =>
    apiCall(`/updates/${id}`, "PUT", payload);

export const deleteDailyUpdate = (id: string) =>
    apiCall(`/updates/${id}`, "DELETE");
