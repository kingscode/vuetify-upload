<template>
    <v-app>
        <v-container>
            <VuetifyUpload
                label="Images for the slideshow"
                :max="4"
                can-delete
                accept="image/*"
                color="accent"
            />

            <v-form ref="form" v-model="valid" class="mt-5">
                <v-col cols="12" sm="10" offset-sm="1" md="8" offset-md="2" lg="6" offset-lg="3">
                    <v-subheader class="pa-0">Vuetify upload</v-subheader>
                    <v-card class="themed-color">
                        <v-card-text>
                            <vuetify-upload
                                label="Images for the slideshow"
                                :max="4"
                                can-delete
                                accept="image/*"
                                color="accent"
                            ></vuetify-upload>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-form>
        </v-container>
    </v-app>
</template>

<script>
export default {
    name: 'App',
};
</script>

<style scoped>

</style>
