"use_strict";


function isCallable(func) {
  try {
    Reflect.apply(func, null, []);
    return true;
  } catch (error) {
    return false;
  }
}

function generateOfflineThreadingId() {
  const ret = Math.floor(Date.now());
  const value = Math.floor(Math.random() * 4294967296); // 2^32
  const binaryStr = value.toString(2).slice(-22);
  const msgs = (ret).toString(2) + binaryStr;

  return parseInt(msgs, 2).toString();
}

module.exports = function (defaultFuncs, api, ctx) {

  return function editMessage(messageID, text, callback) {
    if (!ctx.mqttClient) {
      throw new Error('Not connected to MQTT');
    }


    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    const taskPayload = {
      message_id: messageID,
      text: text,
    };

    const task = {
      failure_count: null,
      label: '742',
      payload: JSON.stringify(taskPayload),
      queue_name: 'edit_message',
      task_id: ctx.wsTaskNumber,
    };

    const content = {
      app_id: '2220391788200892',
      payload: {
        data_trace_id: null,
        epoch_id: parseInt(generateOfflineThreadingId()),
        tasks: [],
        version_id: '6903494529735864',
      },
      request_id: ctx.wsReqNumber,
      type: 3,
    };

    content.payload.tasks.push(task);
    content.payload = JSON.stringify(content.payload);

    if (isCallable(callback)) {
      ctx.reqCallbacks[ctx.wsReqNumber] = callback;
    }

    ctx.mqttClient.publish('/ls_req', JSON.stringify(content), { qos: 1, retain: false });
  };
}
