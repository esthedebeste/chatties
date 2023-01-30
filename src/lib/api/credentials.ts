import { invoke } from "@tauri-apps/api"
import { writable } from "svelte/store"

export type Credentials = {
	creds: {
		credentials: {
			login: string
			token: string
		}
	}
	client_id: string | null // null if not logged in
}

const _startCredentials = await invoke<Credentials>("get_credentials")
export const credentials = writable<Credentials | undefined>(
	_startCredentials.client_id === null ? undefined : _startCredentials
)
