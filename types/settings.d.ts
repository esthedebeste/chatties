type _SettingType<S, T> = S & {
	default: T
	/** Called when the setting is changed. */
	changed?: (value: T) => void
}

export type FlatSetting =
	| _SettingType<{ type: "string" }, string>
	| _SettingType<{ type: "number" }, number>
	| _SettingType<{ type: "boolean" }, boolean>
	| _SettingType<{ type: "string-enum"; options: string[] }, string>

type _ArrType<S, T> = _SettingType<{ type: "array" }, T[]> & {
	item: S & {
		default: T
	}
}

export type Setting = {
	name: string
} & (
	| FlatSetting
	| _ArrType<{ type: "string" }, string>
	| _ArrType<{ type: "number" }, number>
	| _ArrType<{ type: "boolean" }, boolean>
	| _ArrType<{ type: "string-enum"; options: string[] }, string>
)

export type Settings = Record<string, Setting>
