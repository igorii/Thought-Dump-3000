// A Container to hold the aggregation
var counts = {};

// Walk the resume data and count the ocurrances of each language
var sum = function (obj) {

    // Recurse on the elements of the object or array
    var objectWalker = function (obj) {
        var i;
        for (i in obj)
            sum(obj[i]);
    }

    if (obj instanceof Array || obj instanceof Object)
    // If a container, recurse on the elements of the container
        objectWalker(obj);
    else
    // If an atom, increment the entry in counts, or create a
    // new entry if the key does not yet exist
        counts[obj] = (counts[obj] + 1) || 1;
}

// Obtain the counts
sum(ResumeData);

// Create D3 Visual
console.log(counts);

var countsArray = [];
var entry, newEntry;
for (entry in counts) {
    newEntry = {};
    newEntry[entry] = counts[entry];
    countsArray.push({
        Language: entry,
        Count: counts[entry]
    });
}
