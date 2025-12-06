import {createWebHistory,createRouter} from "vue-router";
import PaginaPrincipala from "@/components/PaginaPrincipala.vue";
import PaginaStadionMunicipal from "@/components/StadionMunicipalComponenets/PaginaStadionMunicipal.vue";
import PaginaLogin from "@/components/PaginaLogin.vue";
import PaginaSignUp from "@/components/PaginaSignUp.vue";
import PaginaPlata from "@/components/PaginaPlata.vue";
import ConfirmarePlata from "@/components/ConfirmarePlata.vue";

const routes = [
    {
        path: "/",
        name: "PaginaPrincipala",
        component: PaginaPrincipala,
    },
    {
        path:"/bilete-stadion-municipal",
        name:"StadionMunicipal",
        component: PaginaStadionMunicipal,
    },
    {
        path:"/user/login",
        name:"PaginaLogin",
        component:PaginaLogin,
    },
    {
        path:"/user/signup",
        name:"PaginaSignUp",
        component:PaginaSignUp,
    },
    {
        path:"/payment-checkout",
        name:"PaginaPlata",
        component:PaginaPlata,
    },
    {
        path:"/confirm-path",
        name:"ConfirmarePlata",
        component: ConfirmarePlata
    }
]

const router = createRouter({
    history:createWebHistory(),
    routes
})


export default router;