#r "Newtonsoft.Json"
#r "System.IO"
#r "System.Runtime.Extensions"
#r "System.Private.Uri"
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;

public static async Task<IActionResult> Run(HttpRequest req, TraceWriter log)
{
    var callbackSecret = Environment.GetEnvironmentVariable("KokoroIoCallbackSecret");
    var accessToken = Environment.GetEnvironmentVariable("KokoroIoAccessToken");
    var baseUrl = Environment.GetEnvironmentVariable("KokoroIoBaseUrl");
    var authorization = req.Headers["Authorization"];

    if(string.IsNullOrEmpty(callbackSecret))
        return new BadRequestObjectResult("Please configure KokoroIoCallbackSecret.");
    if(string.IsNullOrEmpty(authorization))
        return new BadRequestObjectResult("Please pass an Authorization HTTP request header.");
    if(authorization != callbackSecret)
        return new BadRequestObjectResult("Invalid Authorization HTTP request header.");

    // Parse request body
    var serializer = new JsonSerializer();
    var body = await (new StreamReader(req.Body)).ReadToEndAsync();
    dynamic data = JObject.Parse(body);
    string roomId = data.room.id;
    string message = data.raw_content;
    string userScreenName = data.profile.screen_name;

    if(string.IsNullOrEmpty(message))
        return new BadRequestObjectResult("Invalid MessageEntity data structore.");
    if(message != "ping")
        return new OkResult();

    // Make request for kokoro.io
    using(var client = new HttpClient())
    {
        client.BaseAddress = new Uri(baseUrl);
        client.DefaultRequestHeaders.Add("X-Access-Token", accessToken);
        var content = new FormUrlEncodedContent(new[] {
                new KeyValuePair<string, string>("message", $"@{ userScreenName } pong")
            });
        var result = await client.PostAsync($"/api/v1/bot/rooms/{ roomId }/messages", content);
        string resultContent = await result.Content.ReadAsStringAsync();
    }

    // Result
    return new OkResult();
}
