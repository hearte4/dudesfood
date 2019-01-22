let mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({ name: String });
  FileSchema.virtual('chunks', {
    ref: 'Chunk',
    localField: '_id',
    foreignField: 'files_id'
  });

//  const File = mongoose.model('File', FileSchema, 'fs.files');

  const ChunkSchema = new mongoose.Schema({ files_id: mongoose.ObjectId, data: Buffer });
  const Chunk = mongoose.model('Chunk', ChunkSchema, 'uploads.chunks');


  const File = module.exports = mongoose.model('File', FileSchema, 'uploads.files');
