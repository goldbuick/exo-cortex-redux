require([
    'app/Page'
], function (Page) {
    'use strict';
    var page = React.createElement(Page, {}),
        container = document.getElementById('page');
    ReactDOM.render(page, container);
});
