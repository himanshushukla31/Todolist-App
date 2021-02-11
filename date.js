exports.getDate = function() {
    const today= new Date();

    const options= {
        day: "numeric",
        month: "long"
    };

    return today.toLocaleDateString("en-Us",options);

};


