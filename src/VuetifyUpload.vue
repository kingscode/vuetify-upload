<template>
    <div @dragover.prevent @drop.prevent="handleDrop" id="drop-area">
        <label class="v-label">{{this.label}}</label>
        <form ref="form">
            <input :accept="accept" :multiple="max !== 1" @change="handleInput" ref="upload" type="file">
            <v-row>
                <v-col :class="previewClass"
                        class="preview"
                        v-for="(file, index) in files"
                        v-if="typeof file.isDeleted !== undefined && file.isDeleted !== true">
                    <v-badge color="error" left v-if="canDelete">

                        <v-icon @click="deleteFile(index)" slot="badge" color="white">$vuetify.icons.delete</v-icon>
                    </v-badge>
                    <v-img :src="file.preview"
                           height="150px"
                           v-if="file.preview !== null"></v-img>
                    <div v-else>
                        <v-icon class="my-6" size="40">{{ fileTypeToIcon(file.type)}}</v-icon>
                        <span class="file-name" v-if="typeof file.name !== 'undefined' && file.name !== null">{{file.name}}</span>
                    </div>
                </v-col>
                <v-col :class="previewClass" class="uploadWrapper" v-if="canUploadNewFile">
                    <div class="border">
                        <v-btn
                            :color="this.color"
                            @click="$refs.upload.click()"
                            dark
                            fab
                            small
                        >
                            <v-icon>$vuetify.icons.file</v-icon>
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
            <v-row class="error-container">
                <transition-group name="scroll-y-transition">
                    <v-col :key="error" v-for="error in this.errorBucket">
                        <span class="error--text">{{error}}</span>
                    </v-col>
                </transition-group>
            </v-row>
        </form>
    </div>
</template>

<script>
import * as EXIF from 'exif-js';
import VInput from 'vuetify/lib/components/VInput/VInput.js';

export default {
    name: 'vuetify-upload',
    extends: VInput,
    data() {
        return {
            files: [],
        };
    },
    computed: {
        canUploadNewFile() {
            return this.activeFiles.length < this.max;
        },
        /**
         * Files that need to be uploaded and files that are already uploaded and don't have the isDeleted prop
         * the isDeleted prop is for files that are awaited deletion
         */
        activeFiles() {
            return this.files.filter(file => !file.isDeleted);
        }
    },
    props: {
        max: {
            default: 0,
            type: Number,
        },
        value: {
            type: Array,
            default: () => {
                return [];
            },
        },
        accept: {
            default: '',
            type: String,
        },
        previewClass: {
            default: 'col-3',
            type: String,
        },
        canDelete: {
            default: false,
            type: Boolean,
        },
        color: {
            default: 'primary',
            type: String,
        },
    },
    watch: {
        value() {
            this.files = this.value ? this.value : [];
        },
    },
    created() {
        this.files = this.value ? this.value : [];
    },
    methods: {
        handleDrop(e) {
            if (this.canUploadNewFile) {
                let files = e.dataTransfer.files;
                this.addFiles(files);
            }
        },
        handleInput(e) {
            if (this.canUploadNewFile) {
                let files = e.target.files;
                this.addFiles(files);
            }
        },
        addFiles(files) {
            let remaining = this.max - this.activeFiles.length;
            if (files.length > 0) {
                let fileList = [...files];
                let promises = [];

                fileList.forEach((file) => {
                    if (remaining > 0) {
                        promises.push(this.filePreview(file));
                        remaining--;
                    }
                });
                Promise.all(promises).then((files) => {
                    this.files.push(...files);
                    this.$refs.form.reset();
                    this.$emit('input', this.files);
                });

            }
        },
        filePreview(file) {
            const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
            return new Promise((resolve) => {
                if (validImageTypes.includes(file.type)) {
                    //this reader is for creating the base64
                    let reader = new FileReader();
                    reader.onload = () => {
                        // this reader is for getting the exif data, in the exif data we'll find the orientation
                        let exifReader = new FileReader();
                        exifReader.onload = () => {
                            let exif = EXIF.readFromBinaryFile(exifReader.result);
                            let rotation = {
                                3: 180,
                                6: 90,
                                8: 270,
                            };
                            if (rotation[exif.Orientation]) {
                                this.rotateBase64Image(reader.result, rotation[exif.Orientation], (image) => {
                                    resolve({
                                        preview: image,
                                        isDeleted: false,
                                        isNewFile: true,
                                        file: file,
                                    });
                                });
                            } else {
                                resolve({
                                    preview: reader.result,
                                    isDeleted: false,
                                    isNewFile: true,
                                    file: file,
                                });

                            }
                        };
                        exifReader.readAsArrayBuffer(file);

                    };
                    reader.readAsDataURL(file);

                } else {
                    resolve({
                        preview: null,
                        type: file.type,
                        name: file.name,
                        isDeleted: false,
                        isNewFile: true,
                        file: file,
                    });
                }
            });
        },
        rotateBase64Image(base64data, degrees, callback) {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');

            let image = new Image();
            image.src = base64data;
            image.onload = function () {
                let w = image.width;
                let h = image.height;
                let rads = degrees * Math.PI / 180;
                let c = Math.cos(rads);
                let s = Math.sin(rads);
                if (s < 0) {
                    s = -s;
                }
                if (c < 0) {
                    c = -c;
                }
                //use translated width and height for new canvas
                canvas.width = h * s + w * c;
                canvas.height = h * c + w * s;
                context.translate(canvas.width / 2, canvas.height / 2);
                context.rotate(degrees * Math.PI / 180);
                context.drawImage(image, -image.width / 2, -image.height / 2);
                callback(canvas.toDataURL());
            };

        },
        fileTypeToIcon(type) {
            let icon;
            switch (type) {
                case 'image/gif':
                case 'image/jpeg':
                case 'image/png':
                    icon = '$vuetify.icons.fileImage';
                case 'application/msword':
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    icon = '$vuetify.icons.fileWord';
                case 'video/mp4':
                case 'video/x-flv':
                case 'video/MP2T':
                case 'video/3gpp':
                case 'video/quicktime':
                case 'video/x-msvideo':
                case 'video/x-ms-wmv':

                    icon = '$vuetify.icons.fileVideo';
            }
            if (icon) {
                console.log('aaa', icon);
                return icon;
            }
            return '$vuetify.icons.file';
        },
        deleteFile(fileIndex) {
            if (this.files[fileIndex].isNewFile) {
                this.files.splice(fileIndex, 1);
                return;
            }
            this.$set(this.files[fileIndex], 'isDeleted', true);
            this.$emit('input', this.files);
            this.$emit('fileDeleted', this.files[fileIndex]);
        },
    },
};
</script>

<style lang="scss" scoped>
input {
    display: none;
}

.uploadWrapper {
    height: 175px;
    text-align: center;

    .border {
        border: dashed 2px #cccccc;
        height: 100%;
        width: 100%;
    }

    button {
        margin-top: 45px;
    }
}

.preview {
    position: relative;
    min-height: 150px;
    text-align: center;

    .v-badge {
        position: absolute;
        right: 0;
        z-index: 1;
        cursor: pointer;
    }

    .file-name {
        display: inline-block;
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
}

.error-container {
    min-height: 25px;
}
</style>
