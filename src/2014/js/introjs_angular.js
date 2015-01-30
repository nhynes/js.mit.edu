var introjs = angular.module('introjs', []);

introjs.controller("CourseMaterialListControl", function($scope) {
    $scope.content = classInfo;

    $scope.isAvailable = function(section) {
        return section.title !== undefined;
    }
});

var classInfo = [
    {
        title: "Introduction to Introduction to JavaScript!",
        date: "Thursday 1/9",
        time: "2 - 4 pm",
        room: "4-231"
    },
    {
        title: "JavaScript, HTML & CSS",
        date: "Tuesday 1/14",
        time: "2 - 4 pm",
        room: "32-144"
    },
    {
    	title: "Events, Forms, and Animations",
        date: "Thursday 1/16",
        time: "2 - 4 pm",
        room: "32-124"
    },
    {
        title: "HTTP & AJAX",
        date: "Tuesday 1/21",
        time: "2 - 4 pm",
        room: "32-144"
    },
    {
        title: "Node.js and Server-Side JavaScript",
        date: "Thursday 1/23",
        time: "2 - 4 pm",
        room: "32-144"
    },
    {
        title: "Making Useful Node.js Web Applications",
        date: "Tuesday 1/28",
        time: "2 - 4 pm",
        room: "32-144"
    },
    {
        date: "Thursday 1/30",
        time: "2 - 4 pm",
        room: "32-144"
    }
];

var additionalResources = [
    [
        "<a href='http://eloquentjavascript.net/chapter2.html' target='_blank'>Basic JavaScript: values, variables, and control flow - Eloquent JavaScript</a>",
        "<a href='http://eloquentjavascript.net/chapter3.html' target='_blank'>Functions - Eloquent JavaScript</a>",
        "<a href='http://eloquentjavascript.net/chapter4.html' target='_blank'>Data structures: Objects and Arrays - Eloquent JavaScript</a>",
        "<a href='http://nathansjslessons.appspot.com/lesson?id=1000' target='_blank'>Some cool in-browser lessons - Nathan's Lessons</a>"
    ],
    [
        "<a href='https://developer.mozilla.org/en-US/docs/HTML/Inline_elements' target='_blank'>List of inline elements - MDN</a>",
        "<a href='https://developer.mozilla.org/en-US/docs/HTML/Block-level_elements' target='_blank'>List of block elements - MDN</a>",
        "<a href='http://www.w3.org/TR/selectors/#selectors' target='_blank'>List of CSS selectors - W3.org</a>",
        "<a href='http://api.jquery.com/category/manipulation/' target='_blank'>jQuery DOM Manipulation API - jQuery</a>",
        "<a href='http://6.470.scripts.mit.edu/2014/lectures/html-css' target='_blank'>6.470 lecture materials on HTML & CSS</a>",
        "<a href='http://www.barelyfitz.com/screencast/html-training/css/positioning/' target='_blank'>Learn CSS Positioning in Ten Steps - BarelyFitz Designs</a>",
    ],
    [
        "<a href='http://api.jquery.com/category/events/' target='_blank'>jQuery Events API</a>",
        "<a href='http://jqueryui.com/effect/' target='_blank'>jQuery UI Effects</a>",
        "<a href='http://www.w3.org/wiki/HTML/Elements/form' target='_blank'>HTML Forms - W3.org</a>",
        "<a href='https://developer.mozilla.org/en-US/docs/Web/API/Event' target='_blank'>Event - MDN</a>",
        "<a href='https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_animations' target='_blank'>Using CSS animations - MDN</a>",
    ],
    [
        "<a href='http://api.jquery.com/category/ajax/' target='_blank'>jQuery AJAX API</a>",
        "<a href='https://en.wikipedia.org/wiki/List_of_HTTP_status_codes' target='_blank'>List of HTTP status codes - Wikipedia</a>",
        "<a href='https://en.wikipedia.org/wiki/List_of_HTTP_headers' target='_blank'>List of HTTP header fields - Wikipedia</a>",
        "<a href='http://api.jquery.com/category/deferred-object/' target='_blank'>jQuery Deferred and Promise objects</a>"
    ],
    [
        "<a href='http://expressjs.com/api.html' target='_blank'>Express API Reference</a>",
        "<a href='http://socket.io/#how-to-use' target='_blank'>How to use Socket.io</a>",
        "<a href='https://github.com/LearnBoost/socket.io/wiki/Rooms' target='_blank'>Rooms - Socket.io</a>",
        "<a href='resources/lecture5/nginx.conf' target='_blank'>Sample Nginx conf file for reverse proxy to Node for HTTP and WebSockets</a>",
        "<a href='resources/lecture5/mime.types' target='_blank'>MIME types include file for aforementioned Nginx conf file</a>",
        "<a href='resources/lecture5/ttt.js' target='_blank'>Tic-Tac-Toe demo server</a>",
        "<a href='resources/lecture5/ttt.html' target='_blank'>Tic-Tac-Toe demo client</a>"
    ]
]