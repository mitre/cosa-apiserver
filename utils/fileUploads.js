var fs = require('fs');
var config = require('./../config');

if (config.clamAV.active) {
  const clamd = require('clamdjs')
  const scanner = clamd.createScanner(config.clamAV.host, config.clamAV.port)
  console.log("ClamAV: " + config.clamAV.host);
  console.log("ClamAV Port: " + config.clamAV.port);
}

function storeFile(dbConn, workitemId, fileName, fileData) {
  let update_sql = 'UPDATE evidence_file SET DATA = ? WHERE FK_WORKITEM_RESULT_ID = ? AND NAME = ?;';
  let insert_sql = 'INSERT INTO evidence_file (FK_WORKITEM_RESULT_ID, NAME, DATA) VALUES (?,?,?);';
  dbConn.query(update_sql, [fileData, workitemId, fileName], function (err, result) {
    if (err) {
      console.log('Error storing file (' + fileName + "): " + err);
      return err;
    } else {
      if (result.affectedRows == 0) {
        dbConn.query(insert_sql, [workitemId, fileName, fileData], function (err, result) {
          if (err) {
            console.log('Error storing file (' + fileName + "): " + err);
            return err;
          } else {
            console.log('Successfully stored file: ' + fileName);
            return "success";
          }
        });
      } else {
        console.log('Successfully stored file: ' + fileName);
        return "success";
      }
    }
  });
}

module.exports = {
  scanAndStoreFile: function (dbConn, workitemId, f) {
    fs.readFile(f.path, function (err, data) {
      if (config.clamAV.active) {
        scanner.scanBuffer(data, 3000, 1024 * 1024)
          .then(function (reply) {
            console.log("Scan result: " + reply)
            if (reply.includes("stream: OK")) {
              console.log("Storing file: " + f.name);
              return storeFile(dbConn, workitemId, f.name, data);
            } else {
              console.log("File fails virus scan: " + f.name);
              return "ERROR";
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      } else {
        console.log("Storing file: " + f.name);
        return storeFile(dbConn, workitemId, f.name, data);

      }
    });
  }
}