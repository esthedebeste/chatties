export class ChattiesError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "ChattiesError"
	}
}
