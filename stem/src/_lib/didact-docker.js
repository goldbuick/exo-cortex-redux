import DidactRun from './didact-run';

class DidactDocker extends DidactRun {

    kind () {
        return 'didact-docker';
    }

}

export default DidactDocker;
