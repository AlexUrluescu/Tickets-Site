<!-- <script setup>
import { reactive } from "vue";
import { useRouter } from 'vue-router';
import {useUserStore} from "@/stores/user.js";

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  email: '',
  password: '',
  eroareEmail: '',
  eroareParola: '',
  isPasswordHidden: false,
  isEmailHidden: true,
});

const validateEmail = () => {
  if (form.email === '') {
    form.eroareEmail = 'Câmp obligatoriu';
    return false;
  }
  form.eroareEmail = '';
  return true;
};

const validatePassword = () => {
  if (form.password === '') {
    form.eroareParola = 'Câmp obligatoriu';
    return false;
  }
  form.eroareParola = '';
  return true;
};

const handleContinue = async () => {
  if (validateEmail()) {
    const response = await fetch('http://localhost:3000/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });
    const data = await response.json();
    console.log(data.found);

    if (data.found === 1) {
      console.log("Emailul exista");
      form.isPasswordHidden = true;
      form.isEmailHidden = false;
    } else {
      console.log("Emailul nu exista");
      router.push({ name: 'PaginaSignUp', query: { email: form.email } });
    }
  }
};

const handlePasswordContinue = async () => {
  if (validatePassword()) {
    const passwordRes = await fetch('http://localhost:3000/api/check-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });

    const nameRes = await fetch ('http://localhost:3000/api/get-name' , {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email:form.email}),
    });

    const passwordData = await passwordRes.json();
    const nameData = await nameRes.json();

    if (form.password === passwordData.password) {
      console.log("Parola este identica!");
      const token = 'dummy-token';
      const userData = { name: nameData.numeUser };

      // Salvează email-ul în localStorage
      localStorage.setItem('userEmail', form.email);

      userStore.login(token, userData);
      router.push({ name: 'StadionMunicipal'});
    } else {
      form.eroareParola = 'Parola este incorectă!';
    }
  }
};

const handleBackButton = () => {
  form.isEmailHidden = true;
  form.isPasswordHidden = false;
  console.log(form.isEmailHidden);
};

</script>


<template>
  <div class="grid-container">
    <img src="@/assets/images/Icons/Logo.png" alt="logo" class="logo" />
    <div v-if="form.isEmailHidden" class="login-container">
      <h1 class="text">Salut!</h1>
      <p class="text">Introdu adresa de email</p>

      <input type="email" class="input" v-model="form.email" autofocus/>
      <p v-if="form.eroareEmail" class="text-eroare">{{ form.eroareEmail }}</p>

      <button  class="btn continue-button" @click="handleContinue">
       Continuă
      </button>

      <p class="text">Dacă nu aveți cont, îl puteți crea la următorul pas</p>
      <div class="separator">sau intră în cont cu</div>
      <button class="btn btn-social facebook">Facebook</button>
      <button class="btn google-login-btn">Google</button>
    </div>

    <div v-if="form.isPasswordHidden" class="password-container">
      <button  class="back-button" @click="handleBackButton">
        <img class="back-arrow-icon" src="@/assets/images/Icons/menu_arrow_icon.png" alt="back-arrow-icon">
        Înapoi
      </button>
      <h1 class="text">Introduceți parola pentru a intra în cont</h1>
      <input type="password" class="input" v-model="form.password" autofocus/>
      <p v-if="form.eroareParola" class="text-eroare">{{ form.eroareParola }}</p>
      <button  class="btn continue-button" @click="handlePasswordContinue">
        Continuă
      </button>

    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.grid-container {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 20px;
  min-height: 650px;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  place-content: center;
}

.login-container {
  width: 400px;
  flex-direction: column;
  border-style: solid;
  border-radius: 2%;
  border-color: oklch(0.723 0.219 149.579);
  box-shadow: 10px 10px 18px oklch(0.527 0.154 150.069);
  background-color: oklch(0.982 0.018 155.826);
  padding: 20px;
}

.password-container{
  width: 400px;
  height: 250px;
  flex-direction: column;
  border-style: solid;
  border-radius: 2%;
  border-color: oklch(0.723 0.219 149.579);
  box-shadow: 10px 10px 18px oklch(0.527 0.154 150.069);
  background-color: oklch(0.982 0.018 155.826);
  padding: 20px;
  position:relative;
}

.back-button{
  display:flex;
  position:relative;
  height: 25px;
  width: 75px;
  border: none;
  background-color: oklch(0.723 0.219 149.579);
  font-family: "Noto Sans", sans-serif;
  padding-top:1%;
  border-radius: 10px;
}

.back-arrow-icon{
    position:relative;
    width:25px;
    transform : rotate(180deg);
    padding-top: 2%;
}

.back-button:hover{
  background-color: oklch(0.627 0.194 149.214);
  cursor: pointer;
}

.logo {
  display: block;
  margin: 0 auto;
}

.text {
  font-family: "Noto Sans", sans-serif;
  text-align: center;
  margin-top: 5%;
  font-size: 18px;
}

.text-eroare {
  color: red;
  font-size: 14px;
  text-align: left;
  margin-left:8%;
  margin-top: 1%;
  font-family: "Noto Sans", sans-serif;
}


.input {
  display: block;
  margin: 8% auto 0 auto;
  min-height: 35px;
  min-width: 85%;
  border: 1px solid;
  border-radius: 21px;
  padding: 6px 35px 6px 10px;
  font-family: "Noto Sans", sans-serif;
  font-size: 14px;
}

.btn {
  display: block;
  margin: 20px auto 0 auto;
  min-height: 35px;
  min-width: 85%;
  border: none;
  border-radius: 21px;
  font-family: "Noto Sans", sans-serif;
  font-size: 18px;
  color: white;
}

