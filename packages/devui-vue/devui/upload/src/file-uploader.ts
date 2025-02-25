import { IUploadOptions, UploadStatus } from './upload-types';

export class FileUploader {
  private xhr: XMLHttpRequest;
  public status: UploadStatus;
  public response: any;
  public percentage = 0;

  constructor(public file: File, public uploadOptions: IUploadOptions) {
    this.file = file;
    this.uploadOptions = uploadOptions;
    this.status = UploadStatus.preLoad;
  }

  send(uploadFiles?: FileUploader[]): Promise<{ file: File; response: any }> {
    return new Promise((resolve, reject) => {
      const { uri, method, headers, authToken, authTokenHeader, additionalParameter, fileFieldName, withCredentials, responseType } =
        this.uploadOptions;
      const authTokenHeader_ = authTokenHeader || 'Authorization';
      const fileFieldName_ = fileFieldName || 'file';

      this.xhr = new XMLHttpRequest();
      this.xhr.open(method || 'POST', uri);

      if (withCredentials) {
        this.xhr.withCredentials = withCredentials;
      }

      if (responseType) {
        this.xhr.responseType = responseType;
      }

      if (authToken) {
        this.xhr.setRequestHeader(authTokenHeader_, authToken);
      }

      if (headers) {
        Object.keys(headers).forEach((key) => {
          this.xhr.setRequestHeader(key, headers[key]);
        });
      }

      this.xhr.upload.onprogress = (e) => {
        this.percentage = Math.round((e.loaded * 100) / e.total);
      };

      const formData =
        uploadFiles && uploadFiles.length
          ? this.oneTimeUploadFiles(fileFieldName_, additionalParameter, uploadFiles)
          : this.parallelUploadFiles(fileFieldName_, additionalParameter);

      this.xhr.send(formData);
      this.status = UploadStatus.uploading;

      this.xhr.onabort = () => {
        this.status = UploadStatus.preLoad;
        this.xhr = null;
      };

      this.xhr.onerror = () => {
        this.response = this.xhr.response;
        this.status = UploadStatus.failed;
        reject({ file: this.file, response: this.xhr.response });
      };

      this.xhr.onload = () => {
        if (this.xhr.readyState === 4 && this.xhr.status >= 200 && this.xhr.status < 300) {
          this.response = this.xhr.response;
          this.status = UploadStatus.uploaded;
          resolve({ file: this.file, response: this.xhr.response });
        } else {
          this.response = this.xhr.response;
          this.status = UploadStatus.failed;
          reject({ file: this.file, response: this.xhr.response });
        }
      };
    });
  }

  parallelUploadFiles(fileFieldName_: string, additionalParameter: Record<string, any>): FormData {
    const formData = new FormData();
    formData.append(fileFieldName_, this.file, this.file.name);
    if (additionalParameter) {
      Object.keys(additionalParameter).forEach((key: string) => {
        formData.append(key, additionalParameter[key]);
      });
    }
    return formData;
  }

  oneTimeUploadFiles(fileFieldName_: string, additionalParameter: Record<string, any>, uploadFiles: FileUploader[]): FormData {
    const formData = new FormData();
    uploadFiles.forEach((element) => {
      formData.append(fileFieldName_, element.file, element.file.name);
      if (additionalParameter) {
        Object.keys(additionalParameter).forEach((key: string) => {
          formData.append(key, additionalParameter[key]);
        });
      }
    });
    return formData;
  }

  cancel(): void {
    if (this.xhr) {
      this.xhr.abort();
    }
  }
}
