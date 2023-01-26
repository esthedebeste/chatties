import type { HexColor, PrivMsg } from "./types/priv-msg";
import { onMount } from "svelte";
import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { writable, type Writable } from "svelte/store";
import * as store from "svelte/store";
import * as plugins from "./plugins";
import { fetch, ResponseType } from "@tauri-apps/api/http";

export class ChattiesError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ChattiesError";
	}
}

export const joinedChannels = writable<string[]>([]);

export async function joinChannel(channel: string) {
	if (store.get(joinedChannels).includes(channel)) return;
	const err = await invoke<string | null>("join_channel", { channel });
	if (err) throw new ChattiesError(err);
	plugins.join(channel);
	joinedChannels.update(channels => {
		channels.push(channel);
		return channels;
	});

	fetch<{ messages: string[] }>(
		`https://recent-messages.robotty.de/api/v2/recent-messages/${channel.toLowerCase()}`,
		{ method: "GET", responseType: ResponseType.JSON, query: { limit: "50" } }
	).then(async res => {
		if (!res.ok) {
			console.error(res);
			throw new ChattiesError(
				`Failed to fetch recent messages, status code ${res.status}`
			);
		}
		for (const rawIrc of res.data.messages) await processRawIrc(rawIrc);
	});
}
export async function leaveChannel(channel: string) {
	await invoke("leave_channel", { channel });
	plugins.leave(channel);
	joinedChannels.update(channels => {
		const index = channels.indexOf(channel);
		if (index !== -1) channels.splice(index, 1);
		return channels;
	});
}

// to be called from a component!
export function onPrivMsg(listener: (msg: PrivMsg) => void) {
	onMount(() => {
		const unlistenp = appWindow.listen<PrivMsg>("priv-msg", event =>
			listener(event.payload)
		);
		return () => unlistenp.then(unlisten => unlisten());
	});
}

export async function logIn(clientId: string, token: string) {
	const res = await fetch("https://api.twitch.tv/helix/users", {
		method: "GET",
		headers: { Authorization: `Bearer ${token}`, "Client-ID": clientId },
		responseType: ResponseType.JSON,
	});
	if (!res.ok) {
		console.error(res);
		throw new ChattiesError(`Failed to log in, status code ${res.status}`);
	}
	const json = res.data as { data: { login: string }[] };
	if (json.data.length === 0)
		throw new ChattiesError("Failed to log in, no user data");
	const login = json.data[0].login;
	await invoke("log_in", { login, token, clientId });
}

export async function processRawIrc(rawIrc: string) {
	const err = await invoke<string | null>("process_raw_irc", { rawIrc });
	if (err) throw new ChattiesError(err);
}

export async function logOut() {
	await invoke("log_out");
}

export async function sendMessage(channel: string, message: string) {
	const err = await invoke<string | null>("send_message", {
		channel,
		message,
	});
	if (err) throw new ChattiesError(err);
}

export const lastSeenColors = writable(
	new Map<string, HexColor>(
		JSON.parse(localStorage.getItem("lastSeenColors") || "[]")
	)
);
lastSeenColors.subscribe(colors => {
	localStorage.setItem("lastSeenColors", JSON.stringify([...colors.entries()]));
});

const channelIds = new Map<string, string>();

{
	const lsJoinedChannels = localStorage.getItem("joinedChannels")!;
	if (lsJoinedChannels)
		for (const channel of JSON.parse(lsJoinedChannels) as string[])
			await joinChannel(channel);
}

joinedChannels.subscribe(channels => {
	localStorage.setItem("joinedChannels", JSON.stringify(channels));
});

const messages = new Map<string, Writable<PrivMsg[]>>();
export const messageStore = (channel: string) => {
	if (!messages.has(channel)) messages.set(channel, writable([]));
	return messages.get(channel)!;
};
await appWindow.listen<PrivMsg>("priv-msg", event => {
	const msg = event.payload;
	console.log("Received message", msg);
	if (!channelIds.has(msg.channel_login)) {
		channelIds.set(msg.channel_login, msg.channel_id);
		plugins.channelId(msg.channel_login, msg.channel_id);
	}
	messageStore(msg.channel_login).update(msgs => {
		msgs.push(msg);
		return msgs;
	});
	lastSeenColors.update(colors => {
		colors.set(msg.sender.login, msg.source.tags.color);
		return colors;
	});
});

type Credentials = {
	creds: {
		credentials: {
			login: string;
			token: string;
		};
	};
	client_id: string | null; // null if not logged in
};

export const credentials = await invoke<Credentials>("get_credentials");
