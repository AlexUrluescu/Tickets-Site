<script setup>
import { ref, nextTick, onMounted } from "vue";

const emit = defineEmits(["close"]);

const newMessage = ref("");
const messagesContainer = ref(null);
const isTyping = ref(false);

// Initial greeting
const messages = ref([
  {
    id: 1,
    text: "Salut! 👋 Sunt asistentul virtual al Universității Craiova. Mă poți întreba despre meciuri, prețuri bilete, locuri disponibile sau orice altceva legat de stadion!",
    isUser: false,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
]);

// Quick suggestion chips
const suggestions = ref([
  "Când e următorul meci?",
  "Cât costă un bilet?",
  "Mai sunt locuri libere?",
  "Ce sectoare are stadionul?",
]);
const showSuggestions = ref(true);


const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};


const getAIResponse = async (userText) => {
  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();

    if (!res.ok) {
      return (
        data.response ||
        "Îmi pare rău, am întâmpinat o problemă. Te rog să încerci din nou."
      );
    }

    return data.response;
  } catch (error) {
    console.error("Eroare la comunicarea cu AI:", error);
    return "Îmi pare rău, nu mă pot conecta la server în acest moment. Te rog verifică conexiunea și încearcă din nou.";
  }
};

const sendMessage = async (text = null) => {
  const messageText = text || newMessage.value;
  if (!messageText.trim()) return;


  showSuggestions.value = false;

  // 1. Add User Message
  messages.value.push({
    id: Date.now(),
    text: messageText,
    isUser: true,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  newMessage.value = "";
  scrollToBottom();


  isTyping.value = true;
  scrollToBottom();


  const aiResponse = await getAIResponse(messageText);

  isTyping.value = false;
  messages.value.push({
    id: Date.now() + 1,
    text: aiResponse,
    isUser: false,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
  scrollToBottom();
};

const useSuggestion = (suggestion) => {
  sendMessage(suggestion);
};
</script>

<template>
  <div
    class="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden font-sans h-[520px]"
    style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif"
  >

    <div
      class="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center gap-3 shadow-md relative overflow-hidden"
    >
      
      <div
        class="absolute inset-0 opacity-10"
        style="
          background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
        "
      ></div>

      <div
        class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-white/30 relative z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5 text-white"
        >
          <path
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
      </div>
      <div
        style="
          display: flex;
          justify-content: space-between;
          width: 100%;
        "
        class="relative z-10"
      >
        <div style="width: 100%">
          <h3 class="font-bold text-white text-sm">Asistent AI Oblemenco</h3>
          <p class="text-blue-100 text-xs flex items-center gap-1">
            <span
              class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
            ></span>
            Powered by Llama
          </p>
        </div>
        <div style="display: flex; justify-content: end">
          <button
            @click="$emit('close')"
            class="text-white/80 hover:text-white transition-colors font-bold px-2 hover:bg-white/10 rounded-lg"
            type="button"
            style="cursor: pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    
    <div
      ref="messagesContainer"
      class="flex-1 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto space-y-4"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="msg.isUser ? 'items-end' : 'items-start'"
      >

        <div v-if="!msg.isUser" class="flex items-end gap-2 max-w-[90%]">
          <div
            class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-3.5 h-3.5 text-blue-600"
            >
              <path
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
          <div
            class="px-4 py-2.5 rounded-2xl text-sm shadow-sm bg-white text-gray-800 border border-gray-100 rounded-bl-none leading-relaxed"
            style="white-space: pre-line"
          >
            {{ msg.text }}
          </div>
        </div>

        <!-- User message -->
        <div
          v-if="msg.isUser"
          class="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm bg-blue-600 text-white rounded-br-none leading-relaxed"
        >
          {{ msg.text }}
        </div>

        <span class="text-[10px] text-gray-400 mt-1 px-1" :class="!msg.isUser ? 'ml-8' : ''">
          {{ msg.time }}
        </span>
      </div>


      <div
        v-if="isTyping"
        class="flex items-end gap-2"
      >
        <div
          class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-3.5 h-3.5 text-blue-600"
          >
            <path
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </div>
        <div class="flex items-center gap-1.5 bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 w-fit shadow-sm">
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div
            class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style="animation-delay: 0.15s"
          ></div>
          <div
            class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style="animation-delay: 0.3s"
          ></div>
        </div>
      </div>

      <div v-if="showSuggestions" class="flex flex-wrap gap-2 mt-2">
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          @click="useSuggestion(suggestion)"
          class="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer"
          type="button"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>


    <div class="p-3 bg-white border-t border-gray-100">
      <form @submit.prevent="sendMessage()" class="flex items-center gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Întreabă-mă orice despre bilete..."
          class="flex-1 bg-gray-50 text-sm text-gray-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400 border border-gray-200"
          :disabled="isTyping"
        />
        <button
          type="submit"
          class="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          :disabled="!newMessage.trim() || isTyping"
          style="cursor: pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5 transform -rotate-45 translate-x-[2px] -translate-y-[1px]"
          >
            <path
              d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
            />
          </svg>
        </button>
      </form>
      <p class="text-[10px] text-gray-300 text-center mt-1.5">Powered by local Ollama AI</p>
    </div>
  </div>
</template>

<style scoped>

::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
