import { createWebHistory, createRouter } from "vue-router";
import Container from "./components/Container.vue";
import Home from "./components/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/table",
    name: "Table",
    component: Container,
  },
];

console.log("router");

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
