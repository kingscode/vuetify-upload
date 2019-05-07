import VuetifyUploadComponent from './VuetifyUpload.vue';

const VuetifyUpload = {
    install(Vue, options) {
        Vue.component('vuetify-upload', VuetifyUploadComponent);

    },
};

export default VuetifyUpload;