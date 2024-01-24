"use_strict";

var requestCounter = 1; // Initialize the counter

// Function to get the current epoch timestamp
function getCurrentEpochTimestamp() {
    return Math.floor(new Date().getTime() / 1000); // Convert milliseconds to seconds
};

module.exports = function (defaultFuncs, api, ctx) {
  const mqttClient = ctx.mqttClient;
  var currentRequestID = requestCounter++;

  return function editMessage(messageID, text, callback) {
    var resolveFunc = function () {};
    var rejectFunc = function () {};
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc();
      };
    }

    var payloadToSend = {
      "app_id": "2220391788200892",
      "payload": {
        "tasks": [
          {
            "label": "742",
            "payload": {
              "message_id": messageID,
              "text": text
            },
            "queue_name": "edit_message",
            "task_id": currentRequestID,
            "failure_count": null
          }
        ],
        "epoch_id": getCurrentEpochTimestamp(),
        "version_id": "7849679408382587"
      },
      "request_id": currentRequestID,
      "type": 3
    };

    mqttClient.publish('ls_req', JSON.stringify(payloadToSend), {
      qos: 1,
      retain: false,
    });

    returnPromise
      .then(function () {
        callback(); // Resolve the promise when the operation is successful
      })
      .catch(function (err) {
        callback(err); // Reject the promise if there's an error
      });
  };
};

