import { apiCall } from "@/services/api";

export const getIntelligenceSummary = (type: string, filters: any = {}) => {
    const params = new URLSearchParams({ ...filters, type }).toString();
    return apiCall(`/updates/intelligence/summary?${params}`, "GET");
};

export const triggerReminders = () =>
    apiCall("/updates/automation/reminders", "POST");

export const exportUpdates = (filters: any = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/updates/governance/export${params ? '?' + params : ''}`, "GET");
};
