<template>
    <section>
        <button @click="$router.back()" class="flex items-center gap-4 my-5">
            <img src="@/assets/svg/back_route.svg" alt="">
            <span class="text-lg font-semibold c_c92">Back</span>
        </button>
        <ul v-if="store.isLoading" class="grid md:grid-cols-2 gap-5">
            <li class="min-h-[320px] is_loading"></li>
            <li class="min-h-[320px] is_loading"></li>
        </ul>
        <div v-else class="grid md:grid-cols-2">
            <ul>
                <li>
                    User
                    <div>
                        <div class="flex gap-2 p-5">
                            <img class="w-10 h-10" src="@/assets/svg/user.svg" alt="">
                            <div class="flex items-center whitespace-nowrap gap-5">
                                <span>{{ store.user?.name }}</span>
                                <span>{{ store.user?.surname }}</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    Contact
                    <div class="p-5 space-y-2">
                        <a :href="`tel:${store.user?.phone}`" class="max-w-fit flex items-center gap-2 noclick"
                            aria-label="Call user">
                            <img class="w-4 h-4" src="@/assets/svg/phone.svg" alt="">
                            {{ store.user?.phone }}
                        </a>
                        <a :href="`mailto:${store.user?.email}`" class="max-w-fit flex items-center gap-2 noclick"
                            aria-label="Email user">
                            <img class="w-4 h-4" src="@/assets/svg/mail.svg" alt="">
                            {{ store.user?.email }}
                        </a>
                    </div>
                </li>
                <li>
                    Website
                    <div class="p-5">
                        <a :href="`https://${store.user?.website}`" target="_blank"
                            class="max-w-fit flex items-center gap-2 noclick">
                            {{ store.user?.website }}
                            <img class="w-4 h-4" src="@/assets/svg/link.svg" alt="">
                        </a>
                    </div>
                </li>
                <li>
                    Company
                    <div class="p-5">
                        <ul v-for="(value, key) in store.user?.company" :key="key">
                            <strong class="capitalize">{{ key }}</strong>: {{ value }}
                        </ul>
                    </div>
                </li>
            </ul>
            <div>
                Location
                <div class="md:min-h-[320px] min-h-[240px] p-5">
                    <div ref="mapContainer" class="w-full aspect-video overflow-hidden"></div>
                    <ul>
                        <li v-show="key != 'geo'" v-for="(value, key) in store.user?.address" :key="key">
                            <strong class="capitalize">{{ key }}</strong>: {{ value }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useApiRequest } from "~/composables";

const apiRequest = useApiRequest();
const router = useRouter();
const mapContainer = ref();
const map = ref();
const marker = ref();

const store = reactive({
    user: {},
    address: {},
    isLoading: true,
    showLocation: false,
});

async function getUser() {
    try {
        const data = await apiRequest.get(`users/${router.currentRoute.value?.params?.id}`);
        store.user = data.data
        store.isLoading = false;
        showLocation();
    } catch (error) {
        console.log(error)
    }
}


function showLocation() {
    const address = store.user?.address;
    let lat = address?.geo?.lat;
    let lng = address?.geo?.lng;
    import("leaflet").then(async (L) => {
        map.value = L.map(mapContainer.value).setView(
            [lat, lng],
            13
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map.value);

        marker.value = L.marker([lat, lng], {
            draggable: true,
        }).addTo(map.value).bindPopup(`<strong>${address.city}</strong>.<br> ${address.street}.`)
            .openPopup().on("dragend", (event) => {
                const marker = event.target;
                const position = marker.getLatLng();
            });
    });
}

onBeforeMount(() => {
    console.log("Hi")
    getUser();
})
</script>

<style scoped></style>