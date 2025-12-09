<!-- <script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToStadionMunicipal = () => {
  router.push("/bilete-stadion-municipal");
};
</script>

<template>
  <main class="main-container">
    <div class="left-section">
      <div class="left-title-container">
        <h1>Stadionul Municipal Sibiu</h1>
      </div>
      <div class="left-button-container" @click="goToStadionMunicipal">
        <p>Vezi evenimente</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: 100%;
}
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}

:global(body) {
  background-color: white;
}

header {
  position: fixed;
  text-align: center;
  top: 0;
  background-color: transparent;
  width: 100%;
  height: 100px;
}

.logo-container {
  margin-left: auto;
  margin-right: auto;
  width: 250px;
  height: 100px;
}

.logo-container img {
  width: 200px;
  height: 100%;
  margin-left: 10px;
  padding-bottom: 20px;
}

.main-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: "Fugaz One", sans-serif;
  font-style: normal;
}
.left-section,
.right-section {
  padding: 20px;
  box-sizing: border-box;
  height: 1000px;
}

.left-section {
  background-image: url("@/assets/images/Icons/imagine-fotbal.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-right: 6px solid black;
}

.left-title-container {
  text-align: center;
  border: 1px solid #055049;
  border-radius: 8px;
  margin-top: 30%;
  margin-left: auto;
  margin-right: auto;
  background-color: #3baea0;
  color: #055049;
  width: 500px;
  height: 75px;
}
.left-title-container h1 {
  padding-top: 15px;
}

.left-button-container {
  text-align: center;
  border: 1px solid #055049;
  border-radius: 8px;
  background-color: #3baea0;
  color: #055049;
  font-size: 20px;
  margin-top: 10%;
  margin-left: auto;
  margin-right: auto;
  padding-top: 11px;
  width: 200px;
  height: 50px;
  transition-duration: 0.4s;
}

.left-button-container:hover {
  color: white;
  cursor: pointer;
  box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24),
    0 17px 50px 0 rgba(0, 0, 0, 0.19);
}

.right-section {
  background-image: url("@/assets/images/Icons/imagine_basket.PNG");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.right-title-container {
  text-align: center;
  border: 1px solid #055049;
  border-radius: 8px;
  margin-top: 30%;
  margin-left: auto;
  margin-right: auto;
  background-color: #fdac61;
  color: #935900;
  width: 500px;
  height: 75px;
}

.right-section h1 {
  padding-top: 15px;
}

.right-button-container {
  text-align: center;
  margin-top: 10%;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #935900;
  border-radius: 8px;
  background-color: #fdac61;
  color: #935900;
  font-size: 20px;
  width: 200px;
  height: 50px;
  padding-top: 11px;
  transition-duration: 0.4s;
}
.right-button-container:hover {
  color: white;
  cursor: pointer;
  box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24),
    0 17px 50px 0 rgba(0, 0, 0, 0.19);
}

footer {
  background-color: grey;
  position: absolute;
  text-align: right;
  width: 100%;
  height: 60px;
  padding-top: 10px;
}

footer p {
  font-family: Arial, sans-serif;
  font-size: 17px;
  margin-top: 10px;
  margin-right: 20px;
}
</style> -->

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToStadionMunicipal = () => {
  router.push("/bilete-stadion-municipal");
};
</script>

<template>
  <div class="relative h-screen w-full overflow-hidden bg-black font-sans">
    <div class="absolute inset-0 z-0">
      <img
        src="@/assets/images/Icons/imagine-fotbal.png"
        alt="Stadionul Municipal Sibiu"
        class="w-full h-full object-cover opacity-80 transition-transform duration-[10s] ease-in-out hover:scale-105"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"
      ></div>
    </div>

    <div
      class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg"
        alt="FC Hermannstadt Logo"
        class="w-32 h-32 md:w-40 md:h-40 object-contain mb-8 drop-shadow-2xl animate-fade-in-down"
      />

      <h1
        class="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-lg"
      >
        Stadionul<br class="md:hidden" />
        Ion Oblemenco
      </h1>

      <p
        style="margin-top: 50px; margin-bottom: 20px"
        class="text-lg md:text-2xl text-gray-300 font-medium mb-10 max-w-2xl"
      >
        Casa echipei
        <span style="color: #027be6" class="font-bold"
          >Universitatea Craiova</span
        >
      </p>

      <button
        @click="goToStadionMunicipal"
        style="background-color: #027be6"
        class="group relative px-10 py-4 text-white text-lg font-bold uppercase tracking-widest rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
      >
        <span class="relative z-10 flex items-center gap-2">
          Vezi Evenimente
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 transition-transform group-hover:translate-x-1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </span>
      </button>
    </div>

    <footer
      class="absolute bottom-0 w-full p-6 text-center z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm"
    >
      <p class="text-gray-400 text-sm md:text-base">
        &copy; {{ new Date().getFullYear() }} FC Hermannstadt. Toate drepturile
        rezervate.
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Optional: Simple animation for the logo */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 1s ease-out forwards;
}
</style>
