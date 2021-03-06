import Logo from 'app/Logo';
import Path from 'app/Path';
import Gems from 'app/Gems';
import Plate from 'app/Plate';
import Feather from 'app/Feather';
import TypeRing from 'app/TypeRing';
import Background from 'lib/Background';
import ThreeScene from 'lib/ThreeScene';

function repAt(str, index, chr) {
    return str.substr(0, index) + chr + str.substr(index + 1);
}

var Page = React.createClass({
    mixins: [
    ],

    getCharset: function (count, drop) {
        let result = [],
            charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?';

        if (drop !== undefined)
            drop.split('').forEach(chr => { charset = charset.replace(chr, ''); });
        
        charset = charset.split('');
        for (let i=0; i<count; ++i) {
            result.push(charset.splice(Math.floor(this.r() * charset.length), 1));
        }

        return result.join('');
    },

    getInitialState: function () {
        this.r = alea('S(*DHFOAISHFLAIUH&Ujksdf39238');
        return {
            index: 0,
            path: [ ],
            complete: false,
            passcode: '---------',
            rows: this.getCharset(9).match(/.{1,3}/g).map(row => row.split(''))
        };
    },
    
    render: function () {
        let step = -300,
            offset = 400 + -step;

        return <ThreeScene onCreate={this.handleCreate}>
            <Background />
            <Gems />
            <Plate />
            <Feather />
            <Logo
                passcode={this.state.passcode}
                complete={this.state.complete} />
            <Path
                position-y={60}
                path={this.state.path}
                complete={this.state.complete} />
            {this.state.rows.map((chrs, i) => {
                offset += step;
                return <TypeRing
                    key={'ring' + i}
                    row={i}
                    offset={offset}
                    chars={chrs.join('')} 
                    onPressed={this.handlePressed} />
            })}
        </ThreeScene>;
    },

    handleCreate: function (render) {
        render.camera.position.z = 1440;
    },

    handlePressed: function (row, col, chr) {
        if (chr === undefined || chr === ' ') return;
        
        let path = this.state.path;
        path.push({ col: col, row: row });

        let index = this.state.index,
            passcode = repAt(this.state.passcode, index++, chr);

        let rows = this.state.rows;

        rows[row][col] = ' ';
        let charset = this.getCharset(9, this.state.passcode).split('');
        for (row=0; row<rows.length; ++row) {
            for (col=0; col<rows[row].length; ++col) {
                if (rows[row][col] !== ' ')
                    rows[row][col] = charset.pop();
            }
        }

        let complete = (this.state.index === this.state.passcode.length - 1);
        this.setState({ path, rows, index, passcode, complete });

        if (complete) {
            let ajax = new Ajax();
            ajax.post('/barrier-auth', { username: 'barrier-auth', password: passcode })
            .done(this.handleResult)
            .error(this.handleResult)
        }
    },

    handleResult: function (response) {
        if (response.access) {
            // signal user success ?
        } else {

        }
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    },

});

export default Page;
