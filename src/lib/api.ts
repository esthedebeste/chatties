import type { HexColor, Message } from "./types/message"
import { onMount } from "svelte"
import { appWindow } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/tauri"
import { get, writable, type Writable } from "svelte/store"
import * as plugins from "./plugins"
import { fetch, ResponseType } from "@tauri-apps/api/http"
import { credentials } from "./api/credentials"

export class ChattiesError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "ChattiesError"
	}
}

export const joinedChannels = writable<string[]>([])

export async function joinChannel(channel: string) {
	for (const ch of get(joinedChannels)) if (ch.toLowerCase() === channel.toLowerCase()) return
	await invoke("join_channel", { channel })
	plugins.join(channel)
	joinedChannels.update(channels => {
		channels.push(channel)
		return channels
	})

	fetch<{ messages: string[] }>(
		`https://recent-messages.robotty.de/api/v2/recent-messages/${channel.toLowerCase()}`,
		{ method: "GET", responseType: ResponseType.JSON, query: { limit: "50" } }
	).then(async response => {
		if (!response.ok) {
			console.error(response)
			throw new ChattiesError(`Failed to fetch recent messages, status code ${response.status}`)
		}
		for (const rawIrc of response.data.messages) await processRawIrc(rawIrc)
	})
}
export async function leaveChannel(channel: string) {
	await invoke("leave_channel", { channel })
	plugins.leave(channel)
	joinedChannels.update(channels => {
		const index = channels.indexOf(channel)
		if (index !== -1) channels.splice(index, 1)
		return channels
	})
}

// to be called from a component!
export function onMessage(listener: (message: Message) => void) {
	onMount(() => {
		const unlistenp = appWindow.listen<Message>("priv-msg", event => listener(event.payload))
		return () => unlistenp.then(unlisten => unlisten())
	})
}

export async function logIn(clientId: string, token: string) {
	const response = await fetch("https://api.twitch.tv/helix/users", {
		method: "GET",
		headers: { Authorization: `Bearer ${token}`, "Client-ID": clientId },
		responseType: ResponseType.JSON,
	})
	if (!response.ok) {
		console.error(response)
		throw new ChattiesError(`Failed to log in, status code ${response.status}`)
	}
	const json = response.data as { data: { login: string }[] }
	if (json.data.length === 0) throw new ChattiesError("Failed to log in, no user data")
	const login = json.data[0].login
	await invoke("log_in", { login, token, clientId })
	credentials.set({
		creds: { credentials: { login, token } },
		client_id: clientId,
	})
}

export async function processRawIrc(rawIrc: string) {
	await invoke("process_raw_irc", { rawIrc })
}

export async function logOut() {
	await invoke("log_out")
	credentials.set(undefined)
}

export async function sendMessage(channel: string, message: string) {
	await invoke("send_message", { channel, message })
}

export const lastSeenColors = writable(
	new Map<string, HexColor>(JSON.parse(localStorage.getItem("lastSeenColors") || "[]"))
)
lastSeenColors.subscribe(colors => {
	localStorage.setItem("lastSeenColors", JSON.stringify([...colors.entries()]))
})

const channelIds = new Map<string, string>()

{
	const lsJoinedChannels = localStorage.getItem("joinedChannels") as string
	if (lsJoinedChannels)
		for (const channel of JSON.parse(lsJoinedChannels) as string[]) await joinChannel(channel)
}

joinedChannels.subscribe(channels => {
	localStorage.setItem("joinedChannels", JSON.stringify(channels))
})

const messages = new Map<string, Writable<Message[]>>()
export const messageStore = (channel: string) => {
	if (!messages.has(channel)) messages.set(channel, writable([]))
	return messages.get(channel) as Writable<Message[]>
}
await appWindow.listen<Message>("priv-msg", async event => {
	const message = event.payload
	console.log("Received message", message)
	if (!channelIds.has(message.channel_login)) {
		channelIds.set(message.channel_login, message.channel_id)
		await plugins.channelId(message.channel_login, message.channel_id)
	}
	plugins.message(message)
	messageStore(message.channel_login).update(msgs => {
		msgs.push(message)
		return msgs
	})
	lastSeenColors.update(colors => {
		colors.set(message.sender.login, message.source.tags.color)
		return colors
	})
})
