
var Page = React.createClass({
    mixins: [
    ],
 
    render: function () {
        return <div>
            <form action="/" method="post">
                <input type="hidden" name="username" value="test" />
                <input type="hidden" name="password" value="value" />
                <input type="submit" value="Submit" />
            </form>
        </div>;
    }
});

export default Page;