.continue-button {
  background-color: oklch(0.723 0.219 149.579);
}

.continue-button:hover {
  background-color: oklch(0.627 0.194 149.214);
  cursor: pointer;
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin-top: 8%;
  margin-left: 9%;
  margin-right: 9%;
  font-family: "Noto Sans", sans-serif;
  font-size: 15px;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid oklch(0.723 0.219 149.579);
}

.separator:not(:empty)::before {
  margin-right: .30em;
}

.separator:not(:empty)::after {
  margin-left: .30em;
}

.facebook {
  background-color: #415a94;
}

.facebook:hover {
  background-color: #314471;
  cursor: pointer;
}

.google-login-btn {
  background-color: #cf553d;
}

.google-login-btn:hover {
  background-color: #ae412b;
  cursor: pointer;
}



</style> -->
<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user.js";

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  email: "",
  password: "",
  eroareEmail: "",
  eroareParola: "",
  isPasswordHidden: false,
  isEmailHidden: true,
});

const validateEmail = () => {
  if (form.email === "") {
    form.eroareEmail = "Câmp obligatoriu";
    return false;
  }
  form.eroareEmail = "";
  return true;
};

const validatePassword = () => {
  if (form.password === "") {
    form.eroareParola = "Câmp obligatoriu";
    return false;
  }
  form.eroareParola = "";
  return true;
};

const handleContinue = async () => {
  if (validateEmail()) {
    const response = await fetch("http://localhost:3000/api/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    const data = await response.json();
    console.log(data.found);

    if (data.found === 1) {
      console.log("Emailul exista");
      form.isPasswordHidden = true;
      form.isEmailHidden = false;
    } else {
      console.log("Emailul nu exista");
      router.push({ name: "PaginaSignUp", query: { email: form.email } });
    }
  }
};

const handlePasswordContinue = async () => {
  if (validatePassword()) {
    const passwordRes = await fetch(
      "http://localhost:3000/api/check-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      }
    );

    const nameRes = await fetch("http://localhost:3000/api/get-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    const passwordData = await passwordRes.json();
    const nameData = await nameRes.json();

    if (form.password === passwordData.password) {
      console.log("Parola este identica!");
      const token = "dummy-token";
      const userData = { name: nameData.numeUser };

      // Salvează email-ul în localStorage
      localStorage.setItem("userEmail", form.email);

      userStore.login(token, userData);
      router.push({ name: "StadionMunicipal" });
    } else {
      form.eroareParola = "Parola este incorectă!";
    }
  }
};

const handleBackButton = () => {
  form.isEmailHidden = true;
  form.isPasswordHidden = false;
  console.log(form.isEmailHidden);
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans"
  >
    <div
      class="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
    >
      <div
        class="h-32 bg-blue-600 relative overflow-hidden flex items-center justify-center"
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
      </div>

      <div class="px-8 pb-10 pt-12">
        <div v-if="form.isEmailHidden" class="space-y-6 animate-fade-in">
          <div class="text-center">
            <h1
              class="text-2xl font-black text-slate-800 uppercase tracking-tight"
            >
              Bine ai venit
            </h1>
            <p class="text-slate-500 text-sm mt-1">
              Introdu adresa de email pentru a continua
            </p>
          </div>

          <div style="margin-top: 20px" class="space-y-2">
            <label
              for="email"
              class="block text-xs font-bold text-slate-500 uppercase ml-1"
              >Email</label
            >
            <div class="relative">
              <input
                id="email"
                type="email"
                v-model="form.email"
                autofocus
                placeholder="nume@exemplu.ro"
                class="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
                :class="{
                  'border-red-500 ring-1 ring-red-500 bg-red-50':
                    form.eroareEmail,
                }"
              />
            </div>
            <p
              v-if="form.eroareEmail"
              class="text-xs text-red-600 font-bold ml-1 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-3 h-3"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ form.eroareEmail }}
            </p>
          </div>

          <button
            style="margin-top: 20px; cursor: pointer"
            @click="handleContinue"
            class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-200 transition-all transform active:scale-95"
          >
            Continuă
          </button>

          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="px-2 bg-white text-slate-400"
                >Sau conectează-te cu</span
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              class="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-600"
            >
              <span class="text-blue-600">f</span> Facebook
            </button>
            <button
              class="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-600"
            >
              <span class="text-red-500">G</span> Google
            </button>
          </div>

          <p class="text-center text-xs text-slate-400 mt-4">
            Contul se va crea automat dacă nu există.
          </p>
        </div>

        <div v-if="form.isPasswordHidden" class="space-y-6 animate-slide-in">
          <div class="flex items-center gap-4 mb-6">
            <button
              @click="handleBackButton"
              class="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <div>
              <h2 class="text-xl font-bold text-slate-800">Parola Ta</h2>
              <p class="text-xs text-slate-500">{{ form.email }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <label
              for="password"
              class="block text-xs font-bold text-slate-500 uppercase ml-1"
              >Parolă</label
            >
            <input
              id="password"
              type="password"
              v-model="form.password"
              autofocus
              class="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
              :class="{
                'border-red-500 ring-1 ring-red-500 bg-red-50':
                  form.eroareParola,
              }"
            />
            <p
              v-if="form.eroareParola"
              class="text-xs text-red-600 font-bold ml-1 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-3 h-3"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ form.eroareParola }}
            </p>
          </div>

          <button
            @click="handlePasswordContinue"
            class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-200 transition-all transform active:scale-95"
          >
            Intră în Cont
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
