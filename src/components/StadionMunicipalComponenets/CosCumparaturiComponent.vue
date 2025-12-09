<script setup>
import { useRouter } from "vue-router";
import { useShoppingCartStore } from "@/stores/cosCumparaturi.js";
import { storeToRefs } from "pinia";
import { onMounted, onBeforeUnmount } from "vue";

const router = useRouter();
const shoppingCartStore = useShoppingCartStore();
const { isShoppingCartVisible, items, total } = storeToRefs(shoppingCartStore);

const goToPaymentPage = () => {
  router.push("/payment-checkout");
};

const removeTicket = (index) => {
  shoppingCartStore.removeTickets(index);
};
</script>

<template>
  <div>
    <div
      v-if="isShoppingCartVisible"
      class="fixed inset-0 bg-black/40 z-40 transition-opacity"
      @click="shoppingCartStore.toggleShoppingCart"
    ></div>

    <Transition
      enter-active-class="transform transition ease-in-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition ease-in-out duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col font-sans"
        v-if="isShoppingCartVisible"
      >
        <div
          class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10"
        >
          <h1 class="text-xl font-bold text-gray-800">Coșul tău</h1>
          <div
            style="color: #027be6"
            class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            {{ items.length }} Articole
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div
            v-if="items.length === 0"
            class="h-full flex flex-col items-center justify-center text-gray-400 gap-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-16 h-16 opacity-50"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            <p class="text-lg font-medium">Coșul tău este gol</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(item, index) in shoppingCartStore.items"
              :key="index"
              class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3 transition hover:shadow-md hover:border-red-200"
            >
              <div
                class="flex justify-between items-start border-b border-gray-100 pb-2"
              >
                <div>
                  <p class="font-bold text-gray-900 text-lg">
                    {{ item.tribuna }}
                  </p>
                  <p
                    class="text-sm text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mt-1"
                  >
                    Sector {{ item.sector }}
                  </p>
                </div>
                <p style="color: #027be6" class="font-bold text-lg">
                  {{ item.pret }} RON
                </p>
              </div>

              <div class="text-sm text-gray-700 space-y-2">
                <div v-if="item.randuriSiLocuri" class="space-y-1">
                  <p
                    v-for="(randInfo, idx) in item.randuriSiLocuri"
                    :key="idx"
                    class="flex justify-between bg-gray-50 p-2 rounded"
                  >
                    <span class="font-semibold text-gray-600"
                      >Rând: {{ randInfo.rand }}</span
                    >
                    <span class="font-medium"
                      >Locuri: {{ randInfo.locuri }}</span
                    >
                  </p>
                </div>
                <p v-else class="flex justify-between bg-gray-50 p-2 rounded">
                  <span class="font-semibold text-gray-600"
                    >Rând: {{ item.rand }}</span
                  >
                  <span class="font-medium"
                    >Locuri: {{ item.numar_locuri }}</span
                  >
                </p>

                <div class="flex justify-between items-center mt-2">
                  <span
                    class="text-xs text-gray-400 uppercase font-bold tracking-wider"
                  >
                    {{ item.numarBilete }} x Bilet Adult
                  </span>

                  <button
                    style="
                      background-color: #027be6;
                      color: white;
                      cursor: pointer;
                    "
                    class="text-sm hover:text-white hover:bg-red-500 border px-3 py-1 rounded-lg transition-all flex items-center gap-1 group"
                    @click="removeTicket(index)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-4 h-4 group-hover:stroke-white"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    Șterge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20"
        >
          <div class="flex justify-between items-center mb-4">
            <p class="text-gray-500 font-medium">Total de plată</p>
            <p class="text-2xl font-black text-gray-900">{{ total }} RON</p>
          </div>

          <button
            style="color: white; background-color: #027be6; cursor: pointer"
            class="w-full py-4 rounded-xl font-bold text-white uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            :class="
              items.length > 0
                ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-600/30'
                : 'bg-gray-400'
            "
            @click="goToPaymentPage"
            :disabled="items.length === 0"
          >
            Continuă la plată
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Scrollbar personalizat pentru un aspect mai curat */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f9fafb;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
