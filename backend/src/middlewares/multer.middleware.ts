import multer from 'multer'

const storage = multer.memoryStorage()      // disk storage for local folder memory for uploading 

const uploadFile = multer({storage})

export default uploadFile;