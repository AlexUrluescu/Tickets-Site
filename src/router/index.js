import { createWebHistory, createRouter } from "vue-router";
import PaginaPrincipala from "@/components/PaginaPrincipala.vue";
import PaginaStadionMunicipal from "@/components/StadionMunicipalComponenets/PaginaStadionMunicipal.vue";
import PaginaLogin from "@/components/PaginaLogin.vue";
import PaginaSignUp from "@/components/PaginaSignUp.vue";
import PaginaPlata from "@/components/PaginaPlata.vue";
import ConfirmarePlata from "@/components/ConfirmarePlata.vue";
import PaginaIncarcareDocs from "@/components/PaginaIncarcareDocs.vue";
import PaginaAdmin from "@/components/PaginaAdmin.vue";
import { useUserStore } from "@/stores/user.js";

const routes = [
  {
    path: "/",
    name: "PaginaPrincipala",
    component: PaginaPrincipala,
  },
  {
    path: "/incarcare-docs",
    name: "PaginaIncarcareDocs",
    component: PaginaIncarcareDocs,
  },
  {
    path: "/bilete-stadion-municipal",
    name: "StadionMunicipal",
    component: PaginaStadionMunicipal,
  },
  {
    path: "/user/login",
    name: "PaginaLogin",
    component: PaginaLogin,
  },
  {
    path: "/user/signup",
    name: "PaginaSignUp",
    component: PaginaSignUp,
  },
  {
    path: "/payment-checkout",
    name: "PaginaPlata",
    component: PaginaPlata,
  },
  {
    path: "/confirm-path",
    name: "ConfirmarePlata",
    component: ConfirmarePlata,
  },
  {
    path: "/admin",
    name: "PaginaAdmin",
    component: PaginaAdmin,
    meta: { requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn || !userStore.isAdmin) {
      next({ name: "PaginaPrincipala" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
