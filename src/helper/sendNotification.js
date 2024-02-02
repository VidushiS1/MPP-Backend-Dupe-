var FCM = require('fcm-node');
var serverKey = process.env.FCM_SERVER_KEY;
var fcm = new FCM(serverKey);


module.exports.sendNotification = async (token, title, body, data) => {
    try {
        const message = {
            to: token,
            notification: {
                title: title,
                body: body,
            },
            data: data,
        };
        return new Promise((resolve, reject) => {
            fcm.send(message, (err, response) => {
                if (err) {
                    console.error("Error sending FCM notification:", err);
                    reject(err);
                } else {
                    if (response.failure > 0) {
                        const errorResult = response.results[0];
                        console.error(`Error sending FCM notification: ${JSON.stringify(errorResult)}`);
                        reject(new Error(errorResult.error));
                    } else {
                        console.log("Successfully sent FCM notification with response:", response);
                        resolve(response);
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error in sendNotification:', error);
        throw error;
    }
};