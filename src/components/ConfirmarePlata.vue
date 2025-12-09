<!-- <script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const countdown = ref(5);
const paymentDetails = ref(null);

// Recuperăm detaliile plății la încărcarea componentei
onMounted(() => {
  // Încercăm să recuperăm detaliile plății din localStorage
  const storedDetails = localStorage.getItem('paymentDetails');

  if (storedDetails) {
    paymentDetails.value = JSON.parse(storedDetails);
  }

});


const generateTicketNumber = () => {
  return 'TKT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

// Formatăm data
const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Funcție pentru a descărca biletele (simulare)
const downloadTickets = () => {
  alert('Biletele au fost trimise și pe adresa dvs. de email!');
};

// Redirecționare către pagina principală
const goToHomePage = () => {
  router.push('/bilete-stadion-municipal');
};
</script>

<template>
  <div class="confirmation-container">
    <div class="confirmation-card">
      <div class="success-header">
        <div class="success-icon">✓</div>
        <h1>Plată finalizată cu succes!</h1>
        <p>Vă mulțumim pentru achiziție!</p>
      </div>

      <div v-if="paymentDetails" class="payment-info">
        <div class="order-details">
          <div class="detail-row">
            <strong>ID comandă:</strong>
            <span>{{ paymentDetails.orderId }}</span>
          </div>
          <div class="detail-row">
            <strong>Data:</strong>
            <span>{{ formatDate(paymentDetails.date) }}</span>
          </div>
          <div class="detail-row">
            <strong>Total plată:</strong>
            <span class="amount">{{ paymentDetails.amount }} RON</span>
          </div>
          <div class="detail-row">
            <strong>Card:</strong>
            <span>**** **** **** {{ paymentDetails.lastFourDigits }}</span>
          </div>
        </div>

        <div v-if="paymentDetails.items && paymentDetails.items.length > 0" class="tickets-section">
          <h2>Biletele dumneavoastră</h2>

          <div class="tickets-list">
            <div v-for="(item, index) in paymentDetails.items" :key="index" class="ticket">
              <div class="ticket-header">
                <span>Bilet #{{ generateTicketNumber() }}</span>
                <span class="ticket-price">{{ item.pret }} RON</span>
              </div>

              <div class="ticket-body">
                <p><strong>{{ item.numarBilete }} bilete</strong></p>
                <p>Sector: {{ item.sector }}, {{ item.tribuna }}</p>

                <div v-if="item.randuriSiLocuri">
                  <p v-for="(randInfo, idx) in item.randuriSiLocuri" :key="idx">
                    Rând: {{ randInfo.rand }} Locuri: {{ randInfo.locuri }}
                  </p>
                </div>
                <p v-else>Rând: {{ item.rand }} Locuri: {{ item.numar_locuri }}</p>
              </div>
            </div>
          </div>

          <button @click="downloadTickets" class="download-btn">
            Descarcă biletele
          </button>
        </div>

        <div class="additional-info">
          <h3>Instrucțiuni</h3>
          <ul>
            <li>Prezentați biletul în format fizic sau electronic la intrare</li>
            <li>Ajungeți cu cel puțin 30 de minute înainte de începerea evenimentului</li>
            <li>Respectați locurile indicate pe bilete</li>
          </ul>
          <p class="email-info">Un email cu detaliile achiziției a fost trimis la adresa dvs. de email.</p>
        </div>
      </div>

      <div v-else class="no-details">
        <p>Nu am putut găsi detaliile comenzii. Vă rugăm să verificați email-ul pentru confirmarea comenzii.</p>
      </div>

      <div class="actions">
        <button @click="goToHomePage" class="home-btn">
          Înapoi la pagina principală.
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Noto Sans', sans-serif;
}

.confirmation-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.confirmation-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  overflow: hidden;
}

