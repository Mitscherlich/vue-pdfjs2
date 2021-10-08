<template>
  <div id="app" class="Example">
    <header>
      <h1>vue-pdf2 sample page</h1>
    </header>

    <div class="Example__container">
      <div class="Example__container__load">
        <label for="file">Load from file:</label>
        &nbsp;
        <input @change="onFileChange" type="file" />
      </div>
      <div class="Example__container__document">
        <Document :file="file" @loaded="onDocumentLoadSuccess" :options="options">
          <Page v-for="index in numPages" :key="`page_${index}`" :page-number="index" />
        </Document>
      </div>
    </div>
  </div>
</template>

<script>
import { Document, Page } from 'vue-pdfjs2/dist/esm/entry.parcel';
import 'vue-pdfjs2/dist/esm/Page/AnnotationLayer.css';
import pdfFile from './sample.pdf';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

export default {
  name: 'App',
  components: { Document, Page },
  data() {
    this.options = { ...options };
    return {
      file: pdfFile,
      numPages: 0,
    };
  },
  methods: {
    onFileChange(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (!files.length) {
        return;
      }
      this.file = files[0];
    },
    onDocumentLoadSuccess({ numPages }) {
      this.numPages = numPages;
    },
  },
};
</script>

<style lang="less">
.Example {
  input,
  button {
    font: inherit;
  }

  header {
    background-color: rgb(50, 54, 57);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    padding: 20px;
    color: white;

    h1 {
      font-size: inherit;
      margin: 0;
    }
  }

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px 0;
    padding: 10px;

    &__load {
      margin-top: 1em;
      color: white;
    }

    &__document {
      margin: 1em 0;

      .react-pdf {
        &__Document {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        &__Page {
          max-width: calc(~'100% - 2em');
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
          margin: 1em;

          canvas {
            max-width: 100%;
            height: auto !important;
          }
        }

        &__message {
          padding: 20px;
          color: white;
        }
      }
    }
  }
}
</style>
