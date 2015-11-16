require([
    'app/page'
], function (Page) {
    'use strict';
    ReactDOM.render(
        <Page />,
        document.getElementById('app')
    );
});
