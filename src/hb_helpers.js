Handlebars.registerHelper("info", function(data, context) {
    var info = {};
    if (data == "global") {
        info.appId = network_id;
        info.homeUrl = baseUrl + network_id;
        info.baseUrl = baseUrl;
    } else if (data === "device") {
        info = Genwi.device;
    } else if (typeof(data) === "object" && data.length) {
        //Its an array
    } else if (typeof(data) === "string" && !isNaN(Date.parse(data))) {
        var m_names = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
        var d_names = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
        var date;
        try {
            date = new Date(data);
        } catch (err) {
            console.log("Invalid format for string -'" + data + "'.Please check");
            return "";
        }

        /*function pad(arg) {
                arg += "";
                if (arg.length < 2) {
                    arg = "0" + arg;
                }
                return arg;
            }
        */
        var fields = {};
        var date_num = date.getDate();
        //fields.date = pad(date_num);
        fields.day = d_names[date.getDay()];
        var month_num = date.getMonth();
        //fields.month_num = pad(month_num);
        fields.month = m_names[month_num];
        fields.year = date.getFullYear();
        //fields.hour = pad(date.getHours());
        //fields.min = pad(date.getMinutes());
        //fields.sec = pad(date.getSeconds());

        fields.clock = "AM";
        if (fields.hour > 11) {
            fields.clock = "PM";
            if (fields.hour > 12) {
                fields.hour = fields.hour - 12;
            }
        }
        if (date_num === 1 || date_num === 21 || date_num === 31) {
            fields.sup = "st";
        } else if (date_num === 2 || date_num === 22) {
            fields.sup = "nd";
        } else if (date_num === 3 || date_num === 23) {
            fields.sup = "rd";
        } else {
            fields.sup = "th";
        }
    } else if (typeof(data) === "string") {
        var rawtext = $("<p/>").wrap(data).text();
        var uppercase = data.toUpperCase();
        var lowercase = data.toLowerCase();
    } else if (typeof(data)) {

    }
    return (context.fn(info));
});

/**================================= ADD ANY CUSTOM HELPERS BELOW =============================**/

Handlebars.registerHelper("mypostsdata", function(olddata, context) {
    var inc = false;
    if (olddata === null || olddata.length === 0) {
        model.nocontent = true;
        return;
    }

    var data = olddata,
        dataLength = olddata.length,
        temp;


    var oArts = [],
        batchArts = [],
        arts = {}, i, self = this;
    //data = data.slice(0);
    dataLength = data.length;

    if (dataLength !== 0) {
        for (i = 0; i < dataLength; i++) {
            var article = data[i],
                p_date, d, featuredImage;

            //featuredImage = data[i].image_url || data[i].original_image_url || '';

            if (featuredImage && !this.isFeaturedAdded && this.setFeature) {
                var title = data[0].item_title;
                arts.featuredTitle = title.length > 60 ? (title.substring(0, 60) + "...") : title;
                arts.featuredDescription = $("<div />").html(data[0].item_description).text().replace(lookupString, "");
                arts.featuredLink = baseUrl + data[0].article_url;
                arts.featuredLink = baseUrl + data[0].article_url;
                arts.featuredImage = data[0].image_url || data[0].original_image_url || data[0].img_det[0].link;
                arts.featuredAuthor = data[0].item_author;
                arts.featuredPubDate = data[0].item_pubDate;
                this.isFeaturedAdded = true;
            } else {
                var title = article.item_title;
                article.desc = $("<div />").html(article.item_description).text();
                // if (window.innerWidth < 750) {
                article.articleTitle = title.length > 55 ? (title.substring(0, 52)) + "..." : title;
                /*} else {
                        article.articleTitle = title;
                    }*/
                article.articleLink = baseUrl + article.article_url;
                article.articleImage = article.original_image_url || article.image_url;
                article.articleAuthor = article.item_author;
                d = new Date(article.item_pubDate);
                article.articlePubDate = d;
                batchArts.push(article);
            }
        }
        arts.articles = batchArts;
        model = arts;
        //If suppose first 20 articles doesn't have featured image, we need to set isFeaturedAdded as true. Otherwise the featured article may be get it from new list.
        this.isFeaturedAdded = true;
        if (this.start === 0) {
            model.initialLoad = true;
        } else {
            model.initialLoad = false;
        }
    } else {
        model.nocontent = true;
    }
    return context.fn(model);
});

Handlebars.registerHelper("mypostdata", function(olddata, context) {
    var buffer = "";
    if (olddata === null || olddata.length === 0) {
        return;
    }
    var model = olddata[0],
        dev = "";
    var totalImg = model.img_det.length,
        caption = model.item_title;
    if (totalImg > 0) {
        model.img_det.sort(function(a, b) {
            return a.width - b.width;
        });
    }
    if (model.category_title == "About This App") {
        model.description = model.item_description;
    } else {

        //var noOfPages = model.item_description.split("<!--nextpage-->");
        var d = new Date(model.item_pubDate);
        model.caption = caption;
        model.url = baseUrl + model.article_url;
        model.description = model.item_description;
        //if (noOfPages.length > 0) {
        model.isPaginated = false;
        //}
        model.author = model.item_author;
        model.p_date = d;
        model.image = (model.img_det[0] ? model.img_det[model.img_det.length - 1].link : "") || model.image_url || model.original_image_url;
        model.imageCaption = $('<div>' + model.item_description + '</div>').find('.caption').text();
        model.imageCredit = $('<div>' + model.item_description + '</div>').find('.credit').text();
        if (model.media_url && (model.media_type !== "image/jpeg" && model.media_type !== "image/png")) {
            if (model.media_url.indexOf("youtu") !== -1) {
                model.video = model.media_url;
            } else {
                model.video = 'http://appsurl/videoviewer?link=' + model.media_url;
            }
        }
    }
    var buffer = context.fn(model);
    return buffer;
});

