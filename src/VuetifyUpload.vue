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
                    <v-img v-if="file.preview !== null" :src="file.preview" height="150px"></v-img>
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
                    if(typeof file.isDeleted === 'undefined' || file.isDeleted === false) {
                        count ++;
                    }
                });
                return count < this.max;
            }
        },
        props: {
            max: {
                default: 0,
                type: Number,
            },
            value: {
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
                type: Boolean
            }
        },
        watch: {
            value() {
                if (Array.isArray(this.value)) {
                    this.files = this.value;
                    return;
                }
                this.files = [this.value];
            },
        },
        created() {
            if (Array.isArray(this.value)) {
                this.files = this.value;
                return;
            }
            this.files = [this.value];
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
                        if (this.max === 1) {
                            this.$emit('input', this.files[0]);
                        } else {
                            this.$emit('input', this.files);
                        }
                    });

                }
            },
            filePreview(file) {
                const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
                return new Promise((resolve) => {
                    if (validImageTypes.includes(file.type)) {
                        let reader = new FileReader();
                        reader.onload = () => {
                            resolve({preview: reader.result, isDeleted: false, isNewFile: true, file: file});
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