// generated source file! please do not manually edit.
export declare interface Credentials {
	login: string
	token: string | null
	client_id: string | null
}
export declare function invoke(id: 'get_credentials'): Promise<Credentials>
export declare function invoke(id: 'join_channel', arguments: {channel: string | null}): Promise<void>
export declare function invoke(id: 'leave_channel', arguments: {channel: string}): Promise<void>
export declare function invoke(id: 'log_in', arguments: {login: string, token: string, clientId: string}): Promise<void>
export declare function invoke(id: 'log_out'): Promise<void>
export declare function invoke(id: 'send_message', arguments: {message: string, channel: string}): Promise<void>
export declare function invoke(id: 'open_login'): Promise<void>
export declare function invoke(id: 'open_plugin_dir'): Promise<void>
export declare function invoke(id: 'get_plugins'): Promise<(string)[]>
