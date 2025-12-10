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
  <div class="relative h-screen w-full overflow-hidden bg-slate-900 font-sans">
    <div class="absolute inset-0 z-0">
      <img
        src="@/assets/images/Icons/imagine-fotbal.png"
        alt="Stadionul Ion Oblemenco"
        class="w-full h-full object-cover opacity-60 transition-transform duration-[20s] ease-linear hover:scale-110"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-slate-900/60 to-slate-900/30 mix-blend-multiply"
      ></div>

      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none"
      ></div>
    </div>

    <div
      class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div class="relative group mb-10">
        <div
          class="absolute -inset-1 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"
        ></div>
        <img
          src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg"
          alt="Universitatea Craiova Logo"
          class="relative w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-fade-in-down"
        />
      </div>

      <h2
        class="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-2 animate-slide-up"
      >
        Campioana Unei Mari Iubiri
      </h2>

      <h1
        class="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-6 drop-shadow-2xl leading-tight"
      >
        Vulcanul<br />
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white"
          >Ion Oblemenco</span
        >
      </h1>

      <p
        class="text-lg md:text-2xl text-slate-200 font-medium mb-12 max-w-2xl leading-relaxed"
      >
        Aici bate inima Olteniei. Fii alături de
        <span class="text-blue-400 font-bold">Leii din Bănie</span> la următorul
        meci.
      </p>

      <button
        style="margin-top: 20px; cursor: pointer"
        @click="goToStadionMunicipal"
        class="group relative px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold uppercase tracking-widest rounded-xl overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_rgba(37,99,235,0.8)] transform hover:-translate-y-1"
      >
        <div
          class="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] transition-all duration-700 group-hover:left-full"
        ></div>

        <span class="relative z-10 flex items-center gap-3">
          Rezervă-ți Locul
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="w-5 h-5 transition-transform group-hover:translate-x-2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
            />
          </svg>
        </span>
      </button>
    </div>

    <footer
      class="absolute bottom-0 w-full py-6 px-6 text-center z-10 border-t border-white/5 bg-slate-900/80 backdrop-blur-md"
    >
      <div
        class="flex flex-col md:flex-row justify-center items-center gap-2 text-slate-400 text-xs md:text-sm"
      >
        <span class="font-bold text-white"
          >&copy; {{ new Date().getFullYear() }} Universitatea Craiova.</span
        >
        <span class="hidden md:inline">•</span>
        <span>Spiritul nu moare niciodată.</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Custom Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 1s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 1s ease-out 0.3s forwards; /* 0.3s delay */
  opacity: 0; /* Start hidden for delay to work */
}
</style>
