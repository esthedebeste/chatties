import { fetch, ResponseType } from "@tauri-apps/api/http"
import { invoke } from "@tauri-apps/api/tauri"
import { appWindow } from "@tauri-apps/api/window"
import { onMount } from "svelte"
import { get, writable, type Writable } from "svelte/store"
import { credentials } from "./api/credentials"
import * as plugins from "./plugins"
import type { HexColor, Message } from "./types/message"

export class ChattiesError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "ChattiesError"
	}
}

export const joinedChannels = writable<string[]>([])

export async function joinChannel(channel: string) {
	for (const ch of get(joinedChannels)) if (ch.toLowerCase() === channel.toLowerCase()) return
	await plugins.join(channel)
	joinedChannels.update(channels => {
		channels.push(channel)
		return channels
	})
}

async function connectToChannel(channel: string) {
	console.trace("Connecting to channel", channel)
	await invoke("join_channel", { channel })
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

export async function logOut() {
	await invoke("log_out")
	credentials.set(undefined)
}

export async function processRawIrcs(rawIrcs: string[]) {
	await invoke("process_raw_ircs", { rawIrcs })
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

export const channelIds = new Map<string, string>()

{
	const lsJoinedChannels = localStorage.getItem("joinedChannels") as string
	if (lsJoinedChannels)
		for (const channel of JSON.parse(lsJoinedChannels) as string[]) await joinChannel(channel)
}

joinedChannels.subscribe(channels => {
	localStorage.setItem("joinedChannels", JSON.stringify(channels))
})

export const currentChannel = writable(localStorage.getItem("currentChannel") || "")
currentChannel.subscribe(channel => localStorage.setItem("currentChannel", channel))

const messages = new Map<string, Writable<Message[]>>()
export function messageStore(channel: string) {
	if (!messages.has(channel)) {
		connectToChannel(channel)
		messages.set(channel, writable([]))
	}
	return messages.get(channel) as Writable<Message[]>
}

const channelIdPromises = new Map<string, Promise<void>>()
await appWindow.listen<Message>("priv-msg", async event => {
	const message = event.payload
	message.server_timestamp = new Date(message.server_timestamp)
	console.log("Received message", message)
	if (!channelIds.has(message.channel_login)) {
		channelIds.set(message.channel_login, message.channel_id)
		channelIdPromises.set(
			message.channel_login,
			plugins.channelId(message.channel_login, message.channel_id)
		)
	}
	await channelIdPromises.get(message.channel_login)
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
