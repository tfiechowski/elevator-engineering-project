Array.prototype.isEqual = (array1, array2) => {
    if (array1.length != array2.length)
        return false;

    for (var i in array1) {
        if (array1[i] !== array2[i])
            return false;
    }

    return true;
}