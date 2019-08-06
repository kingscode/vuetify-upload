<template>
    <div id="drop-area" @drop.prevent="handleDrop" @dragover.prevent>
        <form ref="form">
            <input ref="upload" :accept="accept" type="file" :multiple="max !== 1" @change="handleInput">
            <v-layout row wrap>
                <v-flex :class="previewClass"
                        pa-1
                        v-for="(file, index) in files"
                        class="preview"
                        v-if="typeof file.isDeleted !== undefined && file.isDeleted !== true">
                    <v-badge v-if="canDelete" left color="red">
                        <div slot="badge" @click="deleteFile(index)">
                            <v-icon color="white">fa-trash</v-icon>
                        </div>
                    </v-badge>
                    <v-img v-if="file.preview !== null"
                           :src="file.preview"
                           height="150px"></v-img>
                    <v-flex v-else>
                        <v-icon style="margin-top:70px;">{{ fileTypeToIcon(file.type)}}</v-icon>
                        <span class="file-name" v-if="typeof file.name !== 'undefined' && file.name !== null">{{file.name}}</span>
                    </v-flex>
                </v-flex>
                <v-flex :class="previewClass" pa-1 class="uploadWrapper" v-if="canUploadNewFile">
                    <div class="border">
                        <v-btn
                            @click="$refs.upload.click()"
                            color="accent"
                            dark
                            small
                            fab
                        >
                            <v-icon>fa-upload</v-icon>
                        </v-btn>
                    </div>
                </v-flex>
            </v-layout>

        </form>
    </div>
</template>

<script>
    import * as EXIF from 'exif-js';

    export default {
        name: 'vuetify-upload',
        data() {
            return {
                files: [],
            };
        },
        computed: {
            canUploadNewFile() {
                let count = 0;
                this.files.forEach((file) => {
                    if (typeof file.isDeleted === 'undefined' || file.isDeleted === false) {
                        count++;
                    }
                });
                return count < this.max;
            },
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
                default: 'xs3',
                type: String,
            },
            canDelete: {
                default: false,
                type: Boolean,
            },
        },
        watch: {
            value() {
                this.files = this.value;
            },
        },
        created() {
            this.files = this.value;
        },
        methods: {
            handleDrop(e) {
                if (this.canUploadNewFile) {
                    let files = e.dataTransfer.files;
                    this.handleFiles(files);
                }
            },
            handleInput(e) {
                if (this.canUploadNewFile) {
                    let files = e.target.files;
                    this.handleFiles(files);
                }
            },
            handleFiles(files) {
                if (files.length > 0) {
                    let fileList = [...files];
                    let promises = [];

                    fileList.forEach((file) => {
                        promises.push(this.filePreview(file));
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
                switch (type) {
                    case 'image/gif':
                    case 'image/jpeg':
                    case 'image/png':
                        return this.$vuetify.icons.fileImage;
                    case 'application/msword':
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                        return this.$vuetify.icons.fileWord;
                    case 'video/mp4':
                    case 'video/x-flv':
                    case 'video/MP2T':
                    case 'video/3gpp':
                    case 'video/quicktime':
                    case 'video/x-msvideo':
                    case 'video/x-ms-wmv':
                        return this.$vuetify.icons.fileVideo;
                    default:
                        return this.$vuetify.icons.file;
                }
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

<style scoped lang="scss">
    input {
        display: none;
    }

    .uploadWrapper {
        height: 158px;
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
        border: solid 1px #cccccc;
        padding: 0;

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
</style>
