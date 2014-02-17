var Deferred = require("promised-io/promise").Deferred;
var request = require('request');
var constants = require("./constants.js").constants;

var App = function() {
    this.data = {};
    this.mainTmpl = null;
    this.jsonurl = null;
    this.netid = null;
    this.route = {};
    this.urlData = {};
    this.appSkeleton = {};
    this.appTmpls = {};
    this.hostUrl = "";
    this.baseUrl = "";
    this.version = "5.0";
};

/**
 * Sets the initial urls which serve as configuration params.
 * @method setUrls
 * @param  {[type]} host [description]
 */
App.prototype.setConfigUrls = function(host) {
    var re = /[.]*app\.genwi\.com|172\.16\.1\.20[.]*/g;
    if (host.match(re)) {
        this.hostUrl = "http://" + host.split(":")[0] + "/";
    } else {
        this.hostUrl = "http://app.genwi.com/";
    }
    this.baseUrl = "http://" + host + "/htmllight/";
};

/**
 * Gets the url matching it with constants present in constants.js file.
 * @method getUrl
 * @param  {[type]} urlTemp [description]
 * @param  {[type]} data    [description]
 * @return {[type]}
 */
App.prototype.getUrl = function(urlTemp, data) {
    data = data || {};
    data.hostUrl = this.hostUrl;
    data.version = this.version;
    data.netid = this.netid;
    var url = constants[urlTemp];
    $.each(data, function(k, v) {
        url = url.replace("{{" + k + "}}", v);
    });
    return url;
};
/**
 * This sets the route for the app which basically setting the various params required
 * for determing the right page.
 * ---We should be using express.---
 * @method setRoute
 * @param  {[type]} url [description]
 */
App.prototype.decideRoute = function(url) {
    var paramsArr = [];
    var def = new Deferred(),
        that = this,
        toResolve = true;

    if (url.indexOf("articles") > -1) {
        this.route.page = "articles";
        paramsArr = url.split("htmllight/" + "articles/")[1].split("/");
        this.netid = paramsArr[0];
        if (paramsArr.length > 2) {
            this.route.page = "error";
        } else {
            this.route.articlesId = paramsArr[1];
        }
    } else if (url.indexOf("article") > -1) {
        this.route.page = "article";
        paramsArr = url.split("htmllight/" + "article/")[1].split("/");
        this.netid = paramsArr[0];
        if (paramsArr.length > 3) {
            this.route.page = "error";
        } else {
            this.route.articlesId = paramsArr[1];
            this.route.articleId = paramsArr[2];
        }
    } else if (url.indexOf("categories") > -1) {
        this.route.page = "categories";
        paramsArr = url.split("htmllight/" + "categories/")[1].split("/");
        this.netid = paramsArr[0];
        if (paramsArr.length > 1) {
            this.route.page = "error";
        }
    } else {
        try {
            paramsArr = url.split("htmllight/")[1].split("/");
            this.netid = parseInt(paramsArr[0]);
            toResolve = false;
            //request("http://app.genwi.com/5.0/cache/statusObject/" + this.netid, function(err, resp, body) {
            request(this.getUrl("statusObject"), function(err, resp, body) {
                if (!err && resp.statusCode == 200) {
                    var url = JSON.parse(body)["home"];
                    url = url.replace(that.hostUrl + that.version + "/", "");
                    url = url.split("?")[0];
                    that.decideRoute(that.baseUrl + url);
                    def.resolve();
                }
            });
        } catch (err) {
            console.log(err);
            this.route.page = "error";
        }
    }
    if (toResolve) {
        setTimeout(function() {
            def.resolve();
        }, 100);
    }
    return def.promise;
};

/**
 * The json url to get the right data.
 * ---Need the right name for this. This one sucks.---
 * @method getjsonurl
 * @return {[type]}
 */
