<script setup>
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



</style>