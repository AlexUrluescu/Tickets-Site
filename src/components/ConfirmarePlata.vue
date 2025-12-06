<script setup>
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
</style>