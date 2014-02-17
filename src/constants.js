var constants = {
    "statusObject": "{{hostUrl}}{{version}}/cache/statusObject/{{netid}}",
    "articlesJson": "{{hostUrl}}{{version}}/getjson/articles/{{netid}}/{{articlesId}}",
    "articleJson": "{{hostUrl}}{{version}}/getjson/article/{{netid}}/{{articlesId}}/{{articleId}}",
    "categoriesJson": "{{hostUrl}}{{version}}/getjson/jsonObject/{{netid}}",
    "skeletonJson": "{{hostUrl}}{{version}}/getjson/jsonObject/{{netid}}/skeleton",
    "appCss": "{{hostUrl}}resources_5.0.x/{{netid}}/css/_app.min.css",
    "appJs": "{{hostUrl}}resources_5.0.x/{{netid}}/js/_app.min.js",
    "hbHelpers": "{{hostUrl}}resources_5.0.x/{{netid}}/js/hb_helpers.js",
    "activeTmpls": "{{hostUrl}}{{version}}/getjson/getAllActiveTmpl/{{netid}}/{{device}}",
    "handlebars": "{{hostUrl}}/htmlight/getAllActiveTmpl/{{netid}}/{{device}}"
};
module.exports = {
    "constants": constants
};