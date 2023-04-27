<template>
	<div
		class="fixed top-0 right-0 px-4 flex flex-col w-80 bg-gray-900 border-l border-gray-700 h-screen"
	>
		<div
			class="flex flex-row justify-between text-gray-300 items-center font-semibold text-xl h-[60px]"
		>
			<h1 class="font-[poppins]">Settings</h1>
			<button
				@click="closePopup"
				class="text-gray-300 hover:text-gray-400"
			>
				<i class="fa-solid fa-xmark fa-xl"></i>
			</button>
		</div>
		<form>
			<label class="text-gray-300">System Prompt:</label>
			<textarea
				v-model="settings.systemMessage"
				class="mb-4 resize-none h-1/3 w-full border bg-gray-800 outline-none focus:outline-offset-0 focus:outline-gray-600 text-gray-50 border-gray-700 rounded-2xl p-2 mt-2 px-4"
			/>

			<label class="text-gray-300">Model:</label>
			<select
				v-model="settings.model"
				class="mb-4 w-full border bg-gray-800 outline-none focus:outline-offset-0 focus:outline-gray-600 text-gray-50 border-gray-700 rounded-2xl p-2 mt-2 px-4"
			>
				<option>gpt-3.5-turbo</option>
				<option>gpt-4</option>
			</select>

			<label class="text-gray-300">OpenAI API Key:</label>
			<input
				v-model="openaiKey"
				type="password"
				class="mb-4 w-full border bg-gray-800 outline-none focus:outline-offset-0 focus:outline-gray-600 text-gray-50 border-gray-700 rounded-2xl p-2 mt-2 px-4"
			/>

			<label class="text-gray-300">Bing Search API Key:</label>
			<input
				v-model="bingKey"
				type="password"
				class="w-full border bg-gray-800 outline-none focus:outline-offset-0 focus:outline-gray-600 text-gray-50 border-gray-700 rounded-2xl p-2 mt-2 px-4"
			/>

			<div
				class="flex flex-row space absolute bottom-0 left-0 w-full mb-8 px-4"
			>
				<button
					type="submit"
					@click.prevent="saveSettings"
					class="mt-4 mr-4 bg-emerald-700 hover:bg-gray-600 text-gray-50 rounded-2xl p-2 px-4"
				>
					Save
				</button>
				<button
					@click.prevent="restoreDefault"
					class="mt-4 bg-orange-500 hover:bg-gray-600 text-gray-50 rounded-2xl p-2 px-4"
				>
					Restore Default
				</button>
			</div>
		</form>
	</div>
</template>

<script>
import { onMounted, ref } from "vue";
export default {
	setup() {
		const settings = ref({});
		const openaiKey = ref("");
		const bingKey = ref("");

		onMounted(() => {
			settings.value = JSON.parse(
				localStorage.getItem("openai_settings")
			);

			openaiKey.value = JSON.parse(
				localStorage.getItem("openai_api_key")
			);

			bingKey.value = JSON.parse(localStorage.getItem("bing_api_key"));

			console.log(settings.value);
		});

		function saveSettings() {
			localStorage.setItem(
				"openai_settings",
				JSON.stringify(settings.value)
			);
			localStorage.setItem(
				"openai_api_key",
				JSON.stringify(openaiKey.value)
			);
			localStorage.setItem("bing_api_key", JSON.stringify(bingKey.value));
		}

		function restoreDefault() {
			settings.value = {
				systemMessage:
					"Let's spin up an instance of GPT that is fun and informative, answering all of the users queries, truthfully and creatively.",
				model: "gpt-3.5-turbo",
				mode: "creative",
			};

			localStorage.setItem(
				"openai_settings",
				JSON.stringify(settings.value)
			);
		}

		function closePopup() {
			const sideNav = document.querySelector("#side-nav");
			sideNav.classList.toggle("hidden");
		}

		return {
			settings,
			openaiKey,
			bingKey,
			saveSettings,
			restoreDefault,
			closePopup,
		};
	},
};
</script>

<style>
</style>