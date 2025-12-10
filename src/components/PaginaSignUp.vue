<!-- <script setup>
 import {ref,computed} from 'vue'
 import { useRoute } from 'vue-router'
 import { useRouter } from 'vue-router';
 import eyeOpen from '@/assets/images/Icons/hidePasswordIcon.png'
 import eyeClosed from '@/assets/images/Icons/showPasswordIcon.png'
 import {useUserStore} from "@/stores/user.js";

 const route = useRoute();
 const router = useRouter();
 const emailFromLogin = route.query.email;
 const nume=ref('')
 const parola=ref('')
 const confirmaParola = ref('')
 const parolaVizibila = ref(false)
 const esteFocusParola = ref(false)
 const confirmaVizibila = ref(false)
 const userStore = useUserStore();

 const eroareNume = computed(() => {
   if (nume.value === '') return 'Câmp obligatoriu'
   if (nume.value.length < 3) return 'Numele trebuie să conțină minim 3 caractere'
   return ''
 })

 const clasaInput = computed(() => {
   return eroareNume.value ? 'name-input eroare' : 'name-input'
 })

 const validareParola = computed(()=>({
   lungime:parola.value.length >=6,
   majuscula:/[A-Z]/.test(parola.value),
   minuscula:/[a-z]/.test(parola.value),
   special: /[^A-Za-z0-9]/.test(parola.value),
 }))

 const toateConditiile = computed(() => {
   const v = validareParola.value
   return v.lungime && v.majuscula && v.minuscula && v.special
 })

 const eroareParola = computed(() => {
   if (parola.value === '') return 'Câmp obligatoriu'
   if (!toateConditiile.value) return 'Parola este prea slabă'
   return ''
 })

 const eroareConfirmare = computed(() => {
   if (confirmaParola.value === '') return 'Câmp obligatoriu'
   if (parola.value !== confirmaParola.value) return 'Parolele nu sunt identice'
   return ''
 })

 const tipParola = computed(() => parolaVizibila.value ? 'text' : 'password')
 const tipConfirmare = computed(() => confirmaVizibila.value ? 'text' : 'password')

 const handleCreazaCont = async () => {
   if (parola.value === confirmaParola.value && nume.value !== '' && parola.value !== '' && confirmaParola.value !=='' && toateConditiile.value === true) {
     const response = await fetch('http://localhost:3000/api/add-user', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({username: nume.value, email: emailFromLogin , password:parola.value}),
     })
     const token = 'dummy-token';
     const userData = { name: nume.value };

     // Salvează email-ul în localStorage
     localStorage.setItem('userEmail', emailFromLogin);

     userStore.login(token, userData);
     router.push({name:'StadionMunicipal'});
   }
 }

</script>

<template>
<div class="grid-container">
  <img src="@/assets/images/Icons/Logo.png" alt="logo" class="logo">
  <div class="signup-container">
    <h1 class="text">Bine ai venit!</h1>
    <p class="text">{{emailFromLogin}}</p>
    <p class="text">Se pare că nu aveți cont , haide să creăm unul!</p>

    <h1 class="text" style="font-size:  1.3rem">Nume si prenume</h1>
    <input  :class="clasaInput" v-model="nume"/>
    <p v-if="eroareNume" class="text-eroare">{{eroareNume}}</p>

    <p class="text" style="font-size: 1.3rem">Crează o parolă sigură</p>
    <div class="input-wrapper">
      <input
          :type="tipParola"
          class="password-input"
          v-model="parola"
          @focus="esteFocusParola = true"
          @blur="esteFocusParola = false"
      />
      <span class="toggle-password" @click="parolaVizibila = !parolaVizibila">
        <img
         :src="parolaVizibila ? eyeOpen : eyeClosed"
          alt="toggle password"
          class="icon-parola"
        />
      </span>
    </div>
    <p v-if="eroareParola" class="text-eroare">{{ eroareParola }}</p>

    <div v-if="esteFocusParola" class="parola-hints">
      <ul>
        <li :class="{ valid: validareParola.lungime }">Minim 6 caractere</li>
        <li :class="{ valid: validareParola.majuscula }">Minim o majusculă</li>
        <li :class="{ valid: validareParola.minuscula }">Minim o minusculă</li>
        <li :class="{ valid: validareParola.special }">Minim un caracter special : ! @ ?</li>
      </ul>
    </div>

    <p class="text" style="font-size: 1.3rem">Confirmă parola</p>
    <div class="input-wrapper">
      <input
          :type="tipConfirmare"
          class="password-input"
          v-model="confirmaParola"
      />
    </div>
    <p v-if="eroareConfirmare" class="text-eroare">{{ eroareConfirmare }}</p>
    <button type="submit" class="creaza-contul" @click="handleCreazaCont">Crează contul!</button>

  </div>
