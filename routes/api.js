var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fileUploads = require('./../utils/fileUploads');

router.get('/AutomatedTestsBySystem', function (req, res) {
  console.log(JSON.stringify(req.body, null, 2))
  let stage = req.body.stage;
  let systemName = req.body.systemName;

  let runtimeCheck = false;
  if (stage == null || stage.length == 0) {
    console.log("AutomatedTestsBySystem: error, stage not specified");
    res.status(400).send({
      result: false,
      msg: "Stage not specified"
    });
    return;
  } else if (stage.toLowerCase() == 'runtime') {
    runtimeCheck = true;
  } else if (stage.toLowerCase() != 'build') {
    console.log("AutomatedTestsBySystem: error, stage not specified");
    res.status(400).send({
      result: false,
      msg: "Unknown Stage value"
    });
    return;
  }

  if (systemName == null || systemName.length == 0) {
    console.log("AutomatedTestsBySystem: error, systemName not specified");
    res.status(400).send({
      result: false,
      msg: "systemName not specified"
    });
    return;
  }
  console.log("SystemName: %s Stage: %s", systemName, stage)

  const sqlSystemId = `SELECT PK_SYSTEM_ID From system WHERE NAME = ? LIMIT 1;`;
  req.mysql.query(sqlSystemId, systemName, function (error1, result1) {
    if (error1 || result1.length == 0) {
      console.log("MySQL Error or No System", error1)
      res.status(400).send({
        result: false,
        msg: "No Automated Tests for specified system: " + systemName
      });
    } else {
      let systemId = result1[0].PK_SYSTEM_ID;
      const sqlAutomatedTests = `SELECT R.PK_SYSTEM_CONTROL_TEST_ID, R.AUTO_EVIDENCE, T.COMMAND_TO_EXECUTE, R.CONTROL_ITEM, T.NAME, w1.PK_WORK_ITEM_RESULT_ID AS WORK_ITEM_RESULT_ID
      FROM system_control_test R
      INNER JOIN system_control_test_procedure_types_default T ON  R.FK_PROCEDURE_TYPE_ID = T.PK_SYSTEM_CONTROL_TEST_PROCEDURE_TYPE_ID
      INNER JOIN work_item_result w1 ON  R.PK_SYSTEM_CONTROL_TEST_ID = w1.FK_SYSTEM_CONTROL_TEST_ID
      WHERE R.FK_SYSTEM_ID = ? AND R.APPLICABLE = TRUE AND R.PK_SYSTEM_CONTROL_TEST_ID NOT IN
        (SELECT w2.FK_SYSTEM_CONTROL_TEST_ID
            FROM work_item_result w2
            INNER JOIN system_control_test r2 ON r2.PK_SYSTEM_CONTROL_TEST_ID = w2.FK_SYSTEM_CONTROL_TEST_ID
            WHERE r2.FK_SYSTEM_ID = ? AND w2.FK_WORK_ITEM_STATUS_ID = 4
        ) AND R.RUNTIME_CHECK = ? AND T.NAME != 'manual';`;

      req.mysql.query(sqlAutomatedTests, [systemId, systemId, runtimeCheck], function (error2, results_2) {
        if (error2) {
          console.log("AutomatedTestsBySystem: mysql error", error2)
          res.status(500).send({
            result: false,
            msg: "Internal Server Error"
          });
        } else {
          res.status(200).send(results_2);
        }

      });

    }
  });
});

router.post('/UpdateFindingsByRuleId', function (req, res, next) {

  let finding = req.body.finding;
  let rule_id = req.body.rule_id;
  console.log(finding)
  console.log(rule_id)

  const all_fields = [
    'FK_SYSTEM_CONTROL_TEST_ID',
    'FK_WORK_ITEM_STATUS_ID',
    'RESULT_DESC',
    'UPDATED_BY', // make sure you set this to 'system'
    'FORWARD_TO_ROLE_ID',
    'REPEAT_FINDING',
    'FK_CONTROL_WEAKNESS_TYPE_ID',
    'FK_LIKELIHOOD_ID',
    'FINDING_DESCRIPTION',
    'WEAKNESS_DESCRIPTION',
    'RECOMMENDED_CORRECTIVE_ACTIONS',
    'FK_IMPACT_ID'
  ];

  const fields = all_fields.filter(f => typeof finding[f.toUpperCase()] != 'undefined');

  let set_string = fields.map(f => `${f.toUpperCase()} = ?`).join(', ');
  let value_list = fields.map(f => finding[f.toUpperCase()]);
  if (value_list.length >= 1) set_string += ',';
  value_list.push(rule_id); // last item.

  let updateQuery = `UPDATE work_item_result SET ${set_string} MODIFIED_DATE = current_timestamp() WHERE FK_SYSTEM_CONTROL_TEST_ID = ?`.replace(/\s\s+/g, ' ');
  console.log(updateQuery)
  console.log(value_list)
  console.log('');
  req.mysql.query(updateQuery, value_list, function (err, results) {
    if (err) {
      console.log("AutomatedTestsBySystem: mysql error")
      res.status(500).send({
        result: false,
        msg: "Internal Server Error"
      });
    } else {
      res.status(200).send({
        "message": results.affectedRows + " record updated"
      });
    }

  });

});




router.post('/uploadEvidenceFiles', function (req, res) {

  var formidable = require('formidable');
  var form = new formidable.IncomingForm();

  form.keepExtensions = true;
  form.maxFieldsSize = 10 * 1024 * 1024;
  form.maxFields = 1000;
  form.multiples = true;

  
  form.parse(req, function (err, fields, files) {
    try{
    if (err) {
      res.writeHead(200, {
        'content-type': 'text/plain'
      });
      res.write('An error occurred trying to store the evidence files.');
    } else {
      var workitemId = fields.workitemId;
      console.log("wid:",workitemId)
      if (files['files[]']) {
        if (files['files[]'].length > 0) {
          for (var i = 0; i < files['files[]'].length; i++) {
            fileUploads.scanAndStoreFile(req.mysql, workitemId, files["files[]"][i]);
          }
        } else {
          fileUploads.scanAndStoreFile(req.mysql, workitemId, files['files[]']);
        }
      }
    }
  }catch (ex) {
    console.log("something bad", ex)
  }  
  }).on('end', function () {
    res.end('success');
  });

});






module.exports = router;
