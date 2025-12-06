<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'
import { useShoppingCartStore } from '@/stores/cosCumparaturi.js';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const router = useRouter();
const shoppingCartStore = useShoppingCartStore();
const userStore = useUserStore();
const { items, total } = storeToRefs(shoppingCartStore);
const { userName } = storeToRefs(userStore);

const displayValueCN = ref('');
const displayValueED = ref('');
const displayValueCVC = ref('');
const cardName = ref('');
const isProcessing = ref(false);
const errorMessage = ref('');

// Verificare dacă există items în coș la încărcarea paginii
onMounted(() => {
  if (items.value.length === 0) {
    router.push('/bilete-stadion-municipal');
  }

  // Preia email-ul din localStorage sau din user store
  const userEmail = localStorage.getItem('userEmail') || '';
  if (!userEmail) {
    // Redirecționează la login dacă nu există email
    router.push('/user/login');
  }
});

// Formatam numarul cardului cu spatii dupa fiecare 4 numere
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  let formattedValue = '';
  for(let i = 0; i < value.length; i++){
    if(i > 0 && i % 4 === 0){
      formattedValue = formattedValue + ' ';
    }
    formattedValue = formattedValue + value[i];
  }
  displayValueCN.value = formattedValue;
}

// Formatam data expirarii ca sa apara '/' dupa ce introduci luna
const formatExpirationDate = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  let formattedValue = '';
  for(let i = 0; i < value.length; i++){
    if(i === 2){
      formattedValue = formattedValue + ' / ';
    }
    formattedValue = formattedValue + value[i];
  }
  displayValueED.value = formattedValue;
}

const formatCVC = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  displayValueCVC.value = value;
}

// Validare date card
const validateCardData = () => {
  if (!cardName.value || cardName.value.length < 3) {
    errorMessage.value = 'Vă rugăm introduceți numele de pe card';
    return false;
  }

  const cardNumberClean = displayValueCN.value.replace(/\s/g, '');
  if (cardNumberClean.length !== 16) {
    errorMessage.value = 'Numărul cardului trebuie să conțină 16 cifre';
    return false;
  }

  const expirationClean = displayValueED.value.replace(/\s\/\s/g, '');
  if (expirationClean.length !== 4) {
    errorMessage.value = 'Data expirării trebuie să fie în format MM/YY';
    return false;
  }

  if (displayValueCVC.value.length !== 3) {
    errorMessage.value = 'CVC trebuie să conțină 3 cifre';
    return false;
  }

  errorMessage.value = '';
  return true;
}

// Procesare plată
const processPayment = async () => {
  if (!validateCardData()) {
    return;
  }

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    // Preia datele necesare
    const userEmail = localStorage.getItem('userEmail');
    const matchData = JSON.parse(localStorage.getItem('selectedMatch') || '{}');

    console.log('=== PREGĂTIRE PLATĂ ===');
    console.log('matchData din localStorage:', matchData);
    console.log('matchId din matchData:', matchData.matchId);

    // Verifică că matchId există
    if (!matchData.matchId) {
      errorMessage.value = 'Eroare: ID-ul meciului lipsește. Vă rugăm să reveniți la selecția biletelor.';
      isProcessing.value = false;
      return;
    }

    const paymentData = {
      cardName: cardName.value,
      cardNumber: displayValueCN.value.replace(/\s/g, ''),
      expirationDate: displayValueED.value,
      cvc: displayValueCVC.value,
      userEmail: userEmail,
      userName: userName.value || cardName.value,
      items: items.value,
      totalAmount: total.value,
      awayTeam: matchData.awayTeamName,
      matchDate: matchData.matchDate,
      matchTime: matchData.matchTime,
      matchId: matchData.matchId  // ← ADĂUGAT: Include matchId din localStorage
    };

    console.log('=== DATE TRIMISE LA BACKEND ===');
    console.log('paymentData:', paymentData);

    const response = await fetch('http://localhost:3000/api/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
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
        userEmail: userEmail
      };

      localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));

      // IMPORTANT: Setează flag pentru actualizarea datelor despre sectoare
      localStorage.setItem('paymentComplete', 'true');

      // Golește coșul de cumpărături
      shoppingCartStore.clearCart();

      // Redirecționează la pagina de confirmare
      router.push('/confirm-path');
    } else {
      errorMessage.value = result.error || 'Eroare la procesarea plății. Vă rugăm încercați din nou.';
    }
  } catch (error) {
    console.error('Eroare procesare plată:', error);
    errorMessage.value = 'Eroare de conexiune. Vă rugăm încercați din nou.';
  } finally {
    isProcessing.value = false;
  }
}

