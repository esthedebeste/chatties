import { fetch } from "@tauri-apps/api/http"
import type { Plugin } from "./plugin-api"

type BadgeInfo = {
	image_url_1x: string
	image_url_2x: string
	image_url_4x: string
	description: string
	title: string
	click_action: string
	click_url?: string
	last_updated: null
}
type BadgeSets = Record<
	string,
	{
		versions: Record<string, BadgeInfo>
	}
>
let badgeSets: BadgeSets = {}
const customBadges = new Map<string, BadgeSets>()
export const plugin: Plugin = {
	id: "twitch-native",
	async init() {
		if (Object.keys(badgeSets).length > 0) return
		const response = await fetch("https://badges.twitch.tv/v1/badges/global/display")
		if (!response.ok) throw new Error("Failed to fetch global badges")
		const data = response.data as { badge_sets: BadgeSets }
		badgeSets = data.badge_sets
	},
	async channelId(channel, id) {
		const response = await fetch(`https://badges.twitch.tv/v1/badges/channels/${id}/display`)
		if (!response.ok) throw new Error("Failed to fetch channel badges")
		const data = response.data as { badge_sets: BadgeSets }
		customBadges.set(id, data.badge_sets)
		console.log("Loaded custom badges for channel", channel, id, data.badge_sets)
	},
	message(message) {
		for (const emote of message.emotes) {
			if (!emote.id) continue // not a twitch emote
			emote.url = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/3.0`
			emote.info = "Twitch Emote"
		}

		for (const badge of message.badges) {
			const custom = customBadges.get(message.channel_id)
			if (badge.version === undefined) continue
			if (
				custom !== undefined &&
				badge.name in custom &&
				badge.version in custom[badge.name].versions
			) {
				const info = custom[badge.name].versions[badge.version]
				badge.title = info.title
				badge.url = info.image_url_4x
				badge.info = "Custom Twitch Badge"
				if (info.title !== info.description) badge.info += `\n${info.description}`
			} else if (badge.name in badgeSets && badge.version in badgeSets[badge.name].versions) {
				const info = badgeSets[badge.name].versions[badge.version]
				badge.title = info.title
				badge.url = info.image_url_4x
				badge.info = "Twitch Badge"
				if (info.title !== info.description) badge.info += `\n${info.description}`
			} else {
				badge.title = badge.name
				badge.url = "/unknown-badge.png"
				badge.info = "Version " + badge.version + "\nUnknown Twitch Badge"
			}
		}
	},
}
