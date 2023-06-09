<template>
	<div
		class="flex flex-col px-4 w-full sm:w-5/6 md:w-2/3 h-2/3 border border-gray-700 rounded-2xl"
	>
		<div v-if="settingsLoaded">
			<div v-if="userHasApiKey">
				<div
					class="flex flex-col py-8 px-1 sm:px-8 border-b border-gray-600 last:border-b-0 border-opacity-30"
					v-for="(message, index) in messages"
					:key="message"
				>
					<div class="flex h-full flex-row">
						<div
							class="flex shrink-0 w-10 h-10 sm:w-12 sm:h-12 mr-2 sm:mr-4 justify-center items-center bg-white bg-opacity-10 rounded-full"
							v-if="message.role === 'user'"
						>
							<img
								class="w-8 h-8"
								src="https://img.icons8.com/external-filled-outline-perfect-kalash/64/null/external-Human-management-filled-outline-perfect-kalash.png"
							/>
						</div>
						<div class="flex flex-col h-full" v-else>
							<div
								class="flex shrink-0 mr-2 sm:mr-4 w-10 h-10 sm:w-12 sm:h-12 justify-center items-center bg-white bg-opacity-10 rounded-full"
							>
								<img
									class="w-8 h-8"
									src="https://img.icons8.com/color/48/null/robot-2.png"
								/>
							</div>
							<ul
								id="message-btns"
								class="flex flex-col aboslute bottom-0 justify-center items-center mt-4 py-4 space-y-2"
							>
								<li class="w-10 h-10">
									<button @click="retryMessage(index)">
										<i
											class="fa-solid fa-rotate-right fa-xl text-gray-300 hover:text-gray-500"
										></i>
									</button>
								</li>
							</ul>
						</div>
						<div
							id="msg-content"
							class="pt-2 max-w-full flex-wrap overflow-hidden"
							v-html="renderMD(message.content.join(''))"
						></div>
					</div>
				</div>
				<div id="query-bar" class="mb-4">
					<form class="flex" id="query-form" @submit.prevent>
						<div
							id="chat-input"
							class="w-full border bg-gray-800 outline-none focus:outline-offset-0 focus:outline-gray-600 text-gray-50 border-gray-700 rounded-2xl p-2 mt-4 px-4"
							placeholder="Ask me anything..."
							contenteditable="true"
						></div>
						<button
							@click="sendMessage()"
							type="submit"
							class="w-10 h-10 rounded-2xl p-2 mt-4"
						>
							<i
								class="fa-solid fa-paper-plane fa-xl ml-2 text-gray-300"
							></i>
						</button>
					</form>
				</div>
			</div>

			<div class="px-12 py-12" v-else>
				<h1 class="text-lg text-medium mb-4">
					Please enter your OpenAI API key
				</h1>
				<p class="text-gray-300 mb-4">
					All of your credentials are stored in the browser, and not
					sent to any third party servers. Requests go straight to
					OpenAI.
				</p>
				<p class="text-gray-300 mb-4">
					For instructions on how to generate an API key please
					<a
						class="text-gray-300 underline underline-offset-1 hover:text-gray-200"
						href="https://www.youtube.com/watch?v=nafDyRsVnXU"
						>watch this video.</a
					>
				</p>

				<form @submit.prevent>
					<input
						type="text"
						class="w-full border border-gray-700 rounded-2xl p-2 mt-4 px-4 text-gray-600"
						placeholder="OpenAI API Key"
						v-model="openaiKey"
					/>
					<button
						@click="setKey()"
						type="submit"
						class="w-full bg-gray-700 text-gray-300 rounded-2xl p-2 mt-4"
					>
						Submit
					</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { marked } from "marked";
import { searchBing } from "../utils/bingSearch";

