// React File Upload Hook v1.0
// https://github.com/JulianStoev/ReactFileUploadHook


import { useCallback, useEffect, useState } from "react";

export function useUpload() {

  const [files, setFiles] = useState([]);
  const [data, setData] = useState({});
  const [event, setEvent] = useState(null);

  const file = {
    remove: (index, callback = null) => {
      if (files[index]) {
        setFiles(oldState => ([...oldState.filter((file, i) => i !== index)]));
      }
      if (callback) {
        callback();
      }
    },
    removeAll: () => setFiles([]),
    count: () => files.length,
    addData: (data, callback = null) => {
      if (!files[0]) {
        return;
      }
      files.forEach(file => Object.keys(data).forEach(key => file.append(key, data[key])));
      if (callback) {
        callback();
      }
    }
  };

  const onFile = (event) => {
    const _files = Array.from(event.target.files);
    if (!_files[0]) return;
    setEvent(event);
    const filesToAdd = [];
    _files.forEach(_file => {
      const filesize = _file.size;    
      if (!data.chunkSize || data.chunkSize >= filesize) {
        const formData = new FormData();
        if (data.id) {
          formData.append('id', data.id.toString());
        }
        formData.append('image', _file, _file.name);
        filesToAdd.push(formData);
      } else {
        const count = Math.ceil(filesize / data.chunkSize);
        let start = 0;
        let end = Math.ceil(filesize / count);
        for (let i = 1; i <= count; i++) {
          const chunk = new FormData();
          if (data.id) {
            chunk.append('id', data.id.toString());
          }
          chunk.append('chunked', '1');
          chunk.append('parts', count.toString());
          chunk.append('part', i.toString());
          chunk.append('chunk_' + i, _file.slice(start, end), 'chunk_' + i);
          start = end;
          end += Math.ceil(filesize / count);
          if (filesize < end) {
            end = filesize;
          }
          filesToAdd.push(chunk);
        }
      }
    });
    setFiles(oldState => ([...oldState, ...filesToAdd]));
  };

  const uploadInit = useCallback(_data => setData(_data), []);

  const XHRUpload = useCallback((file, callback) => {
    const xhr = new XMLHttpRequest();
  
    if (data.progress) xhr.upload.onprogress = e => e.lengthComputable ? data.progress(Math.round((e.loaded / e.total) * 100)) : 0;
  
    if (data.error) xhr.upload.onerror = e => data.error(e);
  
    if (data.start) xhr.onloadstart = e => data.start(e);
  
    if (data.abort) xhr.upload.onabort = e => data.abort(e);
  
    xhr.onload = e => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let json;
        try {
          json = JSON.parse(xhr.responseText);
        } catch (e) {
          json = { success: 0, message: xhr.responseText };
        }
        callback(json);
        return;
      }
      if (typeof data.error == 'function') {
        data.error(e);
      }
    };
  
    xhr.open('POST', data.url);
    // add your authentication headers here
    if (data.headers) {
      Object.keys(data.headers).forEach(key => xhr.setRequestHeader(key, data.headers[key]));
    }
    xhr.send(file);
  }, [data]);

  const upload = useCallback(() => {
    const callback = json => {
      if (!json) {
        alert('There was no response from the server');
        return;
      }
      if (json.success === 0) {
        console.error('[Upload error]: ' + json.message);
        return;
      }
      if (data.done) {
        data.done(json);
      }
      images.splice(0, 1);
      if (!images[0]) {
        event.target.value = null;
        setEvent(null);
        return;
      }
      upload();
    }
    const images = files; // avoid the setstate async
    if (!images[0]) return;
    XHRUpload(images[0], callback);
  }, [files]);

  // if instant upload is selected upload when there are files
  useEffect(() => {
    if (data.instantUpload) {
      upload();
    }
  }, [files]);

  return {
    uploadInit,
    file,
    onFile,
    upload
  }

}
