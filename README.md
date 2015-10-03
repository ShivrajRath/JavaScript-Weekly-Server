# JavaScript Weekly Reader

### Pages
1. List
2. Article
3. Select Episode
4. Subscribe to JavaScript Weekly
5. Most Popular
6. Settings (Fonts, Color Scheme)
7. Report an issue
8. Random issue
9. Random articles

### Features
1. Favourite link
2. Share it
3. Auto Categorization/Tagging (Node, Angular etc)
4. Once parsed save it to db/file storage
5. Youtube video should be shown
6. Formatting of code in the article
7. Show random articles (perhaps 5)
8. Show random issue
9. Add buttons for [Mark it Old] [Facebook Like + Twitter Like]
  9.1 https://cdn.api.twitter.com/1/urls/count.json?url=http://jowanza.com/post/125093386299/handling-data-in-nodejs-using-datalib
  9.2 https://api.facebook.com/method/fql.query?query=select%20total_count,like_count,comment_count,share_count,click_count%20from%20link_stat%20where%20url=%27http://jowanza.com/post/125093386299/handling-data-in-nodejs-using-datalib%27&format=json
10. Show popular posts

### Non Functional
1. Save the article (db/localstorage) once visited
2. Avoid node stop
3. If article is not present the route to latest article / Handle error scenarios
4. Caching of articles
5. Storing the like counts and displaying the 

### Performance
1. Use web sockets
2. No, JS and CSS framework
3. Use browserify + min + concat
4. Redis cache

### Api
1. Add a include list of identifiers e.x: youtube.com
2. Provide possible summary text
3. Provide possible source text
4. Provide tags
5. Add a issue URL node

### Others
1. Make a npm module for the parser
2. Add filter for other weekly's