</div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.grid-container{
  display:grid;
  grid-template-rows: auto 1fr;
  gap: 20px;
  min-height: 650px;
  max-width:400px;
  margin: 0 auto;
  padding: 20px;
  place-content: center;
}

.signup-container{
  width:400px;
  height:600px;
  flex-direction: column;
  border-style:solid;
  border-radius:2%;
  border-color: oklch(0.723 0.219 149.579);
  box-shadow: 10px 10px 18px oklch(0.527 0.154 150.069);
  background-color: oklch(0.982 0.018 155.826);
}

.logo{
  display:block;
  margin-left:auto;
  margin-right:auto;
}

.text{
  font-family: "Noto Sans", sans-serif;
  text-align: center;
  margin-top:5%;
  font-size: 18px;
}

.name-input{
  display:block;
  margin-left:auto;
  margin-right:auto;
  margin-top:3%;
  min-height: 35px;
  min-width: 85%;
  border:1px solid;
  border-radius: 21px;
  background-color: oklch(0.982 0.018 155.826);
  padding: 6px 35px 6px 10px;
  font-family: "Noto Sans", sans-serif;
  font-size:14px;
}



.text-eroare {
  color: red;
  font-size: 14px;
  text-align: left;
  margin-left:8%;
  margin-top: 1%;
  font-family: "Noto Sans", sans-serif;
}

.password-input{
  display:block;
  margin-left:auto;
  margin-right:auto;
  margin-top:3%;
  min-height: 35px;
  min-width: 85%;
  border:1px solid;
  border-radius: 21px;
  background-color: oklch(0.982 0.018 155.826);
  padding: 6px 40px 6px 10px;
}

.parola-hints {
  background-color: oklch(98% 0.04 25);
  font-family: "Noto Sans", sans-serif;
  border: 1px solid red;
  border-radius: 10px;
  padding: 10px;
  margin: 10px auto;
  width: 85%;
  font-size: 14px;
  color: red;
}

.parola-hints ul {
  list-style-type: none;
  padding: 0;
}

.parola-hints li {
  margin-bottom: 4px;
}

.parola-hints li.valid {
  color: green;
}

.input-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.password-input {
  width: 85%;
  padding-right: 40px; /* spațiu pentru icon */
}

.toggle-password {
  position: absolute;
  right: 30px;
  cursor: pointer;
  font-size: 18px;
  user-select: none;
}

.icon-parola {
  margin-left: 5%;
  margin-top: 25%;
  width:50px;
  height: 24px;
  object-fit: contain;
}

.creaza-contul{
  display:block;
  margin-left:auto;
  margin-right:auto;
  margin-top:20px;
  min-height: 35px;
  min-width:85%;
  border-style: none;
  border-radius: 21px;
  font-family: "Noto Sans", sans-serif;
  font-size:18px;
  color:white;
  background-color:oklch(0.723 0.219 149.579) ;
}

.creaza-contul:hover{
  background-color: oklch(0.627 0.194 149.214);
  cursor:pointer;
}

</style> -->

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import eyeOpen from "@/assets/images/Icons/hidePasswordIcon.png";
import eyeClosed from "@/assets/images/Icons/showPasswordIcon.png";
import { useUserStore } from "@/stores/user.js";

const route = useRoute();
const router = useRouter();
const emailFromLogin = route.query.email;
const nume = ref("");
const parola = ref("");
const confirmaParola = ref("");
const parolaVizibila = ref(false);
const esteFocusParola = ref(false);
const confirmaVizibila = ref(false);
const userStore = useUserStore();

const eroareNume = computed(() => {
  if (nume.value === "") return "Câmp obligatoriu";
  if (nume.value.length < 3)
    return "Numele trebuie să conțină minim 3 caractere";
  return "";
});

const clasaInput = computed(() => {
  return eroareNume.value
    ? "border-red-500 ring-1 ring-red-500"
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
});

const validareParola = computed(() => ({
  lungime: parola.value.length >= 6,
  majuscula: /[A-Z]/.test(parola.value),
  minuscula: /[a-z]/.test(parola.value),
  special: /[^A-Za-z0-9]/.test(parola.value),
}));

const toateConditiile = computed(() => {
  const v = validareParola.value;
  return v.lungime && v.majuscula && v.minuscula && v.special;
});

const eroareParola = computed(() => {
  if (parola.value === "") return "Câmp obligatoriu";
  if (!toateConditiile.value) return "Parola este prea slabă";
  return "";
});

const eroareConfirmare = computed(() => {
  if (confirmaParola.value === "") return "Câmp obligatoriu";
  if (parola.value !== confirmaParola.value) return "Parolele nu sunt identice";
  return "";
});

