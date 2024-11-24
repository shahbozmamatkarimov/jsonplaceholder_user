export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    if (process.client) {
      const token = localStorage.getItem("token");
      // ...
    }
  } catch (err) { }
});
