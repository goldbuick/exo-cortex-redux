import Stem from './stem';

class StemDocker extends Stem {

    kind () {
        return 'didact-docker';
    }

    sourceImage (neuro) {
        if (neuro.ui) return 'neuro-ui-' + neuro.name;
        return 'neuro-' + neuro.name;
    }
}

export default StemDocker;