export default {
	setup() {
		type Settings = {
			systemMessage: string;
			model: "gpt-3.5-turbo" | "gpt-4";
			mode: "creative" | "fun" | "professional";
		};

		type Message = {
			role: "user" | "assistant";
			content: string[];
		};

		let settings: Settings;
		let openaiKey = ref("");
		let settingsLoaded = ref(false);
		let userHasApiKey = ref(false);
		const messages = ref<Message[]>([]);

		onMounted(async () => {
			const apiKey = localStorage.getItem("openai_api_key");
			const openAiSettings = localStorage.getItem("openai_settings");

			setTimeout(() => {
				let chatInput = document.querySelector(
					"#chat-input"
				) as HTMLParagraphElement;

				chatInput.addEventListener("keydown", (e: KeyboardEvent) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						sendMessage();
					}
				});
			}, 400);

			if (!openAiSettings) {
				settings = {
					systemMessage:
						"Let's spin up an instance of GPT that is fun and informative, answering all of the users queries, truthfully and creatively.",
					model: "gpt-3.5-turbo",
					mode: "creative",
				};

				localStorage.setItem(
					"openai_settings",
					JSON.stringify(settings)
				);
			}

			if (!apiKey) {
				console.log("No API key found");
				settingsLoaded.value = true;
				return;
			}

			let key = JSON.parse(apiKey);
			openaiKey.value = key;
			userHasApiKey.value = true;
			settingsLoaded.value = true;

			const urlParams = new URLSearchParams(window.location.search);
			const query = urlParams.get("s");
			console.log(query);

			if (query) {
				const message = await sendMessage(query);

				console.log(message);
			}
		});

		async function setKey() {
			console.log("clicked");
			if (!openaiKey.value || openaiKey.value.length < 40) return;

			localStorage.setItem(
				"openai_api_key",
				JSON.stringify(openaiKey.value)
			);

			userHasApiKey.value = true;

			window.location.href = window.location.href;
		}

		async function sendMessage(query: string = "default") {
			const settings = localStorage.getItem("openai_settings");
			if (!settings) return;

			if (query === "default") {
				let chatInput = document.querySelector(
					"#chat-input"
				) as HTMLParagraphElement;

				query = chatInput.innerText;
				chatInput.innerHTML = "";
			}

			const settingsObj = JSON.parse(settings);

			const userMessage: Message = {
				role: "user",
				content: [query],
			};

			const assistantMessage: Message = {
				role: "assistant",
				content: [],
			};

			messages.value.push(userMessage);
			messages.value.push(assistantMessage);

			let prvMsgs = messages.value.map((message) => {
				return {
					role: message.role,
					content: message.content.join(" "),
				};
			});

			const validator = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${openaiKey.value}`,
					},
					body: JSON.stringify({
						model: settingsObj.model,
						messages: [
							{
								role: "system",
								content:
									"Your job is to determine what action to take based on the users query. If the answer requires location data respond with: MAPS, if you need up to date information respond with: SEARCH, otherwise respond with ANSWER. Do not include any other words or tokens in your response.",
							},
							{
								role: "user",
								content: `
                                Query: ${query}
								Response:`,
							},
						],
						temperature: 0.5,
						top_p: 1,
						max_tokens: 250,
						frequency_penalty: 0,
						presence_penalty: 0,
					}),
				}
			);

			const validatorJson = await validator.json();
			const validatorRes =
				validatorJson.choices[0].message.content || ("" as string);

			if (validatorRes.toLowerCase().includes("maps")) {
				window.location.href =
					"https://www.google.ca/maps/search/" + query;
				return;
			}

			let searchResults;

			if (validatorRes.toLowerCase().includes("search")) {
				console.log("searching");
				const bingApiKey = localStorage.getItem("bing_api_key");

				if (bingApiKey) {
					searchResults = await searchBing(
						query,
						8,
						JSON.parse(bingApiKey)
					);
					console.log(searchResults);
				}
			}

			//get the index of the assistant message we just created
			const assistantMessageIndex =
				messages.value.indexOf(assistantMessage);

			if (searchResults && searchResults.data) {
				messages.value[assistantMessageIndex].content.push(
					`\n\n## Search Results \n\n ${searchResults.data
						.map((result) => {
							return `\n\n ### [${result.name}](${result.url}) \n\n ${result.description}`;
						})
						.join("")}`
				);
			} else {
				messages.value[assistantMessageIndex].content.push("");
			}

			const response = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${openaiKey.value}`,
					},
					body: JSON.stringify({
						model: settingsObj.model,
						messages: [
							{
								role: "system",
								content: settingsObj.systemMessage,
							},
							...prvMsgs,
							{
								role: "user",
								content: `Rules: All responses must be properly formatted in markdown syntax. Do not mention markdown in your response. Do not talk about the response.\n\n
								If search results are not equal to null, use the data within the JSON to inform your response. \n\n
								search results: ${JSON.stringify(searchResults) || null}\n\n
                                ${query}`,
							},
						],
						temperature: 0.9,
						top_p: 1,
						stream: true,
						max_tokens: 1300,
						frequency_penalty: 0,
						presence_penalty: 0,
					}),
				}
			);

			//stream the response
			if (!response.body) {
				console.log("Error");
				return;
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				console.log(chunk);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.includes("[DONE]")) {
						return;
					}

					if (line.startsWith("data:")) {
						const data = JSON.parse(line.substring(6));
						if (
							data.choices &&
							data.choices[0].delta &&
							data.choices[0].delta.content !== undefined
						) {
							messages.value[
								assistantMessageIndex
							].content.splice(
								-1,
								0,
								data.choices[0].delta.content
							);
						}
					}
				}
			}
		}

		function retryMessage(index: number) {
			const query = messages.value[index - 1].content.join("");
			console.log(query);

			messages.value.splice(index - 1, 2);
			sendMessage(query);
		}

		function renderMD(content: string) {
			return marked.parse(content);
		}

		return {
			userHasApiKey,
			openaiKey,
			setKey,
			settingsLoaded,
			messages,
			renderMD,
			retryMessage,
			sendMessage,
		};
	},
};
</script>