Handlebars.registerHelper("mydata", function(olddata, context) {
    var model = {};
    if (olddata === null || olddata.length === 0) {
        model.nocontent = true;
        return;
    }
    var data = olddata,
        dataLength = data.length,
        cats = {}, articles = [],
        startIndex = 1;
    var labels = {
        'technology': 'violetLabel',
        'sports': 'orangeLabel',
        'film': 'greenLabel',
        'genwi news': 'redLabel',
        'fashion': 'violetLabel'
    };
    if (data[0].category_title !== "Most Recent") {
        startIndex = 0;
    }
    if (dataLength >= 1) {

        var colorExp = /<p>#(.*)(<\/p>)/gi;

        for (var i = startIndex; i < dataLength; i++) {

            if (i === startIndex) {
                var firstCategory = data[i][data[i].cid],
                    articlesLength = firstCategory.length;
                for (var j = 0; j < articlesLength; j++) {
                    if (firstCategory[j].image_url !== "" || firstCategory[j].original_image_url !== "") {
                        //cats.featuredTitle = firstCategory[j].category_title;
                        cats.featuredTitle = data[startIndex].category_title;
                        cats.featuredImage = firstCategory[j].image_url || firstCategory[j].original_image_url;
                        cats.featuredLink = baseUrl + firstCategory[j].article_url;
                        cats.featuredCaption = firstCategory[j].item_title;
                        cats.featuredAuthor = firstCategory[j].item_author;
                        p_date = new Date(firstCategory[j].item_pubDate);
                        cats.featuredPubDate = p_date;
                        break;
                    } else {
                        continue;
                    }
                }
            } else {
                var categoryItem = data[i][data[i].cid][0];
                if (typeof categoryItem !== "undefined") {
                    categoryItem.title = data[i].category_title || '';
                    categoryItem.image = categoryItem.image_url || categoryItem.original_image_url;
                    var categoryDesc = $("<div />").html(categoryItem.item_description).text();
                    categoryItem.desc = categoryDesc;
                    categoryItem.link = baseUrl + categoryItem.article_url;
                    categoryItem.caption = categoryItem.item_title;
                    categoryItem.className = labels[categoryItem.title.toLowerCase()];
                    if (colorExp.test(categoryItem.category_desc)) {
                        categoryItem.color = '#' + categoryItem.category_desc.split(colorExp)[1];
                    } else {
                        categoryItem.color = '#402F23';
                    }
                    categoryItem.author = categoryItem.item_author;
                    p_date = new Date(categoryItem.item_pubDate);
                    categoryItem.pubdate = p_date;
                    articles.push(categoryItem);
                    cats.articles = articles;
                }
            }
        }
        if (typeof cats.featuredTitle !== "undefined" || typeof cats.articles !== "undefined") {
            if (typeof cats.featuredTitle === "undefined" && typeof data[0][data[0].cid] !== "undefined") {
                var firstItem = data[0][data[0].cid][0];
                firstItem.title = firstItem.category_title || '';
                firstItem.image = firstItem.image_url || firstItem.original_image_url;
                var categoryDesc = $("<div />").html(firstItem.item_description).text();
                firstItem.desc = categoryDesc;
                firstItem.link = baseUrl + firstItem.article_url;
                firstItem.caption = firstItem.item_title;
                firstItem.className = labels[firstItem.title.toLowerCase()];
                if (colorExp.test(firstItem.category_desc)) {
                    firstItem.color = '#' + firstItem.category_desc.split(colorExp)[1];
                } else {
                    firstItem.color = '#402F23';
                }
                firstItem.author = firstItem.item_author;
                p_date = new Date(firstItem.item_pubDate);
                firstItem.pubdate = p_date;
                cats.articles.unshift(firstItem);
            }
            model = cats;
        } else {
            model.nocontent = true;
        }
    } else {
        model.nocontent = true;
    }
    return context.fn(model);
});
Handlebars.registerHelper("sectionsdata", function(olddata, context) {
    if (olddata === null || olddata.length === 0) {
        return;
    }
    //this.model = olddata.slice(0);
    var data = olddata.slice(0),
        dataLength = data.length,
        sections = [];
    for (var i = 0; i < dataLength; i++) {
        var item = data[i],
            section = {};
        section.sectionSubCats = [];
        //Most recent item has been removed from sections.
        if ((/Most Recent/gi).test($.trim(item.category_title))) {
            continue;
        }
        if (item.subcats.length > 0) {
            section.hasSubCat = true;
            section.sectionTitle = item.category_title;
            section.sectionLink = "javascript:void(0)";
            for (var j = 0; j < item.subcats.length; j++) {
                var sectionSub = {}, subcatsItem = item.subcats[j];
                sectionSub.sectionTitle = subcatsItem.category_title;
                sectionSub.sectionLink = baseUrl + subcatsItem.articles_url;
                section.sectionSubCats.push(sectionSub);
            }
        } else {
            section.sectionTitle = item.category_title;
            section.sectionLink = baseUrl + item.articles_url;
        }
        sections.push(section);
    }
    var model = {};
    model.homepage = baseUrl + "categories/" + network_id + "?tmpl=categories.html";
    model.favorites = baseUrl + "favorites/" + network_id;
    model.sections = sections;
    return context.fn(model);
});