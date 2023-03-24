import "$lib/plugins" // always import plugins before using api
import * as plugins from "$lib/plugins"
import type { Message, PrivMessage } from "$lib/types/message"
import { fetch, ResponseType } from "@tauri-apps/api/http"
import { appWindow } from "@tauri-apps/api/window"
import { get, writable, type Writable } from "svelte/store"
import { randomHex } from "../utils"
import { credentials } from "./credentials"
import { ChattiesError } from "./error"
import { invoke, type HexColor, type Join, type Names, type Part } from "./smart-invoke"
export * from "./error"
export * from "./smart-invoke"

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
	console.log("Connecting to channel", channel)
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
	credentials.set({ login, token, client_id: clientId })
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
	const store = messages.get(channel)
	if (store) return store
	else {
		connectToChannel(channel)
		const store = writable<Message[]>([])
		messages.set(channel, store)
		return store
	}
}

const channelIdPromises = new Map<string, Promise<void>>()

export function setChannelId(channel: string, id: string) {
	channelIds.set(channel, id)
	channelIdPromises.set(channel, plugins.channelId(channel, id))
}

appWindow.listen<PrivMessage>("priv-msg", async event => {
	const message = event.payload
	message.type = "privmsg"
	message.timestamp = new Date(message.server_timestamp_str)
	if (!channelIds.has(message.channel.login))
		setChannelId(message.channel.login, message.channel.id)
	await channelIdPromises.get(message.channel.login)
	plugins.message(message)
	messageStore(message.channel.login).update(msgs => {
		msgs.push(message)
		return msgs
	})
	lastSeenColors.update(colors => {
		colors.set(message.sender.login, message.name_hex ?? randomHex())
		return colors
	})
})

appWindow.listen<Names>("names", async event => {
	console.log("Got names", event.payload)
})

appWindow.listen<Join>("join", async event => {
	const message = event.payload
	if (message.user.startsWith("justinfan")) message.user = get(credentials)?.login ?? "You"
	messageStore(message.channel).update(msgs => {
		for (const previous of msgs.slice(-5).reverse())
			if (previous.type === "join") {
				// merge with previous join
				previous.users.push(message.user)
				return msgs
			}
		msgs.push({
			type: "join",
			timestamp: new Date(),
			channel: message.channel,
			users: [message.user],
		})
		return msgs
	})
})

appWindow.listen<Part>("part", async event => {
	const message = event.payload
	if (message.user.startsWith("justinfan")) message.user = get(credentials)?.login ?? "You"
	messageStore(message.channel).update(msgs => {
		for (const previous of msgs.slice(-5).reverse())
			if (previous.type === "part") {
				// merge with previous part
				previous.users.push(message.user)
				return msgs
			}
		msgs.push({
			type: "part",
			timestamp: new Date(),
			channel: message.channel,
			users: [message.user],
		})
		return msgs
	})
})