const tipParola = computed(() => (parolaVizibila.value ? "text" : "password"));
const tipConfirmare = computed(() =>
  confirmaVizibila.value ? "text" : "password"
);

const handleCreazaCont = async () => {
  if (
    parola.value === confirmaParola.value &&
    nume.value !== "" &&
    parola.value !== "" &&
    confirmaParola.value !== "" &&
    toateConditiile.value === true
  ) {
    const response = await fetch("http://localhost:3000/api/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: nume.value,
        email: emailFromLogin,
        password: parola.value,
      }),
    });
    const token = "dummy-token";
    const userData = { name: nume.value };

    // Salvează email-ul în localStorage
    localStorage.setItem("userEmail", emailFromLogin);

    userStore.login(token, userData);
    router.push({ name: "StadionMunicipal" });
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans"
  >
    <div
      class="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden relative"
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        "
        class="bg-blue-600 p-6 text-center relative overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"
        ></div>
        <div
          class="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-2xl opacity-50"
        ></div>

        <img
          src="https://upload.wikimedia.org/wikipedia/ro/6/68/CS_Universitatea_Craiova.svg"
          alt="Logo"
          class="h-20 w-auto object-contain relative z-10 drop-shadow-lg transform translate-y-4"
        />
        <h1
          style="margin-top: 25px"
          class="text-white font-bold text-2xl mt-4 relative z-10"
        >
          Crează Cont
        </h1>
      </div>

      <div class="p-8">
        <div class="text-center mb-8">
          <p class="text-slate-500 text-sm">Cont nou pentru</p>
          <p class="text-blue-600 font-bold text-lg">{{ emailFromLogin }}</p>
        </div>

        <div style="margin-top: 15px" class="space-y-6">
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1"
              >Nume și prenume</label
            >
            <input
              v-model="nume"
              type="text"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 border transition-all outline-none"
              :class="clasaInput"
              placeholder="Ion Popescu"
            />
            <p
              v-if="eroareNume"
              class="text-red-500 text-xs mt-1 ml-1 font-medium"
            >
              {{ eroareNume }}
            </p>
          </div>

          <div style="margin-top: 10px">
            <label
              class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1"
              >Parolă nouă</label
            >
            <div class="relative">
              <input
                :type="tipParola"
                v-model="parola"
                @focus="esteFocusParola = true"
                @blur="esteFocusParola = false"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none pr-12"
                placeholder="••••••"
              />
              <button
                @click="parolaVizibila = !parolaVizibila"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg
                  v-if="!parolaVizibila"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              </button>
            </div>

            <div
              v-if="esteFocusParola || parola.length > 0"
              class="mt-3 grid grid-cols-2 gap-2"
            >
              <div
                class="flex items-center gap-2 text-xs transition-colors"
                :class="
                  validareParola.lungime
                    ? 'text-green-600 font-bold'
                    : 'text-slate-400'
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    validareParola.lungime ? 'bg-green-500' : 'bg-slate-200'
                  "
                ></span>
                Minim 6 caractere
              </div>
              <div
                class="flex items-center gap-2 text-xs transition-colors"
                :class="
                  validareParola.majuscula
                    ? 'text-green-600 font-bold'
                    : 'text-slate-400'
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    validareParola.majuscula ? 'bg-green-500' : 'bg-slate-200'
                  "
                ></span>
                O majusculă
              </div>
              <div
                class="flex items-center gap-2 text-xs transition-colors"
                :class="
                  validareParola.minuscula
                    ? 'text-green-600 font-bold'
                    : 'text-slate-400'
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    validareParola.minuscula ? 'bg-green-500' : 'bg-slate-200'
                  "
                ></span>
                O minusculă
              </div>
              <div
                class="flex items-center gap-2 text-xs transition-colors"
                :class="
                  validareParola.special
                    ? 'text-green-600 font-bold'
                    : 'text-slate-400'
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    validareParola.special ? 'bg-green-500' : 'bg-slate-200'
                  "
                ></span>
                Caracter special (!@?)
              </div>
            </div>
          </div>

          <div style="margin-top: 10px">
            <label
              class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1"
              >Confirmă parola</label
            >
            <input
              :type="tipConfirmare"
              v-model="confirmaParola"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none"
              placeholder="••••••"
            />
            <p
              v-if="eroareConfirmare"
              class="text-red-500 text-xs mt-1 ml-1 font-medium"
            >
              {{ eroareConfirmare }}
            </p>
          </div>

          <button
            style="margin-top: 25px; cursor: pointer"
            @click="handleCreazaCont"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] mt-4"
          >
            Crează Contul
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No extra CSS needed */
</style>
