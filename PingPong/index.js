module.exports = function (context, req) {
    var callbackSecret = getEnvironmentVariable("KokoroIoCallbackSecret");
    var accessToken = getEnvironmentVariable("KokoroIoAccessToken");
    var baseUrl = getEnvironmentVariable("KokoroIoBaseUrl");
    var authorization = req.headers["authorization"];

    context.done();

    if(!callbackSecret)
        return context.log("Please configure KokoroIoCallbackSecret.");

    if(!authorization)
        return context.log("Please pass an Authorization HTTP request header.");

    if(authorization != callbackSecret)
        return context.log("Invalid Authorization HTTP request header.");

    var data = JSON.parse(req.body);
    var roomId = data.room.id;
    var message = data.raw_content;
    var userScreenName = data.profile.screen_name;

    if(!message)
        return context.log("Invalid MessageEntity data structore.");

    if(message != "ping")
        return;

    var responseMessage = `@${ userScreenName } pong`;
    var url = `${ baseUrl }api/v1/bot/rooms/${ roomId }/messages`;
    request(url, (error, response, body) => {
        if(error) return context.log("Invalid Authorization HTTP request header.");
    });
};

function getEnvironmentVariable(name) {
    return process.env[name];
}
