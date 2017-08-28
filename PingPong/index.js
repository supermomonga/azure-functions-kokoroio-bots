var request = require('request');

module.exports = function (context, req) {
    var callbackSecret = getEnvironmentVariable("KokoroIoCallbackSecret");
    var accessToken = getEnvironmentVariable("KokoroIoAccessToken");
    var baseUrl = getEnvironmentVariable("KokoroIoBaseUrl");
    var authorization = req.headers["authorization"];

    context.done();

    if(!callbackSecret) {
        context.log("Please configure KokoroIoCallbackSecret.");
        context.res = { status: 401, body: "Please configure KokoroIoCallbackSecret." };
        return context.done();
    }

    if(!authorization) {
        context.log("Please pass an Authorization HTTP request header.");
        context.res = { status: 401, body: "Please pass an Authorization HTTP request header." };
        return context.done();
    }

    if(authorization != callbackSecret) {
        context.log("Invalid Authorization HTTP request header.");
        context.res = { status: 401, body: "Invalid Authorization HTTP request header." };
        return context.done();
    }

    var data = req.body;
    var roomId = data.room.id;
    var message = data.raw_content;
    var userScreenName = data.profile.screen_name;

    if(!message) {
        context.log("Invalid MessageEntity data structore.");
        context.res = { status: 401, body: "Invalid MessageEntity data structore." };
        return context.done();
    }

    if(message != "ping") {
        context.res = { status: 200, body: "Not a ping." };
        return;
    }

    var responseMessage = `@${ userScreenName } pong`;
    var url = `${ baseUrl }api/v1/bot/rooms/${ roomId }/messages`;
    request(url, (error, response, body) => {
        if(error) {
            context.log("Invalid Authorization HTTP request header.");
            context.res = { status: 401, body: "Invalid Authorization HTTP request header." };
        }
    });
    return context.done();
};

function getEnvironmentVariable(name) {
    return process.env[name];
}