App.prototype.setJsonUrl = function() {
    switch (this.route.page) {
        case "articles":
            //this.jsonurl = "http://app.genwi.com/5.0/getjson/articles/" + this.netid + "/" + this.route.articlesId;
            this.jsonurl = this.getUrl("articlesJson", {
                "articlesId": this.route.articlesId
            });
            break;
        case "article":
            //this.jsonurl = "http://app.genwi.com/5.0/getjson/article/" + this.netid + "/" + this.route.articlesId + "/" + this.route.articleId;
            this.jsonurl = this.getUrl("articleJson", {
                "articlesId": this.route.articlesId,
                "articleId": this.route.articleId
            });
            break;
        case "categories":
            //this.jsonurl = "http://app.genwi.com/5.0/getjson/jsonObject/" + this.netid;
            this.jsonurl = this.getUrl("categoriesJson");
    }
};
/**
 * The script to call the callback on the client.
 * @method callbackClientScript
 * @return {[type]}
 */
App.prototype.callbackClientScript = function() {
    var toolbarTmpl = this.getPageTemplate("toolbars")["name"].replace(".html", "");
    var sectionsTmpl = this.getPageTemplate("sections")["name"].replace(".html", "");
    var mainTmpl = this.mainTmpl.replace(".html", "");
    var sc = "";
    sc += "var ob1 = new Genwi.Template[Genwi.Template.mapping['" + toolbarTmpl + "']]('" + toolbarTmpl + "',{});ob1.context = $('.toolbar'); ob1.callback(-1);";
    sc += "var ob2 = new Genwi.Template[Genwi.Template.mapping['" + sectionsTmpl + "']]('" + sectionsTmpl + "',{});ob2.context = $('.sections');ob2.callback(-1);";
    sc += "var ob3 = new Genwi.Template[Genwi.Template.mapping['" + mainTmpl + "']]('" + mainTmpl + "',{});ob3.context = $('.main');ob3.callback(-1);";
    return sc;
};

/**
 * The meta info to be put in the head tag for the client.
 * ---Can we use a better name?.---
 * @method headTags
 * @return {[type]}
 */
App.prototype.getHeaderTags = function() {
    var info = "<title>Home page | " + this.netid + "</title>";
    info += "<meta name='viewport' content='width=device-width, user-scalable=no'>";
    return info;
};

App.prototype.getStyleSheets = function() {
    var info = "";
    info += "<script src='http://code.jquery.com/jquery-1.10.1.min.js'></script>";
    //info += "<link rel='stylesheet' href='http://app.genwi.com/resources_5.0.x/" + this.netid + "/css/_app.min.css' />";
    info += "<link rel='stylesheet' href='" + this.getUrl("appCss") + "' />";
    return info;
};

App.prototype.getScriptsToImport = function() {
    var info = "";
    info += "<script>var network_id='" + this.netid + "', baseUrl = '" + this.baseUrl + "', pageName='html5';</script>";
    //info += "<script src='http://app.genwi.com/resources_5.0.x/" + this.netid + "/js/_app.min.js'></script>";
    info += "<script src='" + this.getUrl("appJs") + "'></script>";
    info += "<script src='" + this.getUrl("handlebars") + "'></script>";
    info += "<script src='" + this.getUrl("hbHelpers") + "'></script>";

    return info;
};

/**
 *
 * As of now only includes script to carry out sections navigation and
 * ---its not working on my phone.!!---
 * @method getMiscScript
 * @return {[type]}
 */
App.prototype.getMiscScript = function() {
    var sc = '$("a").on("click",function(e){if($(e.target).attr("href") == (baseUrl+"sections")){' + 'e.preventDefault();' + 'if($(".main").is(":visible")){' + '$(".main").hide();' + '$(".sections").show();' + '}else{' + '$(".sections").hide();' + '$(".main").show();' + '}' + '}});';
    return sc;
};

/**
 * Gets the HTML for the toolbar.
 *  -- Need to get HB template same way as the main content hb template and also the fill part.--
 * @method getToolbarHTML
 * @return {[type]}
 */