<style>
#msg-content {
	font-family: system-ui, sans-serif;
	line-height: 1.6;
	color: #f3f4f6;
}

/* Headings */
#msg-content h1,
#msg-content h2,
#msg-content h3,
#msg-content h4,
#msg-content h5,
#msg-content h6 {
	font-family: "poppins", system-ui, sans-serif;
	margin-top: 1em;
	margin-bottom: 0.5em;
	font-weight: 600;
}

#msg-content h1:first-child,
#msg-content h2:first-child,
#msg-content h3:first-child,
#msg-content h4:first-child,
#msg-content h5:first-child,
#msg-content h6:first-child {
	margin-top: 0;
}

#msg-content h1 {
	font-size: 2em;
}

#msg-content h2 {
	font-size: 1.75em;
}

#msg-content h3 {
	font-size: 1.5em;
}

#msg-content h4 {
	font-size: 1.25em;
}

#msg-content h5 {
	font-size: 1em;
}

#msg-content h6 {
	font-size: 0.85em;
}

/* List items */
#msg-content ul,
#msg-content ol {
	margin-top: 0.5em;
	margin-bottom: 2em;
	padding-left: 1em;
}

#msg-content ul {
	list-style-type: disc;
}

#msg-content ol {
	list-style-type: decimal;
}

#msg-content li {
	margin-bottom: 0.5em;
}

/* Code blocks */
#msg-content pre {
	background-color: #374151;
	border: 1px solid #4b5563;
	border-radius: 4px;
	padding: 0.5em;
	overflow-x: auto;
	white-space: pre-wrap;
	word-wrap: break-word;
	font-family: "Fira Code", monospace;
	font-size: 0.9em;
	margin-bottom: 1em;
	margin-top: 1em;
}

/* Inline code */
#msg-content code {
	background-color: #374151;
	color: #f9fafb;
	border-radius: 4px;
	padding: 2px 4px;
	font-family: "Fira Code", monospace;
	font-size: 0.9em;
}

/* Tables */
#msg-content table {
	width: 100%;
	border-collapse: collapse;
	margin: 1em 0;
}

#msg-content th,
#msg-content td {
	border: 1px solid #ccc;
	padding: 8px;
	text-align: left;
}

#msg-content th {
	background-color: #f5f5f5;
	font-weight: 600;
}

#msg-content tr:nth-child(even) {
	background-color: #f9f9f9;
}

/* Blockquotes */
#msg-content blockquote {
	border-left: 4px solid #ccc;
	margin: 1em 0;
	padding-left: 1em;
	font-style: italic;
}

/* Links */
#msg-content a {
	color: #4285f4;
	text-decoration: none;
}

#msg-content a:hover {
	text-decoration: underline;
}

#sticky-af {
	position: fixed;
	top: 24px;
}
</style>