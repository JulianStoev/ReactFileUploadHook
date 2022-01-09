# ReactFileUploadHook
React file upload hook with **chunked support**.

## Sample usage
Let's assume you have added the service as uploadServ:

```
const { uploadInit, onFile } = useUpload();

const initUpload = useCallback(() => {
  uploadInit({
    url: '/addImage',
    chunkSize: 500000,
    instantUpload: true,
    id: 'temp_' + Math.floor(Math.random() * 1000),
    start: (e) => {
      // upload started
    },
    progress: (loaded) => {
      // percent loaded
    },
    abort: (e) => {
      // aborted
    },
    error: (e) => {
      // an error occured
    },
    done: (json) => {
      // everything is uploaded
    }
  });
}, []);

useEffect(() => initUpload(), []);
```

HTML
```
<input type="file" accept="image/jpeg, image/png" multiple onChange={onFile} />
```

Properties:
- **chunkSize**: if you want to have chunked upload specify the size in bytes, 500000 = 500kb
- **id**: a product ID for the backend in order to recognize the upload, **required**
- **instantUpload**: if true it will stsart uploading the moment something is added
- **url**: the url address to where the files should be uploaded, **required**
- **headers**: any custom headers you may wish to send with the request

Callbacks:
- **start**: it will fire once when the upload start
- **progress**: it will return number with the percentage done of the current file/chunk
- **abort**: the upload aborted
- **error**: on error
- **done**: when everything is uploaded

Methods:
- **upload()** - start the upload manually
- **file.addData(data, callback?)** - add data to all of the already stored files, like something for the backend to recognize // addData({id: 1}, () => upload())
- **file.remove(index)** - remove a file from the files array
- **file.removeAll()** - remove all stored files
- **file.count()** - it returns how many files there are currently stored for upload

## Backend
The stored files will be uploaded one by one, chunk by chunk in exact order. The data or id you may add to the files will be visible in the POST. 

POST data:
- **chunked: 1** - the upload is chunked
- **part: 1** - first part of chunked upload
- **parts: 4** - there are 4 chunked parts of this upload
- **id: 12** - product identification (every chunk will have the same data)
- **[data]** - any other data you have passed as an Object through the addData method (every chunk will have the same data)
