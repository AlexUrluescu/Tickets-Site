<script setup>
import {useRouter} from "vue-router";
import {useShoppingCartStore} from "@/stores/cosCumparaturi.js";
import {storeToRefs} from "pinia";
import {onMounted , onBeforeUnmount} from "vue";

const router = useRouter();
const shoppingCartStore = useShoppingCartStore();
const {isShoppingCartVisible, items, total} = storeToRefs(shoppingCartStore);

const goToPaymentPage = () => {
  router.push("/payment-checkout")
}

const removeTicket = (index) => {
  shoppingCartStore.removeTickets(index);

}
</script>

<template>
  <!-- Adaugă condiție de afișare și clase pentru animație -->
  <Transition name="cart-slide">
    <div class="main-container" v-if="isShoppingCartVisible">
      <h1 class="title">Coșul tău de cumpărături</h1>
      <!-- Afișează fiecare element din coș -->
      <div v-if="items.length === 0" class="empty-cart">
        <p>Coșul tău este gol</p>
      </div>
      <div v-else>
        <div v-for="(item, index) in shoppingCartStore.items" :key="index" class="ticket-info-wrapper">
          <p>{{ item.numarBilete }} bilete la sectorul {{ item.sector }}, {{ item.tribuna }}</p>
          <div v-if="item.randuriSiLocuri">
            <p v-for="(randInfo, idx) in item.randuriSiLocuri" :key="idx">
              Rând: {{ randInfo.rand }} Locuri: {{ randInfo.locuri }}
            </p>
          </div>
          <p v-else>Rând: {{item.rand}} Locuri: {{item.numar_locuri}}</p>
          <p>Preț: {{ item.pret }} RON</p>
          <button class="delete-btn" @click="removeTicket(index)">Șterge bilete</button>
        </div>
      </div>
      <div class="container-footer">
        <p>Total plată: {{ total }} RON</p>
        <button class="continue-btn" @click="goToPaymentPage" :disabled="items.length === 0">
          Continuă la finalizarea plății
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Noto Sans", sans-serif;
}

.main-container{
  display:flex;
  flex-direction: column;
  position: absolute;
  background-color: oklch(93.6% 0.032 17.717) ;
  border-style: hidden hidden solid solid;
  width: 25%;
  height:100%;
  right: 0;
  z-index: 1000;
}

.title{
  overflow: hidden;
  white-space: nowrap;
  font-size: 1.4rem;
  text-align: center;
  padding: 5% 0 5% 0;
  border-bottom: 1px solid grey;
}

.ticket-info-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  justify-content: space-evenly;
  padding: 4% 0 4% 0;
  border-bottom: 1px solid grey;
  font-size: 1.1rem;
}

.empty-cart {
  display: flex;
  justify-content: center;
  padding: 10% 0;
  font-size: 1.2rem;
  color: #666;
}

.delete-btn{
  background-color: oklch(57.7% 0.245 27.325);
  border:none;
  border-radius: 12px;
  width:45%;
  aspect-ratio: 16/4;
  font-size: 0.9rem;
  color:white;
}
.delete-btn:hover{
  background-color: oklch(50.5% 0.213 27.518);
  cursor:pointer;
}

.container-footer{
  position:absolute;
  bottom:0;
  display: flex;
  flex-direction: column;
  gap:6px;
  align-items: center;
  justify-content: space-evenly;
  height: 15%;
  width:100%;
  padding: 5% 0 5% 0;
  border-top: 1px solid grey;
}

.container-footer p {
  font-size: 1.2rem;
}

.continue-btn{
  background-color:oklch(62.7% 0.194 149.214);
  border:none;
  border-radius: 12px;
  width:45%;
  aspect-ratio: 16/4;
  padding: 0 2% 0 2%;
  font-size: 0.9rem;
  color:white;
}

.continue-btn:hover{
  cursor:pointer;
  background-color: oklch(52.7% 0.154 150.069);
}


.cart-slide-enter-active {
  animation: slide-in 0.3s ease-out;
}
.cart-slide-leave-active {
  animation: slide-out 0.3s ease-in;
}
@keyframes slide-in {
  from {
    transform: translateY(50%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes slide-out {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(50%);
    opacity: 0;
  }
}
</style>