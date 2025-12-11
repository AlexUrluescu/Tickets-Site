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
    text: "Salut! Sunt asistentul virtual al Universității Craiova. Cu ce te pot ajuta legat de bilete sau meci?",
    isUser: false,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
]);

// Auto-scroll to bottom of chat
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Simulate AI Logic
const getAIResponse = (userText) => {
  const text = userText.toLowerCase();

  if (text.includes("pret") || text.includes("preț") || text.includes("cost")) {
    return "Prețurile variază în funcție de sector. Tribuna 2 începe de la 30 RON, iar la Peluză biletele sunt 15 RON.";
  }
  if (text.includes("stadion") || text.includes("locatie")) {
    return "Meciul se joacă pe Stadionul 'Ion Oblemenco' din Craiova.";
  }
  if (text.includes("bilete") || text.includes("cumpar")) {
    return "Poți cumpăra bilete apăsând butonul 'Rezervă' din dreptul meciului dorit din listă.";
  }
  if (text.includes("cand") || text.includes("ora")) {
    return "Următorul meci este programat conform calendarului de pe pagină. Te rog verifică data și ora în secțiunea de sus.";
  }
  return "Am înțeles. Pentru detalii specifice, te rog să selectezi un meci din listă sau să contactezi casa de bilete.";
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  // 1. Add User Message
  messages.value.push({
    id: Date.now(),
    text: newMessage.value,
    isUser: true,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  const userText = newMessage.value;
  newMessage.value = "";
  scrollToBottom();

  // 2. Simulate AI Typing
  isTyping.value = true;

  setTimeout(() => {
    isTyping.value = false;
    messages.value.push({
      id: Date.now() + 1,
      text: getAIResponse(userText),
      isUser: false,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    scrollToBottom();
  }, 1500); // 1.5s delay
};
</script>

<template>
  <div
    class="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden font-sans h-[500px]"
  >
    <div class="bg-blue-600 p-4 flex items-center gap-3 shadow-md">
      <div
        class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6 text-blue-600"
        >
          <path d="M16.5 7.5h-9v9h9v-9z" />
          <path
            fill-rule="evenodd"
            d="M8.25 2.25A.75.75 0 019 3v1.5h6V3a.75.75 0 011.5 0v1.5h.75c.966 0 1.75.784 1.75 1.75v13.5A1.75 1.75 0 0117.25 21.5h-10.5a1.75 1.75 0 01-1.75-1.75V6.25c0-.966.784-1.75 1.75-1.75h.75V3a.75.75 0 01.75-.75zM6.5 6.25a.25.25 0 00-.25.25v13.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V6.5a.25.25 0 00-.25-.25h-10.5z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div
        style="
          display: flex;
          justify-content: space-between;

          width: 100%;
        "
      >
        <div style="width: 100%">
          <h3 class="font-bold text-white text-sm">Asistent Craiova</h3>
          <p class="text-blue-100 text-xs flex items-center gap-1">
            <span
              class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
            ></span>
            Online
          </p>
        </div>
        <div style="display: flex; justify-content: end">
          <button
            @click="$emit('close')"
            class="text-white hover:text-blue-200 transition-colors font-bold px-2"
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
      class="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="msg.isUser ? 'items-end' : 'items-start'"
      >
        <div
          class="max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm"
          :class="[
            msg.isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none',
          ]"
        >
          {{ msg.text }}
        </div>
        <span class="text-[10px] text-gray-400 mt-1 px-1">
          {{ msg.time }}
        </span>
      </div>

      <div
        v-if="isTyping"
        class="flex items-center gap-1 bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 w-fit"
      >
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div
          class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style="animation-delay: 0.2s"
        ></div>
        <div
          class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style="animation-delay: 0.4s"
        ></div>
      </div>
    </div>

    <div class="p-3 bg-white border-t border-gray-100">
      <form @submit.prevent="sendMessage" class="flex items-center gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Scrie un mesaj..."
          class="flex-1 bg-gray-100 text-sm text-gray-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400"
        />
        <button
          type="submit"
          class="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!newMessage.trim()"
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
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for chat */
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
