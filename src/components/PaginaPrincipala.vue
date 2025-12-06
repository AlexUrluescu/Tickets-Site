<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToStadionMunicipal = () => {
  router.push("/bilete-stadion-municipal");
};
</script>

<template>
  <header>
    <div class="logo-container">
      <img src="@/assets/images/Icons/Logo.png" alt="logo" class="logo" />
    </div>
  </header>
  <main class="main-container">
    <div class="left-section">
      <div class="left-title-container">
        <h1>Stadionul Municipal Sibiu</h1>
      </div>
      <div class="left-button-container" @click="goToStadionMunicipal">
        <p>Vezi evenimente</p>
      </div>
    </div>
    <div class="right-section">
      <div class="right-title-container">
        <h1>Sala Transilvania</h1>
      </div>
      <div class="right-button-container" @click="goToSalaTransilvania">
        <p>Vezi evenimente</p>
      </div>
    </div>
  </main>
  <footer>
    <p>© 2025 GameDaySibiu. Toate drepturile rezervate.</p>
  </footer>
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
</style>
