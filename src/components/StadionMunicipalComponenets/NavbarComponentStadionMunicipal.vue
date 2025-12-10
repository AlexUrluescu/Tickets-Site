<!-- <script setup>
import {useRouter} from 'vue-router'
import {useUserStore} from '@/stores/user'
import {useShoppingCartStore} from "@/stores/cosCumparaturi.js";
import {storeToRefs} from "pinia";
import { ref} from 'vue'


const router = useRouter()
const userStore = useUserStore()
const shoppingCartStore = useShoppingCartStore()
const {isLoggedIn,userName} = storeToRefs(userStore)
const goToHomePage = () => {
  router.push("/")
}
const goToLoginPage = () => {
  router.push("/user/login")
}

const logout = () => {
  userStore.logout()
  router.push("/")
}

const toggleShoppingCart = () => {
  shoppingCartStore.toggleShoppingCart()
}

const showContainer = ref(false);
const showShoppingContainer = ref(false);
const showLoginInfoContainer = ref(false);
const containerX = ref(0);
const containerY = ref(0);

let hoverTimeout;
let hideTimeout = null;

const showLoginInfo = () => {
  clearTimeout(hideTimeout);
  showLoginInfoContainer.value = true;
};

const hideLoginInfo = () => {
  hideTimeout = setTimeout(() => {
    showLoginInfoContainer.value = false;
  }, 300);
};


</script>

<template>
<div class="navbar-container">
    <img
        @click="goToHomePage" src="@/assets/images/Icons/home_icon.png" alt="home_icon" class="home-icon"
    />
    <div
        v-if="showContainer"
        class="info-container"
        :style="{ top: `${containerY}px`, left: `${containerX}px` }"
    >Deschide pagina principala
    </div>
  <a href="https://fchermannstadt.ro" target="_blank"><img  src="@/assets/images/FC-Hermannstadt-Sibiu.png"
                                            alt="FC_Hermannstadt_logo"
                                            class="hermannstadt-logo"></a>
  <h1 class="titlu">Cumpără sau rezervă bilete la echipa FC HERMANNSTADT</h1>


  <div class="login-container"
       v-if="!isLoggedIn"
       @mouseenter="showLoginInfo"
       @mouseleave="hideLoginInfo">
    <img src="@/assets/images/Icons/login_icon.png" alt="login_icon" class="login-icon"/>
    <p class="login-text">Intra în cont</p>
    <img src="@/assets/images/arrow_down_icon.png" alt="" class="arrow-down-icon"/>
  </div>
  <div class="login-info-container"
       v-if="!isLoggedIn && showLoginInfoContainer"
       @mouseenter="showLoginInfo"
       @mouseleave="hideLoginInfo">
    <p @click="goToLoginPage">Log-in</p>
    <p @click="goToLoginPage">Creeaza cont</p>
  </div>

  <div class="login-container"
       v-if="isLoggedIn"
       @mouseenter="showLoginInfo"
       @mouseleave="hideLoginInfo">
    <img src="@/assets/images/Icons/login_icon.png" alt="login_icon" class="login-icon"/>
    <p class="login-text">Salut, {{ userName }}</p>
    <img src="@/assets/images/arrow_down_icon.png" alt="" class="arrow-down-icon"/>
  </div>

  <div class="login-info-container"
       v-if="isLoggedIn && showLoginInfoContainer"
       @mouseenter="showLoginInfo"
       @mouseleave="hideLoginInfo">
    <p @click="logout">Log out</p>
  </div>

  <img src="@/assets/images/Icons/shopping-cart.png"
       alt="shopping-cart-icon"
       class="shopping-cart-icon"
       @click="toggleShoppingCart">

</div>
</template>

<style scoped>


* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.navbar-container {
  display:flex;
  gap:50px;
  width: auto;
  min-height:75px;
  background-image: linear-gradient(to right ,oklch(1 0 0), oklch(0.577 0.245 27.325));
  position:relative;
  border:1px solid;
  z-index:1000;
}


.home-icon{
  height:40px;
  margin-left:10%;
  margin-top:calc(75px * 0.22);
  transition-duration: 0.4s;
}

.home-icon:hover {
  transform: scale(1.2);
  cursor: pointer;
}

.info-container{
  font-family: "Noto Sans", sans-serif;
  font-size:12px;
  position:absolute;
  background-color: white;
  padding: 3px;
  border: 1px solid;
  z-index:1000;
}

.hermannstadt-logo{
  height: 50px;
  margin-top:calc(75px * 0.15);
}

.titlu{
  font-family: "Noto Sans", sans-serif;
  font-size:30px;
  margin-top: calc(75px * 0.15);
  margin-left:5%;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.login-container{
  display:flex;
  margin-left:50%;
  gap:10px;
  padding-bottom:10px;
  transition-duration: 0.4s;

}

.login-container:hover{
  transform: scale(1.2);
  cursor: pointer;
}


.login-icon{
  height:40px;
  margin-top:calc(75px * 0.22);
}

.login-text{
  font-family: "Noto Sans", sans-serif;
  font-size:20px;
  margin-top:calc(75px * 0.30);
  overflow: hidden;
  white-space: nowrap;
}

.arrow-down-icon{
    height:25px;
    margin-top:15%;
    margin-left:-7%;
}

.login-info-container{
  font-family: "Noto Sans", sans-serif;
  font-size:20px;
  padding: 10px;
  display:flex;
  justify-content: center;
  gap:20px;
  position:absolute;
  top:100%;
  left:81%;
  width:200px;
  height:auto;
  background: linear-gradient(
      to right,
      oklch(0.7 0.2 27.325),
      oklch(0.577 0.245 27.325)
  );;
  border: 1px solid;
  border-radius: 5px;
  cursor:pointer;
}

.shopping-cart-icon{
  height:40px;
  margin-top:calc(75px * 0.22);
  margin-right:2%;
  transition-duration: 0.4s;
}

.shopping-cart-icon:hover{
  transform: scale(1.2);
  cursor: pointer;
}

.shopping-cart-info-container{
  font-family: "Noto Sans", sans-serif;
  font-size:12px;
  position:absolute;
  background-color: white;
  padding: 3px;
  border: 1px solid;
  z-index:1000;
}



</style> -->
<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useShoppingCartStore } from "@/stores/cosCumparaturi.js";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const router = useRouter();
const userStore = useUserStore();
const shoppingCartStore = useShoppingCartStore();
const { isLoggedIn, userName } = storeToRefs(userStore);
const goToHomePage = () => {
  router.push("/");
};
const goToLoginPage = () => {
  router.push("/user/login");
};

