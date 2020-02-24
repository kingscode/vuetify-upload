<template>
    <v-app>
        <v-container fluid fill-height>
            <vuetify-upload
                label="Images for the slideshow"
                :max="4"
                can-delete
                accept="image/*"
                color="accent"
            ></vuetify-upload>
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
