# Vuetify Upload
A Vuetify multi file upload with deletions and file previews.

Install the app in your main.js
    
    import VuetifyUpload from '@kingscode/vuetify-upload';
    Vue.use(VuetifyUpload);

Just add the component on the place you need it to be

    <vuetify-upload v-model="files"></vuetify-upload>
    
Or
    
    <vuetify-upload
        label="Images for the slideshow"
        :max="4"
        can-delete
        accept="image/*"
        :rules="imageRules"
        v-model="images"></vuetify-upload>
    
And now your files contains an object with all the files that you'll need to add or delete
With:

- `file` which contains the file itself.
- `isDeleted`: a boolean if the file must be deleted.
- `isNewFile`: a boolean if the file is new and must be uploaded.
- `preview`: a base64 or  preview url to thee file
- And all other attributes you added yourself to the `v-model` for your own logic

props:
- `max`: maximum number of uploadable items. (default: 0 which is unlimited)
- `value`: The value/v-model
- `accept`: Just like the html accept
- `previewClass`: the class on the previews (default `xs3`)
- `canDelete`: a boolean which shows/hides the delete buttons

Also you can use the basic vuetify props like `:rules` and `label`
