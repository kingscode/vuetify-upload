# vuetify-upload
a vuetify multi file upload with deletions and file previews

Install the app in your main.js
    
    import VuetifyUpload from '@kingscode/vuetify-upload';
    Vue.use(VuetifyUpload);

Just add the component on the place you need it to be

    <vuetify-upload v-model="files"></vuetify-upload>
    
And now your files contains an object with all the files that you'll need to add or delete
With:

- file which contains the file itself
- isDeleted: a boolean if the file must be deleted
- isNewFile: a boolean if the file is new and must be uploaded
- And all other attributes you added yourself to the `v-mdodel`


props:
- `max` number (max count of uploadable items)