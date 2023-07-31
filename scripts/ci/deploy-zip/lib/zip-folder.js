const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

module.exports = function (directory, zipPath) {
  console.log('eee');
  return new Promise((resolve, reject) => {
    // create a file to stream archive data to.
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve();
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function () {
      console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        reject(err);
      }
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
      reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    const files = fs.readdirSync(directory);
    console.log('>>lib/zip-folder::', 'files', files); //TRACE
    files.forEach(file => {
      const filePath = path.join(directory, file);
      if (fs.lstatSync(filePath).isDirectory()) archive.directory(filePath, file);
      else archive.file(filePath, { name: file });
    });
    // append files from a sub-directory, putting its contents at the root of archive
    // archive.directory(directory, false);
    // archive.file('file1.txt');

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
  });
};
