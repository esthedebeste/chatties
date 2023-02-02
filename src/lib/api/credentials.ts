import { writable } from "svelte/store"
import { invoke, type Credentials } from "./smart-invoke"

const _startCredentials = await invoke("get_credentials")
export const credentials = writable<Credentials | undefined>(
	_startCredentials.client_id === null ? undefined : _startCredentials
)
