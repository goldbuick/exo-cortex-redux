
let ThreeScreen = {
    screenRatio: 1,
    screenHalfWidth: 1,

    left: coord => {
        return (-ThreeScreen.screenHalfWidth + coord) * ThreeScreen.screenRatio;
    },

    right: coord => {
        return (ThreeScreen.screenHalfWidth - coord) * ThreeScreen.screenRatio;
    },

    middle: coord => {
        return coord * ThreeScreen.screenRatio;
    }
};

export default ThreeScreen;
