import { DateTime } from "luxon";

export function getCurrentDateTime() {
    return DateTime.now().setZone("Asia/Jakarta").toISO();
}