.success-header {
  background-color: #f8f9fa;
  padding: 30px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 40px;
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.payment-info {
  padding: 30px;
}

.order-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.amount {
  font-weight: bold;
  color: #28a745;
}

.tickets-section {
  margin-bottom: 30px;
}

h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.tickets-list {
  margin-bottom: 20px;
}

.ticket {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.ticket-header {
  background-color: oklch(74.6% 0.16 232.661);
  color: white;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.ticket-body {
  padding: 15px;
}

.ticket-body p {
  margin-bottom: 8px;
}

.download-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px;
  width: 100%;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.download-btn:hover {
  background-color: #218838;
}

.additional-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

ul {
  margin-left: 20px;
  margin-bottom: 15px;
}

li {
  margin-bottom: 8px;
  color: #555;
}

.email-info {
  font-style: italic;
  color: #666;
}

.no-details {
  padding: 30px;
  text-align: center;
  color: #dc3545;
}

.actions {
  padding: 0 30px 30px;
  text-align: center;
}

.home-btn {
  background-color: oklch(74.6% 0.16 232.661);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.home-btn:hover {
  background-color: oklch(58.8% 0.158 241.966);
}

@media (max-width: 768px) {
  .confirmation-card {
    border-radius: 8px;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }

  h1 {
    font-size: 20px;
  }

  .payment-info {
    padding: 20px;
  }

  .home-btn {
    width: 100%;
  }
}
</style> -->

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const countdown = ref(5);
const paymentDetails = ref(null);

// Recuperăm detaliile plății la încărcarea componentei
onMounted(() => {
  // Încercăm să recuperăm detaliile plății din localStorage
  const storedDetails = localStorage.getItem("paymentDetails");

  if (storedDetails) {
    paymentDetails.value = JSON.parse(storedDetails);
  }
});

const generateTicketNumber = () => {
  return "TKT-" + Math.random().toString(36).substring(2, 9).toUpperCase();
};

// Formatăm data
const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Funcție pentru a descărca biletele (simulare)
const downloadTickets = () => {
  alert("Biletele au fost trimise și pe adresa dvs. de email!");
};

// Redirecționare către pagina principală
const goToHomePage = () => {
  router.push("/bilete-stadion-municipal");
};
</script>

<template>
  <div
    class="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans relative overflow-hidden"
  >
    <div
      class="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"
    ></div>
    <div
      class="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"
    ></div>

    <div class="w-full max-w-4xl relative z-10">
      <div
        class="bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <div
          class="md:w-1/3 bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 flex flex-col justify-between relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-10"
            style="
              background-image: radial-gradient(
                circle,
                white 2px,
                transparent 2px
              );
              background-size: 20px 20px;
            "
          ></div>

          <div class="relative z-10 text-center md:text-left">
            <div
              class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-inner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="currentColor"
                class="w-8 h-8 text-white"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>

            <h1 class="text-3xl font-black uppercase tracking-tight mb-2">
              Victorie!
            </h1>
            <p class="text-red-100 font-medium leading-relaxed">
              Locurile tale sunt rezervate. Te așteptăm să faci atmosferă pe
              stadion!
            </p>
          </div>

          <div
            class="mt-8 relative z-10 border-t border-white/20 pt-6 space-y-4"
          >
            <div v-if="paymentDetails">
              <p
                class="text-xs uppercase text-red-200 tracking-widest font-bold"
              >
                Sumar Plată
              </p>
              <div class="flex justify-between items-end mt-1">
                <span class="text-sm opacity-80">Total achitat</span>
                <span class="text-2xl font-bold"
                  >{{ paymentDetails.amount }} RON</span
                >
              </div>
              <div
                class="flex justify-between items-center mt-2 text-sm opacity-70"
              >
                <span>Card</span>
                <span class="font-mono"
                  >**** {{ paymentDetails.lastFourDigits }}</span
                >
              </div>
            </div>
            <button
              style="cursor: pointer"
              @click="goToHomePage"
              class="w-full py-3 mt-4 bg-black/30 hover:bg-black/50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4 transform rotate-180"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
              Înapoi la acasă
            </button>
          </div>
        </div>

        <div class="md:w-2/3 p-8 bg-gray-50 overflow-y-auto max-h-[800px]">
          <div v-if="paymentDetails">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Biletele Tale</h2>
                <p class="text-sm text-gray-500">
                  ID Comandă:
                  <span class="font-mono text-gray-700 font-bold"
                    >#{{ paymentDetails.orderId }}</span
                  >
                </p>
              </div>
              <div class="text-right hidden sm:block">
                <p class="text-xs text-gray-400 uppercase">Data Tranzacției</p>
                <p class="text-sm font-bold text-gray-700">
                  {{ formatDate(paymentDetails.date) }}
                </p>
              </div>
            </div>

            <div
              class="space-y-4 mb-8"
              v-if="paymentDetails.items && paymentDetails.items.length > 0"
            >
              <div
                v-for="(item, index) in paymentDetails.items"
                :key="index"
                class="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow duration-300 group"
              >
                <div
                  class="p-5 flex-1 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-dashed border-gray-300 relative"
                >
                  <div
                    class="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 rounded-full"
                  ></div>
                  <div
                    class="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 rounded-full"
                  ></div>

                  <div class="flex justify-between items-start mb-2">
                    <span
                      class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider"
                    >
                      {{ item.tribuna }}
                    </span>
                    <span style="color: #027be6" class="font-bold"
                      >{{ item.pret }} RON</span
                    >
                  </div>

                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-black text-gray-900">{{
                      item.sector
                    }}</span>
                    <span class="text-sm font-medium text-gray-400 uppercase"
                      >Sector</span
                    >
                  </div>

                  <div class="mt-3 text-sm text-gray-600">
                    <div v-if="item.randuriSiLocuri" class="space-y-1">
                      <p
                        v-for="(randInfo, idx) in item.randuriSiLocuri"
                        :key="idx"
                        class="flex gap-2"
                      >
                        <span class="font-bold text-gray-800"
                          >R: {{ randInfo.rand }}</span
                        >
                        <span class="text-gray-400">|</span>
                        <span class="font-bold text-gray-800"
                          >L: {{ randInfo.locuri }}</span
                        >
                      </p>
                    </div>
                    <div v-else>
                      <span class="font-bold text-gray-800"
                        >R: {{ item.rand }}</span
                      >
                      <span class="text-gray-400 mx-2">|</span>
                      <span class="font-bold text-gray-800"
                        >L: {{ item.numar_locuri }}</span
                      >
                    </div>
                  </div>
                </div>

                <div
                  class="w-full sm:w-24 bg-gray-50 p-4 flex sm:flex-col items-center justify-between sm:justify-center gap-2"
                >
                  <div
                    class="text-[10px] text-gray-400 font-mono rotate-0 sm:-rotate-90 whitespace-nowrap"
                  >
                    {{ generateTicketNumber() }}
                  </div>
                  <div
                    class="h-8 sm:h-12 w-full sm:w-8 flex justify-center gap-[2px] overflow-hidden opacity-50"
                  >
                    <div class="w-1 bg-black h-full"></div>
                    <div class="w-2 bg-black h-full"></div>
                    <div class="w-1 bg-black h-full"></div>
                    <div class="w-3 bg-black h-full"></div>
                    <div class="w-1 bg-black h-full"></div>
                    <div class="w-2 bg-black h-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <button
              style="cursor: pointer"
              @click="downloadTickets"
              class="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Descarcă Biletele
            </button>

            <div class="mt-8 pt-6 border-t border-gray-200">
              <h3
                class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2"
              >
                <span class="w-2 h-2 bg-red-600 rounded-full"></span>
                Ghidul Suporterului
              </h3>
              <ul
                class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600"
              >
                <li
                  class="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-100"
                >
                  <span class="text-lg">📱</span>
                  <span
                    >Nu e nevoie să le printezi. Scanează codul direct de pe
                    telefon.</span
                  >
                </li>
                <li
                  class="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-100"
                >
                  <span class="text-lg">⏱️</span>
                  <span
                    >Porțile se deschid cu <strong>1 oră</strong> înainte de
                    fluierul de start.</span
                  >
                </li>
                <li
                  class="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-100"
                >
                  <span class="text-lg">🏟️</span>
                  <span>Respectă locul și sectorul indicat pe bilet.</span>
                </li>
              </ul>
              <p class="mt-6 text-xs text-center text-gray-400">
                Confirmarea a fost trimisă automat pe email-ul tău.
              </p>
            </div>
          </div>

          <div
            v-else
            class="h-full flex flex-col items-center justify-center text-gray-400"
          >
            <p>Se încarcă detaliile...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-sans {
  font-family: "Noto Sans", sans-serif;
}
</style>
