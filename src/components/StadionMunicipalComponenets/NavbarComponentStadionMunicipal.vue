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
    style="background-color: #027be6; color: white"
    class="relative z-50 flex items-center justify-between w-full h-20 px-4 md:px-8 shadow-md font-sans"
  >
    <div class="flex items-center gap-6">
      <div class="relative group">
        <img
          @click="goToHomePage"
          style="color: white"
          src="@/assets/images/Icons/home_icon.png"
          alt="home_icon"
          class="h-8 w-8 md:h-10 md:w-10 cursor-pointer transition-transform duration-300 hover:scale-110 hover:brightness-110"
        />
        <div
          v-if="showContainer"
          class="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-50"
          :style="{ top: `${containerY}px`, left: `${containerX}px` }"
        >
          Deschide pagina principala
        </div>
      </div>

      <a
        href="https://fchermannstadt.ro"
        target="_blank"
        class="flex items-center"
      >
        <img
          style="margin-top: 10px"
          src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg"
          alt="universitatea_craiova_logo"
          class="h-10 md:h-12 w-auto object-contain hover:opacity-90 transition-opacity"
        />
      </a>
    </div>

    <h1
      style="color: white"
      class="hidden lg:block text-lg xl:text-2xl font-bold text-gray-900 tracking-tight uppercase px-4 truncate"
    >
      Cumpără sau rezervă bilete
      <span
        style="color: white"
        class="text-red-700 md:text-white lg:text-gray-900 xl:text-gray-900"
        >Universitatea Craiova</span
      >
    </h1>

    <div class="flex items-center gap-4 md:gap-8">
      <div class="relative">
        <div
          class="flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-105 group"
          v-if="!isLoggedIn"
          @mouseenter="showLoginInfo"
          @mouseleave="hideLoginInfo"
        >
          <img
            src="@/assets/images/Icons/login_icon.png"
            alt="login_icon"
            class="h-8 w-8 brightness-0 invert drop-shadow-md"
          />
          <p
            class="hidden md:block text-white font-semibold text-lg drop-shadow-sm"
          >
            Intra în cont
          </p>
          <img
            src="@/assets/images/arrow_down_icon.png"
            alt=""
            class="h-5 w-5 brightness-0 invert transition-transform group-hover:translate-y-1"
          />
        </div>

        <div
          class="flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-105 group"
          v-if="isLoggedIn"
          @mouseenter="showLoginInfo"
          @mouseleave="hideLoginInfo"
        >
          <img
            src="@/assets/images/Icons/login_icon.png"
            alt="login_icon"
            class="h-8 w-8 brightness-0 invert drop-shadow-md"
          />
          <p
            class="hidden md:block text-white font-semibold text-lg drop-shadow-sm max-w-[150px] truncate"
          >
            Salut, {{ userName }}
          </p>
          <img
            src="@/assets/images/arrow_down_icon.png"
            alt=""
            class="h-5 w-5 brightness-0 invert transition-transform group-hover:translate-y-1"
          />
        </div>

        <div
          class="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-50 origin-top-right transition-all"
          v-if="showLoginInfoContainer"
          @mouseenter="showLoginInfo"
          @mouseleave="hideLoginInfo"
        >
          <div v-if="!isLoggedIn" class="flex flex-col">
            <p
              @click="goToLoginPage"
              class="px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer font-medium transition-colors text-center border-b border-gray-100"
            >
              Log-in
            </p>
            <p
              @click="goToLoginPage"
              class="px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer font-medium transition-colors text-center"
            >
              Creeaza cont
            </p>
          </div>

          <div v-if="isLoggedIn" class="flex flex-col">
            <p
              style="color: #027be6"
              @click="logout"
              class="px-6 py-3 cursor-pointer font-bold transition-colors text-center"
            >
              Log out
            </p>
          </div>
        </div>
      </div>

      <img
        src="@/assets/images/Icons/shopping-cart.png"
        alt="shopping-cart-icon"
        class="h-8 w-8 md:h-9 md:w-9 cursor-pointer brightness-0 invert drop-shadow-md transition-transform duration-300 hover:scale-110"
        @click="toggleShoppingCart"
      />
    </div>
  </nav>
</template>

<style scoped>
/* No styles needed! All handled by Tailwind CSS */
</style>
