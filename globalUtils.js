Array.isEqual = (array1, array2) => {
    if (array1.length != array2.length)
        return false;

    for (var i in array1) {
        if (array1[i] !== array2[i])
            return false;
    }

    return true;
}

Array.merge = function (array1, array2) {
    for (var a2 of array2) {
        if (array1.indexOf(a2) < 0) {
            array1.push(a2);
        }
    }

    return array1;
}

Object.deepClone = function (obj) {
    // TODO: provide better/faster way to deep clone 
    return JSON.parse(JSON.stringify(obj));
}