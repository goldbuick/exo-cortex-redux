export default {

    clampAngle: function (angle) {
        let max = Math.PI * 2;
        if (angle < 0) angle += max;
        if (angle > max) angle -= max;
        return angle;
    },

    subAnim: function (anim, name) {
        if (anim[name] === undefined) {
            anim[name] = { };
        }
        return anim[name];
    },

}
