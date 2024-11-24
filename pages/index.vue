<template>
    <nav class="py-5">
        <form>
            <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <img class="" src="@/assets/svg/search.svg" alt="">
                </div>
                <input @input="filterUsers" type="search" id="default-search"
                    class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="Search..." required />
                <button type="submit"
                    class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2">Search</button>
            </div>
        </form>
    </nav>
    <section>
        <div class="">
            <table class="w-full text-sm text-left rtl:text-right border-separate border-spacing-y-3">
                <thead class="text-xs sticky top-0 text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            User
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Contact
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Website
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Company
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Location
                        </th>
                    </tr>
                </thead>
                <tbody v-if="store.isLoading" class="!space-y-5">
                    <tr v-for="i in 10" :key="i" class="bg_cf4 is_loading">
                        <td v-for="i in 5" class="px-6 py-5 h-[90px] w-full"
                            :class="[i == 1 ? 'rounded-l-xl' : '', i == 5 ? 'rounded-r-xl' : '']" :key="i"></td>
                    </tr>
                </tbody>
                <tbody v-else-if="store.users?.length" class="!space-y-5">
                    <tr @click="(e) => showUserData(e, i.id)"
                        v-for="i in store.users?.slice(store.pageSize * store.current - store.pageSize, store.pageSize * store.current)"
                        :key="i" class="bg_cf4">
                        <th scope="row" class="p-5 rounded-l-xl cursor-pointer">
                            <div class="flex gap-2">
                                <img class="w-10 h-10" src="@/assets/svg/user.svg" alt="">
                                <div class="flex items-center whitespace-nowrap gap-5">
                                    <span>{{ i.name }}</span>
                                    <span>{{ i.surname }}</span>
                                </div>
                            </div>
                        </th>
                        <td class="px-6 py-5 space-y-2">
                            <a :href="`tel:${i.phone}`" class="max-w-fit flex items-center gap-2 noclick">
                                <img class="w-4 h-4" src="@/assets/svg/phone.svg" alt="">
                                {{ i.phone }}
                            </a>
                            <a :href="`mailto:${i.email}`" class="max-w-fit flex items-center gap-2 noclick">
                                <img class="w-4 h-4" src="@/assets/svg/mail.svg" alt="">
                                {{ i.email }}
                            </a>
                        </td>
                        <td class="px-6 py-5">
                            <a :href="`https://${i.website}`" target="_blank"
                                class="max-w-fit flex items-center gap-2 noclick">
                                {{ i.website }}
                                <img class="w-4 h-4" src="@/assets/svg/link.svg" alt="">
                            </a>
                        </td>
                        <td class="px-6 py-5">
                            <a-dropdown>
                                <button class="bg-[#13C1B7] text-white py-1 px-5 rounded-full noclick">
                                    {{ i.company?.name }}
                                </button>
                                <template #overlay>
                                    <a-menu>
                                        <a-menu-item v-for="(value, key) in i.company" :key="key">
                                            <strong class="capitalize">{{ key }}</strong>: {{ value }}
                                        </a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown>
                        </td>
                        <td @click="showLocation(i.address)"
                            class="px-6 py-5 cursor-pointer rounded-r-xl text-center noclick">
                            <img class="w-10 h-10 mx-auto noclick" src="@/assets/svg/location.svg" alt="">
                            <strong class="noclick">{{ i.address?.city }}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="font-semibold text-center p-10" v-if="!store.users?.length && !store.isLoading">
                Users not found
            </div>
        </div>
        <div class="flex items-center gap-5">
            <a-pagination class="my-5" v-model:current="store.current" v-model:page-size="store.pageSize"
                :total="store.users?.length"
                :show-total="(total, range) => `${range[0]}-${range[1]} of ${total} items`" />
            <a-select ref="select" v-model:value="store.pageSize" style="width: 120px" :options="pageSizeList"
                @change="store.current = 1"></a-select>
        </div>
    </section>

    <a-modal v-model:open="store.showLocation" title="User location" centered @ok="store.showLocation = false">
        <div class="md:min-h-[320px] min-h-[240px]">
            <div v-if="store.showLocation">
                <div ref="mapContainer" class="w-full md:h-[320px] h-[240px] overflow-hidden"></div>
            </div>
            <ul>
                <li v-show="key != 'geo'" v-for="(value, key) in store.address" :key="key">
                    <strong class="capitalize">{{ key }}</strong>: {{ value }}
                </li>
            </ul>
        </div>
    </a-modal>
</template>

<script setup>
import { useApiRequest } from "~/composables";

const apiRequest = useApiRequest();
const runtime = useRuntimeConfig();
const router = useRouter();
const api_key = runtime.public.yandex_api_key;
const mapContainer = ref();
const map = ref();
const marker = ref();

const pageSizeList = [
    {
        value: 5,
        label: 5,
    },
    {
        value: 10,
        label: 10,
    },
    {
        value: 15,
        label: 15,
    },
    {
        value: 20,
        label: 20,
    },
]

const store = reactive({
    users: [],
    users_data: [],
    address: {},
    isLoading: true,
    showLocation: false,
    pageSize: 10,
    current: 1,
});

function showUserData(e, id) {
    if (!e.target.className.includes('noclick')) {
        router.push(`/user/${id}`);
    }
}

async function getUsers() {
    try {
        const data = await apiRequest.get('users');
        store.users = data.data;
        store.users_data = data.data;
        store.isLoading = false;
    } catch (error) {
        console.log(error)
    }
}

function filterUsers(e) {
    store.users = store.users_data;
    const input = e.target.value.toLowerCase();
    store.current = 1;
    store.users = store.users.filter(user => {
        return user.name.toLowerCase().includes(input);
    });
}

function showLocation(address) {
    store.address = address;
    let lat = address?.geo?.lat;
    let lng = address?.geo?.lng;
    store.showLocation = true;
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
    getUsers();
})
</script>

<style scoped></style>