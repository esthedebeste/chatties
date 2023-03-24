use std::ops::Range;

use macros::{command_struct, command_struct_custom_serialization};
use serde::{Deserialize, Serialize};

#[command_struct]
pub struct Join<'a> {
    pub channel: &'a str,
    pub user: &'a str,
}

#[command_struct]
pub struct Part<'a> {
    pub channel: &'a str,
    pub user: &'a str,
}

#[command_struct]
pub struct Names<'a> {
    pub channel: &'a str,
    pub names: Vec<&'a str>,
}

#[command_struct]
pub struct TwitchUserBasics<'a> {
    pub id: &'a str,
    pub login: &'a str,
    pub name: &'a str,
}
impl<'a> From<&'a twitch_irc::message::TwitchUserBasics> for TwitchUserBasics<'a> {
    fn from(user: &'a twitch_irc::message::TwitchUserBasics) -> Self {
        Self {
            id: &user.id,
            login: &user.login,
            name: &user.name,
        }
    }
}
#[command_struct]
pub struct TwitchChannelBasics<'a> {
    pub login: &'a str,
    pub id: &'a str,
}
#[command_struct]
pub struct Badge<'a> {
    pub name: &'a str,
    pub version: &'a str,
}

impl<'a> From<&'a twitch_irc::message::Badge> for Badge<'a> {
    fn from(badge: &'a twitch_irc::message::Badge) -> Self {
        Self {
            name: &badge.name,
            version: &badge.version,
        }
    }
}

#[command_struct]
pub struct CharRange {
    pub start: usize,
    pub end: usize,
}

impl From<&Range<usize>> for CharRange {
    fn from(range: &Range<usize>) -> Self {
        Self {
            start: range.start,
            end: range.end,
        }
    }
}

#[command_struct]
pub struct Emote<'a> {
    pub id: &'a str,
    pub char_range: CharRange,
    pub code: &'a str,
}

impl<'a> From<&'a twitch_irc::message::Emote> for Emote<'a> {
    fn from(emote: &'a twitch_irc::message::Emote) -> Self {
        Self {
            id: &emote.id,
            char_range: CharRange::from(&emote.char_range),
            code: &emote.code,
        }
    }
}

#[command_struct_custom_serialization("export type HexColor = `#${string}`")]
pub struct HexColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl From<twitch_irc::message::RGBColor> for HexColor {
    fn from(color: twitch_irc::message::RGBColor) -> Self {
        Self {
            r: color.r,
            g: color.g,
            b: color.b,
        }
    }
}

impl Serialize for HexColor {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let hex = format!("#{:02x}{:02x}{:02x}", self.r, self.g, self.b);
        serializer.serialize_str(&hex)
    }
}

impl<'a> Deserialize<'a> for HexColor {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'a>,
    {
        let hex = String::deserialize(deserializer)?;
        let hex = hex.trim_start_matches('#');
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap();
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap();
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap();
        Ok(Self { r, g, b })
    }
}

#[command_struct]
pub struct PrivMsg<'a> {
    pub channel: TwitchChannelBasics<'a>,
    pub message_text: &'a str,
    // pub is_action: bool,
    pub sender: TwitchUserBasics<'a>,
    // pub badge_info: Vec<Badge>,
    pub badges: Vec<Badge<'a>>,
    pub bits: Option<u64>,
    pub name_hex: Option<HexColor>,
    pub emotes: Vec<Emote<'a>>,
    pub message_id: &'a str,
    pub server_timestamp_str: &'a str,
}
