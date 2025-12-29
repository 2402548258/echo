import { WindowNames } from "@common/types";

export function openWindow(name: WindowNames) {
    window.api.openWindow(name);
}