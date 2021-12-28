import { writable } from "svelte/store";

export const token = writable("");
export const music = writable([]);
export const user = writable({});
export const error = writable();
export const popUpOpen = writable(false);
export const isAuthenticated = writable(false);
