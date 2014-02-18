var http = require("http");
var jsdom = require("jsdom").jsdom;
global.Handlebars = require("handlebars");
global.$ = require('jquery/dist/jquery')(jsdom().createWindow());
require("./hb_helpers.js");
var App = require("./app.js").App;

var app = new App();
var server = http.createServer(function(request, response) {
    var htmlDump = "";
    response.writeHead(200, {
        "Content-Type": "text/html;charset=utf-8"
    });
    app.setConfigUrls(request.headers.host);

    app.decideRoute(request.url).then(function() {
        if (app.route.page == "error") {
            htmlDump = app.getErrorPage();
            response.write(htmlDump);
            response.end();
        } else {
            try {
                app.fetchDataAndTmpls().then(function(result) {
                    try {
                        app.setMainTmpl();
                        htmlDump += "<!DOCTYPE html >";
                        htmlDump += "<head>";
                        //Writing the meta info/header scripts.
                        htmlDump += app.getHeaderTags();
                        htmlDump += app.getStyleSheets();
                        htmlDump += "<script> window.onload = function(){";
                        //Main script to fetch and render sections.
                        //htmlDump+=app.getSectionsRenderSc();
                        //Other scripts for navigation/misc task.
                        htmlDump += app.getMiscScript();
                        htmlDump += app.callbackClientScript();
                        htmlDump += "};</script>";
                        htmlDump += "</head>";
                        htmlDump += "<body style='height:100%;'>";
                        //Toolbar template dump.
                        htmlDump += app.getToolbarHTML();
                        //Main container template dump.
                        htmlDump += app.getMainHTML();
                        //Sections template dump.
                        htmlDump += app.getSectionsHTML();
                        htmlDump += app.getScriptsToImport();
                        htmlDump += "</body>";
                        htmlDump += "</html>";
                    } catch (err) {
                        console.log(err);
                        htmlDump = app.getErrorPage();
                        app = new App();
                    }
                    response.write(htmlDump);
                    response.end();

                });
            } catch (er) {
                htmlDump = app.getErrorPage();
                response.write(htmlDump);
                response.end();
            }
        }
    });
    global.baseUrl = app.baseUrl;
    global.network_id = app.netid;
});
server.listen(8383);