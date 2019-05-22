<template>
    <div id="drop-area" @drop.prevent="handleDrop" @dragover.prevent>
        <form ref="form">
            <input ref="upload" :accept="accept" type="file" :multiple="max !== 1" @change="handleInput">
            <v-layout row wrap>
                <v-flex xs3
                        pa-1
                        v-for="(file, index) in files"
                        class="preview"
                        v-if="typeof file.isDeleted !== undefined && file.isDeleted !== true">
                    <v-badge left color="red">
                        <div slot="badge" @click="deleteFile(index)">
                            <v-icon color="white">fa-trash</v-icon>
                        </div>
                    </v-badge>
                    <v-img :src="file.preview" height="150px"></v-img>
                </v-flex>
                <v-flex xs3 pa-1 class="uploadWrapper" v-if="this.files.length < this.max">
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
        props: {
            max: {
                default: 0,
                type: Number,
            },
            value: {
                default: () => {
                    return [];
                },
                type: Array,
            },
            accept: {
                default: '',
                type: String
            }
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
                if (this.files.length < this.max) {
                    let files = e.dataTransfer.files;
                    this.handleFiles(files);
                }
            },
            handleInput(e) {
                if (this.files.length < this.max) {
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
                return new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.onload = () => {
                        resolve({preview: reader.result, isDeleted: false, isNewFile: true, file: file});
                    };
                    reader.readAsDataURL(file);
                });
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

        .v-badge {
            position: absolute;
            right: 0;
            z-index: 1;
            cursor: pointer;
        }
    }
</style>