const logout = () => {
  userStore.logout();
  router.push("/");
};

const toggleShoppingCart = () => {
  shoppingCartStore.toggleShoppingCart();
};

const showContainer = ref(false);
const showShoppingContainer = ref(false);
const showLoginInfoContainer = ref(false);
const containerX = ref(0);
const containerY = ref(0);

let hoverTimeout;
let hideTimeout = null;

const showLoginInfo = () => {
  clearTimeout(hideTimeout);
  showLoginInfoContainer.value = true;
};

const hideLoginInfo = () => {
  hideTimeout = setTimeout(() => {
    showLoginInfoContainer.value = false;
  }, 300);
};
</script>

<template>
  <nav
    class="relative z-50 flex items-center justify-between w-full h-20 px-4 md:px-8 shadow-lg font-sans bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white"
  >
    <div class="flex items-center gap-6">
      <div class="relative group">
        <div
          class="p-2 rounded-full hover:bg-white/10 transition-colors duration-300 cursor-pointer"
          @click="goToHomePage"
        >
          <img
            src="@/assets/images/Icons/home_icon.png"
            alt="home_icon"
            class="h-6 w-6 md:h-7 md:w-7 brightness-0 invert transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div
          v-if="showContainer"
          class="absolute top-12 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md shadow-xl pointer-events-none whitespace-nowrap z-50"
        >
          Deschide pagina principala
        </div>
      </div>

      <a
        href="https://ucv1948.ro"
        target="_blank"
        class="flex items-center group"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg"
          alt="universitatea_craiova_logo"
          class="h-12 md:h-14 w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-xl"
        />
      </a>
    </div>

    <div class="hidden lg:flex flex-col items-center justify-center">
      <h1
        class="text-sm font-medium text-blue-200 uppercase tracking-widest mb-0.5"
      >
        Shop Oficial
      </h1>
      <h2
        class="text-xl xl:text-2xl font-black text-white tracking-tighter uppercase"
      >
        Universitatea <span class="text-blue-200">Craiova</span>
      </h2>
    </div>

    <div class="flex items-center gap-6">
      <div class="relative">
        <div
          class="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-xl hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-white/20"
          @mouseenter="showLoginInfo"
          @mouseleave="hideLoginInfo"
        >
          <div
            class="bg-blue-800 p-2 rounded-full shadow-inner group-hover:bg-blue-900 transition-colors"
          >
            <img
              src="@/assets/images/Icons/login_icon.png"
              alt="login_icon"
              class="h-5 w-5 brightness-0 invert"
            />
          </div>

          <div class="hidden md:flex flex-col items-start">
            <span
              v-if="!isLoggedIn"
              class="text-xs text-blue-200 font-medium uppercase"
              >Contul meu</span
            >
            <p
              v-if="!isLoggedIn"
              class="text-sm font-bold text-white leading-none"
            >
              Intră în cont
            </p>

            <span
              v-if="isLoggedIn"
              class="text-xs text-blue-200 font-medium uppercase"
              >Bine ai venit,</span
            >
            <p
              v-if="isLoggedIn"
              class="text-sm font-bold text-white leading-none max-w-[120px] truncate"
            >
              {{ userName }}
            </p>
          </div>

          <img
            src="@/assets/images/arrow_down_icon.png"
            alt=""
            class="h-3 w-3 brightness-0 invert opacity-70 transition-transform duration-300 group-hover:rotate-180"
          />
        </div>

        <div
          class="absolute top-full right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col z-50 origin-top-right transition-all transform"
          v-if="showLoginInfoContainer"
          @mouseenter="showLoginInfo"
          @mouseleave="hideLoginInfo"
        >
          <div v-if="!isLoggedIn" class="flex flex-col p-2">
            <p
              @click="goToLoginPage"
              class="flex items-center gap-2 px-4 py-3 text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 cursor-pointer font-bold transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Autentificare
            </p>
            <div class="h-px bg-gray-100 my-1 mx-2"></div>
            <p
              @click="goToLoginPage"
              class="flex items-center gap-2 px-4 py-3 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-700 cursor-pointer font-medium transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 17.25a4.875 4.875 0 004.875-4.875h2.25a4.875 4.875 0 004.875 4.875h-12z"
                />
              </svg>
              Creează cont nou
            </p>
          </div>

          <div v-if="isLoggedIn" class="flex flex-col p-2">
            <p
              @click="logout"
              class="flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 cursor-pointer font-bold transition-colors text-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              Deconectare
            </p>
          </div>
        </div>
      </div>

      <div class="relative group">
        <div
          class="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-sm border border-white/10"
          @click="toggleShoppingCart"
        >
          <img
            src="@/assets/images/Icons/shopping-cart.png"
            alt="shopping-cart-icon"
            class="h-6 w-6 brightness-0 invert group-hover:scale-110 transition-transform"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* No extra CSS needed */
</style>
