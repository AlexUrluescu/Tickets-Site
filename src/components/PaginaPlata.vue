<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useShoppingCartStore } from "@/stores/cosCumparaturi.js";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const router = useRouter();
const shoppingCartStore = useShoppingCartStore();
const userStore = useUserStore();
const { items, total } = storeToRefs(shoppingCartStore);
const { userName } = storeToRefs(userStore);

const displayValueCN = ref("");
const displayValueED = ref("");
const displayValueCVC = ref("");
const cardName = ref("");
const isProcessing = ref(false);
const errorMessage = ref("");

// Verificare dacă există items în coș la încărcarea paginii
onMounted(() => {
  if (items.value.length === 0) {
    router.push("/bilete-stadion-municipal");
  }

  // Preia email-ul din localStorage sau din user store
  const userEmail = localStorage.getItem("userEmail") || "";
  if (!userEmail) {
    // Redirecționează la login dacă nu există email
    router.push("/user/login");
  }
});

// Formatam numarul cardului cu spatii dupa fiecare 4 numere
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\D/g, "");
  let formattedValue = "";
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue = formattedValue + " ";
    }
    formattedValue = formattedValue + value[i];
  }
  displayValueCN.value = formattedValue;
};

// Formatam data expirarii ca sa apara '/' dupa ce introduci luna
const formatExpirationDate = (event) => {
  let value = event.target.value.replace(/\D/g, "");
  let formattedValue = "";
  for (let i = 0; i < value.length; i++) {
    if (i === 2) {
      formattedValue = formattedValue + " / ";
    }
    formattedValue = formattedValue + value[i];
  }
  displayValueED.value = formattedValue;
};

const formatCVC = (event) => {
  let value = event.target.value.replace(/\D/g, "");
  displayValueCVC.value = value;
};

// Validare date card
const validateCardData = () => {
  if (!cardName.value || cardName.value.length < 3) {
    errorMessage.value = "Vă rugăm introduceți numele de pe card";
    return false;
  }

  const cardNumberClean = displayValueCN.value.replace(/\s/g, "");
  if (cardNumberClean.length !== 16) {
    errorMessage.value = "Numărul cardului trebuie să conțină 16 cifre";
    return false;
  }

  const expirationClean = displayValueED.value.replace(/\s\/\s/g, "");
  if (expirationClean.length !== 4) {
    errorMessage.value = "Data expirării trebuie să fie în format MM/YY";
    return false;
  }

  if (displayValueCVC.value.length !== 3) {
    errorMessage.value = "CVC trebuie să conțină 3 cifre";
    return false;
  }

  errorMessage.value = "";
  return true;
};

// Procesare plată
const processPayment = async () => {
  if (!validateCardData()) {
    return;
  }

  isProcessing.value = true;
  errorMessage.value = "";

  try {
    // Preia datele necesare
    const userEmail = localStorage.getItem("userEmail");
    const matchData = JSON.parse(localStorage.getItem("selectedMatch") || "{}");

    console.log("=== PREGĂTIRE PLATĂ ===");
    console.log("matchData din localStorage:", matchData);
    console.log("matchId din matchData:", matchData.matchId);

    // Verifică că matchId există
    if (!matchData.matchId) {
      errorMessage.value =
        "Eroare: ID-ul meciului lipsește. Vă rugăm să reveniți la selecția biletelor.";
      isProcessing.value = false;
      return;
    }

    const paymentData = {
      cardName: cardName.value,
      cardNumber: displayValueCN.value.replace(/\s/g, ""),
      expirationDate: displayValueED.value,
      cvc: displayValueCVC.value,
      userEmail: userEmail,
      userName: userName.value || cardName.value,
      items: items.value,
      totalAmount: total.value,
      awayTeam: matchData.awayTeamName,
      matchDate: matchData.matchDate,
      matchTime: matchData.matchTime,
      matchId: matchData.matchId,
    };

    console.log("=== DATE TRIMISE LA BACKEND ===");
    console.log("paymentData:", paymentData);

    const response = await fetch("http://localhost:3000/api/process-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      const paymentDetails = {
        orderId: result.orderId,
        date: new Date().toISOString(),
        amount: total.value,
        lastFourDigits: displayValueCN.value.slice(-4),
        items: items.value,
        userEmail: userEmail,
      };

      localStorage.setItem("paymentDetails", JSON.stringify(paymentDetails));
      localStorage.setItem("paymentComplete", "true");
      shoppingCartStore.clearCart();
      router.push("/confirm-path");
    } else {
      errorMessage.value =
        result.error ||
        "Eroare la procesarea plății. Vă rugăm încercați din nou.";
    }
  } catch (error) {
    console.error("Eroare procesare plată:", error);
    errorMessage.value = "Eroare de conexiune. Vă rugăm încercați din nou.";
  } finally {
    isProcessing.value = false;
  }
};

