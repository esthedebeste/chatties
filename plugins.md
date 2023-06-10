# plugin design

Chatties plugins are pretty simple. They have a `export const plugin =` object, which defines the plugin's name (required), hooks (all optional), and settings (optional).

For some example plugins, check out

- [chatties-plugin-pronouns](https://github.com/esthedebeste/chatties-plugin-pronouns) (made with just javascript)
- [chatties-plugin-ping](https://github.com/esthedebeste/chatties-plugin-ping) (built in typescript, has much more tooling around it such as eslint, prettier, and esbuild)

Check out the [plugin API source code](./types/plugin-api.d.ts) if you want to know _exactly_ what you can do as a chatties plugin!

If you have any requests for an addition to the plugin API, please open an [issue or pull request](https://github.com/esthedebeste/chatties/issues/new)! <3
