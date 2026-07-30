import { DateTime } from "luxon";

export function getCurrentDateTime() {
    return DateTime.now().setZone("Asia/Jakarta").toISO();
}

export function convertDate2String(date: Date) {
    return DateTime.fromJSDate(date).setZone("Asia/Jakarta").toISO();
}