const goBack = () => {
  router.push("/bilete-stadion-municipal");
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans"
  >
    <div
      class="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
    >
      <div
        class="md:w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-between"
      >
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"
        ></div>

        <div class="relative z-10">
          <button
            @click="goBack"
            :disabled="isProcessing"
            class="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-8 text-sm font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-4 h-4 transform rotate-180"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Înapoi la bilete
          </button>

          <h2 class="text-3xl font-bold mb-1">Total de plată</h2>
          <p class="text-5xl font-black tracking-tight mb-8">
            {{ total }} <span class="text-2xl font-medium">RON</span>
          </p>

          <div class="space-y-4">
            <p
              class="text-xs uppercase tracking-widest text-blue-200 font-bold border-b border-blue-500/30 pb-2"
            >
              Coșul tău
            </p>

            <div
              class="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
            >
              <div
                v-for="(item, index) in items"
                :key="index"
                class="flex justify-between items-start bg-blue-700/30 p-3 rounded-lg border border-blue-500/30"
              >
                <div>
                  <p class="font-bold text-sm">
                    {{ item.numarBilete }} x Bilet {{ item.tribuna }}
                  </p>
                  <p class="text-xs text-blue-200">Sector {{ item.sector }}</p>
                </div>
                <span class="font-mono font-bold">{{ item.pret }} lei</span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="mt-8 pt-6 border-t border-blue-500/30 text-xs text-blue-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z"
            />
          </svg>
          Tranzacție securizată SSL
        </div>
      </div>

      <div class="md:w-7/12 bg-white p-8 md:p-12 relative">
        <div class="mb-10 w-full max-w-sm mx-auto perspective">
          <div
            class="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"
            ></div>
            <div class="flex justify-between items-start mb-8">
              <div
                class="w-10 h-6 bg-yellow-500/80 rounded flex items-center justify-center"
              >
                <div
                  class="w-8 h-4 border border-yellow-600/50 rounded-sm"
                ></div>
              </div>
              <span class="italic font-bold text-lg text-slate-400">VISA</span>
            </div>
            <div class="font-mono text-xl tracking-widest mb-6 opacity-90">
              {{ displayValueCN || "**** **** **** ****" }}
            </div>
            <div class="flex justify-between items-end">
              <div>
                <p class="text-[10px] uppercase text-slate-400">Card Holder</p>
                <p
                  class="font-medium tracking-wide uppercase text-sm truncate max-w-[150px]"
                >
                  {{ cardName || "NUME PRENUME" }}
                </p>
              </div>
              <div>
                <p class="text-[10px] uppercase text-slate-400">Expires</p>
                <p class="font-medium tracking-wide text-sm">
                  {{ displayValueED || "MM/YY" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2
          style="margin-top: 15px"
          class="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left"
        >
          Detalii Card
        </h2>

        <div
          v-if="errorMessage"
          class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md flex items-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          {{ errorMessage }}
        </div>

        <div style="margin-top: 20px" class="space-y-5">
          <div class="relative">
            <label
              class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1"
              >Numele de pe card</label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <input
                type="text"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 font-medium placeholder-gray-400"
                v-model="cardName"
                :disabled="isProcessing"
                placeholder="Ion Popescu"
                autofocus
              />
            </div>
          </div>

          <div style="margin-top: 10px" class="relative">
            <label
              class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1"
              >Numărul cardului</label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                  />
                </svg>
              </div>
              <input
                type="text"
                maxlength="19"
                v-model="displayValueCN"
                @input="formatCardNumber"
                :disabled="isProcessing"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 font-medium font-mono placeholder-gray-400"
                placeholder="0000 0000 0000 0000"
              />
            </div>
          </div>

          <div style="margin-top: 10px" class="flex gap-4">
            <div class="w-1/2 relative">
              <label
                class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1"
                >Expiră (MM/YY)</label
              >
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  maxlength="7"
                  v-model="displayValueED"
                  @input="formatExpirationDate"
                  :disabled="isProcessing"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 font-medium text-center placeholder-gray-400"
                  placeholder="MM / YY"
                />
              </div>
            </div>

            <div class="w-1/2 relative">
              <label
                class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1"
                >CVC / CVV</label
              >
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  maxlength="3"
                  v-model="displayValueCVC"
                  @input="formatCVC"
                  :disabled="isProcessing"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 font-medium text-center placeholder-gray-400"
                  placeholder="123"
                />
              </div>
            </div>
          </div>

          <button
            style="margin-top: 25px; cursor: pointer"
            @click="processPayment"
            :disabled="isProcessing"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg uppercase tracking-wider shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed mt-4"
          >
            <span
              v-if="!isProcessing"
              class="flex items-center justify-center gap-2"
            >
              Confirmă Plata
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Se procesează...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-sans {
  font-family: "Noto Sans", sans-serif;
}

/* Custom Scrollbar for the items list */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
