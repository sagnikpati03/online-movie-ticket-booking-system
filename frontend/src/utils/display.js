import { API_URL } from "../config/api";

/** Convert backend poster paths and full URLs into a browser-loadable URL. */
export function getPosterUrl(value) {
    if (!value || typeof value !== "string") return "";
    const path = value.trim();
    if (!path) return "";
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${normalized}`;
}

/** Safely format MySQL DATE, ISO datetime, or yyyy-mm-dd values without timezone shifts. */
export function formatDisplayDate(value, fallback = "—") {
    if (value === null || value === undefined || value === "") return fallback;
    const raw = String(value).trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    let date;
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return fallback;
    } else {
        date = new Date(raw);
        if (Number.isNaN(date.getTime())) return fallback;
    }
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDisplayTime(value, fallback = "—") {
    if (value === null || value === undefined || value === "") return fallback;
    const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) return fallback;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return fallback;
    const period = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${period}`;
}
