import { apiCall } from "@/services/api";

export const getMyAnalytics = (filters: any = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/updates/analytics/me${params ? '?' + params : ''}`, "GET");
};

export const getTeamAnalytics = (filters: any = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/updates/analytics/team${params ? '?' + params : ''}`, "GET");
};

export const getOrgAnalytics = (filters: any = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/updates/analytics/org${params ? '?' + params : ''}`, "GET");
};