App.prototype.getToolbarHTML = function() {
    var toolbarTmpl = this.getPageTemplate("toolbars");
    $("body").empty().html(toolbarTmpl["html"]);
    return ("<div class='toolbar' style = 'position:fixed;width:100%;z-index:9999;' id='gw_toolbar'>" + this.render("toolbar", {}) + "<div style='display:none;' class='_template'>" + toolbarTmpl["html"] + "</div></div>");
};

App.prototype.getSectionsHTML = function() {
    var sectionsTmpl = this.getPageTemplate("sections");
    $("body").empty().html(sectionsTmpl["html"]);
    return ("<div class='sections' style='display:none;height:100%;' id='gw_sections'>" + this.render("sections", this.appSkeleton[this.netid]) + "<div style='display:none;' class='_template'>" + sectionsTmpl["html"] + "</div></div>");
};

/**
 * Gets the main content html.
 * @method getMainHTML
 * @return {[type]}
 */
App.prototype.getMainHTML = function() {
    var tmpl = this.tmpls[this.route.page][this.mainTmpl];
    $("body").empty().html(tmpl);
    return "<div class='main' style='padding-top:50px;' id='gw_" + this.route.page + "'>" + this.render(this.route.page, this.urlData[this.jsonurl]) + "<div style='display:none;' class='_template'>" + tmpl + "</div></div>";
};

App.prototype.render = function(page, data) {
    var template = Handlebars.compile($("#gw_" + page + "_tmpl").html());
    return template(data);
};

App.prototype.getPageTemplate = function(page) {
    for (var k in this.tmpls[page]) {
        return {
            "name": k,
            "html": this.tmpls[page][k]
        };
    }
};

App.prototype.fetchDataAndTmpls = function() {
    var that = this,
        data;
    this.setJsonUrl();
    var skeletonUrl = this.getUrl("skeletonJson");
    var deferred = new Deferred();

    if (that.appSkeleton[that.netid]) {
        setTimeout(function() {
            deferred.resolve();
        }, 50);
    } else {
        request(skeletonUrl, function(err, resp, body) {
            if (!err && resp.statusCode == 200) {
                that.appSkeleton[that.netid] = JSON.parse(body).skeleton;
                deferred.resolve();
            }
        });
    }
    var deferred2 = new Deferred();

    if (that.urlData[this.jsonurl]) {
        setTimeout(function() {
            deferred2.resolve();
        }, 50);
    } else {
        request(this.jsonurl, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                if (data = JSON.parse(body)) {
                    that.urlData[that.jsonurl] = data.json || data;
                    deferred2.resolve();
                }
            }
        });
    }
    group = require("promised-io/promise").all(deferred.promise, deferred2.promise, this.getAllTmpls());
    return group;
};

/**
 * Gets all the templates using getAllActiveTmpls url.
 * @method getAllTmpls
 * @return {[type]}
 */
App.prototype.getAllTmpls = function() {
    var deferred = new Deferred();
    var that = this;
    if (this.tmpls) {
        setTimeout(function() {
            deferred.resolve("success");
        }, 50);
    } else {
        request(this.getUrl("activeTmpls", {
            "device": "smartphone"
        }), function(error, response, body) {
            if (!error && response.statusCode == 200) {
                if (JSON.parse(body).templates) {
                    that.tmpls = JSON.parse(body).templates;
                    deferred.resolve("success ");
                }
            } else {
                deferred.resolve("error");
            }
        });
    }
    return deferred.promise;
};

/**
 * Gets the main template name from the data.
 * Also gets the data.
 * --- Harcoded presently for categories ----
 * @method getTmplName
 * @return {[type]}
 */
App.prototype.setMainTmpl = function() {
    switch (this.route.page) {
        case "articles":
            this.mainTmpl = this.urlData[this.jsonurl][0]["articles_tmpl"];
            break;
        case "categories":
            this.mainTmpl = this.getPageTemplate("categories")["name"];
            break;
        case "article":
            this.mainTmpl = this.urlData[this.jsonurl][0]["article_tmpl"];
            break;
    }
};


module.exports = {
    "App": App
};