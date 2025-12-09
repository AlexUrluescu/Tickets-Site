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
      matchId: matchData.matchId, // ← ADĂUGAT: Include matchId din localStorage
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
      // Salvează detaliile plății pentru pagina de confirmare
      const paymentDetails = {
        orderId: result.orderId,
        date: new Date().toISOString(),
        amount: total.value,
        lastFourDigits: displayValueCN.value.slice(-4),
        items: items.value,
        userEmail: userEmail,
      };

      localStorage.setItem("paymentDetails", JSON.stringify(paymentDetails));

      // IMPORTANT: Setează flag pentru actualizarea datelor despre sectoare
      localStorage.setItem("paymentComplete", "true");

      // Golește coșul de cumpărături
      shoppingCartStore.clearCart();

      // Redirecționează la pagina de confirmare
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

// Functionalitate pentru a merge inapoi
const goBack = () => {
  router.push("/bilete-stadion-municipal");
};
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans"
  >
    <div class="max-w-lg w-full p-8 bg-white rounded-xl shadow-2xl relative">
      <button
        class="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200 mb-6"
        @click="goBack"
        :disabled="isProcessing"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-5 h-5 transform rotate-180"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        <p class="font-medium">Înapoi</p>
      </button>

      <h2 class="text-center text-2xl font-bold text-gray-800 mb-8">
        Finalizare Plată
      </h2>

      <div class="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
          Rezumat comandă
        </h3>
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-100 last:border-b-0"
        >
          <span>{{ item.numarBilete }} bilete - Sector {{ item.sector }}</span>
          <span class="font-medium">{{ item.pret }} RON</span>
        </div>
        <div
          class="flex justify-between mt-3 pt-3 border-t-2 text-lg text-gray-900"
        >
          <strong class="font-extrabold">Total:</strong>
          <strong style="color: #027be6" class="font-extrabold"
            >{{ total }} RON</strong
          >
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="bg-red-100 text-red-800 p-3 rounded-lg border border-red-300 mb-6 text-sm font-medium"
      >
        {{ errorMessage }}
      </div>

      <div class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700"
            >Numele de pe card:</label
          >
          <input
            type="text"
            class="px-4 py-3 border border-gray-300 rounded-lg w-full text-base placeholder-gray-400 focus:border-red-500 focus:ring-red-500 transition duration-150 disabled:bg-gray-200"
            v-model="cardName"
            :disabled="isProcessing"
            placeholder="NUME PRENUME"
            autofocus
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700"
            >Numărul cardului:</label
          >
          <input
            type="text"
            maxlength="19"
            v-model="displayValueCN"
            @input="formatCardNumber"
            :disabled="isProcessing"
            placeholder="xxxx xxxx xxxx xxxx"
            class="px-4 py-3 border border-gray-300 rounded-lg w-full text-base placeholder-gray-400 focus:border-red-500 focus:ring-red-500 transition duration-150 disabled:bg-gray-200"
          />
        </div>

        <div class="flex gap-4">
          <div class="w-1/2 space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Data expirării:</label
            >
            <input
              type="text"
              maxlength="7"
              v-model="displayValueED"
              @input="formatExpirationDate"
              :disabled="isProcessing"
              placeholder="MM / YY"
              class="px-4 py-3 border border-gray-300 rounded-lg w-full text-base placeholder-gray-400 focus:border-red-500 focus:ring-red-500 transition duration-150 disabled:bg-gray-200"
            />
          </div>
          <div class="w-1/2 space-y-2">
            <label class="block text-sm font-medium text-gray-700">CVC:</label>
            <input
              type="text"
              v-model="displayValueCVC"
              @input="formatCVC"
              :disabled="isProcessing"
              maxlength="3"
              placeholder="000"
              class="px-4 py-3 border border-gray-300 rounded-lg w-full text-base placeholder-gray-400 focus:border-red-500 focus:ring-red-500 transition duration-150 disabled:bg-gray-200"
            />
          </div>
        </div>

        <button
          style="background-color: #027be6; cursor: pointer"
          class="w-full text-white py-4 mt-6 rounded-xl font-bold text-lg uppercase tracking-wider transition duration-300 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
          @click="processPayment"
          :disabled="isProcessing"
        >
          <span v-if="!isProcessing">Plătește {{ total }} RON</span>
          <span v-else>
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
</template>

<style scoped>
/* Nu mai este nevoie de CSS-ul vechi, dar am păstrat font-family Noto Sans */
.font-sans {
  font-family: "Noto Sans", sans-serif;
}
</style>