// Functionalitate pentru a merge inapoi
const goBack = () => {
  router.push('/bilete-stadion-municipal')
}
</script>

<template>
  <div class="wrapper">
    <div class="payment">
      <button class="back-btn" @click="goBack" :disabled="isProcessing">
        <img src="@/assets/images/Icons/menu_arrow_icon.png" alt="arrow-back" class="back-arrow">
        <p class="back-btn-text">Înapoi</p>
      </button>

      <h2>Introduceți datele cardului</h2>

      <!-- Afișare rezumat comandă -->
      <div class="order-summary">
        <h3>Rezumat comandă</h3>
        <div v-for="(item, index) in items" :key="index" class="order-item">
          <span>{{ item.numarBilete }} bilete - Sector {{ item.sector }}</span>
          <span>{{ item.pret }} RON</span>
        </div>
        <div class="order-total">
          <strong>Total:</strong>
          <strong>{{ total }} RON</strong>
        </div>
      </div>

      <!-- Mesaj de eroare -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form">
        <div class="card space icon-relative">
          <label class="label">Numele de pe card:</label>
          <input
              type="text"
              class="input"
              v-model="cardName"
              :disabled="isProcessing"
              placeholder="NUME PRENUME"
              autofocus
          >
        </div>

        <div class="card space icon-relative">
          <label class="label">Numărul cardului:</label>
          <input
              type="text"
              maxlength="19"
              v-model="displayValueCN"
              @input="formatCardNumber"
              :disabled="isProcessing"
              placeholder="xxxx xxxx xxxx xxxx"
              class="input"
          >
        </div>

        <div class="card-grp space">
          <div class="card-item icon-relative">
            <label class="label">Data expirării:</label>
            <input
                type="text"
                maxlength="7"
                v-model="displayValueED"
                @input="formatExpirationDate"
                :disabled="isProcessing"
                placeholder="MM / YY"
                class="input"
            >
          </div>
          <div class="card-item icon-relative">
            <label class="label">CVC:</label>
            <input
                type="text"
                class="input"
                v-model="displayValueCVC"
                @input="formatCVC"
                :disabled="isProcessing"
                maxlength="3"
                placeholder="000"
            >
          </div>
        </div>

        <button
            class="btn"
            @click="processPayment"
            :disabled="isProcessing"
        >
          <span v-if="!isProcessing">Plătește {{ total }} RON</span>
          <span v-else">Se procesează...</span>
        </button>
      </div>

      <!-- Informații securitate -->
      <div class="security-info">
        <p>🔒 Plata dvs. este securizată și criptată</p>
        <p>💳 Acceptăm carduri Visa, Mastercard</p>
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

.wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.payment {
  background: white;
  max-width: 460px;
  width: 100%;
  margin: 0 auto;
  padding: 35px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: oklch(74.6% 0.16 232.661);
  color: white;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover:not(:disabled) {
  background-color: oklch(58.8% 0.158 241.966);
  transform: translateX(-5px);
}

.back-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.back-arrow {
  width: 20px;
  height: 20px;
  transform: rotate(180deg);
}

.back-btn-text {
  font-size: 14px;
  font-weight: 500;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.order-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
}

.order-summary h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #555;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
}

.order-total {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #dee2e6;
  font-size: 18px;
  color: #333;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #f5c6cb;
}

.form .label {
  display: block;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.input {
  padding: 14px 16px;
  width: 100%;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.input:focus {
  border-color: oklch(58.8% 0.158 241.966);
  background-color: white;
  outline: none;
}

.input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.card-grp {
  display: flex;
  gap: 20px;
}

.card-item {
  flex: 1;
}

.space {
  margin-bottom: 20px;
}

.btn {
  margin-top: 30px;
  background-color: oklch(74.6% 0.16 232.661);
  border: none;
  padding: 16px;
  width: 100%;
  text-align: center;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
  background-color: oklch(58.8% 0.158 241.966);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.security-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.security-info p {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

@media screen and (max-width: 480px) {
  .payment {
    padding: 25px;
  }

  .card-grp {
    flex-direction: column;
    gap: 0;
  }

  .order-summary {
    padding: 15px;
  }

  h2 {
    font-size: 20px;
  }
}
</style>